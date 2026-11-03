import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import { useAsyncTask, useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { useAdministrator } from '../common/util/permissions';
import { formatTime } from '../common/util/formatter';
import RemoveDialog from '../common/components/RemoveDialog';

const PRESETS = [
  { hours: 1, key: 'share1h' },
  { hours: 24, key: 'share24h' },
  { hours: 72, key: 'share3d' },
  { hours: 168, key: 'share7d' },
];

const inputFormat = (value) => value.locale('en').format('YYYY-MM-DDTHH:mm');

// Share a live location as a link. The server creates a temporary,
// read-only account for it (email "<owner email>:<device uniqueId>"); only
// an administrator can list and delete those accounts, which revokes the link.
const SharePage = () => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();
  const admin = useAdministrator();

  const { type, id } = useParams();

  const item = useSelector((state) =>
    type === 'group' ? state.groups.items[id] : state.devices.items[id],
  );

  const [hours, setHours] = useState(24);
  const [expiration, setExpiration] = useState(() => inputFormat(dayjs().add(24, 'hour')));
  const [link, setLink] = useState();
  const [conflict, setConflict] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [shares, setShares] = useState(null);
  const [revoking, setRevoking] = useState(null);

  const suffix = type === 'group' ? `:group:${id}` : `:${item?.uniqueId}`;

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      if (admin && item) {
        const users = await (await fetchOrThrow('/api/users', { signal })).json();
        setShares(
          users
            .filter((user) => user.temporary && user.email?.endsWith(suffix))
            .sort((a, b) => String(b.expirationTime).localeCompare(String(a.expirationTime))),
        );
      }
    },
    [admin, item, suffix, reloadKey],
  );

  const choosePreset = (value) => {
    setHours(value);
    setExpiration(inputFormat(dayjs().add(value, 'hour')));
  };

  const handleShare = useCatch(async () => {
    setConflict(false);
    const response = await fetch(`/api/share/${type}`, {
      method: 'POST',
      body: new URLSearchParams(`${type}Id=${id}&expiration=${dayjs(expiration).toISOString()}`),
    });
    if (response.status === 409) {
      setConflict(true);
      return;
    }
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const token = await response.text();
    setLink(`${window.location.origin}?token=${token}`);
    setReloadKey((key) => key + 1);
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard unavailable: the link stays selectable in the field.
    }
  };

  const whatsapp = () => {
    const text = `${t('shareMessage').replace('{name}', item.name)} ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  if (!item) {
    return null;
  }

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['sharedShare']}>
      <Container maxWidth="sm" className={classes.container}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">{t('shareTitle')}</Typography>
              <Typography variant="body2" color="textSecondary">
                {item.name}
              </Typography>
            </Box>
            <Alert severity="info">{t('shareInfo')}</Alert>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('shareValidFor')}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {PRESETS.map((preset) => (
                  <Chip
                    key={preset.hours}
                    label={t(preset.key)}
                    color={hours === preset.hours ? 'primary' : 'default'}
                    variant={hours === preset.hours ? 'filled' : 'outlined'}
                    onClick={() => choosePreset(preset.hours)}
                  />
                ))}
              </Stack>
            </Box>
            <TextField
              label={t('shareUntil')}
              type="datetime-local"
              value={expiration}
              onChange={(e) => {
                setHours(null);
                setExpiration(e.target.value);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="contained" startIcon={<LinkIcon />} onClick={handleShare}>
              {t('shareCreate')}
            </Button>
            {conflict && (
              <Alert severity="warning">{t(admin ? 'shareConflictAdmin' : 'shareConflict')}</Alert>
            )}
            {link && (
              <>
                <TextField
                  value={link}
                  label={t('sharedLink')}
                  slotProps={{ input: { readOnly: true } }}
                  onFocus={(e) => e.target.select()}
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copy}>
                    {t('sharedCopy')}
                  </Button>
                  <Button variant="outlined" startIcon={<WhatsAppIcon />} onClick={whatsapp}>
                    WhatsApp
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {t('shareActive')}
          </Typography>
          {!admin && (
            <Typography variant="body2" color="textSecondary">
              {t('shareRevokeAdminOnly')}
            </Typography>
          )}
          {admin && !shares && <Typography color="textSecondary">…</Typography>}
          {admin && shares?.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              {t('shareNone')}
            </Typography>
          )}
          {admin &&
            shares?.map((share) => {
              const expired = share.expirationTime && !dayjs(share.expirationTime).isAfter(dayjs());
              return (
                <Box
                  key={share.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {t('shareBy')} {share.email.slice(0, share.email.length - suffix.length)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {t('shareUntil')}: {formatTime(share.expirationTime, 'minutes') || '-'}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={expired ? 'default' : 'success'}
                    label={t(expired ? 'shareExpired' : 'shareLive')}
                  />
                  <Button
                    size="small"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    onClick={() => setRevoking(share.id)}
                  >
                    {t('shareRevoke')}
                  </Button>
                </Box>
              );
            })}
        </Paper>

        <div className={classes.buttons}>
          <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
            {t('shareBack')}
          </Button>
        </div>
      </Container>
      <RemoveDialog
        open={Boolean(revoking)}
        endpoint="users"
        itemId={revoking}
        onResult={(removed) => {
          setRevoking(null);
          if (removed) {
            setReloadKey((key) => key + 1);
          }
        }}
      />
      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message={t('shareCopied')}
      />
    </PageLayout>
  );
};

export default SharePage;
