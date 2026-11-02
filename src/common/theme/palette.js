import { grey } from '@mui/material/colors';

const validatedColor = (color) => (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color) ? color : null);

// Pantauku brand: vivid orange. Server attributes colorPrimary/colorSecondary
// still override these defaults (Settings → Server → Attributes).
export const brandOrange = {
  light: '#FF6A00',
  dark: '#FF8A3D',
};

export default (server, darkMode) => ({
  mode: darkMode ? 'dark' : 'light',
  background: {
    default: darkMode ? '#121212' : '#F2F3F5',
    paper: darkMode ? '#1E1E1E' : '#FFFFFF',
  },
  primary: {
    main:
      validatedColor(server?.attributes?.colorPrimary) ||
      (darkMode ? brandOrange.dark : brandOrange.light),
  },
  secondary: {
    main: validatedColor(server?.attributes?.colorSecondary) || (darkMode ? '#FFA94D' : '#FF8A00'),
  },
  neutral: {
    main: grey[500],
  },
  geometry: {
    main: '#3bb2d0',
  },
  alwaysDark: {
    main: grey[900],
  },
});
