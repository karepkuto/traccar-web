import { Container, Paper, Typography } from '@mui/material';
import LegalDocuments from './LegalDocuments';
import { LEGAL_VERSION } from './legalContent';

// Public page (no login needed): /legal
const LegalPage = () => (
  <Container maxWidth="md" sx={{ py: 3, height: '100%', overflowY: 'auto' }}>
    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5">Ketentuan Layanan dan Privasi</Typography>
      <Typography variant="caption" color="textSecondary">
        Versi {LEGAL_VERSION}
      </Typography>
      <LegalDocuments />
    </Paper>
  </Container>
);

export default LegalPage;
