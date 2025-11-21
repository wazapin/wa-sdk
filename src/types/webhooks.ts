/**
 * Webhook types for receiving events from WhatsApp
 */

/**
 * Webhook metadata
 */
export interface WebhookMetadata {
  displayPhoneNumber: string;
  phoneNumberId: string;
}

/**
 * Webhook contact
 */
export interface WebhookContact {
  profile: {
    name: string;
  };
  waId: string;
  identityKeyHash?: string;
}

/**
 * Webhook media structure
 */
export interface WebhookMedia {
  id: string;
  mimeType: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

/**
 * Webhook location structure
 */
export interface WebhookLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

/**
 * Webhook interactive structure
 */
export interface WebhookInteractive {
  type: 'button_reply' | 'list_reply';
  buttonReply?: {
    id: string;
    title: string;
  };
  listReply?: {
    id: string;
    title: string;
    description?: string;
  };
}

/**
 * Webhook message structure
 */
export interface WebhookMessage {
  id: string;
  from: string;
  timestamp: string;
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contacts'
    | 'button'
    | 'interactive'
    | 'order'
    | 'system'
    | 'unsupported'
    | 'unknown';
  context?: {
    from: string;
    id: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
    errorData?: {
      details: string;
    };
  }>;
  // Type-specific fields
  text?: { body: string };
  image?: WebhookMedia;
  video?: WebhookMedia;
  audio?: WebhookMedia;
  document?: WebhookMedia;
  sticker?: WebhookMedia;
  location?: WebhookLocation;
  contacts?: WebhookContact[];
  button?: { text: string; payload: string };
  interactive?: WebhookInteractive;
  reaction?: { messageId: string; emoji: string };
  unsupported?: { type: string };
}

/**
 * Webhook status structure
 */
export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipientId: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    pricingModel: string;
    billable: boolean;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
    errorData?: {
      details: string;
    };
  }>;
}

/**
 * Message webhook event
 */
export interface MessageWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messagingProduct: 'whatsapp';
        metadata: WebhookMetadata;
        contacts?: WebhookContact[];
        messages?: WebhookMessage[];
        statuses?: WebhookStatus[];
      };
      field: 'messages';
    }>;
  }>;
}

/**
 * Status webhook event
 */
export interface StatusWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messagingProduct: 'whatsapp';
        metadata: WebhookMetadata;
        statuses: WebhookStatus[];
      };
      field: 'messages';
    }>;
  }>;
}

/**
 * Account webhook event
 */
export interface AccountWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        event: string;
        [key: string]: unknown;
      };
      field: string;
    }>;
  }>;
}

/**
 * Union type for all webhook events
 */
export type WebhookEvent =
  | MessageWebhookEvent
  | StatusWebhookEvent
  | AccountWebhookEvent;
