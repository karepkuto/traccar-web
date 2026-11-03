import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from '../common/components/LocalizationProvider';
import { getBillingThresholds } from '../billing/billingLogic';
import { billingFilterKey, ignitionKey, isFilterActive, motionKey } from './filterLogic';

const CUSTOMER_CHIPS_MIN_DEVICES = 6;

// Quick one-tap filters with live counts, plus a summary line whenever a
// filter or sort is active so devices never seem to "disappear".
const FilterBar = ({
  filter,
  setFilter,
  filterSort,
  filteredCount,
  ownerOptions,
  manager,
  onReset,
}) => {
  const theme = useTheme();
  const t = useTranslation();
  const devices = useSelector((state) => state.devices.items);
  const positions = useSelector((state) => state.session.positions);
  const server = useSelector((state) => state.session.server);
  const thresholds = useMemo(() => getBillingThresholds(server), [server]);

  const deviceList = Object.values(devices);
  const total = deviceList.length;

  const chips = useMemo(() => {
    const count = (fn) => deviceList.filter(fn).length;
    const status = (value) => count((d) => d.status === value);
    const billing = (value) => count((d) => billingFilterKey(d, thresholds) === value);
    const common = [
      {
        key: 'statuses',
        value: 'online',
        label: t('deviceStatusOnline'),
        color: 'success',
        count: status('online'),
      },
      {
        key: 'statuses',
        value: 'offline',
        label: t('deviceStatusOffline'),
        color: 'error',
        count: status('offline'),
      },
    ];
    if (manager) {
      return [
        ...common,
        {
          key: 'billing',
          value: 'trial',
          label: t('filterBillingTrial'),
          color: 'info',
          count: billing('trial'),
        },
        {
          key: 'billing',
          value: 'expired',
          label: t('filterBillingExpired'),
          color: 'error',
          count: billing('expired'),
        },
        {
          key: 'billing',
          value: 'soon',
          label: t('filterBillingSoon'),
          color: 'warning',
          count: billing('soon'),
        },
      ];
    }
    return [
      ...common,
      {
        key: 'motion',
        value: 'moving',
        label: t('filterMoving'),
        color: 'primary',
        count: count((d) => motionKey(positions[d.id]) === 'moving'),
      },
      {
        key: 'ignition',
        value: 'on',
        label: t('filterIgnitionOn'),
        color: 'success',
        count: count((d) => ignitionKey(positions[d.id]) === 'on'),
      },
    ];
  }, [deviceList, positions, thresholds, manager, t]);

  const toggle = (key, value) => {
    const current = filter[key];
    setFilter({
      ...filter,
      [key]: current.includes(value) ? current.filter((it) => it !== value) : [...current, value],
    });
  };

  const showChips = manager || total >= CUSTOMER_CHIPS_MIN_DEVICES;
  const active = isFilterActive(filter);
  const showSummary = active || Boolean(filterSort);

  const selectedOwners = filter.users
    .map((id) => ownerOptions?.find((user) => user.id === id))
    .filter(Boolean);

  const sortLabels = {
    expiration: t('sortExpiration'),
    status: t('sortStatus'),
    lastUpdate: t('deviceLastUpdate'),
    name: t('sharedName'),
    speed: t('sortSpeed'),
  };

  if (!showChips && !showSummary) {
    return null;
  }

  return (
    <Box sx={{ px: 2, pb: 1.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {showChips && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            // Phones: one swipeable line that fades out at the edge.
            // Desktop: chips wrap so nothing is cut off.
            flexWrap: { xs: 'nowrap', md: 'wrap' },
            overflowX: { xs: 'auto', md: 'visible' },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            maskImage: {
              xs: 'linear-gradient(to right, #000 calc(100% - 32px), transparent)',
              md: 'none',
            },
          }}
        >
          {chips.map((chip) => {
            const selected = filter[chip.key].includes(chip.value);
            const main = theme.palette[chip.color].main;
            return (
              <Chip
                key={`${chip.key}-${chip.value}`}
                size="small"
                clickable
                onClick={() => toggle(chip.key, chip.value)}
                label={
                  <>
                    {chip.label}
                    <Box
                      component="span"
                      sx={{ ml: 0.75, fontWeight: 700, opacity: selected ? 1 : 0.7 }}
                    >
                      {chip.count}
                    </Box>
                  </>
                }
                sx={{
                  flex: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  border: `1px solid ${selected ? main : theme.palette.divider}`,
                  bgcolor: selected ? alpha(main, 0.16) : 'transparent',
                  color: selected ? main : 'text.primary',
                  '&:hover': { bgcolor: alpha(main, selected ? 0.22 : 0.08) },
                  '&::before': {
                    content: '""',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: main,
                    ml: 1,
                    flex: 'none',
                  },
                  '& .MuiChip-label': { pl: 0.75 },
                }}
              />
            );
          })}
        </Box>
      )}
      {showSummary && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="textSecondary" sx={{ flex: 1, minWidth: 0 }}>
            {active && t('filterShowing').replace('{n}', filteredCount).replace('{total}', total)}
            {active && filterSort && ' · '}
            {filterSort && `${t('filterSortedBy')} ${sortLabels[filterSort] || ''}`}
          </Typography>
          <Button size="small" variant="text" onClick={onReset} sx={{ minWidth: 0, py: 0 }}>
            {t('filterReset')}
          </Button>
          {selectedOwners.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', width: '100%' }}>
              {selectedOwners.map((owner) => (
                <Chip
                  key={owner.id}
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={owner.name}
                  onDelete={() =>
                    setFilter({ ...filter, users: filter.users.filter((id) => id !== owner.id) })
                  }
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FilterBar;
