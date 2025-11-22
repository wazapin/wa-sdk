/**
 * Commerce Settings Management
 * Configure commerce and catalog settings for WhatsApp Business
 * @module account/commerce-settings
 */

import type { HTTPClient } from '../client/http.js';
import type {
  CommerceSettingsResponse,
  UpdateCommerceSettingsParams,
} from '../types/commerce-settings.js';

/**
 * Commerce Settings API
 * Provides methods to manage commerce settings
 */
export class CommerceSettingsAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Get commerce settings
   * 
   * Retrieves the current commerce settings including catalog visibility
   * and cart enablement status.
   * 
   * @returns Commerce settings
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/commerce-settings
   */
  async getCommerceSettings(): Promise<CommerceSettingsResponse> {
    return this.httpClient.get<CommerceSettingsResponse>(`${this.phoneNumberId}/whatsapp_commerce_settings`);
  }

  /**
   * Update commerce settings
   * 
   * Updates commerce settings such as catalog visibility and cart enablement.
   * 
   * @param params - Settings to update
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/commerce-settings
   */
  async updateCommerceSettings(
    params: UpdateCommerceSettingsParams,
  ): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${this.phoneNumberId}/whatsapp_commerce_settings`, params);
  }
}
