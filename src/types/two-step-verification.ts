/**
 * Two-Step Verification types
 * 
 * Two-step verification adds extra security to phone numbers by requiring
 * a 6-digit PIN for certain operations like registration and name changes.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/reference/two-step-verification
 */

/**
 * Request to set or update two-step verification PIN
 */
export interface SetTwoStepVerificationRequest {
  /**
   * 6-digit PIN for two-step verification
   * Must be exactly 6 digits
   */
  pin: string;
}

/**
 * Response from setting two-step verification
 */
export interface SetTwoStepVerificationResponse {
  /**
   * Success status
   */
  success: boolean;
}
