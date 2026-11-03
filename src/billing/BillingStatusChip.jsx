import { Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import { BILLING_STATUS, getBillingThresholds } from './billingLogic';
import { billingStatusLabel, deviceBillingStatus } from './billingFormat';
import useBillingTranslation from './useBillingTranslation';

const statusColors = {
  [BILLING_STATUS.UNSET]: 'default',
  [BILLING_STATUS.ACTIVE]: 'success',
  [BILLING_STATUS.WARNING]: 'warning',
  [BILLING_STATUS.CRITICAL]: 'error',
  [BILLING_STATUS.EXPIRED]: 'error',
  [BILLING_STATUS.TRIAL]: 'info',
};

const BillingStatusChip = ({ device }) => {
  const bt = useBillingTranslation();
  const server = useSelector((state) => state.session.server);
  const status = deviceBillingStatus(device, getBillingThresholds(server));

  return (
    <Chip
      size="small"
      label={billingStatusLabel(bt, status, device)}
      color={statusColors[status]}
      variant={status === BILLING_STATUS.EXPIRED ? 'filled' : 'outlined'}
    />
  );
};

export default BillingStatusChip;
