import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAsyncTask, useCatch } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import { isCustomer } from '../../common/util/ownership';
import { formatTime } from '../../common/util/formatter';
import { isGrantActive, parseGrants, saveGrants } from '../../common/util/impersonation';

const PRESETS = [
  { hours: 2, key: 'grant2h' },
  { hours: 24, key: 'share24h' },
  { hours: 72, key: 'share3d' },
];

const inputFormat = (value) => value.locale('en').format('YYYY-MM-DDTHH:mm');

// Administrator: allow one reseller to impersonate chosen customers until a
// date, and revoke those permissions.
const ImpersonationGrantsDialog = ({ reseller, onClose }) => {
  const theme = useTheme();
  const t = useTranslation();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [customers, setCustomers] = useState([]);
  const [grants, setGrants] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [until, setUntil] = useState(() => inputFormat(dayjs().add(24, 'hour')));
  const [hours, setHours] = useState(24);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useAsyncTask(
    async ({ signal }) => {
      const [managed, fresh] = await Promise.all([
        fetchOrThrow(`/api/users?userId=${reseller.id}&excludeAttributes=true`, { signal }).then(
          (r) => r.json(),
        ),
        fetchOrThrow(`/api/users/${reseller.id}`, { signal }).then((r) => r.json()),
      ]);
      setCustomers(managed.filter(isCustomer));
      setGrants(parseGrants(fresh).filter((grant) => isGrantActive(grant)));
    },
    [reseller.id],
  );

  const nameOf = (id) => customers.find((c) => c.id === id)?.name || `#${id}`;

  const persist = useCatch(async (next) => {
    setSaving(true);
    try {
      setGrants(await saveGrants(reseller.id, next));
    } finally {
      setSaving(false);
    }
  });

  const handleAdd = () => {
    const others = grants.filter((grant) => grant.customerId !== customerId);
    persist([
      ...others,
      {
        customerId,
        until: dayjs(until).toISOString(),
        reason: reason.trim() || undefined,
        at: new Date().toISOString(),
      },
    ]);
    setCustomerId('');
    setReason('');
  };

  const valid = customerId && dayjs(until).isAfter(dayjs());

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={phone}>
      <DialogTitle>
        {t('grantTitle')}: {reseller.name}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="info">{t('grantInfo')}</Alert>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('grantActive')}
          </Typography>
          {grants === null && <Typography color="textSecondary">…</Typography>}
          {grants?.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {t('grantNone')}
            </Typography>
          )}
          {grants?.map((grant) => (
            <Box
              key={grant.customerId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {nameOf(grant.customerId)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('shareUntil')}: {formatTime(grant.until, 'minutes')}
                  {grant.reason ? ` · ${grant.reason}` : ''}
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                disabled={saving}
                onClick={() => persist(grants.filter((it) => it.customerId !== grant.customerId))}
              >
                {t('shareRevoke')}
              </Button>
            </Box>
          ))}
        </Box>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            {t('grantAdd')}
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              select
              label={t('userTypeCustomer')}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.length === 0 && <MenuItem disabled>{t('transferNoCustomers')}</MenuItem>}
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {PRESETS.map((preset) => (
                <Chip
                  key={preset.hours}
                  label={t(preset.key)}
                  color={hours === preset.hours ? 'primary' : 'default'}
                  variant={hours === preset.hours ? 'filled' : 'outlined'}
                  onClick={() => {
                    setHours(preset.hours);
                    setUntil(inputFormat(dayjs().add(preset.hours, 'hour')));
                  }}
                />
              ))}
            </Stack>
            <TextField
              type="datetime-local"
              label={t('shareUntil')}
              value={until}
              onChange={(e) => {
                setHours(null);
                setUntil(e.target.value);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t('grantReason')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('grantReasonHint')}
            />
            <Button variant="contained" onClick={handleAdd} disabled={!valid || saving}>
              {t('grantGive')}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t('transferClose')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImpersonationGrantsDialog;
