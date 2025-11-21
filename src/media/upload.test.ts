/**
 * Unit tests for media upload
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadMedia } from './upload.js';
import { HTTPClient } from '../client/http.js';
import { ValidationError } from '../types/errors.js';
import type { MediaUploadResponse } from '../types/responses.js';

describe('uploadMedia', () => {
  let mockClient: HTTPClient;
  let mockFetch: ReturnType<typeof vi.fn>;
  const mockResponse: MediaUploadResponse = {
    id: 'media123',
  };

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockClient = {
      baseUrl: 'https://graph.facebook.com',
      apiVersion: 'v18.0',
      accessToken: 'test-token',
    } as unknown as HTTPClient;
  });

  describe('successful uploads', () => {
    it('should upload image with Buffer', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(
        mockClient,
        'phone123',
        imageBuffer,
        'image/jpeg'
      );

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v18.0/phone123/media',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: expect.any(FormData),
        })
      );
    });

    it('should upload video with Buffer', async () => {
      const videoBuffer = Buffer.from('fake-video-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(
        mockClient,
        'phone123',
        videoBuffer,
        'video/mp4'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should upload audio with Buffer', async () => {
      const audioBuffer = Buffer.from('fake-audio-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(
        mockClient,
        'phone123',
        audioBuffer,
        'audio/mpeg'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should upload document with Buffer', async () => {
      const docBuffer = Buffer.from('fake-document-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(
        mockClient,
        'phone123',
        docBuffer,
        'application/pdf'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should upload sticker with Buffer', async () => {
      const stickerBuffer = Buffer.from('fake-sticker-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(
        mockClient,
        'phone123',
        stickerBuffer,
        'image/webp'
      );

      expect(result).toEqual(mockResponse);
    });

    it('should upload with Blob', async () => {
      const blob = new Blob(['fake-data'], { type: 'image/jpeg' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(mockClient, 'phone123', blob, 'image/jpeg');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('file size validation', () => {
    it('should reject image larger than 5MB', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      await expect(
        uploadMedia(mockClient, 'phone123', largeBuffer, 'image/jpeg')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject video larger than 16MB', async () => {
      const largeBuffer = Buffer.alloc(17 * 1024 * 1024); // 17MB

      await expect(
        uploadMedia(mockClient, 'phone123', largeBuffer, 'video/mp4')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject audio larger than 16MB', async () => {
      const largeBuffer = Buffer.alloc(17 * 1024 * 1024); // 17MB

      await expect(
        uploadMedia(mockClient, 'phone123', largeBuffer, 'audio/mpeg')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject document larger than 100MB', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB

      await expect(
        uploadMedia(mockClient, 'phone123', largeBuffer, 'application/pdf')
      ).rejects.toThrow(ValidationError);
    });

    it('should reject sticker larger than 500KB', async () => {
      const largeBuffer = Buffer.alloc(501 * 1024); // 501KB

      await expect(
        uploadMedia(mockClient, 'phone123', largeBuffer, 'image/webp')
      ).rejects.toThrow(ValidationError);
    });

    it('should accept file at maximum size limit', async () => {
      const buffer = Buffer.alloc(5 * 1024 * 1024); // Exactly 5MB
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadMedia(mockClient, 'phone123', buffer, 'image/jpeg');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('mime type handling', () => {
    it('should handle different image mime types', async () => {
      const buffer = Buffer.from('fake-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

      for (const mimeType of mimeTypes) {
        await uploadMedia(mockClient, 'phone123', buffer, mimeType);
        expect(mockFetch).toHaveBeenCalled();
      }
    });

    it('should handle different video mime types', async () => {
      const buffer = Buffer.from('fake-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const mimeTypes = ['video/mp4', 'video/3gpp'];

      for (const mimeType of mimeTypes) {
        await uploadMedia(mockClient, 'phone123', buffer, mimeType);
        expect(mockFetch).toHaveBeenCalled();
      }
    });

    it('should handle different audio mime types', async () => {
      const buffer = Buffer.from('fake-data');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const mimeTypes = ['audio/mpeg', 'audio/ogg', 'audio/aac'];

      for (const mimeType of mimeTypes) {
        await uploadMedia(mockClient, 'phone123', buffer, mimeType);
        expect(mockFetch).toHaveBeenCalled();
      }
    });
  });

  describe('error handling', () => {
    it('should throw error on upload failure', async () => {
      const buffer = Buffer.from('fake-data');
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        uploadMedia(mockClient, 'phone123', buffer, 'image/jpeg')
      ).rejects.toThrow('Media upload failed');
    });

    it('should include error details in validation error', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      try {
        await uploadMedia(mockClient, 'phone123', largeBuffer, 'image/jpeg');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.field).toBe('file');
        expect(validationError.message).toContain('exceeds maximum');
      }
    });
  });
});
