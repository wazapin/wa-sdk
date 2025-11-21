/**
 * Tests for messaging limits operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMessagingLimit } from './messaging-limits.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type { MessagingLimitResponse } from '../types/account.js';

describe('getMessagingLimit', () => {
  let mockClient: HTTPClient;
  let validator: Validator;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    } as unknown as HTTPClient;

    validator = new Validator('strict');
  });

  describe('happy path', () => {
    it('should get messaging limit successfully with TIER_250', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_250',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(mockClient.get).toHaveBeenCalledWith(
        '106540352242922?fields=whatsapp_business_manager_messaging_limit'
      );
      expect(result).toEqual(mockResponse);
      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_250');
    });

    it('should get messaging limit successfully with TIER_2000', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_2000',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_2000');
    });

    it('should get messaging limit successfully with TIER_10K', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_10K',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_10K');
    });

    it('should get messaging limit successfully with TIER_100K', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_100K',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_100K');
    });

    it('should get messaging limit successfully with TIER_UNLIMITED', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_UNLIMITED',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(result.whatsapp_business_manager_messaging_limit).toBe('TIER_UNLIMITED');
    });

    it('should work without validator', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_250',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('validation', () => {
    it('should validate response with validator', async () => {
      const mockResponse: MessagingLimitResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_250',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await getMessagingLimit(mockClient, '106540352242922', validator);

      expect(result).toEqual(mockResponse);
    });

    it('should reject invalid tier value', async () => {
      const mockResponse = {
        whatsapp_business_manager_messaging_limit: 'INVALID_TIER',
        id: '106540352242922',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      await expect(
        getMessagingLimit(mockClient, '106540352242922', validator)
      ).rejects.toThrow();
    });

    it('should reject response missing required fields', async () => {
      const mockResponse = {
        whatsapp_business_manager_messaging_limit: 'TIER_250',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      await expect(
        getMessagingLimit(mockClient, '106540352242922', validator)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.spyOn(mockClient, 'get').mockRejectedValue(new Error('API Error'));

      await expect(getMessagingLimit(mockClient, '106540352242922')).rejects.toThrow(
        'API Error'
      );
    });

    it('should handle network errors gracefully', async () => {
      vi.spyOn(mockClient, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(getMessagingLimit(mockClient, '106540352242922')).rejects.toThrow(
        'Network Error'
      );
    });
  });
});
