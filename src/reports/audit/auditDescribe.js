import dayjs from 'dayjs';
import { getTimezone } from '../../common/util/timezone';
import { ROLES, getUserRole } from '../../common/util/roles';

// Turns raw /api/audit rows into readable entries.

export const ACTION_GROUPS = {
  access: ['login', 'logout', 'denied', 'token', 'impersonate'],
  change: ['create', 'edit', 'remove', 'accumulators'],
  link: ['link', 'unlink'],
  command: ['command'],
  report: ['report'],
};

export const actionGroup = (actionType) =>
  Object.keys(ACTION_GROUPS).find((group) => ACTION_GROUPS[group].includes(actionType)) || 'change';

// Admin-only endpoints used to name the objects in the log.
export const NAME_SOURCES = {
  device: '/api/devices?all=true&excludeAttributes=true',
  user: '/api/users?excludeAttributes=true',
  group: '/api/groups?all=true',
  geofence: '/api/geofences?all=true',
  notification: '/api/notifications?all=true',
  command: '/api/commands?all=true',
  calendar: '/api/calendars?all=true',
  maintenance: '/api/maintenance?all=true',
  attribute: '/api/attributes/computed?all=true',
};

const objectSource = (type) => (type === 'managedUser' ? 'user' : type);

const nameOf = (item) => item?.name || item?.description || item?.email || null;

// Severity: 'danger' for deletions and failed sign-ins, 'warning' for actions
// that change access, control a vehicle or edit devices as a non-admin.
export const severityOf = (action, actor) => {
  const { actionType, objectType } = action;
  if (actionType === 'remove' || actionType === 'denied') return 'danger';
  if (['command', 'link', 'unlink', 'accumulators', 'token'].includes(actionType)) return 'warning';
  if (actionType === 'create' && action.objectType === 'token') return 'warning';
  if (objectType === 'server' && actionType === 'edit') return 'warning';
  if (
    objectType === 'device' &&
    ['edit', 'create'].includes(actionType) &&
    actor &&
    !actor.administrator
  ) {
    return 'warning';
  }
  return 'normal';
};

export const describe = (action, names, at) => {
  const users = names.user || new Map();
  const actor = users.get(action.userId);
  const objectLabel = (type) => at(`object_${type}`);
  const objectName = (type, id) => {
    const found = nameOf(names[objectSource(type)]?.get(id));
    return found || `#${id} ${at('deleted')}`;
  };

  let verb;
  let object = '';
  let target = '';
  const type = action.objectType;

  switch (action.actionType) {
    case 'login':
    case 'logout':
      verb = at(`action_${action.actionType}`);
      break;
    case 'denied':
      verb = at('action_denied');
      break;
    case 'report': {
      const attrs = action.attributes || {};
      verb = at('action_report');
      object = [
        attrs.type &&
          (at(`report_${attrs.type}`).startsWith('report_')
            ? attrs.type
            : at(`report_${attrs.type}`)),
        attrs.from && attrs.to ? `${attrs.from} – ${attrs.to}` : null,
        attrs.scheduled ? at('scheduled') : null,
      ]
        .filter(Boolean)
        .join(' · ');
      break;
    }
    case 'create':
      if (type === 'token') {
        verb = at('action_token');
        break;
      }
      verb = at('action_create');
      object = `${objectLabel(type)} ${objectName(type, action.objectId)}`;
      break;
    case 'link':
    case 'unlink': {
      verb = at(`action_${action.actionType}`);
      object = `${objectLabel(type)} ${objectName(type, action.objectId)}`;
      const ownerType = action.attributes?.ownerType;
      const ownerId = action.attributes?.ownerId;
      if (ownerType && ownerId) {
        target = `${at(action.actionType === 'link' ? 'to' : 'from')} ${objectLabel(ownerType)} ${objectName(ownerType, ownerId)}`;
      }
      break;
    }
    default:
      verb = at(`action_${action.actionType}`);
      object =
        type === 'server'
          ? objectLabel('server')
          : type
            ? `${objectLabel(type)} ${objectName(type, action.objectId)}`
            : '';
  }

  return {
    id: action.id,
    time: action.actionTime,
    day: dayjs(action.actionTime).tz(getTimezone()).format('YYYY-MM-DD'),
    actor,
    actorId: action.userId,
    role: actor ? getUserRole(actor) : null,
    verb,
    object,
    target,
    address: action.address || '',
    actionType: action.actionType,
    group: actionGroup(action.actionType),
    severity: severityOf(action, actor),
  };
};

// A reseller's impersonation shows up as "<reseller> edited user X" (the
// trail written by the app) followed shortly by "X logged in". Returns
// Map loginActionId -> trail edit action.
const PAIR_WINDOW_MS = 120000;

export const findImpersonations = (actions) => {
  const sorted = [...actions].sort((a, b) =>
    String(a.actionTime).localeCompare(String(b.actionTime)),
  );
  const pairs = new Map();
  const used = new Set();
  sorted.forEach((action, index) => {
    if (action.actionType !== 'login') return;
    for (let i = index - 1; i >= 0; i -= 1) {
      const previous = sorted[i];
      if (dayjs(action.actionTime).diff(dayjs(previous.actionTime)) > PAIR_WINDOW_MS) break;
      if (
        previous.actionType === 'edit' &&
        previous.objectType === 'user' &&
        previous.objectId === action.userId &&
        previous.userId !== action.userId &&
        !used.has(previous.id) &&
        (!previous.address || !action.address || previous.address === action.address)
      ) {
        used.add(previous.id);
        pairs.set(action.id, previous);
        break;
      }
    }
  });
  return pairs;
};

export const roleKey = (role) =>
  ({
    [ROLES.ADMIN]: 'userTypeAdmin',
    [ROLES.RESELLER]: 'userTypeReseller',
    [ROLES.CUSTOMER]: 'userTypeCustomer',
  })[role];
