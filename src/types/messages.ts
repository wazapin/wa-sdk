/**
 * Message types for sending various message formats
 */

import type {
  MessageContext,
  MediaInput,
  InteractiveHeader,
  LanguageCode,
  CurrencyParameter,
  DateTimeParameter,
} from './common.js';

/**
 * Parameters for sending a text message
 */
export interface SendTextParams {
  to: string;
  text: string;
  previewUrl?: boolean;
  context?: MessageContext;
}

/**
 * Parameters for sending an image message
 */
export interface SendImageParams {
  to: string;
  image: MediaInput;
  caption?: string;
  context?: MessageContext;
}

/**
 * Parameters for sending a video message
 */
export interface SendVideoParams {
  to: string;
  video: MediaInput;
  caption?: string;
  context?: MessageContext;
}

/**
 * Parameters for sending an audio message
 */
export interface SendAudioParams {
  to: string;
  audio: MediaInput;
  context?: MessageContext;
}

/**
 * Parameters for sending a document message
 */
export interface SendDocumentParams {
  to: string;
  document: MediaInput;
  caption?: string;
  filename?: string;
  context?: MessageContext;
}

/**
 * Parameters for sending a sticker message
 */
export interface SendStickerParams {
  to: string;
  sticker: MediaInput;
  context?: MessageContext;
}

/**
 * Parameters for sending a location message
 */
export interface SendLocationParams {
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

/**
 * Contact name structure
 */
export interface ContactName {
  formattedName: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  prefix?: string;
}

/**
 * Contact phone structure
 */
export interface ContactPhone {
  phone: string;
  type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
  waId?: string;
}

/**
 * Contact email structure
 */
export interface ContactEmail {
  email: string;
  type?: 'HOME' | 'WORK';
}

/**
 * Contact URL structure
 */
export interface ContactUrl {
  url: string;
  type?: 'HOME' | 'WORK';
}

/**
 * Contact address structure
 */
export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  countryCode?: string;
  type?: 'HOME' | 'WORK';
}

/**
 * Contact organization structure
 */
export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

/**
 * Contact structure
 */
export interface Contact {
  name: ContactName;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  urls?: ContactUrl[];
  addresses?: ContactAddress[];
  org?: ContactOrg;
  birthday?: string;
}

/**
 * Parameters for sending a contact message
 */
export interface SendContactParams {
  to: string;
  contacts: Contact[];
}

/**
 * Parameters for sending a reaction message
 */
export interface SendReactionParams {
  to: string;
  messageId: string;
  emoji: string; // empty string to remove reaction
}

/**
 * Interactive button structure
 */
export interface InteractiveButton {
  id: string;
  title: string;
}

/**
 * Parameters for sending interactive buttons
 */
export interface SendInteractiveButtonsParams {
  to: string;
  body: string;
  buttons: InteractiveButton[];
  header?: InteractiveHeader;
  footer?: string;
}

/**
 * Interactive list row structure
 */
export interface InteractiveRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Interactive list section structure
 */
export interface InteractiveSection {
  title: string;
  rows: InteractiveRow[];
}

/**
 * Parameters for sending interactive list
 */
export interface SendInteractiveListParams {
  to: string;
  body: string;
  buttonText: string;
  sections: InteractiveSection[];
  header?: InteractiveHeader;
  footer?: string;
}

/**
 * Template parameter types
 */
export type TemplateParameter =
  | { type: 'text'; text: string }
  | { type: 'currency'; currency: CurrencyParameter }
  | { type: 'date_time'; date_time: DateTimeParameter }
  | { type: 'image'; image: MediaInput }
  | { type: 'video'; video: MediaInput }
  | { type: 'document'; document: MediaInput };

/**
 * Template component structure
 */
export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
  subType?: string;
  index?: number;
}

/**
 * Interactive carousel card structure
 */
export interface InteractiveCarouselCard {
  cardIndex: number;
  header:
    | { type: 'image'; image: MediaInput }
    | { type: 'video'; video: MediaInput };
  body?: {
    text: string;
  };
  action: {
    displayText: string;
    url: string;
  };
}

/**
 * Parameters for sending interactive carousel
 */
export interface SendInteractiveCarouselParams {
  to: string;
  body: string;
  cards: InteractiveCarouselCard[];
}

/**
 * Parameters for sending a template message
 */
export interface SendTemplateParams {
  to: string;
  template: {
    name: string;
    language: LanguageCode;
    components?: TemplateComponent[];
  };
}
