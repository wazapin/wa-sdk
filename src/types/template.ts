/**
 * Template Management Types
 * @module types/template
 */

/**
 * Template status
 */
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'DISABLED';

/**
 * Template category
 */
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

/**
 * Template component type
 */
export type TemplateComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';

/**
 * Template header format
 */
export type TemplateHeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

/**
 * Template button type
 */
export type TemplateButtonType = 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL' | 'COPY_CODE' | 'OTP';

/**
 * Template component parameter
 */
export interface TemplateComponentParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link?: string;
    id?: string;
  };
  document?: {
    link?: string;
    id?: string;
    filename?: string;
  };
  video?: {
    link?: string;
    id?: string;
  };
}

/**
 * Template button
 */
export interface TemplateButton {
  type: TemplateButtonType;
  text: string;
  phone_number?: string;
  url?: string;
  example?: string[];
  otp_type?: 'COPY_CODE' | 'ONE_TAP';
  autofill_text?: string;
  package_name?: string;
  signature_hash?: string;
}

/**
 * Template component
 */
export interface TemplateComponent {
  type: TemplateComponentType;
  format?: TemplateHeaderFormat;
  text?: string;
  example?: {
    header_handle?: string[];
    header_text?: string[];
    body_text?: string[][];
  };
  buttons?: TemplateButton[];
}

/**
 * Template details
 */
export interface Template {
  id: string;
  name: string;
  language: string;
  status: TemplateStatus;
  category: TemplateCategory;
  components: TemplateComponent[];
  quality_score?: {
    score: string;
    date: string;
  };
  rejected_reason?: string;
  previous_category?: TemplateCategory;
}

/**
 * Template list response
 */
export interface TemplateListResponse {
  data: Template[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

/**
 * Template namespace response
 */
export interface TemplateNamespaceResponse {
  id: string;
  message_template_namespace: string;
}

/**
 * Create template parameters
 */
export interface CreateTemplateParams {
  name: string;
  language: string;
  category: TemplateCategory;
  components: TemplateComponent[];
  allow_category_change?: boolean;
}

/**
 * Create authentication template parameters
 */
export interface CreateAuthTemplateParams {
  name: string;
  language: string;
  /**
   * OTP button type: COPY_CODE or ONE_TAP
   */
  button_type: 'COPY_CODE' | 'ONE_TAP';
  /**
   * Security disclaimer text
   */
  security_disclaimer?: string;
  /**
   * Code expiration time in minutes (1-90)
   */
  code_expiration_minutes?: number;
  /**
   * For ONE_TAP: autofill button text
   */
  autofill_text?: string;
  /**
   * For ONE_TAP: Android package name
   */
  package_name?: string;
  /**
   * For ONE_TAP: Android app signature hash
   */
  signature_hash?: string;
}

/**
 * Create catalog template parameters
 */
export interface CreateCatalogTemplateParams {
  name: string;
  language: string;
  /**
   * Header text (optional)
   */
  header_text?: string;
  /**
   * Body text with placeholders
   */
  body_text: string;
  /**
   * Footer text (optional)
   */
  footer_text?: string;
  /**
   * Thumbnail product retailer ID (optional)
   */
  thumbnail_product_retailer_id?: string;
}

/**
 * Edit template parameters
 */
export interface EditTemplateParams {
  category?: TemplateCategory;
  components?: TemplateComponent[];
}

/**
 * Template create response
 */
export interface TemplateCreateResponse {
  id: string;
  status: TemplateStatus;
  category: TemplateCategory;
}
