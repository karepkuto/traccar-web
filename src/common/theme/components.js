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
        // Phones: expandable rows (labels come from MobileTableEnhancer).
        [theme.breakpoints.down('sm')]: {
          display: 'block',
          width: '100%',
          '& .MuiTableHead-root': {
            display: 'none',
          },
          '& .MuiTableBody-root, & .MuiTableFooter-root': {
            display: 'block',
          },
          '& .MuiTableRow-root': {
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiTableCell-root': {
            borderBottom: 'none',
            padding: theme.spacing(1, 1.5),
          },
          '& .MuiTableCell-root:has(.collection-actions)': {
            position: 'static',
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
          '& td[data-cell-kind="fixed"]': {
            flex: 'none',
            width: 'auto !important',
            display: 'flex',
            alignItems: 'center',
          },
          '& td[data-cell-kind="primary"]': {
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600,
          },
          '& tr[data-has-details]': {
            cursor: 'pointer',
          },
          '& tr[data-has-details]::after': {
            content: '"\\25BE"',
            order: 1,
            padding: theme.spacing(0, 1.5, 0, 0.5),
            color: theme.palette.text.secondary,
            transition: 'transform 0.15s',
          },
          '& tr.row-expanded::after': {
            transform: 'rotate(180deg)',
          },
          '& tr.row-expanded': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
          '& td[data-cell-kind="detail"]': {
            display: 'none',
            order: 2,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: theme.spacing(2),
            padding: theme.spacing(0.5, 2),
            textAlign: 'right',
            wordBreak: 'break-word',
          },
          '& tr.row-expanded td[data-cell-kind="detail"]': {
            display: 'flex',
          },
          '& tr.row-expanded td[data-cell-kind="detail"]:last-of-type': {
            paddingBottom: theme.spacing(1.5),
          },
          '& td[data-cell-kind="detail"]::before': {
            content: 'attr(data-label)',
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textAlign: 'left',
            flexShrink: 0,
          },
          // Footer (export button, switches) as a simple row.
          '& .MuiTableFooter-root .MuiTableRow-root': {
            justifyContent: 'space-between',
            borderBottom: 'none',
          },
          '& .MuiTableFooter-root .MuiTableCell-root': {
            display: 'block',
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
