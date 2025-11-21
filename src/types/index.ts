/**
 * Type exports for @wazapin/wa-sdk
 */

// Common types
export type {
  PhoneNumber,
  MessageId,
  MediaId,
  LanguageCode,
  MessageContext,
  MediaInput,
  CurrencyParameter,
  DateTimeParameter,
  InteractiveHeader,
} from './common.js';

// Message types
export type {
  SendTextParams,
  SendImageParams,
  SendVideoParams,
  SendAudioParams,
  SendDocumentParams,
  SendStickerParams,
  SendLocationParams,
  ContactName,
  ContactPhone,
  ContactEmail,
  ContactUrl,
  ContactAddress,
  ContactOrg,
  Contact,
  SendContactParams,
  SendReactionParams,
  InteractiveButton,
  SendInteractiveButtonsParams,
  InteractiveRow,
  InteractiveSection,
  SendInteractiveListParams,
  InteractiveCarouselCard,
  SendInteractiveCarouselParams,
  TemplateParameter,
  TemplateComponent,
  SendTemplateParams,
  InteractiveCTAHeader,
  InteractiveCTAAction,
  SendInteractiveCTAParams,
} from './messages.js';

// Response types
export type {
  MessageResponse,
  MediaUploadResponse,
  MediaDownloadResponse,
  MediaUrlResponse,
  SuccessResponse,
} from './responses.js';

// Webhook types
export type {
  WebhookMetadata,
  WebhookContact,
  WebhookMedia,
  WebhookLocation,
  WebhookInteractive,
  WebhookMessage,
  WebhookStatus,
  MessageWebhookEvent,
  StatusWebhookEvent,
  AccountWebhookEvent,
  WebhookEvent,
} from './webhooks.js';

// Error types
export {
  WhatsAppError,
  APIError,
  ValidationError,
  NetworkError,
  RateLimitError,
} from './errors.js';

// Configuration types
export type {
  RetryConfig,
  ValidationMode,
  WhatsAppClientConfig,
} from './config.js';

// Media types
export type { MediaType, MediaFile, MediaMetadata } from './media.js';

// Account types
export type {
  MessagingLimitTier,
  MessagingLimitResponse,
  BusinessVertical,
  BusinessProfile,
  UpdateBusinessProfileParams,
  BusinessProfileResponse,
  UpdateBusinessProfileResponse,
  ConversationalCommand,
  ConversationalAutomationConfig,
  ConfigureConversationalAutomationParams,
  ConversationalAutomationResponse,
} from './account.js';
