import { Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  BILLING_STATUS,
  getBillingStatus,
  getBillingThresholds,
  getRemainingDays,
} from './billingLogic';
import useBillingTranslation from './useBillingTranslation';

const statusColors = {
  [BILLING_STATUS.UNSET]: 'default',
  [BILLING_STATUS.ACTIVE]: 'success',
  [BILLING_STATUS.WARNING]: 'warning',
  [BILLING_STATUS.CRITICAL]: 'error',
  [BILLING_STATUS.EXPIRED]: 'error',
};

export const statusLabelKey = (status) =>
  `billingStatus${status.charAt(0).toUpperCase()}${status.slice(1)}`;

const BillingStatusChip = ({ expirationTime }) => {
  const bt = useBillingTranslation();
  const server = useSelector((state) => state.session.server);
  const status = getBillingStatus(expirationTime, getBillingThresholds(server));
  const days = getRemainingDays(expirationTime);

  let label = bt(statusLabelKey(status));
  if (status === BILLING_STATUS.WARNING || status === BILLING_STATUS.CRITICAL) {
    label = `${label} · ${bt('billingDaysLeft', { n: days })}`;
  }

  return (
    <Chip
      size="small"
      label={label}
      color={statusColors[status]}
      variant={status === BILLING_STATUS.EXPIRED ? 'filled' : 'outlined'}
    />
  );
};

export default BillingStatusChip;
