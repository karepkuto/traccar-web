import { useMemo, useState } from 'react';
import {
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Chip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import useSettingsStyles from '../settings/common/useSettingsStyles';
import { TRIAL_DAYS, findBillingIssues, formatDateId } from './billingLogic';
import BillingStatusChip from './BillingStatusChip';
import useBillingTranslation from './useBillingTranslation';
import { useAsyncTask } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { getUserRole } from '../common/util/roles';
import { AUDIT_DAYS, fetchAudit, findAuditPatterns } from './auditPatterns';

// Detective control: the server cannot stop a reseller from editing billing
// fields through the API, but such edits leave traces that are listed here.
const BillingIssues = ({ items, owners, onPay }) => {
  const { classes } = useSettingsStyles();
  const bt = useBillingTranslation();
  const t = useTranslation();

  const [audit, setAudit] = useState(null);
  const [auditError, setAuditError] = useState(false);
  const [users, setUsers] = useState(() => new Map());

  useAsyncTask(async ({ signal }) => {
    const list = await (await fetchOrThrow('/api/users?excludeAttributes=true', { signal })).json();
    setUsers(new Map(list.map((user) => [user.id, user])));
    try {
      setAudit(await fetchAudit({ signal }));
    } catch {
      if (!signal.aborted) {
        setAuditError(true);
      }
    }
  }, []);

  const { patterns, lastEdits } = useMemo(
    () => (audit ? findAuditPatterns(audit, users) : { patterns: [], lastEdits: new Map() }),
    [audit, users],
  );

  const roleLabel = (user) =>
    ({
      admin: t('userTypeAdmin'),
      reseller: t('userTypeReseller'),
      customer: t('userTypeCustomer'),
    })[getUserRole(user)];

  const actorName = (userId) => {
    const user = users.get(userId);
    return user ? `${user.name} (${roleLabel(user)})` : userId ? `#${userId}` : '-';
  };

  const objectName = (action) => {
    if (action.objectType === 'device') {
      const device = items.find((it) => it.id === action.objectId);
      return device ? device.name : `${bt('billingDevice')} #${action.objectId}`;
    }
    if (action.objectType === 'user') {
      return users.get(action.objectId)?.name || `${t('settingsUser')} #${action.objectId}`;
    }
    return '-';
  };

  const rows = useMemo(
    () =>
      items
        .map((device) => ({
          device,
          issues: findBillingIssues(device, owners?.get(device.id)?.length || 0),
        }))
        .filter((row) => row.issues.length > 0),
    [items, owners],
  );

  return (
    <>
      <Alert severity="info" sx={{ m: 2 }}>
        {bt('billingIssuesNote')}
      </Alert>
      <div style={{ overflowX: 'auto' }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedName')}</TableCell>
              <TableCell>{t('deviceIdentifier')}</TableCell>
              <TableCell>{bt('billingStatus')}</TableCell>
              <TableCell>{bt('billingCurrentExpiration')}</TableCell>
              <TableCell>{bt('billingIssue')}</TableCell>
              <TableCell>{bt('auditLastEdit')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>{bt('billingNoIssues')}</TableCell>
              </TableRow>
            )}
            {rows.map(({ device, issues }) => (
              <TableRow key={device.id}>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.uniqueId}</TableCell>
                <TableCell>
                  <BillingStatusChip device={device} />
                </TableCell>
                <TableCell>{formatTime(device.expirationTime, 'minutes') || '-'}</TableCell>
                <TableCell sx={{ minWidth: 240 }}>
                  {issues.map((issue) => (
                    <div key={issue.key} style={{ marginBottom: 2 }}>
                      {'• '}
                      {bt(`billingIssue_${issue.key}`, {
                        n: TRIAL_DAYS,
                        date: issue.date ? formatDateId(issue.date) : '',
                      })}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {lastEdits.get(device.id)
                    ? `${actorName(lastEdits.get(device.id).userId)} · ${formatTime(
                        lastEdits.get(device.id).actionTime,
                        'minutes',
                      )}`
                    : '-'}
                </TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <Tooltip title={bt('billingExtend')}>
                    <IconButton size="small" onClick={() => onPay(device)}>
                      <PaymentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 2, pt: 3 }}>
        {bt('auditPatternsTitle', { n: AUDIT_DAYS })}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ px: 2, pb: 1 }}>
        {bt('auditPatternsNote')}
      </Typography>
      {auditError ? (
        <Alert severity="warning" sx={{ mx: 2 }}>
          {bt('auditUnavailable')}
        </Alert>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{bt('auditTime')}</TableCell>
                <TableCell>{bt('auditActor')}</TableCell>
                <TableCell>{bt('auditPattern')}</TableCell>
                <TableCell>{bt('auditObject')}</TableCell>
                <TableCell>{bt('auditAddress')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audit && patterns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>{bt('auditNoPatterns')}</TableCell>
                </TableRow>
              )}
              {!audit && (
                <TableRow>
                  <TableCell colSpan={5}>…</TableCell>
                </TableRow>
              )}
              {patterns.map((pattern) => (
                <TableRow key={`${pattern.key}-${pattern.action.id}`}>
                  <TableCell>{formatTime(pattern.action.actionTime, 'minutes')}</TableCell>
                  <TableCell>{actorName(pattern.action.userId)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={pattern.key === 'failedLogins' ? 'warning' : 'error'}
                      variant="outlined"
                      label={bt(`auditPattern_${pattern.key}`, { n: pattern.count || '' })}
                    />
                  </TableCell>
                  <TableCell>{objectName(pattern.action)}</TableCell>
                  <TableCell>{pattern.action.address || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default BillingIssues;
