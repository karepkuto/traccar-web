import { useState } from 'react';
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import RemoveDialog from '../../common/components/RemoveDialog';
import { useTranslation } from '../../common/components/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    paddingRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

// Row actions in the familiar "Ubah | Hapus" style. Extra actions stay as
// icons with tooltips on desktop; on phones everything is in an "Aksi" menu.
const CollectionActions = ({ itemId, editPath, endpoint, onReload, customActions, readonly }) => {
  const theme = useTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleEdit = () => {
    navigate(`${editPath}/${itemId}`);
    setMenuAnchorEl(null);
  };

  const handleRemove = () => {
    setRemoving(true);
    setMenuAnchorEl(null);
  };

  const handleCustom = (action) => {
    action.handler(itemId);
    setMenuAnchorEl(null);
  };

  const handleRemoveResult = (removed) => {
    setRemoving(false);
    if (removed) {
      onReload();
    }
  };

  return (
    <>
      {phone ? (
        <>
          <Button
            className="collection-actions"
            size="small"
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            onClick={(event) => setMenuAnchorEl(event.currentTarget)}
            sx={{ mr: 1 }}
          >
            {t('crudActions')}
          </Button>
          <Menu open={!!menuAnchorEl} anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)}>
            {customActions &&
              customActions.map((action) => (
                <MenuItem onClick={() => handleCustom(action)} key={action.key}>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText>{action.title}</ListItemText>
                </MenuItem>
              ))}
            {!readonly && editPath && (
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('sharedEdit')}</ListItemText>
              </MenuItem>
            )}
            {!readonly && (
              <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>{t('sharedRemove')}</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      ) : (
        <div className={`${classes.row} collection-actions`}>
          {customActions &&
            customActions.map((action) => (
              <Tooltip title={action.title} key={action.key}>
                <IconButton size="small" onClick={() => handleCustom(action)}>
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          {!readonly && (
            <>
              {editPath && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={handleEdit}
                >
                  {t('sharedEdit')}
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={handleRemove}
              >
                {t('sharedRemove')}
              </Button>
            </>
          )}
        </div>
      )}
      <RemoveDialog
        open={removing}
        endpoint={endpoint}
        itemId={itemId}
        onResult={handleRemoveResult}
      />
    </>
  );
};

export default CollectionActions;
