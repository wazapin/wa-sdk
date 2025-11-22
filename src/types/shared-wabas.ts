/**
 * Shared WABAs types
 * 
 * Shared WhatsApp Business Accounts are WABAs that have been shared
 * with your business through Embedded Signup or partner integrations.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup/manage-accounts
 */

/**
 * Shared WhatsApp Business Account
 */
export interface SharedWABA {
  /**
   * WhatsApp Business Account ID
   */
  id: string;

  /**
   * WABA name
   */
  name: string;

  /**
   * Currency used for billing (e.g., "USD", "EUR", "INR")
   */
  currency?: string;

  /**
   * Timezone ID
   */
  timezone_id?: string;

  /**
   * Message template namespace
   */
  message_template_namespace?: string;
}

/**
 * Response containing list of shared WABAs
 */
export interface SharedWABAsResponse {
  /**
   * Array of shared WABAs
   */
  data: SharedWABA[];

  /**
   * Pagination cursors
   */
  paging?: {
    cursors?: {
      /**
       * Cursor for previous page
       */
      before?: string;

      /**
       * Cursor for next page
       */
      after?: string;
    };
  };
}

/**
 * Options for listing shared WABAs
 */
export interface ListSharedWABAsOptions {
  /**
   * Maximum number of WABAs to return
   * @default 25
   */
  limit?: number;

  /**
   * Cursor for pagination (next page)
   */
  after?: string;

  /**
   * Cursor for pagination (previous page)
   */
  before?: string;
}
