/**
 * Zod schemas for webhook validation
 */

import { z } from 'zod';

/**
 * Webhook metadata schema
 */
export const webhookMetadataSchema = z.object({
  displayPhoneNumber: z.string(),
  phoneNumberId: z.string(),
});

/**
 * Webhook contact schema
 */
export const webhookContactSchema = z.object({
  profile: z.object({
    name: z.string(),
  }),
  waId: z.string(),
  identityKeyHash: z.string().optional(),
});

/**
 * Webhook media schema
 */
export const webhookMediaSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  sha256: z.string().optional(),
  caption: z.string().optional(),
  filename: z.string().optional(),
});

/**
 * Webhook location schema
 */
export const webhookLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().optional(),
  address: z.string().optional(),
});

/**
 * Webhook interactive schema
 */
export const webhookInteractiveSchema = z.object({
  type: z.enum(['button_reply', 'list_reply']),
  buttonReply: z
    .object({
      id: z.string(),
      title: z.string(),
    })
    .optional(),
  listReply: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })
    .optional(),
});

/**
 * Webhook message schema
 */
export const webhookMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  timestamp: z.string(),
  type: z.enum([
    'text',
    'image',
    'video',
    'audio',
    'document',
    'sticker',
    'location',
    'contacts',
    'button',
    'interactive',
    'order',
    'system',
    'unsupported',
    'unknown',
  ]),
  context: z
    .object({
      from: z.string(),
      id: z.string(),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        code: z.number(),
        title: z.string(),
        message: z.string().optional(),
        errorData: z
          .object({
            details: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
  // Type-specific fields
  text: z.object({ body: z.string() }).optional(),
  image: webhookMediaSchema.optional(),
  video: webhookMediaSchema.optional(),
  audio: webhookMediaSchema.optional(),
  document: webhookMediaSchema.optional(),
  sticker: webhookMediaSchema.optional(),
  location: webhookLocationSchema.optional(),
  contacts: z.array(webhookContactSchema).optional(),
  button: z.object({ text: z.string(), payload: z.string() }).optional(),
  interactive: webhookInteractiveSchema.optional(),
  reaction: z.object({ messageId: z.string(), emoji: z.string() }).optional(),
  unsupported: z.object({ type: z.string() }).optional(),
});

/**
 * Webhook status schema
 */
export const webhookStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  timestamp: z.string(),
  recipientId: z.string(),
  conversation: z
    .object({
      id: z.string(),
      origin: z.object({
        type: z.string(),
      }),
    })
    .optional(),
  pricing: z
    .object({
      pricingModel: z.string(),
      billable: z.boolean(),
      category: z.string(),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        code: z.number(),
        title: z.string(),
        message: z.string().optional(),
        errorData: z
          .object({
            details: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
});

/**
 * Message webhook event schema
 */
export const messageWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messagingProduct: z.literal('whatsapp'),
            metadata: webhookMetadataSchema,
            contacts: z.array(webhookContactSchema).optional(),
            messages: z.array(webhookMessageSchema).optional(),
            statuses: z.array(webhookStatusSchema).optional(),
          }),
          field: z.literal('messages'),
        })
      ),
    })
  ),
});

/**
 * Status webhook event schema
 */
export const statusWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messagingProduct: z.literal('whatsapp'),
            metadata: webhookMetadataSchema,
            statuses: z.array(webhookStatusSchema),
          }),
          field: z.literal('messages'),
        })
      ),
    })
  ),
});

/**
 * Account webhook event schema
 */
export const accountWebhookEventSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            event: z.string(),
          }).passthrough(), // Allow additional fields
          field: z.string(),
        })
      ),
    })
  ),
});

/**
 * Generic webhook event schema (union of all types)
 */
export const webhookEventSchema = z.union([
  messageWebhookEventSchema,
  statusWebhookEventSchema,
  accountWebhookEventSchema,
]);
