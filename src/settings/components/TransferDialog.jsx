import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAsyncTask, useCatch } from '../../reactHelper';
import { findOtherResellers, isReseller } from '../../common/util/ownership';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import {
  fetchManagedCustomers,
  fetchStockDeviceIds,
  transferCustomers,
} from '../../common/util/transfer';

const DIRECT = 'direct';

// Move customers (with their devices) to another reseller or to the admin.
// source: { reseller } to move a reseller's customers, or { customer }.
const TransferDialog = ({ source, onClose, onDone }) => {
  const theme = useTheme();
  const t = useTranslation();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [resellers, setResellers] = useState([]);
  const [customers, setCustomers] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [stockCount, setStockCount] = useState(0);
  const [includeStock, setIncludeStock] = useState(true);
  const [fromId, setFromId] = useState(source.reseller?.id ?? null);
  const [fromName, setFromName] = useState(source.reseller?.name ?? null);
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useAsyncTask(
    async ({ signal }) => {
      const users = await (
        await fetchOrThrow('/api/users?excludeAttributes=true', { signal })
      ).json();
      setResellers(
        users.filter(isReseller).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
      );
      if (source.reseller) {
        const list = await fetchManagedCustomers(source.reseller.id);
        setCustomers(list);
        setSelected(new Set(list.map((c) => c.id)));
        setStockCount((await fetchStockDeviceIds(source.reseller.id)).size);
      } else {
        const current = await findOtherResellers({ customerId: source.customer.id });
        setFromId(current[0]?.id ?? null);
        setFromName(current[0]?.name ?? null);
        setCustomers([source.customer]);
        setSelected(new Set([source.customer.id]));
      }
    },
    [source],
  );

  const targets = useMemo(
    () => resellers.filter((reseller) => reseller.id !== fromId),
    [resellers, fromId],
  );

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const targetName =
    target === DIRECT ? t('transferDirect') : targets.find((it) => it.id === target)?.name;

  const handleTransfer = useCatch(async () => {
    setRunning(true);
    try {
      setResult(
        await transferCustomers({
          fromId,
          toId: target === DIRECT ? null : target,
          customerIds: [...selected],
          includeStock: Boolean(source.reseller) && includeStock,
        }),
      );
      onDone?.();
    } finally {
      setRunning(false);
    }
  });

  const nothingToMove = !selected.size && !(source.reseller && includeStock && stockCount);

  return (
    <Dialog open onClose={running ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={phone}>
      <DialogTitle>{t('transferTitle')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {result ? (
          <Alert severity="success">
            {t('transferDone')
              .replace('{customers}', result.customers)
              .replace('{devices}', result.devices)
              .replace('{target}', targetName)}
          </Alert>
        ) : (
          <>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="textSecondary">
                {t('transferFrom')}
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {customers ? fromName || t('transferDirect') : '…'}
              </Typography>
            </Box>
            {!customers && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
            {customers && source.reseller && (
              <>
                {customers.length === 0 ? (
                  <Typography color="textSecondary">{t('transferNoCustomers')}</Typography>
                ) : (
                  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <ListItemButton
                      dense
                      onClick={() =>
                        setSelected(
                          selected.size === customers.length
                            ? new Set()
                            : new Set(customers.map((c) => c.id)),
                        )
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          size="small"
                          checked={selected.size === customers.length}
                          indeterminate={selected.size > 0 && selected.size < customers.length}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('transferSelectAll').replace('{n}', customers.length)}
                        slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                      />
                    </ListItemButton>
                    <List dense disablePadding sx={{ maxHeight: 260, overflowY: 'auto' }}>
                      {customers.map((customer) => (
                        <ListItem key={customer.id} disablePadding>
                          <ListItemButton dense onClick={() => toggle(customer.id)}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Checkbox
                                edge="start"
                                size="small"
                                checked={selected.has(customer.id)}
                              />
                            </ListItemIcon>
                            <ListItemText primary={customer.name} secondary={customer.email} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                {stockCount > 0 && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeStock}
                        onChange={(e) => setIncludeStock(e.target.checked)}
                      />
                    }
                    label={t('transferStock').replace('{n}', stockCount)}
                  />
                )}
              </>
            )}
            {customers && source.customer && (
              <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5 }}>
                <Typography variant="caption" color="textSecondary">
                  {t('userTypeCustomer')}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{source.customer.name}</Typography>
              </Box>
            )}
            <TextField
              select
              label={t('transferTo')}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={!customers}
            >
              <MenuItem value={DIRECT}>{t('transferDirect')}</MenuItem>
              {targets.map((reseller) => (
                <MenuItem key={reseller.id} value={reseller.id}>
                  {reseller.name}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info">{t('transferNote')}</Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {result ? (
          <Button variant="contained" onClick={onClose}>
            {t('transferClose')}
          </Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={running}>
              {t('sharedCancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleTransfer}
              disabled={running || !customers || !target || nothingToMove}
              startIcon={running ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {t('transferAction')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;
