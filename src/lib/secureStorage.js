const SENSITIVE_STORAGE_KEYS = [
  'channex_token',
  'hosflow_checkins',
  'hosflow_police_declarations',
];

export const clearSensitiveLocalState = () => {
  SENSITIVE_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
};
