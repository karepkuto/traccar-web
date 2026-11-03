import dayjs from 'dayjs';
import fetchOrThrow from '../common/util/fetchOrThrow';

// Suspicious patterns found in the server audit log (/api/audit, admin only).
// The log says who did what and when, not which fields changed.

export const AUDIT_DAYS = 30;
const RECREATE_WINDOW_DAYS = 7;
const FAILED_LOGIN_THRESHOLD = 5;

export const AUDIT_PATTERNS = {
  DEVICE_REMOVED: 'deviceRemoved',
  DEVICE_RECREATED: 'deviceRecreated',
  USER_REMOVED: 'userRemoved',
  FAILED_LOGINS: 'failedLogins',
};

export const fetchAudit = async ({ signal } = {}) => {
  const query = new URLSearchParams({
    from: dayjs().subtract(AUDIT_DAYS, 'day').toISOString(),
    to: dayjs().toISOString(),
  });
  const response = await fetchOrThrow(`/api/audit?${query.toString()}`, { signal });
  return response.json();
};

// users: Map of id -> user (admin view of all users).
export const findAuditPatterns = (actions, users) => {
  const isNonAdmin = (userId) => Boolean(users.get(userId)) && !users.get(userId).administrator;
  const sorted = [...actions].sort((a, b) =>
    String(a.actionTime).localeCompare(String(b.actionTime)),
  );

  const patterns = [];
  const lastRemoval = new Map(); // userId -> time of last device removal
  const failed = new Map(); // address|day -> { count, last }
  const lastEdits = new Map(); // deviceId -> latest non-admin edit

  sorted.forEach((action) => {
    const { actionType, objectType, userId } = action;
    if (actionType === 'denied') {
      const key = `${action.address || '?'}|${dayjs(action.actionTime).format('YYYY-MM-DD')}`;
      const entry = failed.get(key) || { count: 0, action };
      entry.count += 1;
      entry.action = action;
      failed.set(key, entry);
      return;
    }
    if (!isNonAdmin(userId)) {
      return;
    }
    if (objectType === 'device' && actionType === 'remove') {
      patterns.push({ key: AUDIT_PATTERNS.DEVICE_REMOVED, action });
      lastRemoval.set(userId, action.actionTime);
    } else if (objectType === 'device' && actionType === 'create') {
      const removedAt = lastRemoval.get(userId);
      if (
        removedAt &&
        dayjs(action.actionTime).diff(dayjs(removedAt), 'day', true) <= RECREATE_WINDOW_DAYS
      ) {
        patterns.push({ key: AUDIT_PATTERNS.DEVICE_RECREATED, action });
      }
    } else if (objectType === 'user' && actionType === 'remove') {
      patterns.push({ key: AUDIT_PATTERNS.USER_REMOVED, action });
    } else if (objectType === 'device' && actionType === 'edit') {
      lastEdits.set(action.objectId, action);
    }
  });

  failed.forEach(({ count, action }) => {
    if (count >= FAILED_LOGIN_THRESHOLD) {
      patterns.push({ key: AUDIT_PATTERNS.FAILED_LOGINS, action, count });
    }
  });

  patterns.sort((a, b) => String(b.action.actionTime).localeCompare(String(a.action.actionTime)));
  return { patterns, lastEdits };
};
