/**
 * Business Accounts and Billing types for WhatsApp Business Management API
 */

/**
 * Business account information
 * 
 * @see https://developers.facebook.com/docs/marketing-api/reference/business/
 */
export interface BusinessAccount {
  /**
   * Business account ID
   */
  id: string;

  /**
   * Business account name
   */
  name: string;

  /**
   * Timezone ID
   * @see https://developers.facebook.com/docs/marketing-api/reference/business/#Reading
   */
  timezone_id?: number;

  /**
   * Business creation time (Unix timestamp)
   */
  created_time?: string;

  /**
   * Business update time (Unix timestamp)
   */
  updated_time?: string;

  /**
   * Business verification status
   */
  verification_status?: 'not_verified' | 'verified';

  /**
   * Primary page associated with business
   */
  primary_page?: {
    id: string;
    name: string;
  };

  /**
   * Link to business in Business Manager
   */
  link?: string;
}

/**
 * Response from getting business account details
 */
export interface BusinessAccountResponse extends BusinessAccount {}

/**
 * Extended credit information for billing
 * 
 * @see https://developers.facebook.com/docs/marketing-api/reference/extended-credit/
 */
export interface ExtendedCredit {
  /**
   * Extended credit ID
   */
  id: string;

  /**
   * Legal entity name associated with the credit line
   */
  legal_entity_name: string;

  /**
   * Credit available amount in cents
   */
  credit_available?: number;

  /**
   * Credit balance in cents (amount owed)
   */
  balance?: number;

  /**
   * Credit type
   */
  credit_type?: 'ads' | 'whatsapp';

  /**
   * Allocated credit amount in cents
   */
  allocated_amount?: number;

  /**
   * Credit line currency (e.g., "USD")
   */
  currency?: string;

  /**
   * Maximum credit limit in cents
   */
  max_balance?: number;

  /**
   * Whether this is the default credit line
   */
  is_access_revoked?: boolean;

  /**
   * Liability type
   */
  liability_type?: 'normal' | 'sequential';

  /**
   * Partition type
   */
  partition_type?: string;

  /**
   * Receiving business information
   */
  receiving_business?: {
    id: string;
    name: string;
  };

  /**
   * Owning business information
   */
  owning_business?: {
    id: string;
    name: string;
  };
}

/**
 * Response from listing extended credits
 */
export interface ExtendedCreditsResponse {
  /**
   * List of extended credit lines
   */
  data: ExtendedCredit[];

  /**
   * Pagination cursor information
   */
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * Options for getting business account details
 */
export interface GetBusinessAccountOptions {
  /**
   * Fields to retrieve (comma-separated)
   * Common fields: id, name, timezone_id, verification_status, primary_page
   */
  fields?: string[];
}

/**
 * Options for listing extended credits
 */
export interface ListExtendedCreditsOptions {
  /**
   * Fields to retrieve for each credit line
   */
  fields?: string[];

  /**
   * Maximum number of results to return (default: 25)
   */
  limit?: number;

  /**
   * Cursor for pagination (after)
   */
  after?: string;

  /**
   * Cursor for pagination (before)
   */
  before?: string;
}
