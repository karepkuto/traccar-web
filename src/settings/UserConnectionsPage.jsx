import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useAsyncTask } from '../reactHelper';
import { fetchDeviceOwners, findOtherOwners, isCustomer } from '../common/util/ownership';

const UserConnectionsPage = () => {
  const { classes } = useSettingsStyles();
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
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser', 'sharedConnections']}
    >
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedConnections')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <LinkField
              endpointAll="/api/devices?all=true&excludeAttributes=true"
              endpointLinked={`/api/devices?userId=${id}&excludeAttributes=true`}
              baseId={id}
              keyBase="userId"
              keyLink="deviceId"
              titleGetter={(it) => `${it.name} (${it.uniqueId})`}
              label={t('deviceTitle')}
              beforeAdd={enforce ? checkSimple('device') : undefined}
            />
            <LinkField
              endpointAll="/api/groups?all=true"
              endpointLinked={`/api/groups?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="groupId"
              label={t('settingsGroups')}
              beforeAdd={enforce ? checkGroups : undefined}
            />
            <LinkField
              endpointAll="/api/geofences?all=true"
              endpointLinked={`/api/geofences?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="geofenceId"
              label={t('sharedGeofences')}
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
            />
            <LinkField
              endpointAll="/api/calendars?all=true"
              endpointLinked={`/api/calendars?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="calendarId"
              label={t('sharedCalendars')}
            />
            <LinkField
              endpointAll="/api/users?all=true&excludeAttributes=true"
              endpointLinked={`/api/users?userId=${id}&excludeAttributes=true`}
              baseId={id}
              keyBase="userId"
              keyLink="managedUserId"
              label={t('settingsUsers')}
            />
            <LinkField
              endpointAll="/api/attributes/computed?all=true"
              endpointLinked={`/api/attributes/computed?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="attributeId"
              titleGetter={(it) => it.description}
              label={t('sharedComputedAttributes')}
            />
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
            <LinkField
              endpointAll="/api/commands?all=true"
              endpointLinked={`/api/commands?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="commandId"
              titleGetter={(it) => it.description}
              label={t('sharedSavedCommands')}
            />
            <LinkField
              endpointAll="/api/maintenance?all=true"
              endpointLinked={`/api/maintenance?userId=${id}`}
              baseId={id}
              keyBase="userId"
              keyLink="maintenanceId"
              label={t('sharedMaintenance')}
            />
          </AccordionDetails>
        </Accordion>
      </Container>
    </PageLayout>
  );
};

export default UserConnectionsPage;
