import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatNotificationTitle } from '../common/util/formatter';
import useFeatures from '../common/util/useFeatures';
import { useAsyncTask } from '../reactHelper';
import { fetchDeviceOwners } from '../common/util/ownership';
import ConnectionsLayout from './components/ConnectionsLayout';

const DeviceConnectionsPage = () => {
  const t = useTranslation();
  const { id } = useParams();
  const deviceId = Number(id);
  const features = useFeatures();

  // Linked devices: never the device itself, and only devices of the same
  // customer (or devices without a customer yet).
  const [owners, setOwners] = useState(null);
  useAsyncTask(async ({ signal }) => {
    setOwners(await fetchDeviceOwners({ signal }));
  }, []);
  const linkableDevice = useMemo(() => {
    const ownerIds = (owners?.get(deviceId) || []).map((it) => it.id);
    return (device) => {
      if (device.id === deviceId) {
        return false;
      }
      if (!owners || !ownerIds.length) {
        return true;
      }
      const deviceOwners = owners.get(device.id) || [];
      return !deviceOwners.length || deviceOwners.some((it) => ownerIds.includes(it.id));
    };
  }, [owners, deviceId]);

  return (
    <ConnectionsLayout
      endpoint="devices"
      id={id}
      breadcrumbs={['settingsTitle', 'deviceTitle', 'sharedConnections']}
    >
      <LinkField
        endpointAll="/api/geofences"
        endpointLinked={`/api/geofences?deviceId=${id}`}
        baseId={id}
        keyBase="deviceId"
        keyLink="geofenceId"
        label={t('sharedGeofences')}
        helperText={t('connectionsDeviceGeofences')}
      />
      <LinkField
        endpointAll="/api/notifications"
        endpointLinked={`/api/notifications?deviceId=${id}`}
        baseId={id}
        keyBase="deviceId"
        keyLink="notificationId"
        titleGetter={(it) => formatNotificationTitle(t, it)}
        label={t('sharedNotifications')}
        helperText={t('connectionsDeviceNotifications')}
      />
      {!features.disableSavedCommands && (
        <LinkField
          endpointAll="/api/commands"
          endpointLinked={`/api/commands?deviceId=${id}`}
          baseId={id}
          keyBase="deviceId"
          keyLink="commandId"
          titleGetter={(it) => it.description}
          label={t('sharedSavedCommands')}
          helperText={t('connectionsDeviceCommands')}
        />
      )}
      {!features.disableMaintenance && (
        <LinkField
          endpointAll="/api/maintenance"
          endpointLinked={`/api/maintenance?deviceId=${id}`}
          baseId={id}
          keyBase="deviceId"
          keyLink="maintenanceId"
          label={t('sharedMaintenance')}
          helperText={t('connectionsDeviceMaintenance')}
        />
      )}
      {!features.disableComputedAttributes && (
        <LinkField
          endpointAll="/api/attributes/computed"
          endpointLinked={`/api/attributes/computed?deviceId=${id}`}
          baseId={id}
          keyBase="deviceId"
          keyLink="attributeId"
          titleGetter={(it) => it.description}
          label={t('sharedComputedAttributes')}
          helperText={t('connectionsComputedAttributes')}
        />
      )}
      {!features.disableDrivers && (
        <LinkField
          endpointAll="/api/drivers"
          endpointLinked={`/api/drivers?deviceId=${id}`}
          baseId={id}
          keyBase="deviceId"
          keyLink="driverId"
          titleGetter={(it) => `${it.name} (${it.uniqueId})`}
          label={t('sharedDrivers')}
        />
      )}
      <LinkField
        endpointAll="/api/devices"
        endpointLinked={`/api/devices?deviceId=${id}`}
        baseId={id}
        keyBase="deviceId"
        keyLink="linkedDeviceId"
        label={t('connectionsLinkedDevices')}
        helperText={t('connectionsLinkedDevicesHelp')}
        filter={linkableDevice}
      />
    </ConnectionsLayout>
  );
};

export default DeviceConnectionsPage;
