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

/**
 * Conversational command validation schema
 */
export const conversationalCommandSchema = z.object({
  commandName: z.string().min(1, 'Command name is required').max(32, 'Command name too long (max 32 characters)'),
  commandDescription: z.string().min(1, 'Command description is required').max(256, 'Command description too long (max 256 characters)'),
});

/**
 * Configure conversational automation params validation schema
 */
export const configureConversationalAutomationParamsSchema = z.object({
  enableWelcomeMessage: z.boolean().optional(),
  prompts: z.array(z.string().max(80, 'Prompt too long (max 80 characters)')).max(4, 'Maximum 4 prompts allowed').optional(),
  commands: z.array(conversationalCommandSchema).max(30, 'Maximum 30 commands allowed').optional(),
});

/**
 * Conversational automation config validation schema
 */
export const conversationalAutomationConfigSchema = z.object({
  enable_welcome_message: z.boolean().optional(),
  prompts: z.array(z.string()).optional(),
  commands: z.array(z.object({
    command_name: z.string(),
    command_description: z.string(),
  })).optional(),
});

/**
 * Conversational automation response validation schema
 */
export const conversationalAutomationResponseSchema = z.object({
  conversational_automation: conversationalAutomationConfigSchema,
  id: z.string(),
});
