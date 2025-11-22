/**
 * Analytics Tests
 * @module analytics/index.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsAPI } from './index.js';
import type { HttpClient } from '../client/http.js';
import type { AnalyticsData } from '../types/analytics.js';

describe('AnalyticsAPI', () => {
  let analyticsAPI: AnalyticsAPI;
  let mockHttpClient: HttpClient;
  const testWabaId = 'waba_123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    analyticsAPI = new AnalyticsAPI(mockHttpClient, testWabaId);
  });

  describe('getConversationAnalytics', () => {
    it('should get conversation analytics with basic params', async () => {
      const mockResponse: AnalyticsData = {
        data: [
          {
            start: 1609459200,
            end: 1609545600,
            conversation_start: 100,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining(`${testWabaId}/conversation_analytics`));
      expect(result.data).toHaveLength(1);
      expect(result.data[0].conversation_start).toBe(100);
    });

    it('should support granularity parameter', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1612137600,
        granularity: 'DAILY',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('granularity=DAILY'));
    });

    it('should support MONTHLY granularity', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1612137600,
        granularity: 'MONTHLY',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('granularity=MONTHLY'));
    });

    it('should filter by phone numbers', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
        phone_numbers: ['+1234567890', '+0987654321'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('phone_numbers'));
    });

    it('should filter by country codes', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
        country_codes: ['US', 'GB', 'ID'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('country_codes'));
    });

    it('should handle multiple filters', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
        granularity: 'DAILY',
        phone_numbers: ['+1234567890'],
        country_codes: ['US'],
      });

      const callArgs = vi.mocked(mockHttpClient.get).mock.calls[0][0];
      expect(callArgs).toContain('granularity=DAILY');
      expect(callArgs).toContain('phone_numbers');
      expect(callArgs).toContain('country_codes');
    });

    it('should handle ISO 8601 date format', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getConversationAnalytics({
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-31T23:59:59Z',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('start=2025-01-01T00%3A00%3A00Z'));
    });

    it('should handle pagination', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getConversationAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.before).toBe('cursor_before');
      expect(result.paging?.cursors?.after).toBe('cursor_after');
    });
  });

  describe('getMessageAnalytics', () => {
    it('should get message analytics with basic params', async () => {
      const mockResponse: AnalyticsData = {
        data: [
          {
            start: 1609459200,
            end: 1609545600,
            sent: 500,
            delivered: 480,
            read: 450,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining(`${testWabaId}/analytics`));
      expect(result.data).toHaveLength(1);
      expect(result.data[0].sent).toBe(500);
      expect(result.data[0].delivered).toBe(480);
      expect(result.data[0].read).toBe(450);
    });

    it('should support granularity parameter', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1612137600,
        granularity: 'DAILY',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('granularity=DAILY'));
    });

    it('should filter by phone numbers', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
        phone_numbers: ['+1234567890'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('phone_numbers'));
    });

    it('should handle all metric types', async () => {
      const mockResponse: AnalyticsData = {
        data: [
          {
            start: 1609459200,
            end: 1609545600,
            sent: 100,
            delivered: 95,
            read: 90,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await analyticsAPI.getMessageAnalytics({
        start: 1609459200,
        end: 1609545600,
      });

      expect(result.data[0]).toHaveProperty('sent');
      expect(result.data[0]).toHaveProperty('delivered');
      expect(result.data[0]).toHaveProperty('read');
    });

    it('should handle ISO 8601 date format', async () => {
      const mockResponse: AnalyticsData = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await analyticsAPI.getMessageAnalytics({
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-31T23:59:59Z',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('start=2025-01-01T00%3A00%3A00Z'));
    });
  });
});
