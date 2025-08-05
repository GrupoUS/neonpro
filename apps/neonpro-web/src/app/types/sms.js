"use strict";
// SMS Integration Types for NeonPro
// Comprehensive type system for SMS communication with Brazilian providers
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkSMSSchema =
  exports.SendSMSSchema =
  exports.SMSTemplateSchema =
  exports.SMSMessageBodySchema =
  exports.PhoneNumberSchema =
  exports.SMS_ERROR_CODES =
    void 0;
var zod_1 = require("zod");
// ==================== VALIDATION SCHEMAS ====================
var PhoneNumberSchema = zod_1.z
  .string()
  .regex(/^\+55\d{10,11}$/, "Número deve estar no formato +55XXXXXXXXXXX")
  .describe("Número de telefone brasileiro no formato internacional");
exports.PhoneNumberSchema = PhoneNumberSchema;
var SMSMessageBodySchema = zod_1.z
  .string()
  .min(1, "Mensagem não pode estar vazia")
  .max(1600, "Mensagem muito longa (máximo 1600 caracteres)")
  .describe("Corpo da mensagem SMS");
exports.SMSMessageBodySchema = SMSMessageBodySchema;
var SMSTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório").max(100),
  body: zod_1.z.string().min(1, "Corpo da template é obrigatório").max(1600),
  category: zod_1.z.enum(["marketing", "transactional", "otp", "notification"]),
  language: zod_1.z.string().default("pt-BR"),
  variables: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.SMSTemplateSchema = SMSTemplateSchema;
var SendSMSSchema = zod_1.z.object({
  provider_id: zod_1.z.string().uuid("ID do provedor inválido"),
  to: PhoneNumberSchema,
  body: SMSMessageBodySchema,
  template_id: zod_1.z.string().uuid().optional(),
  variables: zod_1.z.record(zod_1.z.string()).optional(),
  scheduled_at: zod_1.z.string().datetime().optional(),
});
exports.SendSMSSchema = SendSMSSchema;
var BulkSMSSchema = zod_1.z.object({
  provider_id: zod_1.z.string().uuid("ID do provedor inválido"),
  messages: zod_1.z
    .array(
      zod_1.z.object({
        to: PhoneNumberSchema,
        body: SMSMessageBodySchema,
        variables: zod_1.z.record(zod_1.z.string()).optional(),
      }),
    )
    .min(1, "Lista de mensagens não pode estar vazia")
    .max(1000, "Máximo 1000 mensagens por lote"),
  template_id: zod_1.z.string().uuid().optional(),
  scheduled_at: zod_1.z.string().datetime().optional(),
  batch_size: zod_1.z.number().min(1).max(100).default(10),
});
exports.BulkSMSSchema = BulkSMSSchema;
exports.SMS_ERROR_CODES = {
  INVALID_PHONE: "invalid_phone_number",
  INVALID_MESSAGE: "invalid_message_content",
  PROVIDER_ERROR: "provider_error",
  RATE_LIMIT: "rate_limit_exceeded",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  UNAUTHORIZED: "unauthorized_access",
  BLACKLISTED: "number_blacklisted",
  OPT_OUT: "recipient_opted_out",
  NETWORK_ERROR: "network_error",
  WEBHOOK_ERROR: "webhook_processing_error",
};
