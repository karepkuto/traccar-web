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
  // Phones: every table scrolls sideways on its own instead of stretching
  // the page, rows stay one line high, the first column (usually the name)
  // stays visible on the left and the row actions stay visible on the right.
  MuiTable: {
    styleOverrides: {
      root: ({ theme }) => ({
        // Row actions (Ubah / Hapus) stay visible on the right on every screen
        // size, even when a wide table has to scroll.
        '& .MuiTableCell-root:has(.collection-actions)': {
          position: 'sticky',
          right: 0,
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
          boxShadow: `inset 1px 0 0 ${theme.palette.divider}`,
        },
        [theme.breakpoints.down('sm')]: {
          display: 'block',
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '& .MuiTableCell-root': {
            whiteSpace: 'nowrap',
            padding: theme.spacing(1, 1.5),
          },
          '& .MuiTableRow-root > .MuiTableCell-root:first-of-type': {
            position: 'sticky',
            left: 0,
            zIndex: 1,
            maxWidth: '42vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: theme.palette.background.default,
            boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
          },
          '& .MuiTableHead-root .MuiTableCell-root:first-of-type': {
            backgroundImage: `linear-gradient(${alpha(theme.palette.text.primary, 0.04)}, ${alpha(theme.palette.text.primary, 0.04)})`,
          },
          // Footer (export button, switches) stays put while rows scroll.
          '& .MuiTableFooter-root': {
            display: 'block',
            position: 'sticky',
            left: 0,
          },
          '& .MuiTableFooter-root .MuiTableRow-root': {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          '& .MuiTableFooter-root .MuiTableCell-root': {
            display: 'block',
            position: 'static',
            maxWidth: 'none',
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
        },
      }),
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiTableCell-head': {
          fontWeight: 700,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          whiteSpace: 'nowrap',
        },
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        '.MuiTableBody-root &:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      }),
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
