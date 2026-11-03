import {
  BILLING_STATUS,
  getBillingStatus,
  getRemainingDays,
  getRemainingParts,
  isTrial,
} from './billingLogic';

export const statusLabelKey = (status) =>
  `billingStatus${status.charAt(0).toUpperCase()}${status.slice(1)}`;

export const deviceBillingStatus = (device, thresholds) =>
  getBillingStatus(device?.expirationTime, { ...thresholds, trial: isTrial(device?.attributes) });

// "2 hari 5 jam", "5 jam" or "< 1 jam".
export const formatRemainingTime = (bt, expirationTime) => {
  const parts = getRemainingParts(expirationTime);
  if (!parts) {
    return '';
  }
  if (parts.days > 0) {
    return bt('billingTimeDaysHours', { d: parts.days, h: parts.hours });
  }
  if (parts.hours > 0) {
    return bt('billingTimeHours', { h: parts.hours });
  }
  return bt('billingTimeUnderHour');
};

// Short label for chips and the device list.
export const billingStatusLabel = (bt, status, device) => {
  switch (status) {
    case BILLING_STATUS.TRIAL:
    case BILLING_STATUS.CRITICAL:
      return `${bt(statusLabelKey(status))} · ${bt('billingLeft', {
        time: formatRemainingTime(bt, device.expirationTime),
      })}`;
    case BILLING_STATUS.WARNING:
      return `${bt(statusLabelKey(status))} · ${bt('billingDaysLeft', {
        n: getRemainingDays(device.expirationTime),
      })}`;
    case BILLING_STATUS.EXPIRED:
      return isTrial(device.attributes) ? bt('billingTrialExpired') : bt(statusLabelKey(status));
    default:
      return bt(statusLabelKey(status));
  }
};
