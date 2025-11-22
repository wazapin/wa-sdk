/**
 * Phone Number Management Tests
 * @module account/phone-numbers.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhoneNumbersAPI } from './phone-numbers.js';
import type { HttpClient } from '../client/http.js';
import type {
  PhoneNumbersListResponse,
  PhoneNumberDetails,
  DisplayNameStatusResponse,
} from '../types/phone-numbers.js';

describe('PhoneNumbersAPI', () => {
  let phoneNumbersAPI: PhoneNumbersAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';
  const testWabaId = 'waba_123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    phoneNumbersAPI = new PhoneNumbersAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('getPhoneNumbers', () => {
    it('should get all phone numbers for a WABA', async () => {
      const mockResponse: PhoneNumbersListResponse = {
        data: [
          {
            id: '123456789',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN',
          },
          {
            id: '987654321',
            verified_name: 'Another Business',
            display_phone_number: '+0987654321',
            quality_rating: 'YELLOW',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.getPhoneNumbers(testWabaId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/phone_numbers`);
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should get phone numbers with specific fields', async () => {
      const mockResponse: PhoneNumbersListResponse = {
        data: [
          {
            id: '123456789',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.getPhoneNumbers(testWabaId, {
        fields: ['id', 'verified_name', 'quality_rating'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testWabaId}/phone_numbers?fields=id%2Cverified_name%2Cquality_rating`);
    });

    it('should get phone numbers with filtering (beta)', async () => {
      const mockResponse: PhoneNumbersListResponse = {
        data: [
          {
            id: '123456789',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN',
            account_mode: 'SANDBOX',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.getPhoneNumbers(testWabaId, {
        filtering: [
          {
            field: 'account_mode',
            operator: 'EQUAL',
            value: 'SANDBOX',
          },
        ],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('filtering'));
    });

    it('should handle pagination in response', async () => {
      const mockResponse: PhoneNumbersListResponse = {
        data: [
          {
            id: '123456789',
            verified_name: 'Test Business',
            display_phone_number: '+1234567890',
            quality_rating: 'GREEN',
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

      const result = await phoneNumbersAPI.getPhoneNumbers(testWabaId);

      expect(result.paging).toBeDefined();
      expect(result.paging?.cursors).toHaveProperty('before');
      expect(result.paging?.cursors).toHaveProperty('after');
    });
  });

  describe('getPhoneNumberById', () => {
    it('should get phone number details by ID', async () => {
      const mockResponse: PhoneNumberDetails = {
        id: testPhoneNumberId,
        verified_name: 'Test Business',
        display_phone_number: '+1234567890',
        quality_rating: 'GREEN',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.getPhoneNumberById(testPhoneNumberId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should use default phone number ID if not provided', async () => {
      const mockResponse: PhoneNumberDetails = {
        id: testPhoneNumberId,
        verified_name: 'Test Business',
        display_phone_number: '+1234567890',
        quality_rating: 'GREEN',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.getPhoneNumberById();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}`);
    });

    it('should return all quality ratings correctly', async () => {
      const qualityRatings = ['GREEN', 'YELLOW', 'RED', 'NA'] as const;

      for (const rating of qualityRatings) {
        const mockResponse: PhoneNumberDetails = {
          id: testPhoneNumberId,
          verified_name: 'Test Business',
          display_phone_number: '+1234567890',
          quality_rating: rating,
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await phoneNumbersAPI.getPhoneNumberById(testPhoneNumberId);

        expect(result.quality_rating).toBe(rating);
      }
    });

    it('should include optional fields when present', async () => {
      const mockResponse: PhoneNumberDetails = {
        id: testPhoneNumberId,
        verified_name: 'Test Business',
        display_phone_number: '+1234567890',
        quality_rating: 'GREEN',
        code_verification_status: 'VERIFIED',
        is_official_business_account: true,
        account_mode: 'LIVE',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.getPhoneNumberById(testPhoneNumberId);

      expect(result.code_verification_status).toBe('VERIFIED');
      expect(result.is_official_business_account).toBe(true);
      expect(result.account_mode).toBe('LIVE');
    });
  });

  describe('getDisplayNameStatus', () => {
    it('should get display name status', async () => {
      const mockResponse: DisplayNameStatusResponse = {
        id: testPhoneNumberId,
        name_status: 'APPROVED',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.getDisplayNameStatus(testPhoneNumberId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}?fields=name_status`);
      expect(result.name_status).toBe('APPROVED');
    });

    it('should use default phone number ID if not provided', async () => {
      const mockResponse: DisplayNameStatusResponse = {
        id: testPhoneNumberId,
        name_status: 'AVAILABLE_WITHOUT_REVIEW',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.getDisplayNameStatus();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}?fields=name_status`);
    });

    it('should handle all display name statuses', async () => {
      const statuses = [
        'APPROVED',
        'AVAILABLE_WITHOUT_REVIEW',
        'DECLINED',
        'EXPIRED',
        'PENDING_REVIEW',
        'NONE',
      ] as const;

      for (const status of statuses) {
        const mockResponse: DisplayNameStatusResponse = {
          id: testPhoneNumberId,
          name_status: status,
        };

        vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

        const result = await phoneNumbersAPI.getDisplayNameStatus(testPhoneNumberId);

        expect(result.name_status).toBe(status);
      }
    });
  });

  describe('requestVerificationCode', () => {
    it('should request verification code via SMS', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.requestVerificationCode({
        code_method: 'SMS',
        locale: 'en_US',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${testPhoneNumberId}/request_code`, {
          code_method: 'SMS',
          locale: 'en_US',
        ));
      expect(result.success).toBe(true);
    });

    it('should request verification code via VOICE', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.requestVerificationCode({
        code_method: 'VOICE',
        locale: 'en_US',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${testPhoneNumberId}/request_code`, {
          code_method: 'VOICE',
          locale: 'en_US',
        ));
      expect(result.success).toBe(true);
    });

    it('should support different locales', async () => {
      const mockResponse = { success: true };
      const locales = ['en_US', 'id_ID', 'es_ES', 'fr_FR', 'de_DE'];

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      for (const locale of locales) {
        await phoneNumbersAPI.requestVerificationCode({
          code_method: 'SMS',
          locale,
        });

        expect(mockHttpClient.post).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              locale,
            }),
          }),
        );
      }
    });

    it('should use custom phone number ID if provided', async () => {
      const customPhoneNumberId = '987654321';
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.requestVerificationCode(
        {
          code_method: 'SMS',
          locale: 'en_US',
        },
        customPhoneNumberId,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${customPhoneNumberId}/request_code`, {
          code_method: 'SMS',
          locale: 'en_US',
        ));
    });
  });

  describe('verifyCode', () => {
    it('should verify code successfully', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.verifyCode({
        code: '123456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${testPhoneNumberId}/verify_code`, {
          code: '123456',
        ));
      expect(result.success).toBe(true);
    });

    it('should use custom phone number ID if provided', async () => {
      const customPhoneNumberId = '987654321';
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.verifyCode(
        {
          code: '123456',
        },
        customPhoneNumberId,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${customPhoneNumberId}/verify_code`, {
          code: '123456',
        ));
    });
  });

  describe('setTwoStepPin', () => {
    it('should set two-step verification PIN', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await phoneNumbersAPI.setTwoStepPin({
        pin: '123456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${testPhoneNumberId}`, {
          pin: '123456',
        ));
      expect(result.success).toBe(true);
    });

    it('should use custom phone number ID if provided', async () => {
      const customPhoneNumberId = '987654321';
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await phoneNumbersAPI.setTwoStepPin(
        {
          pin: '654321',
        },
        customPhoneNumberId,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(`/${customPhoneNumberId}`, {
          pin: '654321',
        ));
    });
  });
});
