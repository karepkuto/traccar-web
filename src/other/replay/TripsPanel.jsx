import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAttributePreference } from '../../common/util/preferences';
import { formatDistance } from '../../common/util/formatter';
import { speedFromKnots, speedUnitString } from '../../common/util/converter';
import { nowInTimezone, getTimezone } from '../../common/util/timezone';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import { useAsyncTask } from '../../reactHelper';
import InfoTip from '../../common/components/InfoTip';
import { clockTime, placeLabel, shortDuration } from './tripUtils';
import dayjs from 'dayjs';

// "Perjalanan" tab: the day's trips as detected by the server's trip report,
// each one playable on its own.
const TripsPanel = ({ deviceId, onDeviceChange, onPlay, activeIndex }) => {
  const t = useTranslation();
  const theme = useTheme();

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);
  const latest = useSelector((state) => state.session.positions[deviceId]);
  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');

  const [day, setDay] = useState('today');
  const [customDate, setCustomDate] = useState(() => nowInTimezone().format('YYYY-MM-DD'));
  const [trips, setTrips] = useState(null);
  const [loading, setLoading] = useState(false);

  const deviceList = useMemo(
    () => Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)),
    [devices],
  );
  const device = devices[deviceId];

  const range = useMemo(() => {
    let base = nowInTimezone();
    if (day === 'yesterday') {
      base = base.subtract(1, 'day');
    } else if (day === 'custom' && customDate) {
      base = dayjs.tz(customDate, 'YYYY-MM-DD', getTimezone());
    }
    return { from: base.startOf('day').toISOString(), to: base.endOf('day').toISOString() };
  }, [day, customDate]);

  useAsyncTask(
    async ({ signal }) => {
      if (!deviceId) {
        setTrips(null);
        return;
      }
      setLoading(true);
      try {
        const query = new URLSearchParams({ deviceId, from: range.from, to: range.to });
        const response = await fetchOrThrow(`/api/reports/trips?${query.toString()}`, {
          headers: { Accept: 'application/json' },
          signal,
        });
        const items = await response.json();
        // Start / end positions tell whether a point lies inside a geofence.
        const ids = items.flatMap((it) => [it.startPositionId, it.endPositionId]).filter(Boolean);
        let positions = {};
        if (ids.length) {
          const positionQuery = new URLSearchParams();
          ids.forEach((id) => positionQuery.append('id', id));
          try {
            const positionResponse = await fetchOrThrow(
              `/api/positions?${positionQuery.toString()}`,
              { signal },
            );
            positions = Object.fromEntries((await positionResponse.json()).map((p) => [p.id, p]));
          } catch {
            positions = {};
          }
        }
        setTrips(
          items.map((trip) => ({
            ...trip,
            from: placeLabel({
              position: positions[trip.startPositionId],
              geofences,
              address: trip.startAddress,
              latitude: trip.startLat,
              longitude: trip.startLon,
            }),
            to: placeLabel({
              position: positions[trip.endPositionId],
              geofences,
              address: trip.endAddress,
              latitude: trip.endLat,
              longitude: trip.endLon,
            }),
          })),
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [deviceId, range, geofences],
  );

  const accConnected = Boolean(latest && Object.hasOwn(latest.attributes || {}, 'ignition'));
  const useIgnition = [true, 'true'].includes(device?.attributes?.['report.trip.useIgnition']);
  const minParking = Number(device?.attributes?.['report.trip.minimalParkingDuration']) || 300;

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        label={t('reportDevice')}
        value={deviceId || ''}
        onChange={(e) => onDeviceChange(Number(e.target.value))}
      >
        {deviceList.map((it) => (
          <MenuItem key={it.id} value={it.id}>
            {it.name}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction="row" spacing={1}>
        <TextField
          select
          label={t('replayDay')}
          value={day}
          onChange={(e) => setDay(e.target.value)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="today">{t('reportToday')}</MenuItem>
          <MenuItem value="yesterday">{t('reportYesterday')}</MenuItem>
          <MenuItem value="custom">{t('replayDate')}</MenuItem>
        </TextField>
        {day === 'custom' && (
          <TextField
            type="date"
            label={t('replayDate')}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
        )}
      </Stack>

      {device && (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={t(accConnected ? 'replayAccConnected' : 'replayAccNotConnected')}
            color={accConnected ? 'success' : 'default'}
            variant="outlined"
          />
          <Chip
            size="small"
            label={t(useIgnition ? 'replayDetectAcc' : 'replayDetectMotion')}
            variant="outlined"
          />
          <InfoTip text={t('replayDetectHelp').replace('{minutes}', Math.round(minParking / 60))} />
        </Stack>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!loading && deviceId && trips && trips.length === 0 && (
        <Alert severity="info">{t('replayNoTrips')}</Alert>
      )}
      {!loading && !deviceId && <Alert severity="info">{t('replayChooseDevice')}</Alert>}

      {!loading && trips && trips.length > 0 && (
        <Box sx={{ maxHeight: { xs: '45vh', md: '55vh' }, overflowY: 'auto', pr: 0.5 }}>
          {/* Newest first. Numbers and the previous/next buttons stay in
              chronological order; the parking gap sits below each trip. */}
          {[...trips.keys()].reverse().map((i) => {
            const trip = trips[i];
            return (
              <div key={`${trip.startTime}-${trip.endTime}`}>
                <ButtonBase
                  onClick={() => onPlay(trip, i, trips)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      activeIndex === i
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'background.paper',
                    boxShadow:
                      activeIndex === i ? `inset 4px 0 0 ${theme.palette.primary.main}` : 'none',
                  }}
                >
                  <Box
                    sx={{
                      flex: 'none',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {clockTime(trip.startTime)} – {clockTime(trip.endTime)}
                      <Typography component="span" variant="caption" color="textSecondary">
                        {' · '}
                        {shortDuration(trip.duration, t)}
                        {' · '}
                        {formatDistance(trip.distance, distanceUnit, t)}
                        {' · '}
                        {t('replayMax')} {Math.round(speedFromKnots(trip.maxSpeed || 0, speedUnit))}{' '}
                        {speedUnitString(speedUnit, t)}
                      </Typography>
                    </Typography>
                    <Typography variant="caption" component="div" noWrap>
                      {trip.from}
                    </Typography>
                    <Typography variant="caption" component="div" noWrap color="textSecondary">
                      → {trip.to}
                    </Typography>
                  </Box>
                  <PlayCircleIcon color="primary" sx={{ fontSize: 32, flex: 'none' }} />
                </ButtonBase>
                {i > 0 && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ color: 'text.secondary', pl: 1.5, py: 0.5 }}
                  >
                    <LocalParkingIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {t('replayParked').replace(
                        '{d}',
                        shortDuration(dayjs(trip.startTime).diff(dayjs(trips[i - 1].endTime)), t),
                      )}
                    </Typography>
                  </Stack>
                )}
              </div>
            );
          })}
        </Box>
      )}
    </Stack>
  );
};

export default TripsPanel;
