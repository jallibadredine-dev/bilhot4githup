import { getStripeSync } from './stripeClient.js';

export class WebhookHandlers {
  static async processWebhook(payload, signature) {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'Webhook payload must be a Buffer. ' +
        'Ensure webhook route is registered BEFORE express.json().'
      );
    }
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }
}
