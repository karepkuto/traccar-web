import { Collapse, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import DrawIcon from '@mui/icons-material/Draw';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import SendIcon from '@mui/icons-material/Send';
import DnsIcon from '@mui/icons-material/Dns';
import HelpIcon from '@mui/icons-material/Help';
import PaymentIcon from '@mui/icons-material/Payment';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalculateIcon from '@mui/icons-material/Calculate';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GavelIcon from '@mui/icons-material/Gavel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAdministrator, useManager, useRestriction } from '../../common/util/permissions';
import useFeatures from '../../common/util/useFeatures';
import usePersistedState from '../../common/util/usePersistedState';
import MenuItem from '../../common/components/MenuItem';
import AppVersion from '../../common/components/AppVersion';

// Settings grouped by category; each group is a collapsible sub menu.
// The group holding the current page opens automatically; groups the user
// opens or closes are remembered on this device.
const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();
  const path = location.pathname;

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector((state) => state.session.server.attributes.support);
  const billingLink = useSelector((state) => state.session.user.attributes.billingLink);

  const features = useFeatures();

  const [openGroups, setOpenGroups] = usePersistedState('settingsMenuGroups', {});

  const groups = [
    {
      key: 'account',
      title: t('menuGroupAccount'),
      items: [
        {
          title: t('sharedPreferences'),
          link: '/settings/preferences',
          icon: <TuneIcon />,
          selected: path === '/settings/preferences',
        },
        !readonly && {
          title: t('settingsUser'),
          link: `/settings/user/${userId}`,
          icon: <PersonIcon />,
          selected: path === `/settings/user/${userId}`,
        },
      ],
    },
    {
      key: 'fleet',
      title: t('menuGroupFleet'),
      items: readonly
        ? []
        : [
            {
              title: t('deviceTitle'),
              link: '/settings/devices',
              icon: <DnsIcon />,
              selected: path.startsWith('/settings/device'),
            },
            !features.disableGroups && {
              title: t('settingsGroups'),
              link: '/settings/groups',
              icon: <FolderIcon />,
              selected: path.startsWith('/settings/group'),
            },
            !features.disableDrivers && {
              title: t('sharedDrivers'),
              link: '/settings/drivers',
              icon: <BadgeIcon />,
              selected: path.startsWith('/settings/driver'),
            },
            {
              title: t('sharedGeofences'),
              link: '/geofences',
              icon: <DrawIcon />,
              selected: path.startsWith('/settings/geofence') || path === '/geofences',
            },
          ],
    },
    {
      key: 'rules',
      title: t('menuGroupRules'),
      // Resellers manage accounts and devices; rules belong to customers.
      items:
        readonly || (manager && !admin)
          ? []
          : [
              {
                title: t('sharedNotifications'),
                link: '/settings/notifications',
                icon: <NotificationsIcon />,
                selected: path.startsWith('/settings/notification'),
              },
              !features.disableSavedCommands && {
                title: t('sharedSavedCommands'),
                link: '/settings/commands',
                icon: <SendIcon />,
                selected: path.startsWith('/settings/command'),
              },
              !features.disableMaintenance && {
                title: t('sharedMaintenance'),
                link: '/settings/maintenances',
                icon: <BuildIcon />,
                selected: path.startsWith('/settings/maintenance'),
              },
              !features.disableCalendars && {
                title: t('sharedCalendars'),
                link: '/settings/calendars',
                icon: <TodayIcon />,
                selected: path.startsWith('/settings/calendar'),
              },
              !features.disableComputedAttributes && {
                title: t('sharedComputedAttributes'),
                link: '/settings/attributes',
                icon: <CalculateIcon />,
                selected: path.startsWith('/settings/attribute'),
              },
            ],
    },
    {
      key: 'business',
      title: t('menuGroupBusiness'),
      items: manager
        ? [
            {
              title: t('userBilling'),
              link: '/settings/billing',
              icon: <ReceiptLongIcon />,
              selected: path === '/settings/billing',
            },
            admin && {
              title: t('resellerTitle'),
              link: '/settings/resellers',
              icon: <StorefrontIcon />,
              selected: path === '/settings/resellers',
            },
            {
              title: t('settingsUsers'),
              link: '/settings/users',
              icon: <PeopleIcon />,
              selected: path.startsWith('/settings/user') && path !== `/settings/user/${userId}`,
            },
            {
              title: t('legalConsents'),
              link: '/settings/consents',
              icon: <GavelIcon />,
              selected: path === '/settings/consents',
            },
            {
              title: t('serverAnnouncement'),
              link: '/settings/announcement',
              icon: <CampaignIcon />,
              selected: path === '/settings/announcement',
            },
          ]
        : [],
    },
    {
      key: 'system',
      title: t('menuGroupSystem'),
      items: admin
        ? [
            {
              title: t('settingsServer'),
              link: '/settings/server',
              icon: <SettingsIcon />,
              selected: path === '/settings/server',
            },
          ]
        : [],
    },
    {
      key: 'help',
      title: t('menuGroupHelp'),
      items: [
        billingLink && { title: t('userBilling'), link: billingLink, icon: <PaymentIcon /> },
        supportLink && { title: t('settingsSupport'), link: supportLink, icon: <HelpIcon /> },
      ],
    },
  ]
    .map((group) => ({ ...group, items: group.items.filter(Boolean) }))
    .filter((group) => group.items.length > 0);

  const isOpen = (group) => {
    const stored = openGroups[group.key];
    if (stored !== undefined) {
      return stored;
    }
    return group.items.some((item) => item.selected) || group.key === 'account';
  };

  const toggle = (group) => setOpenGroups({ ...openGroups, [group.key]: !isOpen(group) });

  return (
    <>
      <List dense disablePadding>
        {groups.map((group) => {
          const open = isOpen(group);
          return (
            <div key={group.key}>
              <ListItemButton onClick={() => toggle(group)} sx={{ py: 1 }}>
                <ListItemText
                  primary={group.title}
                  slotProps={{
                    primary: {
                      variant: 'overline',
                      sx: { fontWeight: 700, letterSpacing: 0.8, lineHeight: 1.6 },
                      color: group.items.some((item) => item.selected)
                        ? 'primary'
                        : 'textSecondary',
                    },
                  }}
                />
                {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {group.items.map((item) => (
                    <MenuItem
                      key={item.link}
                      title={item.title}
                      link={item.link}
                      icon={item.icon}
                      selected={item.selected}
                    />
                  ))}
                </List>
              </Collapse>
              <Divider />
            </div>
          );
        })}
      </List>
      <AppVersion align="left" />
    </>
  );
};

export default SettingsMenu;
