import fetchOrThrow from '../common/util/fetchOrThrow';
import { BILLING_ATTRIBUTES, calculateNewExpiration } from './billingLogic';

// Adapter: the only place billing talks to the backend.
// Phase 1 maps directly to the official Traccar API (device expirationTime +
// attributes). A dedicated billing service can replace these functions later
// without touching the UI.

export const fetchBillingDevices = async ({ all, signal }) => {
  const query = new URLSearchParams({ all: Boolean(all) });
  const response = await fetchOrThrow(`/api/devices?${query.toString()}`, { signal });
  return response.json();
};

export const recordPaymentAndExtend = async (
  deviceId,
  { periods, unit, amount, reference, plan, price, billedTo, paidBy },
) => {
  // Always load the latest device so the PUT does not overwrite newer changes.
  const latest = await (await fetchOrThrow(`/api/devices/${deviceId}`)).json();
  const expirationTime = calculateNewExpiration(latest.expirationTime, periods, unit).toISOString();

  const attributes = {
    ...latest.attributes,
    [BILLING_ATTRIBUTES.lastPaidAt]: new Date().toISOString(),
    [BILLING_ATTRIBUTES.lastPaidAmount]: amount === '' ? null : Number(amount),
    [BILLING_ATTRIBUTES.lastPaidPeriods]: Number(periods),
    [BILLING_ATTRIBUTES.lastPaidUnit]: unit,
    [BILLING_ATTRIBUTES.lastPaidReference]: reference || null,
    [BILLING_ATTRIBUTES.lastPaidBy]: paidBy || null,
    [BILLING_ATTRIBUTES.plan]: plan || unit,
    [BILLING_ATTRIBUTES.price]: price === '' || price == null ? null : Number(price),
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
