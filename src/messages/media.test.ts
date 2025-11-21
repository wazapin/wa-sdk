/**
 * Unit tests for media message sending
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendImage, sendVideo, sendAudio, sendDocument, sendSticker } from './media.js';
import { HTTPClient } from '../client/http.js';
import { Validator } from '../validation/validator.js';
import type {
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
} from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';

describe('Media Messages', () => {
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

  describe('sendImage', () => {
    it('should send image with URL', async () => {
      const params: SendImageParams = {
        to: '1234567890',
        image: {
          link: 'https://example.com/image.jpg',
        },
      };

      const result = await sendImage(mockClient, 'phone123', params);

      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'image',
        image: {
          link: 'https://example.com/image.jpg',
        },
      });
    });

    it('should send image with media ID', async () => {
      const params: SendImageParams = {
        to: '1234567890',
        image: {
          id: 'media123',
        },
      };

      await sendImage(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          image: {
            id: 'media123',
          },
        })
      );
    });

    it('should send image with caption', async () => {
      const params: SendImageParams = {
        to: '1234567890',
        image: {
          link: 'https://example.com/image.jpg',
        },
        caption: 'Beautiful sunset',
      };

      await sendImage(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          image: {
            link: 'https://example.com/image.jpg',
            caption: 'Beautiful sunset',
          },
        })
      );
    });

    it('should send image with context', async () => {
      const params: SendImageParams = {
        to: '1234567890',
        image: {
          link: 'https://example.com/image.jpg',
        },
        context: {
          messageId: 'wamid.original',
        },
      };

      await sendImage(mockClient, 'phone123', params);

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

  describe('sendVideo', () => {
    it('should send video with URL', async () => {
      const params: SendVideoParams = {
        to: '1234567890',
        video: {
          link: 'https://example.com/video.mp4',
        },
      };

      await sendVideo(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'video',
        video: {
          link: 'https://example.com/video.mp4',
        },
      });
    });

    it('should send video with caption', async () => {
      const params: SendVideoParams = {
        to: '1234567890',
        video: {
          id: 'media456',
        },
        caption: 'Check this out!',
      };

      await sendVideo(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          video: {
            id: 'media456',
            caption: 'Check this out!',
          },
        })
      );
    });
  });

  describe('sendAudio', () => {
    it('should send audio with URL', async () => {
      const params: SendAudioParams = {
        to: '1234567890',
        audio: {
          link: 'https://example.com/audio.mp3',
        },
      };

      await sendAudio(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'audio',
        audio: {
          link: 'https://example.com/audio.mp3',
        },
      });
    });

    it('should send audio with media ID', async () => {
      const params: SendAudioParams = {
        to: '1234567890',
        audio: {
          id: 'media789',
        },
      };

      await sendAudio(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          audio: {
            id: 'media789',
          },
        })
      );
    });
  });

  describe('sendDocument', () => {
    it('should send document with URL', async () => {
      const params: SendDocumentParams = {
        to: '1234567890',
        document: {
          link: 'https://example.com/document.pdf',
        },
      };

      await sendDocument(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'document',
        document: {
          link: 'https://example.com/document.pdf',
        },
      });
    });

    it('should send document with caption and filename', async () => {
      const params: SendDocumentParams = {
        to: '1234567890',
        document: {
          id: 'media999',
        },
        caption: 'Important document',
        filename: 'report.pdf',
      };

      await sendDocument(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          document: {
            id: 'media999',
            caption: 'Important document',
            filename: 'report.pdf',
          },
        })
      );
    });
  });

  describe('sendSticker', () => {
    it('should send sticker with URL', async () => {
      const params: SendStickerParams = {
        to: '1234567890',
        sticker: {
          link: 'https://example.com/sticker.webp',
        },
      };

      await sendSticker(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith('phone123/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '1234567890',
        type: 'sticker',
        sticker: {
          link: 'https://example.com/sticker.webp',
        },
      });
    });

    it('should send sticker with media ID', async () => {
      const params: SendStickerParams = {
        to: '1234567890',
        sticker: {
          id: 'sticker123',
        },
      };

      await sendSticker(mockClient, 'phone123', params);

      expect(mockPost).toHaveBeenCalledWith(
        'phone123/messages',
        expect.objectContaining({
          sticker: {
            id: 'sticker123',
          },
        })
      );
    });
  });

  describe('validation', () => {
    it('should validate with strict mode', async () => {
      const validator = new Validator('strict');
      const params: SendImageParams = {
        to: '+1234567890',
        image: {
          link: 'https://example.com/image.jpg',
        },
      };

      await sendImage(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });

    it('should skip validation in off mode', async () => {
      const validator = new Validator('off');
      const params = {
        to: '1234567890',
        image: {
          link: 'https://example.com/image.jpg',
        },
      } as SendImageParams;

      await sendImage(mockClient, 'phone123', params, validator);

      expect(mockPost).toHaveBeenCalled();
    });
  });
});
