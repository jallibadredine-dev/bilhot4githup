import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient.js';
import app from './app.js';

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
