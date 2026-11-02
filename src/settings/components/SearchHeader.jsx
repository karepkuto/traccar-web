import { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from '../../common/components/LocalizationProvider';

export const LIST_ACTIONS_SLOT_ID = 'list-actions-slot';

const useStyles = makeStyles()((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      alignItems: 'stretch',
    },
  },
  search: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    '&:empty': {
      display: 'none',
    },
  },
}));

// Search box plus a slot on the right where the list's "Add" button
// (CollectionFab) is placed, like the header of a Laravel index page.
const SearchHeader = ({ keyword, setKeyword }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const [input, setInput] = useState(keyword);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => setKeyword(input), 500);
    return () => clearTimeout(timerRef.current);
  }, [input, setKeyword]);

  return (
    <div className={classes.header}>
      <TextField
        className={classes.search}
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <div id={LIST_ACTIONS_SLOT_ID} className={classes.actions} />
    </div>
  );
};

export default SearchHeader;
