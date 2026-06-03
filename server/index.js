import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient.js';

// Load .env manually (backend process doesn't use Vite's env loading)
try {
  const __dir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dir, '..', '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch (_) {}

const { default: app } = await import('./app.js');

const port = parseInt(process.env.BACKEND_PORT || '3001');

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL not set — running without Stripe sync (API-only mode)');
    return;
  }

  try {
    console.log('⟳  Initializing Stripe schema...');
    await runMigrations({ databaseUrl, schema: 'stripe' });
    console.log('✓  Stripe schema ready');

    const stripeSync = await getStripeSync();

    const domains = process.env.REPLIT_DOMAINS?.split(',')[0];
    if (domains) {
      const webhookUrl = `https://${domains}/api/stripe/webhook`;
      await stripeSync.findOrCreateManagedWebhook(webhookUrl);
      console.log('✓  Webhook configured:', webhookUrl);
    }

    stripeSync.syncBackfill()
      .then(() => console.log('✓  Stripe data synced'))
      .catch(err  => console.error('⚠️  Stripe backfill error:', err.message));

  } catch (error) {
    console.error('⚠️  Stripe init error (continuing in degraded mode):', error.message);
  }
}

await initStripe();

app.listen(port, '0.0.0.0', () => {
  console.log(`✓  HosFlow API running on port ${port}`);
});
