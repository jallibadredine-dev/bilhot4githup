/**
 * Zod validation schemas for HosFlow API routes.
 * `.strict()` rejects unknown fields; zod coerces + types all inputs.
 */
import { z } from 'zod';

/* ─── Stripe ─────────────────────────────────────────────── */

export const checkoutSchema = z.object({
  planId:           z.enum(['standard', 'integral', 'cm_addon', 'lifetime', 'cm_lifetime']),
  rooms:            z.coerce.number().int().min(1).max(500).default(1),
  period:           z.enum(['monthly', 'annual', 'biennial', 'triennial']).default('monthly'),
  email:            z.string().email().max(254).or(z.literal('')).optional(),
  addChannelManager: z.boolean().default(false),
}).strict();

export const portalSchema = z.object({
  customerId: z.string().regex(/^cus_/).max(100),
  returnUrl:  z.string().url().max(500),
}).strict();

/* ─── Admin ──────────────────────────────────────────────── */

export const createUserSchema = z.object({
  email:   z.string().email().max(254),
  name:    z.string().min(1).max(120),
  plan:    z.enum(['starter', 'standard', 'integral', 'lifetime']).default('starter'),
  role:    z.enum(['user', 'admin', 'super_admin']).default('user'),
  company: z.string().max(200).default(''),
  phone:   z.string().max(50).default(''),
}).strict();

export const patchUserSchema = z.object({
  full_name:  z.string().max(200).optional(),
  role:       z.enum(['user', 'admin', 'super_admin']).optional(),
  plan:       z.enum(['starter', 'standard', 'integral', 'lifetime']).optional(),
  company:    z.string().max(200).optional(),
  phone:      z.string().max(50).optional(),
  avatar_url: z.string().url().max(500).or(z.literal('')).optional(),
  status:     z.enum(['active', 'suspended', 'pending']).optional(),
  notes:      z.string().max(2000).optional(),
});

/* ─── Helper ─────────────────────────────────────────────── */

/**
 * Parse `data` with `schema`. On failure, sends a 400 JSON response and
 * returns null so the caller can do `if (!body) return;`.
 *
 * @returns {object|null} Typed, stripped/validated data or null on error.
 */
export function validate(schema, data, res) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    res.status(400).json({ error: message });
    return null;
  }
  return result.data;
}
