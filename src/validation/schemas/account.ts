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
