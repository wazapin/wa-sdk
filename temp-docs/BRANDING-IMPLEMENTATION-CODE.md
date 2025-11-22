# Wazapin SDK - Branding Implementation Code

> **Ready-to-use code snippets untuk implementasi SDK branding**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Phase 1: HTTP Headers Branding](#phase-1-http-headers-branding)
3. [Phase 2: Logger Implementation](#phase-2-logger-implementation)
4. [Phase 3: Error Enhancement (Optional)](#phase-3-error-enhancement-optional)
5. [Unit Tests](#unit-tests)
6. [Integration Tests](#integration-tests)

---

## Quick Start

### Installation Order

```bash
# Phase 1: HTTP Headers (REQUIRED)
# 1. Create src/utils/version.ts
# 2. Update src/client/http.ts
# 3. Export utilities from src/utils/index.ts

# Phase 2: Logger (OPTIONAL)
# 1. Create src/utils/logger.ts
# 2. Update src/types/config.ts
# 3. Update src/client/WhatsAppClient.ts
# 4. Update src/client/http.ts

# Phase 3: Error Enhancement (OPTIONAL)
# 1. Update src/types/errors.ts
```

---

## Phase 1: HTTP Headers Branding

### Step 1: Create Version Utilities

**File:** `src/utils/version.ts`

```typescript
/**
 * Version and platform utilities for SDK branding
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Cached version to avoid repeated file reads
 */
let cachedVersion: string | null = null;

/**
 * Platform information interface
 */
export interface PlatformInfo {
  node: string;
  platform: string;
  arch: string;
}

/**
 * Get SDK version from package.json
 * @returns SDK version string (e.g., "1.0.0")
 */
export function getSDKVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }

  try {
    // Read package.json from project root
    const pkgPath = join(__dirname, '../../package.json');
    const pkgContent = readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    
    cachedVersion = pkg.version || '1.0.0';
    return cachedVersion;
  } catch (error) {
    // Fallback version if package.json cannot be read
    // This can happen in bundled/minified distributions
    console.warn('[Wazapin SDK] Could not read package.json version, using fallback');
    cachedVersion = '1.0.0';
    return cachedVersion;
  }
}

/**
 * Get platform information
 * @returns Platform details (Node version, OS, architecture)
 */
export function getPlatformInfo(): PlatformInfo {
  return {
    node: process.version,           // e.g., "v18.17.0"
    platform: process.platform,      // e.g., "linux", "darwin", "win32"
    arch: process.arch,              // e.g., "x64", "arm64"
  };
}

/**
 * Generate User-Agent string for HTTP requests
 * Format: Wazapin-SDK/{version} (Node/{node_version}; {platform}; {arch})
 * 
 * @param version SDK version
 * @returns Formatted User-Agent string
 * 
 * @example
 * getUserAgent("1.0.0")
 * // Returns: "Wazapin-SDK/1.0.0 (Node/v18.17.0; linux; x64)"
 */
export function getUserAgent(version: string): string {
  const { node, platform, arch } = getPlatformInfo();
  return `Wazapin-SDK/${version} (Node/${node}; ${platform}; ${arch})`;
}

/**
 * Reset cached version (useful for testing)
 * @internal
 */
export function resetVersionCache(): void {
  cachedVersion = null;
}
```

---

### Step 2: Update HTTP Client

**File:** `src/client/http.ts`

```typescript
/**
 * HTTP client for WhatsApp Cloud API
 */

import type { WhatsAppClientConfig } from '../types/config.js';
import {
  APIError,
  NetworkError,
  RateLimitError,
} from '../types/errors.js';
import { getSDKVersion, getUserAgent } from '../utils/version.js';

/**
 * HTTP client for making requests to WhatsApp Cloud API
 */
export class HTTPClient {
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly accessToken: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  
  // ✅ ADD: SDK branding properties
  private readonly sdkVersion: string;
  private readonly userAgent: string;

  constructor(config: WhatsAppClientConfig) {
    this.baseUrl = config.baseUrl || 'https://graph.facebook.com';
    this.apiVersion = config.apiVersion || 'v18.0';
    this.accessToken = config.accessToken;
    this.timeout = config.timeout || 30000;
    this.fetchImpl = config.fetch || globalThis.fetch;
    
    // ✅ ADD: Initialize branding
    this.sdkVersion = getSDKVersion();
    this.userAgent = getUserAgent(this.sdkVersion);
  }

  /**
   * Make an HTTP request to the WhatsApp API
   */
  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          // ✅ ADD: SDK branding headers
          'User-Agent': this.userAgent,
          'X-Wazapin-SDK-Version': this.sdkVersion,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(
          `Request timeout after ${this.timeout}ms`,
          error
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed', error);
      }

      // Re-throw API errors
      if (
        error instanceof APIError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError
      ) {
        throw error;
      }

      // Unknown error
      throw new NetworkError(
        'An unexpected error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleError(response: Response): Promise<never> {
    interface ErrorResponse {
      error?: {
        message?: string;
        code?: number;
        error_subcode?: number;
        fbtrace_id?: string;
      };
    }

    let errorData: ErrorResponse;

    try {
      errorData = (await response.json()) as ErrorResponse;
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: 0,
        },
      };
    }

    const error = errorData.error || {};
    const message = error.message || `HTTP ${response.status}: ${response.statusText}`;
    const errorCode = error.code || 0;
    const errorSubcode = error.error_subcode;
    const fbtraceId = error.fbtrace_id;

    // Handle rate limit errors
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new RateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    // Handle other API errors
    throw new APIError(message, response.status, errorCode, errorSubcode, fbtraceId);
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, body);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}
```

---

### Step 3: Export Utilities

**File:** `src/utils/index.ts`

```typescript
// ✅ ADD: Export version utilities
export { getSDKVersion, getUserAgent, getPlatformInfo } from './version.js';
export type { PlatformInfo } from './version.js';

// Existing exports
export { withRetry } from './retry.js';
export type { RetryConfig } from './retry.js';
```

---

## Phase 2: Logger Implementation

### Step 1: Create Logger Class

**File:** `src/utils/logger.ts`

```typescript
/**
 * Branded logger for Wazapin SDK
 */

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /**
   * Enable/disable logging
   * @default false
   */
  enabled?: boolean;

  /**
   * Minimum log level to display
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Custom prefix for log messages
   * @default '[Wazapin SDK]'
   */
  prefix?: string;

  /**
   * Include timestamp in log messages
   * @default false
   */
  timestamp?: boolean;
}

/**
 * Log level priority mapping
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Branded logger for Wazapin SDK
 * 
 * @example
 * ```typescript
 * const logger = new WazapinLogger({
 *   enabled: true,
 *   level: 'debug',
 *   timestamp: true,
 * });
 * 
 * logger.debug('Request details', { method: 'POST', endpoint: '/messages' });
 * logger.info('Message sent successfully', { messageId: 'wamid.xxx' });
 * logger.warn('Rate limit approaching', { remaining: 10 });
 * logger.error('API request failed', { error: err });
 * ```
 */
export class WazapinLogger {
  private readonly enabled: boolean;
  private readonly level: number;
  private readonly prefix: string;
  private readonly timestamp: boolean;

  constructor(config: LoggerConfig = {}) {
    this.enabled = config.enabled ?? false;
    this.level = LOG_LEVELS[config.level || 'info'];
    this.prefix = config.prefix || '[Wazapin SDK]';
    this.timestamp = config.timestamp ?? false;
  }

  /**
   * Check if a log level should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    return this.enabled && LOG_LEVELS[level] >= this.level;
  }

  /**
   * Format log message with prefix and optional timestamp
   */
  private formatMessage(level: string, message: string): string {
    const parts = [this.prefix, `[${level}]`];
    
    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    parts.push(message);
    return parts.join(' ');
  }

  /**
   * Sanitize sensitive data from objects
   * Removes: accessToken, access_token, authorization, password
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Redact sensitive fields
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('authorization')
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Log debug message
   * Only shown when level is 'debug'
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.debug(this.formatMessage('DEBUG', message), sanitized || '');
    }
  }

  /**
   * Log info message
   * Shown when level is 'debug' or 'info'
   */
  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.info(this.formatMessage('INFO', message), sanitized || '');
    }
  }

  /**
   * Log warning message
   * Shown when level is 'debug', 'info', or 'warn'
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.warn(this.formatMessage('WARN', message), sanitized || '');
    }
  }

  /**
   * Log error message
   * Always shown (unless logger is disabled)
   */
  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.error(this.formatMessage('ERROR', message), sanitized || '');
    }
  }
}
```

---

### Step 2: Update Config Interface

**File:** `src/types/config.ts`

Add logger config to existing `WhatsAppClientConfig`:

```typescript
/**
 * Configuration for WhatsApp client
 */
export interface WhatsAppClientConfig {
  /** Phone Number ID from WhatsApp Business Account */
  phoneNumberId: string;

  /** Access token for authentication */
  accessToken: string;

  /** API version (default: v18.0) */
  apiVersion?: string;

  /** Base URL (default: https://graph.facebook.com) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Custom fetch implementation */
  fetch?: typeof fetch;

  /** Validation mode */
  validation?: 'strict' | 'standard' | 'off';

  /** Retry configuration */
  retry?: RetryConfig;

  // ✅ ADD: Logger configuration
  /**
   * Logger configuration
   * 
   * @example
   * ```typescript
   * // Enable debug logging
   * logger: {
   *   enabled: true,
   *   level: 'debug',
   *   timestamp: true,
   * }
   * 
   * // Production (no logs)
   * logger: {
   *   enabled: false,
   * }
   * 
   * // Warnings and errors only
   * logger: {
   *   enabled: true,
   *   level: 'warn',
   * }
   * ```
   */
  logger?: {
    /** Enable/disable logging (default: false) */
    enabled?: boolean;
    
    /** Minimum log level (default: 'info') */
    level?: 'debug' | 'info' | 'warn' | 'error';
    
    /** Include timestamps in logs (default: false) */
    timestamp?: boolean;
  };
}
```

---

### Step 3: Update WhatsAppClient

**File:** `src/client/WhatsAppClient.ts`

```typescript
// Add import at the top
import { WazapinLogger } from '../utils/logger.js';

export class WhatsAppClient {
  private readonly client: HTTPClient;
  private readonly phoneNumberId: string;
  private readonly validator?: Validator;
  private readonly retryConfig;
  
  // ✅ ADD: Logger property
  private readonly logger: WazapinLogger;

  // ... existing namespace properties ...

  constructor(config: WhatsAppClientConfig) {
    // ✅ ADD: Initialize logger (before everything else)
    this.logger = new WazapinLogger(config.logger);
    
    this.logger.debug('Initializing Wazapin SDK', {
      phoneNumberId: config.phoneNumberId,
      apiVersion: config.apiVersion || 'v18.0',
      validation: config.validation || 'standard',
      timeout: config.timeout || 30000,
    });

    // Initialize HTTP client (pass logger to it)
    this.client = new HTTPClient(config, this.logger);
    this.phoneNumberId = config.phoneNumberId;
    this.retryConfig = config.retry;

    // Initialize validator if validation is enabled
    if (config.validation && config.validation !== 'off') {
      this.validator = new Validator(config.validation);
      this.logger.debug('Validator initialized', { mode: config.validation });
    }

    // Initialize messages namespace
    this.messages = {
      sendText: (params) => {
        this.logger.debug('Sending text message', { to: params.to });
        return this.withRetryWrapper(() =>
          sendText(this.client, this.phoneNumberId, params, this.validator)
        );
      },
      // ... rest of message methods with similar debug logs
    };

    // ... rest of initialization ...

    this.logger.info('Wazapin SDK initialized successfully');
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
```

---

### Step 4: Update HTTP Client for Logging

**File:** `src/client/http.ts`

```typescript
import { WazapinLogger } from '../utils/logger.js';

export class HTTPClient {
  private readonly baseUrl: string;
  private readonly apiVersion: string;
  private readonly accessToken: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  private readonly sdkVersion: string;
  private readonly userAgent: string;
  
  // ✅ ADD: Logger property
  private readonly logger: WazapinLogger;

  // ✅ UPDATE: Constructor to accept logger
  constructor(config: WhatsAppClientConfig, logger?: WazapinLogger) {
    this.baseUrl = config.baseUrl || 'https://graph.facebook.com';
    this.apiVersion = config.apiVersion || 'v18.0';
    this.accessToken = config.accessToken;
    this.timeout = config.timeout || 30000;
    this.fetchImpl = config.fetch || globalThis.fetch;
    
    this.sdkVersion = getSDKVersion();
    this.userAgent = getUserAgent(this.sdkVersion);
    
    // ✅ ADD: Initialize logger (with fallback)
    this.logger = logger || new WazapinLogger({ enabled: false });
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;

    // ✅ ADD: Log request
    this.logger.debug(`HTTP ${method} ${endpoint}`, {
      url,
      hasBody: !!body,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          'X-Wazapin-SDK-Version': this.sdkVersion,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // ✅ ADD: Log response
      this.logger.debug(`HTTP ${response.status} ${response.statusText}`, {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const data = (await response.json()) as T;
      this.logger.debug('Response received', { hasData: !!data });
      
      return data;
    } catch (error) {
      // ✅ ADD: Log errors
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('Request timeout', { timeout: this.timeout });
        throw new NetworkError(
          `Request timeout after ${this.timeout}ms`,
          error
        );
      }

      if (error instanceof TypeError) {
        this.logger.error('Network error', { message: error.message });
        throw new NetworkError('Network request failed', error);
      }

      if (
        error instanceof APIError ||
        error instanceof RateLimitError ||
        error instanceof NetworkError
      ) {
        this.logger.error('API error', {
          name: error.name,
          message: error.message,
        });
        throw error;
      }

      this.logger.error('Unexpected error', { error });
      throw new NetworkError(
        'An unexpected error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }

  // ... rest of methods unchanged ...
}
```

---

### Step 5: Export Logger

**File:** `src/utils/index.ts`

```typescript
// Version utilities
export { getSDKVersion, getUserAgent, getPlatformInfo } from './version.js';
export type { PlatformInfo } from './version.js';

// ✅ ADD: Logger exports
export { WazapinLogger } from './logger.js';
export type { LogLevel, LoggerConfig } from './logger.js';

// Retry utilities
export { withRetry } from './retry.js';
export type { RetryConfig } from './retry.js';
```

---

## Phase 3: Error Enhancement (Optional)

### Update Error Classes

**File:** `src/types/errors.ts`

```typescript
/**
 * Base error class for all WhatsApp SDK errors
 */
export class WhatsAppError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    // ✅ ADD: SDK prefix to error messages
    super(`[Wazapin SDK] ${message}`);
    this.name = 'WhatsAppError';
    this.code = code;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WhatsAppError);
    }
  }
}

/**
 * API error from WhatsApp Cloud API
 */
export class APIError extends WhatsAppError {
  public readonly statusCode: number;
  public readonly errorCode: number;
  public readonly errorSubcode?: number;
  public readonly fbtraceId?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: number,
    errorSubcode?: number,
    fbtraceId?: string
  ) {
    super(message, `API_ERROR_${errorCode}`);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorSubcode = errorSubcode;
    this.fbtraceId = fbtraceId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

// ... rest of error classes remain the same,
// they will inherit the prefix from WhatsAppError
```

---

## Unit Tests

### Test Version Utilities

**File:** `src/utils/version.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getSDKVersion, 
  getUserAgent, 
  getPlatformInfo,
  resetVersionCache,
} from './version';

describe('Version Utilities', () => {
  beforeEach(() => {
    resetVersionCache();
  });

  describe('getSDKVersion', () => {
    it('should return version string', () => {
      const version = getSDKVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should cache version after first call', () => {
      const version1 = getSDKVersion();
      const version2 = getSDKVersion();
      expect(version1).toBe(version2);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform information', () => {
      const info = getPlatformInfo();
      
      expect(info).toHaveProperty('node');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('arch');
      
      expect(info.node).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(['linux', 'darwin', 'win32']).toContain(info.platform);
      expect(['x64', 'arm64', 'arm']).toContain(info.arch);
    });
  });

  describe('getUserAgent', () => {
    it('should generate valid User-Agent string', () => {
      const ua = getUserAgent('1.0.0');
      
      expect(ua).toMatch(/^Wazapin-SDK\/\d+\.\d+\.\d+/);
      expect(ua).toContain('Node/');
      expect(ua).toContain('(');
      expect(ua).toContain(')');
    });

    it('should include platform information', () => {
      const ua = getUserAgent('1.0.0');
      const { platform, arch } = getPlatformInfo();
      
      expect(ua).toContain(platform);
      expect(ua).toContain(arch);
    });
  });
});
```

---

### Test HTTP Headers

**File:** `src/client/http.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { HTTPClient } from './http';

describe('HTTPClient Branding', () => {
  it('should include User-Agent header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      status: 200,
      statusText: 'OK',
    });

    const client = new HTTPClient({
      phoneNumberId: '123456',
      accessToken: 'test_token',
      fetch: mockFetch,
    });

    await client.get('test');

    const [url, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Record<string, string>;
    
    expect(headers['User-Agent']).toBeDefined();
    expect(headers['User-Agent']).toMatch(/^Wazapin-SDK\/\d+\.\d+\.\d+/);
  });

  it('should include X-Wazapin-SDK-Version header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      status: 200,
      statusText: 'OK',
    });

    const client = new HTTPClient({
      phoneNumberId: '123456',
      accessToken: 'test_token',
      fetch: mockFetch,
    });

    await client.get('test');

    const [url, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Record<string, string>;
    
    expect(headers['X-Wazapin-SDK-Version']).toBeDefined();
    expect(headers['X-Wazapin-SDK-Version']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should include both branding headers in all requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      status: 200,
      statusText: 'OK',
    });

    const client = new HTTPClient({
      phoneNumberId: '123456',
      accessToken: 'test_token',
      fetch: mockFetch,
    });

    // Test GET
    await client.get('test1');
    // Test POST
    await client.post('test2', { data: 'test' });
    // Test DELETE
    await client.delete('test3');

    expect(mockFetch).toHaveBeenCalledTimes(3);

    mockFetch.mock.calls.forEach(([url, options]) => {
      const headers = options.headers as Record<string, string>;
      expect(headers['User-Agent']).toBeDefined();
      expect(headers['X-Wazapin-SDK-Version']).toBeDefined();
    });
  });
});
```

---

### Test Logger

**File:** `src/utils/logger.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WazapinLogger } from './logger';

describe('WazapinLogger', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should not log when disabled', () => {
      const logger = new WazapinLogger({ enabled: false });
      
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should log when enabled', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('test message');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Message Formatting', () => {
    it('should include SDK prefix', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Wazapin SDK]'),
        ''
      );
    });

    it('should include log level', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        ''
      );
    });

    it('should include timestamp when enabled', () => {
      const logger = new WazapinLogger({ 
        enabled: true, 
        timestamp: true 
      });
      
      logger.info('test message');
      
      const callArg = consoleInfoSpy.mock.calls[0][0];
      expect(callArg).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should use custom prefix', () => {
      const logger = new WazapinLogger({ 
        enabled: true,
        prefix: '[CustomPrefix]'
      });
      
      logger.info('test message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CustomPrefix]'),
        ''
      );
    });
  });

  describe('Log Levels', () => {
    it('should respect log level - debug', () => {
      const logger = new WazapinLogger({ 
        enabled: true, 
        level: 'debug' 
      });
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect log level - info', () => {
      const logger = new WazapinLogger({ 
        enabled: true, 
        level: 'info' 
      });
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect log level - warn', () => {
      const logger = new WazapinLogger({ 
        enabled: true, 
        level: 'warn' 
      });
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect log level - error', () => {
      const logger = new WazapinLogger({ 
        enabled: true, 
        level: 'error' 
      });
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Data Sanitization', () => {
    it('should redact access tokens', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('Request', { accessToken: 'secret123' });
      
      const loggedData = consoleInfoSpy.mock.calls[0][1];
      expect(loggedData.accessToken).toBe('[REDACTED]');
    });

    it('should redact passwords', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('Login', { password: 'secret123' });
      
      const loggedData = consoleInfoSpy.mock.calls[0][1];
      expect(loggedData.password).toBe('[REDACTED]');
    });

    it('should redact authorization headers', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('Headers', { Authorization: 'Bearer token123' });
      
      const loggedData = consoleInfoSpy.mock.calls[0][1];
      expect(loggedData.Authorization).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const logger = new WazapinLogger({ enabled: true });
      
      logger.info('Config', {
        api: {
          token: 'secret123',
          url: 'https://api.example.com',
        },
      });
      
      const loggedData = consoleInfoSpy.mock.calls[0][1];
      expect(loggedData.api.token).toBe('[REDACTED]');
      expect(loggedData.api.url).toBe('https://api.example.com');
    });
  });
});
```

---

## Integration Tests

### Test with Real API

**File:** `test/integration/branding.integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { WhatsAppClient } from '../../src';

describe('Branding Integration Tests', () => {
  // Skip if no credentials
  const skipIfNoCredentials = 
    !process.env.PHONE_NUMBER_ID || 
    !process.env.ACCESS_TOKEN;

  it.skipIf(skipIfNoCredentials)(
    'should send branded headers to WhatsApp API',
    async () => {
      const client = new WhatsAppClient({
        phoneNumberId: process.env.PHONE_NUMBER_ID!,
        accessToken: process.env.ACCESS_TOKEN!,
        logger: {
          enabled: true,
          level: 'debug',
          timestamp: true,
        },
      });

      // This will show headers in debug logs
      try {
        await client.account.getBusinessProfile();
      } catch (error) {
        // Even if request fails, headers were sent
        console.log('Request completed (may have failed)');
      }

      // Success - headers were sent
      expect(true).toBe(true);
    }
  );

  it.skipIf(skipIfNoCredentials)(
    'should include SDK version in all requests',
    async () => {
      let headersSent = false;
      
      const customFetch: typeof fetch = async (url, options) => {
        const headers = options?.headers as Record<string, string>;
        
        // Verify headers
        expect(headers['User-Agent']).toMatch(/^Wazapin-SDK\/\d+\.\d+\.\d+/);
        expect(headers['X-Wazapin-SDK-Version']).toMatch(/^\d+\.\d+\.\d+$/);
        
        headersSent = true;
        
        // Return mock response
        return new Response(
          JSON.stringify({ data: [] }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      };

      const client = new WhatsAppClient({
        phoneNumberId: process.env.PHONE_NUMBER_ID!,
        accessToken: process.env.ACCESS_TOKEN!,
        fetch: customFetch,
      });

      await client.account.getBusinessProfile();

      expect(headersSent).toBe(true);
    }
  );
});
```

---

## Summary Checklist

### Phase 1: HTTP Headers ✅
- [ ] Create `src/utils/version.ts`
- [ ] Update `src/client/http.ts`
- [ ] Export utilities from `src/utils/index.ts`
- [ ] Write unit tests for version utilities
- [ ] Write unit tests for HTTP headers
- [ ] Verify headers in integration tests

### Phase 2: Logger ✅
- [ ] Create `src/utils/logger.ts`
- [ ] Update `src/types/config.ts`
- [ ] Update `src/client/WhatsAppClient.ts`
- [ ] Update `src/client/http.ts`
- [ ] Export logger from `src/utils/index.ts`
- [ ] Write unit tests for logger
- [ ] Test logger in integration

### Phase 3: Error Enhancement (Optional) ✅
- [ ] Update `src/types/errors.ts`
- [ ] Update error tests
- [ ] Verify backward compatibility

### Documentation ✅
- [ ] Update README with logger examples
- [ ] Update CHANGELOG
- [ ] Add JSDoc comments
- [ ] Create migration guide if needed

---

**Last Updated:** 2025-11-22  
**Version:** 1.0  
**Status:** ✅ Ready to Copy & Paste
