import { useSelector } from 'react-redux';

// Pantauku roles. A role is never stored on its own: it is read from the
// Traccar fields that the server actually enforces, so it cannot drift.
//   admin    -> administrator = true
//   reseller -> may manage other users (userLimit != 0)
//   customer -> everyone else
// A "staff" role can be added later between admin and reseller.

export const ROLES = {
  ADMIN: 'admin',
  RESELLER: 'reseller',
  CUSTOMER: 'customer',
};

export const getUserRole = (user) => {
  if (user?.administrator) {
    return ROLES.ADMIN;
  }
  if ((user?.userLimit || 0) !== 0) {
    return ROLES.RESELLER;
  }
  return ROLES.CUSTOMER;
};

export const useCurrentRole = () => useSelector((state) => getUserRole(state.session.user));

// Restrictions that follow the role. They are locked in the user form.
// readonly and disableReports stay optional per account.
const ROLE_FLAGS = {
  [ROLES.RESELLER]: { deviceReadonly: false, limitCommands: true, fixedEmail: true },
  [ROLES.CUSTOMER]: { deviceReadonly: true, limitCommands: true, fixedEmail: true },
};

// Limits only an administrator may change (the server rejects others).
const ROLE_LIMITS = {
  [ROLES.CUSTOMER]: { userLimit: 0, deviceLimit: 0 },
};

export const ROLE_LOCKED_FLAGS = ['deviceReadonly', 'limitCommands', 'fixedEmail'];

export const rolePreset = (role, { admin }) => ({
  ...(ROLE_FLAGS[role] || {}),
  ...(admin ? ROLE_LIMITS[role] || {} : {}),
});

// Fields of `user` that differ from its role preset.
export const roleMismatches = (user, { admin }) => {
  const preset = rolePreset(getUserRole(user), { admin });
  return Object.keys(preset).filter(
    (key) => (user[key] ?? (typeof preset[key] === 'boolean' ? false : 0)) !== preset[key],
  );
};

export const applyRolePreset = (user, { admin }) => ({
  ...user,
  ...rolePreset(getUserRole(user), { admin }),
});
