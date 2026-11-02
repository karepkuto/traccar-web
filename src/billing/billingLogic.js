import dayjs from 'dayjs';

// Pure billing rules. No React, no network: easy to test and reuse
// when billing moves to a dedicated backend service later.

export const BILLING_UNITS = ['month', 'year'];

export const DEFAULT_WARNING_DAYS = 14;
export const DEFAULT_CRITICAL_DAYS = 3;

export const BILLING_STATUS = {
  UNSET: 'unset',
  ACTIVE: 'active',
  WARNING: 'warning',
  CRITICAL: 'critical',
  EXPIRED: 'expired',
};

// Device attribute keys used to store the current billing state.
// Traccar attributes are a flat map, so keys are prefixed instead of nested.
export const BILLING_ATTRIBUTES = {
  plan: 'billingPlan',
  price: 'billingPrice',
  billedTo: 'billingBilledTo',
  lastPaidAt: 'billingLastPaidAt',
  lastPaidAmount: 'billingLastPaidAmount',
  lastPaidPeriods: 'billingLastPaidPeriods',
  lastPaidUnit: 'billingLastPaidUnit',
  lastPaidReference: 'billingLastPaidReference',
  lastPaidBy: 'billingLastPaidBy',
};

export const getRemainingDays = (expirationTime, now = dayjs()) => {
  if (!expirationTime) {
    return null;
  }
  return Math.ceil(dayjs(expirationTime).diff(now, 'hour', true) / 24);
};

export const getBillingStatus = (
  expirationTime,
  { now = dayjs(), warningDays = DEFAULT_WARNING_DAYS, criticalDays = DEFAULT_CRITICAL_DAYS } = {},
) => {
  if (!expirationTime) {
    return BILLING_STATUS.UNSET;
  }
  if (!dayjs(expirationTime).isAfter(now)) {
    return BILLING_STATUS.EXPIRED;
  }
  const days = getRemainingDays(expirationTime, now);
  if (days <= criticalDays) {
    return BILLING_STATUS.CRITICAL;
  }
  if (days <= warningDays) {
    return BILLING_STATUS.WARNING;
  }
  return BILLING_STATUS.ACTIVE;
};

// Prepaid extension: an active device keeps its remaining days (extend from
// the current expiration); an expired or new device starts from now.
// dayjs clamps month ends, so Jan 31 + 1 month = Feb 28/29.
export const calculateNewExpiration = (currentExpiration, periods, unit, now = dayjs()) => {
  if (!BILLING_UNITS.includes(unit)) {
    throw new Error(`Unsupported billing unit: ${unit}`);
  }
  const count = Number(periods);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Periods must be a positive integer');
  }
  const current = currentExpiration ? dayjs(currentExpiration) : null;
  const base = current && current.isAfter(now) ? current : now;
  return base.add(count, unit);
};

export const getBillingThresholds = (server) => {
  const attributes = server?.attributes || {};
  const warning = Number(attributes.billingWarningDays);
  const critical = Number(attributes.billingCriticalDays);
  return {
    warningDays: warning > 0 ? warning : DEFAULT_WARNING_DAYS,
    criticalDays: critical > 0 ? critical : DEFAULT_CRITICAL_DAYS,
  };
};
