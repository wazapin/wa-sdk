/**
 * Tests for Shared WABAs API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SharedWABAsAPI } from './shared-wabas.js';
import type { HTTPClient } from '../client/http.js';
import type { SharedWABAsResponse } from '../types/shared-wabas.js';

describe('SharedWABAsAPI', () => {
  let api: SharedWABAsAPI;
  let mockClient: HTTPClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    } as unknown as HTTPClient;

    api = new SharedWABAsAPI(mockClient);
  });

  describe('list', () => {
    it('should list shared WABAs', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [
          {
            id: '104996122399160',
            name: 'Shared WABA 1',
            currency: 'USD',
            timezone_id: '1',
            message_template_namespace: 'namespace1',
          },
          {
            id: '102290129340398',
            name: 'Shared WABA 2',
            currency: 'EUR',
            timezone_id: '2',
            message_template_namespace: 'namespace2',
          },
        ],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.list('506914307656634');

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/client_whatsapp_business_accounts'
      );
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should list shared WABAs with limit', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [
          {
            id: '104996122399160',
            name: 'Shared WABA',
            currency: 'USD',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.list('506914307656634', { limit: 10 });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/client_whatsapp_business_accounts?limit=10'
      );
    });

    it('should list shared WABAs with pagination cursor (after)', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.list('506914307656634', { after: 'cursor_123' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/client_whatsapp_business_accounts?after=cursor_123'
      );
    });

    it('should list shared WABAs with pagination cursor (before)', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.list('506914307656634', { before: 'cursor_456' });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/client_whatsapp_business_accounts?before=cursor_456'
      );
    });

    it('should combine multiple query parameters', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.list('506914307656634', {
        limit: 25,
        after: 'cursor_789',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/client_whatsapp_business_accounts?limit=25&after=cursor_789'
      );
    });

    it('should handle empty response', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.list('506914307656634');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('listAll', () => {
    it('should fetch all shared WABAs without pagination', async () => {
      const firstPage: SharedWABAsResponse = {
        data: [
          { id: '1', name: 'WABA 1' },
          { id: '2', name: 'WABA 2' },
        ],
        paging: {
          cursors: {
            after: 'cursor_next',
          },
        },
      };

      const secondPage: SharedWABAsResponse = {
        data: [
          { id: '3', name: 'WABA 3' },
        ],
      };

      vi.mocked(mockClient.get)
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      const result = await api.listAll('506914307656634');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
      expect(mockClient.get).toHaveBeenCalledTimes(2);
    });

    it('should handle single page response', async () => {
      const response: SharedWABAsResponse = {
        data: [
          { id: '1', name: 'WABA 1' },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await api.listAll('506914307656634');

      expect(result).toHaveLength(1);
      expect(mockClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle empty response', async () => {
      const response: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await api.listAll('506914307656634');

      expect(result).toHaveLength(0);
      expect(mockClient.get).toHaveBeenCalledTimes(1);
    });

    it('should follow pagination until no more pages', async () => {
      const pages: SharedWABAsResponse[] = [
        {
          data: [{ id: '1', name: 'WABA 1' }],
          paging: { cursors: { after: 'cursor1' } },
        },
        {
          data: [{ id: '2', name: 'WABA 2' }],
          paging: { cursors: { after: 'cursor2' } },
        },
        {
          data: [{ id: '3', name: 'WABA 3' }],
        },
      ];

      vi.mocked(mockClient.get)
        .mockResolvedValueOnce(pages[0])
        .mockResolvedValueOnce(pages[1])
        .mockResolvedValueOnce(pages[2]);

      const result = await api.listAll('506914307656634');

      expect(result).toHaveLength(3);
      expect(mockClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('isShared', () => {
    it('should return true if WABA is shared', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [
          { id: '104996122399160', name: 'Shared WABA 1' },
          { id: '102290129340398', name: 'Shared WABA 2' },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.isShared('506914307656634', '104996122399160');

      expect(result).toBe(true);
    });

    it('should return false if WABA is not shared', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [
          { id: '104996122399160', name: 'Shared WABA 1' },
          { id: '102290129340398', name: 'Shared WABA 2' },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.isShared('506914307656634', '999999999999999');

      expect(result).toBe(false);
    });

    it('should return false if no shared WABAs exist', async () => {
      const mockResponse: SharedWABAsResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.isShared('506914307656634', '104996122399160');

      expect(result).toBe(false);
    });
  });

  describe('API error handling', () => {
    it('should propagate API errors', async () => {
      const apiError = new Error('API Error: Invalid business ID');
      vi.mocked(mockClient.get).mockRejectedValue(apiError);

      await expect(api.list('506914307656634')).rejects.toThrow(
        'API Error: Invalid business ID'
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockClient.get).mockRejectedValue(networkError);

      await expect(api.list('506914307656634')).rejects.toThrow(
        'Network timeout'
      );
    });
  });
});
