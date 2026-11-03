import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import GppBadIcon from '@mui/icons-material/GppBad';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import KeyIcon from '@mui/icons-material/Key';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import ReportFilter from './components/ReportFilter';
import { useAsyncTask, useCatchCallback } from '../reactHelper';
import useReportStyles from './common/useReportStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';
import { formatTime } from '../common/util/formatter';
import { getTimezone } from '../common/util/timezone';
import { ACTION_GROUPS, NAME_SOURCES, describe, roleKey } from './audit/auditDescribe';
import useAuditText from './audit/auditText';

const PAGE = 150;

const actionIcons = {
  login: LoginIcon,
  logout: LogoutIcon,
  denied: GppBadIcon,
  create: AddCircleOutlineIcon,
  edit: EditIcon,
  remove: DeleteIcon,
  link: LinkIcon,
  unlink: LinkOffIcon,
  command: SendIcon,
  report: DescriptionIcon,
  accumulators: RestartAltIcon,
  token: KeyIcon,
};

const AuditPage = () => {
  const { classes } = useReportStyles();
  const theme = useTheme();
  const t = useTranslation();
  const at = useAuditText();

  const [actions, setActions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState({});
  const [keyword, setKeyword] = useState('');
  const [actorIds, setActorIds] = useState([]);
  const [group, setGroup] = useState('all');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  // Names for people and objects; each list is optional (older servers or
  // disabled features simply leave ids unnamed).
  useAsyncTask(async ({ signal }) => {
    const entries = await Promise.all(
      Object.entries(NAME_SOURCES).map(async ([type, url]) => {
        try {
          const list = await (await fetchOrThrow(url, { signal })).json();
          return [type, new Map(list.map((item) => [item.id, item]))];
        } catch {
          return [type, new Map()];
        }
      }),
    );
    setNames(Object.fromEntries(entries));
  }, []);

  const onShow = useCatchCallback(async ({ from, to }) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetchOrThrow(`/api/audit?${query.toString()}`);
      setActions(await response.json());
      setLimit(PAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  const entries = useMemo(
    () =>
      (actions || [])
        .map((action) => describe(action, names, at))
        .sort((a, b) => String(b.time).localeCompare(String(a.time))),
    [actions, names, at],
  );

  const actorOptions = useMemo(() => {
    const ids = [...new Set(entries.map((entry) => entry.actorId).filter(Boolean))];
    return ids
      .map((id) => ({ id, name: names.user?.get(id)?.name || `#${id}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [entries, names]);

  const filtered = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        (!actorIds.length || actorIds.includes(entry.actorId)) &&
        (group === 'all' || entry.group === group) &&
        (!sensitiveOnly || entry.severity !== 'normal') &&
        (!lower ||
          [entry.actor?.name, entry.object, entry.target, entry.address, entry.verb].some(
            (text) => text && text.toLowerCase().includes(lower),
          )),
    );
  }, [entries, keyword, actorIds, group, sensitiveOnly]);

  const sensitiveCount = entries.filter((entry) => entry.severity !== 'normal').length;

  const actorName = (entry) =>
    entry.actor?.name || (entry.actionType === 'denied' ? entry.address : at('actor_unknown'));

  const sentence = (entry) =>
    [
      entry.actionType === 'denied' ? null : actorName(entry),
      entry.verb,
      entry.object,
      entry.target,
    ]
      .filter(Boolean)
      .join(' ');

  const handleExport = async () => {
    const rows = filtered.map((entry) => ({
      [at('colTime')]: formatTime(entry.time, 'seconds'),
      [at('colActor')]: actorName(entry),
      [at('colRole')]: entry.role ? t(roleKey(entry.role)) : '',
      [at('colActivity')]: sentence(entry),
      [at('colAddress')]: entry.address,
    }));
    const sheets = new Map();
    sheets.set(t('reportAudit'), rows);
    await exportExcel(t('reportAudit'), 'audit.xlsx', sheets, theme);
  };

  const colors = {
    danger: theme.palette.error.main,
    warning: theme.palette.warning.main,
    normal: theme.palette.text.secondary,
  };

  const shown = filtered.slice(0, limit);
  let lastDay = null;

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportAudit']}>
      <div className={classes.header}>
        <ReportFilter onShow={onShow} deviceType="none" loading={loading} />
      </div>
      {!actions && !loading && (
        <Typography color="textSecondary" sx={{ p: 3 }}>
          {at('empty')}
        </Typography>
      )}
      {actions && (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder={at('filterSearch')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              sx={{ flex: '1 1 220px' }}
            />
            <Autocomplete
              multiple
              size="small"
              options={actorOptions}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={actorOptions.filter((option) => actorIds.includes(option.id))}
              onChange={(_, value) => setActorIds(value.map((it) => it.id))}
              limitTags={1}
              renderInput={(params) => <TextField {...params} label={at('filterActor')} />}
              sx={{ flex: '1 1 220px' }}
            />
            <TextField
              select
              size="small"
              label={at('filterAction')}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              sx={{ flex: '1 1 170px' }}
            >
              <MenuItem value="all">{at('filterAll')}</MenuItem>
              {Object.keys(ACTION_GROUPS).map((key) => (
                <MenuItem key={key} value={key}>
                  {at(`group_${key}`)}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={sensitiveOnly}
                  onChange={(e) => setSensitiveOnly(e.target.checked)}
                />
              }
              label={at('filterSensitive')}
              sx={{ mr: 0 }}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!filtered.length}
            >
              {at('export')}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {at('summary', { n: entries.length, s: sensitiveCount })}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {at('note')}
            </Typography>
          </Box>
          {filtered.length === 0 ? (
            <Alert severity="info">{at('noResults')}</Alert>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {shown.map((entry) => {
                const Icon = actionIcons[entry.actionType] || EditIcon;
                const color = colors[entry.severity];
                const header = entry.day !== lastDay;
                lastDay = entry.day;
                const time = dayjs(entry.time).tz(getTimezone());
                return (
                  <Box key={entry.id}>
                    {header && (
                      <Box
                        sx={{
                          px: 2,
                          py: 0.75,
                          bgcolor: 'action.hover',
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
                          {time.format('dddd, D MMMM YYYY')}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1.5,
                        px: 2,
                        py: 1.25,
                        alignItems: 'flex-start',
                        borderTop: header ? 'none' : `1px solid ${theme.palette.divider}`,
                        boxShadow: entry.severity === 'normal' ? 'none' : `inset 3px 0 0 ${color}`,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(color, entry.severity === 'normal' ? 0.12 : 0.16),
                          color,
                          flex: 'none',
                        }}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {entry.actionType !== 'denied' && (
                            <Box component="span" sx={{ fontWeight: 700 }}>
                              {actorName(entry)}{' '}
                            </Box>
                          )}
                          <Box
                            component="span"
                            sx={{
                              color: entry.severity === 'normal' ? 'inherit' : color,
                              fontWeight: 600,
                            }}
                          >
                            {entry.verb}
                          </Box>
                          {entry.object && (
                            <>
                              {' '}
                              <Box component="span" sx={{ fontWeight: 600 }}>
                                {entry.object}
                              </Box>
                            </>
                          )}
                          {entry.target && ` ${entry.target}`}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 0.75,
                            mt: 0.25,
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            {time.format('HH:mm:ss')}
                          </Typography>
                          {entry.role && (
                            <Chip
                              size="small"
                              label={t(roleKey(entry.role))}
                              sx={{ height: 18, fontSize: '0.68rem' }}
                            />
                          )}
                          {entry.address && (
                            <Typography variant="caption" color="textSecondary">
                              IP {entry.address}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          )}
          {filtered.length > limit && (
            <Button onClick={() => setLimit(limit + PAGE)} sx={{ alignSelf: 'center' }}>
              {at('loadMore', { n: filtered.length - limit })}
            </Button>
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default AuditPage;
