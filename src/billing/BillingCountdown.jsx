import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  BILLING_STATUS,
  getBillingStatus,
  getBillingThresholds,
  getRemainingDays,
} from './billingLogic';
import useBillingTranslation from './useBillingTranslation';

// Compact inline countdown for the device list. Renders nothing while the
// subscription is comfortably active or has no expiration set.
const BillingCountdown = ({ expirationTime }) => {
  const theme = useTheme();
  const bt = useBillingTranslation();
  const server = useSelector((state) => state.session.server);
  const status = getBillingStatus(expirationTime, getBillingThresholds(server));

  if (status === BILLING_STATUS.UNSET || status === BILLING_STATUS.ACTIVE) {
    return null;
  }

  const color =
    status === BILLING_STATUS.WARNING ? theme.palette.warning.main : theme.palette.error.main;
  const label =
    status === BILLING_STATUS.EXPIRED
      ? bt('billingStatusExpired')
      : bt('billingDaysLeft', { n: getRemainingDays(expirationTime) });

  return (
    <>
      {' • '}
      <span style={{ color, fontWeight: 500 }}>{label}</span>
    </>
  );
};

export default BillingCountdown;
