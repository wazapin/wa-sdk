/**
 * Block Users Tests
 * @module account/block-users.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlockUsersAPI } from './block-users.js';
import type { HttpClient } from '../client/http.js';
import type { BlockedUsersListResponse } from '../types/block-users.js';

describe('BlockUsersAPI', () => {
  let blockUsersAPI: BlockUsersAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';
  const testUserPhone = '+1234567890';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    blockUsersAPI = new BlockUsersAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('blockUser', () => {
    it('should block a user', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.blockUser(testUserPhone);

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/block`, {
          phone_number: testUserPhone,
        );
      expect(result.success).toBe(true);
    });

    it('should handle different phone number formats', async () => {
      const mockResponse = { success: true };
      const phoneNumbers = ['+1234567890', '+44123456789', '+62812345678'];

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      for (const phoneNumber of phoneNumbers) {
        await blockUsersAPI.blockUser(phoneNumber);

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              phone_number: phoneNumber,
            },
          }),
        );
      }
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.unblockUser(testUserPhone);

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/unblock`, {
          phone_number: testUserPhone,
        );
      expect(result.success).toBe(true);
    });

    it('should handle different phone number formats', async () => {
      const mockResponse = { success: true };
      const phoneNumbers = ['+1234567890', '+44123456789', '+62812345678'];

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      for (const phoneNumber of phoneNumbers) {
        await blockUsersAPI.unblockUser(phoneNumber);

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              phone_number: phoneNumber,
            },
          }),
        );
      }
    });
  });

  describe('getBlockedUsers', () => {
    it('should get list of blocked users', async () => {
      const mockResponse: BlockedUsersListResponse = {
        data: [
          {
            phone_number: '+1234567890',
          },
          {
            phone_number: '+0987654321',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.getBlockedUsers();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}/blocked_users`);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].phone_number).toBe('+1234567890');
    });

    it('should handle empty blocked users list', async () => {
      const mockResponse: BlockedUsersListResponse = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.getBlockedUsers();

      expect(result.data).toHaveLength(0);
    });

    it('should include pagination', async () => {
      const mockResponse: BlockedUsersListResponse = {
        data: [{ phone_number: '+1234567890' }],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.getBlockedUsers();

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.before).toBe('cursor_before');
      expect(result.paging?.cursors?.after).toBe('cursor_after');
    });

    it('should include blocked_at timestamp when present', async () => {
      const mockResponse: BlockedUsersListResponse = {
        data: [
          {
            phone_number: '+1234567890',
            blocked_at: '2025-01-01T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await blockUsersAPI.getBlockedUsers();

      expect(result.data[0].blocked_at).toBe('2025-01-01T00:00:00Z');
    });
  });
});
