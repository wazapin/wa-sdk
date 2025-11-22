/**
 * Commerce & Catalog Messages
 * Send product and catalog messages to customers
 * @module messages/commerce
 */

import type { HTTPClient } from '../client/http.js';
import type { MessageResponse } from '../types/responses.js';
import type {
  SendSingleProductParams,
  SendMultiProductParams,
  SendCatalogParams,
  SendCatalogTemplateParams,
} from '../types/commerce.js';

/**
 * Commerce Messages API
 * Provides methods to send product and catalog messages
 */
export class CommerceMessagesAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Send single product message
   * 
   * Showcases a single product from your catalog to a customer.
   * The product must exist in your Facebook catalog.
   * 
   * @param params - Single product message parameters
   * @returns Message response with message ID
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#single-product-message
   */
  async sendSingleProduct(params: SendSingleProductParams): Promise<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive: {
        type: 'product',
        body: params.body
          ? {
              text: params.body,
            }
          : undefined,
        footer: params.footer
          ? {
              text: params.footer,
            }
          : undefined,
        action: {
          catalog_id: params.catalog_id,
          product_retailer_id: params.product_retailer_id,
        },
      },
    });
  }

  /**
   * Send multi-product message
   * 
   * Showcases multiple products from your catalog organized in sections.
   * Maximum 10 sections with a total of 30 products.
   * 
   * @param params - Multi-product message parameters
   * @returns Message response with message ID
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#multi-product-message
   */
  async sendMultiProduct(params: SendMultiProductParams): Promise<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive: {
        type: 'product_list',
        header: params.header
          ? {
              type: 'text',
              text: params.header,
            }
          : undefined,
        body: {
          text: params.body,
        },
        footer: params.footer
          ? {
              text: params.footer,
            }
          : undefined,
        action: {
          catalog_id: params.catalog_id,
          sections: params.sections,
        },
      },
    });
  }

  /**
   * Send catalog message
   * 
   * Sends your entire catalog to a customer, allowing them to browse
   * all available products.
   * 
   * @param params - Catalog message parameters
   * @returns Message response with message ID
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#catalog-message
   */
  async sendCatalog(params: SendCatalogParams): Promise<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive: {
        type: 'catalog_message',
        body: {
          text: params.body,
        },
        footer: params.footer
          ? {
              text: params.footer,
            }
          : undefined,
        action: {
          name: 'catalog_message',
        },
      },
    });
  }

  /**
   * Send catalog template message
   * 
   * Sends a template message that includes a catalog button.
   * The template must be pre-approved and configured with catalog components.
   * 
   * @param params - Catalog template message parameters
   * @returns Message response with message ID
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#catalog-template
   */
  async sendCatalogTemplate(params: SendCatalogTemplateParams): Promise<MessageResponse> {
    return this.httpClient.post<MessageResponse>(`${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to: params.to,
      type: 'template',
      template: {
        name: params.template_name,
        language: {
          code: params.language_code,
        },
        components: params.components,
      },
    });
  }
}
