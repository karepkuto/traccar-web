import { createContext, use } from 'react';

// Light / dark choice shared across the app (see AppThemeProvider).
export const ThemeModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeMode = () => use(ThemeModeContext);
