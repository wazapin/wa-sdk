/**
 * Interactive message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type {
  SendInteractiveButtonsParams,
  SendInteractiveListParams,
  SendInteractiveCarouselParams,
  SendInteractiveCTAParams,
} from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import {
  sendInteractiveButtonsParamsSchema,
  sendInteractiveListParamsSchema,
  sendInteractiveCarouselParamsSchema,
  sendInteractiveCTAParamsSchema,
} from '../validation/schemas/messages.js';

/**
 * Send an interactive message with reply buttons
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Interactive buttons parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendInteractiveButtons(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendInteractiveButtonsParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendInteractiveButtonsParamsSchema, params);
  }

  // Build interactive object
  const interactive: Record<string, unknown> = {
    type: 'button',
    body: {
      text: params.body,
    },
    action: {
      buttons: params.buttons.map((button) => ({
        type: 'reply',
        reply: {
          id: button.id,
          title: button.title,
        },
      })),
    },
  };

  // Add header if provided
  if (params.header) {
    if (params.header.type === 'text') {
      interactive.header = {
        type: 'text',
        text: params.header.text,
      };
    } else if (params.header.type === 'image') {
      interactive.header = {
        type: 'image',
        image: params.header.image,
      };
    } else if (params.header.type === 'video') {
      interactive.header = {
        type: 'video',
        video: params.header.video,
      };
    } else if (params.header.type === 'document') {
      interactive.header = {
        type: 'document',
        document: params.header.document,
      };
    }
  }

  // Add footer if provided
  if (params.footer) {
    interactive.footer = {
      text: params.footer,
    };
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'interactive',
    interactive,
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send an interactive message with a list
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Interactive list parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendInteractiveList(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendInteractiveListParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendInteractiveListParamsSchema, params);
  }

  // Build interactive object
  const interactive: Record<string, unknown> = {
    type: 'list',
    body: {
      text: params.body,
    },
    action: {
      button: params.buttonText,
      sections: params.sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          id: row.id,
          title: row.title,
          ...(row.description && { description: row.description }),
        })),
      })),
    },
  };

  // Add header if provided
  if (params.header) {
    if (params.header.type === 'text') {
      interactive.header = {
        type: 'text',
        text: params.header.text,
      };
    }
  }

  // Add footer if provided
  if (params.footer) {
    interactive.footer = {
      text: params.footer,
    };
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'interactive',
    interactive,
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send an interactive carousel message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Interactive carousel parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendInteractiveCarousel(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendInteractiveCarouselParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendInteractiveCarouselParamsSchema, params);
  }

  // Build interactive object
  const interactive: Record<string, unknown> = {
    type: 'carousel',
    body: {
      text: params.body,
    },
    action: {
      cards: params.cards.map((card) => ({
        card_index: card.cardIndex,
        type: 'cta_url',
        header: card.header.type === 'image'
          ? {
              type: 'image',
              image: card.header.image,
            }
          : {
              type: 'video',
              video: card.header.video,
            },
        ...(card.body && {
          body: {
            text: card.body.text,
          },
        }),
        action: {
          name: 'cta_url',
          parameters: {
            display_text: card.action.displayText,
            url: card.action.url,
          },
        },
      })),
    },
  };

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'interactive',
    interactive,
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}

/**
 * Send an interactive CTA URL button message
 *
 * Interactive Call-to-Action (CTA) URL button messages allow you to map any URL to a button
 * so you don't have to include the raw URL in the message body. This provides a cleaner,
 * more professional message appearance.
 *
 * **Supported Header Types**:
 * - Text (max 60 characters)
 * - Image (from URL or media ID)
 * - Video (from URL or media ID)
 * - Document (from URL or media ID)
 *
 * **Character Limits**:
 * - Header text: 60 characters
 * - Body text: 1024 characters
 * - Button text: 20 characters
 * - Footer text: 60 characters
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Interactive CTA parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 *
 * @example
 * ```typescript
 * // Basic CTA message
 * await sendInteractiveCTA(client, phoneNumberId, {
 *   to: '+1234567890',
 *   body: 'Check out our new products!',
 *   action: {
 *     displayText: 'View Products',
 *     url: 'https://example.com/products'
 *   }
 * });
 *
 * // CTA with image header and footer
 * await sendInteractiveCTA(client, phoneNumberId, {
 *   to: '+1234567890',
 *   header: {
 *     type: 'image',
 *     image: { link: 'https://example.com/banner.jpg' }
 *   },
 *   body: 'Tap the button below to see available dates.',
 *   action: {
 *     displayText: 'See Dates',
 *     url: 'https://example.com/calendar'
 *   },
 *   footer: 'Dates subject to change.'
 * });
 * ```
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/messages/interactive-cta-url-messages
 */
export async function sendInteractiveCTA(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendInteractiveCTAParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendInteractiveCTAParamsSchema, params);
  }

  // Build interactive object
  const interactive: Record<string, unknown> = {
    type: 'cta_url',
    body: {
      text: params.body,
    },
    action: {
      name: 'cta_url',
      parameters: {
        display_text: params.action.displayText,
        url: params.action.url,
      },
    },
  };

  // Add header if provided
  if (params.header) {
    if (params.header.type === 'text') {
      interactive.header = {
        type: 'text',
        text: params.header.text,
      };
    } else if (params.header.type === 'image') {
      interactive.header = {
        type: 'image',
        image: params.header.image,
      };
    } else if (params.header.type === 'video') {
      interactive.header = {
        type: 'video',
        video: params.header.video,
      };
    } else if (params.header.type === 'document') {
      interactive.header = {
        type: 'document',
        document: params.header.document,
      };
    }
  }

  // Add footer if provided
  if (params.footer) {
    interactive.footer = {
      text: params.footer,
    };
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'interactive',
    interactive,
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
