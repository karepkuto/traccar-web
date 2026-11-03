import dayjs from 'dayjs';
import fetchOrThrow from './fetchOrThrow';

// Impersonation by resellers needs a grant from the administrator: one
// customer, until a date. Grants live on the reseller account (attribute
// 'impersonateGrants', JSON list). The server itself still lets a reseller
// log in as any of its customers through the API; this is the app rule,
// backed by the contract and the audit trail below.
//
// Trail: before a non-admin impersonates, the app writes
// 'lastImpersonation' on the customer. The server logs that edit under the
// reseller's id right before the customer's "login", which the Audit page
// pairs into "<reseller> impersonate <customer>".

export const GRANTS_ATTRIBUTE = 'impersonateGrants';
export const TRAIL_ATTRIBUTE = 'lastImpersonation';

export const parseGrants = (user) => {
  try {
    const list = JSON.parse(user?.attributes?.[GRANTS_ATTRIBUTE] || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const isGrantActive = (grant, now = dayjs()) => dayjs(grant.until).isAfter(now);

export const activeGrant = (user, customerId) =>
  parseGrants(user).find((grant) => grant.customerId === customerId && isGrantActive(grant));

const getJson = async (url) => (await fetchOrThrow(url)).json();

const putUser = (user) =>
  fetchOrThrow(`/api/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

// Replaces the reseller's grants (expired ones are dropped).
export const saveGrants = async (resellerId, grants) => {
  const reseller = await getJson(`/api/users/${resellerId}`);
  const attributes = { ...reseller.attributes };
  const kept = grants.filter((grant) => isGrantActive(grant));
  if (kept.length) {
    attributes[GRANTS_ATTRIBUTE] = JSON.stringify(kept);
  } else {
    delete attributes[GRANTS_ATTRIBUTE];
  }
  await putUser({ ...reseller, attributes });
  return kept;
};

export const recordImpersonation = async (customerId, actor) => {
  const customer = await getJson(`/api/users/${customerId}`);
  await putUser({
    ...customer,
    attributes: {
      ...customer.attributes,
      [TRAIL_ATTRIBUTE]: JSON.stringify({
        by: actor.id,
        name: actor.name,
        at: new Date().toISOString(),
      }),
    },
  });
};
