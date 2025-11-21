/**
 * Media upload functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { MediaUploadResponse } from '../types/responses.js';
import { ValidationError } from '../types/errors.js';

/**
 * Maximum file sizes for different media types (in bytes)
 */
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  video: 16 * 1024 * 1024, // 16MB
  audio: 16 * 1024 * 1024, // 16MB
  document: 100 * 1024 * 1024, // 100MB
  sticker: 500 * 1024, // 500KB
};

/**
 * Get media type from mime type
 */
function getMediaTypeFromMime(mimeType: string): keyof typeof MAX_FILE_SIZES {
  if (mimeType.startsWith('image/')) {
    // Check if it's a sticker (webp)
    if (mimeType === 'image/webp') {
      return 'sticker';
    }
    return 'image';
  }
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Upload media to WhatsApp
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID
 * @param file - File buffer or Blob
 * @param mimeType - MIME type of the file
 * @returns Media upload response with media ID
 */
export async function uploadMedia(
  client: HTTPClient,
  phoneNumberId: string,
  file: Buffer | Blob,
  mimeType: string
): Promise<MediaUploadResponse> {
  // Validate file size
  const fileSize =
    file instanceof Buffer ? file.length : (file as Blob).size;
  const mediaType = getMediaTypeFromMime(mimeType);
  const maxSize = MAX_FILE_SIZES[mediaType];

  if (fileSize > maxSize) {
    throw new ValidationError(
      `File size (${fileSize} bytes) exceeds maximum allowed size for ${mediaType} (${maxSize} bytes)`,
      'file'
    );
  }

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', mimeType);

  // Add file to form data
  if (file instanceof Buffer) {
    // For Node.js Buffer, convert to Blob
    const blob = new Blob([file], { type: mimeType });
    formData.append('file', blob, 'file');
  } else {
    // For Blob (browser)
    formData.append('file', file, 'file');
  }

  // Upload using custom request (not JSON)
  const url = `${client['baseUrl']}/${client['apiVersion']}/${phoneNumberId}/media`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${client['accessToken']}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Media upload failed: ${response.statusText}`);
  }

  return (await response.json()) as MediaUploadResponse;
}
