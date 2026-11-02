import { useState } from 'react';
import { IconButton, Popover, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Small (i) button; tapping it shows a short description in a popover.
// Works the same on phones (tap) and desktop (click).
const InfoTip = ({ text, size = 'small', sx }) => {
  const [anchor, setAnchor] = useState(null);
  if (!text) {
    return null;
  }
  return (
    <>
      <IconButton
        size={size}
        aria-label="Info"
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(anchor ? null : event.currentTarget);
        }}
        sx={{ color: 'text.secondary', ...sx }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxWidth: 340, p: 1.5 } } }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {text}
        </Typography>
      </Popover>
    </>
  );
};

export default InfoTip;
