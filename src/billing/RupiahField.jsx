import { InputAdornment, TextField } from '@mui/material';
import { formatThousands, parseRupiah } from './billingLogic';

// Number-only rupiah input: shows thousands separators ("150.000") and
// reports an integer (or null when empty) through onChange.
const RupiahField = ({ value, onChange, ...props }) => (
  <TextField
    {...props}
    value={formatThousands(value)}
    onChange={(e) => onChange(parseRupiah(e.target.value))}
    slotProps={{
      htmlInput: { inputMode: 'numeric', pattern: '[0-9.]*', maxLength: 15 },
      input: { startAdornment: <InputAdornment position="start">Rp</InputAdornment> },
    }}
  />
);

export default RupiahField;
