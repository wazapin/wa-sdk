/**
 * Registration Management
 * Register and deregister phone numbers with WhatsApp Business API
 * @module account/registration
 */

import type { HTTPClient } from '../client/http.js';
import type { RegisterPhoneParams, RegistrationResponse } from '../types/registration.js';

/**
 * Registration API
 * Provides methods to register and deregister phone numbers
 */
export class RegistrationAPI {
  constructor(
    private httpClient: HTTPClient,
    private phoneNumberId: string,
  ) {}

  /**
   * Register a phone number with WhatsApp Business API
   * 
   * Registration is required in the following scenarios:
   * - Account Creation: When implementing the API, you need to register the phone number
   * - Name Change: After getting a name change approved, you need to register again
   * 
   * Note: You must verify phone ownership before registration using SMS or voice code
   * See: https://developers.facebook.com/docs/whatsapp/business-management-api/guides/migrate-phone-to-different-waba#step-2--verify-phone-ownership
   * 
   * Important: Embedded Signup users must register within 14 days after signup
   * 
   * @param params - Registration parameters including PIN
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/registration#register-phone
   */
  async registerPhone(
    params: RegisterPhoneParams,
    phoneNumberId?: string,
  ): Promise<RegistrationResponse> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.post<RegistrationResponse>(`${id}/register`, params);
  }

  /**
   * Deregister a phone number from WhatsApp Business API
   * 
   * Use this when you want to:
   * - Move to the On-Premises API
   * - Use your phone number in the regular WhatsApp customer app
   * 
   * You can always re-register your phone with Cloud API later by repeating
   * the registration process
   * 
   * @param phoneNumberId - Phone number ID (optional, uses client's phoneNumberId if not provided)
   * @returns Success response
   * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/registration#deregister-phone
   */
  async deregisterPhone(phoneNumberId?: string): Promise<RegistrationResponse> {
    const id = phoneNumberId || this.phoneNumberId;
    return this.httpClient.post<RegistrationResponse>(`${id}/deregister`);
  }
}
