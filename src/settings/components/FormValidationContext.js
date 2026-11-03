import { createContext, use } from 'react';

// Set by EditItemView after the user presses Save on an invalid form, so
// pages can show field errors only from that moment (Laravel style).
export const FormValidationContext = createContext({ submitted: false });

export const useFormSubmitted = () => use(FormValidationContext).submitted;
