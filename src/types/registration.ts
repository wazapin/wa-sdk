/**
 * Registration Management Types
 * @module types/registration
 */

/**
 * Parameters for registering a phone number
 */
export interface RegisterPhoneParams {
  /**
   * Messaging product (always "whatsapp")
   */
  messaging_product: 'whatsapp';
  /**
   * 6-digit PIN for two-step verification
   * This PIN will be required for future operations
   */
  pin: string;
}

/**
 * Response from registration operations
 */
export interface RegistrationResponse {
  /**
   * Indicates if the operation was successful
   */
  success: boolean;
}
