/**
 * Common types used across the SDK
 */

/**
 * Phone number in E.164 format (e.g., +1234567890)
 */
export type PhoneNumber = string;

/**
 * Unique identifier for a message
 */
export type MessageId = string;

/**
 * Unique identifier for media
 */
export type MediaId = string;

/**
 * Supported language codes for WhatsApp
 */
export type LanguageCode =
  | 'en'
  | 'en_US'
  | 'en_GB'
  | 'id'
  | 'id_ID'
  | 'es'
  | 'es_ES'
  | 'es_MX'
  | 'pt'
  | 'pt_BR'
  | 'pt_PT'
  | 'fr'
  | 'fr_FR'
  | 'de'
  | 'de_DE'
  | 'it'
  | 'it_IT'
  | 'ja'
  | 'ja_JP'
  | 'ko'
  | 'ko_KR'
  | 'zh'
  | 'zh_CN'
  | 'zh_TW'
  | 'ar'
  | 'ar_SA'
  | 'hi'
  | 'hi_IN'
  | 'ru'
  | 'ru_RU'
  | 'nl'
  | 'nl_NL'
  | 'tr'
  | 'tr_TR';

/**
 * Message context for replying to messages
 */
export interface MessageContext {
  messageId: string;
}

/**
 * Media input - either a URL or media ID
 */
export type MediaInput = { link: string } | { id: string };

/**
 * Currency parameter for template messages
 */
export interface CurrencyParameter {
  fallbackValue: string;
  code: string;
  amount1000: number;
}

/**
 * DateTime parameter for template messages
 */
export interface DateTimeParameter {
  fallbackValue: string;
}

/**
 * Interactive header types
 */
export type InteractiveHeader =
  | { type: 'text'; text: string }
  | { type: 'image'; image: MediaInput }
  | { type: 'video'; video: MediaInput }
  | { type: 'document'; document: MediaInput };
