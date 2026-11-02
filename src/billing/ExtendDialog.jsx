import { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { BILLING_ATTRIBUTES, BILLING_UNITS, calculateNewExpiration } from './billingLogic';
import { recordPaymentAndExtend } from './billingService';
import useBillingTranslation from './useBillingTranslation';

const parseBilledTo = (value) => {
  if (value && value.startsWith('reseller:')) {
    return { type: 'reseller', name: value.slice('reseller:'.length) };
  }
  return { type: 'direct', name: '' };
};

const ExtendDialog = ({ device, onClose, onSaved }) => {
  const bt = useBillingTranslation();
  const user = useSelector((state) => state.session.user);

  const attributes = device.attributes || {};
  const initialBilledTo = parseBilledTo(attributes[BILLING_ATTRIBUTES.billedTo]);

  const [periods, setPeriods] = useState(1);
  const [unit, setUnit] = useState(
    BILLING_UNITS.includes(attributes[BILLING_ATTRIBUTES.plan])
      ? attributes[BILLING_ATTRIBUTES.plan]
      : 'month',
  );
  const [price, setPrice] = useState(attributes[BILLING_ATTRIBUTES.price] ?? '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [billedToType, setBilledToType] = useState(initialBilledTo.type);
  const [resellerName, setResellerName] = useState(initialBilledTo.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const validPeriods = Number.isInteger(Number(periods)) && Number(periods) >= 1;
  const preview = validPeriods
    ? calculateNewExpiration(device.expirationTime, periods, unit).toISOString()
    : null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await recordPaymentAndExtend(device.id, {
        periods: Number(periods),
        unit,
        amount,
        price,
        reference,
        plan: unit,
        billedTo: billedToType === 'reseller' ? `reseller:${resellerName.trim()}` : 'direct',
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
              type="number"
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
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
          <TextField
            label={bt('billingPrice')}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            label={bt('billingAmount')}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={
              price !== '' && validPeriods ? `${Number(price) * Number(periods)}` : undefined
            }
          />
          <TextField
            label={bt('billingReference')}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
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
              label={bt('billingBilledToReseller')}
              value={resellerName}
              onChange={(e) => setResellerName(e.target.value)}
            />
          )}
          {preview && (
            <Alert severity="info">
              {bt('billingNewExpiration')}: {formatTime(preview, 'date')}
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {bt('billingCancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={
            saving || !validPeriods || (billedToType === 'reseller' && !resellerName.trim())
          }
        >
          {bt('billingSave')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendDialog;
