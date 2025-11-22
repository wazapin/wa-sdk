/**
 * Phone Number Management Types
 * @module types/phone-numbers
 */

/**
 * Quality rating of a phone number based on message delivery performance
 */
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'NA';

/**
 * Display name status for a phone number
 */
export type DisplayNameStatus =
  | 'APPROVED'
  | 'AVAILABLE_WITHOUT_REVIEW'
  | 'DECLINED'
  | 'EXPIRED'
  | 'PENDING_REVIEW'
  | 'NONE';

/**
 * Verification code delivery method
 */
export type VerificationMethod = 'SMS' | 'VOICE';

/**
 * Phone number details from WhatsApp Business API
 */
export interface PhoneNumberDetails {
  id: string;
  verified_name: string;
  display_phone_number: string;
  quality_rating: QualityRating;
  name_status?: DisplayNameStatus;
  code_verification_status?: string;
  is_official_business_account?: boolean;
  account_mode?: 'LIVE' | 'SANDBOX';
}

/**
 * Response for listing phone numbers
 */
export interface PhoneNumbersListResponse {
  data: PhoneNumberDetails[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}

/**
 * Parameters for requesting verification code
 */
export interface RequestVerificationCodeParams {
  /**
   * Method to receive verification code
   */
  code_method: VerificationMethod;
  /**
   * Locale for the verification message (e.g., "en_US")
   */
  locale: string;
}

/**
 * Parameters for verifying code
 */
export interface VerifyCodeParams {
  /**
   * The verification code received via SMS or VOICE
   */
  code: string;
}

/**
 * Parameters for setting two-step verification PIN
 */
export interface SetTwoStepPinParams {
  /**
   * 6-digit PIN for two-step verification
   */
  pin: string;
}

/**
 * Response for display name status query
 */
export interface DisplayNameStatusResponse {
  id: string;
  name_status: DisplayNameStatus;
}

/**
 * Parameters for filtering phone numbers (beta)
 */
export interface PhoneNumberFilterParams {
  /**
   * Specific fields to return
   */
  fields?: string[];
  /**
   * Filter criteria (e.g., account_mode)
   */
  filtering?: Array<{
    field: string;
    operator: 'EQUAL' | 'NOT_EQUAL';
    value: string;
  }>;
}
