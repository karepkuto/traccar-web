import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  Link,
  Avatar,
  ButtonBase,
  Chip,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import { useTheme } from '@mui/material/styles';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryStdIcon from '@mui/icons-material/BatteryStd';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import dayjs from 'dayjs';
import { formatStatus, getStatusColor } from '../util/formatter';
import { speedFromKnots, speedUnitString } from '../util/converter';
import { mapIconKey, mapIcons } from '../../map/core/preloadImages';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: 'auto',
    width: `min(360px, calc(100vw - ${theme.spacing(4)}))`,
    borderRadius: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 1, 0.5, 2),
    cursor: 'move',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1),
  },
  address: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(0.5),
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    '& > div': {
      color: theme.palette.common.white,
      mixBlendMode: 'difference',
    },
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiTableCell-sizeSmall:first-of-type': {
      paddingRight: theme.spacing(1),
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-around',
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.5),
  },
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  },
}));

const StatusRow = ({ name, content }) => {
  const { classes } = useStyles({ desktopPadding: 0 });

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

// Icon with a small label underneath, so actions are self-explanatory.
const ActionButton = ({ icon, label, onClick, disabled, color }) => (
  <ButtonBase
    onClick={onClick}
    disabled={disabled}
    sx={{
      flexDirection: 'column',
      gap: 0.25,
      px: 1,
      py: 0.75,
      borderRadius: 2,
      minWidth: 56,
      color: color ? `${color}.main` : 'text.primary',
      opacity: disabled ? 0.35 : 1,
    }}
  >
    {icon}
    <Typography variant="caption" sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
      {label}
    </Typography>
  </ButtonBase>
);

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;
  const theme = useTheme();
  const speedUnit = useAttributePreference('speedUnit');
  const statusColor = getStatusColor(device?.status);
  const statusMain = theme.palette[statusColor].main;
  const statusText =
    !device || device.status === 'online' || !device.lastUpdate
      ? formatStatus(device?.status, t)
      : dayjs(device.lastUpdate).fromNow();

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    'positionItems',
    'fixTime,address,speed,totalDistance',
  );

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position, t]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: 'auto', height: 'auto' }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <Card elevation={6} className={classes.card}>
              <CardMedia
                className={`draggable-header ${deviceImage ? classes.media : ''}`}
                image={deviceImage && `/api/media/${device.uniqueId}/${deviceImage}`}
              >
                <div className={classes.header}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: statusMain, flex: 'none' }}>
                    <img
                      src={mapIcons[mapIconKey(device.category)]}
                      alt=""
                      style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)' }}
                    />
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{ fontWeight: 700, lineHeight: 1.3 }}
                    >
                      {device.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: statusMain, fontWeight: 600 }}>
                      {statusText}
                    </Typography>
                  </div>
                  <IconButton size="small" color="inherit" onClick={onClose} onTouchStart={onClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              </CardMedia>
              {position && (
                <CardContent className={classes.content}>
                  <div className={classes.chips}>
                    <Chip
                      size="small"
                      icon={<SpeedIcon />}
                      label={`${Math.round(speedFromKnots(position.speed || 0, speedUnit))} ${speedUnitString(speedUnit, t)}`}
                    />
                    {position.attributes.hasOwnProperty('ignition') && (
                      <Chip
                        size="small"
                        label={`${t('positionIgnition')}: ${position.attributes.ignition ? 'ON' : 'OFF'}`}
                        color={position.attributes.ignition ? 'success' : 'default'}
                        variant={position.attributes.ignition ? 'filled' : 'outlined'}
                      />
                    )}
                    {position.attributes.hasOwnProperty('batteryLevel') && (
                      <Chip
                        size="small"
                        icon={<BatteryStdIcon />}
                        label={`${position.attributes.batteryLevel}%`}
                        variant="outlined"
                      />
                    )}
                  </div>
                  {position.address && (
                    <div className={classes.address}>
                      <PlaceOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <PositionValue position={position} property="address" />
                      </Typography>
                    </div>
                  )}
                  <Table size="small" className={classes.table}>
                    <TableBody>
                      {positionItems
                        .split(',')
                        .filter((key) => key !== 'address' && key !== 'speed')
                        .filter(
                          (key) =>
                            position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key),
                        )
                        .map((key) => (
                          <StatusRow
                            key={key}
                            name={positionAttributes[key]?.name || key}
                            content={
                              <PositionValue
                                position={position}
                                property={position.hasOwnProperty(key) ? key : null}
                                attribute={position.hasOwnProperty(key) ? null : key}
                              />
                            }
                          />
                        ))}
                    </TableBody>
                  </Table>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Link component={RouterLink} to={`/position/${position.id}`}>
                      {t('sharedShowDetails')}
                    </Link>
                  </Typography>
                </CardContent>
              )}
              <CardActions className={classes.actions} disableSpacing>
                <ActionButton
                  icon={<RouteIcon />}
                  label={t('reportReplay')}
                  onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                  disabled={disableActions || !position}
                />
                <ActionButton
                  icon={<SendIcon />}
                  label={t('commandTitle')}
                  onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                  disabled={disableActions}
                />
                <ActionButton
                  icon={<EditIcon />}
                  label={t('sharedEdit')}
                  onClick={() => navigate(`/settings/device/${deviceId}`)}
                  disabled={disableActions || deviceReadonly}
                />
                <ActionButton
                  icon={<DeleteIcon />}
                  label={t('sharedRemove')}
                  color="error"
                  onClick={() => setRemoving(true)}
                  disabled={disableActions || deviceReadonly}
                />
                <ActionButton
                  icon={<PendingIcon />}
                  label={t('statusMore')}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position}
                />
              </CardActions>
            </Card>
          </Rnd>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
          >
            {t('linkLiveVideo')}
          </MenuItem>
          {!readonly && <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>}
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t('linkStreetView')}
          </MenuItem>
          {navigationAppTitle && navigationAppLink && (
            <MenuItem
              component="a"
              target="_blank"
              href={navigationAppLink
                .replace('{latitude}', position.latitude)
                .replace('{longitude}', position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>
          )}
          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}>
              <Typography color="secondary">{t('sharedShare')}</Typography>
            </MenuItem>
          )}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
