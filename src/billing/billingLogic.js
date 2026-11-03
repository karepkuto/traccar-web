import dayjs from 'dayjs';
import { getTimezone } from '../common/util/timezone';

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
  TRIAL: 'trial',
};

// New devices get a short installation test period before an administrator
// activates them by recording the first payment.
export const TRIAL_DAYS = 3;

// Promise to resellers: a device in its installation test is activated
// within this many hours once paid.
export const ACTIVATION_SLA_HOURS = 24;

export const isActivationOverdue = (attributes, now = dayjs()) => {
  const start = attributes?.billingTrialStart;
  return Boolean(start) && now.diff(dayjs(start), 'hour', true) > ACTIVATION_SLA_HOURS;
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
  history: 'billingHistory',
  trialStart: 'billingTrialStart',
};

export const isTrial = (attributes) => Boolean(attributes?.[BILLING_ATTRIBUTES.trialStart]);

// Values for a new device: locked automatically after the test period.
export const trialDefaults = (now = dayjs()) => ({
  expirationTime: now.add(TRIAL_DAYS, 'day').toISOString(),
  attributes: { [BILLING_ATTRIBUTES.trialStart]: now.toISOString() },
});

// Remaining time split into whole days and hours (rounded down).
export const getRemainingParts = (expirationTime, now = dayjs()) => {
  if (!expirationTime) {
    return null;
  }
  const minutes = Math.max(0, dayjs(expirationTime).diff(now, 'minute'));
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes };
};

export const getRemainingDays = (expirationTime, now = dayjs()) => {
  if (!expirationTime) {
    return null;
  }
  return Math.ceil(dayjs(expirationTime).diff(now, 'hour', true) / 24);
};

