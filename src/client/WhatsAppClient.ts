/**
 * Main WhatsApp Client class
 */

import type { WhatsAppClientConfig } from '../types/config.js';
import type {
  SendTextParams,
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
  SendLocationParams,
  SendContactParams,
  SendReactionParams,
  SendInteractiveButtonsParams,
  SendInteractiveListParams,
  SendInteractiveCarouselParams,
  SendInteractiveCTAParams,
  SendTemplateParams,
} from '../types/messages.js';
import type {
  MessageResponse,
  SuccessResponse,
  MediaUploadResponse,
  MediaDownloadResponse,
  MediaUrlResponse,
} from '../types/responses.js';
import type {
  MessagingLimitResponse,
  BusinessProfileResponse,
  UpdateBusinessProfileParams,
  UpdateBusinessProfileResponse,
} from '../types/account.js';
import type { WebhookEvent } from '../types/webhooks.js';

import { HTTPClient } from './http.js';
import { Validator } from '../validation/validator.js';
import { withRetry } from '../utils/retry.js';

// Import message functions
import { sendText } from '../messages/text.js';
import {
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
} from '../messages/media.js';
import {
  sendInteractiveButtons,
  sendInteractiveList,
  sendInteractiveCarousel,
  sendInteractiveCTA,
} from '../messages/interactive.js';
import { sendTemplate } from '../messages/template.js';
import { sendLocation } from '../messages/location.js';
import { sendContact } from '../messages/contact.js';
import { sendReaction } from '../messages/reaction.js';
import { markAsRead } from '../messages/read.js';

// Import media functions
import { uploadMedia } from '../media/upload.js';
import { downloadMedia, getMediaUrl } from '../media/download.js';

// Import webhook functions
import { parseWebhook } from '../webhooks/parser.js';
import { verifyWebhookSignature } from '../webhooks/verifier.js';

// Import account functions
import { getMessagingLimit, getBusinessProfile, updateBusinessProfile } from '../account/index.js';

/**
 * WhatsApp Business Cloud API Client
 */
export class WhatsAppClient {
  private readonly client: HTTPClient;
  private readonly phoneNumberId: string;
  private readonly validator?: Validator;
  private readonly retryConfig;

  /**
   * Messages namespace
   */
  public readonly messages: {
    sendText: (params: SendTextParams) => Promise<MessageResponse>;
    sendImage: (params: SendImageParams) => Promise<MessageResponse>;
    sendVideo: (params: SendVideoParams) => Promise<MessageResponse>;
    sendAudio: (params: SendAudioParams) => Promise<MessageResponse>;
    sendDocument: (params: SendDocumentParams) => Promise<MessageResponse>;
    sendSticker: (params: SendStickerParams) => Promise<MessageResponse>;
    sendLocation: (params: SendLocationParams) => Promise<MessageResponse>;
    sendContact: (params: SendContactParams) => Promise<MessageResponse>;
    sendReaction: (params: SendReactionParams) => Promise<MessageResponse>;
    sendInteractiveButtons: (
      params: SendInteractiveButtonsParams
    ) => Promise<MessageResponse>;
    sendInteractiveList: (params: SendInteractiveListParams) => Promise<MessageResponse>;
    sendInteractiveCarousel: (
      params: SendInteractiveCarouselParams
    ) => Promise<MessageResponse>;
    sendTemplate: (params: SendTemplateParams) => Promise<MessageResponse>;
    sendInteractiveCTA: (params: SendInteractiveCTAParams) => Promise<MessageResponse>;
    markAsRead: (messageId: string) => Promise<SuccessResponse>;
  };

  /**
   * Media namespace
   */
  public readonly media: {
    upload: (file: Buffer | Blob, mimeType: string) => Promise<MediaUploadResponse>;
    download: (mediaId: string) => Promise<MediaDownloadResponse>;
    getUrl: (mediaId: string) => Promise<MediaUrlResponse>;
  };

