import dayjs from 'dayjs';
import { getTimezone } from '../../common/util/timezone';

export const clockTime = (value) => (value ? dayjs(value).tz(getTimezone()).format('HH:mm') : '');

// 4_380_000 ms -> "1 j 13 mnt" (Indonesian) / "1 h 13 min"
export const shortDuration = (ms, t) => {
  const totalMinutes = Math.max(0, Math.round((ms || 0) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const h = t('sharedHourAbbreviation');
  if (hours && minutes) {
    return `${hours} ${h} ${minutes} ${t('replayMinuteShort')}`;
  }
  if (hours) {
    return `${hours} ${h}`;
  }
  return `${minutes} ${t('replayMinuteShort')}`;
};

// Place label: geofence name if the point is inside one, else the address,
// else the coordinates.
export const placeLabel = ({ position, geofences, address, latitude, longitude }) => {
  const geofenceName = (position?.geofenceIds || []).map((id) => geofences[id]?.name).find(Boolean);
  if (geofenceName) {
    return geofenceName;
  }
  if (address) {
    return address;
  }
  if (latitude !== undefined && longitude !== undefined) {
    return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
  }
  return '-';
};
