"use strict";
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
exports.TemplateEngine = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../auth/audit/audit-logger");
var TemplateEngine = /** @class */ (function () {
  function TemplateEngine() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.templateCache = new Map();
    this.variableCache = new Map();
  }
  /**
   * Renderiza um template com os dados fornecidos
   */
  TemplateEngine.prototype.render = function (templateId, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        template,
        variables,
        renderedContent,
        renderedSubject,
        variablesUsed,
        result,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 11]);
            return [4 /*yield*/, this.getTemplate(templateId)];
          case 2:
            template = _a.sent();
            if (!template) {
              throw new Error("Template ".concat(templateId, " n\u00E3o encontrado"));
            }
            if (!template.is_active) {
              throw new Error("Template ".concat(templateId, " est\u00E1 inativo"));
            }
            return [4 /*yield*/, this.getTemplateVariables(templateId)];
          case 3:
            variables = _a.sent();
            // Validar contexto
            return [4 /*yield*/, this.validateContext(context, variables)];
          case 4:
            // Validar contexto
            _a.sent();
            return [4 /*yield*/, this.renderContent(template.content, context)];
          case 5:
            renderedContent = _a.sent();
            renderedSubject = void 0;
            if (!template.subject) return [3 /*break*/, 7];
            return [4 /*yield*/, this.renderContent(template.subject, context)];
          case 6:
            renderedSubject = _a.sent();
            _a.label = 7;
          case 7:
            variablesUsed = this.extractUsedVariables(template.content, template.subject);
            result = {
              subject: renderedSubject,
              content: renderedContent,
              variables_used: variablesUsed,
              render_time_ms: Date.now() - startTime,
              template_version: template.version,
            };
            // Log de auditoria
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "template_rendered",
                resource_type: "notification_template",
                resource_id: templateId,
                details: {
                  render_time_ms: result.render_time_ms,
                  variables_used: variablesUsed,
                  template_version: template.version,
                },
              }),
            ];
          case 8:
            // Log de auditoria
            _a.sent();
            return [2 /*return*/, result];
          case 9:
            error_1 = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "template_render_error",
                resource_type: "notification_template",
                resource_id: templateId,
                details: {
                  error: error_1.message,
                  render_time_ms: Date.now() - startTime,
                },
              }),
            ];
          case 10:
            _a.sent();
            throw error_1;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém um template por ID
   */
  TemplateEngine.prototype.getTemplate = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Verificar cache primeiro
            if (this.templateCache.has(templateId)) {
              return [2 /*return*/, this.templateCache.get(templateId)];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_templates")
                .select("*")
                .eq("id", templateId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              throw error;
            }
            if (data) {
              // Adicionar ao cache
              this.templateCache.set(templateId, data);
              return [2 /*return*/, data];
            }
            return [2 /*return*/, null];
          case 3:
            error_2 = _b.sent();
            throw new Error("Erro ao buscar template: ".concat(error_2));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cria um novo template
   */
  TemplateEngine.prototype.createTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            // Validar template
            return [4 /*yield*/, this.validateTemplate(template)];
          case 1:
            // Validar template
            _b.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_templates")
                .insert(
                  __assign(__assign({}, template), {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                )
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Adicionar ao cache
            this.templateCache.set(data.id, data);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "template_created",
                resource_type: "notification_template",
                resource_id: data.id,
                user_id: template.created_by,
                details: {
                  name: template.name,
                  type: template.type,
                  channel: template.channel,
                },
              }),
            ];
          case 3:
            _b.sent();
            return [2 /*return*/, data];
          case 4:
            error_3 = _b.sent();
            throw new Error("Erro ao criar template: ".concat(error_3));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Atualiza um template existente
   */
  TemplateEngine.prototype.updateTemplate = function (templateId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var currentTemplate, _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getTemplate(templateId)];
          case 1:
            currentTemplate = _b.sent();
            if (!currentTemplate) {
              throw new Error("Template não encontrado");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("notification_templates")
                .update(
                  __assign(__assign({}, updates), {
                    version: currentTemplate.version + 1,
                    updated_at: new Date().toISOString(),
                  }),
                )
                .eq("id", templateId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Atualizar cache
            this.templateCache.set(templateId, data);
            // Limpar cache de variáveis
            this.variableCache.delete(templateId);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "template_updated",
                resource_type: "notification_template",
                resource_id: templateId,
                details: {
                  updates: updates,
                  new_version: data.version,
                },
              }),
            ];
          case 3:
            _b.sent();
            return [2 /*return*/, data];
          case 4:
            error_4 = _b.sent();
            throw new Error("Erro ao atualizar template: ".concat(error_4));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista templates com filtros
   */
  TemplateEngine.prototype.listTemplates = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("notification_templates")
              .select("*")
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.type) {
              query = query.eq("type", filters.type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.channel) {
              query = query.eq("channel", filters.channel);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined
            ) {
              query = query.eq("is_active", filters.is_active);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.created_by) {
              query = query.eq("created_by", filters.created_by);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.limit) {
              query = query.limit(filters.limit);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.offset) {
              query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 2:
            error_5 = _b.sent();
            throw new Error("Erro ao listar templates: ".concat(error_5));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Deleta um template
   */
  TemplateEngine.prototype.deleteTemplate = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("notification_templates").delete().eq("id", templateId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Remover do cache
            this.templateCache.delete(templateId);
            this.variableCache.delete(templateId);
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "template_deleted",
                resource_type: "notification_template",
                resource_id: templateId,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            throw new Error("Erro ao deletar template: ".concat(error_6));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Valida um template antes de salvar
   */
  TemplateEngine.prototype.validateTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      var variables, allowedVariables, invalidVariables;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Validar campos obrigatórios
            if (!template.name || template.name.trim().length === 0) {
              throw new Error("Nome do template é obrigatório");
            }
            if (!template.content || template.content.trim().length === 0) {
              throw new Error("Conteúdo do template é obrigatório");
            }
            // Validar sintaxe do template
            return [4 /*yield*/, this.validateTemplateSyntax(template.content)];
          case 1:
            // Validar sintaxe do template
            _a.sent();
            if (!template.subject) return [3 /*break*/, 3];
            return [4 /*yield*/, this.validateTemplateSyntax(template.subject)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            variables = this.extractVariables(template.content, template.subject);
            allowedVariables = this.getAllowedVariables();
            invalidVariables = variables.filter(function (v) {
              return !allowedVariables.includes(v);
            });
            if (invalidVariables.length > 0) {
              throw new Error(
                "Vari\u00E1veis inv\u00E1lidas encontradas: ".concat(invalidVariables.join(", ")),
              );
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Preview de um template com dados de exemplo
   */
  TemplateEngine.prototype.previewTemplate = function (templateContent, templateSubject) {
    return __awaiter(this, void 0, void 0, function () {
      var sampleContext, startTime, renderedContent, renderedSubject, variablesUsed, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            sampleContext = {
              user: {
                id: "sample-user-id",
                name: "Maria Silva",
                email: "maria.silva@email.com",
                phone: "+5511999999999",
              },
              appointment: {
                id: "sample-appointment-id",
                date: new Date("2025-02-15"),
                time: "14:30",
                service: "Limpeza de Pele",
                professional: "Dr. João Santos",
                location: "Sala 1",
              },
              payment: {
                id: "sample-payment-id",
                amount: 150.0,
                currency: "BRL",
                due_date: new Date("2025-02-10"),
              },
              clinic: {
                name: "Clínica Estética NeonPro",
                address: "Rua das Flores, 123 - São Paulo/SP",
                phone: "+5511888888888",
                email: "contato@neonpro.com.br",
                website: "https://neonpro.com.br",
              },
            };
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [4 /*yield*/, this.renderContent(templateContent, sampleContext)];
          case 2:
            renderedContent = _a.sent();
            renderedSubject = void 0;
            if (!templateSubject) return [3 /*break*/, 4];
            return [4 /*yield*/, this.renderContent(templateSubject, sampleContext)];
          case 3:
            renderedSubject = _a.sent();
            _a.label = 4;
          case 4:
            variablesUsed = this.extractUsedVariables(templateContent, templateSubject);
            return [
              2 /*return*/,
              {
                subject: renderedSubject,
                content: renderedContent,
                variables_used: variablesUsed,
                render_time_ms: Date.now() - startTime,
                template_version: 1,
              },
            ];
          case 5:
            error_7 = _a.sent();
            throw new Error("Erro no preview do template: ".concat(error_7));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  TemplateEngine.prototype.renderContent = function (content, context) {
    return __awaiter(this, void 0, void 0, function () {
      var rendered, _i, _a, _b, key, value, regex, now;
      return __generator(this, function (_c) {
        rendered = content;
        // Substituir variáveis do usuário
        if (context.user) {
          rendered = rendered.replace(/{{\s*user\.name\s*}}/g, context.user.name || "");
          rendered = rendered.replace(/{{\s*user\.email\s*}}/g, context.user.email || "");
          rendered = rendered.replace(/{{\s*user\.phone\s*}}/g, context.user.phone || "");
        }
        // Substituir variáveis do agendamento
        if (context.appointment) {
          rendered = rendered.replace(
            /{{\s*appointment\.date\s*}}/g,
            context.appointment.date.toLocaleDateString("pt-BR"),
          );
          rendered = rendered.replace(/{{\s*appointment\.time\s*}}/g, context.appointment.time);
          rendered = rendered.replace(
            /{{\s*appointment\.service\s*}}/g,
            context.appointment.service,
          );
          rendered = rendered.replace(
            /{{\s*appointment\.professional\s*}}/g,
            context.appointment.professional,
          );
          rendered = rendered.replace(
            /{{\s*appointment\.location\s*}}/g,
            context.appointment.location || "",
          );
        }
        // Substituir variáveis de pagamento
        if (context.payment) {
          rendered = rendered.replace(
            /{{\s*payment\.amount\s*}}/g,
            context.payment.amount.toLocaleString("pt-BR", {
              style: "currency",
              currency: context.payment.currency || "BRL",
            }),
          );
          if (context.payment.due_date) {
            rendered = rendered.replace(
              /{{\s*payment\.due_date\s*}}/g,
              context.payment.due_date.toLocaleDateString("pt-BR"),
            );
          }
        }
        // Substituir variáveis da clínica
        if (context.clinic) {
          rendered = rendered.replace(/{{\s*clinic\.name\s*}}/g, context.clinic.name);
          rendered = rendered.replace(/{{\s*clinic\.address\s*}}/g, context.clinic.address);
          rendered = rendered.replace(/{{\s*clinic\.phone\s*}}/g, context.clinic.phone);
          rendered = rendered.replace(/{{\s*clinic\.email\s*}}/g, context.clinic.email);
          rendered = rendered.replace(/{{\s*clinic\.website\s*}}/g, context.clinic.website || "");
        }
        // Substituir variáveis customizadas
        if (context.custom) {
          for (_i = 0, _a = Object.entries(context.custom); _i < _a.length; _i++) {
            (_b = _a[_i]), (key = _b[0]), (value = _b[1]);
            regex = new RegExp("{{\\s*custom\\.".concat(key, "\\s*}}"), "g");
            rendered = rendered.replace(regex, String(value));
          }
        }
        now = new Date();
        rendered = rendered.replace(/{{\s*current\.date\s*}}/g, now.toLocaleDateString("pt-BR"));
        rendered = rendered.replace(/{{\s*current\.time\s*}}/g, now.toLocaleTimeString("pt-BR"));
        rendered = rendered.replace(/{{\s*current\.year\s*}}/g, now.getFullYear().toString());
        return [2 /*return*/, rendered];
      });
    });
  };
  TemplateEngine.prototype.validateTemplateSyntax = function (content) {
    return __awaiter(this, void 0, void 0, function () {
      var variableRegex, matches, _i, matches_1, match, variable;
      return __generator(this, function (_a) {
        variableRegex = /{{\s*([^}]+)\s*}}/g;
        matches = content.match(variableRegex);
        if (matches) {
          for (_i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
            match = matches_1[_i];
            variable = match.replace(/[{}\s]/g, "");
            // Verificar se a variável tem formato válido
            if (!/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(variable)) {
              throw new Error("Sintaxe de vari\u00E1vel inv\u00E1lida: ".concat(match));
            }
          }
        }
        return [2 /*return*/];
      });
    });
  };
  TemplateEngine.prototype.extractVariables = function (content, subject) {
    var variables = new Set();
    var variableRegex = /{{\s*([^}]+)\s*}}/g;
    // Extrair do conteúdo
    var match;
    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    // Extrair do subject se existir
    if (subject) {
      variableRegex.lastIndex = 0;
      while ((match = variableRegex.exec(subject)) !== null) {
        variables.add(match[1].trim());
      }
    }
    return Array.from(variables);
  };
  TemplateEngine.prototype.extractUsedVariables = function (content, subject) {
    return this.extractVariables(content, subject);
  };
  TemplateEngine.prototype.getAllowedVariables = function () {
    return [
      "user.name",
      "user.email",
      "user.phone",
      "appointment.date",
      "appointment.time",
      "appointment.service",
      "appointment.professional",
      "appointment.location",
      "payment.amount",
      "payment.due_date",
      "clinic.name",
      "clinic.address",
      "clinic.phone",
      "clinic.email",
      "clinic.website",
      "current.date",
      "current.time",
      "current.year",
    ];
  };
  TemplateEngine.prototype.getTemplateVariables = function (templateId) {
    return __awaiter(this, void 0, void 0, function () {
      var defaultVariables;
      return __generator(this, function (_a) {
        // Verificar cache
        if (this.variableCache.has(templateId)) {
          return [2 /*return*/, this.variableCache.get(templateId)];
        }
        defaultVariables = [
          {
            name: "user.name",
            type: "string",
            required: true,
            description: "Nome do usuário",
          },
          {
            name: "user.email",
            type: "string",
            required: false,
            description: "Email do usuário",
          },
          {
            name: "appointment.date",
            type: "date",
            required: false,
            description: "Data do agendamento",
          },
          {
            name: "clinic.name",
            type: "string",
            required: false,
            description: "Nome da clínica",
          },
        ];
        this.variableCache.set(templateId, defaultVariables);
        return [2 /*return*/, defaultVariables];
      });
    });
  };
  TemplateEngine.prototype.validateContext = function (context, variables) {
    return __awaiter(this, void 0, void 0, function () {
      var requiredVariables, _i, requiredVariables_1, variable, value;
      return __generator(this, function (_a) {
        requiredVariables = variables.filter(function (v) {
          return v.required;
        });
        for (
          _i = 0, requiredVariables_1 = requiredVariables;
          _i < requiredVariables_1.length;
          _i++
        ) {
          variable = requiredVariables_1[_i];
          value = this.getVariableValue(context, variable.name);
          if (value === undefined || value === null || value === "") {
            throw new Error("Vari\u00E1vel obrigat\u00F3ria ausente: ".concat(variable.name));
          }
        }
        return [2 /*return*/];
      });
    });
  };
  TemplateEngine.prototype.getVariableValue = function (context, variableName) {
    var parts = variableName.split(".");
    var value = context;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
      var part = parts_1[_i];
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  };
  return TemplateEngine;
})();
exports.TemplateEngine = TemplateEngine;
exports.default = TemplateEngine;
