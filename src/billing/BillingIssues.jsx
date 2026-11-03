import { useMemo } from 'react';
import {
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import useSettingsStyles from '../settings/common/useSettingsStyles';
import { TRIAL_DAYS, findBillingIssues, formatDateId } from './billingLogic';
import BillingStatusChip from './BillingStatusChip';
import useBillingTranslation from './useBillingTranslation';

// Detective control: the server cannot stop a reseller from editing billing
// fields through the API, but such edits leave traces that are listed here.
const BillingIssues = ({ items, owners, onPay }) => {
  const { classes } = useSettingsStyles();
  const bt = useBillingTranslation();
  const t = useTranslation();

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
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>{bt('billingNoIssues')}</TableCell>
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
                <TableCell>
                  {issues.map((issue) => (
                    <div key={issue.key}>
                      {bt(`billingIssue_${issue.key}`, {
                        n: TRIAL_DAYS,
                        date: issue.date ? formatDateId(issue.date) : '',
                      })}
                    </div>
                  ))}
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
    </>
  );
};

export default BillingIssues;
