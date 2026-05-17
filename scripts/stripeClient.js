import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found. Run inside Replit.');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'X-Replit-Token': xReplitToken },
    signal: AbortSignal.timeout(10_000),
  });

  const data = await response.json();
  const settings = data.items?.[0]?.settings;

  if (!settings?.secret) {
    throw new Error('Stripe secret key not found. Connect Stripe in the Integrations tab.');
  }

  return { secretKey: settings.secret };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });
}
