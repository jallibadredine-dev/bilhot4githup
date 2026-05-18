/**
 * Staff Notification Service — Hova PMS
 * Email via EmailJS + SMS via Twilio REST API (browser-side, same pattern as Channex/TTLock)
 *
 * Config stored in localStorage key: 'sh_notif_config'
 * Log stored in localStorage key:    'sh_notif_log'
 */

import emailjs from '@emailjs/browser';
import { secureStorage } from './secureStorage';

const CONFIG_KEY = 'sh_notif_config';
const LOG_KEY    = 'sh_notif_log';

/* ─── Private readers (internal send/log paths — no auth gate) ── */
const _getStaffNotifConfig = () => {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}'); }
  catch { return {}; }
};
const _getStaffNotifLog = () => {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
};

/* ─── Auth-gated public exports (admin UI) ───────────────────── */
export const getStaffNotifConfig = () => secureStorage.parseJSON(CONFIG_KEY, {});
export const getStaffNotifLog    = () => secureStorage.parseJSON(LOG_KEY, []);

export const saveStaffNotifConfig = (cfg) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
};

/* ─── LOG (internal write path) ──────────────────────────────── */
const addLog = (entry) => {
  const log = _getStaffNotifLog();
  log.unshift({ ...entry, id: Date.now(), sentAt: new Date().toISOString() });
  localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 50)));
};

export const clearStaffNotifLog = () => localStorage.removeItem(LOG_KEY);

/* ─── TEMP PASSWORD GENERATOR ───────────────────────────────── */
export const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = 'Hova@';
  for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

/* ─── SMS TEMPLATES ──────────────────────────────────────────── */
export const DEFAULT_STAFF_SMS =
`Bonjour {{staff_name}},

Vous avez été ajouté(e) à l'équipe {{property_name}} 🏨
Rôle : {{role_name}}

🔐 Email : {{staff_email}}
🔑 Mot de passe provisoire : {{temp_password}}

Connectez-vous sur : {{login_url}}

Bienvenue dans l'équipe !`;

export const DEFAULT_STAFF_EMAIL_SUBJECT = `Vos accès {{property_name}} — Bienvenue {{staff_name}} !`;

/* ─── TEMPLATE INTERPOLATION ────────────────────────────────── */
const interp = (tpl, vars) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);

const buildVars = ({ staffName, staffEmail, staffPhone, roleName, tempPassword, propertyName }) => ({
  staff_name:    staffName    || 'Nouveau membre',
  staff_email:   staffEmail   || '',
  staff_phone:   staffPhone   || '',
  role_name:     roleName     || 'Collaborateur',
  temp_password: tempPassword || '—',
  property_name: propertyName || 'Hova PMS',
  login_url:     window.location.origin || 'https://hova.app',
});

/* ─── SEND EMAIL (EmailJS) ───────────────────────────────────── */
export const sendStaffEmail = async ({ staffName, staffEmail, staffPhone, roleName, tempPassword, propertyName }) => {
  const cfg = _getStaffNotifConfig();
  if (!cfg.emailEnabled) return { skipped: true, reason: 'email_disabled' };
  if (!cfg.ejsServiceId || !cfg.ejsTemplateId || !cfg.ejsPublicKey) {
    return { error: true, reason: 'emailjs_not_configured' };
  }
  if (!staffEmail) return { error: true, reason: 'no_email' };

  const vars = buildVars({ staffName, staffEmail, staffPhone, roleName, tempPassword, propertyName });

  const templateParams = {
    to_email:      staffEmail,
    to_name:       staffName,
    reply_to:      cfg.fromEmail || staffEmail,
    from_name:     cfg.fromName  || propertyName || 'Hova PMS',
    subject:       interp(cfg.emailSubject || DEFAULT_STAFF_EMAIL_SUBJECT, vars),
    staff_name:    vars.staff_name,
    staff_email:   vars.staff_email,
    role_name:     vars.role_name,
    temp_password: vars.temp_password,
    property_name: vars.property_name,
    login_url:     vars.login_url,
    message:       interp(cfg.emailBody || DEFAULT_STAFF_SMS, vars),
  };

  try {
    emailjs.init({ publicKey: cfg.ejsPublicKey });
    const res = await emailjs.send(cfg.ejsServiceId, cfg.ejsTemplateId, templateParams);
    addLog({ channel: 'email', status: 'sent', to: staffEmail, name: staffName, role: roleName });
    return { success: true, status: res.status };
  } catch (err) {
    addLog({ channel: 'email', status: 'error', to: staffEmail, name: staffName, error: err.text || err.message });
    return { error: true, reason: err.text || err.message };
  }
};

