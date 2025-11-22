/**
 * Block Users Types
 * @module types/block-users
 */

/**
 * Blocked user details
 */
export interface BlockedUser {
  /**
   * WhatsApp user phone number
   */
  phone_number: string;
  /**
   * Block timestamp
   */
  blocked_at?: string;
}

/**
 * Blocked users list response
 */
export interface BlockedUsersListResponse {
  data: BlockedUser[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}
