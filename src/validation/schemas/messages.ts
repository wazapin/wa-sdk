/**
 * Zod schemas for message validation
 */

import { z } from 'zod';

/**
 * Phone number schema (E.164 format)
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +1234567890)');

/**
 * Message context schema (for replies)
 */
export const messageContextSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
});

/**
 * Media input schema (URL or ID)
 */
export const mediaInputSchema = z.union([
  z.object({
    link: z.string().url('Media link must be a valid URL'),
  }),
  z.object({
    id: z.string().min(1, 'Media ID is required'),
  }),
]);

/**
 * Text message parameters schema
 */
export const sendTextParamsSchema = z.object({
  to: phoneNumberSchema,
  text: z.string().min(1, 'Text message cannot be empty').max(4096, 'Text message too long'),
  previewUrl: z.boolean().optional(),
  context: messageContextSchema.optional(),
});

/**
 * Image message parameters schema
 */
export const sendImageParamsSchema = z.object({
  to: phoneNumberSchema,
  image: mediaInputSchema,
  caption: z.string().max(1024, 'Caption too long').optional(),
  context: messageContextSchema.optional(),
});

/**
 * Video message parameters schema
 */
export const sendVideoParamsSchema = z.object({
  to: phoneNumberSchema,
  video: mediaInputSchema,
  caption: z.string().max(1024, 'Caption too long').optional(),
  context: messageContextSchema.optional(),
});

/**
 * Audio message parameters schema
 */
export const sendAudioParamsSchema = z.object({
  to: phoneNumberSchema,
  audio: mediaInputSchema,
  context: messageContextSchema.optional(),
});

/**
 * Document message parameters schema
 */
export const sendDocumentParamsSchema = z.object({
  to: phoneNumberSchema,
  document: mediaInputSchema,
  caption: z.string().max(1024, 'Caption too long').optional(),
  filename: z.string().optional(),
  context: messageContextSchema.optional(),
});

/**
 * Sticker message parameters schema
 */
export const sendStickerParamsSchema = z.object({
  to: phoneNumberSchema,
  sticker: mediaInputSchema,
  context: messageContextSchema.optional(),
});

/**
 * Location message parameters schema
 */
export const sendLocationParamsSchema = z.object({
  to: phoneNumberSchema,
  latitude: z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90'),
  longitude: z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180'),
  name: z.string().optional(),
  address: z.string().optional(),
});

/**
 * Contact name schema
 */
export const contactNameSchema = z.object({
  formattedName: z.string().min(1, 'Formatted name is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
});

/**
 * Contact phone schema
 */
export const contactPhoneSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  type: z.enum(['CELL', 'MAIN', 'IPHONE', 'HOME', 'WORK']).optional(),
  waId: z.string().optional(),
});

/**
 * Contact email schema
 */
export const contactEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['HOME', 'WORK']).optional(),
});

/**
 * Contact URL schema
 */
export const contactUrlSchema = z.object({
  url: z.string().url('Invalid URL'),
  type: z.enum(['HOME', 'WORK']).optional(),
});

/**
 * Contact address schema
 */
export const contactAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  type: z.enum(['HOME', 'WORK']).optional(),
});

/**
 * Contact organization schema
 */
export const contactOrgSchema = z.object({
  company: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
});

/**
 * Contact schema
 */
export const contactSchema = z.object({
  name: contactNameSchema,
  phones: z.array(contactPhoneSchema).optional(),
  emails: z.array(contactEmailSchema).optional(),
  urls: z.array(contactUrlSchema).optional(),
  addresses: z.array(contactAddressSchema).optional(),
  org: contactOrgSchema.optional(),
  birthday: z.string().optional(),
});

/**
 * Contact message parameters schema
 */
export const sendContactParamsSchema = z.object({
  to: phoneNumberSchema,
  contacts: z.array(contactSchema).min(1, 'At least one contact is required'),
});

/**
 * Reaction message parameters schema
 */
export const sendReactionParamsSchema = z.object({
  to: phoneNumberSchema,
  messageId: z.string().min(1, 'Message ID is required'),
  emoji: z.string(), // Empty string to remove reaction
});

/**
 * Interactive button schema
 */
export const interactiveButtonSchema = z.object({
  id: z.string().min(1, 'Button ID is required').max(256, 'Button ID too long'),
  title: z.string().min(1, 'Button title is required').max(20, 'Button title too long'),
});

/**
 * Interactive header schema
 */
export const interactiveHeaderSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, 'Header text is required').max(60, 'Header text too long'),
  }),
  z.object({
    type: z.literal('image'),
    image: mediaInputSchema,
  }),
  z.object({
    type: z.literal('video'),
    video: mediaInputSchema,
  }),
  z.object({
    type: z.literal('document'),
    document: mediaInputSchema,
  }),
]);

/**
 * Interactive buttons message parameters schema
 */
export const sendInteractiveButtonsParamsSchema = z.object({
  to: phoneNumberSchema,
  body: z.string().min(1, 'Body text is required').max(1024, 'Body text too long'),
  buttons: z
    .array(interactiveButtonSchema)
    .min(1, 'At least one button is required')
    .max(3, 'Maximum 3 buttons allowed'),
  header: interactiveHeaderSchema.optional(),
  footer: z.string().max(60, 'Footer text too long').optional(),
});

/**
 * Interactive list row schema
 */
