import { useEffect } from 'react';
import { Snackbar, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from './common/components/LocalizationProvider';

// Apply an update without asking when it is found right after the app opens,
// or as soon as the app goes to the background. Otherwise show a prompt so a
// user in the middle of something is not interrupted by a reload.
const AUTO_UPDATE_WINDOW = 15000;
const APP_STARTED_AT = Date.now();

// Based on https://vite-pwa-org.netlify.app/frameworks/react.html
const UpdateController = () => {
  const t = useTranslation();

  const swUpdateInterval = useSelector(
    (state) => state.session.server.attributes.serviceWorkerUpdateInterval || 600000,
  );

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, swRegistration) {
      if (swUpdateInterval > 0 && swRegistration) {
        const checkForUpdate = async () => {
          if (swRegistration.installing || !navigator.onLine) {
            return;
          }
          const newSW = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache',
            },
          });
          if (newSW?.status === 200) {
            await swRegistration.update();
          }
        };
        setInterval(checkForUpdate, swUpdateInterval);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkForUpdate();
          }
        });
      }
    },
  });

  useEffect(() => {
    if (!needRefresh) {
      return undefined;
    }
    if (Date.now() - APP_STARTED_AT < AUTO_UPDATE_WINDOW) {
      updateServiceWorker(true);
      return undefined;
    }
    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        updateServiceWorker(true);
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [needRefresh, updateServiceWorker]);

  return (
    <Snackbar
      open={needRefresh}
      message={t('settingsUpdateAvailable')}
      action={
        <IconButton color="inherit" onClick={() => updateServiceWorker(true)}>
          <RefreshIcon />
        </IconButton>
      }
    />
  );
};

export default UpdateController;
