Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSettingsSchema =
  exports.EmailProviderConfigSchema =
  exports.EmailCampaignSchema =
  exports.EmailMessageSchema =
  exports.EmailTemplateSchema =
  exports.EmailAttachmentSchema =
  exports.EmailRecipientSchema =
    void 0;
var zod_1 = require("zod");
// =======================================
// ZOD SCHEMAS FOR VALIDATION
// =======================================
exports.EmailRecipientSchema = zod_1.z.object({
  email: zod_1.z.string().email("Email inválido"),
  name: zod_1.z.string().optional(),
  type: zod_1.z.enum(["to", "cc", "bcc"]).default("to"),
});
exports.EmailAttachmentSchema = zod_1.z.object({
  filename: zod_1.z.string().min(1, "Nome do arquivo é obrigatório"),
  content: zod_1.z.any(), // Buffer or string
  contentType: zod_1.z.string().optional(),
  cid: zod_1.z.string().optional(),
  size: zod_1.z.number().positive().optional(),
});
exports.EmailTemplateSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome do template é obrigatório"),
  subject: zod_1.z.string().min(1, "Assunto é obrigatório"),
  htmlContent: zod_1.z.string().min(1, "Conteúdo HTML é obrigatório"),
  textContent: zod_1.z.string().optional(),
  variables: zod_1.z.array(zod_1.z.string()).default([]),
  category: zod_1.z.enum(["follow-up", "appointment", "marketing", "notification"]),
  isActive: zod_1.z.boolean().default(true),
});
exports.EmailMessageSchema = zod_1.z.object({
  to: zod_1.z
    .array(exports.EmailRecipientSchema)
    .min(1, "Pelo menos um destinatário é obrigatório"),
  cc: zod_1.z.array(exports.EmailRecipientSchema).optional(),
  bcc: zod_1.z.array(exports.EmailRecipientSchema).optional(),
  from: zod_1.z.object({
    email: zod_1.z.string().email("Email do remetente inválido"),
    name: zod_1.z.string().optional(),
  }),
  replyTo: zod_1.z
    .object({
      email: zod_1.z.string().email("Email de resposta inválido"),
      name: zod_1.z.string().optional(),
    })
    .optional(),
  subject: zod_1.z.string().min(1, "Assunto é obrigatório"),
  htmlContent: zod_1.z.string().min(1, "Conteúdo HTML é obrigatório"),
  textContent: zod_1.z.string().optional(),
  attachments: zod_1.z.array(exports.EmailAttachmentSchema).optional(),
  templateId: zod_1.z.string().optional(),
  templateVariables: zod_1.z.record(zod_1.z.any()).optional(),
  priority: zod_1.z.enum(["low", "normal", "high"]).default("normal"),
  scheduledAt: zod_1.z.date().optional(),
  tags: zod_1.z.array(zod_1.z.string()).optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.EmailCampaignSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome da campanha é obrigatório"),
  templateId: zod_1.z.string().min(1, "Template é obrigatório"),
  recipients: zod_1.z
    .array(exports.EmailRecipientSchema)
    .min(1, "Pelo menos um destinatário é obrigatório"),
  scheduledAt: zod_1.z.date().optional(),
  segmentId: zod_1.z.string().optional(),
  settings: zod_1.z.object({
    trackOpens: zod_1.z.boolean().default(true),
    trackClicks: zod_1.z.boolean().default(true),
    enableUnsubscribe: zod_1.z.boolean().default(true),
    batchSize: zod_1.z.number().positive().optional(),
    sendRate: zod_1.z.number().positive().optional(),
  }),
});
exports.EmailProviderConfigSchema = zod_1.z.object({
  provider: zod_1.z.enum(["smtp", "ses", "sendgrid", "mailgun", "resend", "postmark"]),
  name: zod_1.z.string().min(1, "Nome do provedor é obrigatório"),
  settings: zod_1.z.record(zod_1.z.any()),
  isActive: zod_1.z.boolean().default(true),
  priority: zod_1.z.number().min(1).max(10).default(5),
  dailyLimit: zod_1.z.number().positive().optional(),
  monthlyLimit: zod_1.z.number().positive().optional(),
  rateLimit: zod_1.z
    .object({
      requestsPerSecond: zod_1.z.number().positive(),
      requestsPerMinute: zod_1.z.number().positive(),
    })
    .optional(),
});
exports.EmailSettingsSchema = zod_1.z.object({
  defaultFrom: zod_1.z.object({
    email: zod_1.z.string().email("Email padrão inválido"),
    name: zod_1.z.string().min(1, "Nome padrão é obrigatório"),
  }),
  defaultReplyTo: zod_1.z
    .object({
      email: zod_1.z.string().email("Email de resposta inválido"),
      name: zod_1.z.string().optional(),
    })
    .optional(),
  bounceHandling: zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    maxBounces: zod_1.z.number().min(1).max(10).default(3),
    suppressAfterBounces: zod_1.z.boolean().default(true),
  }),
  unsubscribeHandling: zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    redirectUrl: zod_1.z.string().url().optional(),
    confirmationRequired: zod_1.z.boolean().default(false),
  }),
  deliveryOptimization: zod_1.z.object({
    sendingSchedule: zod_1.z.object({
      enabled: zod_1.z.boolean().default(false),
      allowedHours: zod_1.z.object({
        start: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
        end: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
      }),
      allowedDays: zod_1.z.array(zod_1.z.number().min(0).max(6)),
      timezone: zod_1.z.string().default("America/Sao_Paulo"),
    }),
    rateLimit: zod_1.z.object({
      emailsPerMinute: zod_1.z.number().positive().default(60),
      emailsPerHour: zod_1.z.number().positive().default(1000),
      emailsPerDay: zod_1.z.number().positive().default(10000),
    }),
    suppressionList: zod_1.z.object({
      enabled: zod_1.z.boolean().default(true),
      bounced: zod_1.z.boolean().default(true),
      complained: zod_1.z.boolean().default(true),
      unsubscribed: zod_1.z.boolean().default(true),
    }),
  }),
  dkimSigning: zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    domain: zod_1.z.string().optional(),
    selector: zod_1.z.string().optional(),
    privateKey: zod_1.z.string().optional(),
  }),
  webhookUrl: zod_1.z.string().url().optional(),
  webhookSecret: zod_1.z.string().optional(),
});
