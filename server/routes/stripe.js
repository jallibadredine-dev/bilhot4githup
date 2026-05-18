import { Router } from 'express';
import { getUncachableStripeClient } from '../stripeClient.js';

const router = Router();

/* ─── Validation helpers ─── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PERIODS = new Set(['monthly', 'annual', 'biennial', 'triennial']);
const MAX_ROOMS = 500;

function isValidEmail(v) { return typeof v === 'string' && EMAIL_RE.test(v) && v.length <= 254; }

/* ─── Plan config: plan_key metadata must match Stripe products ─── */
const PLAN_CONFIG = {
  standard:   { planKey: 'pms_standard_monthly',  mode: 'subscription' },
  integral:   { planKey: 'pms_integral_monthly',   mode: 'subscription' },
  cm_addon:   { planKey: 'cm_addon_monthly',        mode: 'subscription' },
  lifetime:   { planKey: 'pms_lifetime',            mode: 'payment'      },
  cm_lifetime:{ planKey: 'cm_lifetime',             mode: 'payment'      },
};

const PERIOD_COUPONS = {
  annual:    'ANNUAL_5PCT',
  biennial:  'BIENNIAL_10PCT',
  triennial: 'TRIENNIAL_20PCT',
};

/* ─── GET /api/stripe/health ─── */
router.get('/health', (_req, res) => res.json({ ok: true }));

/* ─── GET /api/stripe/plans ─── get product+price list for frontend ─── */
router.get('/plans', async (_req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.list({ active: true, limit: 20 });
    const plans = [];

    for (const product of products.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
      plans.push({ ...product, prices: prices.data });
    }

    res.json({ data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /api/stripe/checkout ─── create Stripe Checkout session ─── */
router.post('/checkout', async (req, res) => {
  try {
    const {
      planId,
      rooms     = 1,
      period    = 'monthly',
      email,
      addChannelManager = false,
    } = req.body;

    if (!planId || !PLAN_CONFIG[planId]) {
      return res.status(400).json({ error: `Plan invalide: ${planId}` });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Email invalide.' });
    }
    if (period && !VALID_PERIODS.has(period)) {
      return res.status(400).json({ error: 'Période invalide.' });
    }
    const roomsNum = Math.min(Math.max(1, parseInt(rooms) || 1), MAX_ROOMS);

    const stripe  = await getUncachableStripeClient();
    const config  = PLAN_CONFIG[planId];
    const qty     = config.mode === 'payment' ? 1 : roomsNum;

    /* ── Find product by metadata plan_key ── */
    const search  = await stripe.products.search({
      query: `metadata['plan_key']:'${config.planKey}'`,
    });

    if (!search.data.length) {
      return res.status(404).json({
        error: `Produit "${config.planKey}" introuvable dans Stripe. Exécutez d'abord le script de création : node scripts/seed-products.js`,
      });
    }

    const product = search.data[0];
    const prices  = await stripe.prices.list({ product: product.id, active: true, limit: 5 });

    if (!prices.data.length) {
      return res.status(404).json({ error: 'Aucun prix actif pour ce plan.' });
    }

    const price   = prices.data[0];
    const origin  = req.headers.origin || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;

    const lineItems = [{ price: price.id, quantity: qty }];

    /* ── Optionally add Channel Manager add-on ── */
    if (addChannelManager && planId === 'standard') {
      const cmSearch = await stripe.products.search({ query: `metadata['plan_key']:'cm_addon_monthly'` });
      if (cmSearch.data.length) {
        const cmPrices = await stripe.prices.list({ product: cmSearch.data[0].id, active: true, limit: 3 });
        if (cmPrices.data.length) lineItems.push({ price: cmPrices.data[0].id, quantity: qty });
      }
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: config.mode,
      success_url: `${origin}/?plans&checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/?plans&checkout=canceled`,
      allow_promotion_codes: true,
      locale: 'fr',
    };

    if (email) sessionParams.customer_email = email;

    /* ── Period discount coupon ── */
    if (config.mode === 'subscription' && PERIOD_COUPONS[period]) {
      try {
        await stripe.coupons.retrieve(PERIOD_COUPONS[period]);
        sessionParams.discounts = [{ coupon: PERIOD_COUPONS[period] }];
        sessionParams.allow_promotion_codes = false;
      } catch (_) {
        /* coupon not created yet – proceed without discount */
      }
    }

    /* ── 14-day free trial for Standard plan ── */
    if (planId === 'standard' && config.mode === 'subscription') {
      sessionParams.subscription_data = { trial_period_days: 14 };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url, sessionId: session.id });

  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── POST /api/stripe/portal ─── customer portal ─── */
router.post('/portal', async (req, res) => {
  const { customerId, returnUrl } = req.body;
  if (!customerId || typeof customerId !== 'string' || !customerId.startsWith('cus_')) {
    return res.status(400).json({ error: 'customerId Stripe invalide.' });
  }
  if (!returnUrl || typeof returnUrl !== 'string' || !/^https?:\/\//i.test(returnUrl)) {
    return res.status(400).json({ error: 'returnUrl invalide.' });
  }
  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
