// Laravel-style "session flash": show a one-off success message on the
// next screen (e.g. after saving a form and going back to the list).
const EVENT = 'pantauku-flash';

export const setFlash = (message, severity = 'success') => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, severity } }));
};

export const FLASH_EVENT = EVENT;
