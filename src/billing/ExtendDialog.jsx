import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { formatTime } from '../common/util/formatter';
import { useAsyncTask } from '../reactHelper';
import {
  BILLING_ATTRIBUTES,
  BILLING_UNITS,
  defaultStartDate,
  expirationFromEndDate,
  formatDateId,
  formatRupiah,
  parseBilledTo,
  periodEndDate,
} from './billingLogic';
import { fetchResellers, recordPaymentAndExtend } from './billingService';
import RupiahField from './RupiahField';
import useBillingTranslation from './useBillingTranslation';

const MAX_PERIODS = 120;

const ExtendDialog = ({ device, onClose, onSaved }) => {
  const bt = useBillingTranslation();
  const user = useSelector((state) => state.session.user);

  const attributes = device.attributes || {};
  const initialBilledTo = parseBilledTo(attributes[BILLING_ATTRIBUTES.billedTo]);
  const storedPrice = Number(attributes[BILLING_ATTRIBUTES.price]);

  const [periods, setPeriods] = useState('1');
  const [unit, setUnit] = useState(
    BILLING_UNITS.includes(attributes[BILLING_ATTRIBUTES.plan])
      ? attributes[BILLING_ATTRIBUTES.plan]
      : 'month',
  );
  const [startDate, setStartDate] = useState(() => defaultStartDate(device.expirationTime));
  const [price, setPrice] = useState(storedPrice > 0 ? storedPrice : null);
  const [amount, setAmount] = useState(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const [reference, setReference] = useState('');
  const [billedToType, setBilledToType] = useState(initialBilledTo.type);
  const [resellerId, setResellerId] = useState(initialBilledTo.id || '');
  const [resellers, setResellers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useAsyncTask(async ({ signal }) => {
    setResellers(await fetchResellers({ signal }));
  }, []);

  const periodCount = Number(periods);
  const validPeriods = /^\d+$/.test(periods) && periodCount >= 1 && periodCount <= MAX_PERIODS;
  const endDate = validPeriods ? periodEndDate(startDate, periodCount, unit) : null;
  const newExpiration = endDate ? expirationFromEndDate(endDate) : null;

  const suggestedAmount = price && validPeriods ? price * periodCount : null;
  const effectiveAmount = amountTouched ? amount : (amount ?? suggestedAmount);

  const endInPast = newExpiration && !newExpiration.isAfter(dayjs());
  const shorter =
    newExpiration && device.expirationTime && newExpiration.isBefore(dayjs(device.expirationTime));
  const legacyReseller = billedToType === 'reseller' && !resellerId && initialBilledTo.name;

  const problems = useMemo(() => {
    const list = [];
    if (!validPeriods) list.push(bt('billingErrorPeriods', { max: MAX_PERIODS }));
    if (!startDate || !endDate) list.push(bt('billingErrorStart'));
    if (!effectiveAmount || effectiveAmount <= 0) list.push(bt('billingErrorAmount'));
    if (billedToType === 'reseller' && !resellerId) list.push(bt('billingErrorReseller'));
    if (endInPast) list.push(bt('billingErrorEndInPast'));
    return list;
  }, [validPeriods, startDate, endDate, effectiveAmount, billedToType, resellerId, endInPast, bt]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await recordPaymentAndExtend(device.id, {
        startDate,
        endDate,
        periods: periodCount,
        unit,
        amount: effectiveAmount,
        price,
        reference: reference.trim(),
        billedTo: billedToType === 'reseller' ? `reseller:${resellerId}` : 'direct',
        paidBy: user.email || user.name,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {bt('billingExtend')}: {device.name}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            {bt('billingCurrentExpiration')}: {formatTime(device.expirationTime, 'date') || '-'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label={bt('billingPeriods')}
              value={periods}
              onChange={(e) => setPeriods(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
              error={!validPeriods}
              fullWidth
            />
            <TextField
              select
              label={bt('billingUnit')}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              fullWidth
            >
              <MenuItem value="month">{bt('billingUnitMonth')}</MenuItem>
              <MenuItem value="year">{bt('billingUnitYear')}</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label={bt('billingStartDate')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label={bt('billingEndDate')}
              type="date"
              value={endDate || ''}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { readOnly: true } }}
              helperText={bt('billingAuto')}
              fullWidth
            />
          </Stack>
          <RupiahField
            label={bt('billingPrice')}
            value={price}
            onChange={setPrice}
            helperText={bt('billingPriceHelp')}
          />
          <RupiahField
            label={bt('billingAmount')}
            value={effectiveAmount}
            onChange={(value) => {
              setAmountTouched(true);
              setAmount(value);
            }}
            error={!effectiveAmount}
            helperText={
              suggestedAmount && effectiveAmount !== suggestedAmount
                ? `${bt('billingTotalByPrice')}: ${formatRupiah(suggestedAmount)}`
                : bt('billingAmountHelp')
            }
            required
          />
          <TextField
            label={bt('billingReference')}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            helperText={bt('billingReferenceHelp')}
            slotProps={{ htmlInput: { maxLength: 60 } }}
          />
          <TextField
            select
            label={bt('billingBilledTo')}
            value={billedToType}
            onChange={(e) => setBilledToType(e.target.value)}
          >
            <MenuItem value="direct">{bt('billingBilledToDirect')}</MenuItem>
            <MenuItem value="reseller">{bt('billingBilledToReseller')}</MenuItem>
          </TextField>
          {billedToType === 'reseller' && (
            <TextField
              select
              label={bt('billingSelectReseller')}
              value={resellerId}
              onChange={(e) => setResellerId(e.target.value)}
              error={!resellerId}
              helperText={
                legacyReseller
                  ? `${bt('billingLegacyReseller')}: "${initialBilledTo.name}"`
                  : resellers.length === 0
                    ? bt('billingNoResellers')
                    : undefined
              }
            >
              {resellers.map((reseller) => (
                <MenuItem key={reseller.id} value={reseller.id}>
                  {reseller.name} ({reseller.email})
                </MenuItem>
              ))}
            </TextField>
          )}
          {newExpiration && !endInPast && (
            <Alert severity="info">
              {bt('billingActiveUntil')}: <b>{formatDateId(endDate)} 23:59 WIB</b>
              <br />
              {bt('billingPeriod')}: {formatDateId(startDate)} – {formatDateId(endDate)}
            </Alert>
          )}
          {shorter && !endInPast && <Alert severity="warning">{bt('billingWarnShorter')}</Alert>}
          {problems.length > 0 && (
            <Alert severity="error">
              {problems.map((problem) => (
                <div key={problem}>{problem}</div>
              ))}
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {bt('billingCancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || problems.length > 0}>
          {bt('billingSave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendDialog;
