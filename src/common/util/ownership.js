import fetchOrThrow from './fetchOrThrow';
import { ROLES, getUserRole } from './roles';

// Pantauku rule: a device, group or geofence belongs to at most ONE customer.
// A customer is a non-admin user who cannot manage other users (resellers
// and admins only oversee and are never counted as owners). Admins still see
// everything.
//
// Traccar itself allows many-to-many links, so this is enforced in the UI
// whenever a link is created here. Links made directly through the API are
// not blocked; the owner column on the subscription page shows violations.

export const isCustomer = (user) => Boolean(user) && getUserRole(user) === ROLES.CUSTOMER;

const listIds = async (url, signal) => {
  const response = await fetchOrThrow(url, { signal });
  return (await response.json()).map((item) => item.id);
};

const fetchCustomers = async (signal) => {
  const response = await fetchOrThrow('/api/users?excludeAttributes=true', { signal });
  return (await response.json()).filter(isCustomer);
};

// Map of deviceId -> customers who can see it (directly or through a group).
export const fetchDeviceOwners = async ({ signal } = {}) => {
  const customers = await fetchCustomers(signal);
  const owners = new Map();
  const add = (deviceId, customer) => {
    const list = owners.get(deviceId) || [];
    if (!list.some((it) => it.id === customer.id)) {
      list.push(customer);
    }
    owners.set(deviceId, list);
  };
  await Promise.all(
    customers.map(async (customer) => {
      const deviceIds = await listIds(
        `/api/devices?userId=${customer.id}&excludeAttributes=true`,
        signal,
      );
      deviceIds.forEach((deviceId) => add(deviceId, customer));
    }),
  );
  return owners;
};

const OBJECT_ENDPOINTS = {
  device: 'devices',
  group: 'groups',
  geofence: 'geofences',
};

// Customers other than `excludeUserId` that already own the object.
export const findOtherOwners = async ({ type, id, excludeUserId, signal }) => {
  const endpoint = OBJECT_ENDPOINTS[type];
  const customers = (await fetchCustomers(signal)).filter((it) => it.id !== excludeUserId);

  let deviceGroupId = null;
  if (type === 'device') {
    const device = await (await fetchOrThrow(`/api/devices/${id}`, { signal })).json();
    deviceGroupId = device.groupId || null;
  }

  const results = await Promise.all(
    customers.map(async (customer) => {
      const ids = await listIds(`/api/${endpoint}?userId=${customer.id}`, signal);
      if (ids.includes(id)) {
        return customer;
      }
      if (deviceGroupId) {
        const groupIds = await listIds(`/api/groups?userId=${customer.id}`, signal);
        if (groupIds.includes(deviceGroupId)) {
          return customer;
        }
      }
      return null;
    }),
  );
  return results.filter(Boolean);
};

export const isReseller = (user) => Boolean(user) && getUserRole(user) === ROLES.RESELLER;

// Resellers other than `excludeResellerId` that already manage the customer.
export const findOtherResellers = async ({ customerId, excludeResellerId, signal }) => {
  const response = await fetchOrThrow('/api/users?excludeAttributes=true', { signal });
  const resellers = (await response.json()).filter(
    (user) => isReseller(user) && user.id !== excludeResellerId,
  );
  const results = await Promise.all(
    resellers.map(async (reseller) => {
      const ids = await listIds(`/api/users?userId=${reseller.id}&excludeAttributes=true`, signal);
      return ids.includes(customerId) ? reseller : null;
    }),
  );
  return results.filter(Boolean);
};
