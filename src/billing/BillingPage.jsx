import { useMemo, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import { useTheme } from '@mui/material/styles';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from '../settings/components/SettingsMenu';
import TableShimmer from '../common/components/TableShimmer';
import useSettingsStyles from '../settings/common/useSettingsStyles';
import { useAsyncTask } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useAdministrator } from '../common/util/permissions';
import exportExcel from '../common/util/exportExcel';
import {
  BILLING_ATTRIBUTES,
  BILLING_STATUS,
  formatDateId,
  formatRupiah,
  getBillingStatus,
  getBillingThresholds,
  getRemainingDays,
  parseBilledTo,
  parseHistory,
} from './billingLogic';
import { fetchBillingDevices, fetchResellers } from './billingService';
import BillingStatusChip, { statusLabelKey } from './BillingStatusChip';
import ExtendDialog from './ExtendDialog';
import useBillingTranslation from './useBillingTranslation';
import { useTranslation } from '../common/components/LocalizationProvider';

const statusOrder = [
  BILLING_STATUS.EXPIRED,
  BILLING_STATUS.CRITICAL,
  BILLING_STATUS.WARNING,
  BILLING_STATUS.ACTIVE,
  BILLING_STATUS.UNSET,
];

const BillingPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const bt = useBillingTranslation();
  const t = useTranslation();

  const admin = useAdministrator();
  const sessionUser = useSelector((state) => state.session.user);
  const server = useSelector((state) => state.session.server);
  const thresholds = useMemo(() => getBillingThresholds(server), [server]);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('devices');
  const [historyDeviceId, setHistoryDeviceId] = useState(null);
  const [resellers, setResellers] = useState([]);

  useAsyncTask(
    async ({ signal }) => {
      if (admin) {
        setResellers(await fetchResellers({ signal }));
      }
    },
    [admin],
  );

  const resellerNames = useMemo(() => {
    const map = { [sessionUser.id]: sessionUser.name };
    resellers.forEach((reseller) => {
      map[reseller.id] = reseller.name;
    });
    return map;
  }, [resellers, sessionUser]);

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setLoading(true);
      setError(null);
      try {
        setItems(await fetchBillingDevices({ all: admin, signal }));
      } catch (e) {
        if (!signal.aborted) {
          setError(e.message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [reloadKey, admin],
  );

  const rows = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return items
      .map((item) => ({
        ...item,
        billingStatus: getBillingStatus(item.expirationTime, thresholds),
      }))
      .filter((item) => statusFilter === 'all' || item.billingStatus === statusFilter)
      .filter(
        (item) =>
          !lower ||
          item.name?.toLowerCase().includes(lower) ||
          item.uniqueId?.toLowerCase().includes(lower) ||
          item.attributes?.[BILLING_ATTRIBUTES.billedTo]?.toLowerCase().includes(lower),
      )
      .sort((a, b) => {
        const order = statusOrder.indexOf(a.billingStatus) - statusOrder.indexOf(b.billingStatus);
        if (order !== 0) {
          return order;
        }
        return (a.expirationTime || '').localeCompare(b.expirationTime || '');
      });
  }, [items, keyword, statusFilter, thresholds]);

  const formatBilledTo = (value) => {
    if (!value) {
      return '';
    }
    const billedTo = parseBilledTo(value);
    if (billedTo.type === 'direct') {
      return bt('billingBilledToDirect');
    }
    const name = billedTo.id ? resellerNames[billedTo.id] || `#${billedTo.id}` : billedTo.name;
    return `${bt('billingBilledToReseller')}: ${name}`;
  };

  const unitLabel = (count, unit) =>
    `${count} ${bt(unit === 'year' ? 'billingUnitYear' : 'billingUnitMonth')}`;

  const historyRows = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return items
      .filter((item) => !historyDeviceId || item.id === historyDeviceId)
      .flatMap((item) =>
        parseHistory(item.attributes).map((entry, index) => ({
          key: `${item.id}-${index}`,
          device: item,
          ...entry,
        })),
      )
      .filter(
        (row) =>
          !lower ||
          row.device.name?.toLowerCase().includes(lower) ||
          row.device.uniqueId?.toLowerCase().includes(lower) ||
          String(row.r || '')
            .toLowerCase()
            .includes(lower),
      )
      .sort((a, b) => String(b.t || '').localeCompare(String(a.t || '')));
  }, [items, historyDeviceId, keyword]);

  const historyTotal = historyRows.reduce((sum, row) => sum + (Number(row.a) || 0), 0);

  const handleExportHistory = async () => {
    const data = historyRows.map((row) => ({
      [bt('billingPaidAt')]: formatTime(row.t, 'minutes'),
      [bt('billingDevice')]: row.device.name,
      [t('deviceIdentifier')]: row.device.uniqueId,
      [bt('billingStartDate')]: row.s || '',
      [bt('billingEndDate')]: row.e || '',
      [bt('billingDuration')]: row.n ? unitLabel(row.n, row.u) : '',
      [bt('billingAmount')]: Number(row.a) || 0,
      [bt('billingPrice')]: row.p ?? '',
      [bt('billingReference')]: row.r || '',
      [bt('billingBilledTo')]: formatBilledTo(row.b),
      [bt('billingRecordedBy')]: row.by || '',
    }));
    const sheets = new Map();
    sheets.set(bt('billingHistoryTab'), data);
    await exportExcel(bt('billingHistoryTab'), 'riwayat-pembayaran.xlsx', sheets, theme);
  };

  const showHistory = (deviceId) => {
    setHistoryDeviceId(deviceId);
    setTab('history');
  };

  const handleExport = async () => {
    const data = rows.map((item) => ({
      [t('sharedName')]: item.name,
      [t('deviceIdentifier')]: item.uniqueId,
      [bt('billingStatus')]: bt(statusLabelKey(item.billingStatus)),
      [bt('billingCurrentExpiration')]: formatTime(item.expirationTime, 'date'),
      [bt('billingRemaining')]: getRemainingDays(item.expirationTime),
      [bt('billingBilledTo')]: formatBilledTo(item.attributes?.[BILLING_ATTRIBUTES.billedTo]),
      [bt('billingPrice')]: Number(item.attributes?.[BILLING_ATTRIBUTES.price]) || '',
      [bt('billingLastPaid')]: formatTime(item.attributes?.[BILLING_ATTRIBUTES.lastPaidAt], 'date'),
      [bt('billingAmount')]: Number(item.attributes?.[BILLING_ATTRIBUTES.lastPaidAmount]) || '',
      [bt('billingReference')]: item.attributes?.[BILLING_ATTRIBUTES.lastPaidReference],
    }));
    const sheets = new Map();
    sheets.set(bt('billingTitle'), data);
    await exportExcel(bt('billingTitle'), 'billing.xlsx', sheets, theme);
  };

  const columns = 8;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'userBilling']}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
        <TextField
          size="small"
          placeholder={t('sharedSearch')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <TextField
          size="small"
          select
          label={bt('billingStatus')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">{bt('billingAll')}</MenuItem>
          {statusOrder.map((status) => (
            <MenuItem key={status} value={status}>
              {bt(statusLabelKey(status))}
            </MenuItem>
          ))}
        </TextField>
      </Toolbar>
      {!admin && <Alert severity="info">{bt('billingReadonlyNote')}</Alert>}
      <Alert severity="warning">{bt('billingLockNote')}</Alert>
      {error && <Alert severity="error">{error}</Alert>}
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2 }}>
        <Tab value="devices" label={bt('billingDevicesTab')} />
        <Tab value="history" label={bt('billingHistoryTab')} />
      </Tabs>
      {tab === 'devices' && (
        <div style={{ overflowX: 'auto' }}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t('sharedName')}</TableCell>
                <TableCell>{t('deviceIdentifier')}</TableCell>
                <TableCell>{bt('billingStatus')}</TableCell>
                <TableCell>{bt('billingCurrentExpiration')}</TableCell>
                <TableCell>{bt('billingBilledTo')}</TableCell>
                <TableCell>{bt('billingPrice')}</TableCell>
                <TableCell>{bt('billingLastPaid')}</TableCell>
                <TableCell className={classes.columnAction} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableShimmer columns={columns} />
              ) : (
                rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.uniqueId}</TableCell>
                    <TableCell>
                      <BillingStatusChip expirationTime={item.expirationTime} />
                    </TableCell>
                    <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                    <TableCell>
                      {formatBilledTo(item.attributes?.[BILLING_ATTRIBUTES.billedTo])}
                    </TableCell>
                    <TableCell>
                      {item.attributes?.[BILLING_ATTRIBUTES.price]
                        ? formatRupiah(item.attributes[BILLING_ATTRIBUTES.price])
                        : ''}
                    </TableCell>
                    <TableCell>
                      {formatTime(item.attributes?.[BILLING_ATTRIBUTES.lastPaidAt], 'date')}
                      {item.attributes?.[BILLING_ATTRIBUTES.lastPaidAmount] != null &&
                        ` (${formatRupiah(item.attributes[BILLING_ATTRIBUTES.lastPaidAmount])})`}
                    </TableCell>
                    <TableCell className={classes.columnAction} padding="none">
                      <div style={{ display: 'flex' }}>
                        <Tooltip title={bt('billingHistory')}>
                          <IconButton size="small" onClick={() => showHistory(item.id)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {admin && (
                          <Tooltip title={bt('billingExtend')}>
                            <IconButton size="small" onClick={() => setSelected(item)}>
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns}>
                  <Button onClick={handleExport} variant="text" disabled={rows.length === 0}>
                    {t('reportExport')}
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
      {tab === 'history' && (
        <>
          <Alert severity="info">{bt('billingHistoryNote')}</Alert>
          {historyDeviceId && (
            <div style={{ padding: '8px 16px' }}>
              <Chip
                label={`${bt('billingDevice')}: ${
                  items.find((item) => item.id === historyDeviceId)?.name || historyDeviceId
                }`}
                onDelete={() => setHistoryDeviceId(null)}
              />
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>{bt('billingPaidAt')}</TableCell>
                  <TableCell>{bt('billingDevice')}</TableCell>
                  <TableCell>{bt('billingPeriod')}</TableCell>
                  <TableCell>{bt('billingDuration')}</TableCell>
                  <TableCell align="right">{bt('billingAmount')}</TableCell>
                  <TableCell>{bt('billingReference')}</TableCell>
                  <TableCell>{bt('billingBilledTo')}</TableCell>
                  <TableCell>{bt('billingRecordedBy')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && <TableShimmer columns={8} />}
                {!loading && historyRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>{bt('billingNoHistory')}</TableCell>
                  </TableRow>
                )}
                {!loading &&
                  historyRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{formatTime(row.t, 'minutes')}</TableCell>
                      <TableCell>{row.device.name}</TableCell>
                      <TableCell>
                        {row.s ? `${formatDateId(row.s)} – ${formatDateId(row.e)}` : '-'}
                      </TableCell>
                      <TableCell>{row.n ? unitLabel(row.n, row.u) : '-'}</TableCell>
                      <TableCell align="right">{formatRupiah(row.a)}</TableCell>
                      <TableCell>{row.r || '-'}</TableCell>
                      <TableCell>{formatBilledTo(row.b)}</TableCell>
                      <TableCell>{row.by || '-'}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Button
                      onClick={handleExportHistory}
                      variant="text"
                      disabled={historyRows.length === 0}
                    >
                      {t('reportExport')}
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <b>
                      {bt('billingTotalPaid')}: {formatRupiah(historyTotal)}
                    </b>
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </>
      )}
      {selected && (
        <ExtendDialog
          device={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null);
            setSaved(true);
            reload();
          }}
        />
      )}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message={bt('billingSaved')}
      />
    </PageLayout>
  );
};

export default BillingPage;
