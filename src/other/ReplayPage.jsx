import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Button,
  IconButton,
  Paper,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ListIcon from '@mui/icons-material/List';
import TripsPanel from './replay/TripsPanel';
import { clockTime } from './replay/tripUtils';
import { fromInputValue, toInputValue } from '../common/util/timezone';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePrivacy } from '../common/util/privacy';
import { useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import { formatTime } from '../common/util/formatter';
import ReportFilter from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatchCallback } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import MapScale from '../map/MapScale';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';
import MapOverlay from '../map/overlay/MapOverlay';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: '100%',
  },
  speed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  range: {
    marginTop: theme.spacing(1),
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const BASE_INTERVAL = 500;
const SPEEDS = [1, 2, 4, 6, 8, 10];

const ReplayPage = () => {
  const t = useTranslation();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const [searchParams] = useSearchParams();

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const { isPrivate } = usePrivacy();
  const [selectedDeviceId, setSelectedDeviceId] = useState(() =>
    isPrivate(defaultDeviceId) ? null : defaultDeviceId,
  );
  const [showCard, setShowCard] = useState(false);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [range, setRange] = useState([0, 0]);
  const [rangeStart, rangeEnd] = range;
  const [tab, setTab] = useState('time');
  const [tripState, setTripState] = useState(null);

  const loaded = Boolean(!loading && positions.length && (tab === 'time' ? from && to : tripState));

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (!from && !to) {
      setPositions([]);
    }
  }, [from, to, setPositions]);

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((index) => index + 1);
      }, BASE_INTERVAL / speed);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions, speed]);

  useEffect(() => {
    if (index >= rangeEnd) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, rangeEnd]);

  // Only the selected time range is drawn and played.
  const visiblePositions = useMemo(
    () => positions.slice(rangeStart, rangeEnd + 1),
    [positions, rangeStart, rangeEnd],
  );

  const handleRangeChange = (_, value) => {
    const [start, end] = value;
    setRange([start, end]);
    setIndex((current) => Math.min(Math.max(current, start), end));
  };

  const onPointClick = useCallback(
    (_, index) => {
      setIndex(rangeStart + index);
    },
    [rangeStart],
  );

  const onMarkerClick = useCallback(
    (positionId) => {
      setShowCard(!!positionId);
    },
    [setShowCard],
  );

  const loadPositions = useCallback(
    async (deviceId, from, to) => {
      setLoading(true);
      setPlaying(false);
      setSelectedDeviceId(deviceId);
      const query = new URLSearchParams({ deviceId, from, to });
      try {
        const response = await fetchOrThrow(`/api/positions?${query.toString()}`);
        setIndex(0);
        const positions = await response.json();
        setPositions(positions);
        setRange([0, Math.max(positions.length - 1, 0)]);
        if (!positions.length) {
          throw Error(t('sharedNoData'));
        }
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const onShow = useCatchCallback(
    async ({ deviceIds, from, to }) => {
      await loadPositions(
        deviceIds.find(() => true),
        from,
        to,
      );
      setFilterOpen(false);
    },
    [loadPositions],
  );

  const playTrip = useCatchCallback(
    async (trip, tripIndex, list) => {
      setTripState({ index: tripIndex, list });
      await loadPositions(trip.deviceId || selectedDeviceId, trip.startTime, trip.endTime);
    },
    [loadPositions, selectedDeviceId],
  );

  const changeTab = (value) => {
    setTab(value);
    setPlaying(false);
    setPositions([]);
    setTripState(null);
    setShowCard(false);
  };

  // Typed start / end (date + time, WIB) move the range slider.
  const setRangeFromInput = (which, value) => {
    if (!value || !positions.length) {
      return;
    }
    const time = fromInputValue(value).valueOf();
    if (Number.isNaN(time)) {
      return;
    }
    const times = positions.map((p) => new Date(p.fixTime).getTime());
    if (which === 'start') {
      let start = times.findIndex((it) => it >= time);
      if (start < 0) start = positions.length - 1;
      start = Math.min(start, rangeEnd);
      setRange([start, rangeEnd]);
      setIndex((current) => Math.min(Math.max(current, start), rangeEnd));
    } else {
      let end = times.length - 1;
      while (end > 0 && times[end] > time) end -= 1;
      end = Math.max(end, rangeStart);
      setRange([rangeStart, end]);
      setIndex((current) => Math.min(Math.max(current, rangeStart), end));
    }
  };

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapRoutePath positions={visiblePositions} />
        <MapRoutePoints positions={visiblePositions} onClick={onPointClick} showSpeedControl />
        {index < positions.length && (
          <MapPositions
            positions={[positions[index]]}
            onMarkerClick={onMarkerClick}
            titleField="fixTime"
          />
        )}
      </MapView>
      <MapScale />
      <MapCamera positions={visiblePositions} />
      <div className={classes.sidebar}>
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {t('reportReplay')}
            </Typography>
            {loaded && tab === 'time' && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setFilterOpen((open) => !open)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
          <Tabs value={tab} onChange={(_, value) => changeTab(value)} variant="fullWidth">
            <Tab value="time" label={t('replayTabTime')} />
            <Tab value="trips" label={t('replayTabTrips')} />
          </Tabs>
        </Paper>
        <Paper className={classes.content} square>
          {tab === 'trips' && !tripState && (
            <TripsPanel
              deviceId={selectedDeviceId}
              onDeviceChange={setSelectedDeviceId}
              onPlay={playTrip}
              activeIndex={null}
            />
          )}
          {tab === 'trips' && tripState && (
            <Stack spacing={0.5} sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  disabled={loading || tripState.index <= 0}
                  onClick={() =>
                    playTrip(
                      tripState.list[tripState.index - 1],
                      tripState.index - 1,
                      tripState.list,
                    )
                  }
                >
                  <SkipPreviousIcon />
                </IconButton>
                <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'center' }}>
                  {t('replayTripOf')
                    .replace('{n}', tripState.index + 1)
                    .replace('{total}', tripState.list.length)}
                  {' · '}
                  {clockTime(tripState.list[tripState.index].startTime)}–
                  {clockTime(tripState.list[tripState.index].endTime)}
                </Typography>
                <IconButton
                  size="small"
                  disabled={loading || tripState.index >= tripState.list.length - 1}
                  onClick={() =>
                    playTrip(
                      tripState.list[tripState.index + 1],
                      tripState.index + 1,
                      tripState.list,
                    )
                  }
                >
                  <SkipNextIcon />
                </IconButton>
              </Stack>
              <Typography variant="caption" noWrap align="center">
                {tripState.list[tripState.index].from} → {tripState.list[tripState.index].to}
              </Typography>
              <Button
                size="small"
                startIcon={<ListIcon />}
                onClick={() => {
                  setPlaying(false);
                  setPositions([]);
                  setTripState(null);
                }}
              >
                {t('replayTripList')}
              </Button>
            </Stack>
          )}
          {loaded && (tab === 'trips' || !filterOpen) && (
            <>
              <Typography variant="subtitle1" align="center">
                {deviceName}
              </Typography>
              <Slider
                className={classes.slider}
                min={rangeStart}
                max={rangeEnd}
                value={index}
                onChange={(_, index) => setIndex(index)}
              />
              <div className={classes.controls}>
                <Typography variant="caption">{`${index - rangeStart + 1}/${visiblePositions.length}`}</Typography>
                <IconButton
                  onClick={() => setIndex((index) => index - 1)}
                  disabled={playing || index <= rangeStart}
                >
                  <FastRewindIcon />
                </IconButton>
                <IconButton onClick={() => setPlaying(!playing)} disabled={index >= rangeEnd}>
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={() => setIndex((index) => index + 1)}
                  disabled={playing || index >= rangeEnd}
                >
                  <FastForwardIcon />
                </IconButton>
                <Typography variant="caption">
                  {formatTime(positions[index].fixTime, 'seconds')}
                </Typography>
              </div>
              <div className={classes.speed}>
                <Typography variant="caption">{t('replaySpeed')}</Typography>
                <ToggleButtonGroup
                  color="primary"
                  size="small"
                  exclusive
                  value={speed}
                  onChange={(_, value) => value && setSpeed(value)}
                >
                  {SPEEDS.map((value) => (
                    <ToggleButton
                      key={value}
                      value={value}
                      sx={{ px: 1.2, py: 0.25, textTransform: 'none', fontWeight: 600 }}
                    >
                      {`${value}x`}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </div>
              {positions.length > 1 && (
                <div className={classes.range}>
                  <Typography variant="caption">{t('replayRange')}</Typography>
                  <Slider
                    size="small"
                    min={0}
                    max={positions.length - 1}
                    value={range}
                    onChange={handleRangeChange}
                    disabled={playing}
                    disableSwap
                  />
                  {tab === 'time' ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                      <TextField
                        size="small"
                        type="datetime-local"
                        label={t('replayRangeStart')}
                        value={toInputValue(positions[rangeStart].fixTime)}
                        onChange={(e) => setRangeFromInput('start', e.target.value)}
                        disabled={playing}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        type="datetime-local"
                        label={t('replayRangeEnd')}
                        value={toInputValue(positions[rangeEnd].fixTime)}
                        onChange={(e) => setRangeFromInput('end', e.target.value)}
                        disabled={playing}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                      />
                    </Stack>
                  ) : (
                    <div className={classes.rangeLabels}>
                      <Typography variant="caption">
                        {formatTime(positions[rangeStart].fixTime, 'minutes')}
                      </Typography>
                      <Typography variant="caption">
                        {formatTime(positions[rangeEnd].fixTime, 'minutes')}
                      </Typography>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <div style={{ display: tab === 'time' && (!loaded || filterOpen) ? 'block' : 'none' }}>
            <ReportFilter onShow={onShow} deviceType="single" loading={loading} />
          </div>
        </Paper>
      </div>
      {showCard && index < positions.length && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={positions[index]}
          onClose={() => setShowCard(false)}
          disableActions
        />
      )}
    </div>
  );
};

export default ReplayPage;
