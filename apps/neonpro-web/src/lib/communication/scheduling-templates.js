"use strict";
/**
 * Intelligent Scheduling Communication Templates
 * Story 5.3: Automated Communication for Scheduling
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulingTemplateEngine = exports.SchedulingTemplateEngine = void 0;
var SchedulingTemplateEngine = /** @class */ (function () {
  function SchedulingTemplateEngine() {
    this.templates = new Map();
    this.initializeDefaultTemplates();
  }
  /**
   * Initialize default intelligent templates for scheduling
   */
  SchedulingTemplateEngine.prototype.initializeDefaultTemplates = function () {
    // 24h Reminder Template - High Priority Services
    this.templates.set("reminder_24h_high_priority", {
      id: "reminder_24h_high_priority",
      name: "Lembrete 24h - Serviços Prioritários",
      type: "reminder",
      channels: ["whatsapp", "sms"],
      timing: "24h",
      conditions: [
        {
          field: "service_category",
          operator: "in_range",
          value: ["cirurgia", "botox", "preenchimento", "laser"],
        },
        {
          field: "appointment_value",
          operator: "greater_than",
          value: 500,
          logic: "OR",
        },
      ],
      content: {
        whatsapp: {
          text: "\uD83E\uDE7A Ol\u00E1 {{patientName}}! \n\n{{timeGreeting}}! Lembramos que voc\u00EA tem seu procedimento de {{serviceName}} agendado para amanh\u00E3 ({{appointmentDate}}) \u00E0s {{appointmentTime}} com {{professionalName}}.\n\n\uD83D\uDCCB *Orienta\u00E7\u00F5es importantes:*\n{{#if isHighRiskService}}\n\u2022 Jejum de 8h antes do procedimento\n\u2022 N\u00E3o use maquiagem na regi\u00E3o\n\u2022 Traga acompanhante\n{{/if}}\n\n{{#if hasNoShowHistory}}\n\u26A0\uFE0F Sua presen\u00E7a \u00E9 muito importante. Caso n\u00E3o possa comparecer, avise com anteced\u00EAncia.\n{{/if}}\n\n\u2705 Digite *CONFIRMO* para confirmar\n\u274C Digite *CANCELO* se n\u00E3o puder comparecer\n\uD83D\uDCC5 Digite *REAGENDO* para remarcar\n\n{{clinicName}} - {{clinicPhone}}",
          buttons: [
            { type: "quick_reply", title: "Confirmar", payload: "CONFIRM" },
            { type: "quick_reply", title: "Cancelar", payload: "CANCEL" },
            { type: "quick_reply", title: "Reagendar", payload: "RESCHEDULE" },
          ],
        },
        sms: {
          text: "\uD83E\uDE7A {{patientName}}, lembrete: {{serviceName}} amanh\u00E3 {{appointmentDate}} \u00E0s {{appointmentTime}} com {{professionalName}}. {{#if hasNoShowHistory}}Sua presen\u00E7a \u00E9 importante!{{/if}} Responda: CONFIRMO/CANCELO/REAGENDO. {{clinicName}}",
          maxLength: 160,
        },
      },
      variables: [
        "patientName",
        "serviceName",
        "appointmentDate",
        "appointmentTime",
        "professionalName",
        "clinicName",
        "clinicPhone",
        "timeGreeting",
        "isHighRiskService",
        "hasNoShowHistory",
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: true,
        useWeatherContext: false,
        usePreviousHistory: true,
        useNoShowRisk: true,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // 2h Reminder Template - All Services
    this.templates.set("reminder_2h_all_services", {
      id: "reminder_2h_all_services",
      name: "Lembrete 2h - Todos os Serviços",
      type: "reminder",
      channels: ["sms", "whatsapp"],
      timing: "2h",
      conditions: [],
      content: {
        sms: {
          text: "\u23F0 {{patientName}}, em 2h voc\u00EA tem {{serviceName}} \u00E0s {{appointmentTime}} com {{professionalName}}. {{weatherAlert}} Confirme: SIM/NAO. {{clinicName}}",
          maxLength: 160,
        },
        whatsapp: {
          text: "\u23F0 Oi {{patientName}}!\n\nSeu {{serviceName}} \u00E9 daqui a 2 horas ({{appointmentTime}}) com {{professionalName}}.\n\n{{#if weatherAlert}}\n\uD83C\uDF27\uFE0F {{weatherAlert}}\n{{/if}}\n\n{{#if trafficAlert}}\n\uD83D\uDE97 {{trafficAlert}}\n{{/if}}\n\nNos vemos em breve! \uD83D\uDC9A\n\n{{clinicName}}",
          buttons: [
            { type: "quick_reply", title: "A caminho!", payload: "CONFIRMED" },
            { type: "quick_reply", title: "Atraso", payload: "DELAY" },
          ],
        },
      },
      variables: [
        "patientName",
        "serviceName",
        "appointmentTime",
        "professionalName",
        "clinicName",
        "weatherAlert",
        "trafficAlert",
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: true,
        usePreviousHistory: false,
        useNoShowRisk: false,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // No-Show Prevention Template - High Risk Patients
    this.templates.set("no_show_prevention_high_risk", {
      id: "no_show_prevention_high_risk",
      name: "Prevenção No-Show - Alto Risco",
      type: "no_show_prevention",
      channels: ["whatsapp", "sms", "email"],
      timing: "4h",
      conditions: [
        {
          field: "no_show_probability",
          operator: "greater_than",
          value: 0.7,
        },
      ],
      content: {
        whatsapp: {
          text: "\uD83D\uDEA8 {{patientName}}, confirma\u00E7\u00E3o URGENTE necess\u00E1ria!\n\nSeu {{serviceName}} \u00E9 hoje \u00E0s {{appointmentTime}} com {{professionalName}}.\n\n\u26A0\uFE0F Notamos que voc\u00EA pode ter dificuldades para comparecer. Queremos ajudar!\n\n\uD83C\uDFAF Op\u00E7\u00F5es dispon\u00EDveis:\n\u2705 Manter agendamento\n\uD83D\uDCC5 Reagendar sem taxa\n\uD83D\uDCAC Falar com atendimento\n\nSua agenda est\u00E1 reservada e outras pessoas aguardam. Por favor, confirme sua situa\u00E7\u00E3o.\n\n{{clinicName}} - Fone: {{clinicPhone}}",
          buttons: [
            { type: "quick_reply", title: "Confirmo presença", payload: "CONFIRM_PRESENCE" },
            { type: "quick_reply", title: "Preciso reagendar", payload: "NEED_RESCHEDULE" },
            { type: "phone", title: "Ligar agora", phone: "{{clinicPhone}}" },
          ],
        },
        email: {
          subject: "URGENTE: Confirmação necessária - {{serviceName}} hoje",
          html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h2 style="color: #e74c3c;">\uD83D\uDEA8 Confirma\u00E7\u00E3o Urgente Necess\u00E1ria</h2>\n              \n              <p>Ol\u00E1 <strong>{{patientName}}</strong>,</p>\n              \n              <p>Seu procedimento de <strong>{{serviceName}}</strong> est\u00E1 agendado para hoje \u00E0s <strong>{{appointmentTime}}</strong> com {{professionalName}}.</p>\n              \n              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">\n                <strong>\u26A0\uFE0F Detectamos que voc\u00EA pode ter dificuldades para comparecer.</strong><br>\n                Queremos ajudar voc\u00EA a resolver essa situa\u00E7\u00E3o!\n              </div>\n              \n              <h3>\uD83C\uDFAF Suas op\u00E7\u00F5es:</h3>\n              <ul>\n                <li>\u2705 <strong>Manter o agendamento</strong> - Confirme sua presen\u00E7a</li>\n                <li>\uD83D\uDCC5 <strong>Reagendar sem taxa</strong> - Escolha nova data</li>\n                <li>\uD83D\uDCAC <strong>Falar conosco</strong> - Tire suas d\u00FAvidas</li>\n              </ul>\n              \n              <p><strong>Sua agenda est\u00E1 reservada e outras pessoas aguardam na lista de espera.</strong></p>\n              \n              <div style="text-align: center; margin: 30px 0;">\n                <a href="{{confirmationUrl}}" style="background: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 5px;">Confirmar Presen\u00E7a</a>\n                <a href="{{rescheduleUrl}}" style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 5px;">Reagendar</a>\n              </div>\n              \n              <p>Atenciosamente,<br><strong>{{clinicName}}</strong><br>\uD83D\uDCDE {{clinicPhone}}</p>\n            </div>\n          ',
          text: "URGENTE: {{patientName}}, seu {{serviceName}} \u00E9 hoje \u00E0s {{appointmentTime}}. Detectamos poss\u00EDvel dificuldade de comparecimento. Confirme presen\u00E7a ou reagende sem taxa. {{clinicName}} - {{clinicPhone}}",
        },
      },
      variables: [
        "patientName",
        "serviceName",
        "appointmentTime",
        "professionalName",
        "clinicName",
        "clinicPhone",
        "confirmationUrl",
        "rescheduleUrl",
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: false,
        usePreviousHistory: true,
        useNoShowRisk: true,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Waitlist Notification Template
    this.templates.set("waitlist_slot_available", {
      id: "waitlist_slot_available",
      name: "Vaga Disponível - Lista de Espera",
      type: "waitlist",
      channels: ["whatsapp", "sms"],
      timing: "immediate",
      conditions: [],
      content: {
        whatsapp: {
          text: "\uD83C\uDF89 \u00D3tima not\u00EDcia, {{patientName}}!\n\nUma vaga para {{serviceName}} com {{professionalName}} ficou dispon\u00EDvel:\n\n\uD83D\uDCC5 Data: {{appointmentDate}}\n\u23F0 Hor\u00E1rio: {{appointmentTime}}\n\uD83C\uDFE5 Local: {{clinicName}}\n\n\u23F0 Voc\u00EA tem 30 minutos para confirmar antes da vaga ser oferecida para o pr\u00F3ximo da lista.\n\n\u2705 Digite *ACEITO* para confirmar\n\u274C Digite *RECUSO* se n\u00E3o puder\n\nN\u00E3o perca essa oportunidade! \uD83D\uDC9A",
          buttons: [
            { type: "quick_reply", title: "ACEITO", payload: "ACCEPT_SLOT" },
            { type: "quick_reply", title: "RECUSO", payload: "DECLINE_SLOT" },
          ],
        },
        sms: {
          text: "\uD83C\uDF89 {{patientName}}, vaga dispon\u00EDvel! {{serviceName}} - {{appointmentDate}} {{appointmentTime}} com {{professionalName}}. 30min para confirmar. ACEITO/RECUSO. {{clinicName}}",
          maxLength: 160,
        },
      },
      variables: [
        "patientName",
        "serviceName",
        "professionalName",
        "appointmentDate",
        "appointmentTime",
        "clinicName",
      ],
      personalization: {
        usePatientName: true,
        useProfessionalName: true,
        useServiceName: true,
        useTimeOfDay: false,
        useWeatherContext: false,
        usePreviousHistory: false,
        useNoShowRisk: false,
      },
      analytics: {
        totalSent: 0,
        deliveryRate: 0,
        openRate: 0,
        responseRate: 0,
        confirmationRate: 0,
        cancellationRate: 0,
        noShowReduction: 0,
        costPerMessage: 0,
        roi: 0,
        lastUpdated: new Date(),
      },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };
  /**
   * Get template by ID
   */
  SchedulingTemplateEngine.prototype.getTemplate = function (templateId) {
    return this.templates.get(templateId);
  };
  /**
   * Get templates by type and conditions
   */
  SchedulingTemplateEngine.prototype.getTemplatesByType = function (type, conditions) {
    var _this = this;
    return Array.from(this.templates.values())
      .filter(function (template) {
        return template.type === type && template.active;
      })
      .filter(function (template) {
        return _this.matchesConditions(template, conditions);
      });
  };
  /**
   * Select best template based on appointment and patient data
   */
  SchedulingTemplateEngine.prototype.selectBestTemplate = function (
    type,
    appointmentData,
    patientData,
    noShowPrediction,
  ) {
    var _this = this;
    var availableTemplates = this.getTemplatesByType(type);
    if (availableTemplates.length === 0) {
      return null;
    }
    // Combine all data for condition matching
    var contextData = __assign(
      __assign(__assign({}, appointmentData || {}), patientData || {}),
      noShowPrediction || {},
    );
    // Find templates that match conditions
    var matchingTemplates = availableTemplates.filter(function (template) {
      return _this.matchesConditions(template, contextData);
    });
    if (matchingTemplates.length === 0) {
      // Return first available template as fallback
      return availableTemplates[0];
    }
    // Select template with best performance (highest response rate)
    return matchingTemplates.reduce(function (best, current) {
      return current.analytics.responseRate > best.analytics.responseRate ? current : best;
    });
  };
  /**
   * Check if template conditions match the provided data
   */
  SchedulingTemplateEngine.prototype.matchesConditions = function (template, data) {
    if (template.conditions.length === 0) {
      return true;
    }
    if (!data) {
      return false;
    }
    return template.conditions.every(function (condition) {
      var fieldValue = data[condition.field];
      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "greater_than":
          return fieldValue > condition.value;
        case "less_than":
          return fieldValue < condition.value;
        case "contains":
          return Array.isArray(fieldValue)
            ? fieldValue.includes(condition.value)
            : String(fieldValue).includes(String(condition.value));
        case "in_range":
          return Array.isArray(condition.value)
            ? condition.value.includes(fieldValue)
            : fieldValue >= condition.value.min && fieldValue <= condition.value.max;
        default:
          return false;
      }
    });
  };
  /**
   * Render template with personalized content
   */
  SchedulingTemplateEngine.prototype.renderTemplate = function (template, channel, variables) {
    return __awaiter(this, void 0, void 0, function () {
      var content, personalizedVariables;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            content = template.content[channel];
            if (!content) {
              throw new Error("Template does not support channel: ".concat(channel));
            }
            return [
              4 /*yield*/,
              this.applyPersonalization(template.personalization, variables),
              // Render template based on channel
            ];
          case 1:
            personalizedVariables = _a.sent();
            // Render template based on channel
            switch (channel) {
              case "sms":
                return [2 /*return*/, this.renderText(content.text, personalizedVariables)];
              case "email":
                return [
                  2 /*return*/,
                  {
                    subject: this.renderText(content.subject, personalizedVariables),
                    html: this.renderText(content.html, personalizedVariables),
                    text: this.renderText(content.text, personalizedVariables),
                  },
                ];
              case "whatsapp":
                return [
                  2 /*return*/,
                  {
                    text: this.renderText(content.text, personalizedVariables),
                    buttons: content.buttons,
                    media: content.media,
                  },
                ];
              default:
                throw new Error("Unsupported channel: ".concat(channel));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Apply personalization rules to variables
   */
  SchedulingTemplateEngine.prototype.applyPersonalization = function (rules, variables) {
    return __awaiter(this, void 0, void 0, function () {
      var personalized, hour;
      return __generator(this, function (_a) {
        personalized = __assign({}, variables);
        // Add time-based greeting
        if (rules.useTimeOfDay) {
          hour = new Date().getHours();
          if (hour < 12) {
            personalized.timeGreeting = "Bom dia";
          } else if (hour < 18) {
            personalized.timeGreeting = "Boa tarde";
          } else {
            personalized.timeGreeting = "Boa noite";
          }
        }
        // Add weather context (simplified example)
        if (rules.useWeatherContext) {
          // In a real implementation, this would fetch weather data
          personalized.weatherAlert = "Previsão de chuva - saia um pouco mais cedo!";
        }
        // Add no-show risk context
        if (rules.useNoShowRisk && variables.no_show_probability) {
          personalized.hasNoShowHistory = variables.no_show_probability > 0.5;
          personalized.isHighRiskService = variables.service_category === "cirurgia";
        }
        return [2 /*return*/, personalized];
      });
    });
  };
  /**
   * Simple template rendering with variable substitution
   */
  SchedulingTemplateEngine.prototype.renderText = function (template, variables) {
    var rendered = template;
    // Replace simple variables {{variable}}
    Object.keys(variables).forEach(function (key) {
      var regex = new RegExp("{{".concat(key, "}}"), "g");
      rendered = rendered.replace(regex, String(variables[key] || ""));
    });
    // Handle simple conditionals {{#if condition}}...{{/if}}
    rendered = rendered.replace(
      /{{#if (\w+)}}(.*?){{\/if}}/gs,
      function (match, condition, content) {
        return variables[condition] ? content : "";
      },
    );
    return rendered;
  };
  /**
   * Update template analytics
   */
  SchedulingTemplateEngine.prototype.updateAnalytics = function (templateId, metrics) {
    var template = this.templates.get(templateId);
    if (template) {
      template.analytics = __assign(__assign(__assign({}, template.analytics), metrics), {
        lastUpdated: new Date(),
      });
    }
  };
  /**
   * Get all active templates
   */
  SchedulingTemplateEngine.prototype.getAllActiveTemplates = function () {
    return Array.from(this.templates.values()).filter(function (t) {
      return t.active;
    });
  };
  /**
   * Add custom template
   */
  SchedulingTemplateEngine.prototype.addTemplate = function (template) {
    this.templates.set(template.id, template);
  };
  /**
   * Remove template
   */
  SchedulingTemplateEngine.prototype.removeTemplate = function (templateId) {
    this.templates.delete(templateId);
  };
  return SchedulingTemplateEngine;
})();
exports.SchedulingTemplateEngine = SchedulingTemplateEngine;
exports.schedulingTemplateEngine = new SchedulingTemplateEngine();
