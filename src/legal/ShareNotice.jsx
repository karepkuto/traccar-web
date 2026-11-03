import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import { LEGAL_OPERATOR } from './legalContent';

// Short terms for people who open a shared location link. The link logs in
// as a temporary, read-only account, so nothing can be stored on the server;
// the acknowledgement is kept in this browser only.
export const SHARE_NOTICE_VERSION = '2026-11-03';

const storageKey = (user) => `shareNotice:${user.id}`;

export const needsShareNotice = (user) => {
  if (!user?.temporary) {
    return false;
  }
  try {
    return window.localStorage.getItem(storageKey(user)) !== SHARE_NOTICE_VERSION;
  } catch {
    return true;
  }
};

const points = [
  'Lokasi ini dibagikan oleh pemilik kendaraan dan hanya boleh dipakai untuk keperluan yang ia izinkan.',
  'Jangan menyebarkan tautan ini atau memakai lokasi untuk menguntit, mengancam, atau tindakan melanggar hukum.',
  'Akses berakhir otomatis sesuai batas waktu tautan, atau saat pemilik mencabutnya.',
  'Lokasi bisa terlambat atau kurang akurat karena sinyal GPS dan jaringan.',
];

const ShareNotice = ({ user, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  const accept = () => {
    try {
      window.localStorage.setItem(storageKey(user), SHARE_NOTICE_VERSION);
    } catch {
      // Private mode: the notice shows again next time.
    }
    onAccept();
  };

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShareLocationIcon color="primary" />
        Lokasi yang Dibagikan
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
          Anda membuka tautan lokasi dari {LEGAL_OPERATOR.brand}. Dengan melanjutkan, Anda setuju:
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 1 } }}>
          {points.map((point) => (
            <li key={point}>
              <Typography variant="body2">{point}</Typography>
            </li>
          ))}
        </Box>
        <FormControlLabel
          sx={{ mt: 1 }}
          control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
          label={<Typography variant="body2">Saya mengerti dan setuju.</Typography>}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={accept} disabled={!agreed} fullWidth>
          Lihat Lokasi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareNotice;
