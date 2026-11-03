import { useMemo, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Snackbar,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TransferDialog from './components/TransferDialog';
import { useCatch, useAsyncTask } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useAdministrator, useManager } from '../common/util/permissions';
import { ROLES, applyRolePreset, getUserRole, roleMismatches } from '../common/util/roles';
import SearchHeader from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import usePersistedState from '../common/util/usePersistedState';
import UserDevicesValue from './components/UserDevicesValue';
import { LEGAL_VERSION, CONSENT_ATTRIBUTES } from '../legal/legalContent';

const PAGE = 100;
const EXPIRING_DAYS = 7;

const ROLE_ORDER = { [ROLES.ADMIN]: 0, [ROLES.RESELLER]: 1, [ROLES.CUSTOMER]: 2 };
const STATUS_ORDER = { expired: 0, disabled: 1, expiring: 2, active: 3 };

const accountStatus = (user) => {
  if (user.disabled) return 'disabled';
  if (user.expirationTime) {
    const expiration = dayjs(user.expirationTime);
    if (!expiration.isAfter(dayjs())) return 'expired';
    if (expiration.diff(dayjs(), 'day', true) <= EXPIRING_DAYS) return 'expiring';
  }
  return 'active';
};

const consentStatus = (user) => {
  if (user.administrator) return 'na';
  const version = user.attributes?.[CONSENT_ATTRIBUTES.version];
  if (version === LEGAL_VERSION) return 'ok';
  return version ? 'old' : 'none';
};

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const SortHeader = ({ id, label, sort, onSort }) => (
  <TableCell sortDirection={sort.key === id ? sort.dir : false}>
    <TableSortLabel
      active={sort.key === id}
      direction={sort.key === id ? sort.dir : 'asc'}
      onClick={() => onSort(id)}
    >
      {label}
    </TableSortLabel>
  </TableCell>
);

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();
  const admin = useAdministrator();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState(null);
  const [managerOf, setManagerOf] = useState(() => new Map());
  const [customerCount, setCustomerCount] = useState(() => new Map());
  const [keyword, setKeyword] = useState('');
  const [temporary, setTemporary] = useState(false);
  const [tab, setTab] = usePersistedState('usersTab', 'all');
  const [sort, setSort] = usePersistedState('usersSort', { key: 'name', dir: 'asc' });
  const [limit, setLimit] = useState(PAGE);
  const [transfer, setTransfer] = useState(null);

  // All accounts at once so sorting and the category counts cover everything.
  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      const users = await (await fetchOrThrow('/api/users', { signal })).json();
      setItems(users);
      if (admin) {
        const resellers = users.filter((user) => getUserRole(user) === ROLES.RESELLER);
        const owners = new Map();
        const counts = new Map();
        await Promise.all(
          resellers.map(async (reseller) => {
            const managed = await (
              await fetchOrThrow(`/api/users?userId=${reseller.id}&excludeAttributes=true`, {
                signal,
              })
            ).json();
            counts.set(reseller.id, managed.length);
            managed.forEach((user) => owners.set(user.id, reseller));
          }),
        );
        setManagerOf(owners);
        setCustomerCount(counts);
      }
    },
    [reloadKey, admin],
  );

  const roleLabel = (role) =>
    ({
      [ROLES.ADMIN]: t('userTypeAdmin'),
      [ROLES.RESELLER]: t('userTypeReseller'),
      [ROLES.CUSTOMER]: t('userTypeCustomer'),
    })[role];

  const roleColor = {
    [ROLES.ADMIN]: theme.palette.mode === 'dark' ? '#ce93d8' : '#8e24aa',
    [ROLES.RESELLER]: theme.palette.info.main,
    [ROLES.CUSTOMER]: theme.palette.primary.main,
  };

  const rows = useMemo(() => {
    if (!items) return [];
    // Text shown (and sorted) in the "Keterangan" column.
    const infoText = (user, role) => {
      if (role === ROLES.CUSTOMER) {
        const owner = managerOf.get(user.id);
        return owner ? `${t('usersManagedBy')} ${owner.name}` : t('usersDirect');
      }
      if (role === ROLES.RESELLER) {
        const count = customerCount.get(user.id) ?? 0;
        const limitText = user.userLimit < 0 ? '∞' : user.userLimit;
        return t('usersCustomerQuota').replace('{n}', count).replace('{max}', limitText);
      }
      return '';
    };
    return items
      .filter((user) => temporary || !user.temporary)
      .map((user) => {
        const role = getUserRole(user);
        return {
          user,
          role,
          status: accountStatus(user),
          consent: consentStatus(user),
          info: infoText(user, role),
        };
      });
  }, [items, temporary, managerOf, customerCount, t]);

  const counts = useMemo(() => {
    const result = { all: rows.length };
    rows.forEach((row) => {
      result[row.role] = (result[row.role] || 0) + 1;
    });
    return result;
  }, [rows]);

  const visible = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (!admin || tab === 'all' || row.role === tab) &&
        (!lower ||
          [row.user.name, row.user.email, row.user.phone, row.info].some(
            (text) => text && String(text).toLowerCase().includes(lower),
          )),
    );
    const value = (row) => {
      switch (sort.key) {
        case 'role':
          return ROLE_ORDER[row.role];
        case 'status':
          return STATUS_ORDER[row.status];
        case 'expiration':
          return row.user.expirationTime ? dayjs(row.user.expirationTime).valueOf() : Infinity;
        case 'consent':
          return row.consent;
        case 'info':
          return row.info;
        case 'phone':
          return row.user.phone || '';
        case 'email':
          return row.user.email || '';
        default:
          return (row.user.name || '').toLowerCase();
      }
    };
    const direction = sort.dir === 'desc' ? -1 : 1;
    return filtered.sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      const result =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return result * direction || (a.user.name || '').localeCompare(b.user.name || '');
    });
  }, [rows, keyword, tab, sort, admin]);

  const handleSort = (key) => {
    setSort(
      sort.key === key ? { key, dir: sort.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  };

  const statusChip = (status) => {
    const config = {
      active: { color: 'success', label: t('usersStatusActive') },
      expiring: { color: 'warning', label: t('usersStatusExpiring') },
      expired: { color: 'error', label: t('usersStatusExpired') },
      disabled: { color: 'default', label: t('usersStatusDisabled') },
    }[status];
    return <Chip size="small" variant="outlined" color={config.color} label={config.label} />;
  };

  const consentChip = (consent) => {
    if (consent === 'na') return <Typography color="textSecondary">-</Typography>;
    const config = {
      ok: { color: 'success', label: t('usersConsentOk') },
      old: { color: 'warning', label: t('usersConsentOld') },
      none: { color: 'default', label: t('usersConsentNone') },
    }[consent];
    return <Chip size="small" variant="outlined" color={config.color} label={config.label} />;
  };

  // ---- Row actions ----
  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('userImpersonate'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  const actionTransfer = {
    key: 'transfer',
    title: t('transferCustomerAction'),
    icon: <SwapHorizIcon fontSize="small" />,
    handler: (userId) => setTransfer({ customer: items.find((user) => user.id === userId) }),
  };

  // ---- One-off clean-up: apply role restrictions to older accounts ----
  const [syncTargets, setSyncTargets] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleSyncCheck = useCatch(async () => {
    const users = await (await fetchOrThrow('/api/users')).json();
    setSyncTargets(
      users.filter(
        (user) => getUserRole(user) !== ROLES.ADMIN && roleMismatches(user, { admin: true }).length,
      ),
    );
  });

  const handleSyncApply = useCatch(async () => {
    const targets = syncTargets;
    setSyncTargets(null);
    await Promise.all(
      targets.map((user) =>
        fetchOrThrow(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applyRolePreset(user, { admin: true })),
        }),
      ),
    );
    setSyncMessage(t('userRoleSyncDone').replace('{n}', targets.length));
    reload();
  });

  const columns = admin ? 8 : 6;
  const tabs = [
    ['all', t('usersAll')],
    [ROLES.ADMIN, t('userTypeAdmin')],
    [ROLES.RESELLER, t('userTypeReseller')],
    [ROLES.CUSTOMER, t('userTypeCustomer')],
  ];

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={keyword} setKeyword={setKeyword} />
      {admin && (
        <Tabs
          value={tab}
          onChange={(_, value) => {
            setTab(value);
            setLimit(PAGE);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabs.map(([value, label]) => (
            <Tab
              key={value}
              value={value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {label}
                  <Chip
                    size="small"
                    label={items ? counts[value] || 0 : '…'}
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      )}
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <SortHeader id="name" label={t('sharedName')} sort={sort} onSort={handleSort} />
            <SortHeader id="role" label={t('userRole')} sort={sort} onSort={handleSort} />
            {admin && (
              <SortHeader id="info" label={t('usersInfo')} sort={sort} onSort={handleSort} />
            )}
            <SortHeader id="status" label={t('usersStatus')} sort={sort} onSort={handleSort} />
            <SortHeader
              id="expiration"
              label={t('usersAccountUntil')}
              sort={sort}
              onSort={handleSort}
            />
            {admin && (
              <SortHeader id="consent" label={t('usersConsent')} sort={sort} onSort={handleSort} />
            )}
            <TableCell>{t('deviceTitle')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!items && <TableShimmer columns={columns} endAction />}
          {items && visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns}>{t('usersEmpty')}</TableCell>
            </TableRow>
          )}
          {visible.slice(0, limit).map(({ user, role, status, consent, info }) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      bgcolor: alpha(roleColor[role], 0.15),
                      color: roleColor[role],
                    }}
                  >
                    {initials(user.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" noWrap component="div">
                      {[user.email, user.phone].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={roleLabel(role)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(roleColor[role], 0.12),
                    color: roleColor[role],
                  }}
                />
              </TableCell>
              {admin && (
                <TableCell>
                  <Typography variant="body2" color={info ? 'textPrimary' : 'textSecondary'}>
                    {info || '-'}
                  </Typography>
                </TableCell>
              )}
              <TableCell>{statusChip(status)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {user.expirationTime ? formatTime(user.expirationTime, 'date') : t('usersNoLimit')}
              </TableCell>
              {admin && <TableCell>{consentChip(consent)}</TableCell>}
              <TableCell>
                <UserDevicesValue userId={user.id} />
              </TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={user.id}
                  editPath="/settings/user"
                  endpoint="users"
                  onReload={reload}
                  removable={admin}
                  customActions={[
                    ...(manager ? [actionLogin] : []),
                    actionConnections,
                    ...(admin && role === ROLES.CUSTOMER ? [actionTransfer] : []),
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  position: 'sticky',
                  left: 16,
                  maxWidth: 'calc(100vw - 32px)',
                }}
              >
                <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                  {items &&
                    t('usersShowing')
                      .replace('{n}', Math.min(limit, visible.length))
                      .replace('{total}', visible.length)}
                </Typography>
                {visible.length > limit && (
                  <Button size="small" onClick={() => setLimit(limit + PAGE)}>
                    {t('usersMore')}
                  </Button>
                )}
                {admin && (
                  <Button size="small" variant="text" onClick={handleSyncCheck}>
                    {t('userRoleSync')}
                  </Button>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={temporary}
                      onChange={(e) => setTemporary(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('userTemporary')}
                  labelPlacement="start"
                />
              </Box>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/user" />
      {transfer && (
        <TransferDialog source={transfer} onClose={() => setTransfer(null)} onDone={reload} />
      )}
      <Dialog open={Boolean(syncTargets)} onClose={() => setSyncTargets(null)} maxWidth="xs">
        <DialogTitle>{t('userRoleSyncTitle')}</DialogTitle>
        <DialogContent>
          {syncTargets?.length
            ? `${t('userRoleSyncBody').replace('{n}', syncTargets.length)} ${syncTargets
                .map((user) => user.name)
                .join(', ')}`
            : t('userRoleSyncNone')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncTargets(null)}>{t('sharedCancel')}</Button>
          {Boolean(syncTargets?.length) && (
            <Button variant="contained" onClick={handleSyncApply}>
              {t('userRoleSync')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(syncMessage)}
        autoHideDuration={4000}
        onClose={() => setSyncMessage(null)}
        message={syncMessage}
      />
    </PageLayout>
  );
};

export default UsersPage;
