/**
 * Commerce Messages Tests
 * @module messages/commerce.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommerceMessagesAPI } from './commerce.js';
import type { HttpClient } from '../client/http.js';
import type { MessageResponse } from '../types/messages.js';

describe('CommerceMessagesAPI', () => {
  let commerceAPI: CommerceMessagesAPI;
  let mockHttpClient: HttpClient;
  const testPhoneNumberId = '123456789';
  const testRecipient = '+1234567890';

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    } as unknown as HttpClient;
    commerceAPI = new CommerceMessagesAPI(mockHttpClient, testPhoneNumberId);
  });

  describe('sendSingleProduct', () => {
    it('should send single product message', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await commerceAPI.sendSingleProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        product_retailer_id: 'product_456',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: testRecipient,
        type: 'interactive',
        interactive: {
          type: 'product',
          action: {
            catalog_id: 'catalog_123',
            product_retailer_id: 'product_456',
          },
        },
      });
      expect(result.messages[0].id).toBe('wamid.test123');
    });

    it('should send single product with body text', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendSingleProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        product_retailer_id: 'product_456',
        body: 'Check out this amazing product!',
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.body).toEqual({
        text: 'Check out this amazing product!',
      });
    });

    it('should send single product with footer', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendSingleProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        product_retailer_id: 'product_456',
        footer: 'Limited time offer',
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.footer).toEqual({
        text: 'Limited time offer',
      });
    });

    it('should send single product with body and footer', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendSingleProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        product_retailer_id: 'product_456',
        body: 'Check out this product',
        footer: 'Free shipping',
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.body.text).toBe('Check out this product');
      expect(callArgs.interactive.footer.text).toBe('Free shipping');
    });
  });

  describe('sendMultiProduct', () => {
    it('should send multi-product message', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await commerceAPI.sendMultiProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        body: 'Check out these products',
        sections: [
          {
            title: 'New Arrivals',
            product_items: [
              { product_retailer_id: 'product_1' },
              { product_retailer_id: 'product_2' },
            ],
          },
        ],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: testRecipient,
        type: 'interactive',
        interactive: {
          type: 'product_list',
          body: {
            text: 'Check out these products',
            },
            action: {
              catalog_id: 'catalog_123',
              sections: [
                {
                  title: 'New Arrivals',
                  product_items: [
                    { product_retailer_id: 'product_1' },
                    { product_retailer_id: 'product_2' },
                  ],
                },
              ],
            },
          },
        });
      expect(result.messages[0].id).toBe('wamid.test123');
    });

    it('should send multi-product with header', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendMultiProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        header: 'Our Products',
        body: 'Check out these products',
        sections: [
          {
            title: 'Featured',
            product_items: [{ product_retailer_id: 'product_1' }],
          },
        ],
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.header).toEqual({
        type: 'text',
        text: 'Our Products',
      });
    });

    it('should send multi-product with footer', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendMultiProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        body: 'Check out these products',
        footer: 'Limited stock',
        sections: [
          {
            title: 'Featured',
            product_items: [{ product_retailer_id: 'product_1' }],
          },
        ],
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.footer).toEqual({
        text: 'Limited stock',
      });
    });

    it('should support multiple sections', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendMultiProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        body: 'Browse our catalog',
        sections: [
          {
            title: 'New Arrivals',
            product_items: [{ product_retailer_id: 'product_1' }],
          },
          {
            title: 'Best Sellers',
            product_items: [{ product_retailer_id: 'product_2' }],
          },
          {
            title: 'On Sale',
            product_items: [{ product_retailer_id: 'product_3' }],
          },
        ],
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.action.sections).toHaveLength(3);
    });

    it('should support multiple products in one section', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendMultiProduct({
        to: testRecipient,
        catalog_id: 'catalog_123',
        body: 'Browse our catalog',
        sections: [
          {
            title: 'Featured Products',
            product_items: [
              { product_retailer_id: 'product_1' },
              { product_retailer_id: 'product_2' },
              { product_retailer_id: 'product_3' },
              { product_retailer_id: 'product_4' },
              { product_retailer_id: 'product_5' },
            ],
          },
        ],
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.action.sections[0].product_items).toHaveLength(5);
    });
  });

  describe('sendCatalog', () => {
    it('should send catalog message', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await commerceAPI.sendCatalog({
        to: testRecipient,
        body: 'Browse our full catalog',
    });


      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: testRecipient,
          type: 'interactive',
          interactive: {
            type: 'catalog_message',
            body: {
              text: 'Browse our full catalog',
            },
            action: {
              name: 'catalog_message',
            },
          },
        });
      expect(result.messages[0].id).toBe('wamid.test123');
    });

    it('should send catalog with footer', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendCatalog({
        to: testRecipient,
        body: 'Browse our full catalog',
        footer: 'New items added weekly',
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.interactive.footer).toEqual({
        text: 'New items added weekly',
      });
    });
  });

  describe('sendCatalogTemplate', () => {
    it('should send catalog template message', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await commerceAPI.sendCatalogTemplate({
        to: testRecipient,
        template_name: 'catalog_promo',
        language_code: 'en_US',
    });


      expect(mockHttpClient.post).toHaveBeenCalledWith(`${testPhoneNumberId}/messages`, {
          messaging_product: 'whatsapp',
          to: testRecipient,
          type: 'template',
          template: {
            name: 'catalog_promo',
            language: {
              code: 'en_US',
            },
            components: undefined,
          },
        });
      expect(result.messages[0].id).toBe('wamid.test123');
    });

    it('should send catalog template with components', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      await commerceAPI.sendCatalogTemplate({
        to: testRecipient,
        template_name: 'catalog_promo',
        language_code: 'en_US',
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: 'John',
              },
            ],
          },
        ],
      });

      const callArgs = vi.mocked(mockHttpClient.post).mock.calls[0][1];
      expect(callArgs.template.components).toBeDefined();
      expect(callArgs.template.components).toHaveLength(1);
      expect(callArgs.template.components[0].type).toBe('body');
    });

    it('should support different language codes', async () => {
      const mockResponse: MessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: testRecipient, wa_id: testRecipient }],
        messages: [{ id: 'wamid.test123' }],
      };

      const languageCodes = ['en_US', 'id_ID', 'es_ES', 'fr_FR'];

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      for (const language_code of languageCodes) {
        await commerceAPI.sendCatalogTemplate({
          to: testRecipient,
          template_name: 'catalog_promo',
          language_code,
        });

        const callArgs = vi.mocked(mockHttpClient.post).mock.calls[
          vi.mocked(mockHttpClient.post).mock.calls.length - 1
        ][1];
        expect(callArgs.template.language.code).toBe(language_code);
      }
    });
  });
});
