/**
 * Unit tests for template message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendTemplate } from './template.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type { SendTemplateParams } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('sendTemplate', () => {
  let mockClient: HTTPClient;
  let mockPost: ReturnType<typeof vi.fn>;
  const mockResponse: MessageResponse = {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.123' }],
  };

  beforeEach(() => {
    mockPost = vi.fn().mockResolvedValue(mockResponse);
    mockClient = {
      post: mockPost,
    } as unknown as HTTPClient;
  });

  it('should send basic template message', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'hello_world',
        language: 'en_US',
      },
    };

    const result = await sendTemplate(mockClient, 'phone123', params);

    expect(result).toEqual(mockResponse);
    expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '+1234567890',
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US',
        },
      },
    });
  });

  it('should send template with text parameters', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'sample_template',
        language: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'John' },
              { type: 'text', text: 'Doe' },
            ],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'John' },
                { type: 'text', text: 'Doe' },
              ],
            },
          ],
        }),
      })
    );
  });

  it('should send template with currency parameter', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'payment_template',
        language: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'currency',
                currency: {
                  fallbackValue: '$100.00',
                  code: 'USD',
                  amount1000: 100000,
                },
              },
            ],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'currency',
                  currency: {
                    fallback_value: '$100.00',
                    code: 'USD',
                    amount_1000: 100000,
                  },
                },
              ],
            },
          ],
        }),
      })
    );
  });

  it('should send template with date_time parameter', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'appointment_template',
        language: 'en',
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'date_time',
                date_time: {
                  fallbackValue: '2024-01-01 10:00',
                },
              },
            ],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'date_time',
                  date_time: {
                    fallback_value: '2024-01-01 10:00',
                  },
                },
              ],
            },
          ],
        }),
      })
    );
  });

  it('should send template with image parameter', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'media_template',
        language: 'en',
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: {
                  link: 'https://example.com/image.jpg',
                },
              },
            ],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'image',
                  image: {
                    link: 'https://example.com/image.jpg',
                  },
                },
              ],
            },
          ],
        }),
      })
    );
  });

  it('should send template with button component', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'button_template',
        language: 'en',
        components: [
          {
            type: 'button',
            subType: 'quick_reply',
            index: 0,
            parameters: [{ type: 'text', text: 'Yes' }],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: [
            {
              type: 'button',
              sub_type: 'quick_reply',
              index: 0,
              parameters: [{ type: 'text', text: 'Yes' }],
            },
          ],
        }),
      })
    );
  });

  it('should send template with multiple components', async () => {
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'complex_template',
        language: 'en',
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: { link: 'https://example.com/image.jpg' },
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'John' },
              { type: 'text', text: 'Doe' },
            ],
          },
          {
            type: 'button',
            subType: 'quick_reply',
            index: 0,
            parameters: [{ type: 'text', text: 'Confirm' }],
          },
        ],
      },
    };

    await sendTemplate(mockClient, 'phone123', params);

    expect(mockPost).toHaveBeenCalledWith(
      'phone123/messages',
      expect.objectContaining({
        template: expect.objectContaining({
          components: expect.arrayContaining([
            expect.objectContaining({ type: 'header' }),
            expect.objectContaining({ type: 'body' }),
            expect.objectContaining({ type: 'button' }),
          ]),
        }),
      })
    );
  });

  it('should validate with strict mode', async () => {
    const validator = new Validator('strict');
    const params: SendTemplateParams = {
      to: '+1234567890',
      template: {
        name: 'hello_world',
        language: 'en_US',
      },
    };

    await sendTemplate(mockClient, 'phone123', params, validator);

    expect(mockPost).toHaveBeenCalled();
  });
});
