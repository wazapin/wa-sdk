/**
 * Contact message sending functionality
 */

import type { HTTPClient } from '../client/http.js';
import type { SendContactParams, Contact } from '../types/messages.js';
import type { MessageResponse } from '../types/responses.js';
import type { Validator } from '../validation/validator.js';
import { sendContactParamsSchema } from '../validation/schemas/messages.js';

/**
 * Format contact for API request
 */
function formatContact(contact: Contact): Record<string, unknown> {
  const formatted: Record<string, unknown> = {
    name: {
      formatted_name: contact.name.formattedName,
      ...(contact.name.firstName && { first_name: contact.name.firstName }),
      ...(contact.name.lastName && { last_name: contact.name.lastName }),
      ...(contact.name.middleName && { middle_name: contact.name.middleName }),
      ...(contact.name.suffix && { suffix: contact.name.suffix }),
      ...(contact.name.prefix && { prefix: contact.name.prefix }),
    },
  };

  // Add phones if provided
  if (contact.phones && contact.phones.length > 0) {
    formatted.phones = contact.phones.map((phone) => ({
      phone: phone.phone,
      ...(phone.type && { type: phone.type }),
      ...(phone.waId && { wa_id: phone.waId }),
    }));
  }

  // Add emails if provided
  if (contact.emails && contact.emails.length > 0) {
    formatted.emails = contact.emails.map((email) => ({
      email: email.email,
      ...(email.type && { type: email.type }),
    }));
  }

  // Add URLs if provided
  if (contact.urls && contact.urls.length > 0) {
    formatted.urls = contact.urls.map((url) => ({
      url: url.url,
      ...(url.type && { type: url.type }),
    }));
  }

  // Add addresses if provided
  if (contact.addresses && contact.addresses.length > 0) {
    formatted.addresses = contact.addresses.map((address) => ({
      ...(address.street && { street: address.street }),
      ...(address.city && { city: address.city }),
      ...(address.state && { state: address.state }),
      ...(address.zip && { zip: address.zip }),
      ...(address.country && { country: address.country }),
      ...(address.countryCode && { country_code: address.countryCode }),
      ...(address.type && { type: address.type }),
    }));
  }

  // Add organization if provided
  if (contact.org) {
    formatted.org = {
      ...(contact.org.company && { company: contact.org.company }),
      ...(contact.org.department && { department: contact.org.department }),
      ...(contact.org.title && { title: contact.org.title }),
    };
  }

  // Add birthday if provided
  if (contact.birthday) {
    formatted.birthday = contact.birthday;
  }

  return formatted;
}

/**
 * Send a contact message
 *
 * @param client - HTTP client instance
 * @param phoneNumberId - Phone number ID to send from
 * @param params - Contact message parameters
 * @param validator - Optional validator instance
 * @returns Message response with message ID
 */
export async function sendContact(
  client: HTTPClient,
  phoneNumberId: string,
  params: SendContactParams,
  validator?: Validator
): Promise<MessageResponse> {
  // Validate parameters if validator is provided
  if (validator) {
    validator.validate(sendContactParamsSchema, params);
  }

  // Build request payload
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: params.to,
    type: 'contacts',
    contacts: params.contacts.map(formatContact),
  };

  return client.post<MessageResponse>(`${phoneNumberId}/messages`, payload);
}
