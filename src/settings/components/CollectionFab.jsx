import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Fab } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { LIST_ACTIONS_SLOT_ID } from './SearchHeader';

const useStyles = makeStyles()((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(2)})`,
    },
  },
}));

// "+ Tambah Data" button. Shown at the top right next to the search box
// when the page has one (Laravel-style), otherwise as a floating button.
const CollectionFab = ({ editPath, disabled }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    setSlot(document.getElementById(LIST_ACTIONS_SLOT_ID));
  }, []);

  if (readonly || disabled) {
    return '';
  }
  if (slot) {
    return createPortal(
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate(editPath)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {t('crudAdd')}
      </Button>,
      slot,
    );
  }
  return (
    <div className={classes.fab}>
      <Fab variant="extended" color="primary" onClick={() => navigate(editPath)}>
        <AddIcon sx={{ mr: 1 }} />
        {t('crudAdd')}
      </Fab>
    </div>
  );
};

export default CollectionFab;
