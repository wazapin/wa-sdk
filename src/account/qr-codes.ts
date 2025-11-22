/**
 * QR Code Management
 * Create and manage QR codes for WhatsApp Business
 * @module account/qr-codes
 */

import type { HTTPClient } from '../client/http.js';
import type {
  QRCodeDetails,
  QRCodeListResponse,
  CreateQRCodeParams,
  QRCodeCreateResponse,
  UpdateQRCodeParams,
  QRCodeImageURLResponse,
} from '../types/qr-codes.js';

/**
 * QR Code Management API
 * Provides methods to create, read, update, and delete QR codes
 */
export class QRCodeAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Get QR code details by ID
   * @param qrCodeId - QR code ID
   * @returns QR code details
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async getQRCode(qrCodeId: string): Promise<QRCodeDetails> {
    return this.httpClient.get<QRCodeDetails>(qrCodeId);
  }

  /**
   * Get all QR codes for phone number
   * @param fields - Optional fields to return
   * @returns List of QR codes
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async getAllQRCodes(fields?: string[]): Promise<QRCodeListResponse> {
    const queryParams = fields ? `?fields=${fields.join(',')}` : '';
    return this.httpClient.get<QRCodeListResponse>(`${this.phoneNumberId}/message_qrdls${queryParams}`);
  }

  /**
   * Get QR code SVG image URL
   * @param qrCodeId - QR code ID
   * @returns QR code with SVG image URL
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async getQRCodeSVG(qrCodeId: string): Promise<QRCodeImageURLResponse> {
    return this.httpClient.get<QRCodeImageURLResponse>(`${qrCodeId}?generate_qr_image=SVG`);
  }

  /**
   * Get QR code PNG image URL
   * @param qrCodeId - QR code ID
   * @returns QR code with PNG image URL
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async getQRCodePNG(qrCodeId: string): Promise<QRCodeImageURLResponse> {
    return this.httpClient.get<QRCodeImageURLResponse>(`${qrCodeId}?generate_qr_image=PNG`);
  }

  /**
   * Create a new QR code
   * 
   * QR codes can be scanned by users to start a conversation with your business.
   * You can optionally include a prefilled message that appears in the user's chat.
   * 
   * @param params - QR code creation parameters
   * @returns Created QR code details
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async createQRCode(params?: CreateQRCodeParams): Promise<QRCodeCreateResponse> {
    return this.httpClient.post<QRCodeCreateResponse>(`${this.phoneNumberId}/message_qrdls`, params || {});
  }

  /**
   * Update QR code message
   * 
   * Updates the prefilled message that appears when a user scans the QR code.
   * 
   * @param qrCodeId - QR code ID
   * @param params - Update parameters
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async updateQRCode(
    qrCodeId: string,
    params: UpdateQRCodeParams,
  ): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>(qrCodeId, params);
  }

  /**
   * Delete QR code
   * 
   * Permanently deletes a QR code. This action cannot be undone.
   * 
   * @param qrCodeId - QR code ID
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/business-management-api/qr-codes
   */
  async deleteQRCode(qrCodeId: string): Promise<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(qrCodeId);
  }
}
