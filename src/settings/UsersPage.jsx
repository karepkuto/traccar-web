import { useCallback, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { useCatch, useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useAdministrator, useManager } from '../common/util/permissions';
import { applyRolePreset, getUserRole, roleMismatches } from '../common/util/roles';
import SearchHeader from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import UserDevicesValue from './components/UserDevicesValue';

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();
  const admin = useAdministrator();

  const roleLabel = (user) =>
    ({
      admin: t('userTypeAdmin'),
      reseller: t('userTypeReseller'),
      customer: t('userTypeCustomer'),
    })[getUserRole(user)];

  // One-off clean-up: apply role restrictions to accounts made before roles.
  const [syncTargets, setSyncTargets] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleSyncCheck = useCatch(async () => {
    const response = await fetchOrThrow('/api/users');
    const users = await response.json();
    setSyncTargets(
      users.filter(
        (user) => getUserRole(user) !== 'admin' && roleMismatches(user, { admin: true }).length,
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

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [temporary, setTemporary] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ excludeAttributes: true, limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/users?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
    },
    [searchKeyword],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('userEmail')}</TableCell>
            <TableCell>{t('userRole')}</TableCell>
            <TableCell>{t('sharedDisabled')}</TableCell>
            <TableCell>{t('userExpirationTime')}</TableCell>
            <TableCell>{t('deviceTitle')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items
            .filter((u) => temporary || !u.temporary)
            .map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{roleLabel(item)}</TableCell>
                <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
                <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
                <TableCell>
                  <UserDevicesValue userId={item.id} />
                </TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/user"
                    endpoint="users"
                    onReload={reload}
                    removable={admin}
                    customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
                  />
                </TableCell>
              </TableRow>
            ))}
          {hasMore && (
            <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={7} endAction />
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} align="right">
              {admin && (
                <Button variant="text" onClick={handleSyncCheck} sx={{ float: 'left' }}>
                  {t('userRoleSync')}
                </Button>
              )}
              <FormControlLabel
                control={
                  <Switch
                    value={temporary}
                    onChange={(e) => setTemporary(e.target.checked)}
                    size="small"
                  />
                }
                label={t('userTemporary')}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/user" />
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