/* ─── SEND SMS (Twilio REST API — browser direct call) ───────── */
export const sendStaffSMS = async ({ staffName, staffPhone, roleName, tempPassword, staffEmail, propertyName }) => {
  const cfg = _getStaffNotifConfig();
  if (!cfg.smsEnabled) return { skipped: true, reason: 'sms_disabled' };
  if (!cfg.twilioSid || !cfg.twilioToken || !cfg.twilioFrom) {
    return { error: true, reason: 'twilio_not_configured' };
  }
  if (!staffPhone) return { error: true, reason: 'no_phone' };

  const vars = buildVars({ staffName, staffEmail, staffPhone, roleName, tempPassword, propertyName });
  const body = interp(cfg.smsTemplate || DEFAULT_STAFF_SMS, vars);
  const phone = staffPhone.replace(/\s/g, '');

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.twilioSid}/Messages.json`;
    const formData = new URLSearchParams({ To: phone, From: cfg.twilioFrom, Body: body });
    const headers = {
      'Authorization': 'Basic ' + btoa(`${cfg.twilioSid}:${cfg.twilioToken}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const resp = await fetch(url, { method: 'POST', headers, body: formData });
    const data = await resp.json();
    if (data.sid) {
      addLog({ channel: 'sms', status: 'sent', to: phone, name: staffName, role: roleName, sid: data.sid });
      return { success: true, sid: data.sid };
    }
    addLog({ channel: 'sms', status: 'error', to: phone, name: staffName, error: data.message });
    return { error: true, reason: data.message || 'Twilio error' };
  } catch (err) {
    addLog({ channel: 'sms', status: 'error', to: phone, name: staffName, error: err.message });
    return { error: true, reason: err.message };
  }
};

/* ─── SEND WHATSAPP FALLBACK ─────────────────────────────────── */
export const buildStaffWhatsApp = ({ staffPhone, staffName, roleName, tempPassword, staffEmail, propertyName }) => {
  const cfg = getStaffNotifConfig();
  if (!staffPhone) return null;
  const vars = buildVars({ staffName, staffEmail, staffPhone, roleName, tempPassword, propertyName });
  const text = encodeURIComponent(interp(cfg.smsTemplate || DEFAULT_STAFF_SMS, vars));
  return `https://wa.me/${staffPhone.replace(/[^\d+]/g, '')}?text=${text}`;
};

/* ─── MASTER SEND ────────────────────────────────────────────── */
export const sendStaffInvite = async (staff, tempPassword) => {
  const cfg = getStaffNotifConfig();
  const propertyName = cfg.propertyName || 'Hova PMS';
  const payload = {
    staffName: staff.name, staffEmail: staff.email,
    staffPhone: staff.phone || staff.whatsapp,
    roleName: staff.roleLabel || staff.role,
    tempPassword, propertyName,
  };

  const [emailResult, smsResult] = await Promise.allSettled([
    sendStaffEmail(payload),
    sendStaffSMS(payload),
  ]);

  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { error: true, reason: emailResult.reason?.message },
    sms:   smsResult.status === 'fulfilled'   ? smsResult.value   : { error: true, reason: smsResult.reason?.message },
    whatsapp: buildStaffWhatsApp(payload),
    tempPassword,
  };
};
