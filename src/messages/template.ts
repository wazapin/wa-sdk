/**
 * Template message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SendTemplateParams, TemplateParameter } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import { sendTemplateParamsSchema } from '../validation/schemas/messages.js';

/**
 * Format template parameter for API request
 */
function formatTemplateParameter(param: TemplateParameter): Record<string, unknown> {
  switch (param.type) {
    case 'text':
      return {
        type: 'text',
        text: param.text,
      };
    case 'currency':
      return {
        type: 'currency',
        currency: {
          fallback_value: param.currency.fallbackValue,
          code: param.currency.code,
          amount_1000: param.currency.amount1000,
        },
      };
    case 'date_time':
      return {
        type: 'date_time',
        date_time: {
          fallback_value: param.date_time.fallbackValue,
        },
      };
    case 'image':
      return {
        type: 'image',
        image: param.image,
      };
    case 'video':
      return {
        type: 'video',
        video: param.video,
      };
    case 'document':
      return {
        type: 'document',
        document: param.document,
      };
  }
}

/**
 * Send a template message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Template message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendTemplate(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendTemplateParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendTemplateParamsSchema, params);
  }

  // Build template object
  const template: Record<string, unknown> = {
    name: params.template.name,
    language: {
      code: params.template.language,
    },
  };

  // Add components if provided
  if (params.template.components && params.template.components.length > 0) {
    template.components = params.template.components.map((component) => ({
      type: component.type,
      ...(component.subType && { sub_type: component.subType }),
      ...(component.index !== undefined && { index: component.index }),
      parameters: component.parameters.map(formatTemplateParameter),
    }));
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'template',
    template,
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
