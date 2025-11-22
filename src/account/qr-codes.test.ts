/**
 * QR Code Management Tests
 * @module account/qr-codes.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QRCodeAPI } from './qr-codes.js';
import type { HttpClient } from '../client/http.js';
import type {
  QRCodeDetails,
  QRCodeListResponse,
  QRCodeCreateResponse,
  QRCodeImageURLResponse,
} from '../types/qr-codes.js';

describe('QRCodeAPI', () => {
  let qrCodeAPI: QRCodeAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';
  const testQRCodeId = 'qr_code_123';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    qrCodeAPI = new QRCodeAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('getQRCode', () => {
    it('should get QR code by ID', async () => {
      const mockResponse: QRCodeDetails = {
        code: testQRCodeId,
        prefilled_message: 'Hello',
        deep_link_url: 'https://wa.me/qr/test',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getQRCode(testQRCodeId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testQRCodeId}`);
      expect(result.code).toBe(testQRCodeId);
      expect(result.prefilled_message).toBe('Hello');
    });

    it('should include qr_image_url when present', async () => {
      const mockResponse: QRCodeDetails = {
        code: testQRCodeId,
        prefilled_message: 'Hello',
        deep_link_url: 'https://wa.me/qr/test',
        qr_image_url: 'https://example.com/qr.svg',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getQRCode(testQRCodeId);

      expect(result.qr_image_url).toBe('https://example.com/qr.svg');
    });
  });

  describe('getAllQRCodes', () => {
    it('should get all QR codes without fields', async () => {
      const mockResponse: QRCodeListResponse = {
        data: [
          {
            code: 'qr_1',
            prefilled_message: 'Message 1',
            deep_link_url: 'https://wa.me/qr/1',
          },
          {
            code: 'qr_2',
            prefilled_message: 'Message 2',
            deep_link_url: 'https://wa.me/qr/2',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getAllQRCodes();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls`);
      expect(result.data).toHaveLength(2);
    });

    it('should get all QR codes with specific fields', async () => {
      const mockResponse: QRCodeListResponse = {
        data: [
          {
            code: 'qr_1',
            prefilled_message: 'Message 1',
            deep_link_url: 'https://wa.me/qr/1',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await qrCodeAPI.getAllQRCodes(['code', 'prefilled_message']);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls?fields=code,prefilled_message`);
    });

    it('should handle pagination', async () => {
      const mockResponse: QRCodeListResponse = {
        data: [
          {
            code: 'qr_1',
            prefilled_message: 'Message 1',
            deep_link_url: 'https://wa.me/qr/1',
          },
        ],
        paging: {
          cursors: {
            before: 'cursor_before',
            after: 'cursor_after',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getAllQRCodes();

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors?.before).toBe('cursor_before');
      expect(result.paging?.cursors?.after).toBe('cursor_after');
    });

    it('should handle empty QR code list', async () => {
      const mockResponse: QRCodeListResponse = {
        data: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getAllQRCodes();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getQRCodeSVG', () => {
    it('should get QR code SVG image URL', async () => {
      const mockResponse: QRCodeImageURLResponse = {
        code: testQRCodeId,
        qr_image_url: 'https://example.com/qr.svg',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getQRCodeSVG(testQRCodeId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testQRCodeId}?generate_qr_image=SVG`);
      expect(result.qr_image_url).toBe('https://example.com/qr.svg');
    });
  });

  describe('getQRCodePNG', () => {
    it('should get QR code PNG image URL', async () => {
      const mockResponse: QRCodeImageURLResponse = {
        code: testQRCodeId,
        qr_image_url: 'https://example.com/qr.png',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.getQRCodePNG(testQRCodeId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testQRCodeId}?generate_qr_image=PNG`);
      expect(result.qr_image_url).toBe('https://example.com/qr.png');
    });
  });

  describe('createQRCode', () => {
    it('should create QR code without parameters', async () => {
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: '',
        deep_link_url: 'https://wa.me/qr/test',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode();

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls`, {});
      expect(result.code).toBe(testQRCodeId);
    });

    it('should create QR code with prefilled message', async () => {
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: 'Hello, I need help',
        deep_link_url: 'https://wa.me/qr/test',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode({
        prefilled_message: 'Hello, I need help',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls`, {
        prefilled_message: 'Hello, I need help',
      });
      expect(result.prefilled_message).toBe('Hello, I need help');
    });

    it('should create QR code with SVG image', async () => {
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: '',
        deep_link_url: 'https://wa.me/qr/test',
        qr_image_url: 'https://example.com/qr.svg',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode({
        generate_qr_image: 'SVG',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls`, {
        generate_qr_image: 'SVG',
      });
      expect(result.qr_image_url).toBeDefined();
    });

    it('should create QR code with PNG image', async () => {
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: '',
        deep_link_url: 'https://wa.me/qr/test',
        qr_image_url: 'https://example.com/qr.png',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode({
        generate_qr_image: 'PNG',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/message_qrdls`, {
        generate_qr_image: 'PNG',
      });
      expect(result.qr_image_url).toBeDefined();
    });

    it('should create QR code with both message and image', async () => {
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: 'Contact us',
        deep_link_url: 'https://wa.me/qr/test',
        qr_image_url: 'https://example.com/qr.svg',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode({
        prefilled_message: 'Contact us',
        generate_qr_image: 'SVG',
      });


      expect(result.prefilled_message).toBe('Contact us');
      expect(result.qr_image_url).toBeDefined();
    });
  });

  describe('updateQRCode', () => {
    it('should update QR code message', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.updateQRCode(testQRCodeId, {
        prefilled_message: 'Updated message',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testQRCodeId}`, {
        prefilled_message: 'Updated message',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty prefilled message', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await qrCodeAPI.updateQRCode(testQRCodeId, {
        prefilled_message: '',
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.prefilled_message).toBe('');
    });
  });

  describe('deleteQRCode', () => {
    it('should delete QR code', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.delete).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.deleteQRCode(testQRCodeId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(`${testQRCodeId}`);
      expect(result.success).toBe(true);
    });
  });

  describe('QR Code message length validation', () => {
    it('should handle max length message (60 characters)', async () => {
      const maxLengthMessage = 'A'.repeat(60);
      const mockResponse: QRCodeCreateResponse = {
        code: testQRCodeId,
        prefilled_message: maxLengthMessage,
        deep_link_url: 'https://wa.me/qr/test',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await qrCodeAPI.createQRCode({
        prefilled_message: maxLengthMessage,
      });

      expect(result.prefilled_message).toHaveLength(60);
    });
  });

  describe('QR Code formats', () => {
    it('should support both SVG and PNG formats', async () => {
      const formats = ['SVG', 'PNG'] as const;

      for (const format of formats) {
        const mockResponse: QRCodeCreateResponse = {
          code: testQRCodeId,
          prefilled_message: '',
          deep_link_url: 'https://wa.me/qr/test',
          qr_image_url: `https://example.com/qr.${format.toLowerCase()}`,
        };

        vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

        const result = await qrCodeAPI.createQRCode({
          generate_qr_image: format,
        });

        expect(result.qr_image_url).toContain(format.toLowerCase());
      }
    });
  });
});
