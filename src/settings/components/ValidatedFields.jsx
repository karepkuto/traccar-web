import { FormControl, FormHelperText, TextField } from '@mui/material';
import PasswordField from '../../common/components/PasswordField';
import SelectField from '../../common/components/SelectField';
import { useFormSubmitted, useShowAdvanced } from './FormValidationContext';

// Inputs that show their error (red text under the field) once the user has
// pressed Save on an invalid form, otherwise the normal helper text.
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

export const ValidatedSelectField = ({ error, helper, ...props }) => {
  const submitted = useFormSubmitted();
  const show = submitted && error;
  return <SelectField {...props} error={Boolean(show)} helperText={show ? error : helper} />;
};

// FormControl wrapper for plain MUI <Select> inputs.
export const ValidatedFormControl = ({ error, helper, required, children, ...props }) => {
  const submitted = useFormSubmitted();
  const show = submitted && error;
  return (
    <FormControl {...props} required={required} error={Boolean(show)}>
      {children}
      {(show || helper) && <FormHelperText>{show || helper}</FormHelperText>}
    </FormControl>
  );
};

// Sections hidden until the user presses "Show advanced settings".
export const AdvancedSection = ({ children }) => (useShowAdvanced() ? children : null);
