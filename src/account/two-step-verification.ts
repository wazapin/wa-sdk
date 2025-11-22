/**
 * Two-Step Verification API
 * Manages two-step verification (2FA) PIN for phone numbers
 */

import type { HTTPClient } from '../client/http.js';
import type {
  SetTwoStepVerificationRequest,
  SetTwoStepVerificationResponse,
} from '../types/two-step-verification.js';

/**
 * Two-Step Verification API for WhatsApp phone numbers
 * 
 * Two-step verification adds an extra layer of security by requiring
 * a 6-digit PIN for certain operations like registration and name changes.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification
 */
export class TwoStepVerificationAPI {
  constructor(private readonly client: HTTPClient) {}

  /**
   * Set or update two-step verification PIN
   * 
   * This PIN is required for:
   * - Phone number registration
   * - Display name changes
   * - Account migration
   * 
   * **Important**: Store this PIN securely. If you lose it, you'll need
   * to contact WhatsApp support to reset it.
   * 
   * @param phoneNumberId - Phone number ID
   * @param pin - 6-digit PIN (must be exactly 6 digits)
   * @returns Success response
   * 
   * @example
   * ```typescript
   * // Set initial PIN
   * await client.twoStepVerification.setPin('123456789', '123456');
   * 
   * // Update existing PIN
   * await client.twoStepVerification.setPin('123456789', '654321');
   * ```
   * 
   * @throws {ValidationError} If PIN is not exactly 6 digits
   * @throws {APIError} If PIN update fails
   * 
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification
   */
  async setPin(
    phoneNumberId: string,
    pin: string
  ): Promise<SetTwoStepVerificationResponse> {
    // Validate PIN format
    if (!/^\d{6}$/.test(pin)) {
      throw new Error('PIN must be exactly 6 digits');
    }

    const body: SetTwoStepVerificationRequest = {
      pin,
    };

    return this.client.post<SetTwoStepVerificationResponse>(
      `${phoneNumberId}`,
      body
    );
  }

  /**
   * Change two-step verification PIN
   * 
   * Alias for setPin() - updates the existing PIN with a new one.
   * You don't need the old PIN to set a new one.
   * 
   * @param phoneNumberId - Phone number ID
   * @param newPin - New 6-digit PIN
   * @returns Success response
   * 
   * @example
   * ```typescript
   * await client.twoStepVerification.changePin('123456789', '999888');
   * ```
   * 
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification
   */
  async changePin(
    phoneNumberId: string,
    newPin: string
  ): Promise<SetTwoStepVerificationResponse> {
    return this.setPin(phoneNumberId, newPin);
  }
}
