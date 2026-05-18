const listeners = new Set();
let nextId = 1;

export const toast = {
  _emit(type, message, duration) {
    const id = nextId++;
    const dur = duration ?? (type === 'error' ? 5000 : 3500);
    listeners.forEach(fn => fn({ id, type, message, duration: dur }));
    return id;
  },
  success(msg, dur) { return this._emit('success', msg, dur); },
  error(msg, dur)   { return this._emit('error',   msg, dur); },
  warn(msg, dur)    { return this._emit('warning',  msg, dur); },
  info(msg, dur)    { return this._emit('info',     msg, dur); },
  subscribe(fn)     { listeners.add(fn); return () => listeners.delete(fn); },
};
