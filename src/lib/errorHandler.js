const LOG_PREFIX = '[Hova]';

function formatMessage(module, message) {
  return `${LOG_PREFIX}[${module}] ${message}`;
}

export function logError(module, message, details = {}) {
  console.error(formatMessage(module, message), details);
}

export function logWarn(module, message, details = {}) {
  console.warn(formatMessage(module, message), details);
}

export function logInfo(module, message, details = {}) {
  console.info(formatMessage(module, message), details);
}

export function handleSupabaseError(module, error, fallbackMessage = 'Opération échouée') {
  if (!error) return null;
  const message = error?.message || fallbackMessage;
  logError(module, message, { code: error?.code, details: error?.details });
  return message;
}

export function handleApiError(module, error, fallbackMessage = 'Erreur réseau') {
  if (!error) return null;
  const message = error?.message || fallbackMessage;
  logError(module, message);
  return message;
}
