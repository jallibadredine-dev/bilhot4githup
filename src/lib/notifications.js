/**
 * HosFlow Notification Service
 * Email (EmailJS) + SMS template + WhatsApp deeplink
 *
 * EmailJS: client-side email, no backend required.
 *   → https://www.emailjs.com  (free: 200 emails/month)
 *   Setup: create a Service, an Email Template, and copy the public key.
 *   Template variables used: {{guest_name}}, {{property_name}},
 *     {{pin_code}}, {{arrival_date}}, {{departure_date}},
 *     {{guest_email}}, {{lock_name}}, {{valid_from}}, {{valid_to}}
 */

import emailjs from '@emailjs/browser';

const NOTIF_CONFIG_KEY = 'hosflow_notif_config';
const NOTIF_LOG_KEY    = 'hosflow_notif_log';

// ── Config storage ─────────────────────────────────────────────────────────
export const getNotifConfig = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_CONFIG_KEY) || '{}'); } catch { return {}; }
};

export const saveNotifConfig = (cfg) => {
  localStorage.setItem(NOTIF_CONFIG_KEY, JSON.stringify(cfg));
};

// ── Notification log ────────────────────────────────────────────────────────
export const getNotifLog = () => {
  try { return JSON.parse(localStorage.getItem(NOTIF_LOG_KEY) || '[]'); } catch { return []; }
};

const addNotifLog = (entry) => {
  const log = getNotifLog();
  log.unshift({ ...entry, id: Date.now(), sentAt: new Date().toISOString() });
  localStorage.setItem(NOTIF_LOG_KEY, JSON.stringify(log.slice(0, 100)));
};

export const clearNotifLog = () => localStorage.removeItem(NOTIF_LOG_KEY);

// ── Date formatters ─────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '–';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Template interpolation ──────────────────────────────────────────────────
const interpolate = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);

export const buildTemplateVars = ({ guestName, guestEmail, guestPhone, propertyName, pin, lockName, arrivalDate, departureDate, bookingId }) => ({
  guest_name:     guestName  || 'Cher(e) client(e)',
  property_name:  propertyName || 'Notre propriété',
  pin_code:       pin        || '------',
  lock_name:      lockName   || 'Porte principale',
  arrival_date:   fmtDate(arrivalDate),
  departure_date: fmtDate(departureDate),
  valid_from:     arrivalDate   ? `${arrivalDate} à 14h00` : '–',
  valid_to:       departureDate ? `${departureDate} à 12h00` : '–',
  guest_email:    guestEmail || '',
  guest_phone:    guestPhone || '',
  booking_id:     bookingId  || '',
});

// Default SMS template
export const DEFAULT_SMS_TEMPLATE =
`Bonjour {{guest_name}}, voici votre code d'accès Hova :

🔑 Code PIN : *{{pin_code}}*
🏠 {{property_name}} — {{lock_name}}
📅 Valide du {{valid_from}} au {{valid_to}}

Bienvenue et bon séjour !`;

// Default email subject
export const DEFAULT_EMAIL_SUBJECT = `Votre code d'accès — {{property_name}}`;

// Default email body (HTML for EmailJS template)
export const DEFAULT_EMAIL_BODY =
`Bonjour {{guest_name}},

Votre séjour à {{property_name}} se rapproche ! Voici votre code d'accès personnel :

━━━━━━━━━━━━━━━━━━━━━━━
🔑  Code PIN : {{pin_code}}
🚪  Serrure  : {{lock_name}}
📅  Valide du {{valid_from}}
         au {{valid_to}}
━━━━━━━━━━━━━━━━━━━━━━━

Saisissez ce code sur le clavier numérique de la serrure pour accéder à votre logement.

À très bientôt,
L'équipe Hova`;

// ── Email via EmailJS ───────────────────────────────────────────────────────
export const sendEmailNotification = async (notifData) => {
  const cfg = getNotifConfig();
  if (!cfg.emailEnabled) return { skipped: true, reason: 'email_disabled' };
  if (!cfg.ejsServiceId || !cfg.ejsTemplateId || !cfg.ejsPublicKey) {
    return { error: true, reason: 'emailjs_not_configured' };
  }
  if (!notifData.guestEmail) {
    return { error: true, reason: 'no_guest_email' };
  }

  const vars = buildTemplateVars(notifData);
  const smsBody = cfg.smsTemplate || DEFAULT_SMS_TEMPLATE;

  const templateParams = {
    ...vars,
    to_email: notifData.guestEmail,
    reply_to: notifData.guestEmail,
    subject: interpolate(cfg.emailSubject || DEFAULT_EMAIL_SUBJECT, vars),
    message: interpolate(smsBody, vars),
  };

  try {
    emailjs.init({ publicKey: cfg.ejsPublicKey });
    const res = await emailjs.send(cfg.ejsServiceId, cfg.ejsTemplateId, templateParams);

    addNotifLog({
      channel: 'email',
      status: 'sent',
      to: notifData.guestEmail,
      guestName: notifData.guestName,
      bookingId: notifData.bookingId,
    });

    return { success: true, status: res.status };
  } catch (err) {
    addNotifLog({
      channel: 'email',
      status: 'error',
      to: notifData.guestEmail,
      guestName: notifData.guestName,
      error: err.text || err.message,
      bookingId: notifData.bookingId,
    });
    throw err;
  }
};

// ── SMS message builder (no server = copy/clipboard or WhatsApp) ────────────
export const buildSMSText = (notifData) => {
  const cfg = getNotifConfig();
  const vars = buildTemplateVars(notifData);
  return interpolate(cfg.smsTemplate || DEFAULT_SMS_TEMPLATE, vars);
};

// ── WhatsApp deeplink ───────────────────────────────────────────────────────
export const buildWhatsAppLink = (notifData) => {
  if (!notifData.guestPhone) return null;
  const phone = notifData.guestPhone.replace(/[^\d+]/g, '');
  const text = encodeURIComponent(buildSMSText(notifData));
  return `https://wa.me/${phone}?text=${text}`;
};

// ── Master send (called by automation engine after PIN creation) ────────────
export const sendPinNotifications = async (notifData) => {
  const cfg = getNotifConfig();
  const results = { email: null, whatsapp: null };

  if (cfg.emailEnabled && notifData.guestEmail) {
    try {
      results.email = await sendEmailNotification(notifData);
    } catch (e) {
      results.email = { error: true, reason: e.message };
    }
  }

  if (cfg.whatsappEnabled && notifData.guestPhone) {
    results.whatsapp = { link: buildWhatsAppLink(notifData), pending: true };
  }

  return results;
};
