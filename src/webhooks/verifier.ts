/**
 * Webhook signature verification functionality
 */

/**
 * Verify webhook signature using HMAC SHA256
 *
 * @param payload - Raw webhook payload (as string)
 * @param signature - Signature from X-Hub-Signature-256 header
 * @param appSecret - WhatsApp app secret
 * @returns True if signature is valid, false otherwise
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  appSecret: string
): Promise<boolean> {
  try {
    // Remove 'sha256=' prefix if present
    const signatureHash = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature;

    // Compute HMAC SHA256
    const expectedSignature = await computeHmacSha256(payload, appSecret);

    // Compare signatures (constant-time comparison to prevent timing attacks)
    return constantTimeCompare(signatureHash, expectedSignature);
  } catch (error) {
    // If any error occurs during verification, consider it invalid
    return false;
  }
}

/**
 * Compute HMAC SHA256 hash
 */
async function computeHmacSha256(data: string, secret: string): Promise<string> {
  // Check if we're in Node.js or browser environment
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    // Browser or modern Node.js with Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await globalThis.crypto.subtle.sign('HMAC', key, messageData);

    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } else {
    // Node.js with crypto module
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    return hmac.digest('hex');
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
