import { useCallback, useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Snackbar,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TransferDialog from './components/TransferDialog';
import ImpersonationGrantsDialog from './components/ImpersonationGrantsDialog';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { repairResellerAccess, syncResellerCustomers } from '../common/util/resellerAccess';
import BuildIcon from '@mui/icons-material/Build';
import PageLayout from '../common/components/PageLayout';
import TableShimmer from '../common/components/TableShimmer';
import LinkField from '../common/components/LinkField';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useAsyncTask, useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { fetchDeviceOwners, isCustomer } from '../common/util/ownership';

const isReseller = (user) => !user.administrator && (user.userLimit || 0) !== 0;

// Resellers = users allowed to manage other users (Traccar "managers").
// Each customer belongs to at most one reseller.
const ResellersPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [users, setUsers] = useState([]);
  const [customersOf, setCustomersOf] = useState({});
  const [deviceOwners, setDeviceOwners] = useState(() => new Map());
  const [loading, setLoading] = useState(true);
  const [manage, setManage] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [grantFor, setGrantFor] = useState(null);
  const [repairing, setRepairing] = useState(false);
  const [repairMessage, setRepairMessage] = useState(null);

  const handleRepair = useCatch(async () => {
    setRepairing(true);
    try {
      const fixed = await repairResellerAccess();
      setRepairMessage(t('resellerRepairDone').replace('{n}', fixed));
      reload();
    } finally {
      setRepairing(false);
    }
  });
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState('');
  const [promoteLimit, setPromoteLimit] = useState('20');

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setLoading(true);
      try {
        const all = await (
          await fetchOrThrow('/api/users?excludeAttributes=true', { signal })
        ).json();
        setUsers(all);
        const resellers = all.filter(isReseller);
        const entries = await Promise.all(
          resellers.map(async (reseller) => {
            const response = await fetchOrThrow(
              `/api/users?userId=${reseller.id}&excludeAttributes=true`,
              { signal },
            );
            return [reseller.id, (await response.json()).filter(isCustomer)];
          }),
        );
        setCustomersOf(Object.fromEntries(entries));
        setDeviceOwners(await fetchDeviceOwners({ signal }));
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [reloadKey],
  );

  const resellers = useMemo(() => users.filter(isReseller), [users]);

  const deviceCount = (resellerId) => {
    const customerIds = (customersOf[resellerId] || []).map((it) => it.id);
    let count = 0;
    deviceOwners.forEach((owners) => {
      if (owners.some((owner) => customerIds.includes(owner.id))) {
        count += 1;
      }
    });
    return count;
  };

  // A customer may be managed by one reseller only.
  const checkCustomers = useCallback(
    async (items) => {
      for (const item of items) {
        const others = await Promise.all(
          resellers
            .filter((reseller) => reseller.id !== manage?.id)
            .map(async (reseller) => {
              const response = await fetchOrThrow(
                `/api/users?userId=${reseller.id}&excludeAttributes=true`,
              );
              const managed = await response.json();
              return managed.some((it) => it.id === item.id) ? reseller : null;
            }),
        );
        const owner = others.find(Boolean);
        if (owner) {
          return t('resellerConflict')
            .replace('{customer}', item.name)
            .replace('{reseller}', owner.name);
        }
      }
      return null;
    },
    [resellers, manage, t],
  );

  const handlePromote = useCatch(async () => {
    const user = await (await fetchOrThrow(`/api/users/${promoteUserId}`)).json();
    await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, userLimit: Number(promoteLimit) }),
    });
    setPromoteOpen(false);
    setPromoteUserId('');
    reload();
  });

  const candidates = users.filter(isCustomer);

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'resellerTitle']}>
      <Stack direction="row" spacing={1} sx={{ p: 2 }} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/settings/user?type=reseller')}
        >
          {t('resellerCreate')}
        </Button>
        <Button variant="outlined" onClick={() => setPromoteOpen(true)}>
          {t('resellerPromote')}
        </Button>
        <Button
          variant="text"
          startIcon={<BuildIcon />}
          onClick={handleRepair}
          disabled={repairing}
        >
          {t('resellerRepair')}
        </Button>
      </Stack>
      <div style={{ overflowX: 'auto' }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedName')}</TableCell>
              <TableCell>{t('userEmail')}</TableCell>
              <TableCell>{t('resellerCustomers')}</TableCell>
              <TableCell>{t('deviceTitle')}</TableCell>
              <TableCell>{t('userUserLimit')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableShimmer columns={6} endAction />
            ) : (
              resellers.map((reseller) => (
                <TableRow key={reseller.id}>
                  <TableCell>{reseller.name}</TableCell>
                  <TableCell>{reseller.email}</TableCell>
                  <TableCell>{(customersOf[reseller.id] || []).length}</TableCell>
                  <TableCell>{deviceCount(reseller.id)}</TableCell>
                  <TableCell>
                    {reseller.userLimit < 0 ? t('resellerUnlimited') : reseller.userLimit}
                  </TableCell>
                  <TableCell className={classes.columnAction} padding="none">
                    <div className="collection-actions" style={{ display: 'flex' }}>
                      <Tooltip title={t('resellerManageCustomers')}>
                        <IconButton size="small" onClick={() => setManage(reseller)}>
                          <GroupAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('grantTitle')}>
                        <IconButton size="small" onClick={() => setGrantFor(reseller)}>
                          <VpnKeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('transferTitle')}>
                        <IconButton size="small" onClick={() => setTransfer({ reseller })}>
                          <SwapHorizIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('sharedEdit')}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/settings/user/${reseller.id}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && resellers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>{t('resellerNone')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {manage && (
        <Dialog
          open
          onClose={() => {
            setManage(null);
            reload();
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {t('resellerManageCustomers')}: {manage.name}
          </DialogTitle>
          <DialogContent>
            <LinkField
              endpointAll="/api/users?all=true&excludeAttributes=true"
              endpointLinked={`/api/users?userId=${manage.id}&excludeAttributes=true`}
              baseId={manage.id}
              keyBase="userId"
              keyLink="managedUserId"
              titleGetter={(it) => `${it.name} (${it.email})`}
              label={t('resellerCustomers')}
              filter={isCustomer}
              beforeAdd={checkCustomers}
              afterChange={(added, removed) => syncResellerCustomers(manage.id, added, removed)}
              helperText={t('resellerManageHelp')}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setManage(null);
                reload();
              }}
            >
              {t('resellerClose')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={Boolean(repairMessage)}
        autoHideDuration={5000}
        onClose={() => setRepairMessage(null)}
        message={repairMessage}
      />
      {grantFor && (
        <ImpersonationGrantsDialog reseller={grantFor} onClose={() => setGrantFor(null)} />
      )}
      {transfer && (
        <TransferDialog source={transfer} onClose={() => setTransfer(null)} onDone={reload} />
      )}

      <Dialog open={promoteOpen} onClose={() => setPromoteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('resellerPromote')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label={t('settingsUser')}
              value={promoteUserId}
              onChange={(e) => setPromoteUserId(e.target.value)}
            >
              {candidates.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('userUserLimit')}
              value={promoteLimit}
              onChange={(e) => setPromoteLimit(e.target.value.replace(/[^0-9]/g, ''))}
              helperText={t('resellerLimitHelp')}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            />
            <Alert severity="warning">{t('resellerPromoteWarning')}</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteOpen(false)}>{t('sharedCancel')}</Button>
          <Button
            variant="contained"
            disabled={!promoteUserId || !(Number(promoteLimit) >= 1)}
            onClick={handlePromote}
          >
            {t('sharedSave')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default ResellersPage;
