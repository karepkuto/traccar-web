import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAsyncTask } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import exportExcel from '../common/util/exportExcel';
import { useTranslation } from '../common/components/LocalizationProvider';
import useSettingsStyles from '../settings/common/useSettingsStyles';
import TableShimmer from '../common/components/TableShimmer';
import {
  BILLING_ATTRIBUTES,
  BILLING_STATUS,
  formatRupiah,
  getBillingThresholds,
  getRemainingDays,
} from './billingLogic';
import { billingStatusLabel, deviceBillingStatus } from './billingFormat';
import { fetchUserDevices } from './billingService';
import BillingStatusChip from './BillingStatusChip';
import useBillingTranslation from './useBillingTranslation';

const DUE_DAYS = 30;

const Stat = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 1.5, flex: '1 1 140px' }}>
    <Typography variant="caption" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Paper>
);

// Per-reseller recap for the wholesale bill: resellers pay per device.
const ResellerRecap = ({ resellers }) => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const bt = useBillingTranslation();
  const t = useTranslation();
  const server = useSelector((state) => state.session.server);
  const thresholds = useMemo(() => getBillingThresholds(server), [server]);

  const [resellerId, setResellerId] = useState('');
  const [devices, setDevices] = useState(null);
  const [onlyDue, setOnlyDue] = useState(true);

  useAsyncTask(
    async ({ signal }) => {
      setDevices(null);
      if (resellerId) {
        setDevices(await fetchUserDevices(resellerId, { signal }));
      }
    },
    [resellerId],
  );

  const enriched = useMemo(
    () =>
      (devices || [])
        .map((device) => {
          const status = deviceBillingStatus(device, thresholds);
          const days = getRemainingDays(device.expirationTime);
          const due =
            status === BILLING_STATUS.EXPIRED ||
            status === BILLING_STATUS.TRIAL ||
            (days !== null && days <= DUE_DAYS);
          return {
            device,
            status,
            due,
            price: Number(device.attributes?.[BILLING_ATTRIBUTES.price]) || 0,
          };
        })
        .sort((a, b) =>
          (a.device.expirationTime || '').localeCompare(b.device.expirationTime || ''),
        ),
    [devices, thresholds],
  );

  const dueRows = enriched.filter((row) => row.due);
  const shown = onlyDue ? dueRows : enriched;
  const estimate = dueRows.reduce((sum, row) => sum + row.price, 0);
  const withoutPrice = dueRows.filter((row) => !row.price).length;
  const trialCount = enriched.filter((row) => row.status === BILLING_STATUS.TRIAL).length;

  const handleExport = async () => {
    const name = resellers.find((it) => it.id === resellerId)?.name || '';
    const data = shown.map((row) => ({
      [bt('billingRecapReseller')]: name,
      [t('sharedName')]: row.device.name,
      [t('deviceIdentifier')]: row.device.uniqueId,
      [bt('billingStatus')]: billingStatusLabel(bt, row.status, row.device),
      [bt('billingCurrentExpiration')]: formatTime(row.device.expirationTime, 'date'),
      [bt('billingPrice')]: row.price || '',
    }));
    const sheets = new Map();
    sheets.set(bt('billingRecapTab'), data);
    await exportExcel(bt('billingRecapTab'), `rekap-${name || 'reseller'}.xlsx`, sheets, theme);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        select
        size="small"
        label={bt('billingRecapReseller')}
        value={resellerId}
        onChange={(e) => setResellerId(e.target.value)}
        sx={{ maxWidth: 360 }}
      >
        {resellers.map((reseller) => (
          <MenuItem key={reseller.id} value={reseller.id}>
            {reseller.name}
          </MenuItem>
        ))}
      </TextField>
      {!resellerId && <Typography color="textSecondary">{bt('billingRecapChoose')}</Typography>}
      {resellerId && (
        <>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Stat label={bt('billingRecapDevices')} value={devices ? enriched.length : '…'} />
            <Stat label={bt('billingRecapTrial')} value={devices ? trialCount : '…'} />
            <Stat
              label={bt('billingRecapDue', { n: DUE_DAYS })}
              value={devices ? dueRows.length : '…'}
            />
            <Stat
              label={bt('billingRecapEstimate')}
              value={devices ? formatRupiah(estimate) : '…'}
            />
          </Box>
          {withoutPrice > 0 && (
            <Typography variant="body2" color="warning.main">
              {bt('billingRecapNoPrice', { n: withoutPrice })}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Switch checked={onlyDue} onChange={(e) => setOnlyDue(e.target.checked)} />}
              label={bt('billingRecapOnlyDue', { n: DUE_DAYS })}
            />
            <Button variant="outlined" onClick={handleExport} disabled={!shown.length}>
              {t('reportExport')}
            </Button>
          </Box>
          <div style={{ overflowX: 'auto' }}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('deviceIdentifier')}</TableCell>
                  <TableCell>{bt('billingStatus')}</TableCell>
                  <TableCell>{bt('billingCurrentExpiration')}</TableCell>
                  <TableCell align="right">{bt('billingPrice')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!devices && <TableShimmer columns={5} />}
                {shown.map((row) => (
                  <TableRow key={row.device.id}>
                    <TableCell>{row.device.name}</TableCell>
                    <TableCell>{row.device.uniqueId}</TableCell>
                    <TableCell>
                      <BillingStatusChip device={row.device} />
                    </TableCell>
                    <TableCell>{formatTime(row.device.expirationTime, 'date') || '-'}</TableCell>
                    <TableCell align="right">{row.price ? formatRupiah(row.price) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Box>
  );
};

export default ResellerRecap;
