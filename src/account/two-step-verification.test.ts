/**
 * Tests for Two-Step Verification API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TwoStepVerificationAPI } from './two-step-verification.js';
import type { HTTPClient } from '../client/http.js';

describe('TwoStepVerificationAPI', () => {
  let api: TwoStepVerificationAPI;
  let mockClient: HTTPClient;

  beforeEach(() => {
    mockClient = {
      post: vi.fn(),
    } as unknown as HTTPClient;

    api = new TwoStepVerificationAPI(mockClient);
  });

  describe('setPin', () => {
    it('should set a valid 6-digit PIN', async () => {
      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await api.setPin('123456789', '123456');

      expect(mockClient.post).toHaveBeenCalledWith('123456789', {
        pin: '123456',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should accept different valid PINs', async () => {
      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      await api.setPin('123456789', '000000');
      expect(mockClient.post).toHaveBeenCalledWith('123456789', { pin: '000000' });

      await api.setPin('123456789', '999999');
      expect(mockClient.post).toHaveBeenCalledWith('123456789', { pin: '999999' });

      await api.setPin('123456789', '654321');
      expect(mockClient.post).toHaveBeenCalledWith('123456789', { pin: '654321' });
    });

    it('should reject PIN with less than 6 digits', async () => {
      await expect(api.setPin('123456789', '12345')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should reject PIN with more than 6 digits', async () => {
      await expect(api.setPin('123456789', '1234567')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should reject PIN with non-numeric characters', async () => {
      await expect(api.setPin('123456789', '12345a')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      await expect(api.setPin('123456789', 'abcdef')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      await expect(api.setPin('123456789', '123-456')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should reject empty PIN', async () => {
      await expect(api.setPin('123456789', '')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should reject PIN with spaces', async () => {
      await expect(api.setPin('123456789', '123 456')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      await expect(api.setPin('123456789', ' 123456')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('changePin', () => {
    it('should change PIN using setPin internally', async () => {
      const mockResponse = { success: true };
      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const result = await api.changePin('123456789', '654321');

      expect(mockClient.post).toHaveBeenCalledWith('123456789', {
        pin: '654321',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should validate PIN format same as setPin', async () => {
      await expect(api.changePin('123456789', '12345')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      await expect(api.changePin('123456789', 'abcdef')).rejects.toThrow(
        'PIN must be exactly 6 digits'
      );

      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('API error handling', () => {
    it('should propagate API errors', async () => {
      const apiError = new Error('API Error: Invalid phone number');
      vi.mocked(mockClient.post).mockRejectedValue(apiError);

      await expect(api.setPin('123456789', '123456')).rejects.toThrow(
        'API Error: Invalid phone number'
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockClient.post).mockRejectedValue(networkError);

      await expect(api.setPin('123456789', '123456')).rejects.toThrow(
        'Network timeout'
      );
    });
  });
});
