/**
 * Typing Indicators Tests
 * @module messages/typing.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TypingIndicatorAPI } from './typing.js';
import type { HttpClient } from '../client/http.js';

describe('TypingIndicatorAPI', () => {
  let typingAPI: TypingIndicatorAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';
  const testRecipient = '+1234567890';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    typingAPI = new TypingIndicatorAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('sendTypingIndicator', () => {
    it('should send typing indicator', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await typingAPI.sendTypingIndicator({
        to: testRecipient,
        action: 'typing',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: testRecipient,
        type: 'chat_state',
        chat_state: {
          action: 'typing',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should send stop typing indicator', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await typingAPI.sendTypingIndicator({
        to: testRecipient,
        action: 'stop_typing',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: testRecipient,
        type: 'chat_state',
        chat_state: {
          action: 'stop_typing',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should handle both typing actions', async () => {
      const mockResponse = { success: true };
      const actions = ['typing', 'stop_typing'] as const;

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      for (const action of actions) {
        await typingAPI.sendTypingIndicator({
          to: testRecipient,
          action,
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[
          vi.mocked(mockHttpClient.post).mock.calls.length - 1
        ][1];
        expect(callArgs.chat_state.action).toBe(action);
      }
    });

    it('should work with different recipient numbers', async () => {
      const mockResponse = { success: true };
      const recipients = ['+1234567890', '+44123456789', '+62812345678'];

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      for (const recipient of recipients) {
        await typingAPI.sendTypingIndicator({
          to: recipient,
          action: 'typing',
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[
          vi.mocked(mockHttpClient.post).mock.calls.length - 1
        ][1];
        expect(callArgs.to).toBe(recipient);
      }
    });
  });
});
