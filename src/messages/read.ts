/**
 * Mark message as read functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SuccessResponse } from '../types/responses.js';

/**
 * Mark a message as read
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID
 * @param messageId - Message ID to mark as read
 * @returns Success response
 */
export async function markAsRead(
  client: HTTPClient,
  phoneNumberId: string,
  messageId: string
): Promise<SuccessResponse> {
  // Build request payload
  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  // Send request
  await client.post(`${phoneNumberId}/messages`, payload);

  return { success: true };
}