export const getBillingStatus = (
  expirationTime,
  {
    now = dayjs(),
    warningDays = DEFAULT_WARNING_DAYS,
    criticalDays = DEFAULT_CRITICAL_DAYS,
    trial = false,
  } = {},
) => {
  if (!expirationTime) {
    return BILLING_STATUS.UNSET;
  }
  if (!dayjs(expirationTime).isAfter(now)) {
    return BILLING_STATUS.EXPIRED;
  }
  if (trial) {
    return BILLING_STATUS.TRIAL;
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

// ---------- Rupiah ----------

// Accepts "150000", "150.000", "Rp 150.000", "150,000". Returns an integer
// number of rupiah, or null when the text holds no digits.
export const parseRupiah = (text) => {
  if (text === null || text === undefined) {
    return null;
  }
  const digits = String(text).replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
};

export const formatThousands = (value) =>
  value === null || value === undefined || value === ''
    ? ''
    : Math.round(Number(value))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatRupiah = (value) =>
  value === null || value === undefined || value === '' || Number.isNaN(Number(value))
    ? '-'
    : `Rp ${formatThousands(value)}`;

// ---------- Period dates (calendar dates in the app timezone, WIB) ----------

const DATE_FORMAT = 'YYYY-MM-DD';

export const todayDate = (now = dayjs()) => now.tz(getTimezone()).format(DATE_FORMAT);

// Continue from the current expiration date when still active, so the
// customer keeps remaining days; otherwise start today.
export const defaultStartDate = (currentExpiration, now = dayjs()) => {
  if (currentExpiration && dayjs(currentExpiration).isAfter(now)) {
    return dayjs(currentExpiration).tz(getTimezone()).format(DATE_FORMAT);
  }
  return todayDate(now);
};

// Same calendar date N months/years later; dayjs clamps month ends
// (Jan 31 + 1 month = Feb 28/29).
export const periodEndDate = (startDate, periods, unit) => {
  if (!startDate || !BILLING_UNITS.includes(unit)) {
    return null;
  }
  const count = Number(periods);
  if (!Number.isInteger(count) || count < 1) {
    return null;
  }
  const start = dayjs.tz(startDate, DATE_FORMAT, getTimezone());
  return start.isValid() ? start.add(count, unit).format(DATE_FORMAT) : null;
};

// The subscription stays active until the end of the end date (23:59:59 WIB).
export const expirationFromEndDate = (endDate) =>
  dayjs.tz(endDate, DATE_FORMAT, getTimezone()).endOf('day');

export const formatDateId = (date) =>
  date ? dayjs.tz(date, DATE_FORMAT, getTimezone()).locale('id').format('D MMM YYYY') : '-';

// ---------- Who pays ----------

// Stored as "direct" or "reseller:<userId>". Older records may hold
// "reseller:<free text name>".
export const parseBilledTo = (value) => {
  if (value && value.startsWith('reseller:')) {
    const rest = value.slice('reseller:'.length);
    return /^\d+$/.test(rest)
      ? { type: 'reseller', id: Number(rest), name: null }
      : { type: 'reseller', id: null, name: rest };
  }
  return { type: 'direct', id: null, name: null };
};

// ---------- Payment history ----------
// Kept on the device as a compact JSON string. Traccar stores device
// attributes in a limited text column, so only the most recent entries are
// kept (about a dozen). Export regularly for a complete ledger.

const HISTORY_MAX_CHARS = 2400;

export const parseHistory = (attributes) => {
  const raw = attributes?.[BILLING_ATTRIBUTES.history];
  let list = [];
  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  // Payments recorded before history existed: show the last one.
  if (!list.length && attributes?.[BILLING_ATTRIBUTES.lastPaidAt]) {
    list = [
      {
        t: attributes[BILLING_ATTRIBUTES.lastPaidAt],
        n: attributes[BILLING_ATTRIBUTES.lastPaidPeriods],
        u: attributes[BILLING_ATTRIBUTES.lastPaidUnit],
        a: attributes[BILLING_ATTRIBUTES.lastPaidAmount],
        r: attributes[BILLING_ATTRIBUTES.lastPaidReference],
        by: attributes[BILLING_ATTRIBUTES.lastPaidBy],
        b: attributes[BILLING_ATTRIBUTES.billedTo],
      },
    ];
  }
  return list;
};

// Newest first; drops the oldest entries when over the size limit.
export const appendHistory = (attributes, entry) => {
  const stored = attributes?.[BILLING_ATTRIBUTES.history] ? parseHistory(attributes) : [];
  const list = [entry, ...stored];
  let serialized = JSON.stringify(list);
  let trimmed = false;
  while (serialized.length > HISTORY_MAX_CHARS && list.length > 1) {
    list.pop();
    trimmed = true;
    serialized = JSON.stringify(list);
  }
  return { serialized, trimmed };
};

// ---------- Checks (detect changes made outside payment recording) ----------

export const BILLING_ISSUES = {
  NO_EXPIRATION: 'noExpiration',
  TRIAL_TOO_LONG: 'trialTooLong',
  UNPAID_EXTENSION: 'unpaidExtension',
  NO_PAYMENT: 'noPayment',
  MULTIPLE_OWNERS: 'multipleOwners',
  ACTIVATION_OVERDUE: 'activationOverdue',
};

const HOUR = 3600000;

// Returns [{ key, date? }] for one device. ownerCount comes from the
// ownership map (customers who can see the device).
export const findBillingIssues = (device, ownerCount = 0) => {
  const issues = [];
  const attributes = device.attributes || {};
  const expiration = device.expirationTime ? dayjs(device.expirationTime) : null;
  if (!expiration) {
    issues.push({ key: BILLING_ISSUES.NO_EXPIRATION });
  } else if (isTrial(attributes)) {
    const start = dayjs(attributes[BILLING_ATTRIBUTES.trialStart]);
    if (!start.isValid() || expiration.diff(start) > TRIAL_DAYS * 24 * HOUR + HOUR) {
      issues.push({ key: BILLING_ISSUES.TRIAL_TOO_LONG });
    }
    if (isActivationOverdue(attributes)) {
      issues.push({ key: BILLING_ISSUES.ACTIVATION_OVERDUE });
    }
  } else {
    const history = parseHistory(attributes);
    if (!history.length) {
      issues.push({ key: BILLING_ISSUES.NO_PAYMENT });
    } else if (history[0].e) {
      const paidUntil = expirationFromEndDate(history[0].e);
      if (expiration.diff(paidUntil) > 24 * HOUR) {
        issues.push({ key: BILLING_ISSUES.UNPAID_EXTENSION, date: history[0].e });
      }
    }
  }
  if (ownerCount > 1) {
    issues.push({ key: BILLING_ISSUES.MULTIPLE_OWNERS });
  }
  return issues;
};
