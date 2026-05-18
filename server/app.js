import express from 'express';
import cors from 'cors';
import stripeRouter from './routes/stripe.js';
import adminRouter  from './routes/admin.js';
import healthRouter from './routes/health.js';
import authRouter   from './routes/auth.js';
import { WebhookHandlers } from './webhookHandlers.js';

const app = express();

/* ─── Stripe webhook MUST come BEFORE express.json() ─── */
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) return res.status(400).json({ error: 'Missing stripe-signature header' });

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        return res.status(500).json({ error: 'Body must be raw Buffer. Check middleware order.' });
      }
      await WebhookHandlers.processWebhook(req.body, sig);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

/* ─── Regular middleware (after webhook) ─── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── Routes ─── */
app.use('/api/stripe', stripeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

export default app;
