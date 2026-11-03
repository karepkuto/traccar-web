import fetchOrThrow from './fetchOrThrow';
import { isCustomer } from './ownership';
import { BILLING_ATTRIBUTES } from '../../billing/billingLogic';

// Moving customers between resellers (administrator only).
//
// In Traccar a reseller reaches a device only through a direct link (the
// device is linked to the reseller when the reseller creates it). Moving a
// customer therefore moves three things: the reseller -> customer link, the
// reseller -> device links of that customer's devices, and the "billed to"
// marker used for the next payment. Payment history is left untouched.

const getJson = async (url) => (await fetchOrThrow(url)).json();

const permission = (method, body) =>
  fetchOrThrow('/api/permissions', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const fetchManagedCustomers = async (resellerId) =>
  (await getJson(`/api/users?userId=${resellerId}&excludeAttributes=true`)).filter(isCustomer);

const fetchDirectDeviceIds = async (userId) =>
  new Set((await getJson(`/api/devices?userId=${userId}&excludeAttributes=true`)).map((d) => d.id));

// Devices a reseller holds that no customer of theirs is linked to yet
// (e.g. still in the installation test, not handed over).
export const fetchStockDeviceIds = async (resellerId) => {
  const own = await fetchDirectDeviceIds(resellerId);
  const customers = await fetchManagedCustomers(resellerId);
  const lists = await Promise.all(customers.map((c) => fetchDirectDeviceIds(c.id)));
  lists.forEach((ids) => ids.forEach((id) => own.delete(id)));
  return own;
};

// fromId / toId: reseller ids, or null for "managed directly by the admin".
export const transferCustomers = async ({ fromId, toId, customerIds, includeStock }) => {
  const fromDevices = fromId ? await fetchDirectDeviceIds(fromId) : new Set();
  const toDevices = toId ? await fetchDirectDeviceIds(toId) : new Set();
  const stock = fromId && includeStock ? await fetchStockDeviceIds(fromId) : new Set();

  const deviceIds = new Set(stock);
  for (const customerId of customerIds) {
    if (fromId) {
      await permission('DELETE', { userId: fromId, managedUserId: customerId });
    }
    if (toId) {
      await permission('POST', { userId: toId, managedUserId: customerId });
    }
    (await fetchDirectDeviceIds(customerId)).forEach((id) => deviceIds.add(id));
  }

  for (const deviceId of deviceIds) {
    if (fromDevices.has(deviceId)) {
      await permission('DELETE', { userId: fromId, deviceId });
    }
    if (toId && !toDevices.has(deviceId)) {
      await permission('POST', { userId: toId, deviceId });
    }
    const device = await getJson(`/api/devices/${deviceId}`);
    const billedTo = device.attributes?.[BILLING_ATTRIBUTES.billedTo];
    if (fromId && billedTo === `reseller:${fromId}`) {
      await fetchOrThrow(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...device,
          attributes: {
            ...device.attributes,
            [BILLING_ATTRIBUTES.billedTo]: toId ? `reseller:${toId}` : 'direct',
          },
        }),
      });
    }
  }

  return { customers: customerIds.length, devices: deviceIds.size };
};
