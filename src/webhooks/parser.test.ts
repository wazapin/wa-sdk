/**
 * Unit tests for webhook parser
 */

import { describe, it, expect } from 'vitest';
import { parseWebhook } from './parser.js';
import { Validator } from '../validation/validator.js';
import { ValidationError } from '../types/errors.js';

describe('parseWebhook', () => {
  const validWebhookPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123456789',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+1234567890',
                phone_number_id: '123456789',
              },
              contacts: [
                {
                  profile: {
                    name: 'John Doe',
                  },
                  wa_id: '1234567890',
                },
              ],
              messages: [
                {
                  from: '1234567890',
                  id: 'wamid.123',
                  timestamp: '1234567890',
                  type: 'text',
                  text: {
                    body: 'Hello',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  describe('successful parsing', () => {
    it('should parse valid webhook payload', () => {
      const result = parseWebhook(validWebhookPayload);

      expect(result).toBeDefined();
      expect(result.object).toBe('whatsapp_business_account');
      expect(result.entry).toHaveLength(1);
    });

    it('should parse webhook with text message', () => {
      const result = parseWebhook(validWebhookPayload);

      expect(result.entry[0].changes[0].value.messages).toBeDefined();
      expect(result.entry[0].changes[0].value.messages![0].type).toBe('text');
    });

    it('should parse webhook with status update', () => {
      const statusPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123456789',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123456789',
                  },
                  statuses: [
                    {
                      id: 'wamid.123',
                      status: 'delivered',
                      timestamp: '1234567890',
                      recipient_id: '1234567890',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(statusPayload);

      expect(result.entry[0].changes[0].value.statuses).toBeDefined();
      expect(result.entry[0].changes[0].value.statuses![0].status).toBe('delivered');
    });

    it('should parse webhook with multiple entries', () => {
      const multiEntryPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123',
                  },
                },
                field: 'messages',
              },
            ],
          },
          {
            id: '456',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+0987654321',
                    phone_number_id: '456',
                  },
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(multiEntryPayload);

      expect(result.entry).toHaveLength(2);
    });

    it('should parse webhook with validator in off mode', () => {
      const validator = new Validator('off');
      const result = parseWebhook(validWebhookPayload, validator);

      expect(result).toBeDefined();
    });
  });

  describe('validation errors', () => {
    it('should throw error for null payload', () => {
      expect(() => parseWebhook(null)).toThrow(ValidationError);
      expect(() => parseWebhook(null)).toThrow('must be an object');
    });

    it('should throw error for undefined payload', () => {
      expect(() => parseWebhook(undefined)).toThrow(ValidationError);
    });

    it('should throw error for non-object payload', () => {
      expect(() => parseWebhook('invalid')).toThrow(ValidationError);
      expect(() => parseWebhook(123)).toThrow(ValidationError);
      expect(() => parseWebhook([])).toThrow(ValidationError);
    });

    it('should throw error for invalid object type', () => {
      const invalidPayload = {
        object: 'invalid_type',
        entry: [],
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
      expect(() => parseWebhook(invalidPayload)).toThrow('whatsapp_business_account');
    });

    it('should throw error for missing entry array', () => {
      const invalidPayload = {
        object: 'whatsapp_business_account',
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
      expect(() => parseWebhook(invalidPayload)).toThrow('entry');
    });

    it('should throw error for non-array entry', () => {
      const invalidPayload = {
        object: 'whatsapp_business_account',
        entry: 'not-an-array',
      };

      expect(() => parseWebhook(invalidPayload)).toThrow(ValidationError);
    });

    it('should provide field information in validation error', () => {
      try {
        parseWebhook(null);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.field).toBe('payload');
      }
    });
  });

  describe('different message types', () => {
    it('should parse image message', () => {
      const imagePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123',
                  },
                  messages: [
                    {
                      from: '1234567890',
                      id: 'wamid.123',
                      timestamp: '1234567890',
                      type: 'image',
                      image: {
                        id: 'media123',
                        mime_type: 'image/jpeg',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(imagePayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe('image');
    });

    it('should parse location message', () => {
      const locationPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123',
                  },
                  messages: [
                    {
                      from: '1234567890',
                      id: 'wamid.123',
                      timestamp: '1234567890',
                      type: 'location',
                      location: {
                        latitude: 37.7749,
                        longitude: -122.4194,
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(locationPayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe('location');
    });

    it('should parse interactive message response', () => {
      const interactivePayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123',
                  },
                  messages: [
                    {
                      from: '1234567890',
                      id: 'wamid.123',
                      timestamp: '1234567890',
                      type: 'interactive',
                      interactive: {
                        type: 'button_reply',
                        button_reply: {
                          id: 'btn1',
                          title: 'Option 1',
                        },
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(interactivePayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe('interactive');
    });

    it('should parse unsupported message', () => {
      const unsupportedPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '102290129340398',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '15550783881',
                    phone_number_id: '106540352242922',
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'Sheena Nelson',
                      },
                      wa_id: '16505551234',
                    },
                  ],
                  messages: [
                    {
                      from: '16505551234',
                      id: 'wamid.HBgLMTY1MDM4Nzk0MzkVAgASGBQzQUFERjg0NDEzNDdFODU3MUMxMAA=',
                      timestamp: '1750090702',
                      type: 'unsupported',
                      errors: [
                        {
                          code: 131051,
                          title: 'Message type unknown',
                          message: 'Message type unknown',
                          error_data: {
                            details: 'Message type is currently not supported.',
                          },
                        },
                      ],
                      unsupported: {
                        type: 'edit',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(unsupportedPayload);

      expect(result.entry[0].changes[0].value.messages![0].type).toBe('unsupported');
      expect(result.entry[0].changes[0].value.messages![0].errors).toBeDefined();
      expect(result.entry[0].changes[0].value.messages![0].errors![0].code).toBe(131051);
      expect(result.entry[0].changes[0].value.messages![0].unsupported).toBeDefined();
      expect(result.entry[0].changes[0].value.messages![0].unsupported!.type).toBe('edit');
    });

    it('should parse contact with identity key hash', () => {
      const identityPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+1234567890',
                    phone_number_id: '123',
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'John Doe',
                      },
                      wa_id: '1234567890',
                      identity_key_hash: 'DF2lS5v2W6x=',
                    },
                  ],
                  messages: [
                    {
                      from: '1234567890',
                      id: 'wamid.123',
                      timestamp: '1234567890',
                      type: 'text',
                      text: {
                        body: 'Hello',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = parseWebhook(identityPayload);
      const contact = result.entry[0].changes[0].value.contacts![0] as any;

      expect(contact.wa_id).toBe('1234567890');
      expect(contact.identity_key_hash).toBe('DF2lS5v2W6x=');
    });
  });
});
