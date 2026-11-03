import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslation } from '../common/components/LocalizationProvider';
import { getBillingThresholds, isActivationOverdue } from '../billing/billingLogic';
import { billingFilterKey } from './filterLogic';

const DISMISS_KEY = 'attentionBannerDismissed';

const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY);
  } catch {
    return null;
  }
};

// Reminder above the device list:
// - admin: devices waiting for activation, and those past the 24-hour promise
// - reseller: devices that need activation or an extension soon
// "Lihat" applies the matching quick filter. Closing hides it for this
// session until the numbers change.
const AttentionBanner = ({ role, filter, setFilter }) => {
  const theme = useTheme();
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const server = useSelector((state) => state.session.server);
  const [dismissed, setDismissed] = useState(readDismissed);

  const info = useMemo(() => {
    const thresholds = getBillingThresholds(server);
    const list = Object.values(devices);
    if (role === 'admin') {
      const trial = list.filter((d) => billingFilterKey(d, thresholds) === 'trial');
      const overdue = trial.filter((d) => isActivationOverdue(d.attributes)).length;
      if (!trial.length) return null;
      return {
        text: t(overdue ? 'attentionAdminOverdue' : 'attentionAdmin')
          .replace('{n}', trial.length)
          .replace('{late}', overdue),
        severity: overdue ? 'error' : 'info',
        billing: ['trial'],
        signature: `admin:${trial.length}:${overdue}`,
      };
    }
    if (role === 'reseller') {
      const keys = list.map((d) => billingFilterKey(d, thresholds));
      const count = (key) => keys.filter((k) => k === key).length;
      const expired = count('expired');
      const total = expired + count('trial') + count('soon');
      if (!total) return null;
      return {
        text: t(expired ? 'attentionResellerLocked' : 'attentionReseller')
          .replace('{n}', total)
          .replace('{locked}', expired),
        severity: expired ? 'error' : 'warning',
        billing: ['trial', 'expired', 'soon'],
        signature: `reseller:${total}:${expired}`,
      };
    }
    return null;
  }, [devices, server, role, t]);

  const applied =
    info &&
    info.billing.length === filter.billing.length &&
    info.billing.every((key) => filter.billing.includes(key));

  if (!info || applied || dismissed === info.signature) {
    return null;
  }

  const main = theme.palette[info.severity].main;

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, info.signature);
    } catch {
      // Private mode: hide for this page view only.
    }
    setDismissed(info.signature);
  };

  return (
    <Box
      sx={{
        mx: 2,
        mb: 1.25,
        pl: 1.5,
        pr: 0.5,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderRadius: 2,
        bgcolor: alpha(main, 0.12),
        border: `1px solid ${alpha(main, 0.35)}`,
      }}
    >
      <NotificationsActiveIcon sx={{ color: main, fontSize: 18, flex: 'none' }} />
      <Typography
        variant="caption"
        sx={{ flex: 1, minWidth: 0, fontWeight: 600, lineHeight: 1.35 }}
      >
        {info.text}
      </Typography>
      <Button
        size="small"
        onClick={() => setFilter({ ...filter, billing: info.billing })}
        sx={{ minWidth: 0, color: main, fontWeight: 700, flex: 'none' }}
      >
        {t('attentionView')}
      </Button>
      <IconButton size="small" onClick={dismiss} sx={{ flex: 'none' }}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};

export default AttentionBanner;
