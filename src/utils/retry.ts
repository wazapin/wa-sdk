/**
 * Retry logic with exponential backoff
 */

import type { RetryConfig } from '../types/config.js';
import { ValidationError, RateLimitError } from '../types/errors.js';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryOnRateLimit: true,
};

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param config - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const retryConfig: Required<RetryConfig> = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let delay = retryConfig.initialDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors - these are client-side errors
      if (error instanceof ValidationError) {
        throw error;
      }

      // Handle rate limit errors
      if (error instanceof RateLimitError) {
        // If retryOnRateLimit is disabled, throw immediately
        if (!retryConfig.retryOnRateLimit) {
          throw error;
        }

        // Use retry-after header if available
        if (error.retryAfter) {
          delay = error.retryAfter * 1000;
        }
      }

      // Last attempt - throw the error
      if (attempt === retryConfig.maxRetries) {
        throw error;
      }

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(
        delay * retryConfig.backoffMultiplier,
        retryConfig.maxDelay
      );
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Sleep for a specified duration
 *
 * @param ms - Duration in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
