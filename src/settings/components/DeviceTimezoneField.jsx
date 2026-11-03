import { useSelector } from 'react-redux';
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useTranslation } from '../../common/components/LocalizationProvider';

// Time zone of the clock inside the GPS tracker (Traccar attribute
// 'decoder.timezone'). Most trackers send UTC; some cheap ones send local
// time, which makes every position several hours off. The server applies
// this setting when decoding, from the next connection of the device.
export const TIMEZONE_ATTRIBUTE = 'decoder.timezone';

const OPTIONS = [
  { value: '', labelKey: 'deviceClockUtc', offset: 0 },
  { value: 'Asia/Jakarta', labelKey: 'deviceClockWib', offset: 7 },
  { value: 'Asia/Makassar', labelKey: 'deviceClockWita', offset: 8 },
  { value: 'Asia/Jayapura', labelKey: 'deviceClockWit', offset: 9 },
];

const HOUR = 3600000;

// Hours the device clock runs ahead of the server, when it looks like a
// whole-hour time zone mistake (7, 8 or 9 hours, +-20 minutes).
const detectOffset = (position) => {
  if (!position?.fixTime || !position?.serverTime) {
    return null;
  }
  const diff = new Date(position.fixTime) - new Date(position.serverTime);
  const hours = Math.round(diff / HOUR);
  if (![7, 8, 9].includes(hours) || Math.abs(diff - hours * HOUR) > HOUR / 3) {
    return null;
  }
  return hours;
};

const DeviceTimezoneField = ({ item, setItem }) => {
  const t = useTranslation();
  const position = useSelector((state) => (item.id ? state.session.positions[item.id] : null));

  const current = item.attributes?.[TIMEZONE_ATTRIBUTE] || '';
  const known = OPTIONS.some((option) => option.value === current);

  const setValue = (value) => {
    const attributes = { ...item.attributes };
    if (value) {
      attributes[TIMEZONE_ATTRIBUTE] = value;
    } else {
      delete attributes[TIMEZONE_ATTRIBUTE];
    }
    setItem({ ...item, attributes });
  };

  const offset = !current ? detectOffset(position) : null;
  const suggestion = OPTIONS.find((option) => option.offset === offset);

  return (
    <FormControl>
      <FormLabel sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
        {t('deviceClockTitle')}
      </FormLabel>
      {suggestion && (
        <Alert
          severity="warning"
          sx={{ mb: 1 }}
          action={
            <Button color="inherit" size="small" onClick={() => setValue(suggestion.value)}>
              {t('deviceClockUse')}
            </Button>
          }
        >
          {t('deviceClockDetected')
            .replace('{n}', offset)
            .replace('{zone}', t(suggestion.labelKey))}
        </Alert>
      )}
      <RadioGroup value={current} onChange={(e) => setValue(e.target.value)}>
        {OPTIONS.map((option) => (
          <FormControlLabel
            key={option.value || 'utc'}
            value={option.value}
            control={<Radio size="small" />}
            label={t(option.labelKey)}
          />
        ))}
        {!known && (
          <FormControlLabel
            value={current}
            control={<Radio size="small" />}
            label={`${t('deviceClockOther')}: ${current}`}
          />
        )}
      </RadioGroup>
      <FormHelperText sx={{ mx: 0 }}>{t('deviceClockHelp')}</FormHelperText>
    </FormControl>
  );
};

export default DeviceTimezoneField;
