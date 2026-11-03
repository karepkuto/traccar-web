import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAsyncTask } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { getBillingThresholds } from '../billing/billingLogic';
import { billingFilterKey, ignitionKey, motionKey, sortDevices } from './filterLogic';

export default (
  keyword,
  filter,
  filterSort,
  filterMap,
  positions,
  setFilteredDevices,
  setFilteredPositions,
  ownerOptions,
) => {
  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);
  const server = useSelector((state) => state.session.server);
  const thresholds = useMemo(() => getBillingThresholds(server), [server]);

  // Owner filter: ask the server which devices each chosen user can see.
  // Ids that are not in the current account's options (e.g. a filter saved
  // by another account in this browser) are ignored.
  const ownerIds = useMemo(
    () => filter.users.filter((id) => ownerOptions?.some((user) => user.id === id)),
    [filter.users, ownerOptions],
  );
  const ownerKey = ownerIds.join(',');
  const [ownerDevices, setOwnerDevices] = useState({ key: '', ids: null });

  useAsyncTask(
    async ({ signal }) => {
      if (!ownerKey) {
        setOwnerDevices({ key: '', ids: null });
        return;
      }
      const lists = await Promise.all(
        ownerKey.split(',').map(async (id) => {
          const response = await fetchOrThrow(`/api/devices?userId=${id}&excludeAttributes=true`, {
            signal,
          });
          return response.json();
        }),
      );
      setOwnerDevices({ key: ownerKey, ids: new Set(lists.flat().map((device) => device.id)) });
    },
    [ownerKey],
  );

  useEffect(() => {
    const deviceGroups = (device) => {
      const groupIds = [];
      let { groupId } = device;
      while (groupId) {
        groupIds.push(groupId);
        groupId = groups[groupId]?.groupId || 0;
      }
      return groupIds;
    };

    const ownerSet = ownerKey && ownerDevices.key === ownerKey ? ownerDevices.ids : null;
    const lowerCaseKeyword = keyword.toLowerCase();

    const filtered = Object.values(devices)
      .filter((device) => !filter.statuses.length || filter.statuses.includes(device.status))
      .filter(
        (device) =>
          !filter.groups.length || deviceGroups(device).some((id) => filter.groups.includes(id)),
      )
      .filter(
        (device) =>
          !filter.geofences.length ||
          (positions[device.id]?.geofenceIds || []).some((id) => filter.geofences.includes(id)),
      )
      // While the owner lookup is loading nothing matches, rather than everything.
      .filter((device) => !ownerKey || Boolean(ownerSet?.has(device.id)))
      .filter(
        (device) =>
          !filter.billing.length || filter.billing.includes(billingFilterKey(device, thresholds)),
      )
      .filter(
        (device) =>
          !filter.motion.length || filter.motion.includes(motionKey(positions[device.id])),
      )
      .filter(
        (device) =>
          !filter.ignition.length || filter.ignition.includes(ignitionKey(positions[device.id])),
      )
      .filter((device) =>
        [device.name, device.uniqueId, device.phone, device.model, device.contact].some(
          (s) => s && s.toLowerCase().includes(lowerCaseKeyword),
        ),
      );

    sortDevices(filtered, filterSort, positions);

    setFilteredDevices(filtered);
    // The map follows the list when asked to, and always while filtering by owner.
    setFilteredPositions(
      filterMap || ownerKey
        ? filtered.map((device) => positions[device.id]).filter(Boolean)
        : Object.values(positions),
    );
  }, [
    keyword,
    filter,
    filterSort,
    filterMap,
    groups,
    devices,
    positions,
    thresholds,
    ownerKey,
    ownerDevices,
    setFilteredDevices,
    setFilteredPositions,
  ]);
};
