/**
 * Reaction message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SendReactionParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import { sendReactionParamsSchema } from '../validation/schemas/messages.js';

/**
 * Send a reaction to a message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Reaction message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendReaction(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendReactionParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendReactionParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'reaction',
    reaction: {
      message_id: params.messageId,
      emoji: params.emoji, // Empty string removes the reaction
    },
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
