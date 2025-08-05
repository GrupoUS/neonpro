/**
 * NeonPro Notification System - Configuration
 * Story 1.7: Sistema de Notificações
 *
 * Configurações centralizadas para o sistema de notificações
 * Suporte a diferentes ambientes e provedores
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config =
  exports.NotificationPriority =
  exports.NotificationChannel =
  exports.WEBHOOK_EVENTS =
  exports.TEMPLATE_DEFAULTS =
  exports.DEFAULT_CONFIG =
    void 0;
exports.createNotificationConfig = createNotificationConfig;
exports.validateConfig = validateConfig;
exports.getChannelConfig = getChannelConfig;
exports.isChannelEnabled = isChannelEnabled;
exports.getRateLimit = getRateLimit;
var types_1 = require("./types");
// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================
exports.DEFAULT_CONFIG = {
  defaultPriority: types_1.NotificationPriority.MEDIUM,
  maxRetries: 3,
  retryDelay: 5000, // 5 segundos
  batchSize: 100,
  rateLimits:
    ((_a = {}),
    (_a[types_1.NotificationChannel.EMAIL] = {
      perMinute: 100,
      perHour: 1000,
      perDay: 10000,
    }),
    (_a[types_1.NotificationChannel.SMS] = {
      perMinute: 10,
      perHour: 100,
      perDay: 1000,
    }),
    (_a[types_1.NotificationChannel.PUSH] = {
      perMinute: 200,
      perHour: 2000,
      perDay: 20000,
    }),
    (_a[types_1.NotificationChannel.IN_APP] = {
      perMinute: 500,
      perHour: 5000,
      perDay: 50000,
    }),
    _a),
  features: {
    analytics: true,
    automation: true,
    templates: true,
    scheduling: true,
    webhooks: true,
  },
  development: {
    mockProviders: process.env.NODE_ENV !== "production",
    logLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
    enableTestMode: process.env.NODE_ENV === "test",
  },
};
// ============================================================================
// CONFIGURAÇÃO POR AMBIENTE
// ============================================================================
function createNotificationConfig() {
  var _a;
  var config = __assign(__assign({}, exports.DEFAULT_CONFIG), {
    // Email Configuration
    email: {
      provider: process.env.EMAIL_PROVIDER || "resend",
      apiKey: process.env.EMAIL_API_KEY || "",
      fromEmail: process.env.EMAIL_FROM || "noreply@neonpro.com.br",
      fromName: process.env.EMAIL_FROM_NAME || "NeonPro",
      replyTo: process.env.EMAIL_REPLY_TO,
      webhookSecret: process.env.EMAIL_WEBHOOK_SECRET,
    },
    // SMS Configuration
    sms: {
      provider: process.env.SMS_PROVIDER || "twilio",
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      fromNumber: process.env.SMS_FROM_NUMBER || "+5511999999999",
      webhookSecret: process.env.SMS_WEBHOOK_SECRET,
    },
    // Push Configuration
    push: {
      provider: process.env.PUSH_PROVIDER || "fcm",
      projectId: process.env.FCM_PROJECT_ID,
      privateKey:
        (_a = process.env.FCM_PRIVATE_KEY) === null || _a === void 0
          ? void 0
          : _a.replace(/\\n/g, "\n"),
      clientEmail: process.env.FCM_CLIENT_EMAIL,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      bundleId: process.env.APNS_BUNDLE_ID,
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    },
    // In-App Configuration
    inApp: {
      websocketEnabled: process.env.WEBSOCKET_ENABLED !== "false",
      persistenceEnabled: process.env.PERSISTENCE_ENABLED !== "false",
      maxNotifications: parseInt(process.env.MAX_NOTIFICATIONS || "100"),
      retentionDays: parseInt(process.env.RETENTION_DAYS || "30"),
    },
    // Database Configuration
    database: {
      url: process.env.SUPABASE_URL || "",
      apiKey: process.env.SUPABASE_ANON_KEY || "",
      schema: process.env.DB_SCHEMA || "public",
    },
    // Queue Configuration
    queue: {
      provider: process.env.QUEUE_PROVIDER || "memory",
      url: process.env.REDIS_URL || process.env.QUEUE_URL,
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || "3"),
      retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || "5000"),
    },
  });
  // Validar configuração
  validateConfig(config);
  return config;
}
// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================================================
function validateConfig(config) {
  var errors = [];
  // Validar configurações obrigatórias
  if (!config.database.url) {
    errors.push("SUPABASE_URL é obrigatório");
  }
  if (!config.database.apiKey) {
    errors.push("SUPABASE_ANON_KEY é obrigatório");
  }
  // Validar configurações de email se habilitado
  if (config.features.templates || config.features.automation) {
    if (!config.email.apiKey && !config.development.mockProviders) {
      errors.push("EMAIL_API_KEY é obrigatório para produção");
    }
  }
  // Validar configurações de SMS se habilitado
  if (config.sms.provider === "twilio") {
    if (!config.sms.accountSid && !config.development.mockProviders) {
      errors.push("TWILIO_ACCOUNT_SID é obrigatório para Twilio");
    }
    if (!config.sms.authToken && !config.development.mockProviders) {
      errors.push("TWILIO_AUTH_TOKEN é obrigatório para Twilio");
    }
  }
  // Validar configurações de push se habilitado
  if (config.push.provider === "fcm") {
    if (!config.push.projectId && !config.development.mockProviders) {
      errors.push("FCM_PROJECT_ID é obrigatório para FCM");
    }
  }
  if (errors.length > 0) {
    throw new Error("Configura\u00E7\u00E3o inv\u00E1lida:\n".concat(errors.join("\n")));
  }
}
// ============================================================================
// UTILITÁRIOS DE CONFIGURAÇÃO
// ============================================================================
function getChannelConfig(config, channel) {
  switch (channel) {
    case types_1.NotificationChannel.EMAIL:
      return config.email;
    case types_1.NotificationChannel.SMS:
      return config.sms;
    case types_1.NotificationChannel.PUSH:
      return config.push;
    case types_1.NotificationChannel.IN_APP:
      return config.inApp;
    default:
      throw new Error("Canal n\u00E3o suportado: ".concat(channel));
  }
}
function isChannelEnabled(config, channel) {
  var channelConfig = getChannelConfig(config, channel);
  switch (channel) {
    case types_1.NotificationChannel.EMAIL:
      return !!channelConfig.apiKey || config.development.mockProviders;
    case types_1.NotificationChannel.SMS: {
      var smsConfig = channelConfig;
      return (
        (smsConfig.provider === "twilio" && !!(smsConfig.accountSid && smsConfig.authToken)) ||
        (smsConfig.provider === "vonage" && !!(smsConfig.apiKey && smsConfig.apiSecret)) ||
        config.development.mockProviders
      );
    }
    case types_1.NotificationChannel.PUSH: {
      var pushConfig = channelConfig;
      return (
        (pushConfig.provider === "fcm" && !!pushConfig.projectId) ||
        (pushConfig.provider === "apns" && !!(pushConfig.keyId && pushConfig.teamId)) ||
        (pushConfig.provider === "expo" && !!pushConfig.accessToken) ||
        config.development.mockProviders
      );
    }
    case types_1.NotificationChannel.IN_APP:
      return true; // Sempre habilitado
    default:
      return false;
  }
}
function getRateLimit(config, channel, period) {
  var rateLimits = config.rateLimits[channel];
  switch (period) {
    case "minute":
      return rateLimits.perMinute;
    case "hour":
      return rateLimits.perHour;
    case "day":
      return rateLimits.perDay;
    default:
      return 0;
  }
}
// ============================================================================
// CONFIGURAÇÕES DE TEMPLATE
// ============================================================================
exports.TEMPLATE_DEFAULTS = {
  variables: {
    user: ["firstName", "lastName", "email", "phone"],
    patient: ["firstName", "lastName", "email", "phone", "birthDate"],
    doctor: ["firstName", "lastName", "specialty", "crm"],
    appointment: ["date", "time", "duration", "type", "location"],
    payment: ["amount", "reference", "date", "method", "status"],
    alert: ["title", "message", "severity", "action", "timestamp"],
  },
  functions: {
    date: ["format", "add", "subtract", "diff"],
    currency: ["format", "symbol"],
    phone: ["format", "mask"],
    string: ["upper", "lower", "title", "truncate"],
    conditional: ["if", "unless", "switch"],
  },
};
exports.WEBHOOK_EVENTS = {
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_DELIVERED: "notification.delivered",
  NOTIFICATION_FAILED: "notification.failed",
  NOTIFICATION_OPENED: "notification.opened",
  NOTIFICATION_CLICKED: "notification.clicked",
  AUTOMATION_TRIGGERED: "automation.triggered",
  AUTOMATION_COMPLETED: "automation.completed",
  AUTOMATION_FAILED: "automation.failed",
};
// ============================================================================
// EXPORTAÇÕES
// ============================================================================
var types_2 = require("./types");
Object.defineProperty(exports, "NotificationChannel", {
  enumerable: true,
  get: () => types_2.NotificationChannel,
});
Object.defineProperty(exports, "NotificationPriority", {
  enumerable: true,
  get: () => types_2.NotificationPriority,
});
exports.config = createNotificationConfig();
exports.default = exports.config;
