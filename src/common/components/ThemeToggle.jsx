import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from './ThemeModeContext';
import { useTranslation } from './LocalizationProvider';

// Sun / moon button that switches between the light and dark theme.
const ThemeToggle = ({ color = 'inherit', sx }) => {
  const { darkMode, toggleDarkMode } = useThemeMode();
  const t = useTranslation();
  const title = t(darkMode ? 'themeLight' : 'themeDark');
  return (
    <Tooltip title={title}>
      <IconButton color={color} onClick={toggleDarkMode} aria-label={title} sx={sx}>
        {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
