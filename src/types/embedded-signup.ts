/**
 * Embedded Signup API types
 * 
 * Types for WhatsApp Embedded Signup flow to onboard businesses
 * 
 * @see https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

/**
 * OAuth token debug response
 * 
 * Contains information about the OAuth token returned from embedded signup flow
 */
export interface DebugTokenResponse {
  data: {
    /** App ID that the token belongs to */
    app_id: string;
    /** Token type (always USER for embedded signup) */
    type: 'USER';
    /** Application name */
    application: string;
    /** Unix timestamp when data access expires */
    data_access_expires_at: number;
    /** Unix timestamp when token expires */
    expires_at: number;
    /** Whether the token is currently valid */
    is_valid: boolean;
    /** List of permission scopes granted */
    scopes: string[];
    /** Granular scopes with specific target IDs (WABAs) */
    granular_scopes: Array<{
      /** Permission scope (e.g., whatsapp_business_management) */
      scope: string;
      /** Array of WABA IDs that were shared */
      target_ids: string[];
    }>;
    /** User ID that authorized the token */
    user_id: string;
  };
}

/**
 * Shared WABA (WhatsApp Business Account) item
 */
export interface SharedWABA {
  /** WABA ID */
  id: string;
  /** WABA display name */
  name: string;
  /** Currency code (e.g., USD, EUR) */
  currency: string;
  /** Timezone ID */
  timezone_id: string;
  /** Message template namespace for this WABA */
  message_template_namespace: string;
}

/**
 * Response for listing WABAs
 */
export interface SharedWABAsResponse {
  /** Array of WABA objects */
  data: SharedWABA[];
  /** Pagination cursors if more results available */
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * Detailed WABA information
 */
export interface WABAInfo {
  /** WABA ID */
  id: string;
  /** WABA display name */
  name?: string;
  /** Currency code */
  currency?: string;
  /** Timezone ID */
  timezone_id?: string;
  /** Message template namespace */
  message_template_namespace?: string;
  /** Review status of the WABA */
  account_review_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  /** Primary payment method ID */
  primary_funding_id?: string;
  /** Purchase order number for billing */
  purchase_order_number?: string;
  /** Information about the business that owns this WABA */
  owner_business_info?: {
    /** Business name */
    name: string;
    /** Business ID */
    id: string;
  };
  /** Information about On Behalf Of relationships */
  on_behalf_of_business_info?: {
    /** Business name */
    name: string;
    /** Business ID */
    id: string;
    /** Relationship status */
    status: string;
    /** Relationship type */
    type: string;
  };
}

/**
 * Options for filtering and sorting WABAs
 */
export interface FilterWABAOptions {
  /** Filter by creation time */
  filtering?: Array<{
    /** Field to filter on */
    field: 'creation_time';
    /** Comparison operator */
    operator: 'LESS_THAN' | 'GREATER_THAN';
    /** Unix timestamp value */
    value: string;
  }>;
  /** Sort order for results */
  sort?: 'creation_time_ascending' | 'creation_time_descending';
}

/**
 * System user in a business
 */
export interface SystemUser {
  /** System user ID */
  id: string;
  /** System user name */
  name: string;
  /** System user role */
  role: string;
}

/**
 * Response for listing system users
 */
export interface SystemUsersResponse {
  /** Array of system users */
  data: SystemUser[];
  /** Pagination cursors */
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * User assigned to a WABA
 */
export interface AssignedUser {
  /** User ID */
  id: string;
  /** User name (optional) */
  name?: string;
  /** Array of permission tasks */
  tasks: string[];
}

/**
 * Response for listing assigned users
 */
export interface AssignedUsersResponse {
  /** Array of assigned users */
  data: AssignedUser[];
  /** Pagination cursors */
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * Parameters for adding a system user to a WABA
 */
export interface AddSystemUserParams {
  /** System user ID to add */
  user: string;
  /** Array of permission tasks (MANAGE or DEVELOP) */
  tasks: ('MANAGE' | 'DEVELOP')[];
}

/**
 * Extended credit (credit line) for billing
 */
export interface ExtendedCredit {
  /** Credit line ID */
  id: string;
  /** Legal entity name associated with credit line */
  legal_entity_name: string;
  /** Available credit in cents (optional) */
  credit_available?: number;
  /** Current balance in cents (optional) */
  balance?: number;
  /** Currency code (optional) */
  currency?: string;
}

/**
 * Response for listing extended credits
 */
export interface ExtendedCreditsListResponse {
  /** Array of extended credits */
  data: ExtendedCredit[];
  /** Pagination cursors */
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

/**
 * Parameters for attaching credit line to WABA
 */
export interface AttachCreditLineParams {
  /** Client WABA ID to attach credit to */
  waba_id: string;
  /** Currency code for the WABA (e.g., USD, EUR) */
  waba_currency: string;
}

/**
 * Response when attaching credit line to WABA
 */
export interface AllocationConfigResponse {
  /** Allocation config ID (credit sharing record ID) */
  allocation_config_id: string;
  /** WABA ID that credit was attached to */
  waba_id: string;
}

/**
 * Credit sharing record details
 */
export interface CreditSharingRecord {
  /** Allocation config ID */
  id: string;
  /** Business receiving the credit */
  receiving_business?: {
    /** Business name */
    name: string;
    /** Business ID */
    id: string;
  };
  /** Status of the credit sharing request */
  request_status?: 'ACTIVE' | 'DELETED';
  /** Receiving credential details */
  receiving_credential?: {
    /** WABA ID */
    id: string;
  };
}

/**
 * Parameters for overriding callback URL for a WABA
 */
export interface OverrideCallbackParams {
  /** Alternate webhook endpoint URL */
  override_callback_uri: string;
  /** Verification token for the alternate endpoint */
  verify_token: string;
}

/**
 * WABA subscription (webhook subscription) details
 */
export interface WABASubscription {
  /** Alternate callback URI if set */
  override_callback_uri?: string;
  /** WhatsApp Business API data */
  whatsapp_business_api_data: {
    /** App ID */
    id: string;
    /** App link */
    link: string;
    /** App name */
    name: string;
  };
}

/**
 * Response for listing WABA subscriptions
 */
export interface SubscriptionsResponse {
  /** Array of subscriptions */
  data: WABASubscription[];
}

/**
 * Phone number filter options
 */
export interface PhoneNumberFilterOptions {
  /** Array of fields to return */
  fields?: string[];
  /** Filter parameters */
  filtering?: Array<{
    /** Field to filter on (e.g., account_mode) */
    field: 'account_mode';
    /** Comparison operator */
    operator: 'EQUAL';
    /** Value to filter by (SANDBOX or LIVE) */
    value: 'SANDBOX' | 'LIVE';
  }>;
}

/**
 * Phone number certificate and status
 */
export interface PhoneNumberCertificate {
  /** Phone number ID */
  id: string;
  /** Display phone number */
  display_phone_number: string;
  /** Current display name certificate */
  certificate?: string;
  /** New certificate after display name change */
  new_certificate?: string;
  /** Display name review status */
  name_status?: 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'PENDING_REVIEW' | 'NONE';
  /** New display name review status */
  new_name_status?: 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'PENDING_REVIEW' | 'NONE';
}

/**
 * Template namespace response
 */
export interface TemplateNamespaceResponse {
  /** WABA ID */
  id: string;
  /** Message template namespace */
  message_template_namespace: string;
}
