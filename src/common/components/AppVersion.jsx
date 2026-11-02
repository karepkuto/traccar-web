import { Typography } from '@mui/material';

// Shows which build is live: version · git hash · build time (WIB).
// Values are baked in at build time (see vite.config.js).
export const appVersionText = [
  import.meta.env.VITE_APP_VERSION,
  import.meta.env.VITE_APP_GIT_HASH,
  import.meta.env.VITE_APP_BUILD_TIME,
]
  .filter(Boolean)
  .join(' · ');

const AppVersion = ({ align = 'center' }) => (
  <Typography
    variant="caption"
    color="textSecondary"
    component="div"
    align={align}
    title={import.meta.env.VITE_APP_GIT_BRANCH}
    sx={{ px: 2, py: 1, opacity: 0.8 }}
  >
    {appVersionText}
  </Typography>
);

export default AppVersion;
