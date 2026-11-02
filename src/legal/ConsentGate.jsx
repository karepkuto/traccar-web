import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { sessionActions } from '../store';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { CONSENT_ATTRIBUTES, LEGAL_VERSION, getConsentItems } from './legalContent';
import LegalDocuments from './LegalDocuments';

export const needsConsent = (user) =>
  Boolean(user) &&
  !user.administrator &&
  user.attributes?.[CONSENT_ATTRIBUTES.version] !== LEGAL_VERSION;

export const isManagerUser = (user) => Boolean(user) && (user.userLimit || 0) !== 0;

// Blocks the app until the user ticks every item. The record (version, time,
// items, role, browser) is saved on the user so it can be shown later as
// proof of consent; the server audit log also records the user update.
const ConsentGate = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const manager = isManagerUser(user);
  const items = getConsentItems({ manager });

  const [checked, setChecked] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const allChecked = items.every((item) => checked[item.id]);

  const handleAccept = async () => {
    setSaving(true);
    setError(null);
    try {
      const attributes = {
        ...user.attributes,
        termsAccepted: true,
        [CONSENT_ATTRIBUTES.version]: LEGAL_VERSION,
        [CONSENT_ATTRIBUTES.acceptedAt]: new Date().toISOString(),
        [CONSENT_ATTRIBUTES.items]: items.map((item) => item.id).join(','),
        [CONSENT_ATTRIBUTES.role]: manager ? 'reseller' : 'user',
        [CONSENT_ATTRIBUTES.userAgent]: navigator.userAgent.slice(0, 250),
      };
      const response = await fetchOrThrow(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, attributes }),
      });
      dispatch(sessionActions.updateUser(await response.json()));
    } catch (e) {
      setError(e.message || 'Gagal menyimpan persetujuan.');
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  return (
    <Dialog open fullWidth fullScreen={phone} maxWidth="md" scroll="paper">
      <DialogTitle>Persetujuan Penggunaan Layanan</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary">
          Sebelum melanjutkan, baca ketentuan di bawah ini lalu centang semua pernyataan di bagian
          akhir. Persetujuan Anda dicatat beserta waktu dan versinya.
        </Typography>
        <LegalDocuments manager={manager} />
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Pernyataan
        </Typography>
        <FormGroup>
          {items.map((item) => (
            <FormControlLabel
              key={item.id}
              sx={{ alignItems: 'flex-start', mb: 1 }}
              control={
                <Checkbox
                  sx={{ pt: 0.25 }}
                  checked={Boolean(checked[item.id])}
                  onChange={(e) => setChecked({ ...checked, [item.id]: e.target.checked })}
                />
              }
              label={<Typography variant="body2">{item.label}</Typography>}
            />
          ))}
        </FormGroup>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDecline} disabled={saving}>
          Tolak dan keluar
        </Button>
        <Button variant="contained" onClick={handleAccept} disabled={!allChecked || saving}>
          Saya Setuju
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentGate;
