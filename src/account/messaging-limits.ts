/**
 * Messaging limits operations
 */

import type { HTTPClient } from '../client/http.js';
import type { Validator } from '../validation/validator.js';
import type { MessagingLimitResponse } from '../types/account.js';
import { messagingLimitResponseSchema } from '../validation/schemas/account.js';

/**
 * Get the current messaging limit for a business phone number
 * 
 * Messaging limits are the maximum number of unique WhatsApp user phone numbers
 * your business can deliver messages to, outside of a customer service window,
 * within a moving 24-hour period.
 * 
 * Messaging limits are calculated and set at the business portfolio level and are
 * shared by all business phone numbers within a portfolio.
 * 
 * **Available Tiers**:
 * - `TIER_250`: 250 unique contacts per 24 hours (default for new accounts)
 * - `TIER_2000`: 2,000 unique contacts per 24 hours
 * - `TIER_10K`: 10,000 unique contacts per 24 hours
 * - `TIER_100K`: 100,000 unique contacts per 24 hours
 * - `TIER_UNLIMITED`: Unlimited unique contacts per 24 hours
 * 
 * **Increasing Your Limit**:
 * You can increase your messaging limit by:
 * - Verifying your business
 * - Having your solution provider verify your business
 * - Sending 2,000 delivered messages with high quality ratings
 * 
 * After reaching TIER_2000, automatic scaling will increase your limit if you:
 * - Send high-quality messages
 * - Utilize at least half of your current limit in the last 7 days
 * 
 * @param client - HTTP client instance for API communication
 * @param phoneNumberId - WhatsApp Business phone number ID
 * @param validator - Optional validator for runtime validation
 * 
 * @returns Current messaging limit tier and phone number ID
 * 
 * @throws {APIError} When API request fails
 * @throws {NetworkError} When network request fails
 * 
 * @example
 * ```typescript
 * const limit = await getMessagingLimit(
 *   client,
 *   'phone-number-id',
 *   validator
 * );
 * 
 * console.log('Current tier:', limit.whatsapp_business_manager_messaging_limit);
 * // Output: Current tier: TIER_250
 * 
 * // Check specific tier
 * if (limit.whatsapp_business_manager_messaging_limit === 'TIER_250') {
 *   console.log('You can message up to 250 unique contacts per 24 hours');
 * }
 * ```
 * 
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits#checking-your-limit
 */
export async function getMessagingLimit(
  client: HTTPClient,
  phoneNumberId: string,
  validator?: Validator
): Promise<MessagingLimitResponse> {
  const response = await client.get<MessagingLimitResponse>(
    `${phoneNumberId}?fields=whatsapp_business_manager_messaging_limit`
  );

  if (validator) {
    return validator.validate(messagingLimitResponseSchema, response);
  }

  return response;
}
