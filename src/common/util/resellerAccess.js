import fetchOrThrow from './fetchOrThrow';
import { findOtherResellers, isCustomer, isReseller } from './ownership';
import { invalidatePrivacy } from './privacy';

// Pantauku rule: a reseller always has access to every device of its
// customers. Traccar only gives a reseller the devices linked directly to
// it, so every place that links devices, customers or resellers calls these
// helpers to keep the reseller -> device links in step.

const getJson = async (url) => (await fetchOrThrow(url)).json();

const permission = (method, body) =>
  fetchOrThrow('/api/permissions', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const directDeviceIds = async (userId) =>
  new Set((await getJson(`/api/devices?userId=${userId}&excludeAttributes=true`)).map((d) => d.id));

const managedCustomers = async (resellerId) =>
  (await getJson(`/api/users?userId=${resellerId}&excludeAttributes=true`)).filter(isCustomer);

// The reseller managing a customer, or null (direct customer). Only an
// administrator can see other resellers; for a reseller this returns null.
export const findResellerOf = async (customerId) =>
  (await findOtherResellers({ customerId }))[0] || null;

// Links the given devices to the reseller where missing. Returns how many.
export const grantDevicesToReseller = async (resellerId, deviceIds) => {
  const have = await directDeviceIds(resellerId);
  const missing = [...deviceIds].filter((id) => !have.has(id));
  for (const deviceId of missing) {
    await permission('POST', { userId: resellerId, deviceId });
  }
  return missing.length;
};

// Removes the reseller's links to a former customer's devices, except
// devices that still belong to another customer of the same reseller.
export const revokeCustomerDevicesFromReseller = async (resellerId, customerId) => {
  const devices = await directDeviceIds(customerId);
  const have = await directDeviceIds(resellerId);
  const keep = new Set();
  const others = (await managedCustomers(resellerId)).filter((c) => c.id !== customerId);
  (await Promise.all(others.map((c) => directDeviceIds(c.id)))).forEach((ids) =>
    ids.forEach((id) => keep.add(id)),
  );
  for (const deviceId of devices) {
    if (have.has(deviceId) && !keep.has(deviceId)) {
      await permission('DELETE', { userId: resellerId, deviceId });
    }
  }
};

// After devices were linked to a customer.
export const grantCustomerDevicesToReseller = async (customerId, deviceIds) => {
  invalidatePrivacy();
  const reseller = await findResellerOf(customerId);
  if (reseller) {
    await grantDevicesToReseller(reseller.id, deviceIds || (await directDeviceIds(customerId)));
  }
};

// After customers were added to / removed from a reseller.
export const syncResellerCustomers = async (resellerId, added = [], removed = []) => {
  for (const customerId of added) {
    await grantDevicesToReseller(resellerId, await directDeviceIds(customerId));
  }
  for (const customerId of removed) {
    await revokeCustomerDevicesFromReseller(resellerId, customerId);
  }
};

// Current customer(s) linked directly to a device.
export const fetchDeviceCustomers = async (deviceId) =>
  (await getJson(`/api/users?deviceId=${deviceId}&excludeAttributes=true`)).filter(isCustomer);

// Gives a device to one customer (or nobody when customerId is null) and
// moves the reseller link along with it.
export const setDeviceOwner = async (deviceId, customerId) => {
  invalidatePrivacy();
  const current = await fetchDeviceCustomers(deviceId);
  const newReseller = customerId ? await findResellerOf(customerId) : null;
  for (const old of current.filter((c) => c.id !== customerId)) {
    await permission('DELETE', { userId: old.id, deviceId });
    const oldReseller = await findResellerOf(old.id);
    if (oldReseller && oldReseller.id !== newReseller?.id) {
      const have = await directDeviceIds(oldReseller.id);
      if (have.has(deviceId)) {
        await permission('DELETE', { userId: oldReseller.id, deviceId });
      }
    }
  }
  if (customerId && !current.some((c) => c.id === customerId)) {
    await permission('POST', { userId: customerId, deviceId });
  }
  if (newReseller) {
    await grantDevicesToReseller(newReseller.id, [deviceId]);
  }
};

// One-off repair for links made before this rule existed.
export const repairResellerAccess = async () => {
  const resellers = (await getJson('/api/users?excludeAttributes=true')).filter(isReseller);
  let fixed = 0;
  for (const reseller of resellers) {
    const ids = new Set();
    const customers = await managedCustomers(reseller.id);
    (await Promise.all(customers.map((c) => directDeviceIds(c.id)))).forEach((set) =>
      set.forEach((id) => ids.add(id)),
    );
    fixed += await grantDevicesToReseller(reseller.id, ids);
  }
  return fixed;
};