  /**
   * Webhooks namespace
   */
  public readonly webhooks: {
    parse: (payload: unknown) => WebhookEvent;
    verify: (payload: string, signature: string, appSecret: string) => Promise<boolean>;
  };

  /**
   * Account namespace
   */
  public readonly account: {
    getMessagingLimit: () => Promise<MessagingLimitResponse>;
    getBusinessProfile: (fields?: string[]) => Promise<BusinessProfileResponse>;
    updateBusinessProfile: (
      params: UpdateBusinessProfileParams
    ) => Promise<UpdateBusinessProfileResponse>;
  };

  constructor(config: WhatsAppClientConfig) {
    // Initialize HTTP client
    this.client = new HTTPClient(config);
    this.phoneNumberId = config.phoneNumberId;
    this.retryConfig = config.retry;

    // Initialize validator if validation is enabled
    if (config.validation && config.validation !== 'off') {
      this.validator = new Validator(config.validation);
    }

    // Initialize messages namespace
    this.messages = {
      sendText: (params) =>
        this.withRetryWrapper(() =>
          sendText(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendImage: (params) =>
        this.withRetryWrapper(() =>
          sendImage(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendVideo: (params) =>
        this.withRetryWrapper(() =>
          sendVideo(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendAudio: (params) =>
        this.withRetryWrapper(() =>
          sendAudio(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendDocument: (params) =>
        this.withRetryWrapper(() =>
          sendDocument(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendSticker: (params) =>
        this.withRetryWrapper(() =>
          sendSticker(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendLocation: (params) =>
        this.withRetryWrapper(() =>
          sendLocation(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendContact: (params) =>
        this.withRetryWrapper(() =>
          sendContact(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendReaction: (params) =>
        this.withRetryWrapper(() =>
          sendReaction(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveButtons: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveButtons(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveList: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveList(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveCarousel: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveCarousel(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendTemplate: (params) =>
        this.withRetryWrapper(() =>
          sendTemplate(this.client, this.phoneNumberId, params, this.validator)
        ),
      sendInteractiveCTA: (params) =>
        this.withRetryWrapper(() =>
          sendInteractiveCTA(this.client, this.phoneNumberId, params, this.validator)
        ),
      markAsRead: (messageId) =>
        this.withRetryWrapper(() => markAsRead(this.client, this.phoneNumberId, messageId)),
    };

    // Initialize media namespace
    this.media = {
      upload: (file, mimeType) =>
        this.withRetryWrapper(() => uploadMedia(this.client, this.phoneNumberId, file, mimeType)),
      download: (mediaId) => this.withRetryWrapper(() => downloadMedia(this.client, mediaId)),
      getUrl: (mediaId) => this.withRetryWrapper(() => getMediaUrl(this.client, mediaId)),
    };

    // Initialize webhooks namespace
    this.webhooks = {
      parse: (payload) => parseWebhook(payload, this.validator),
      verify: (payload, signature, appSecret) =>
        verifyWebhookSignature(payload, signature, appSecret),
    };

    // Initialize account namespace
    this.account = {
      getMessagingLimit: () =>
        this.withRetryWrapper(() =>
          getMessagingLimit(this.client, this.phoneNumberId, this.validator)
        ),
      getBusinessProfile: (fields) =>
        this.withRetryWrapper(() =>
          getBusinessProfile(this.client, this.phoneNumberId, fields, this.validator)
        ),
      updateBusinessProfile: (params) =>
        this.withRetryWrapper(() =>
          updateBusinessProfile(this.client, this.phoneNumberId, params, this.validator)
        ),
    };
  }

  /**
   * Wrap function with retry logic
   */
  private withRetryWrapper<T>(fn: () => Promise<T>): Promise<T> {
    if (this.retryConfig) {
      return withRetry(fn, this.retryConfig);
    }
    return fn();
  }
}
