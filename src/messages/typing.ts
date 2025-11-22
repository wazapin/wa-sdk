/**
 * Typing Indicators
 * Send typing indicators to show activity status
 * @module messages/typing
 */

import type { HTTPClient } from '../client/http.js';

/**
 * Typing action type
 */
export type TypingAction = 'typing' | 'stop_typing';

/**
 * Parameters for sending typing indicator
 */
export interface SendTypingIndicatorParams {
  /**
   * Recipient phone number
   */
  to: string;
  /**
   * Typing action: "typing" to show typing, "stop_typing" to stop
   */
  action: TypingAction;
}

/**
 * Typing Indicator API
 * Provides methods to send typing indicators
 */
export class TypingIndicatorAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Send typing indicator
   * 
   * Sends a typing indicator to show that you are typing a message.
   * Use "typing" to show the typing indicator, and "stop_typing" to remove it.
   * 
   * Note: Typing indicators automatically disappear after 30 seconds.
   * 
   * @param params - Typing indicator parameters
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#typing-indicators
   */
  async sendTypingIndicator(
    params: SendTypingIndicatorParams,
  ): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'chat_state',
      chat_state: {
        action: params.action,
      },
    });
  }
}
