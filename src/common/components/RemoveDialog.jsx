import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import fetchOrThrow from '../util/fetchOrThrow';
import { setFlash } from '../util/flash';

// Delete confirmation as a modal dialog ("Are you sure?"), then a flash
// message once the item is gone.
const RemoveDialog = ({ open, endpoint, itemId, onResult }) => {
  const t = useTranslation();

  const handleRemove = useCatch(async () => {
    await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    setFlash(t('crudDeleted'));
    onResult(true);
  });

  return (
    <Dialog open={open} onClose={() => onResult(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('crudDeleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('crudDeleteText')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onResult(false)}>{t('sharedCancel')}</Button>
        <Button variant="contained" color="error" onClick={handleRemove}>
          {t('sharedRemove')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveDialog;
