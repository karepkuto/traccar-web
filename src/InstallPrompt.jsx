import { useEffect, useState } from 'react';
import { Button, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import IosShareIcon from '@mui/icons-material/IosShare';

// Our own "install the app" banner. Chrome's built-in prompt appears only
// occasionally and is hidden for months once dismissed, so customers rarely
// see it. On iOS (no install API) we show the Add to Home Screen steps.
const DISMISS_KEY = 'installPromptDismissedAt';
const DISMISS_DAYS = 7;

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

const recentlyDismissed = () => {
  try {
    const value = Number(window.localStorage.getItem(DISMISS_KEY));
    return value && Date.now() - value < DISMISS_DAYS * 24 * 3600 * 1000;
  } catch {
    return false;
  }
};

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(() => isStandalone() || recentlyDismissed());

  useEffect(() => {
    if (hidden) {
      return undefined;
    }
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    if (isIos()) {
      setShowIos(true);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [hidden]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // storage unavailable: just hide for this visit
    }
    setHidden(true);
  };

  const install = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setHidden(true);
    }
  };

  if (hidden || (!deferredPrompt && !showIos)) {
    return null;
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        zIndex: 1400,
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: '16px',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <img src="/pantauku-64.png" alt="" width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Typography variant="subtitle2">Pasang aplikasi Pantauku</Typography>
        {deferredPrompt ? (
          <Typography variant="caption" color="textSecondary">
            Buka lebih cepat langsung dari layar utama.
          </Typography>
        ) : (
          <Typography variant="caption" color="textSecondary">
            Ketuk <IosShareIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Bagikan, lalu
            pilih &quot;Tambahkan ke Layar Utama&quot;.
          </Typography>
        )}
      </div>
      {deferredPrompt && (
        <Button variant="contained" size="small" startIcon={<GetAppIcon />} onClick={install}>
          Pasang
        </Button>
      )}
      <IconButton size="small" onClick={dismiss} aria-label="Tutup">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default InstallPrompt;
