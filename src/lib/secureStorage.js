const SENSITIVE_STORAGE_KEYS = [
  'channex_token',
  'hosflow_checkins',
  'hosflow_police_declarations',
  'beds24_token',
  'beds24_invite_token',
  'hosflow_processed_bookings',
  'hosflow_automation_log',
  'hosflow_property_lock_map',
  'sh_cleaning_status',
  'sh_staff',
  'slh_assignments',
  'slh_tthotel',
  'slh_tthotel_user',
  'slh_tthotel_token',
  'slh_tthotel_refresh',
  'slh_tthotel_devices',
  'slh_tthotel_demo',
  'slh_tuya',
  'slh_tuya_id',
  'slh_tuya_secret',
  'slh_tuya_token',
  'slh_tuya_devices',
  'slh_tuya_demo',
  'slh_tuya_region',
];

const SENSITIVE_KEY_PREFIXES = [
  'cm_ota_',
  'cm_prods_',
];

export const clearSensitiveLocalState = () => {
  SENSITIVE_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && SENSITIVE_KEY_PREFIXES.some(prefix => k.startsWith(prefix))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
};
