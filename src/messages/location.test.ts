/**
 * Unit tests for location message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendLocation } from './location.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type { SendLocationParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('sendLocation', () => {
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

  it('should send location with coordinates only', async () => {
    const params: SendLocationParams = {
      to: '1234567890',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    const result = await sendLocation(mockClient, 'phone123', params);

    expect(result).toEqual(mockResponse);
    expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '1234567890',
      type: 'location',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    });
  });

  it('should send location with name and address', async () => {
    const params: SendLocationParams = {
      to: '1234567890',
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco',
      address: '123 Market St, San Francisco, CA',
    };

    await sendLocation(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          name: 'San Francisco',
          address: '123 Market St, San Francisco, CA',
        },
      })
    );
  });

  it('should validate coordinates in strict mode', async () => {
    const validator = new Validator('strict');
    const params: SendLocationParams = {
      to: '+1234567890',
      latitude: 0,
      longitude: 0,
    };

    await sendLocation(mockClient, 'phone123', params, validator);

    expect(mockPost).toHaveBeenCalled();
  });
});
