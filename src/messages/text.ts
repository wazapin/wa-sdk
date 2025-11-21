/**
 * Text message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SendTextParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import { sendTextParamsSchema } from '../validation/schemas/messages.js';

/**
 * Send a text message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Text message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendText(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendTextParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendTextParamsSchema, params);
  }

  // Build request payload according to WhatsApp API format
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'text',
    text: {
      preview_url: params.previewUrl ?? false,
      body: params.text,
    },
  };

  // Add context if provided (for replies)
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  // Send request to WhatsApp API
  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
