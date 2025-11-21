/**
 * Response types from WhatsApp API
 */

/**
 * Standard message response from WhatsApp API
 */
export interface MessageResponse {
  messagingProduct: 'whatsapp';
  contacts: Array<{
    input: string;
    waId: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Media upload response
 */
export interface MediaUploadResponse {
  id: string;
}

/**
 * Media download response
 */
export interface MediaDownloadResponse {
  buffer: Buffer | Blob;
  mimeType: string;
  sha256: string;
  fileSize: number;
}

/**
 * Media URL response
 */
export interface MediaUrlResponse {
  url: string;
  mimeType: string;
  sha256: string;
  fileSize: number;
}

/**
 * Generic success response
 */
export interface SuccessResponse {
  success: boolean;
}
