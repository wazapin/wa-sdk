/**
 * Unit tests for reaction message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendReaction } from './reaction.js';
import { HTTPClient } from '../client/http.js';
import type { SendReactionParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('sendReaction', () => {
  let mockClient: HTTPClient;
  let mockPost: ReturnType<typeof vi.fn>;
  const mockResponse: MessageResponse = {
    messaging_product: 'whatsapp',
    contacts: [{ input: '1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.123' }],
  };

  beforeEach(() => {
    mockPost = vi.fn().mockResolvedValue(mockResponse);
    mockClient = {
      post: mockPost,
    } as unknown as HTTPClient;
  });

  it('should send reaction with emoji', async () => {
    const params: SendReactionParams = {
      to: '1234567890',
      messageId: 'wamid.original',
      emoji: '👍',
    };

    const result = await sendReaction(mockClient, 'phone123', params);

    expect(result).toEqual(mockResponse);
    expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '1234567890',
      type: 'reaction',
      reaction: {
        message_id: 'wamid.original',
        emoji: '👍',
      },
    });
  });

  it('should remove reaction with empty emoji', async () => {
    const params: SendReactionParams = {
      to: '1234567890',
      messageId: 'wamid.original',
      emoji: '',
    };

    await sendReaction(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        reaction: {
          message_id: 'wamid.original',
          emoji: '',
        },
      })
    );
  });

  it('should send reaction with different emojis', async () => {
    const emojis = ['❤️', '😂', '😮', '😢', '🙏'];

    for (const emoji of emojis) {
      const params: SendReactionParams = {
        to: '1234567890',
        messageId: 'wamid.original',
        emoji,
      };

      await sendReaction(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          reaction: {
            message_id: 'wamid.original',
            emoji,
          },
        })
      );
    }
  });
});
