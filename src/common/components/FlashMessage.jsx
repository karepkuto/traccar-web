import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { FLASH_EVENT } from '../util/flash';

const FlashMessage = () => {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const listener = (event) => setFlash({ ...event.detail, key: Date.now() });
    window.addEventListener(FLASH_EVENT, listener);
    return () => window.removeEventListener(FLASH_EVENT, listener);
  }, []);

  return (
    <Snackbar
      key={flash?.key}
      open={Boolean(flash)}
      autoHideDuration={3500}
      onClose={() => setFlash(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {flash ? (
        <Alert severity={flash.severity} variant="filled" onClose={() => setFlash(null)}>
          {flash.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

export default FlashMessage;
