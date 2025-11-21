/**
 * Media message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type {
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
} from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import {
  sendImageParamsSchema,
  sendVideoParamsSchema,
  sendAudioParamsSchema,
  sendDocumentParamsSchema,
  sendStickerParamsSchema,
} from '../validation/schemas/messages.js';

/**
 * Send an image message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Image message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendImage(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendImageParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendImageParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'image',
    image: {
      ...params.image,
      ...(params.caption && { caption: params.caption }),
    },
  };

  // Add context if provided
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send a video message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Video message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendVideo(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendVideoParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendVideoParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'video',
    video: {
      ...params.video,
      ...(params.caption && { caption: params.caption }),
    },
  };

  // Add context if provided
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send an audio message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Audio message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendAudio(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendAudioParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendAudioParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'audio',
    audio: params.audio,
  };

  // Add context if provided
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send a document message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Document message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendDocument(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendDocumentParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendDocumentParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'document',
    document: {
      ...params.document,
      ...(params.caption && { caption: params.caption }),
      ...(params.filename && { filename: params.filename }),
    },
  };

  // Add context if provided
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send a sticker message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Sticker message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendSticker(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendStickerParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendStickerParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'sticker',
    sticker: params.sticker,
  };

  // Add context if provided
  if (params.context) {
    payload.context = {
      message_id: params.context.messageId,
    };
  }

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
