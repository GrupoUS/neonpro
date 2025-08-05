/**
 * NeonPro Notification System - Template Engine
 * Story 1.7: Sistema de Notificações
 *
 * Engine para renderização de templates de notificação
 * Suporte a variáveis, condicionais e formatação
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
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
var types_1 = require("./types");
// ============================================================================
// TEMPLATE ENGINE CLASS
// ============================================================================
/**
 * Engine de templates para notificações
 */
var TemplateEngine = /** @class */ (() => {
  function TemplateEngine() {
    this.templates = new Map();
    this.functions = new Map();
    this.isInitialized = false;
  }
  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================
  /**
   * Inicializa o template engine
   */
  TemplateEngine.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.registerDefaultFunctions();
            return [4 /*yield*/, this.loadDefaultTemplates()];
          case 1:
            _a.sent();
            this.isInitialized = true;
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Registra funções padrão do template
   */
  TemplateEngine.prototype.registerDefaultFunctions = function () {
    // Formatação de data
    this.functions.set("formatDate", (context) => (date, format) => {
      if (format === void 0) {
        format = "dd/MM/yyyy";
      }
      var d = typeof date === "string" ? new Date(date) : date;
      return this.formatDate(d, format);
    });
    // Formatação de moeda
    this.functions.set("formatCurrency", (context) => (value, currency) => {
      if (currency === void 0) {
        currency = "BRL";
      }
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
      }).format(value);
    });
    // Formatação de telefone
    this.functions.set("formatPhone", (context) => (phone) => {
      var cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return "("
          .concat(cleaned.slice(0, 2), ") ")
          .concat(cleaned.slice(2, 7), "-")
          .concat(cleaned.slice(7));
      }
      return phone;
    });
    // Saudação baseada no horário
    this.functions.set("greeting", (context) => () => {
      var hour = new Date().getHours();
      if (hour < 12) return "Bom dia";
      if (hour < 18) return "Boa tarde";
      return "Boa noite";
    });
    // Nome do primeiro nome
    this.functions.set("firstName", (context) => (fullName) => fullName.split(" ")[0]);
  };
  // ============================================================================
  // GERENCIAMENTO DE TEMPLATES
  // ============================================================================
  /**
   * Adiciona um template
   */
  TemplateEngine.prototype.addTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.templates.set(template.id, template);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Obtém template por ID
   */
  TemplateEngine.prototype.getTemplate = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.templates.get(templateId)];
      });
    });
  };
  /**
   * Obtém template por tipo e canal
   */
  TemplateEngine.prototype.getTemplateByType = function (type, channel) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, template;
      return __generator(this, function (_b) {
        for (_i = 0, _a = this.templates.values(); _i < _a.length; _i++) {
          template = _a[_i];
          if (template.type === type && template.channel === channel && template.isActive) {
            return [2 /*return*/, template];
          }
        }
        // Fallback para template padrão
        return [2 /*return*/, this.getDefaultTemplate(type, channel)];
      });
    });
  };
  /**
   * Lista todos os templates
   */
  TemplateEngine.prototype.getTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, Array.from(this.templates.values())];
      });
    });
  };
  /**
   * Remove template
   */
  TemplateEngine.prototype.removeTemplate = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.templates.delete(templateId);
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  /**
   * Renderiza template com contexto
   */
  TemplateEngine.prototype.render = function (template, context) {
    return __awaiter(this, void 0, void 0, function () {
      var variables;
      return __generator(this, function (_a) {
        if (!template) {
          return [
            2 /*return*/,
            {
              title: context.data.title || "Notificação",
              body: context.data.message || "Você tem uma nova notificação.",
              variables: {},
            },
          ];
        }
        variables = this.extractVariables(context);
        return [
          2 /*return*/,
          {
            subject: template.subject
              ? this.renderString(template.subject, variables, context)
              : undefined,
            title: this.renderString(template.title, variables, context),
            body: this.renderString(template.body, variables, context),
            variables: variables,
          },
        ];
      });
    });
  };
  /**
   * Renderiza string com variáveis
   */
  TemplateEngine.prototype.renderString = function (template, variables, context) {
    var result = template;
    // Substituir variáveis simples {{variable}}
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, varName) => {
      var value = this.getVariableValue(varName.trim(), variables, context);
      return value !== undefined ? String(value) : match;
    });
    // Processar funções {%function(args)%}
    result = result.replace(/\{%\s*([^}]+)\s*%\}/g, (match, funcCall) => {
      try {
        var value = this.evaluateFunction(funcCall.trim(), context);
        return value !== undefined ? String(value) : match;
      } catch (error) {
        console.warn("Erro ao avaliar fun\u00E7\u00E3o: ".concat(funcCall), error);
        return match;
      }
    });
    // Processar condicionais {?condition}content{/condition}
    result = result.replace(
      /\{\?\s*([^}]+)\s*\}([\s\S]*?)\{\/\1\}/g,
      (match, condition, content) => {
        try {
          var shouldShow = this.evaluateCondition(condition.trim(), variables, context);
          return shouldShow ? content : "";
        } catch (error) {
          console.warn("Erro ao avaliar condi\u00E7\u00E3o: ".concat(condition), error);
          return "";
        }
      },
    );
    return result;
  };
  /**
   * Extrai variáveis do contexto
   */
  TemplateEngine.prototype.extractVariables = (context) =>
    __assign(
      __assign(
        {
          // Dados do destinatário
          recipient: {
            id: context.recipient.id,
            email: context.recipient.email,
            phone: context.recipient.phone,
            timezone: context.recipient.timezone,
            language: context.recipient.language,
          },
          // Dados da clínica
          clinic: context.clinic,
        },
        context.data,
      ),
      {
        // Dados de sistema
        timestamp: context.timestamp,
        locale: context.locale,
        // Dados de data/hora
        now: new Date(),
        today: new Date().toISOString().split("T")[0],
        // URLs úteis
        urls: {
          app: process.env.NEXT_PUBLIC_APP_URL || "https://app.neonpro.com",
          unsubscribe: ""
            .concat(process.env.NEXT_PUBLIC_APP_URL, "/unsubscribe?token=")
            .concat(context.recipient.id),
          preferences: ""
            .concat(process.env.NEXT_PUBLIC_APP_URL, "/preferences?token=")
            .concat(context.recipient.id),
        },
      },
    );
  /**
   * Obtém valor de variável com suporte a notação de ponto
   */
  TemplateEngine.prototype.getVariableValue = (path, variables, context) => {
    var keys = path.split(".");
    var value = variables;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
      var key = keys_1[_i];
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  };
  /**
   * Avalia função do template
   */
  TemplateEngine.prototype.evaluateFunction = function (funcCall, context) {
    // Parse simples de função: functionName(arg1, arg2)
    var match = funcCall.match(/^(\w+)\((.*)\)$/);
    if (!match) {
      throw new Error("Formato de fun\u00E7\u00E3o inv\u00E1lido: ".concat(funcCall));
    }
    var funcName = match[1],
      argsStr = match[2];
    var func = this.functions.get(funcName);
    if (!func) {
      throw new Error("Fun\u00E7\u00E3o n\u00E3o encontrada: ".concat(funcName));
    }
    // Parse simples de argumentos (sem suporte a objetos complexos)
    var args = argsStr
      ? argsStr.split(",").map((arg) => {
          var trimmed = arg.trim();
          // String literal
          if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.slice(1, -1);
          }
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
          }
          // Número
          if (/^\d+(\.\d+)?$/.test(trimmed)) {
            return parseFloat(trimmed);
          }
          // Boolean
          if (trimmed === "true") return true;
          if (trimmed === "false") return false;
          // Variável
          return this.getVariableValue(trimmed, this.extractVariables(context), context);
        })
      : [];
    var templateFunc = func(context);
    return templateFunc.apply(void 0, args);
  };
  /**
   * Avalia condição do template
   */
  TemplateEngine.prototype.evaluateCondition = function (condition, variables, context) {
    // Condições simples: variable, !variable, variable == value
    condition = condition.trim();
    // Negação
    if (condition.startsWith("!")) {
      var varName = condition.slice(1).trim();
      var value_1 = this.getVariableValue(varName, variables, context);
      return !value_1;
    }
    // Comparação
    var operators = ["==", "!=", ">", "<", ">=", "<="];
    for (var _i = 0, operators_1 = operators; _i < operators_1.length; _i++) {
      var op = operators_1[_i];
      if (condition.includes(op)) {
        var _a = condition.split(op).map((s) => s.trim()),
          left = _a[0],
          right = _a[1];
        var leftValue = this.getVariableValue(left, variables, context);
        var rightValue = this.parseValue(right, variables, context);
        switch (op) {
          case "==":
            return leftValue == rightValue;
          case "!=":
            return leftValue != rightValue;
          case ">":
            return leftValue > rightValue;
          case "<":
            return leftValue < rightValue;
          case ">=":
            return leftValue >= rightValue;
          case "<=":
            return leftValue <= rightValue;
        }
      }
    }
    // Existência da variável
    var value = this.getVariableValue(condition, variables, context);
    return !!value;
  };
  /**
   * Parse de valor (string, número, variável)
   */
  TemplateEngine.prototype.parseValue = function (value, variables, context) {
    value = value.trim();
    // String literal
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      return value.slice(1, -1);
    }
    // Número
    if (/^\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value);
    }
    // Boolean
    if (value === "true") return true;
    if (value === "false") return false;
    // Variável
    return this.getVariableValue(value, variables, context);
  };
  // ============================================================================
  // TEMPLATES PADRÃO
  // ============================================================================
  /**
   * Carrega templates padrão
   */
  TemplateEngine.prototype.loadDefaultTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultTemplates, _i, defaultTemplates_1, template;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            defaultTemplates = this.getDefaultTemplates();
            (_i = 0), (defaultTemplates_1 = defaultTemplates);
            _a.label = 1;
          case 1:
            if (!(_i < defaultTemplates_1.length)) return [3 /*break*/, 4];
            template = defaultTemplates_1[_i];
            return [4 /*yield*/, this.addTemplate(template)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém template padrão para tipo e canal
   */
  TemplateEngine.prototype.getDefaultTemplate = function (type, channel) {
    var templates = this.getDefaultTemplates();
    var template = templates.find((t) => t.type === type && t.channel === channel);
    if (template) {
      return template;
    }
    // Template genérico
    return {
      id: "default_".concat(type, "_").concat(channel),
      name: "Default ".concat(type, " ").concat(channel),
      type: type,
      channel: channel,
      title: "{{data.title}}",
      body: "{{data.message}}",
      variables: ["data.title", "data.message"],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  /**
   * Define templates padrão do sistema
   */
  TemplateEngine.prototype.getDefaultTemplates = () => [
    // Templates de Agendamento - Email
    {
      id: "appointment_created_email",
      name: "Agendamento Criado - Email",
      type: types_1.NotificationType.APPOINTMENT_CREATED,
      channel: types_1.NotificationChannel.EMAIL,
      subject: "Agendamento Confirmado - {{clinic.name}}",
      title: "Seu agendamento foi confirmado!",
      body: '\n          <h2>{%greeting()%}, {{firstName(recipient.name)}}!</h2>\n          \n          <p>Seu agendamento foi confirmado com sucesso:</p>\n          \n          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">\n            <h3>Detalhes do Agendamento</h3>\n            <p><strong>Procedimento:</strong> {{appointment.procedure}}</p>\n            <p><strong>Data:</strong> {{formatDate(appointment.date, \'dd/MM/yyyy\')}}</p>\n            <p><strong>Hor\u00E1rio:</strong> {{appointment.time}}</p>\n            <p><strong>Profissional:</strong> {{appointment.professional}}</p>\n            {?appointment.location}<p><strong>Local:</strong> {{appointment.location}}</p>{/appointment.location}\n          </div>\n          \n          <p>Chegue com 15 minutos de anteced\u00EAncia.</p>\n          \n          <p>Em caso de d\u00FAvidas, entre em contato:</p>\n          <p>\uD83D\uDCDE {{formatPhone(clinic.contact.phone)}}</p>\n          <p>\u2709\uFE0F {{clinic.contact.email}}</p>\n          \n          <hr>\n          <p style="font-size: 12px; color: #666;">\n            {{clinic.name}}<br>\n            {{clinic.contact.address}}\n          </p>\n        ',
      variables: [
        "recipient.name",
        "appointment.procedure",
        "appointment.date",
        "appointment.time",
        "appointment.professional",
        "appointment.location",
        "clinic.name",
        "clinic.contact.phone",
        "clinic.contact.email",
        "clinic.contact.address",
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Templates de Agendamento - SMS
    {
      id: "appointment_reminder_sms",
      name: "Lembrete de Agendamento - SMS",
      type: types_1.NotificationType.APPOINTMENT_REMINDER,
      channel: types_1.NotificationChannel.SMS,
      title: "Lembrete de Consulta",
      body: "\n          \uD83C\uDFE5 {{clinic.name}}\n          \n          Ol\u00E1 {{firstName(recipient.name)}}! Lembrete da sua consulta:\n          \n          \uD83D\uDCC5 {{formatDate(appointment.date, 'dd/MM')}}\n          \uD83D\uDD50 {{appointment.time}}\n          \uD83D\uDC68\u200D\u2695\uFE0F {{appointment.professional}}\n          \n          Chegue 15min antes.\n          \n          Para cancelar: {{urls.app}}/cancel/{{appointment.id}}\n        ",
      variables: [
        "recipient.name",
        "appointment.date",
        "appointment.time",
        "appointment.professional",
        "appointment.id",
        "clinic.name",
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Templates de Sistema - In-App
    {
      id: "system_alert_in_app",
      name: "Alerta do Sistema - In-App",
      type: types_1.NotificationType.SYSTEM_ALERT,
      channel: types_1.NotificationChannel.IN_APP,
      title: "{{alert.title}}",
      body: '\n          <div class="alert alert-{{alert.severity}}">\n            <h4>{{alert.title}}</h4>\n            <p>{{alert.message}}</p>\n            \n            {?alert.action}\n            <button onclick="{{alert.action.handler}}">\n              {{alert.action.label}}\n            </button>\n            {/alert.action}\n            \n            <small>{{formatDate(timestamp, \'dd/MM/yyyy HH:mm\')}}</small>\n          </div>\n        ',
      variables: [
        "alert.title",
        "alert.message",
        "alert.severity",
        "alert.action.label",
        "alert.action.handler",
        "timestamp",
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Templates de Pagamento - Email
    {
      id: "payment_received_email",
      name: "Pagamento Recebido - Email",
      type: types_1.NotificationType.PAYMENT_RECEIVED,
      channel: types_1.NotificationChannel.EMAIL,
      subject: "Pagamento Confirmado - {{clinic.name}}",
      title: "Pagamento confirmado!",
      body: "\n          <h2>Pagamento Confirmado</h2>\n          \n          <p>Ol\u00E1 {{firstName(recipient.name)}},</p>\n          \n          <p>Confirmamos o recebimento do seu pagamento:</p>\n          \n          <div style=\"background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n            <h3>Detalhes do Pagamento</h3>\n            <p><strong>Valor:</strong> {{formatCurrency(payment.amount)}}</p>\n            <p><strong>M\u00E9todo:</strong> {{payment.method}}</p>\n            <p><strong>Data:</strong> {{formatDate(payment.date, 'dd/MM/yyyy HH:mm')}}</p>\n            <p><strong>Refer\u00EAncia:</strong> {{payment.reference}}</p>\n          </div>\n          \n          <p>Obrigado pela prefer\u00EAncia!</p>\n          \n          <p>Atenciosamente,<br>{{clinic.name}}</p>\n        ",
      variables: [
        "recipient.name",
        "payment.amount",
        "payment.method",
        "payment.date",
        "payment.reference",
        "clinic.name",
      ],
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================
  /**
   * Formata data
   */
  TemplateEngine.prototype.formatDate = (date, format) => {
    var day = date.getDate().toString().padStart(2, "0");
    var month = (date.getMonth() + 1).toString().padStart(2, "0");
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    return format
      .replace("dd", day)
      .replace("MM", month)
      .replace("yyyy", year.toString())
      .replace("HH", hours)
      .replace("mm", minutes);
  };
  /**
   * Valida template
   */
  TemplateEngine.prototype.validateTemplate = (template) => {
    var errors = [];
    if (!template.title.trim()) {
      errors.push("Título é obrigatório");
    }
    if (!template.body.trim()) {
      errors.push("Corpo é obrigatório");
    }
    // Validar sintaxe de variáveis
    var variableRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    var functionRegex = /\{%\s*([^}]+)\s*%\}/g;
    var conditionalRegex = /\{\?\s*([^}]+)\s*\}/g;
    var match;
    // Verificar variáveis
    while ((match = variableRegex.exec(template.body)) !== null) {
      var varName = match[1].trim();
      if (!varName) {
        errors.push("Vari\u00E1vel vazia encontrada: ".concat(match[0]));
      }
    }
    // Verificar funções
    while ((match = functionRegex.exec(template.body)) !== null) {
      var funcCall = match[1].trim();
      if (!funcCall.includes("(") || !funcCall.includes(")")) {
        errors.push("Sintaxe de fun\u00E7\u00E3o inv\u00E1lida: ".concat(match[0]));
      }
    }
    return errors;
  };
  return TemplateEngine;
})();
exports.TemplateEngine = TemplateEngine;
exports.default = TemplateEngine;
