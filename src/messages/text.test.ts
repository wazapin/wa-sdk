/**
 * Unit tests for text message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendText } from './text.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type { SendTextParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('sendText', () => {
  let mockClient: HTTPClient;
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPost = vi.fn();
    mockClient = {
      post: mockPost,
    } as unknown as HTTPClient;
  });

  describe('successful sending', () => {
    it('should send a basic text message', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Hello, World!',
      };

      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await sendText(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'text',
        text: {
          preview_url: false,
          body: 'Hello, World!',
        },
      });
    });

    it('should send text message with preview URL enabled', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Check this out: https://example.com',
        previewUrl: true,
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          text: {
            preview_url: true,
            body: 'Check this out: https://example.com',
          },
        })
      );
    });

    it('should send text message with emojis', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Hello! 👋 How are you? 😊',
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          text: {
            preview_url: false,
            body: 'Hello! 👋 How are you? 😊',
          },
        })
      );
    });

    it('should send text message with context (reply)', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'This is a reply',
        context: {
          messageId: 'wamid.original',
        },
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.reply' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          context: {
            message_id: 'wamid.original',
          },
        })
      );
    });
  });

  describe('validation', () => {
    it('should validate parameters in strict mode', async () => {
      const validator = new Validator('strict');
      const params: SendTextParams = {
        to: '+1234567890',
        text: 'Hello',
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });

    it('should skip validation when validator is not provided', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Hello',
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalled();
    });

    it('should skip validation in off mode', async () => {
      const validator = new Validator('off');
      const params = {
        to: '1234567890',
        text: 'Hello',
      } as SendTextParams;

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });
  });

  describe('special characters', () => {
    it('should handle newlines correctly', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Line 1\nLine 2\nLine 3',
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          text: {
            preview_url: false,
            body: 'Line 1\nLine 2\nLine 3',
          },
        })
      );
    });

    it('should handle special characters', async () => {
      const params: SendTextParams = {
        to: '1234567890',
        text: 'Special chars: @#$%^&*()_+-=[]{}|;:\'",.<>?/',
      };

      mockPost.mockResolvedValue({
        messaging_product: 'whatsapp',
        contacts: [{ input: '1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.123' }],
      });

      await sendText(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalled();
    });
  });
});
