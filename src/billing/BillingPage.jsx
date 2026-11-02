import { useMemo, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
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
  getBillingStatus,
  getBillingThresholds,
  getRemainingDays,
} from './billingLogic';
import { fetchBillingDevices } from './billingService';
import BillingStatusChip, { statusLabelKey } from './BillingStatusChip';
import ExtendDialog from './ExtendDialog';
import useBillingTranslation from './useBillingTranslation';

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

  const admin = useAdministrator();
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
    if (value === 'direct') {
      return bt('billingBilledToDirect');
    }
    return value.replace(/^reseller:/, `${bt('billingBilledToReseller')}: `);
  };

  const handleExport = async () => {
    const data = rows.map((item) => ({
      Name: item.name,
      Identifier: item.uniqueId,
      [bt('billingStatus')]: bt(statusLabelKey(item.billingStatus)),
      [bt('billingCurrentExpiration')]: formatTime(item.expirationTime, 'date'),
      [bt('billingRemaining')]: getRemainingDays(item.expirationTime),
      [bt('billingBilledTo')]: formatBilledTo(item.attributes?.[BILLING_ATTRIBUTES.billedTo]),
      [bt('billingPrice')]: item.attributes?.[BILLING_ATTRIBUTES.price],
      [bt('billingLastPaid')]: formatTime(item.attributes?.[BILLING_ATTRIBUTES.lastPaidAt], 'date'),
      [bt('billingAmount')]: item.attributes?.[BILLING_ATTRIBUTES.lastPaidAmount],
      [bt('billingReference')]: item.attributes?.[BILLING_ATTRIBUTES.lastPaidReference],
    }));
    const sheets = new Map();
    sheets.set(bt('billingTitle'), data);
    await exportExcel(bt('billingTitle'), 'billing.xlsx', sheets, theme);
  };

  const columns = admin ? 8 : 7;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'userBilling']}>
      <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1 }}>
        <TextField
          size="small"
          placeholder="Search"
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
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Identifier</TableCell>
            <TableCell>{bt('billingStatus')}</TableCell>
            <TableCell>{bt('billingCurrentExpiration')}</TableCell>
            <TableCell>{bt('billingBilledTo')}</TableCell>
            <TableCell>{bt('billingPrice')}</TableCell>
            <TableCell>{bt('billingLastPaid')}</TableCell>
            {admin && <TableCell className={classes.columnAction} />}
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
                <TableCell>{item.attributes?.[BILLING_ATTRIBUTES.price]}</TableCell>
                <TableCell>
                  {formatTime(item.attributes?.[BILLING_ATTRIBUTES.lastPaidAt], 'date')}
                  {item.attributes?.[BILLING_ATTRIBUTES.lastPaidAmount] != null &&
                    ` (${item.attributes[BILLING_ATTRIBUTES.lastPaidAmount]})`}
                </TableCell>
                {admin && (
                  <TableCell className={classes.columnAction} padding="none">
                    <Tooltip title={bt('billingExtend')}>
                      <IconButton size="small" onClick={() => setSelected(item)}>
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns}>
              <Button onClick={handleExport} variant="text" disabled={rows.length === 0}>
                Export
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
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
