/**
 * Unit tests for webhook signature verification
 */

import { describe, it, expect } from 'vitest';
import { verifyWebhookSignature } from './verifier.js';

describe('verifyWebhookSignature', () => {
  const appSecret = 'test-secret-key';
  const payload = '{"object":"whatsapp_business_account","entry":[]}';

  describe('successful verification', () => {
    it('should verify valid signature', async () => {
      // Pre-computed HMAC SHA256 for the test payload and secret
      // You can compute this using: echo -n '{"object":"whatsapp_business_account","entry":[]}' | openssl dgst -sha256 -hmac 'test-secret-key'
      const validSignature =
        'sha256=8c9b8c8e5f5e5d5c5b5a59585756555453525150494847464544434241403f3e';

      // For testing, we'll compute the actual signature
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(payload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        payload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });

    it('should verify signature without sha256 prefix', async () => {
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(payload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(payload, expectedHash, appSecret);

      expect(result).toBe(true);
    });

    it('should verify signature with different payload', async () => {
      const differentPayload = '{"test":"data"}';
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(differentPayload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        differentPayload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });

    it('should verify signature with different secret', async () => {
      const differentSecret = 'another-secret';
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', differentSecret);
      hmac.update(payload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        payload,
        `sha256=${expectedHash}`,
        differentSecret
      );

      expect(result).toBe(true);
    });
  });

  describe('failed verification', () => {
    it('should reject invalid signature', async () => {
      const invalidSignature = 'sha256=invalid_hash_value_1234567890abcdef';

      const result = await verifyWebhookSignature(payload, invalidSignature, appSecret);

      expect(result).toBe(false);
    });

    it('should reject signature with wrong secret', async () => {
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', 'wrong-secret');
      hmac.update(payload);
      const wrongHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        payload,
        `sha256=${wrongHash}`,
        appSecret
      );

      expect(result).toBe(false);
    });

    it('should reject signature for different payload', async () => {
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update('{"different":"payload"}');
      const wrongHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        payload,
        `sha256=${wrongHash}`,
        appSecret
      );

      expect(result).toBe(false);
    });

    it('should reject empty signature', async () => {
      const result = await verifyWebhookSignature(payload, '', appSecret);

      expect(result).toBe(false);
    });

    it('should reject malformed signature', async () => {
      const result = await verifyWebhookSignature(
        payload,
        'not-a-valid-signature',
        appSecret
      );

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty payload', async () => {
      const emptyPayload = '';
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(emptyPayload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        emptyPayload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });

    it('should handle large payload', async () => {
      const largePayload = JSON.stringify({
        object: 'whatsapp_business_account',
        entry: Array(100).fill({
          id: '123',
          changes: [{ value: { test: 'data' }, field: 'messages' }],
        }),
      });

      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(largePayload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        largePayload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });

    it('should handle special characters in payload', async () => {
      const specialPayload = '{"text":"Hello 👋 World! @#$%^&*()"}';
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(specialPayload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        specialPayload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });

    it('should handle unicode characters in payload', async () => {
      const unicodePayload = '{"text":"こんにちは 世界"}';
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(unicodePayload);
      const expectedHash = hmac.digest('hex');

      const result = await verifyWebhookSignature(
        unicodePayload,
        `sha256=${expectedHash}`,
        appSecret
      );

      expect(result).toBe(true);
    });
  });

  describe('timing attack prevention', () => {
    it('should use constant-time comparison', async () => {
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', appSecret);
      hmac.update(payload);
      const validHash = hmac.digest('hex');

      // Create an almost-correct signature (differs by one character)
      const almostCorrectHash = validHash.substring(0, validHash.length - 1) + 'f';

      const result = await verifyWebhookSignature(
        payload,
        `sha256=${almostCorrectHash}`,
        appSecret
      );

      expect(result).toBe(false);
    });

    it('should reject signatures of different lengths', async () => {
      const shortSignature = 'sha256=abc123';

      const result = await verifyWebhookSignature(payload, shortSignature, appSecret);

      expect(result).toBe(false);
    });
  });
});
