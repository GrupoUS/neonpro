"use strict";
// Patient Communication Center Types
// NeonPro - Epic 6 Story 6.2 Task 1: Patient Communication Center
// Comprehensive type definitions for modern healthcare communication platform
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationPreferencesSchema = exports.QuickResponseSchema = exports.CommunicationCampaignSchema = exports.CommunicationConsentSchema = exports.MessageTemplateSchema = exports.MessageSchema = void 0;
var zod_1 = require("zod");
// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================
exports.MessageSchema = zod_1.z.object({
    thread_id: zod_1.z.string().uuid(),
    sender_id: zod_1.z.string().uuid(),
    sender_type: zod_1.z.enum(['patient', 'staff']),
    recipient_ids: zod_1.z.array(zod_1.z.string().uuid()),
    type: zod_1.z.enum(['text', 'appointment', 'reminder', 'alert', 'document', 'image', 'form']),
    channel: zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
    subject: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1, 'Message content is required'),
    priority: zod_1.z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    template_id: zod_1.z.string().uuid().optional(),
    automation_id: zod_1.z.string().uuid().optional(),
});
exports.MessageTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Template name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['appointment', 'reminder', 'follow_up', 'confirmation', 'cancellation', 'test_results', 'medication', 'billing', 'marketing', 'emergency', 'general']),
    type: zod_1.z.enum(['text', 'appointment', 'reminder', 'alert', 'document', 'image', 'form']),
    channel: zod_1.z.array(zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])),
    subject_template: zod_1.z.string().min(1, 'Subject template is required'),
    content_template: zod_1.z.string().min(1, 'Content template is required'),
    variables: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        type: zod_1.z.enum(['text', 'number', 'date', 'boolean', 'list']),
        required: zod_1.z.boolean(),
        default_value: zod_1.z.string().optional(),
        validation_pattern: zod_1.z.string().optional(),
        options: zod_1.z.array(zod_1.z.string()).optional(),
    })),
    is_active: zod_1.z.boolean().default(true),
});
exports.CommunicationConsentSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid(),
    channel: zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
    consent_given: zod_1.z.boolean(),
    consent_method: zod_1.z.enum(['verbal', 'written', 'electronic']),
    phi_sharing_allowed: zod_1.z.boolean(),
    marketing_allowed: zod_1.z.boolean(),
    appointment_reminders: zod_1.z.boolean(),
    test_results: zod_1.z.boolean(),
    general_health_info: zod_1.z.boolean(),
    emergency_contact: zod_1.z.boolean(),
    expiry_date: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.CommunicationCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Campaign name is required'),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['one_time', 'recurring', 'triggered', 'drip']),
    message_template_id: zod_1.z.string().uuid(),
    channel: zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
    scheduled_at: zod_1.z.string().optional(),
    target_audience: zod_1.z.object({
        include_criteria: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.string(),
            value: zod_1.z.any(),
        })),
        exclude_criteria: zod_1.z.array(zod_1.z.object({
            field: zod_1.z.string(),
            operator: zod_1.z.string(),
            value: zod_1.z.any(),
        })),
        patient_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    }),
});
exports.QuickResponseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Quick response name is required'),
    shortcut: zod_1.z.string().min(1, 'Shortcut is required').regex(/^\/\w+$/, 'Shortcut must start with / and contain only letters, numbers, and underscores'),
    content: zod_1.z.string().min(1, 'Content is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    channel: zod_1.z.array(zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])),
    is_personal: zod_1.z.boolean().default(false),
});
exports.CommunicationPreferencesSchema = zod_1.z.object({
    patient_id: zod_1.z.string().uuid(),
    preferred_channel: zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal']),
    preferred_time_start: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    preferred_time_end: zod_1.z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    timezone: zod_1.z.string(),
    language: zod_1.z.string(),
    quiet_hours_enabled: zod_1.z.boolean(),
    weekend_communication: zod_1.z.boolean(),
    emergency_contact_override: zod_1.z.boolean(),
    marketing_opt_in: zod_1.z.boolean(),
    appointment_reminders: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        advance_days: zod_1.z.array(zod_1.z.number().min(0).max(30)),
        channels: zod_1.z.array(zod_1.z.enum(['sms', 'email', 'portal', 'whatsapp', 'internal'])),
    }),
    follow_up_preferences: zod_1.z.object({
        enabled: zod_1.z.boolean(),
        frequency: zod_1.z.enum(['immediate', 'daily', 'weekly']),
        max_attempts: zod_1.z.number().min(1).max(10),
    }),
});
