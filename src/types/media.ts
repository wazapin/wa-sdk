/**
 * Media-related types
 */

/**
 * Supported media types for WhatsApp
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'sticker';

/**
 * Media file information
 */
export interface MediaFile {
  buffer: Buffer | Blob;
  mimeType: string;
  filename?: string;
}

/**
 * Media metadata
 */
export interface MediaMetadata {
  id: string;
  mimeType: string;
  sha256?: string;
  fileSize?: number;
}
