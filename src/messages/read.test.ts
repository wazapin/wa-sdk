/**
 * Unit tests for mark as read functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markAsRead } from './read.js';
import { HTTPClient } from '../client/http.js';

describe('markAsRead', () => {
  let mockClient: HTTPClient;
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPost = vi.fn().mockResolvedValue({});
    mockClient = {
      post: mockPost,
    } as unknown as HTTPClient;
  });

  it('should mark message as read', async () => {
    const result = await markAsRead(mockClient, 'phone123', 'wamid.123');

    expect(result).toEqual({ success: true });
    expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: 'wamid.123',
    });
  });

  it('should handle different message IDs', async () => {
    const messageIds = ['wamid.abc', 'wamid.xyz', 'wamid.123456'];

    for (const messageId of messageIds) {
      await markAsRead(mockClient, 'phone123', messageId);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          message_id: messageId,
        })
      );
    }
  });
});
