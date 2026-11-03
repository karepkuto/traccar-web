import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { BILLING_STATUS, getBillingThresholds } from './billingLogic';
import { billingStatusLabel, deviceBillingStatus } from './billingFormat';
import useBillingTranslation from './useBillingTranslation';

// Compact inline countdown for the device list. Renders nothing while the
// subscription is comfortably active or has no expiration set.
const BillingCountdown = ({ device }) => {
  const theme = useTheme();
  const bt = useBillingTranslation();
  const server = useSelector((state) => state.session.server);
  const status = deviceBillingStatus(device, getBillingThresholds(server));

  if (status === BILLING_STATUS.UNSET || status === BILLING_STATUS.ACTIVE) {
    return null;
  }

  const colors = {
    [BILLING_STATUS.WARNING]: theme.palette.warning.main,
    [BILLING_STATUS.TRIAL]: theme.palette.info.main,
  };

  return (
    <>
      {' • '}
      <span style={{ color: colors[status] || theme.palette.error.main, fontWeight: 500 }}>
        {billingStatusLabel(bt, status, device)}
      </span>
    </>
  );
};

export default BillingCountdown;
