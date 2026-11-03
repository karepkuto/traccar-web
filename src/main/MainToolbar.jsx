import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Toolbar,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  ListItemButton,
  ListItemText,
  Tooltip,
  Autocomplete,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import MapIcon from '@mui/icons-material/Map';
import DnsIcon from '@mui/icons-material/Dns';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAdministrator, useDeviceReadonly } from '../common/util/permissions';
import { getBillingThresholds } from '../billing/billingLogic';
import { BILLING_FILTERS, billingFilterKey, isFilterActive } from './filterLogic';
import DeviceRow from './DeviceRow';

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  filterApply: {
    position: 'sticky',
    bottom: 0,
    borderRadius: theme.spacing(1.5),
    boxShadow: `0 -${theme.spacing(1)} ${theme.spacing(1.5)} ${theme.palette.background.paper}`,
  },
  sheet: {
    borderTopLeftRadius: theme.spacing(2.5),
    borderTopRightRadius: theme.spacing(2.5),
    maxHeight: '85vh',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.divider,
    margin: `${theme.spacing(1)} auto 0`,
    flex: 'none',
  },
}));

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
  ownerOptions,
  manager,
  onReset,
}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const admin = useAdministrator();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const server = useSelector((state) => state.session.server);

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);
  const devicesLoaded = useSelector((state) => state.devices.loaded);
  const geofences = useSelector((state) => state.geofences.items);

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);

  const deviceStatusCount = (status) =>
    Object.values(devices).filter((d) => d.status === status).length;

  const thresholds = getBillingThresholds(server);
  const billingCount = (key) =>
    Object.values(devices).filter((d) => billingFilterKey(d, thresholds) === key).length;
  const billingLabels = {
    trial: 'filterBillingTrial',
    expired: 'filterBillingExpired',
    soon: 'filterBillingSoon',
    active: 'filterBillingActive',
    unset: 'filterBillingUnset',
  };

  const filterPanel = (
    <div className={classes.filterPanel}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
          {t('filterTitle')}
        </Typography>
        <Button size="small" onClick={onReset} disabled={!isFilterActive(filter) && !filterSort}>
          {t('filterReset')}
        </Button>
      </Box>
      {manager && (
        <Autocomplete
          multiple
          size="small"
          options={ownerOptions || []}
          loading={!ownerOptions}
          groupBy={(option) =>
            option.role === 'reseller' ? t('userTypeReseller') : t('userTypeCustomer')
          }
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={(ownerOptions || []).filter((option) => filter.users.includes(option.id))}
          onChange={(_, value) => setFilter({ ...filter, users: value.map((it) => it.id) })}
          limitTags={2}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('filterOwner')}
              helperText={t(admin ? 'filterOwnerHelpAdmin' : 'filterOwnerHelpReseller')}
            />
          )}
        />
      )}
      <FormControl size="small">
        <InputLabel>{t('filterConnection')}</InputLabel>
        <Select
          label={t('filterConnection')}
          value={filter.statuses}
          onChange={(e) => setFilter({ ...filter, statuses: e.target.value })}
          multiple
        >
          <MenuItem value="online">{`${t('deviceStatusOnline')} (${deviceStatusCount('online')})`}</MenuItem>
          <MenuItem value="offline">{`${t('deviceStatusOffline')} (${deviceStatusCount('offline')})`}</MenuItem>
          <MenuItem value="unknown">{`${t('deviceStatusUnknown')} (${deviceStatusCount('unknown')})`}</MenuItem>
        </Select>
      </FormControl>
      {manager && (
        <FormControl size="small">
          <InputLabel>{t('filterBilling')}</InputLabel>
          <Select
            label={t('filterBilling')}
            value={filter.billing}
            onChange={(e) => setFilter({ ...filter, billing: e.target.value })}
            multiple
          >
            {BILLING_FILTERS.map((key) => (
              <MenuItem key={key} value={key}>
                {`${t(billingLabels[key])} (${billingCount(key)})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>{t('filterMotion')}</InputLabel>
          <Select
            label={t('filterMotion')}
            value={filter.motion}
            onChange={(e) => setFilter({ ...filter, motion: e.target.value })}
            multiple
          >
            <MenuItem value="moving">{t('filterMoving')}</MenuItem>
            <MenuItem value="stopped">{t('filterStopped')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>{t('filterIgnition')}</InputLabel>
          <Select
            label={t('filterIgnition')}
            value={filter.ignition}
            onChange={(e) => setFilter({ ...filter, ignition: e.target.value })}
            multiple
          >
            <MenuItem value="on">{t('filterIgnitionOn')}</MenuItem>
            <MenuItem value="off">{t('filterIgnitionOff')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {Object.keys(groups).length > 0 && (
        <FormControl size="small">
          <InputLabel>{t('settingsGroups')}</InputLabel>
          <Select
            label={t('settingsGroups')}
            value={filter.groups}
            onChange={(e) => setFilter({ ...filter, groups: e.target.value })}
            multiple
          >
            {Object.values(groups)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      {Object.keys(geofences).length > 0 && (
        <FormControl size="small">
          <InputLabel>{t('sharedGeofences')}</InputLabel>
          <Select
            label={t('sharedGeofences')}
            value={filter.geofences}
            onChange={(e) => setFilter({ ...filter, geofences: e.target.value })}
            multiple
          >
            {Object.values(geofences)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((geofence) => (
                <MenuItem key={geofence.id} value={geofence.id}>
                  {geofence.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}
      <Divider />
      <FormControl size="small">
        <InputLabel>{t('sharedSortBy')}</InputLabel>
        <Select
          label={t('sharedSortBy')}
          value={filterSort}
          onChange={(e) => setFilterSort(e.target.value)}
        >
          <MenuItem value="">{t('sortDefault')}</MenuItem>
          <MenuItem value="expiration">{t('sortExpiration')}</MenuItem>
          <MenuItem value="status">{t('sortStatus')}</MenuItem>
          <MenuItem value="lastUpdate">{t('deviceLastUpdate')}</MenuItem>
          <MenuItem value="name">{t('sharedName')}</MenuItem>
          {!manager && <MenuItem value="speed">{t('sortSpeed')}</MenuItem>}
        </Select>
      </FormControl>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox checked={filterMap} onChange={(e) => setFilterMap(e.target.checked)} />
          }
          label={t('sharedFilterMap')}
        />
      </FormGroup>
      <Button
        variant="contained"
        fullWidth
        onClick={() => setFilterAnchorEl(null)}
        className={classes.filterApply}
      >
        {t('filterApply').replace('{n}', filteredDevices.length)}
      </Button>
    </div>
  );

  return (
    <Toolbar ref={toolbarRef} className={classes.toolbar}>
      <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
        {devicesOpen ? <MapIcon /> : <DnsIcon />}
      </IconButton>
      <OutlinedInput
        ref={inputRef}
        placeholder={t('sharedSearchDevices')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setDevicesAnchorEl(toolbarRef.current)}
        onBlur={() => setDevicesAnchorEl(null)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton size="small" edge="end" onClick={() => setFilterAnchorEl(inputRef.current)}>
              <Badge color="info" variant="dot" invisible={!isFilterActive(filter)}>
                <TuneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </InputAdornment>
        }
        size="small"
        fullWidth
      />
      <Popover
        open={!!devicesAnchorEl && !devicesOpen}
        anchorEl={devicesAnchorEl}
        onClose={() => setDevicesAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: Number(theme.spacing(2).slice(0, -2)),
        }}
        marginThreshold={0}
        slotProps={{
          paper: {
            style: { width: `calc(${toolbarRef.current?.clientWidth}px - ${theme.spacing(4)})` },
          },
        }}
        elevation={1}
        disableAutoFocus
        disableEnforceFocus
      >
        {filteredDevices.slice(0, 3).map((_, index) => (
          <DeviceRow key={filteredDevices[index].id} devices={filteredDevices} index={index} />
        ))}
        {filteredDevices.length > 3 && (
          <ListItemButton alignItems="center" onClick={() => setDevicesOpen(true)}>
            <ListItemText primary={t('notificationAlways')} style={{ textAlign: 'center' }} />
          </ListItemButton>
        )}
      </Popover>
      {phone ? (
        <Drawer
          anchor="bottom"
          open={!!filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          slotProps={{ paper: { className: classes.sheet } }}
        >
          <div className={classes.sheetHandle} />
          {filterPanel}
        </Drawer>
      ) : (
        <Popover
          open={!!filterAnchorEl}
          anchorEl={filterAnchorEl}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{ paper: { sx: { borderRadius: 3, mt: 1 } } }}
        >
          {filterPanel}
        </Popover>
      )}
      <IconButton edge="end" onClick={() => navigate('/settings/device')} disabled={deviceReadonly}>
        <Tooltip
          open={!deviceReadonly && devicesLoaded && Object.keys(devices).length === 0}
          title={t('deviceRegisterFirst')}
          arrow
        >
          <AddIcon />
        </Tooltip>
      </IconButton>
    </Toolbar>
  );
};

export default MainToolbar;
