/**
 * Analytics Types
 * @module types/analytics
 */

/**
 * Analytics granularity/time period
 */
export type AnalyticsGranularity = 'DAILY' | 'MONTHLY';

/**
 * Analytics metric type
 */
export type AnalyticsMetricType =
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'CONVERSATION_START'
  | 'COST';

/**
 * Analytics parameters
 */
export interface AnalyticsParams {
  /**
   * Start date (UNIX timestamp or ISO 8601)
   */
  start: number | string;
  /**
   * End date (UNIX timestamp or ISO 8601)
   */
  end: number | string;
  /**
   * Granularity: DAILY or MONTHLY
   */
  granularity?: AnalyticsGranularity;
  /**
   * Phone numbers to filter (optional)
   */
  phone_numbers?: string[];
  /**
   * Product types to filter (optional)
   */
  product_types?: string[];
  /**
   * Countries to filter (optional)
   */
  country_codes?: string[];
}

/**
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  /**
   * Start timestamp of data point
   */
  start: number;
  /**
   * End timestamp of data point
   */
  end: number;
  /**
   * Metric value
   */
  sent?: number;
  delivered?: number;
  read?: number;
  conversation_start?: number;
  cost?: number;
  /**
   * Analytics category/dimension (if applicable)
   */
  conversation_type?: string;
  conversation_direction?: string;
  country?: string;
}

/**
 * Analytics response
 */
export interface AnalyticsData {
  data: AnalyticsDataPoint[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
  };
}
