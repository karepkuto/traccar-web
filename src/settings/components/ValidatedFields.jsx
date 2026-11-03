import { TextField } from '@mui/material';
import PasswordField from '../../common/components/PasswordField';
import { useFormSubmitted } from './FormValidationContext';

// Text inputs that show their error (red text under the field) once the
// user has pressed Save on an invalid form, otherwise the normal helper.
export const ValidatedTextField = ({ error, helper, ...props }) => {
  const submitted = useFormSubmitted();
  const show = submitted && error;
  return <TextField {...props} error={Boolean(show)} helperText={show ? error : helper} />;
};

export const ValidatedPasswordField = ({ error, helper, ...props }) => {
  const submitted = useFormSubmitted();
  const show = submitted && error;
  return <PasswordField {...props} error={Boolean(show)} helperText={show ? error : helper} />;
};
