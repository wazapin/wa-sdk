/**
 * Validation schemas for Account and Business operations
 */

import { z } from 'zod';

/**
 * Messaging limit tier validation schema
 */
export const messagingLimitTierSchema = z.enum([
  'TIER_250',
  'TIER_2000',
  'TIER_10K',
  'TIER_100K',
  'TIER_UNLIMITED',
]);

/**
 * Messaging limit response validation schema
 */
export const messagingLimitResponseSchema = z.object({
  whatsapp_business_manager_messaging_limit: messagingLimitTierSchema,
  id: z.string(),
});

/**
 * Business vertical validation schema
 */
export const businessVerticalSchema = z.enum([
  'AUTOMOTIVE',
  'BEAUTY',
  'APPAREL',
  'EDU',
  'ENTERTAIN',
  'EVENT_PLAN',
  'FINANCE',
  'GROCERY',
  'GOVT',
  'HOTEL',
  'HEALTH',
  'NONPROFIT',
  'PROF_SERVICES',
  'RETAIL',
  'TRAVEL',
  'RESTAURANT',
  'OTHER',
]);

/**
 * Business profile validation schema
 */
export const businessProfileSchema = z.object({
  about: z.string().max(139).optional(),
  address: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  email: z.string().max(128).email().optional(),
  messaging_product: z.string(),
  profile_picture_url: z.string().url().optional(),
  vertical: businessVerticalSchema.optional(),
  websites: z.array(z.string().url()).max(2).optional(),
});

/**
 * Update business profile params validation schema
 */
export const updateBusinessProfileParamsSchema = z.object({
  messaging_product: z.literal('whatsapp'),
  about: z.string().max(139).optional(),
  address: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  email: z.string().max(128).email().optional(),
  profile_picture_handle: z.string().optional(),
  vertical: businessVerticalSchema.optional(),
  websites: z.array(z.string().url()).max(2).optional(),
});

/**
 * Business profile response validation schema
 */
export const businessProfileResponseSchema = z.object({
  data: z.array(businessProfileSchema),
});

/**
 * Update business profile response validation schema
 */
export const updateBusinessProfileResponseSchema = z.object({
  success: z.boolean(),
});
