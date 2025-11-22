/**
 * Tests for logger utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WazapinLogger, defaultLogger, type LogLevel } from './logger.js';

describe('WazapinLogger', () => {
  describe('Log Levels', () => {
    it('should respect debug level (log everything)', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'debug', handler: mockHandler });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockHandler.debug).toHaveBeenCalledTimes(1);
      expect(mockHandler.info).toHaveBeenCalledTimes(1);
      expect(mockHandler.warn).toHaveBeenCalledTimes(1);
      expect(mockHandler.error).toHaveBeenCalledTimes(1);
    });

    it('should respect info level (skip debug)', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockHandler.debug).not.toHaveBeenCalled();
      expect(mockHandler.info).toHaveBeenCalledTimes(1);
      expect(mockHandler.warn).toHaveBeenCalledTimes(1);
      expect(mockHandler.error).toHaveBeenCalledTimes(1);
    });

    it('should respect warn level (skip debug and info)', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'warn', handler: mockHandler });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockHandler.debug).not.toHaveBeenCalled();
      expect(mockHandler.info).not.toHaveBeenCalled();
      expect(mockHandler.warn).toHaveBeenCalledTimes(1);
      expect(mockHandler.error).toHaveBeenCalledTimes(1);
    });

    it('should respect error level (only errors)', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'error', handler: mockHandler });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockHandler.debug).not.toHaveBeenCalled();
      expect(mockHandler.info).not.toHaveBeenCalled();
      expect(mockHandler.warn).not.toHaveBeenCalled();
      expect(mockHandler.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Formatting', () => {
    it('should include branding prefix', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test message');

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[wazapin-wa]');
    });

    it('should include log level', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'debug', handler: mockHandler });

      logger.debug('Test');
      logger.info('Test');
      logger.warn('Test');
      logger.error('Test');

      expect(mockHandler.debug.mock.calls[0][0]).toContain('[DEBUG]');
      expect(mockHandler.info.mock.calls[0][0]).toContain('[INFO]');
      expect(mockHandler.warn.mock.calls[0][0]).toContain('[WARN]');
      expect(mockHandler.error.mock.calls[0][0]).toContain('[ERROR]');
    });

    it('should include message', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Custom test message');

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('Custom test message');
    });

    it('should include timestamp when enabled', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', timestamp: true, handler: mockHandler });
      logger.info('Test');

      const call = mockHandler.info.mock.calls[0][0];
      // Should contain ISO timestamp pattern
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should not include timestamp when disabled', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', timestamp: false, handler: mockHandler });
      logger.info('Test');

      const call = mockHandler.info.mock.calls[0][0];
      // Should NOT contain timestamp pattern
      expect(call).not.toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });

    it('should format data as JSON when provided', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { key: 'value', number: 123 });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('"key"');
      expect(call).toContain('"value"');
      expect(call).toContain('123');
    });
  });

  describe('Sensitive Data Redaction', () => {
    it('should redact accessToken field', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { accessToken: 'secret123' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('secret123');
    });

    it('should redact access_token field (snake_case)', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { access_token: 'secret123' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('secret123');
    });

    it('should redact password field', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { password: 'mypass' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('mypass');
    });

    it('should redact secret field', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { secret: 'topsecret' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('topsecret');
    });

    it('should redact token field', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { token: 'mytoken' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('mytoken');
    });

    it('should redact apiKey field', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', { apiKey: 'key123' });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('key123');
    });

    it('should keep non-sensitive fields', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', {
        phoneNumberId: '123456',
        to: '+1234567890',
        message: 'Hello',
      });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('123456');
      expect(call).toContain('+1234567890');
      expect(call).toContain('Hello');
    });

    it('should handle nested objects', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', {
        config: {
          accessToken: 'secret',
          phoneNumberId: '123',
        },
      });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).toContain('123');
      expect(call).not.toContain('secret');
    });

    it('should handle arrays', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test', {
        tokens: [
          { accessToken: 'secret1', id: '1' },
          { accessToken: 'secret2', id: '2' },
        ],
      });

      const call = mockHandler.info.mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).toContain('"id"');
      expect(call).not.toContain('secret1');
      expect(call).not.toContain('secret2');
    });

    it('should handle Error objects', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'error', handler: mockHandler });
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const call = mockHandler.error.mock.calls[0][0];
      expect(call).toContain('Test error');
      expect(call).toContain('Error');
    });

    it('should handle null and undefined', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('Test null', null);
      logger.info('Test undefined', undefined);

      expect(mockHandler.info).toHaveBeenCalledTimes(2);
    });

    it('should handle primitives', () => {
      const mockHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'info', handler: mockHandler });
      logger.info('String', 'test');
      logger.info('Number', 123);
      logger.info('Boolean', true);

      expect(mockHandler.info).toHaveBeenCalledTimes(3);
    });
  });

  describe('Default Logger', () => {
    it('should create default logger instance', () => {
      expect(defaultLogger).toBeInstanceOf(WazapinLogger);
    });

    it('should use INFO level by default', () => {
      const consoleSpy = vi.spyOn(console, 'debug');
      defaultLogger.debug('Test');
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Custom Handler', () => {
    it('should use custom handler for all log levels', () => {
      const customHandler = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = new WazapinLogger({ level: 'debug', handler: customHandler });

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(customHandler.debug).toHaveBeenCalledTimes(1);
      expect(customHandler.info).toHaveBeenCalledTimes(1);
      expect(customHandler.warn).toHaveBeenCalledTimes(1);
      expect(customHandler.error).toHaveBeenCalledTimes(1);
    });
  });
});
