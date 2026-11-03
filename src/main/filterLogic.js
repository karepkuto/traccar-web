import dayjs from 'dayjs';
import { BILLING_STATUS } from '../billing/billingLogic';
import { deviceBillingStatus } from '../billing/billingFormat';

// Device list filters and sorting shared by the toolbar panel, the quick
// chips and useFilter.

export const EMPTY_FILTER = {
  statuses: [],
  groups: [],
  geofences: [],
  users: [],
  billing: [],
  motion: [],
  ignition: [],
};

// Older saved filters lack the newer keys.
export const normalizeFilter = (filter) => ({ ...EMPTY_FILTER, ...(filter || {}) });

export const isFilterActive = (filter) =>
  Object.keys(EMPTY_FILTER).some((key) => filter[key]?.length);

export const BILLING_FILTERS = ['trial', 'expired', 'soon', 'active', 'unset'];

export const billingFilterKey = (device, thresholds) => {
  switch (deviceBillingStatus(device, thresholds)) {
    case BILLING_STATUS.TRIAL:
      return 'trial';
    case BILLING_STATUS.EXPIRED:
      return 'expired';
    case BILLING_STATUS.WARNING:
    case BILLING_STATUS.CRITICAL:
      return 'soon';
    case BILLING_STATUS.ACTIVE:
      return 'active';
    default:
      return 'unset';
  }
};

export const isMoving = (position) => {
  if (!position) {
    return null;
  }
  const motion = position.attributes?.motion;
  return typeof motion === 'boolean' ? motion : (position.speed || 0) > 1;
};

export const motionKey = (position) => {
  const moving = isMoving(position);
  if (moving === null) {
    return null;
  }
  return moving ? 'moving' : 'stopped';
};

export const ignitionKey = (position) => {
  const ignition = position?.attributes?.ignition;
  if (typeof ignition !== 'boolean') {
    return null;
  }
  return ignition ? 'on' : 'off';
};

export const SORTS = ['expiration', 'status', 'lastUpdate', 'name', 'speed'];

const statusRank = { online: 0, offline: 1, unknown: 2 };

const byName = (a, b) => (a.name || '').localeCompare(b.name || '');

const time = (value) => (value ? dayjs(value).valueOf() : 0);

// Locked first (most recently locked on top), then by the shortest
// remaining time, devices without an expiration last.
const expirationCompare = (a, b) => {
  const now = Date.now();
  const rank = (device) => {
    if (!device.expirationTime) return 2;
    return time(device.expirationTime) <= now ? 0 : 1;
  };
  const rankA = rank(a);
  const rankB = rank(b);
  if (rankA !== rankB) return rankA - rankB;
  if (rankA === 0) return time(b.expirationTime) - time(a.expirationTime);
  if (rankA === 1) return time(a.expirationTime) - time(b.expirationTime);
  return byName(a, b);
};

export const sortDevices = (devices, sort, positions) => {
  switch (sort) {
    case 'name':
      return devices.sort(byName);
    case 'lastUpdate':
      return devices.sort((a, b) => time(b.lastUpdate) - time(a.lastUpdate));
    case 'expiration':
      return devices.sort(expirationCompare);
    case 'status':
      return devices.sort(
        (a, b) => (statusRank[a.status] ?? 3) - (statusRank[b.status] ?? 3) || byName(a, b),
      );
    case 'speed':
      return devices.sort(
        (a, b) => (positions[b.id]?.speed || 0) - (positions[a.id]?.speed || 0) || byName(a, b),
      );
    default:
      return devices;
  }
};
