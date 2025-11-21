/**
 * Unit tests for retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from './retry.js';
import { ValidationError, RateLimitError, NetworkError, APIError } from '../types/errors.js';
import type { RetryConfig } from '../types/config.js';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful execution', () => {
    it('should return result on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should return result after retries', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockRejectedValueOnce(new NetworkError('Network error'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, { maxRetries: 3 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('exponential backoff', () => {
    it('should use exponential backoff between retries', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Error 1'))
        .mockRejectedValueOnce(new NetworkError('Error 2'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
      });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // Wait for first retry (1000ms)
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Wait for second retry (2000ms)
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe('success');
    });

    it('should respect maxDelay', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Error 1'))
        .mockRejectedValueOnce(new NetworkError('Error 2'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelay: 10000,
        maxDelay: 15000,
        backoffMultiplier: 2,
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // First retry at 10000ms
      await vi.advanceTimersByTimeAsync(10000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Second retry should be capped at maxDelay (15000ms instead of 20000ms)
      await vi.advanceTimersByTimeAsync(15000);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('max retries', () => {
    it('should throw error after max retries', async () => {
      const error = new NetworkError('Persistent error');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, { maxRetries: 2, initialDelay: 100 });
      const timerPromise = vi.runAllTimersAsync();

      await expect(Promise.all([promise, timerPromise])).rejects.toThrow('Persistent error');

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect custom maxRetries', async () => {
      const error = new NetworkError('Error');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, { maxRetries: 5, initialDelay: 100 });
      const timerPromise = vi.runAllTimersAsync();

      await expect(Promise.all([promise, timerPromise])).rejects.toThrow('Error');

      expect(fn).toHaveBeenCalledTimes(6); // Initial + 5 retries
    });
  });

  describe('validation errors', () => {
    it('should not retry on validation errors', async () => {
      const error = new ValidationError('Invalid input', 'field');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, { maxRetries: 3 });
      const timerPromise = vi.runAllTimersAsync();

      await expect(Promise.all([promise, timerPromise])).rejects.toThrow(ValidationError);

      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('rate limit errors', () => {
    it('should retry on rate limit errors when enabled', async () => {
      const rateLimitError = new RateLimitError('Rate limit exceeded', 429, 5);
      const fn = vi
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        retryOnRateLimit: true,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use retry-after header value', async () => {
      const rateLimitError = new RateLimitError('Rate limit exceeded', 429, 10);
      const fn = vi
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxRetries: 3,
        retryOnRateLimit: true,
        initialDelay: 1000,
      });

      // Wait for all timers to complete
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on rate limit when disabled', async () => {
      const rateLimitError = new RateLimitError('Rate limit exceeded', 429, 5);
      const fn = vi.fn().mockRejectedValue(rateLimitError);

      const promise = withRetry(fn, {
        maxRetries: 3,
        retryOnRateLimit: false,
      });
      const timerPromise = vi.runAllTimersAsync();

      await expect(Promise.all([promise, timerPromise])).rejects.toThrow(RateLimitError);

      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('default configuration', () => {
    it('should use default values when not provided', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new NetworkError('Error 1'))
        .mockRejectedValueOnce(new NetworkError('Error 2'))
        .mockRejectedValueOnce(new NetworkError('Error 3'))
        .mockResolvedValue('success');

      const promise = withRetry(fn); // No config provided
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 default retries
    });
  });

  describe('retry configuration', () => {
    it('should use default configuration when not provided', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const promise = withRetry(fn);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(1000); // Default initial delay

      const result = await promise;
      expect(result).toBe('success');
    });

    it('should allow custom retry configuration', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');

      const config: RetryConfig = {
        maxRetries: 5,
        initialDelay: 500,
        maxDelay: 10000,
        backoffMultiplier: 3,
        retryOnRateLimit: false,
      };

      const promise = withRetry(fn, config);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(500);

      const result = await promise;
      expect(result).toBe('success');
    });
  });

  describe('error types', () => {
    it('should retry APIError', async () => {
      const apiError = new APIError('API Error', 500, 1);
      const fn = vi.fn().mockRejectedValueOnce(apiError).mockResolvedValue('success');

      const config: RetryConfig = { maxRetries: 2, initialDelay: 100 };

      const promise = withRetry(fn, config);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry generic errors', async () => {
      const error = new Error('Generic error');
      const fn = vi.fn().mockRejectedValueOnce(error).mockResolvedValue('success');

      const config: RetryConfig = { maxRetries: 2, initialDelay: 100 };

      const promise = withRetry(fn, config);

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
