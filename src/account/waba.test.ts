/**
 * WABA Management Tests
 * @module account/waba.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WABAManagementAPI } from './waba.js';
import type { HttpClient } from '../client/http.js';
import type { WABADetails, WABAListResponse } from '../types/waba.js';

describe('WABAManagementAPI', () => {
  let wabaAPI: WABAManagementAPI;
  let mockHttpClient: HttpClient;
  const testWabaId = 'waba_123456789';
  const testBusinessId = 'business_123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    wabaAPI = new WABAManagementAPI(mockHttpClient);
  });

  describe('getWABA', () => {
    it('should get WABA details by ID', async () => {
      const mockResponse: WABADetails = {
        id: testWabaId,
        name: 'Test WABA',
        timezone_id: '1',
        message_template_namespace: 'test_namespace_123',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getWABA(testWabaId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}`);
      expect(result).toEqual(mockResponse);
      expect(result.id).toBe(testWabaId);
    });

    it('should include currency if present', async () => {
      const mockResponse: WABADetails = {
        id: testWabaId,
        name: 'Test WABA',
        timezone_id: '1',
        message_template_namespace: 'test_namespace_123',
        currency: 'USD',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getWABA(testWabaId);

      expect(result.currency).toBe('USD');
    });

    it('should handle different timezone IDs', async () => {
      const timezoneIds = ['1', '5', '8', '12'];

      for (const timezone_id of timezoneIds) {
        const mockResponse: WABADetails = {
          id: testWabaId,
          name: 'Test WABA',
          timezone_id,
          message_template_namespace: 'test_namespace_123',
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await wabaAPI.getWABA(testWabaId);

        expect(result.timezone_id).toBe(timezone_id);
      }
    });
  });

  describe('getOwnedWABAs', () => {
    it('should get list of owned WABAs', async () => {
      const mockResponse: WABAListResponse = {
        data: [
          {
            id: 'waba_1',
            name: 'WABA 1',
            timezone_id: '1',
            message_template_namespace: 'namespace_1',
          },
          {
            id: 'waba_2',
            name: 'WABA 2',
            timezone_id: '1',
            message_template_namespace: 'namespace_2',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getOwnedWABAs(testBusinessId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testBusinessId}/owned_whatsapp_business_accounts`);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('waba_1');
      expect(result.data[1].id).toBe('waba_2');
    });

    it('should handle empty WABA list', async () => {
      const mockResponse: WABAListResponse = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getOwnedWABAs(testBusinessId);

      expect(result.data).toHaveLength(0);
    });

    it('should include pagination information', async () => {
      const mockResponse: WABAListResponse = {
        data: [
          {
            id: 'waba_1',
            name: 'WABA 1',
            timezone_id: '1',
            message_template_namespace: 'namespace_1',
          },
        ],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getOwnedWABAs(testBusinessId);

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.before).toBe('cursor_before');
      expect(result.paging?.cursors?.after).toBe('cursor_after');
    });

    it('should include currency for WABAs that have it', async () => {
      const mockResponse: WABAListResponse = {
        data: [
          {
            id: 'waba_1',
            name: 'US WABA',
            timezone_id: '1',
            message_template_namespace: 'namespace_1',
            currency: 'USD',
          },
          {
            id: 'waba_2',
            name: 'India WABA',
            timezone_id: '5',
            message_template_namespace: 'namespace_2',
            currency: 'INR',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getOwnedWABAs(testBusinessId);

      expect(result.data[0].currency).toBe('USD');
      expect(result.data[1].currency).toBe('INR');
    });
  });

  describe('getSharedWABAs', () => {
    it('should get list of shared WABAs', async () => {
      const mockResponse: WABAListResponse = {
        data: [
          {
            id: 'shared_waba_1',
            name: 'Shared WABA 1',
            timezone_id: '1',
            message_template_namespace: 'shared_namespace_1',
          },
          {
            id: 'shared_waba_2',
            name: 'Shared WABA 2',
            timezone_id: '1',
            message_template_namespace: 'shared_namespace_2',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getSharedWABAs(testBusinessId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testBusinessId}/client_whatsapp_business_accounts`);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('shared_waba_1');
      expect(result.data[1].id).toBe('shared_waba_2');
    });

    it('should handle empty shared WABA list', async () => {
      const mockResponse: WABAListResponse = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getSharedWABAs(testBusinessId);

      expect(result.data).toHaveLength(0);
    });

    it('should include pagination for shared WABAs', async () => {
      const mockResponse: WABAListResponse = {
        data: [
          {
            id: 'shared_waba_1',
            name: 'Shared WABA 1',
            timezone_id: '1',
            message_template_namespace: 'shared_namespace_1',
          },
        ],
        paging: {
          cursors: {
            before: 'shared_cursor_before',
            after: 'shared_cursor_after',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await wabaAPI.getSharedWABAs(testBusinessId);

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.before).toBe('shared_cursor_before');
      expect(result.paging?.cursors?.after).toBe('shared_cursor_after');
    });

    it('should distinguish shared WABAs from owned WABAs', async () => {
      const ownedResponse: WABAListResponse = {
        data: [
          {
            id: 'owned_waba_1',
            name: 'Owned WABA',
            timezone_id: '1',
            message_template_namespace: 'owned_namespace',
          },
        ],
      };

      const sharedResponse: WABAListResponse = {
        data: [
          {
            id: 'shared_waba_1',
            name: 'Shared WABA',
            timezone_id: '1',
            message_template_namespace: 'shared_namespace',
          },
        ],
      };

      vi.mocked(mockHttpClient.get)
        .mockResolvedValueOnce(ownedResponse)
        .mockResolvedValueOnce(sharedResponse);

      const ownedResult = await wabaAPI.getOwnedWABAs(testBusinessId);
      const sharedResult = await wabaAPI.getSharedWABAs(testBusinessId);

      expect(ownedResult.data[0].id).toBe('owned_waba_1');
      expect(sharedResult.data[0].id).toBe('shared_waba_1');

      expect(mockHttpClient.get).toHaveBeenNthCalledWith(1, `${testBusinessId}/owned_whatsapp_business_accounts`);
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(2, `${testBusinessId}/client_whatsapp_business_accounts`);
    });
  });
});
