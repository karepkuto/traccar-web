import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatNotificationTitle } from '../common/util/formatter';
import useFeatures from '../common/util/useFeatures';
import ConnectionsLayout from './components/ConnectionsLayout';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useAsyncTask } from '../reactHelper';
import {
  fetchDeviceOwners,
  findOtherOwners,
  findOtherResellers,
  isCustomer,
  isReseller,
} from '../common/util/ownership';

const UserConnectionsPage = () => {
  const t = useTranslation();
  const features = useFeatures();

  const { id } = useParams();
  const userId = Number(id);

  // One device / group / geofence = one customer. Only checked when the
  // user being edited is a customer (admins and resellers only oversee).
  const [targetUser, setTargetUser] = useState(null);
  useAsyncTask(
    async ({ signal }) => {
      const response = await fetchOrThrow(`/api/users/${userId}`, { signal });
      setTargetUser(await response.json());
    },
    [userId],
  );
  const enforce = isCustomer(targetUser);
  const targetIsReseller = isReseller(targetUser);

  const checkManagedCustomers = useCallback(
    async (items) => {
      for (const item of items) {
        const others = await findOtherResellers({ customerId: item.id, excludeResellerId: userId });
        if (others.length) {
          return t('resellerConflict')
            .replace('{customer}', item.name)
            .replace('{reseller}', others.map((it) => it.name).join(', '));
        }
      }
      return null;
    },
    [userId, t],
  );

  const conflictMessage = useCallback(
    (item, owners) =>
      t('ownershipConflict')
        .replace('{item}', item)
        .replace('{owners}', owners.map((owner) => owner.name).join(', ')),
    [t],
  );

  const checkSimple = useCallback(
    (type) => async (items) => {
      for (const item of items) {
        const owners = await findOtherOwners({ type, id: item.id, excludeUserId: userId });
        if (owners.length) {
          return conflictMessage(item.name, owners);
        }
      }
      return null;
    },
    [userId, conflictMessage],
  );

  const checkGroups = useCallback(
    async (items) => {
      const groupProblem = await checkSimple('group')(items);
      if (groupProblem) {
        return groupProblem;
      }
      // Devices inside the group must not belong to another customer either.
      const [devicesResponse, deviceOwners] = await Promise.all([
        fetchOrThrow('/api/devices?all=true&excludeAttributes=true'),
        fetchDeviceOwners(),
      ]);
      const devices = await devicesResponse.json();
      const groupIds = items.map((item) => item.id);
      for (const device of devices.filter((it) => groupIds.includes(it.groupId))) {
        const owners = (deviceOwners.get(device.id) || []).filter((it) => it.id !== userId);
        if (owners.length) {
          return conflictMessage(device.name, owners);
        }
      }
      return null;
    },
    [checkSimple, userId, conflictMessage],
  );

  return (
    <ConnectionsLayout
      endpoint="users"
      id={id}
      breadcrumbs={['settingsTitle', 'settingsUser', 'sharedConnections']}
    >
      <LinkField
        endpointAll="/api/devices?all=true&excludeAttributes=true"
        endpointLinked={`/api/devices?userId=${id}&excludeAttributes=true`}
        baseId={id}
        keyBase="userId"
        keyLink="deviceId"
        titleGetter={(it) => `${it.name} (${it.uniqueId})`}
        label={t('deviceTitle')}
        helperText={t(enforce ? 'connectionsUserDevicesCustomer' : 'connectionsUserDevices')}
        beforeAdd={enforce ? checkSimple('device') : undefined}
      />
      <LinkField
        endpointAll="/api/groups?all=true"
        endpointLinked={`/api/groups?userId=${id}`}
        baseId={id}
        keyBase="userId"
        keyLink="groupId"
        label={t('settingsGroups')}
        helperText={t('connectionsUserGroups')}
        beforeAdd={enforce ? checkGroups : undefined}
      />
      <LinkField
        endpointAll="/api/geofences?all=true"
        endpointLinked={`/api/geofences?userId=${id}`}
        baseId={id}
        keyBase="userId"
        keyLink="geofenceId"
        label={t('sharedGeofences')}
        helperText={t('connectionsUserGeofences')}
        beforeAdd={enforce ? checkSimple('geofence') : undefined}
      />
      <LinkField
        endpointAll="/api/notifications?all=true"
        endpointLinked={`/api/notifications?userId=${id}`}
        baseId={id}
        keyBase="userId"
        keyLink="notificationId"
        titleGetter={(it) => formatNotificationTitle(t, it, true)}
        label={t('sharedNotifications')}
        helperText={t('connectionsUserTemplates')}
      />
      {!features.disableSavedCommands && (
        <LinkField
          endpointAll="/api/commands?all=true"
          endpointLinked={`/api/commands?userId=${id}`}
          baseId={id}
          keyBase="userId"
          keyLink="commandId"
          titleGetter={(it) => it.description}
          label={t('sharedSavedCommands')}
          helperText={t('connectionsUserCommands')}
        />
      )}
      {targetIsReseller && (
        <LinkField
          endpointAll="/api/users?all=true&excludeAttributes=true"
          endpointLinked={`/api/users?userId=${id}&excludeAttributes=true`}
          baseId={id}
          keyBase="userId"
          keyLink="managedUserId"
          titleGetter={(it) => `${it.name} (${it.email})`}
          label={t('connectionsManagedCustomers')}
          helperText={t('resellerManageHelp')}
          filter={(it) => isCustomer(it) && it.id !== userId}
          beforeAdd={checkManagedCustomers}
        />
      )}
      {!features.disableCalendars && (
        <LinkField
          endpointAll="/api/calendars?all=true"
          endpointLinked={`/api/calendars?userId=${id}`}
          baseId={id}
          keyBase="userId"
          keyLink="calendarId"
          label={t('sharedCalendars')}
          helperText={t('connectionsUserTemplates')}
        />
      )}
      {!features.disableMaintenance && (
        <LinkField
          endpointAll="/api/maintenance?all=true"
          endpointLinked={`/api/maintenance?userId=${id}`}
          baseId={id}
          keyBase="userId"
          keyLink="maintenanceId"
          label={t('sharedMaintenance')}
          helperText={t('connectionsUserTemplates')}
        />
      )}
      {!features.disableComputedAttributes && (
        <LinkField
          endpointAll="/api/attributes/computed?all=true"
          endpointLinked={`/api/attributes/computed?userId=${id}`}
          baseId={id}
          keyBase="userId"
          keyLink="attributeId"
          titleGetter={(it) => it.description}
          label={t('sharedComputedAttributes')}
          helperText={t('connectionsComputedAttributes')}
        />
      )}
      {!features.disableDrivers && (
        <LinkField
          endpointAll="/api/drivers?all=true"
          endpointLinked={`/api/drivers?userId=${id}`}
          baseId={id}
          keyBase="userId"
          keyLink="driverId"
          titleGetter={(it) => `${it.name} (${it.uniqueId})`}
          label={t('sharedDrivers')}
        />
      )}
    </ConnectionsLayout>
  );
};

export default UserConnectionsPage;
