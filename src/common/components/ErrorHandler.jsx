import {
  Snackbar,
  Alert,
  Button,
  Link,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from '../../reactHelper';
import { errorsActions } from '../../store';
import { useTranslation } from './LocalizationProvider';

// Common technical errors shown in plain language; the original text
// stays available under "More details".
const FRIENDLY_ERRORS = [
  [/failed to fetch|networkerror|load failed|network request failed/i, 'errorNetwork'],
  [/device limit/i, 'errorDeviceLimit'],
  [/user limit/i, 'errorUserLimit'],
  [/duplicate|unique constraint|already exists/i, 'errorDuplicate'],
  [/has expired/i, 'errorExpired'],
  [/is disabled/i, 'errorDisabled'],
  [
    /readonly|read-only|administrator access|manager access|permission|access denied|forbidden/i,
    'errorPermission',
  ],
  [/unauthorized|http 401/i, 'errorSession'],
];

const friendlyErrorKey = (message) => {
  const match = FRIENDLY_ERRORS.find(([pattern]) => pattern.test(message));
  return match ? match[1] : null;
};

const ErrorHandler = () => {
  const dispatch = useDispatch();
  const t = useTranslation();

  const error = useSelector((state) => state.errors.errors.find(() => true));
  const cachedError = usePrevious(error);

  const message = error || cachedError;
  const multiline = message?.includes('\n');
  const rawMessage = multiline
    ? message.split('\n')[0].replace(/^(?:(?:[\w$]+\.)*[\w$]+(?:Exception|Error)?:\s*)+/i, '')
    : message;
  const friendlyKey = message ? friendlyErrorKey(message) : null;
  const displayMessage = friendlyKey ? t(friendlyKey) : rawMessage;

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Snackbar open={Boolean(error) && !expanded}>
        <Alert
          elevation={6}
          onClose={() => dispatch(errorsActions.pop())}
          severity="error"
          variant="filled"
        >
          {displayMessage}
          {(multiline || friendlyKey) && (
            <>
              {' | '}
              <Link color="inherit" href="#" onClick={() => setExpanded(true)}>
                {t('sharedShowDetails')}
              </Link>
            </>
          )}
        </Alert>
      </Snackbar>
      <Dialog open={expanded} onClose={() => setExpanded(false)} maxWidth={false}>
        <DialogContent>
          <DialogContentText component="div">
            <Typography component="pre" variant="caption">
              {message}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpanded(false)} autoFocus>
            {t('sharedHide')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ErrorHandler;
