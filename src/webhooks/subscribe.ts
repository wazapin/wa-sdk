/**
 * Webhook Subscriptions
 * Subscribe to WABA webhook events
 * @module webhooks/subscribe
 */

import type { HTTPClient } from '../client/http.js';

/**
 * Webhook Subscription API
 * Provides methods to subscribe to webhook events
 */
export class WebhookSubscriptionAPI {
  constructor(private httpClient: HTTPClient) {}

  /**
   * Subscribe to WABA webhook events
   * 
   * Subscribes your app to receive webhook notifications for all phone numbers
   * under the specified WhatsApp Business Account.
   * 
   * @param wabaId - WhatsApp Business Account ID
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#subscribe-to-waba
   */
  async subscribeToWABA(wabaId: string): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${wabaId}/subscribed_apps`);
  }
}
