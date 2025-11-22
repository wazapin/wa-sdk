/**
 * Commerce Settings Types
 * @module types/commerce-settings
 */

/**
 * Commerce settings for WhatsApp Business Account
 */
export interface CommerceSettings {
  /**
   * Whether catalog is visible to customers
   */
  is_catalog_visible: boolean;
  /**
   * Whether shopping cart is enabled
   */
  is_cart_enabled: boolean;
}

/**
 * Parameters for updating commerce settings
 */
export interface UpdateCommerceSettingsParams {
  /**
   * Set catalog visibility
   */
  is_catalog_visible?: boolean;
  /**
   * Enable or disable shopping cart
   */
  is_cart_enabled?: boolean;
}

/**
 * Commerce settings response
 */
export interface CommerceSettingsResponse {
  data: CommerceSettings[];
}
