/**
 * Unit tests for Business Accounts API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BusinessAccountsAPI } from './business-accounts.js';
import type { HTTPClient } from '../client/http.js';

describe('BusinessAccountsAPI', () => {
  let mockClient: HTTPClient;
  let api: BusinessAccountsAPI;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    } as unknown as HTTPClient;

    api = new BusinessAccountsAPI(mockClient);
  });

  describe('getBusinessAccount', () => {
    it('should get business account with default fields', async () => {
      const mockResponse = {
        id: '506914307656634',
        name: 'Lucky Shrub',
        timezone_id: 0,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.getBusinessAccount('506914307656634');

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634?fields=id,name,timezone_id'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get business account with custom fields', async () => {
      const mockResponse = {
        id: '506914307656634',
        name: 'Lucky Shrub',
        timezone_id: 0,
        verification_status: 'verified' as const,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.getBusinessAccount('506914307656634', {
        fields: ['id', 'name', 'timezone_id', 'verification_status'],
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634?fields=id,name,timezone_id,verification_status'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle business account not found', async () => {
      const error = new Error('Business account not found');
      vi.mocked(mockClient.get).mockRejectedValue(error);

      await expect(
        api.getBusinessAccount('invalid-id')
      ).rejects.toThrow('Business account not found');
    });
  });

  describe('listExtendedCredits', () => {
    it('should list extended credits with default options', async () => {
      const mockResponse = {
        data: [
          {
            id: '1972385232742146',
            legal_entity_name: 'Lucky Shrub',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.listExtendedCredits('506914307656634');

      expect(mockClient.get).toHaveBeenCalledWith('506914307656634/extendedcredits');
      expect(result).toEqual(mockResponse);
    });

    it('should list extended credits with custom fields', async () => {
      const mockResponse = {
        data: [
          {
            id: '1972385232742146',
            legal_entity_name: 'Lucky Shrub',
            credit_available: 1000000,
            balance: 50000,
            currency: 'USD',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.listExtendedCredits('506914307656634', {
        fields: ['id', 'legal_entity_name', 'credit_available', 'balance', 'currency'],
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/extendedcredits?fields=id,legal_entity_name,credit_available,balance,currency'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination with limit', async () => {
      const mockResponse = {
        data: [
          {
            id: '1972385232742146',
            legal_entity_name: 'Lucky Shrub',
          },
        ],
        paging: {
          cursors: {
            after: 'cursor123',
          },
          next: 'https://graph.facebook.com/v18.0/506914307656634/extendedcredits?after=cursor123',
        },
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.listExtendedCredits('506914307656634', {
        limit: 10,
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/extendedcredits?limit=10'
      );
      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.after).toBe('cursor123');
    });

    it('should handle pagination with after cursor', async () => {
      const mockResponse = {
        data: [
          {
            id: '1972385232742147',
            legal_entity_name: 'Another Credit Line',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.listExtendedCredits('506914307656634', {
        after: 'cursor123',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/extendedcredits?after=cursor123'
      );
    });

    it('should handle multiple query parameters', async () => {
      const mockResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      await api.listExtendedCredits('506914307656634', {
        fields: ['id', 'legal_entity_name'],
        limit: 5,
        after: 'cursor123',
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/extendedcredits?fields=id,legal_entity_name&limit=5&after=cursor123'
      );
    });
  });

  describe('getCreditBalance', () => {
    it('should get credit balance with predefined fields', async () => {
      const mockResponse = {
        data: [
          {
            id: '1972385232742146',
            legal_entity_name: 'Lucky Shrub',
            credit_available: 1000000,
            balance: 50000,
            currency: 'USD',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.getCreditBalance('506914307656634');

      expect(mockClient.get).toHaveBeenCalledWith(
        '506914307656634/extendedcredits?fields=id,legal_entity_name,credit_available,balance,currency'
      );
      expect(result).toEqual(mockResponse);
      expect(result.data[0].credit_available).toBe(1000000);
      expect(result.data[0].balance).toBe(50000);
      expect(result.data[0].currency).toBe('USD');
    });

    it('should handle empty credit lines', async () => {
      const mockResponse = {
        data: [],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await api.getCreditBalance('506914307656634');

      expect(result.data).toHaveLength(0);
    });
  });
});
