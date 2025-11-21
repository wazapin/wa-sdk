/**
 * Webhook payload parsing functionality
 */

import type { WebhookEvent } from '../types/webhooks.js';
import type { Validator } from '../validation/validator.js';
import { webhookEventSchema } from '../validation/schemas/webhooks.js';
import { ValidationError } from '../types/errors.js';

/**
 * Parse webhook payload into typed event objects
 *
 * @param payload - Raw webhook payload
 * @param validator - Optional validator instance
 * @returns Parsed webhook event
 * @throws ValidationError if payload is invalid
 */
export function parseWebhook(payload: unknown, validator?: Validator): WebhookEvent {
  // Validate payload structure
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Webhook payload must be an object', 'payload');
  }

  // Validate with schema if validator is provided
  if (validator) {
    return validator.validate(webhookEventSchema, payload);
  }

  // Basic validation without Zod
  const data = payload as Record<string, unknown>;

  if (data.object !== 'whatsapp_business_account') {
    throw new ValidationError(
      'Invalid webhook object type. Expected "whatsapp_business_account"',
      'object'
    );
  }

  if (!Array.isArray(data.entry)) {
    throw new ValidationError('Webhook payload must have an "entry" array', 'entry');
  }

  // Return as typed event
  return payload as WebhookEvent;
}
