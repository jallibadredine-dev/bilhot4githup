/**
 * Structured JSON logger for the HosFlow API server.
 * Replaces bare console.* calls with timestamped, levelled JSON entries
 * that can be parsed by log aggregators.
 */
function emit(level, module, message, extra = {}) {
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    module,
    message,
    ...extra,
  });
  if (level === 'error') console.error(entry);
  else if (level === 'warn')  console.warn(entry);
  else                        console.log(entry);
}

export const logger = {
  info:  (mod, msg, extra) => emit('info',  mod, msg, extra),
  warn:  (mod, msg, extra) => emit('warn',  mod, msg, extra),
  error: (mod, msg, extra) => emit('error', mod, msg, extra),
};
