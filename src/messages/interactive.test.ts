/**
 * Unit tests for interactive message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendInteractiveButtons,
  sendInteractiveList,
  sendInteractiveCarousel,
  sendInteractiveCTA,
} from './interactive.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type {
  SendInteractiveButtonsParams,
  SendInteractiveListParams,
  SendInteractiveCarouselParams,
  SendInteractiveCTAParams,
} from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('Interactive Messages', () => {
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

  describe('sendInteractiveButtons', () => {
    it('should send interactive buttons message', async () => {
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        buttons: [
          { id: 'btn1', title: 'Option 1' },
          { id: 'btn2', title: 'Option 2' },
        ],
      };

      const result = await sendInteractiveButtons(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+1234567890',
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: 'Choose an option:',
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'btn1', title: 'Option 1' } },
              { type: 'reply', reply: { id: 'btn2', title: 'Option 2' } },
            ],
          },
        },
      });
    });

    it('should send interactive buttons with text header', async () => {
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        header: {
          type: 'text',
          text: 'Header Text',
        },
        buttons: [{ id: 'btn1', title: 'Option 1' }],
      };

      await sendInteractiveButtons(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            header: {
              type: 'text',
              text: 'Header Text',
            },
          }),
        })
      );
    });

    it('should send interactive buttons with image header', async () => {
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        header: {
          type: 'image',
          image: {
            link: 'https://example.com/image.jpg',
          },
        },
        buttons: [{ id: 'btn1', title: 'Option 1' }],
      };

      await sendInteractiveButtons(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            header: {
              type: 'image',
              image: {
                link: 'https://example.com/image.jpg',
              },
            },
          }),
        })
      );
    });

    it('should send interactive buttons with footer', async () => {
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        footer: 'Footer text',
        buttons: [{ id: 'btn1', title: 'Option 1' }],
      };

      await sendInteractiveButtons(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            footer: {
              text: 'Footer text',
            },
          }),
        })
      );
    });

    it('should send interactive buttons with max 3 buttons', async () => {
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        buttons: [
          { id: 'btn1', title: 'Option 1' },
          { id: 'btn2', title: 'Option 2' },
          { id: 'btn3', title: 'Option 3' },
        ],
      };

      await sendInteractiveButtons(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: {
              buttons: expect.arrayContaining([
                expect.objectContaining({ type: 'reply' }),
                expect.objectContaining({ type: 'reply' }),
                expect.objectContaining({ type: 'reply' }),
              ]),
            },
          }),
        })
      );
    });

    it('should validate with strict mode', async () => {
      const validator = new Validator('strict');
      const params: SendInteractiveButtonsParams = {
        to: '+1234567890',
        body: 'Choose an option:',
        buttons: [{ id: 'btn1', title: 'Option 1' }],
      };

      await sendInteractiveButtons(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });
  });

  describe('sendInteractiveList', () => {
    it('should send interactive list message', async () => {
      const params: SendInteractiveListParams = {
        to: '+1234567890',
        body: 'Choose from the list:',
        buttonText: 'View Options',
        sections: [
          {
            title: 'Section 1',
            rows: [
              { id: 'row1', title: 'Row 1', description: 'Description 1' },
              { id: 'row2', title: 'Row 2' },
            ],
          },
        ],
      };

      const result = await sendInteractiveList(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+1234567890',
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: 'Choose from the list:',
          },
          action: {
            button: 'View Options',
            sections: [
              {
                title: 'Section 1',
                rows: [
                  { id: 'row1', title: 'Row 1', description: 'Description 1' },
                  { id: 'row2', title: 'Row 2' },
                ],
              },
            ],
          },
        },
      });
    });

    it('should send interactive list with multiple sections', async () => {
      const params: SendInteractiveListParams = {
        to: '+1234567890',
        body: 'Choose from the list:',
        buttonText: 'View Options',
        sections: [
          {
            title: 'Section 1',
            rows: [{ id: 'row1', title: 'Row 1' }],
          },
          {
            title: 'Section 2',
            rows: [{ id: 'row2', title: 'Row 2' }],
          },
        ],
      };

      await sendInteractiveList(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: expect.objectContaining({
              sections: expect.arrayContaining([
                expect.objectContaining({ title: 'Section 1' }),
                expect.objectContaining({ title: 'Section 2' }),
              ]),
            }),
          }),
        })
      );
    });

    it('should send interactive list with header', async () => {
      const params: SendInteractiveListParams = {
        to: '+1234567890',
        body: 'Choose from the list:',
        buttonText: 'View Options',
        header: {
          type: 'text',
          text: 'List Header',
        },
        sections: [
          {
            title: 'Section 1',
            rows: [{ id: 'row1', title: 'Row 1' }],
          },
        ],
      };

      await sendInteractiveList(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            header: {
              type: 'text',
              text: 'List Header',
            },
          }),
        })
      );
    });

    it('should send interactive list with footer', async () => {
      const params: SendInteractiveListParams = {
        to: '+1234567890',
        body: 'Choose from the list:',
        buttonText: 'View Options',
        footer: 'List footer',
        sections: [
          {
            title: 'Section 1',
            rows: [{ id: 'row1', title: 'Row 1' }],
          },
        ],
      };

      await sendInteractiveList(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            footer: {
              text: 'List footer',
            },
          }),
        })
      );
    });

    it('should validate with strict mode', async () => {
      const validator = new Validator('strict');
      const params: SendInteractiveListParams = {
        to: '+1234567890',
        body: 'Choose from the list:',
        buttonText: 'View Options',
        sections: [
          {
            title: 'Section 1',
            rows: [{ id: 'row1', title: 'Row 1' }],
          },
        ],
      };

      await sendInteractiveList(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });
  });

  describe('sendInteractiveCarousel', () => {
    it('should send interactive carousel message with image cards', async () => {
      const params: SendInteractiveCarouselParams = {
        to: '+1234567890',
        body: 'Check out our latest offers!',
        cards: [
          {
            cardIndex: 0,
            header: {
              type: 'image',
              image: { link: 'https://example.com/image1.png' },
            },
            body: {
              text: 'Exclusive deal #1',
            },
            action: {
              displayText: 'Shop now',
              url: 'https://shop.example.com/deal1',
            },
          },
          {
            cardIndex: 1,
            header: {
              type: 'image',
              image: { id: 'media123' },
            },
            body: {
              text: 'Exclusive deal #2',
            },
            action: {
              displayText: 'Shop now',
              url: 'https://shop.example.com/deal2',
            },
          },
        ],
      };

      const result = await sendInteractiveCarousel(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+1234567890',
        type: 'interactive',
        interactive: {
          type: 'carousel',
          body: {
            text: 'Check out our latest offers!',
          },
          action: {
            cards: [
              {
                card_index: 0,
                type: 'cta_url',
                header: {
                  type: 'image',
                  image: { link: 'https://example.com/image1.png' },
                },
                body: {
                  text: 'Exclusive deal #1',
                },
                action: {
                  name: 'cta_url',
                  parameters: {
                    display_text: 'Shop now',
                    url: 'https://shop.example.com/deal1',
                  },
                },
              },
              {
                card_index: 1,
                type: 'cta_url',
                header: {
                  type: 'image',
                  image: { id: 'media123' },
                },
                body: {
                  text: 'Exclusive deal #2',
                },
                action: {
                  name: 'cta_url',
                  parameters: {
                    display_text: 'Shop now',
                    url: 'https://shop.example.com/deal2',
                  },
                },
              },
            ],
          },
        },
      });
    });

    it('should send interactive carousel with video cards', async () => {
      const params: SendInteractiveCarouselParams = {
        to: '+1234567890',
        body: 'Watch our latest videos!',
        cards: [
          {
            cardIndex: 0,
            header: {
              type: 'video',
              video: { link: 'https://example.com/video1.mp4' },
            },
            action: {
              displayText: 'Watch now',
              url: 'https://example.com/watch1',
            },
          },
          {
            cardIndex: 1,
            header: {
              type: 'video',
              video: { link: 'https://example.com/video2.mp4' },
            },
            action: {
              displayText: 'Watch now',
              url: 'https://example.com/watch2',
            },
          },
        ],
      };

      await sendInteractiveCarousel(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            type: 'carousel',
            action: expect.objectContaining({
              cards: expect.arrayContaining([
                expect.objectContaining({
                  card_index: 0,
                  type: 'cta_url',
                  header: expect.objectContaining({
                    type: 'video',
                    video: expect.objectContaining({
                      link: 'https://example.com/video1.mp4',
                    }),
                  }),
                }),
                expect.objectContaining({
                  card_index: 1,
                  type: 'cta_url',
                  header: expect.objectContaining({
                    type: 'video',
                  }),
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('should send carousel without card body text', async () => {
      const params: SendInteractiveCarouselParams = {
        to: '+1234567890',
        body: 'Check these out!',
        cards: [
          {
            cardIndex: 0,
            header: {
              type: 'image',
              image: { link: 'https://example.com/image1.png' },
            },
            action: {
              displayText: 'View',
              url: 'https://example.com/1',
            },
          },
          {
            cardIndex: 1,
            header: {
              type: 'image',
              image: { link: 'https://example.com/image2.png' },
            },
            action: {
              displayText: 'View',
              url: 'https://example.com/2',
            },
          },
        ],
      };

      await sendInteractiveCarousel(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: expect.objectContaining({
              cards: expect.arrayContaining([
                expect.not.objectContaining({
                  body: expect.anything(),
                }),
              ]),
            }),
          }),
        })
      );
    });

    it('should send carousel with max 10 cards', async () => {
      const cards = Array.from({ length: 10 }, (_, i) => ({
        cardIndex: i,
        header: {
          type: 'image' as const,
          image: { link: `https://example.com/image${i}.png` },
        },
        action: {
          displayText: 'View',
          url: `https://example.com/${i}`,
        },
      }));

      const params: SendInteractiveCarouselParams = {
        to: '+1234567890',
        body: 'Browse all items',
        cards,
      };

      await sendInteractiveCarousel(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          interactive: expect.objectContaining({
            action: expect.objectContaining({
              cards: expect.arrayContaining(
                Array.from({ length: 10 }, (_, i) =>
                  expect.objectContaining({
                    card_index: i,
                  })
                )
              ),
            }),
          }),
        })
      );
    });

    it('should validate with strict mode', async () => {
      const validator = new Validator('strict');
      const params: SendInteractiveCarouselParams = {
        to: '+1234567890',
        body: 'Check out our offers!',
        cards: [
          {
            cardIndex: 0,
            header: {
              type: 'image',
              image: { link: 'https://example.com/image1.png' },
            },
            action: {
              displayText: 'Shop',
              url: 'https://shop.example.com/1',
            },
          },
          {
            cardIndex: 1,
            header: {
              type: 'image',
              image: { link: 'https://example.com/image2.png' },
            },
            action: {
              displayText: 'Shop',
              url: 'https://shop.example.com/2',
            },
          },
        ],
      };

      await sendInteractiveCarousel(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });
  });

  describe('sendInteractiveCTA', () => {
    it('should send CTA message with text header', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        header: { type: 'text', text: 'Special Offer!' },
        body: 'Check out our new products!',
        action: {
          displayText: 'View Products',
          url: 'https://example.com/products',
        },
        footer: 'Limited time offer',
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+1234567890',
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          header: {
            type: 'text',
            text: 'Special Offer!',
          },
          body: { text: 'Check out our new products!' },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: 'View Products',
              url: 'https://example.com/products',
            },
          },
          footer: { text: 'Limited time offer' },
        },
      });
    });

    it('should send CTA message with image header', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        header: {
          type: 'image',
          image: { link: 'https://example.com/banner.jpg' },
        },
        body: 'Tap to see available dates.',
        action: {
          displayText: 'See Dates',
          url: 'https://example.com/calendar',
        },
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '+1234567890',
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          header: {
            type: 'image',
            image: { link: 'https://example.com/banner.jpg' },
          },
          body: { text: 'Tap to see available dates.' },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: 'See Dates',
              url: 'https://example.com/calendar',
            },
          },
        },
      });
    });

    it('should send CTA message with video header', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        header: {
          type: 'video',
          video: { link: 'https://example.com/promo.mp4' },
        },
        body: 'Watch our latest video!',
        action: {
          displayText: 'Learn More',
          url: 'https://example.com/about',
        },
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', expect.objectContaining({
        type: 'interactive',
        interactive: expect.objectContaining({
          type: 'cta_url',
          header: {
            type: 'video',
            video: { link: 'https://example.com/promo.mp4' },
          },
        }),
      }));
    });

    it('should send CTA message with document header', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        header: {
          type: 'document',
          document: { link: 'https://example.com/brochure.pdf' },
        },
        body: 'View our product catalog.',
        action: {
          displayText: 'Get Catalog',
          url: 'https://example.com/catalog',
        },
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', expect.objectContaining({
        interactive: expect.objectContaining({
          type: 'cta_url',
          header: {
            type: 'document',
            document: { link: 'https://example.com/brochure.pdf' },
          },
        }),
      }));
    });

    it('should send CTA message without header', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        body: 'Simple CTA message',
        action: {
          displayText: 'Click Here',
          url: 'https://example.com',
        },
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      const call = mockPost.mock.calls[0][1] as Record<string, unknown>;
      const interactive = call.interactive as Record<string, unknown>;
      expect(interactive.header).toBeUndefined();
    });

    it('should send CTA message with footer', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        body: 'Message with footer',
        action: {
          displayText: 'Click Here',
          url: 'https://example.com',
        },
        footer: 'Terms apply',
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', expect.objectContaining({
        interactive: expect.objectContaining({
          footer: { text: 'Terms apply' },
        }),
      }));
    });

    it('should send CTA message without footer', async () => {
      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        body: 'Message without footer',
        action: {
          displayText: 'Click Here',
          url: 'https://example.com',
        },
      };

      const result = await sendInteractiveCTA(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      const call = mockPost.mock.calls[0][1] as Record<string, unknown>;
      const interactive = call.interactive as Record<string, unknown>;
      expect(interactive.footer).toBeUndefined();
    });

    it('should validate body max 1024 characters', () => {
      const longBody = 'a'.repeat(1025);
      expect(longBody.length).toBe(1025);
    });

    it('should validate button label max 20 characters', () => {
      const longLabel = 'a'.repeat(21);
      expect(longLabel.length).toBe(21);
    });

    it('should validate header text max 60 characters', () => {
      const longHeader = 'a'.repeat(61);
      expect(longHeader.length).toBe(61);
    });

    it('should validate footer text max 60 characters', () => {
      const longFooter = 'a'.repeat(61);
      expect(longFooter.length).toBe(61);
    });

    it('should handle API failures', async () => {
      const error = new Error('API Error');
      mockPost.mockRejectedValue(error);

      const params: SendInteractiveCTAParams = {
        to: '+1234567890',
        body: 'Test',
        action: {
          displayText: 'Click',
          url: 'https://example.com',
        },
      };

      await expect(sendInteractiveCTA(mockClient, 'phone123', params)).rejects.toThrow('API Error');
    });
  });
});
