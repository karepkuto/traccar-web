import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Box, ButtonBase, Chip, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ErrorIcon from '@mui/icons-material/Error';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryStdIcon from '@mui/icons-material/BatteryStd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import { formatAlarm, formatStatus, getStatusColor } from '../common/util/formatter';
import { speedFromKnots, speedUnitString } from '../common/util/converter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import GeofencesValue from '../common/components/GeofencesValue';
import DriverValue from '../common/components/DriverValue';
import MotionBar from './components/MotionBar';
import useFeatures from '../common/util/useFeatures';
import BillingCountdown from '../billing/BillingCountdown';

dayjs.extend(relativeTime);

// Height of one card in the virtualized list (see DeviceList rowHeight).
export const DEVICE_ROW_HEIGHT = 96;

const paletteKey = (statusColor) => (statusColor === 'neutral' ? 'neutral' : statusColor);

// Device list item as a compact card: status-coloured avatar, name, status
// and small chips for speed, engine and battery.
const DeviceRow = ({ devices, index, style }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const t = useTranslation();
  const features = useFeatures();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');
  const speedUnit = useAttributePreference('speedUnit');

  const resolveFieldValue = (field) => {
    if (field === 'geofenceIds') {
      const geofenceIds = position?.geofenceIds;
      return geofenceIds?.length ? <GeofencesValue geofenceIds={geofenceIds} /> : null;
    }
    if (field === 'driverUniqueId') {
      if (features.disableDrivers) {
        return null;
      }
      const driverUniqueId = position?.attributes?.driverUniqueId;
      return driverUniqueId ? <DriverValue driverUniqueId={driverUniqueId} /> : null;
    }
    if (field === 'motion') {
      return <MotionBar deviceId={item.id} />;
    }
    return item[field];
  };

  const primaryValue = resolveFieldValue(devicePrimary);
  const secondaryValue = resolveFieldValue(deviceSecondary);

  const statusColor = getStatusColor(item.status);
  const statusMain = theme.palette[paletteKey(statusColor)].main;
  const statusText =
    item.status === 'online' || !item.lastUpdate
      ? formatStatus(item.status, t)
      : dayjs(item.lastUpdate).fromNow();

  const selected = selectedDeviceId === item.id;
  const attributes = position?.attributes || {};
  const hasIgnition = Object.hasOwn(attributes, 'ignition');
  const hasBattery = Object.hasOwn(attributes, 'batteryLevel');
  const speed = position ? Math.round(speedFromKnots(position.speed || 0, speedUnit)) : null;

  const chipSx = {
    height: 22,
    fontSize: '0.72rem',
    fontWeight: 600,
    '& .MuiChip-icon': { ml: 0.5 },
  };

  return (
    <div style={{ ...style, padding: theme.spacing(0.75, 1) }}>
      <ButtonBase
        component="div"
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          borderRadius: 3,
          textAlign: 'left',
          bgcolor: selected ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
          boxShadow: selected
            ? `inset 4px 0 0 ${theme.palette.primary.main}`
            : '0 1px 3px rgba(0,0,0,0.08)',
          opacity: !admin && item.disabled ? 0.5 : 1,
        }}
      >
        <Box sx={{ position: 'relative', flex: 'none' }}>
          <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(statusMain, 0.9) }}>
            <img
              src={mapIcons[mapIconKey(item.category)]}
              alt=""
              style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }}
            />
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              right: -1,
              bottom: -1,
              width: 13,
              height: 13,
              borderRadius: '50%',
              bgcolor: statusMain,
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography noWrap sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>
              {primaryValue}
            </Typography>
            {Object.hasOwn(attributes, 'alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(attributes.alarm, t)}`}>
                <ErrorIcon fontSize="small" color="error" />
              </Tooltip>
            )}
          </Box>
          <Typography variant="caption" component="div" noWrap color="textSecondary">
            <span style={{ color: statusMain, fontWeight: 600 }}>{statusText}</span>
            {secondaryValue && <> • {secondaryValue}</>}
            <BillingCountdown device={item} />
          </Typography>
          {position && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, overflow: 'hidden' }}>
              <Chip
                size="small"
                icon={<SpeedIcon />}
                label={`${speed} ${speedUnitString(speedUnit, t)}`}
                sx={chipSx}
              />
              {hasIgnition && (
                <Chip
                  size="small"
                  icon={<EngineIcon width={14} height={14} />}
                  label={attributes.ignition ? 'ON' : 'OFF'}
                  color={attributes.ignition ? 'success' : 'default'}
                  variant={attributes.ignition ? 'filled' : 'outlined'}
                  sx={chipSx}
                />
              )}
              {hasBattery && (
                <Chip
                  size="small"
                  icon={<BatteryStdIcon />}
                  label={`${attributes.batteryLevel}%`}
                  color={
                    (attributes.batteryLevel > 70 && 'success') ||
                    (attributes.batteryLevel > 30 && 'warning') ||
                    'error'
                  }
                  variant="outlined"
                  sx={chipSx}
                />
              )}
            </Box>
          )}
        </Box>
      </ButtonBase>
    </div>
  );
};

export default DeviceRow;
