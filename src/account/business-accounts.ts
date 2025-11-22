/**
 * Business Accounts API
 * Provides methods to manage business accounts and billing information
 */

import type { HTTPClient } from '../client/http.js';
import type {
  BusinessAccountResponse,
  ExtendedCreditsResponse,
  GetBusinessAccountOptions,
  ListExtendedCreditsOptions,
} from '../types/business-accounts.js';

/**
 * Business Accounts API for WhatsApp Business Management
 * 
 * @see https://developers.facebook.com/docs/marketing-api/reference/business/
 */
export class BusinessAccountsAPI {
  constructor(private readonly client: HTTPClient) {}

  /**
   * Get business account details
   * 
   * @param businessId - Business account ID (business_id)
   * @param options - Optional fields to retrieve
   * @returns Business account information
   * 
   * @example
   * ```typescript
   * const account = await client.businessAccounts.getBusinessAccount(
   *   '506914307656634',
   *   { fields: ['id', 'name', 'timezone_id', 'verification_status'] }
   * );
   * console.log('Business:', account.name);
   * ```
   * 
   * @see https://developers.facebook.com/docs/marketing-api/reference/business/
   */
  async getBusinessAccount(
    businessId: string,
    options?: GetBusinessAccountOptions
  ): Promise<BusinessAccountResponse> {
    const fields = options?.fields?.join(',') || 'id,name,timezone_id';
    const endpoint = `${businessId}?fields=${fields}`;

    return this.client.get<BusinessAccountResponse>(endpoint);
  }

  /**
   * List extended credit lines for billing
   * 
   * Extended credit lines are used for WhatsApp Business billing.
   * This method retrieves all credit lines associated with a business account.
   * 
   * @param businessId - Business account ID
   * @param options - Pagination and field options
   * @returns List of extended credit lines
   * 
   * @example
   * ```typescript
   * const credits = await client.businessAccounts.listExtendedCredits(
   *   '506914307656634',
   *   { fields: ['id', 'legal_entity_name', 'credit_available'] }
   * );
   * 
   * credits.data.forEach(credit => {
   *   console.log(`Credit line: ${credit.legal_entity_name}`);
   *   console.log(`Available: ${credit.credit_available}`);
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/marketing-api/reference/extended-credit/
   */
  async listExtendedCredits(
    businessId: string,
    options?: ListExtendedCreditsOptions
  ): Promise<ExtendedCreditsResponse> {
    let endpoint = `${businessId}/extendedcredits`;

    const params: string[] = [];

    if (options?.fields) {
      params.push(`fields=${options.fields.join(',')}`);
    }

    if (options?.limit) {
      params.push(`limit=${options.limit}`);
    }

    if (options?.after) {
      params.push(`after=${options.after}`);
    }

    if (options?.before) {
      params.push(`before=${options.before}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return this.client.get<ExtendedCreditsResponse>(endpoint);
  }

  /**
   * Get credit line balance and availability
   * 
   * Convenience method to get just the balance information from credit lines.
   * 
   * @param businessId - Business account ID
   * @returns Credit lines with balance information
   * 
   * @example
   * ```typescript
   * const balance = await client.businessAccounts.getCreditBalance('506914307656634');
   * console.log(`Available credit: ${balance.data[0].credit_available} cents`);
   * ```
   */
  async getCreditBalance(businessId: string): Promise<ExtendedCreditsResponse> {
    return this.listExtendedCredits(businessId, {
      fields: ['id', 'legal_entity_name', 'credit_available', 'balance', 'currency'],
    });
  }
}
