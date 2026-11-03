import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CachedIcon from '@mui/icons-material/Cached';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import EditItemView from './components/EditItemView';
import EditAttributesAccordion from './components/EditAttributesAccordion';
import { useTranslation } from '../common/components/LocalizationProvider';
import useUserAttributes from '../common/attributes/useUserAttributes';
import { sessionActions } from '../store';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import useCommonUserAttributes from '../common/attributes/useCommonUserAttributes';
import { useAdministrator, useRestriction, useManager } from '../common/util/permissions';
import { useCatch } from '../reactHelper';
import { ValidatedPasswordField, ValidatedTextField } from './components/ValidatedFields';
import useMapStyles from '../map/core/useMapStyles';
import { map } from '../map/core/MapView';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const UserPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const manager = useManager();
  const fixedEmail = useRestriction('fixedEmail');

  const currentUser = useSelector((state) => state.session.user);
  const registrationEnabled = useSelector((state) => state.session.server.registration);
  const openIdForced = useSelector((state) => state.session.server.openIdForce);
  const totpEnable = useSelector((state) => state.session.server.attributes.totpEnable);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const mapStyles = useMapStyles();
  const commonUserAttributes = useCommonUserAttributes(t);
  const userAttributes = useUserAttributes(t);

  const { id } = useParams();
  const [item, setItem] = useState(id === currentUser.id.toString() ? currentUser : null);

  const [deleteEmail, setDeleteEmail] = useState();
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeToken, setRevokeToken] = useState('');

  const handleDelete = useCatch(async () => {
    if (deleteEmail === currentUser.email) {
      setDeleteFailed(false);
      await fetchOrThrow(`/api/users/${currentUser.id}`, { method: 'DELETE' });
      navigate('/login');
      dispatch(sessionActions.updateUser(null));
    } else {
      setDeleteFailed(true);
    }
  });

  const handleGenerateTotp = useCatch(async () => {
    const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
    setItem({ ...item, totpKey: await response.text() });
  });

  const closeRevokeDialog = () => {
    setRevokeDialogOpen(false);
    setRevokeToken('');
  };

  const handleRevokeToken = useCatch(async () => {
    await fetchOrThrow('/api/session/token/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: revokeToken }).toString(),
    });
    closeRevokeDialog();
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const attribute = searchParams.get('attribute');

  useEffect(() => {
    if (item && attribute) {
      if (!item.attributes.hasOwnProperty(attribute)) {
        setItem({ ...item, attributes: { ...item.attributes, [attribute]: '' } });

        const newParams = new URLSearchParams(searchParams);
        newParams.delete('attribute');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [item, searchParams, setSearchParams, attribute]);

  const onItemSaved = (result) => {
    if (result.id === currentUser.id) {
      dispatch(sessionActions.updateUser(result));
    }
  };

  // Rules shown under the fields once Save is pressed (Laravel style).
  const isNew = !item?.id;
  const accountType = (() => {
    if (item?.administrator) return 'admin';
    if ((item?.userLimit || 0) !== 0) return 'reseller';
    return 'customer';
  })();
  const errors = {};
  if (item) {
    if (!item.name?.trim()) errors.name = t('validationRequired');
    if (!item.email?.trim()) errors.email = t('validationRequired');
    if (isNew && !openIdForced && !item.password) {
      errors.password = t('validationRequired');
    } else if (item.password && item.password.length < 6) {
      errors.password = t('validationPasswordMin');
    }
    if (!admin && totpForce && !item.totpKey) errors.totpKey = t('validationRequired');
    if (accountType === 'reseller' && !(item.userLimit > 0) && item.userLimit !== -1) {
      errors.userLimit = t('validationResellerLimit');
    }
  }
  const validate = () => Boolean(item) && Object.keys(errors).length === 0;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const editingOther = Boolean(item) && item.id !== currentUser.id;
  const showAccountSection = manager && (isNew || editingOther || admin);

  const [searchType] = useState(() => new URLSearchParams(window.location.search).get('type'));
  const defaultItem = (() => {
    const base = admin ? { deviceLimit: -1 } : {};
    return searchType === 'reseller' ? { ...base, userLimit: 10 } : base;
  })();

  const setAccountType = (type) => {
    if (type === 'admin') {
      setItem({ ...item, administrator: true });
    } else if (type === 'reseller') {
      setItem({
        ...item,
        administrator: false,
        userLimit: item.userLimit > 0 ? item.userLimit : 10,
      });
    } else {
      setItem({ ...item, administrator: false, userLimit: 0 });
    }
  };

  return (
    <EditItemView
      endpoint="users"
      item={item}
      setItem={setItem}
      defaultItem={defaultItem}
      validate={validate}
      onItemSaved={onItemSaved}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'settingsUser']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t('sharedRequired')}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <ValidatedTextField
                required
                value={item.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                label={t('sharedName')}
                error={errors.name}
              />
              <ValidatedTextField
                required
                value={item.email || ''}
                onChange={(e) => setItem({ ...item, email: e.target.value })}
                label={t('userEmail')}
                helper={t('userEmailHelp')}
                disabled={fixedEmail && item.id === currentUser.id}
                error={errors.email}
              />
              {!openIdForced && (
                <ValidatedPasswordField
                  required={isNew}
                  onChange={(e) => setItem({ ...item, password: e.target.value })}
                  label={t('userPassword')}
                  helper={t(isNew ? 'userPasswordHelpNew' : 'userPasswordHelpEdit')}
                  error={errors.password}
                />
              )}
              <TextField
                value={item.phone || ''}
                onChange={(e) => setItem({ ...item, phone: e.target.value })}
                label={t('sharedPhone')}
              />
              {totpEnable && (
                <FormControl>
                  <InputLabel>{t('loginTotpKey')}</InputLabel>
                  <OutlinedInput
                    readOnly
                    label={t('loginTotpKey')}
                    value={item.totpKey || ''}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end" onClick={handleGenerateTotp}>
                          <CachedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setItem({ ...item, totpKey: null })}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              )}
            </AccordionDetails>
          </Accordion>
          {showAccountSection && (
            <Accordion>
              <AccordionSummary>
                <Typography variant="subtitle1">{t('userAccountSection')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                {admin && (isNew || editingOther) && (
                  <TextField
                    select
                    label={t('userAccountType')}
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    helperText={t(`userAccountTypeHelp_${accountType}`)}
                  >
                    <MenuItem value="customer">{t('userTypeCustomer')}</MenuItem>
                    <MenuItem value="reseller">{t('userTypeReseller')}</MenuItem>
                    <MenuItem value="admin">{t('userTypeAdmin')}</MenuItem>
                  </TextField>
                )}
                {admin && accountType === 'reseller' && (
                  <ValidatedTextField
                    required
                    type="number"
                    label={t('userCustomerLimit')}
                    value={item.userLimit ?? ''}
                    onChange={(e) => setItem({ ...item, userLimit: Number(e.target.value) })}
                    error={errors.userLimit}
                    helper={t('userCustomerLimitHelp')}
                  />
                )}
                {admin && (
                  <TextField
                    type="number"
                    value={item.deviceLimit ?? -1}
                    onChange={(e) => setItem({ ...item, deviceLimit: Number(e.target.value) })}
                    label={t('userDeviceLimit')}
                    helperText={t('userDeviceLimitHelp')}
                  />
                )}
                <TextField
                  label={t('userAccountExpiration')}
                  type="date"
                  value={item.expirationTime ? item.expirationTime.split('T')[0] : ''}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      expirationTime: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  helperText={t('userAccountExpirationHelp')}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(item.disabled)}
                      onChange={(e) => setItem({ ...item, disabled: e.target.checked })}
                    />
                  }
                  label={t('userDisabledLabel')}
                />
              </AccordionDetails>
            </Accordion>
          )}
          <Button
            variant="text"
            onClick={() => setShowAdvanced((value) => !value)}
            sx={{ alignSelf: 'flex-start', mb: 2 }}
          >
            {t(showAdvanced ? 'userHideAdvanced' : 'userShowAdvanced')}
          </Button>
          {showAdvanced && (
            <>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('sharedPreferences')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <FormControl>
                    <InputLabel>{t('mapDefault')}</InputLabel>
                    <Select
                      label={t('mapDefault')}
                      value={item.map || 'locationIqStreets'}
                      onChange={(e) => setItem({ ...item, map: e.target.value })}
                    >
                      {mapStyles
                        .filter((style) => style.available)
                        .map((style) => (
                          <MenuItem key={style.id} value={style.id}>
                            <Typography component="span">{style.title}</Typography>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsCoordinateFormat')}</InputLabel>
                    <Select
                      label={t('settingsCoordinateFormat')}
                      value={item.coordinateFormat || 'dd'}
                      onChange={(e) => setItem({ ...item, coordinateFormat: e.target.value })}
                    >
                      <MenuItem value="dd">{t('sharedDecimalDegrees')}</MenuItem>
                      <MenuItem value="ddm">{t('sharedDegreesDecimalMinutes')}</MenuItem>
                      <MenuItem value="dms">{t('sharedDegreesMinutesSeconds')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsSpeedUnit')}</InputLabel>
                    <Select
                      label={t('settingsSpeedUnit')}
                      value={(item.attributes && item.attributes.speedUnit) || 'kmh'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, speedUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="kn">{t('sharedKn')}</MenuItem>
                      <MenuItem value="kmh">{t('sharedKmh')}</MenuItem>
                      <MenuItem value="mph">{t('sharedMph')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsDistanceUnit')}</InputLabel>
                    <Select
                      label={t('settingsDistanceUnit')}
                      value={(item.attributes && item.attributes.distanceUnit) || 'km'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, distanceUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="km">{t('sharedKm')}</MenuItem>
                      <MenuItem value="mi">{t('sharedMi')}</MenuItem>
                      <MenuItem value="nmi">{t('sharedNmi')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsAltitudeUnit')}</InputLabel>
                    <Select
                      label={t('settingsAltitudeUnit')}
                      value={(item.attributes && item.attributes.altitudeUnit) || 'm'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, altitudeUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="m">{t('sharedMeters')}</MenuItem>
                      <MenuItem value="ft">{t('sharedFeet')}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>{t('settingsVolumeUnit')}</InputLabel>
                    <Select
                      label={t('settingsVolumeUnit')}
                      value={(item.attributes && item.attributes.volumeUnit) || 'ltr'}
                      onChange={(e) =>
                        setItem({
                          ...item,
                          attributes: { ...item.attributes, volumeUnit: e.target.value },
                        })
                      }
                    >
                      <MenuItem value="ltr">{t('sharedLiter')}</MenuItem>
                      <MenuItem value="usGal">{t('sharedUsGallon')}</MenuItem>
                      <MenuItem value="impGal">{t('sharedImpGallon')}</MenuItem>
                    </Select>
                  </FormControl>
                  <SelectField
                    value={item.attributes && item.attributes.timezone}
                    onChange={(e) =>
                      setItem({
                        ...item,
                        attributes: { ...item.attributes, timezone: e.target.value },
                      })
                    }
                    endpoint="/api/server/timezones"
                    keyGetter={(it) => it}
                    titleGetter={(it) => it}
                    label={t('sharedTimezone')}
                  />
                  <TextField
                    value={item.poiLayer || ''}
                    onChange={(e) => setItem({ ...item, poiLayer: e.target.value })}
                    label={t('mapPoiLayer')}
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('sharedLocation')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <TextField
                    type="number"
                    value={item.latitude || 0}
                    onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
                    label={t('positionLatitude')}
                  />
                  <TextField
                    type="number"
                    value={item.longitude || 0}
                    onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
                    label={t('positionLongitude')}
                  />
                  <TextField
                    type="number"
                    value={item.zoom || 0}
                    onChange={(e) => setItem({ ...item, zoom: Number(e.target.value) })}
                    label={t('serverZoom')}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const { lng, lat } = map.getCenter();
                      setItem({
                        ...item,
                        latitude: Number(lat.toFixed(6)),
                        longitude: Number(lng.toFixed(6)),
                        zoom: Number(map.getZoom().toFixed(1)),
                      });
                    }}
                  >
                    {t('mapCurrentLocation')}
                  </Button>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{t('sharedPermissions')}</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.details}>
                  <FormGroup>
                    {[
                      ['readonly', 'serverReadonly'],
                      ['deviceReadonly', 'userDeviceReadonly'],
                      ['limitCommands', 'userLimitCommands'],
                      ['disableReports', 'userDisableReports'],
                      ['fixedEmail', 'userFixedEmail'],
                    ].map(([key, label]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={Boolean(item[key])}
                            onChange={(e) => setItem({ ...item, [key]: e.target.checked })}
                          />
                        }
                        label={t(label)}
                        disabled={!manager}
                      />
                    ))}
                  </FormGroup>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setRevokeDialogOpen(true)}
                  >
                    {t('userRevokeToken')}
                  </Button>
                </AccordionDetails>
              </Accordion>
              <EditAttributesAccordion
                attribute={attribute}
                attributes={item.attributes}
                setAttributes={(attributes) => setItem({ ...item, attributes })}
                definitions={{ ...commonUserAttributes, ...userAttributes }}
                focusAttribute={attribute}
              />
            </>
          )}
          {registrationEnabled && item.id === currentUser.id && !manager && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color="error">
                  {t('userDeleteAccount')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  label={t('userEmail')}
                  error={deleteFailed}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<DeleteForeverIcon />}
                >
                  {t('userDeleteAccount')}
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
      <Dialog open={revokeDialogOpen} onClose={closeRevokeDialog} fullWidth maxWidth="xs">
        <DialogContent className={classes.details}>
          <TextField
            value={revokeToken}
            onChange={(e) => setRevokeToken(e.target.value)}
            label={t('userToken')}
            autoFocus
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRevokeDialog}>{t('sharedCancel')}</Button>
          <Button onClick={handleRevokeToken} disabled={!revokeToken} variant="contained">
            {t('userRevokeToken')}
          </Button>
        </DialogActions>
      </Dialog>
    </EditItemView>
  );
};

export default UserPage;
