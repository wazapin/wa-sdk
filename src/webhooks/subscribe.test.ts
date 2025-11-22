/**
 * Webhook Subscriptions Tests
 * @module webhooks/subscribe.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhookSubscriptionAPI } from './subscribe.js';
import type { HttpClient } from '../client/http.js';

describe('WebhookSubscriptionAPI', () => {
  let webhookSubAPI: WebhookSubscriptionAPI;
  let mockHttpClient: HttpClient;
  const testWabaId = 'waba_123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    webhookSubAPI = new WebhookSubscriptionAPI(mockHttpClient);
  });

  describe('subscribeToWABA', () => {
    it('should subscribe to WABA webhooks', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await webhookSubAPI.subscribeToWABA(testWabaId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testWabaId}/subscribed_apps`);
      expect(result.success).toBe(true);
    });

    it('should work with different WABA IDs', async () => {
      const mockResponse = { success: true };
      const wabaIds = ['waba_123', 'waba_456', 'waba_789'];

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      for (const wabaId of wabaIds) {
        await webhookSubAPI.subscribeToWABA(wabaId);

        expect(mockHttpClient.post).toHaveBeenCalledWith(`${wabaId}/subscribed_apps`);
      }
    });
  });
});
