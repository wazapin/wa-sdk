/**
 * Location message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SendLocationParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import { sendLocationParamsSchema } from '../validation/schemas/messages.js';

/**
 * Send a location message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Location message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendLocation(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendLocationParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendLocationParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'location',
    location: {
      latitude: params.latitude,
      longitude: params.longitude,
      ...(params.name && { name: params.name }),
      ...(params.address && { address: params.address }),
    },
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
