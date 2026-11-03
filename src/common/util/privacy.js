import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import fetchOrThrow from './fetchOrThrow';
import { ROLES, getUserRole } from './roles';

// Reseller privacy (UU PDP data minimisation): a reseller sees full data
// only for its stock devices (not yet given to a customer). For devices
// owned by one of its customers it sees status and subscription only: no
// location, history, reports or commands. Support beyond that goes through
// impersonation at the customer's request.
//
// This is enforced in the web app only. The server still gives a reseller
// full access to devices linked to it (needed for the subscription view).

const REFRESH_MS = 60000;
let cache = { userId: null, ids: null, at: 0, promise: null };
const listeners = new Set();

const load = async (userId) => {
  const customers = await (await fetchOrThrow('/api/users?excludeAttributes=true')).json();
  const lists = await Promise.all(
    customers
      .filter((user) => getUserRole(user) === ROLES.CUSTOMER)
      .map(async (customer) =>
        (await fetchOrThrow(`/api/devices?userId=${customer.id}&excludeAttributes=true`)).json(),
      ),
  );
  const ids = new Set(lists.flat().map((device) => device.id));
  cache = { userId, ids, at: Date.now(), promise: null };
  listeners.forEach((listener) => listener(ids));
  return ids;
};

const ensure = (userId) => {
  const fresh = cache.userId === userId && cache.ids && Date.now() - cache.at < REFRESH_MS;
  if (!fresh && !(cache.userId === userId && cache.promise)) {
    cache = { ...cache, userId, promise: load(userId).catch(() => null) };
  }
};

// { active, isPrivate(deviceId) }. While loading, every device counts as
// private so nothing leaks before the list arrives.
export const usePrivacy = () => {
  const user = useSelector((state) => state.session.user);
  const active = getUserRole(user) === ROLES.RESELLER;
  const [ids, setIds] = useState(() => (cache.userId === user?.id ? cache.ids : null));

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    listeners.add(setIds);
    ensure(user.id);
    if (cache.userId === user.id && cache.ids) {
      setIds(cache.ids);
    }
    return () => listeners.delete(setIds);
  }, [active, user?.id]);

  const isPrivate = useCallback(
    (deviceId) => active && (ids ? ids.has(Number(deviceId)) : true),
    [active, ids],
  );
  return useMemo(() => ({ active, isPrivate }), [active, isPrivate]);
};

// Forces a reload after links change (e.g. a device given to a customer).
export const invalidatePrivacy = () => {
  cache = { ...cache, at: 0 };
};
