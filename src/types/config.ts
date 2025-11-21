/**
 * Configuration types for the WhatsApp client
 */

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum number of retries (default: 3)
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds (default: 1000)
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds (default: 30000)
   */
  maxDelay?: number;

  /**
   * Backoff multiplier (default: 2)
   */
  backoffMultiplier?: number;

  /**
   * Whether to retry on rate limit errors (default: true)
   */
  retryOnRateLimit?: boolean;
}

/**
 * Validation mode
 * - off: No validation
 * - relaxed: Validate only required fields
 * - strict: Full validation
 */
export type ValidationMode = 'off' | 'relaxed' | 'strict';

/**
 * WhatsApp client configuration
 */
export interface WhatsAppClientConfig {
  /**
   * WhatsApp Business Account access token
   */
  accessToken: string;

  /**
   * Phone number ID for sending messages
   */
  phoneNumberId: string;

  /**
   * API version (default: v18.0)
   */
  apiVersion?: string;

  /**
   * Base URL (default: https://graph.facebook.com)
   */
  baseUrl?: string;

  /**
   * Validation mode (default: strict)
   */
  validation?: ValidationMode;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;

  /**
   * Retry configuration
   */
  retry?: RetryConfig;

  /**
   * Timeout in milliseconds (default: 30000)
   */
  timeout?: number;
}
