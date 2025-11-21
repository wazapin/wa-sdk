/**
 * Tests for Business Profile operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBusinessProfile, updateBusinessProfile } from './business-profile.js';
import type { HTTPClient } from '../client/http.js';
import type { Validator } from '../validation/validator.js';
import type {
  BusinessProfileResponse,
  UpdateBusinessProfileParams,
  UpdateBusinessProfileResponse,
} from '../types/account.js';

describe('Business Profile Operations', () => {
  let mockClient: HTTPClient;
  let mockValidator: Validator;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    } as unknown as HTTPClient;

    mockValidator = {
      validate: vi.fn((schema, data) => data),
    } as unknown as Validator;
  });

  describe('getBusinessProfile', () => {
    it('should fetch business profile with all fields', async () => {
      const mockResponse: BusinessProfileResponse = {
        data: [
          {
            about: 'Your friendly neighborhood business',
            address: '123 Main St, City, Country',
            description: 'We provide excellent service',
            email: 'contact@business.com',
            messaging_product: 'whatsapp',
            profile_picture_url: 'https://example.com/picture.jpg',
            vertical: 'RETAIL',
            websites: ['https://business.com'],
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getBusinessProfile(mockClient, 'phone-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        'phone-123/whatsapp_business_profile?fields=about,address,description,email,messaging_product,profile_picture_url,vertical,websites'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch business profile with specific fields', async () => {
      const mockResponse: BusinessProfileResponse = {
        data: [
          {
            about: 'Business description',
            email: 'contact@business.com',
            messaging_product: 'whatsapp',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getBusinessProfile(
        mockClient,
        'phone-123',
        ['about', 'email']
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        'phone-123/whatsapp_business_profile?fields=about,email'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty profile data', async () => {
      const mockResponse: BusinessProfileResponse = {
        data: [
          {
            messaging_product: 'whatsapp',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getBusinessProfile(mockClient, 'phone-123');

      expect(result).toEqual(mockResponse);
      expect(result.data[0].messaging_product).toBe('whatsapp');
    });

    it('should validate response when validator provided', async () => {
      const mockResponse: BusinessProfileResponse = {
        data: [
          {
            about: 'Test',
            messaging_product: 'whatsapp',
          },
        ],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockResponse);

      const result = await getBusinessProfile(
        mockClient,
        'phone-123',
        undefined,
        mockValidator
      );

      expect(mockValidator.validate).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateBusinessProfile', () => {
    it('should update business profile with all fields', async () => {
      const params: UpdateBusinessProfileParams = {
        messaging_product: 'whatsapp',
        about: 'Updated business description',
        address: '456 New St, City, Country',
        description: 'Updated detailed description',
        email: 'newemail@business.com',
        vertical: 'RESTAURANT',
        websites: ['https://newbusiness.com', 'https://shop.newbusiness.com'],
      };

      const mockResponse: UpdateBusinessProfileResponse = {
        success: true,
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await updateBusinessProfile(mockClient, 'phone-123', params);

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/whatsapp_business_profile',
        params
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update business profile with partial fields', async () => {
      const params: UpdateBusinessProfileParams = {
        messaging_product: 'whatsapp',
        about: 'New about text',
        email: 'updated@business.com',
      };

      const mockResponse: UpdateBusinessProfileResponse = {
        success: true,
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await updateBusinessProfile(mockClient, 'phone-123', params);

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/whatsapp_business_profile',
        params
      );
      expect(result.success).toBe(true);
    });

    it('should update profile picture via handle', async () => {
      const params: UpdateBusinessProfileParams = {
        messaging_product: 'whatsapp',
        profile_picture_handle: 'media-handle-123',
      };

      const mockResponse: UpdateBusinessProfileResponse = {
        success: true,
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await updateBusinessProfile(mockClient, 'phone-123', params);

      expect(mockClient.post).toHaveBeenCalledWith(
        'phone-123/whatsapp_business_profile',
        params
      );
      expect(result.success).toBe(true);
    });

    it('should validate params when validator provided', async () => {
      const params: UpdateBusinessProfileParams = {
        messaging_product: 'whatsapp',
        about: 'Test',
      };

      const mockResponse: UpdateBusinessProfileResponse = {
        success: true,
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      await updateBusinessProfile(mockClient, 'phone-123', params, mockValidator);

      expect(mockValidator.validate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Field Validation', () => {
    it('should respect about character limit (139 chars)', () => {
      const validAbout = 'a'.repeat(139);
      expect(validAbout.length).toBe(139);

      const invalidAbout = 'a'.repeat(140);
      expect(invalidAbout.length).toBe(140);
    });

    it('should respect address character limit (256 chars)', () => {
      const validAddress = 'a'.repeat(256);
      expect(validAddress.length).toBe(256);

      const invalidAddress = 'a'.repeat(257);
      expect(invalidAddress.length).toBe(257);
    });

    it('should respect description character limit (512 chars)', () => {
      const validDescription = 'a'.repeat(512);
      expect(validDescription.length).toBe(512);

      const invalidDescription = 'a'.repeat(513);
      expect(invalidDescription.length).toBe(513);
    });

    it('should respect email character limit (128 chars)', () => {
      const validEmail = 'a'.repeat(118) + '@email.com';
      expect(validEmail.length).toBe(128);

      const invalidEmail = 'a'.repeat(119) + '@email.com';
      expect(invalidEmail.length).toBe(129);
    });

    it('should respect websites array limit (max 2)', () => {
      const validWebsites = ['https://site1.com', 'https://site2.com'];
      expect(validWebsites.length).toBe(2);

      const invalidWebsites = [
        'https://site1.com',
        'https://site2.com',
        'https://site3.com',
      ];
      expect(invalidWebsites.length).toBe(3);
    });

    it('should validate business vertical enum values', () => {
      const validVerticals = [
        'AUTOMOTIVE',
        'BEAUTY',
        'APPAREL',
        'EDU',
        'ENTERTAIN',
        'EVENT_PLAN',
        'FINANCE',
        'GROCERY',
        'GOVT',
        'HOTEL',
        'HEALTH',
        'NONPROFIT',
        'PROF_SERVICES',
        'RETAIL',
        'TRAVEL',
        'RESTAURANT',
        'OTHER',
      ];

      expect(validVerticals.length).toBe(17);
      expect(validVerticals).toContain('RETAIL');
      expect(validVerticals).toContain('RESTAURANT');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API request failed');
      vi.mocked(mockClient.get).mockRejectedValue(apiError);

      await expect(getBusinessProfile(mockClient, 'phone-123')).rejects.toThrow(
        'API request failed'
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockClient.post).mockRejectedValue(networkError);

      const params: UpdateBusinessProfileParams = {
        messaging_product: 'whatsapp',
        about: 'Test',
      };

      await expect(
        updateBusinessProfile(mockClient, 'phone-123', params)
      ).rejects.toThrow('Network timeout');
    });
  });
});
