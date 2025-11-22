/**
 * Block Users Management
 * Block and unblock WhatsApp users
 * @module account/block-users
 */

import type { HTTPClient } from '../client/http.js';
import type { BlockedUsersListResponse } from '../types/block-users.js';

/**
 * Block Users API
 * Provides methods to block, unblock, and list blocked users
 */
export class BlockUsersAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Block a user
   * 
   * Blocks a WhatsApp user from sending messages to your business.
   * Blocked users will not be able to send messages until unblocked.
   * 
   * @param phoneNumber - User's WhatsApp phone number (with country code, e.g., "+1234567890")
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/block-users
   */
  async blockUser(phoneNumber: string): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${this.phoneNumberId}/block`, {
      phone_number: phoneNumber,
    });
  }

  /**
   * Unblock a user
   * 
   * Unblocks a previously blocked WhatsApp user, allowing them to send
   * messages to your business again.
   * 
   * @param phoneNumber - User's WhatsApp phone number (with country code, e.g., "+1234567890")
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/block-users
   */
  async unblockUser(phoneNumber: string): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(`${this.phoneNumberId}/unblock`, {
      phone_number: phoneNumber,
    });
  }

  /**
   * Get list of blocked users
   * 
   * Retrieves the list of all users that have been blocked by your business.
   * 
   * @returns List of blocked users
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/block-users
   */
  async getBlockedUsers(): Promise<BlockedUsersListResponse> {
    return this.httpClient.get<BlockedUsersListResponse>(`${this.phoneNumberId}/blocked_users`);
  }
}
