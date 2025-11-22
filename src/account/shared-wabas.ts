/**
 * Shared WABAs API
 * Manages shared WhatsApp Business Accounts (from Embedded Signup)
 */

import type { HTTPClient } from '../client/http.js';
import type {
  SharedWABAsResponse,
  ListSharedWABAsOptions,
} from '../types/shared-wabas.js';

/**
 * Shared WABAs API for managing WhatsApp Business Accounts
 * shared through Embedded Signup or partner integrations
 * 
 * Shared WABAs are different from owned WABAs. They are accounts
 * that other businesses have shared with you, typically through
 * the Embedded Signup flow.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts
 */
export class SharedWABAsAPI {
  constructor(private readonly client: HTTPClient) {}

  /**
   * List all shared WhatsApp Business Accounts
   * 
   * Returns WABAs that have been shared with your business account
   * through Embedded Signup or partner integrations. These are different
   * from owned WABAs which you directly control.
   * 
   * @param businessId - Business account ID
   * @param options - Pagination options
   * @returns List of shared WABAs
   * 
   * @example
   * ```typescript
   * // Get all shared WABAs
   * const shared = await client.sharedWABAs.list('506914307656634');
   * 
   * shared.data.forEach(waba => {
   *   console.log(`Shared WABA: ${waba.name} (${waba.id})`);
   *   console.log(`Currency: ${waba.currency}`);
   * });
   * 
   * // Paginate results
   * const nextPage = await client.sharedWABAs.list('506914307656634', {
   *   limit: 10,
   *   after: shared.paging?.cursors?.after
   * });
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts#get-list-of-shared-wabas
   */
  async list(
    businessId: string,
    options?: ListSharedWABAsOptions
  ): Promise<SharedWABAsResponse> {
    let endpoint = `${businessId}/client_whatsapp_business_accounts`;

    const params: string[] = [];

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

    return this.client.get<SharedWABAsResponse>(endpoint);
  }

  /**
   * Get all shared WABAs without pagination
   * 
   * Convenience method that fetches all shared WABAs by following
   * pagination automatically. Use with caution if you have many shared WABAs.
   * 
   * @param businessId - Business account ID
   * @returns Complete list of all shared WABAs
   * 
   * @example
   * ```typescript
   * const allShared = await client.sharedWABAs.listAll('506914307656634');
   * console.log(`Total shared WABAs: ${allShared.length}`);
   * ```
   */
  async listAll(businessId: string): Promise<SharedWABAsResponse['data']> {
    const allWABAs: SharedWABAsResponse['data'] = [];
    let after: string | undefined;

    do {
      const response = await this.list(businessId, { after, limit: 100 });
      allWABAs.push(...response.data);
      after = response.paging?.cursors?.after;
    } while (after);

    return allWABAs;
  }

  /**
   * Check if a specific WABA is shared with your business
   * 
   * @param businessId - Business account ID
   * @param wabaId - WABA ID to check
   * @returns True if WABA is shared, false otherwise
   * 
   * @example
   * ```typescript
   * const isShared = await client.sharedWABAs.isShared(
   *   '506914307656634',
   *   '104996122399160'
   * );
   * 
   * if (isShared) {
   *   console.log('This WABA is shared with your business');
   * }
   * ```
   */
  async isShared(businessId: string, wabaId: string): Promise<boolean> {
    const allWABAs = await this.listAll(businessId);
    return allWABAs.some(waba => waba.id === wabaId);
  }
}
