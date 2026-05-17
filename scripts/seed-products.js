/**
 * HosFlow — Stripe Product Seeding Script
 *
 * Creates products and prices for all HosFlow subscription plans in MAD.
 * Run ONCE after connecting the Stripe integration:
 *   node scripts/seed-products.js
 *
 * Idempotent — checks for existing products before creating.
 */

import { getUncachableStripeClient } from './stripeClient.js';

const PRODUCTS = [
  {
    planKey:     'pms_standard_monthly',
    name:        'PMS Standard',
    description: 'Gestion PMS Cloud — 25 MAD par chambre / mois',
    unitAmount:  2500,   // 25 MAD in centimes
    currency:    'mad',
    interval:    'month',
    mode:        'recurring',
    features:    ['PMS Cloud', 'Calendrier réservations', 'Facturation & Taxes', 'Support email'],
    trialDays:   14,
  },
  {
    planKey:     'pms_integral_monthly',
    name:        'PMS Intégral',
    description: 'PMS Cloud + Channel Manager inclus — 30 MAD par chambre / mois',
    unitAmount:  3000,   // 30 MAD
    currency:    'mad',
    interval:    'month',
    mode:        'recurring',
    features:    ['Tout PMS Standard', 'Channel Manager OTA', 'Revenue AI', 'Support VIP 7j/7'],
  },
  {
    planKey:     'cm_addon_monthly',
    name:        'Channel Manager Add-on',
    description: 'Module Channel Manager — 25 MAD par chambre / mois (add-on pour PMS Standard)',
    unitAmount:  2500,   // 25 MAD
    currency:    'mad',
    interval:    'month',
    mode:        'recurring',
  },
  {
    planKey:     'pms_lifetime',
    name:        'Elite Lifetime',
    description: 'Licence perpétuelle HosFlow — accès à vie à toutes les fonctionnalités PRO',
    unitAmount:  349000, // 3 490 MAD
    currency:    'mad',
    interval:    null,
    mode:        'one_time',
  },
  {
    planKey:     'cm_lifetime',
    name:        'Channel Manager Lifetime',
    description: 'Licence Channel Manager à vie — add-on perpétuel',
    unitAmount:  149000, // 1 490 MAD
    currency:    'mad',
    interval:    null,
    mode:        'one_time',
  },
];

const COUPONS = [
  { id: 'ANNUAL_5PCT',    name: 'Engagement 1 an (-5%)',   percent: 5,  months: 12 },
  { id: 'BIENNIAL_10PCT', name: 'Engagement 2 ans (-10%)', percent: 10, months: 24 },
  { id: 'TRIENNIAL_20PCT',name: 'Engagement 3 ans (-20%)', percent: 20, months: 36 },
];

async function run() {
  const stripe = await getUncachableStripeClient();
  console.log('🚀 HosFlow — Seeding Stripe products & prices...\n');

  /* ── Products + Prices ── */
  for (const p of PRODUCTS) {
    /* Check if product already exists */
    const existing = await stripe.products.search({
      query: `metadata['plan_key']:'${p.planKey}'`,
    });

    let product;
    if (existing.data.length > 0) {
      product = existing.data[0];
      console.log(`⏭  ${p.name} already exists (${product.id})`);
    } else {
      product = await stripe.products.create({
        name:        p.name,
        description: p.description,
        metadata:    { plan_key: p.planKey },
      });
      console.log(`✓  Created product: ${p.name} (${product.id})`);
    }

    /* Check if price already exists */
    const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 5 });

    if (existingPrices.data.length > 0) {
      console.log(`   ⏭  Price already exists: ${existingPrices.data[0].unit_amount / 100} MAD`);
    } else {
      const priceData = {
        product:     product.id,
        unit_amount: p.unitAmount,
        currency:    p.currency,
        metadata:    { plan_key: p.planKey },
      };

      if (p.mode === 'recurring') {
        priceData.recurring = { interval: p.interval };
      }

      const price = await stripe.prices.create(priceData);
      const amount = price.unit_amount / 100;
      const period = p.interval ? `/${p.interval}` : ' (unique)';
      console.log(`   ✓  Price: ${amount} MAD${period} (${price.id})`);
    }

    console.log('');
  }

  /* ── Coupons ── */
  console.log('🎟  Creating discount coupons...\n');
  for (const c of COUPONS) {
    try {
      await stripe.coupons.retrieve(c.id);
      console.log(`⏭  Coupon ${c.id} already exists`);
    } catch (_) {
      await stripe.coupons.create({
        id:               c.id,
        name:             c.name,
        percent_off:      c.percent,
        duration:         'repeating',
        duration_in_months: c.months,
        currency:         'mad',
      });
      console.log(`✓  Created coupon: ${c.id} (${c.percent}% off for ${c.months} months)`);
    }
  }

  console.log('\n✅ Seeding complete! Stripe products are ready for checkout.\n');
}

run().catch(err => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
