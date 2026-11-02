import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// All times in the app are shown in this zone (WIB) unless the user or
// server sets the `timezone` attribute. Using one fixed zone keeps times
// consistent for everyone, regardless of the phone/computer clock zone.
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

const isValidTimezone = (value) => {
  if (!value) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
};

let currentTimezone = DEFAULT_TIMEZONE;

export const getTimezone = () => currentTimezone;

export const setTimezone = (value) => {
  currentTimezone = isValidTimezone(value) ? value : DEFAULT_TIMEZONE;
};

// "Now" in the app timezone.
export const nowInTimezone = () => dayjs().tz(currentTimezone);

// Value for <input type="datetime-local">, expressed in the app timezone.
export const toInputValue = (value) =>
  dayjs(value).tz(currentTimezone).locale('en').format('YYYY-MM-DDTHH:mm');

// Parse a datetime-local input value as wall-clock time in the app timezone.
export const fromInputValue = (value) => dayjs.tz(value, 'YYYY-MM-DDTHH:mm', currentTimezone);
