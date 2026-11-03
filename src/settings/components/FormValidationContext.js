import { createContext, use } from 'react';

// Shared state of an EditItemView form:
// - submitted: Save was pressed on an invalid form, so fields show errors
// - showAdvanced: the "advanced settings" sections are visible
export const FormValidationContext = createContext({ submitted: false, showAdvanced: true });

export const useFormSubmitted = () => use(FormValidationContext).submitted;

export const useShowAdvanced = () => use(FormValidationContext).showAdvanced;
