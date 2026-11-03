import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAsyncTask } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { ROLES, getUserRole } from '../common/util/roles';

// Users the current account may filter devices by: resellers and customers
// for an administrator, own customers for a reseller, nothing for customers.
// The server already limits /api/users to the accounts a manager manages.
export default (enabled) => {
  const currentUserId = useSelector((state) => state.session.user.id);
  const [options, setOptions] = useState(enabled ? null : []);

  useAsyncTask(
    async ({ signal }) => {
      if (!enabled) {
        setOptions([]);
        return;
      }
      const response = await fetchOrThrow('/api/users?excludeAttributes=true', { signal });
      const order = { [ROLES.RESELLER]: 0, [ROLES.CUSTOMER]: 1 };
      setOptions(
        (await response.json())
          .filter((user) => user.id !== currentUserId && !user.temporary)
          .map((user) => ({ id: user.id, name: user.name, role: getUserRole(user) }))
          .filter((user) => user.role !== ROLES.ADMIN)
          .sort((a, b) => order[a.role] - order[b.role] || a.name.localeCompare(b.name)),
      );
    },
    [enabled, currentUserId],
  );

  return options;
};
