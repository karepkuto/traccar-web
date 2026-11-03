import { useState } from 'react';
import { CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import reloadApp from '../util/reloadApp';
import { useTranslation } from './LocalizationProvider';

// Shows which build is live: version · commit hash · commit date (WIB).
// Hovering shows the commit message. Values are baked in at build time
// (see vite.config.js).
const env = import.meta.env;

export const appVersionText = [
  env.VITE_APP_VERSION,
  env.VITE_APP_GIT_HASH,
  env.VITE_APP_COMMIT_TIME,
]
  .filter(Boolean)
  .join(' · ');

const tooltipContent = (
  <>
    {env.VITE_APP_COMMIT_MESSAGE && (
      <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line', mb: 1 }}>
        {env.VITE_APP_COMMIT_MESSAGE}
      </Typography>
    )}
    <Typography variant="caption" component="div">
      Branch: {env.VITE_APP_GIT_BRANCH}
    </Typography>
    <Typography variant="caption" component="div">
      Build: {env.VITE_APP_BUILD_TIME}
    </Typography>
  </>
);

// Version label plus a refresh button that reloads the newest version.
// Useful in the installed Android/iOS app, which has no browser reload.
const AppVersion = ({ align = 'center' }) => {
  const t = useTranslation();
  const [reloading, setReloading] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'left' ? 'flex-start' : 'center',
        minWidth: 0,
      }}
    >
      <Tooltip title={tooltipContent} placement="top" enterTouchDelay={0} arrow>
        <Typography
          variant="caption"
          color="textSecondary"
          component="div"
          noWrap
          sx={{ pl: 2, py: 1, opacity: 0.8, cursor: 'help', minWidth: 0 }}
        >
          {appVersionText}
        </Typography>
      </Tooltip>
      <Tooltip title={t('appReload')}>
        <IconButton
          size="small"
          aria-label={t('appReload')}
          disabled={reloading}
          onClick={() => {
            setReloading(true);
            reloadApp();
          }}
          sx={{ ml: 0.5, mr: 1, color: 'text.secondary' }}
        >
          {reloading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default AppVersion;
