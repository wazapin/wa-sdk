/**
 * Analytics
 * Retrieve analytics data for WhatsApp Business Account
 * @module analytics
 */

import type { HTTPClient } from '../client/http.js';
import type { AnalyticsParams, AnalyticsData } from '../types/analytics.js';

/**
 * Analytics API
 * Provides methods to retrieve conversation and message analytics
 */
export class AnalyticsAPI {
  constructor(
    private httpClient: HTTPClient,
    private wabaId: string,
  ) {}

  /**
   * Get conversation analytics
   * 
   * Retrieves conversation analytics including conversation starts,
   * conversation types, and conversation costs.
   * 
   * @param params - Analytics query parameters
   * @returns Conversation analytics data
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
   */
  async getConversationAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();

    queryParams.append('start', params.start.toString());
    queryParams.append('end', params.end.toString());

    if (params.granularity) {
      queryParams.append('granularity', params.granularity);
    }

    if (params.phone_numbers) {
      queryParams.append('phone_numbers', JSON.stringify(params.phone_numbers));
    }

    if (params.product_types) {
      queryParams.append('product_types', JSON.stringify(params.product_types));
    }

    if (params.country_codes) {
      queryParams.append('country_codes', JSON.stringify(params.country_codes));
    }

    return this.httpClient.get<AnalyticsData>(`${this.wabaId}/conversation_analytics?${queryParams.toString()}`);
  }

  /**
   * Get message analytics
   * 
   * Retrieves message-level analytics including messages sent,
   * delivered, and read.
   * 
   * @param params - Analytics query parameters
   * @returns Message analytics data
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
   */
  async getMessageAnalytics(params: AnalyticsParams): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();

    queryParams.append('start', params.start.toString());
    queryParams.append('end', params.end.toString());

    if (params.granularity) {
      queryParams.append('granularity', params.granularity);
    }

    if (params.phone_numbers) {
      queryParams.append('phone_numbers', JSON.stringify(params.phone_numbers));
    }

    return this.httpClient.get<AnalyticsData>(`${this.wabaId}/analytics?${queryParams.toString()}`);
  }
}
