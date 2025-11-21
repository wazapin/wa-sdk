/**
 * Account and Business types for WhatsApp Business API
 */

/**
 * Messaging limit tiers for WhatsApp Business accounts
 * 
 * These tiers represent the maximum number of unique WhatsApp user phone numbers
 * your business can deliver messages to, outside of a customer service window,
 * within a moving 24-hour period.
 * 
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits
 */
export type MessagingLimitTier =
  | 'TIER_250'
  | 'TIER_2000'
  | 'TIER_10K'
  | 'TIER_100K'
  | 'TIER_UNLIMITED';

/**
 * Response from getting messaging limit
 * 
 * @see https://developers.facebook.com/docs/whatsapp/messaging-limits#via-api
 */
export interface MessagingLimitResponse {
  /**
   * Current messaging limit tier (v24.0+)
   * For v23.0 and older, use messaging_limit_tier field
   */
  whatsapp_business_manager_messaging_limit: MessagingLimitTier;
  
  /**
   * Business phone number ID
   */
  id: string;
}
