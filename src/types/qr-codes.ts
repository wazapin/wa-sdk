/**
 * QR Code Management Types
 * @module types/qr-codes
 */

/**
 * QR code image format
 */
export type QRCodeFormat = 'SVG' | 'PNG';

/**
 * QR code details
 */
export interface QRCodeDetails {
  /**
   * QR code ID
   */
  code: string;
  /**
   * Prefilled message text
   */
  prefilled_message: string;
  /**
   * Deep link URL
   */
  deep_link_url: string;
  /**
   * QR code image URL (SVG or PNG)
   */
  qr_image_url?: string;
}

/**
 * QR code list response
 */
export interface QRCodeListResponse {
  data: QRCodeDetails[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}

/**
 * Parameters for creating QR code
 */
export interface CreateQRCodeParams {
  /**
   * Prefilled message that appears when user scans QR code
   * Max 60 characters
   */
  prefilled_message?: string;
  /**
   * Image format (SVG or PNG)
   */
  generate_qr_image?: QRCodeFormat;
}

/**
 * QR code create response
 */
export interface QRCodeCreateResponse {
  /**
   * QR code ID
   */
  code: string;
  /**
   * Prefilled message
   */
  prefilled_message: string;
  /**
   * Deep link URL
   */
  deep_link_url: string;
  /**
   * QR image URL (if requested)
   */
  qr_image_url?: string;
}

/**
 * Parameters for updating QR code
 */
export interface UpdateQRCodeParams {
  /**
   * New prefilled message
   * Max 60 characters
   */
  prefilled_message: string;
}

/**
 * QR code image URL response
 */
export interface QRCodeImageURLResponse {
  /**
   * QR code ID
   */
  code: string;
  /**
   * QR image URL
   */
  qr_image_url: string;
}
