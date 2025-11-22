/**
 * Registration Management Tests
 * @module account/registration.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegistrationAPI } from './registration.js';
import type { HttpClient } from '../client/http.js';
import type { RegistrationResponse } from '../types/registration.js';

describe('RegistrationAPI', () => {
  let registrationAPI: RegistrationAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    registrationAPI = new RegistrationAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('registerPhone', () => {
    it('should register a phone number', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await registrationAPI.registerPhone({
        messaging_product: 'whatsapp',
        pin: '123456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/register`, {
        messaging_product: 'whatsapp',
        pin: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('should use default phone number ID if not provided', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.registerPhone({
        messaging_product: 'whatsapp',
        pin: '123456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/register`, {
        messaging_product: 'whatsapp',
        pin: '123456',
      });
    });

    it('should use custom phone number ID if provided', async () => {
      const customPhoneNumberId = '987654321';
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.registerPhone(
        {
          messaging_product: 'whatsapp',
          pin: '123456',
        },
        customPhoneNumberId,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${customPhoneNumberId}/register`, {
        messaging_product: 'whatsapp',
        pin: '123456',
      });
    });

    it('should accept 6-digit PIN', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const pins = ['000000', '123456', '999999'];

      for (const pin of pins) {
        await registrationAPI.registerPhone({
          messaging_product: 'whatsapp',
          pin,
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            pin,
          }),
        );
      }
    });

    it('should only accept whatsapp as messaging_product', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.registerPhone({
        messaging_product: 'whatsapp',
        pin: '123456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messaging_product: 'whatsapp',
        }),
      );
    });
  });

  describe('deregisterPhone', () => {
    it('should deregister a phone number', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await registrationAPI.deregisterPhone();

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/deregister`);
      expect(result.success).toBe(true);
    });

    it('should use default phone number ID if not provided', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.deregisterPhone();

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/deregister`);
    });

    it('should use custom phone number ID if provided', async () => {
      const customPhoneNumberId = '987654321';
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.deregisterPhone(customPhoneNumberId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${customPhoneNumberId}/deregister`);
    });

    it('should not require request body', async () => {
      const mockResponse: RegistrationResponse = {
        success: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await registrationAPI.deregisterPhone();

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/deregister`);

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('data');
    });
  });
});
