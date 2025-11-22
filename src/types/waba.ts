/**
 * WhatsApp Business Account (WABA) Types
 * @module types/waba
 */

/**
 * WhatsApp Business Account details
 */
export interface WABADetails {
  /**
   * WABA ID
   */
  id: string;
  /**
   * WABA name
   */
  name: string;
  /**
   * Timezone ID
   */
  timezone_id: string;
  /**
   * Message template namespace
   */
  message_template_namespace: string;
  /**
   * Currency code (optional, only for some WABAs)
   */
  currency?: string;
}

/**
 * Response for listing WABAs
 */
export interface WABAListResponse {
  /**
   * Array of WABA details
   */
  data: WABADetails[];
  /**
   * Pagination information
   */
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}
