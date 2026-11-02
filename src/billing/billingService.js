import fetchOrThrow from '../common/util/fetchOrThrow';
import { BILLING_ATTRIBUTES, appendHistory, expirationFromEndDate } from './billingLogic';

// Adapter: the only place billing talks to the backend.
// Phase 1 maps directly to the official Traccar API (device expirationTime +
// attributes). A dedicated billing service can replace these functions later
// without touching the UI.

export const fetchBillingDevices = async ({ all, signal }) => {
  const query = new URLSearchParams({ all: Boolean(all) });
  const response = await fetchOrThrow(`/api/devices?${query.toString()}`, { signal });
  return response.json();
};

// Reseller accounts = non-admin users allowed to manage other users.
export const fetchResellers = async ({ signal } = {}) => {
  const response = await fetchOrThrow('/api/users', { signal });
  const users = await response.json();
  return users
    .filter((user) => !user.administrator && (user.userLimit || 0) !== 0)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
};

export const recordPaymentAndExtend = async (
  deviceId,
  { startDate, endDate, periods, unit, amount, price, reference, billedTo, paidBy },
) => {
  // Always load the latest device so the PUT does not overwrite newer changes.
  const latest = await (await fetchOrThrow(`/api/devices/${deviceId}`)).json();
  const expirationTime = expirationFromEndDate(endDate).toISOString();
  const paidAt = new Date().toISOString();

  const { serialized } = appendHistory(latest.attributes, {
    t: paidAt,
    s: startDate,
    e: endDate,
    n: periods,
    u: unit,
    a: amount,
    p: price,
    r: reference || undefined,
    b: billedTo,
    by: paidBy || undefined,
  });

  const attributes = {
    ...latest.attributes,
    [BILLING_ATTRIBUTES.history]: serialized,
    [BILLING_ATTRIBUTES.lastPaidAt]: paidAt,
    [BILLING_ATTRIBUTES.lastPaidAmount]: amount,
    [BILLING_ATTRIBUTES.lastPaidPeriods]: periods,
    [BILLING_ATTRIBUTES.lastPaidUnit]: unit,
    [BILLING_ATTRIBUTES.lastPaidReference]: reference || null,
    [BILLING_ATTRIBUTES.lastPaidBy]: paidBy || null,
    [BILLING_ATTRIBUTES.plan]: unit,
    [BILLING_ATTRIBUTES.price]: price ?? null,
    [BILLING_ATTRIBUTES.billedTo]: billedTo || null,
  };
  Object.keys(attributes).forEach((key) => {
    if (attributes[key] === null) {
      delete attributes[key];
    }
  });

  const response = await fetchOrThrow(`/api/devices/${deviceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...latest, expirationTime, attributes }),
  });
  return response.json();
};
