import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import theme from './common/theme';
import { useLocalization } from './common/components/LocalizationProvider';
import { ThemeModeContext } from './common/components/ThemeModeContext';
import usePersistedState from './common/util/usePersistedState';

const cache = {
  ltr: createCache({
    key: 'muiltr',
    stylisPlugins: [prefixer],
  }),
  rtl: createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  }),
};

const AppThemeProvider = ({ children }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();

  // Pantauku: light by default. The user's own choice (sun / moon toggle)
  // is remembered on this device; otherwise the server 'darkMode'
  // attribute applies if an admin set it. The phone's system theme is
  // deliberately ignored so everyone starts with the same look.
  const [userMode, setUserMode] = usePersistedState('themeMode', null);
  const serverDarkMode = server?.attributes?.darkMode;
  let darkMode = false;
  if (userMode === 'dark' || userMode === 'light') {
    darkMode = userMode === 'dark';
  } else if (serverDarkMode !== undefined) {
    darkMode = serverDarkMode === true || serverDarkMode === 'true';
  }

  const toggleDarkMode = useCallback(
    () => setUserMode(darkMode ? 'light' : 'dark'),
    [darkMode, setUserMode],
  );
  const modeValue = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);

  const themeInstance = theme(server, darkMode, direction);

  return (
    <CacheProvider value={cache[direction]}>
      <ThemeModeContext value={modeValue}>
        <ThemeProvider theme={themeInstance}>{children}</ThemeProvider>
      </ThemeModeContext>
    </CacheProvider>
  );
};

export default AppThemeProvider;
