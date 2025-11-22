/**
 * Commerce Settings Tests
 * @module account/commerce-settings.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommerceSettingsAPI } from './commerce-settings.js';
import type { HttpClient } from '../client/http.js';
import type { CommerceSettingsResponse } from '../types/commerce-settings.js';

describe('CommerceSettingsAPI', () => {
  let commerceSettingsAPI: CommerceSettingsAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    commerceSettingsAPI = new CommerceSettingsAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('getCommerceSettings', () => {
    it('should get commerce settings', async () => {
      const mockResponse: CommerceSettingsResponse = {
        data: [
          {
            is_catalog_visible: true,
            is_cart_enabled: true,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await commerceSettingsAPI.getCommerceSettings();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${testPhoneNumberId}/whatsapp_commerce_settings`);
      expect(result.data[0].is_catalog_visible).toBe(true);
      expect(result.data[0].is_cart_enabled).toBe(true);
    });

    it('should handle catalog invisible and cart disabled', async () => {
      const mockResponse: CommerceSettingsResponse = {
        data: [
          {
            is_catalog_visible: false,
            is_cart_enabled: false,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await commerceSettingsAPI.getCommerceSettings();

      expect(result.data[0].is_catalog_visible).toBe(false);
      expect(result.data[0].is_cart_enabled).toBe(false);
    });
  });

  describe('updateCommerceSettings', () => {
    it('should update catalog visibility', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await commerceSettingsAPI.updateCommerceSettings({
        is_catalog_visible: true,
    });


      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/whatsapp_commerce_settings`, {
          is_catalog_visible: true,
        );
      expect(result.success).toBe(true);
    });

    it('should update cart enablement', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await commerceSettingsAPI.updateCommerceSettings({
        is_cart_enabled: true,
    });


      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/whatsapp_commerce_settings`, {
          is_cart_enabled: true,
        );
      expect(result.success).toBe(true);
    });

    it('should update both settings', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await commerceSettingsAPI.updateCommerceSettings({
        is_catalog_visible: true,
        is_cart_enabled: false,
      });

      const callArgs = vi.mocked(mockHttpClient.get).mock.calls[0][0];
      expect(callArgs.data.is_catalog_visible).toBe(true);
      expect(callArgs.data.is_cart_enabled).toBe(false);
    });

    it('should disable catalog', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await commerceSettingsAPI.updateCommerceSettings({
        is_catalog_visible: false,
      });

      const callArgs = vi.mocked(mockHttpClient.get).mock.calls[0][0];
      expect(callArgs.data.is_catalog_visible).toBe(false);
    });

    it('should disable cart', async () => {
      const mockResponse = { success: true };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await commerceSettingsAPI.updateCommerceSettings({
        is_cart_enabled: false,
      });

      const callArgs = vi.mocked(mockHttpClient.get).mock.calls[0][0];
      expect(callArgs.data.is_cart_enabled).toBe(false);
    });
  });
});
