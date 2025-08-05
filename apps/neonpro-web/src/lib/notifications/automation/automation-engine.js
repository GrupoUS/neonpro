/**
 * NeonPro Notification System - Automation Engine
 * Story 1.7: Sistema de Notificações
 *
 * Motor de automação para notificações baseadas em eventos e regras
 * Suporte a triggers, condições e ações automatizadas
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
exports.AutomationEngine = void 0;
var types_1 = require("../types");
// ============================================================================
// AUTOMATION ENGINE
// ============================================================================
/**
 * Motor de automação de notificações
 */
var AutomationEngine = /** @class */ (() => {
  function AutomationEngine(notificationManager, templateEngine) {
    this.notificationManager = notificationManager;
    this.templateEngine = templateEngine;
    this.rules = new Map();
    this.executionHistory = [];
    this.isRunning = false;
  }
  // ============================================================================
  // GERENCIAMENTO DE REGRAS
  // ============================================================================
  /**
   * Adiciona regra de automação
   */
  AutomationEngine.prototype.addRule = function (rule) {
    this.validateRule(rule);
    this.rules.set(rule.id, rule);
    console.log("\uD83D\uDCCB Regra de automa\u00E7\u00E3o adicionada: ".concat(rule.name));
  };
  /**
   * Remove regra de automação
   */
  AutomationEngine.prototype.removeRule = function (ruleId) {
    var removed = this.rules.delete(ruleId);
    if (removed) {
      console.log("\uD83D\uDDD1\uFE0F Regra de automa\u00E7\u00E3o removida: ".concat(ruleId));
    }
    return removed;
  };
  /**
   * Atualiza regra de automação
   */
  AutomationEngine.prototype.updateRule = function (ruleId, updates) {
    var rule = this.rules.get(ruleId);
    if (!rule) return false;
    var updatedRule = __assign(__assign(__assign({}, rule), updates), { id: ruleId });
    this.validateRule(updatedRule);
    this.rules.set(ruleId, updatedRule);
    console.log("\u270F\uFE0F Regra de automa\u00E7\u00E3o atualizada: ".concat(rule.name));
    return true;
  };
  /**
   * Obtém regra por ID
   */
  AutomationEngine.prototype.getRule = function (ruleId) {
    return this.rules.get(ruleId);
  };
  /**
   * Lista todas as regras
   */
  AutomationEngine.prototype.getAllRules = function () {
    return Array.from(this.rules.values());
  };
  /**
   * Lista regras ativas
   */
  AutomationEngine.prototype.getActiveRules = function () {
    return Array.from(this.rules.values()).filter((rule) => rule.isActive);
  };
  // ============================================================================
  // PROCESSAMENTO DE EVENTOS
  // ============================================================================
  /**
   * Processa evento e executa regras aplicáveis
   */
  AutomationEngine.prototype.processEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var executions, applicableRules, _i, applicableRules_1, rule, execution;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.isRunning) {
              console.warn("⚠️ Motor de automação não está rodando");
              return [2 /*return*/, []];
            }
            executions = [];
            applicableRules = this.findApplicableRules(event);
            console.log(
              "\uD83D\uDD04 Processando evento "
                .concat(event.type, " - ")
                .concat(applicableRules.length, " regras aplic\u00E1veis"),
            );
            (_i = 0), (applicableRules_1 = applicableRules);
            _a.label = 1;
          case 1:
            if (!(_i < applicableRules_1.length)) return [3 /*break*/, 4];
            rule = applicableRules_1[_i];
            return [4 /*yield*/, this.executeRule(rule, event)];
          case 2:
            execution = _a.sent();
            executions.push(execution);
            this.executionHistory.push(execution);
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            // Limitar histórico
            if (this.executionHistory.length > 1000) {
              this.executionHistory = this.executionHistory.slice(-1000);
            }
            return [2 /*return*/, executions];
        }
      });
    });
  };
  /**
   * Encontra regras aplicáveis ao evento
   */
  AutomationEngine.prototype.findApplicableRules = function (event) {
    return this.getActiveRules().filter((rule) => {
      // Verificar se o trigger corresponde ao evento
      return this.matchesTrigger(rule.trigger, event);
    });
  };
  /**
   * Verifica se o trigger corresponde ao evento
   */
  AutomationEngine.prototype.matchesTrigger = function (trigger, event) {
    // Verificar tipo de evento
    if (trigger.eventType !== event.type) {
      return false;
    }
    // Verificar tipo de entidade se especificado
    if (trigger.entityType && trigger.entityType !== event.entityType) {
      return false;
    }
    // Verificar clínica se especificado
    if (trigger.clinicId && trigger.clinicId !== event.clinicId) {
      return false;
    }
    // Verificar condições do trigger
    if (trigger.conditions && trigger.conditions.length > 0) {
      return this.evaluateConditions(trigger.conditions, event);
    }
    return true;
  };
  // ============================================================================
  // EXECUÇÃO DE REGRAS
  // ============================================================================
  /**
   * Executa regra específica
   */
  AutomationEngine.prototype.executeRule = function (rule, event) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, execution, _i, _a, action, error_1, errorMsg, error_2, errorMsg;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            execution = {
              ruleId: rule.id,
              eventId: event.entityId,
              triggered: true,
              conditionsMet: false,
              actionsExecuted: 0,
              errors: [],
              executedAt: new Date(),
              duration: 0,
            };
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            // Avaliar condições
            if (rule.conditions && rule.conditions.length > 0) {
              execution.conditionsMet = this.evaluateConditions(rule.conditions, event);
            } else {
              execution.conditionsMet = true;
            }
            if (!execution.conditionsMet) return [3 /*break*/, 7];
            (_i = 0), (_a = rule.actions);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            action = _a[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.executeAction(action, event, rule)];
          case 4:
            _b.sent();
            execution.actionsExecuted++;
            return [3 /*break*/, 6];
          case 5:
            error_1 = _b.sent();
            errorMsg = error_1 instanceof Error ? error_1.message : "Erro desconhecido";
            execution.errors.push("A\u00E7\u00E3o ".concat(action.type, ": ").concat(errorMsg));
            console.error(
              "\u274C Erro ao executar a\u00E7\u00E3o ".concat(action.type, ":"),
              error_1,
            );
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_2 = _b.sent();
            errorMsg = error_2 instanceof Error ? error_2.message : "Erro desconhecido";
            execution.errors.push("Execu\u00E7\u00E3o da regra: ".concat(errorMsg));
            console.error("\u274C Erro ao executar regra ".concat(rule.name, ":"), error_2);
            return [3 /*break*/, 9];
          case 9:
            execution.duration = Date.now() - startTime;
            console.log(
              "\u2705 Regra "
                .concat(rule.name, " executada em ")
                .concat(execution.duration, "ms - ") +
                ""
                  .concat(execution.actionsExecuted, " a\u00E7\u00F5es, ")
                  .concat(execution.errors.length, " erros"),
            );
            return [2 /*return*/, execution];
        }
      });
    });
  };
  /**
   * Avalia condições
   */
  AutomationEngine.prototype.evaluateConditions = function (conditions, event) {
    return conditions.every((condition) => this.evaluateCondition(condition, event));
  };
  /**
   * Avalia condição individual
   */
  AutomationEngine.prototype.evaluateCondition = function (condition, event) {
    var value = this.getValueFromEvent(condition.field, event);
    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "greater_than":
        return Number(value) > Number(condition.value);
      case "less_than":
        return Number(value) < Number(condition.value);
      case "greater_equal":
        return Number(value) >= Number(condition.value);
      case "less_equal":
        return Number(value) <= Number(condition.value);
      case "contains":
        return String(value).includes(String(condition.value));
      case "not_contains":
        return !String(value).includes(String(condition.value));
      case "starts_with":
        return String(value).startsWith(String(condition.value));
      case "ends_with":
        return String(value).endsWith(String(condition.value));
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case "exists":
        return value !== undefined && value !== null;
      case "not_exists":
        return value === undefined || value === null;
      default:
        console.warn("\u26A0\uFE0F Operador desconhecido: ".concat(condition.operator));
        return false;
    }
  };
  /**
   * Obtém valor do evento baseado no campo
   */
  AutomationEngine.prototype.getValueFromEvent = (field, event) => {
    var parts = field.split(".");
    var value = event;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
      var part = parts_1[_i];
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  };
  // ============================================================================
  // EXECUÇÃO DE AÇÕES
  // ============================================================================
  /**
   * Executa ação específica
   */
  AutomationEngine.prototype.executeAction = function (action, event, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = action.type;
            switch (_a) {
              case "send_notification":
                return [3 /*break*/, 1];
              case "delay":
                return [3 /*break*/, 3];
              case "webhook":
                return [3 /*break*/, 5];
              case "update_entity":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.executeSendNotificationAction(action, event, rule)];
          case 2:
            _b.sent();
            return [3 /*break*/, 10];
          case 3:
            return [4 /*yield*/, this.executeDelayAction(action)];
          case 4:
            _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [4 /*yield*/, this.executeWebhookAction(action, event)];
          case 6:
            _b.sent();
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.executeUpdateEntityAction(action, event)];
          case 8:
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Tipo de a\u00E7\u00E3o n\u00E3o suportado: ".concat(action.type));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa ação de envio de notificação
   */
  AutomationEngine.prototype.executeSendNotificationAction = function (action, event, rule) {
    return __awaiter(this, void 0, void 0, function () {
      var config, recipients, templateData, content, _i, recipients_1, recipient, context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            config = action.config;
            return [4 /*yield*/, this.resolveRecipients(config.recipients, event)];
          case 1:
            recipients = _a.sent();
            templateData = this.buildTemplateData(event, rule);
            return [4 /*yield*/, this.templateEngine.render(config.templateId, templateData)];
          case 2:
            content = _a.sent();
            (_i = 0), (recipients_1 = recipients);
            _a.label = 3;
          case 3:
            if (!(_i < recipients_1.length)) return [3 /*break*/, 6];
            recipient = recipients_1[_i];
            context = {
              notificationId: "auto_".concat(rule.id, "_").concat(Date.now()),
              type: config.notificationType || types_1.NotificationType.SYSTEM,
              priority: config.priority || types_1.NotificationPriority.MEDIUM,
              channels: config.channels || [types_1.NotificationChannel.IN_APP],
              recipient: recipient,
              clinic: {
                id: event.clinicId,
                name: "Clínica", // TODO: Buscar nome real da clínica
              },
              timestamp: new Date(),
              metadata: {
                automationRuleId: rule.id,
                automationRuleName: rule.name,
                triggerEvent: event.type,
                triggerEntityId: event.entityId,
              },
            };
            return [4 /*yield*/, this.notificationManager.send(context, content)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa ação de delay
   */
  AutomationEngine.prototype.executeDelayAction = function (action) {
    return __awaiter(this, void 0, void 0, function () {
      var delayMs;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            delayMs = action.config.duration || 1000;
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, delayMs))];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa ação de webhook
   */
  AutomationEngine.prototype.executeWebhookAction = function (action, event) {
    return __awaiter(this, void 0, void 0, function () {
      var config, response;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            config = action.config;
            return [
              4 /*yield*/,
              fetch(config.url, {
                method: config.method || "POST",
                headers: __assign({ "Content-Type": "application/json" }, config.headers),
                body: JSON.stringify(
                  __assign({ event: event, timestamp: new Date().toISOString() }, config.payload),
                ),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error(
                "Webhook falhou: ".concat(response.status, " ").concat(response.statusText),
              );
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa ação de atualização de entidade
   */
  AutomationEngine.prototype.executeUpdateEntityAction = function (action, event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar atualização de entidade
        console.log("🔄 Atualizando entidade:", {
          entityId: event.entityId,
          entityType: event.entityType,
          updates: action.config.updates,
        });
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================
  /**
   * Resolve destinatários baseado na configuração
   */
  AutomationEngine.prototype.resolveRecipients = function (recipientConfig, event) {
    return __awaiter(this, void 0, void 0, function () {
      var recipients, _i, _a, userId;
      return __generator(this, (_b) => {
        recipients = [];
        // Destinatários específicos
        if (recipientConfig.userIds) {
          for (_i = 0, _a = recipientConfig.userIds; _i < _a.length; _i++) {
            userId = _a[_i];
            recipients.push({
              id: userId,
              type: "user",
              name: "Usu\u00E1rio ".concat(userId), // TODO: Buscar nome real
              email: "user".concat(userId, "@example.com"), // TODO: Buscar email real
              phone: undefined,
            });
          }
        }
        // Destinatários por papel
        if (recipientConfig.roles) {
          // TODO: Implementar busca de usuários por papel
        }
        // Destinatário do evento
        if (recipientConfig.includeEventUser && event.userId) {
          recipients.push({
            id: event.userId,
            type: "user",
            name: "Usu\u00E1rio ".concat(event.userId),
            email: "user".concat(event.userId, "@example.com"),
            phone: undefined,
          });
        }
        return [2 /*return*/, recipients];
      });
    });
  };
  /**
   * Constrói dados para template
   */
  AutomationEngine.prototype.buildTemplateData = (event, rule) =>
    __assign(
      {
        event: {
          type: event.type,
          entityId: event.entityId,
          entityType: event.entityType,
          timestamp: event.timestamp,
          data: event.data,
        },
        rule: {
          id: rule.id,
          name: rule.name,
          description: rule.description,
        },
        clinic: {
          id: event.clinicId,
        },
        now: new Date(),
      },
      event.data,
    );
  /**
   * Valida regra de automação
   */
  AutomationEngine.prototype.validateRule = (rule) => {
    if (!rule.id) {
      throw new Error("ID da regra é obrigatório");
    }
    if (!rule.name) {
      throw new Error("Nome da regra é obrigatório");
    }
    if (!rule.trigger) {
      throw new Error("Trigger da regra é obrigatório");
    }
    if (!rule.actions || rule.actions.length === 0) {
      throw new Error("Pelo menos uma ação é obrigatória");
    }
    // Validar ações
    for (var _i = 0, _a = rule.actions; _i < _a.length; _i++) {
      var action = _a[_i];
      if (!action.type) {
        throw new Error("Tipo da ação é obrigatório");
      }
      if (action.type === "send_notification" && !action.config.templateId) {
        throw new Error("Template ID é obrigatório para ação de notificação");
      }
    }
  };
  // ============================================================================
  // CONTROLE DO MOTOR
  // ============================================================================
  /**
   * Inicia o motor de automação
   */
  AutomationEngine.prototype.start = function () {
    this.isRunning = true;
    console.log("🚀 Motor de automação iniciado");
  };
  /**
   * Para o motor de automação
   */
  AutomationEngine.prototype.stop = function () {
    this.isRunning = false;
    console.log("⏹️ Motor de automação parado");
  };
  Object.defineProperty(AutomationEngine.prototype, "running", {
    /**
     * Verifica se o motor está rodando
     */
    get: function () {
      return this.isRunning;
    },
    enumerable: false,
    configurable: true,
  });
  // ============================================================================
  // ESTATÍSTICAS E MONITORAMENTO
  // ============================================================================
  /**
   * Obtém estatísticas de automação
   */
  AutomationEngine.prototype.getStats = function () {
    var totalExecutions = this.executionHistory.length;
    var successfulExecutions = this.executionHistory.filter((e) => e.errors.length === 0).length;
    var failedExecutions = totalExecutions - successfulExecutions;
    var totalDuration = this.executionHistory.reduce((sum, e) => sum + e.duration, 0);
    var averageExecutionTime = totalExecutions > 0 ? totalDuration / totalExecutions : 0;
    return {
      totalRules: this.rules.size,
      activeRules: this.getActiveRules().length,
      totalExecutions: totalExecutions,
      successfulExecutions: successfulExecutions,
      failedExecutions: failedExecutions,
      averageExecutionTime: averageExecutionTime,
    };
  };
  /**
   * Obtém histórico de execuções
   */
  AutomationEngine.prototype.getExecutionHistory = function (limit) {
    if (limit === void 0) {
      limit = 100;
    }
    return this.executionHistory.slice(-limit);
  };
  /**
   * Limpa histórico de execuções
   */
  AutomationEngine.prototype.clearExecutionHistory = function () {
    this.executionHistory = [];
    console.log("🧹 Histórico de execuções limpo");
  };
  return AutomationEngine;
})();
exports.AutomationEngine = AutomationEngine;
exports.default = AutomationEngine;
