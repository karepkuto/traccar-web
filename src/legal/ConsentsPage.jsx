import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from '../settings/components/SettingsMenu';
import SearchHeader from '../settings/components/SearchHeader';
import TableShimmer from '../common/components/TableShimmer';
import useSettingsStyles from '../settings/common/useSettingsStyles';
import { useAsyncTask } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useSelector } from 'react-redux';
import fetchOrThrow from '../common/util/fetchOrThrow';
import exportExcel from '../common/util/exportExcel';
import { CONSENT_ATTRIBUTES, LEGAL_VERSION } from './legalContent';

const statusOf = (user, serverReadonly) => {
  if (user.administrator) {
    return { label: 'Admin', color: 'default' };
  }
  const version = user.attributes?.[CONSENT_ATTRIBUTES.version];
  if (version === LEGAL_VERSION) {
    return { label: 'Setuju', color: 'success' };
  }
  if ((user.readonly || serverReadonly) && user.attributes?.termsAccepted) {
    // Read-only accounts cannot store the detailed record (or a newer
    // version) on the server; checked before "old version" on purpose.
    return { label: 'Setuju (akun hanya-baca)', color: 'info' };
  }
  if (version) {
    return { label: 'Versi lama', color: 'warning' };
  }
  return { label: 'Belum', color: 'error' };
};

// Consent records of all users visible to the admin / reseller.
const ConsentsPage = () => {
  const serverReadonly = useSelector((state) => state.session.server.readonly);
  const { classes } = useSettingsStyles();
  const theme = useTheme();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useAsyncTask(async ({ signal }) => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/users', { signal });
      setItems(await response.json());
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const rows = useMemo(() => {
    const lower = keyword.trim().toLowerCase();
    return items.filter(
      (item) =>
        !lower ||
        item.name?.toLowerCase().includes(lower) ||
        item.email?.toLowerCase().includes(lower),
    );
  }, [items, keyword]);

  const handleExport = async () => {
    const data = rows.map((item) => ({
      Nama: item.name,
      Email: item.email,
      Status: statusOf(item, serverReadonly).label,
      Peran: item.attributes?.[CONSENT_ATTRIBUTES.role] || '',
      Versi: item.attributes?.[CONSENT_ATTRIBUTES.version] || '',
      'Waktu Setuju (WIB)': formatTime(item.attributes?.[CONSENT_ATTRIBUTES.acceptedAt]),
      'Waktu Setuju (UTC)': item.attributes?.[CONSENT_ATTRIBUTES.acceptedAt] || '',
      Pernyataan: item.attributes?.[CONSENT_ATTRIBUTES.items] || '',
      Perangkat: item.attributes?.[CONSENT_ATTRIBUTES.userAgent] || '',
    }));
    const sheets = new Map();
    sheets.set('Persetujuan', data);
    await exportExcel('Persetujuan', 'persetujuan.xlsx', sheets, theme);
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'legalConsents']}>
      <SearchHeader keyword={keyword} setKeyword={setKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Nama</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Versi</TableCell>
            <TableCell>Waktu Setuju</TableCell>
            <TableCell>Peran</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableShimmer columns={6} />
          ) : (
            rows.map((item) => {
              const status = statusOf(item, serverReadonly);
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={status.label}
                      color={status.color}
                    />
                  </TableCell>
                  <TableCell>{item.attributes?.[CONSENT_ATTRIBUTES.version]}</TableCell>
                  <TableCell>
                    {formatTime(item.attributes?.[CONSENT_ATTRIBUTES.acceptedAt], 'minutes')}
                  </TableCell>
                  <TableCell>{item.attributes?.[CONSENT_ATTRIBUTES.role]}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <Button onClick={handleExport} variant="text" disabled={rows.length === 0}>
                Ekspor
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </PageLayout>
  );
};

export default ConsentsPage;
