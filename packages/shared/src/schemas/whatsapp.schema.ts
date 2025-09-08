/**
 * WhatsApp Business API Schemas for NeonPro Healthcare
 * Zod validation schemas for WhatsApp message handling and patient communication
 * Healthcare compliance: LGPD + Message audit logging
 */

import { z, } from 'zod'

// Base WhatsApp message schema
export const whatsappMessageSchema = z.object({
  id: z.string().uuid(),
  whatsappMessageId: z.string(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number format',),
  direction: z.enum(['inbound', 'outbound',],),
  messageType: z.enum(['text', 'image', 'document', 'audio', 'video', 'template',],),
  content: z.string().max(4096,),
  status: z.enum(['sent', 'delivered', 'read', 'failed', 'pending',],),
  timestamp: z.date(),
  metadata: z.record(z.any(),).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
},)

// WhatsApp conversation schema
export const whatsappConversationSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  phoneNumber: z.string().regex(/^\d{10,15}$/,),
  contactName: z.string().optional(),
  status: z.enum(['active', 'closed', 'archived',],),
  lastMessageAt: z.date().optional(),
  messageCount: z.number().int().min(0,).default(0,),
  unreadCount: z.number().int().min(0,).default(0,),
  assignedTo: z.string().uuid().optional(), // Professional ID
  tags: z.array(z.string(),).default([],),
  metadata: z.record(z.any(),).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
},)

// WhatsApp webhook verification schema
export const whatsappWebhookVerificationSchema = z.object({
  'hub.mode': z.literal('subscribe',),
  'hub.challenge': z.string(),
  'hub.verify_token': z.string(),
},)

// WhatsApp incoming message webhook schema
export const whatsappIncomingWebhookSchema = z.object({
  object: z.literal('whatsapp_business_account',),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.literal('whatsapp',),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            },),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                },),
                wa_id: z.string(),
              },),
            ).optional(),
            messages: z.array(
              z.object({
                from: z.string(),
                id: z.string(),
                timestamp: z.string(),
                text: z.object({
                  body: z.string(),
                },).optional(),
                image: z.object({
                  caption: z.string().optional(),
                  mime_type: z.string(),
                  sha256: z.string(),
                  id: z.string(),
                },).optional(),
                document: z.object({
                  caption: z.string().optional(),
                  filename: z.string().optional(),
                  mime_type: z.string(),
                  sha256: z.string(),
                  id: z.string(),
                },).optional(),
                audio: z.object({
                  mime_type: z.string(),
                  sha256: z.string(),
                  id: z.string(),
                  voice: z.boolean().optional(),
                },).optional(),
                video: z.object({
                  caption: z.string().optional(),
                  mime_type: z.string(),
                  sha256: z.string(),
                  id: z.string(),
                },).optional(),
                type: z.enum(['text', 'image', 'document', 'audio', 'video',],),
              },),
            ).optional(),
            statuses: z.array(
              z.object({
                id: z.string(),
                status: z.enum(['sent', 'delivered', 'read', 'failed',],),
                timestamp: z.string(),
                recipient_id: z.string(),
                conversation: z.object({
                  id: z.string(),
                  expiration_timestamp: z.string().optional(),
                  origin: z.object({
                    type: z.string(),
                  },),
                },).optional(),
                pricing: z.object({
                  billable: z.boolean(),
                  pricing_model: z.string(),
                  category: z.string(),
                },).optional(),
              },),
            ).optional(),
          },),
          field: z.literal('messages',),
        },),
      ),
    },),
  ),
},)

// Send WhatsApp message request schema
export const sendWhatsappMessageSchema = z.object({
  to: z.string().regex(/^\d{10,15}$/, 'Invalid phone number format',),
  message: z.string().min(1,).max(4096,),
  type: z.enum(['text', 'template',],).default('text',),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  messageType: z.enum([
    'appointment_reminder',
    'appointment_confirmation',
    'general',
    'emergency',
    'marketing',
    'follow_up',
    'treatment_info',
  ],).default('general',),
  templateName: z.string().optional(),
  templateParams: z.array(z.string(),).optional(),
  scheduledFor: z.date().optional(),
},)

// WhatsApp template message schema
export const whatsappTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1,).max(512,),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION',],),
  language: z.string().default('pt_BR',),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'DISABLED',],),
  components: z.array(
    z.object({
      type: z.enum(['HEADER', 'BODY', 'FOOTER', 'BUTTONS',],),
      format: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT',],).optional(),
      text: z.string().optional(),
      example: z.object({
        header_text: z.array(z.string(),).optional(),
        body_text: z.array(z.array(z.string(),),).optional(),
      },).optional(),
      buttons: z.array(
        z.object({
          type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER',],),
          text: z.string(),
          url: z.string().optional(),
          phone_number: z.string().optional(),
        },),
      ).optional(),
    },),
  ),
  clinicId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
},)

// WhatsApp configuration schema
export const whatsappConfigSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  phoneNumberId: z.string(),
  displayPhoneNumber: z.string(),
  accessToken: z.string(),
  verifyToken: z.string(),
  webhookUrl: z.string().url(),
  businessAccountId: z.string(),
  isActive: z.boolean().default(true,),
  autoReply: z.boolean().default(false,),
  autoReplyMessage: z.string().optional(),
  businessHours: z.object({
    enabled: z.boolean().default(false,),
    timezone: z.string().default('America/Sao_Paulo',),
    schedule: z.array(
      z.object({
        day: z.enum([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],),
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,), // HH:MM format
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,),
        enabled: z.boolean().default(true,),
      },),
    ).default([],),
  },).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
},)

// WhatsApp analytics schema
export const whatsappAnalyticsSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  date: z.date(),
  messagesSent: z.number().int().min(0,).default(0,),
  messagesReceived: z.number().int().min(0,).default(0,),
  messagesDelivered: z.number().int().min(0,).default(0,),
  messagesRead: z.number().int().min(0,).default(0,),
  messagesFailed: z.number().int().min(0,).default(0,),
  conversationsStarted: z.number().int().min(0,).default(0,),
  conversationsClosed: z.number().int().min(0,).default(0,),
  averageResponseTime: z.number().min(0,).optional(), // in minutes
  patientSatisfactionScore: z.number().min(0,).max(10,).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
},)

// Export type definitions
export type WhatsappMessage = z.infer<typeof whatsappMessageSchema>
export type WhatsappConversation = z.infer<typeof whatsappConversationSchema>
export type WhatsappWebhookVerification = z.infer<typeof whatsappWebhookVerificationSchema>
export type WhatsappIncomingWebhook = z.infer<typeof whatsappIncomingWebhookSchema>
export type SendWhatsappMessage = z.infer<typeof sendWhatsappMessageSchema>
export type WhatsappTemplate = z.infer<typeof whatsappTemplateSchema>
export type WhatsappConfig = z.infer<typeof whatsappConfigSchema>
export type WhatsappAnalytics = z.infer<typeof whatsappAnalyticsSchema>
