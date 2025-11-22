/**
 * WhatsApp Business Account (WABA) Management
 * Manage WhatsApp Business Accounts
 * @module account/waba
 */

import type { HTTPClient } from '../client/http.js';
import type { WABADetails, WABAListResponse } from '../types/waba.js';

/**
 * WABA Management API
 * Provides methods to manage WhatsApp Business Accounts
 */
export class WABAManagementAPI {
  constructor(private httpClient: HTTPClient) {}

  /**
   * Get WABA details by ID
   * @param wabaId - WhatsApp Business Account ID
   * @returns WABA details
   * @see https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account
   */
  async getWABA(wabaId: string): Promise<WABADetails> {
    return this.httpClient.get<WABADetails>(wabaId);
  }

  /**
   * Get all WABAs owned by a business
   * 
   * You can get your business portfolio ID by:
   * 1. Signing into Meta Business Suite (https://business.facebook.com)
   * 2. The ID appears in the URL as the business_id query parameter
   * 
   * @param businessId - Business portfolio ID
   * @returns List of owned WABAs
   * @see https://developers.facebook.com/docs/marketing-api/reference/business/extendedcredits/
   */
  async getOwnedWABAs(businessId: string): Promise<WABAListResponse> {
    return this.httpClient.get<WABAListResponse>(`${businessId}/owned_whatsapp_business_accounts`);
  }

  /**
   * Get all WABAs shared with a business (client WABAs)
   * 
   * These are WABAs that have been shared with your business portfolio
   * but are not owned by it.
   * 
   * @param businessId - Business portfolio ID
   * @returns List of shared WABAs
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-list-of-shared-wabas
   */
  async getSharedWABAs(businessId: string): Promise<WABAListResponse> {
    return this.httpClient.get<WABAListResponse>(`${businessId}/client_whatsapp_business_accounts`);
  }
}