export const interactiveRowSchema = z.object({
  id: z.string().min(1, 'Row ID is required').max(200, 'Row ID too long'),
  title: z.string().min(1, 'Row title is required').max(24, 'Row title too long'),
  description: z.string().max(72, 'Row description too long').optional(),
});

/**
 * Interactive list section schema
 */
export const interactiveSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required').max(24, 'Section title too long'),
  rows: z.array(interactiveRowSchema).min(1, 'At least one row is required').max(10, 'Maximum 10 rows per section'),
});

/**
 * Interactive list message parameters schema
 */
export const sendInteractiveListParamsSchema = z.object({
  to: phoneNumberSchema,
  body: z.string().min(1, 'Body text is required').max(1024, 'Body text too long'),
  buttonText: z.string().min(1, 'Button text is required').max(20, 'Button text too long'),
  sections: z.array(interactiveSectionSchema).min(1, 'At least one section is required').max(10, 'Maximum 10 sections'),
  header: interactiveHeaderSchema.optional(),
  footer: z.string().max(60, 'Footer text too long').optional(),
});

/**
 * Currency parameter schema
 */
export const currencyParameterSchema = z.object({
  fallbackValue: z.string().min(1, 'Fallback value is required'),
  code: z.string().length(3, 'Currency code must be 3 characters'),
  amount1000: z.number().int('Amount must be an integer'),
});

/**
 * DateTime parameter schema
 */
export const dateTimeParameterSchema = z.object({
  fallbackValue: z.string().min(1, 'Fallback value is required'),
});

/**
 * Template parameter schema
 */
export const templateParameterSchema = z.union([
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, 'Text is required'),
  }),
  z.object({
    type: z.literal('currency'),
    currency: currencyParameterSchema,
  }),
  z.object({
    type: z.literal('date_time'),
    date_time: dateTimeParameterSchema,
  }),
  z.object({
    type: z.literal('image'),
    image: mediaInputSchema,
  }),
  z.object({
    type: z.literal('video'),
    video: mediaInputSchema,
  }),
  z.object({
    type: z.literal('document'),
    document: mediaInputSchema,
  }),
]);

/**
 * Template component schema
 */
export const templateComponentSchema = z.object({
  type: z.enum(['header', 'body', 'button']),
  parameters: z.array(templateParameterSchema),
  subType: z.string().optional(),
  index: z.number().optional(),
});

/**
 * Interactive carousel card schema
 */
export const interactiveCarouselCardSchema = z.object({
  cardIndex: z.number().int('Card index must be an integer').min(0, 'Card index must be >= 0').max(9, 'Card index must be <= 9'),
  header: z.union([
    z.object({
      type: z.literal('image'),
      image: mediaInputSchema,
    }),
    z.object({
      type: z.literal('video'),
      video: mediaInputSchema,
    }),
  ]),
  body: z.object({
    text: z.string().min(1, 'Card body text is required').max(160, 'Card body text too long (max 160 characters)'),
  }).optional(),
  action: z.object({
    displayText: z.string().min(1, 'Display text is required').max(20, 'Display text too long (max 20 characters)'),
    url: z.string().url('URL must be valid'),
  }),
});

/**
 * Interactive carousel message parameters schema
 */
export const sendInteractiveCarouselParamsSchema = z.object({
  to: phoneNumberSchema,
  body: z.string().min(1, 'Body text is required').max(1024, 'Body text too long (max 1024 characters)'),
  cards: z
    .array(interactiveCarouselCardSchema)
    .min(2, 'At least 2 cards are required')
    .max(10, 'Maximum 10 cards allowed')
    .refine(
      (cards) => {
        // Check all cards have same header type
        const firstHeaderType = cards[0]?.header.type;
        return cards.every((card) => card.header.type === firstHeaderType);
      },
      {
        message: 'All cards must have the same header type (either all image or all video)',
      }
    )
    .refine(
      (cards) => {
        // Check card indices are unique
        const indices = cards.map((card) => card.cardIndex);
        return new Set(indices).size === indices.length;
      },
      {
        message: 'Card indices must be unique',
      }
    ),
});

/**
 * Template message parameters schema
 */
export const sendTemplateParamsSchema = z.object({
  to: phoneNumberSchema,
  template: z.object({
    name: z.string().min(1, 'Template name is required'),
    language: z.string().min(1, 'Language code is required'),
    components: z.array(templateComponentSchema).optional(),
  }),
});

/**
 * Interactive CTA header schema
 */
export const interactiveCTAHeaderSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().min(1, 'Header text is required').max(60, 'Header text too long (max 60 characters)'),
  }),
  z.object({
    type: z.literal('image'),
    image: mediaInputSchema,
  }),
  z.object({
    type: z.literal('video'),
    video: mediaInputSchema,
  }),
  z.object({
    type: z.literal('document'),
    document: mediaInputSchema,
  }),
]);

/**
 * Interactive CTA action schema
 */
export const interactiveCTAActionSchema = z.object({
  displayText: z.string().min(1, 'Button text is required').max(20, 'Button text too long (max 20 characters)'),
  url: z.string().url('URL must be valid'),
});

/**
 * Interactive CTA URL message parameters schema
 */
export const sendInteractiveCTAParamsSchema = z.object({
  to: phoneNumberSchema,
  header: interactiveCTAHeaderSchema.optional(),
  body: z.string().min(1, 'Body text is required').max(1024, 'Body text too long (max 1024 characters)'),
  action: interactiveCTAActionSchema,
  footer: z.string().max(60, 'Footer text too long (max 60 characters)').optional(),
});
