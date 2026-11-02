import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageLayout from '../../common/components/PageLayout';
import SettingsMenu from './SettingsMenu';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAsyncTask } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';

// Shared layout for the "Koneksi" (relations) pages: says which record is
// being edited, explains that changes save immediately, and offers a
// Back button, like a typical admin-panel relation form.
const ConnectionsLayout = ({
  endpoint,
  id,
  breadcrumbs,
  nameGetter = (it) => it.name,
  children,
}) => {
  const t = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useAsyncTask(
    async ({ signal }) => {
      const response = await fetchOrThrow(`/api/${endpoint}/${id}`, { signal });
      setName((await response.json()).name || '');
    },
    [endpoint, id],
  );

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={breadcrumbs}>
      <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6">
          {t('sharedConnections')}: {name}
        </Typography>
        <Alert severity="info" sx={{ my: 2 }}>
          {t('connectionsIntro').replace('{name}', name)}
        </Alert>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2.5}>{children}</Stack>
        </Paper>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            {t('connectionsBack')}
          </Button>
        </Stack>
      </Container>
    </PageLayout>
  );
};

export default ConnectionsLayout;
