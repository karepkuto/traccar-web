import { alpha } from '@mui/material/styles';

const softShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';

export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      // Map controls as soft rounded floating buttons.
      '.maplibregl-ctrl-group': {
        borderRadius: '14px !important',
        boxShadow: `${softShadow} !important`,
        overflow: 'hidden',
      },
      '.maplibregl-ctrl-group button:hover': {
        backgroundColor: `${alpha(theme.palette.primary.main, 0.12)} !important`,
      },
    }),
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        borderRadius: 12,
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 600,
      },
      sizeMedium: {
        height: '40px',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: softShadow,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: softShadow,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: 3,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
        },
        '&.Mui-selected:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.18),
        },
      }),
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
};
