import { Tooltip, Typography } from '@mui/material';

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

const AppVersion = ({ align = 'center' }) => (
  <Tooltip title={tooltipContent} placement="top" enterTouchDelay={0} arrow>
    <Typography
      variant="caption"
      color="textSecondary"
      component="div"
      align={align}
      sx={{ px: 2, py: 1, opacity: 0.8, cursor: 'help' }}
    >
      {appVersionText}
    </Typography>
  </Tooltip>
);

export default AppVersion;
