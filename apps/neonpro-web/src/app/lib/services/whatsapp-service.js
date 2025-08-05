"use strict";
// WhatsApp Business API Service
// Integrates with Meta's WhatsApp Cloud API for NeonPro
// Uses official whatsapp library with TypeScript support
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
exports.createwhatsAppService = void 0;
var client_1 = require("@/lib/supabase/client");
var whatsapp_1 = require("@/app/types/whatsapp");
// WhatsApp Cloud API configuration
var WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0";
var WhatsAppService = /** @class */ (function () {
  function WhatsAppService() {}
  // Supabase client created per method for proper request context
  // Configuration Management
  WhatsAppService.prototype.getConfig = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [4 /*yield*/, supabase.from("whatsapp_config").select("*").single()];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              console.error("Error fetching WhatsApp config:", error);
              throw new Error("Failed to fetch WhatsApp configuration");
            }
            return [2 /*return*/, data];
          case 3:
            error_1 = _b.sent();
            console.error("WhatsApp config fetch error:", error_1);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.updateConfig = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("whatsapp_config")
                .upsert(__assign(__assign({}, config), { updated_at: new Date().toISOString() }))
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating WhatsApp config:", error);
              throw new Error("Failed to update WhatsApp configuration");
            }
            return [2 /*return*/, data];
          case 3:
            error_2 = _b.sent();
            console.error("WhatsApp config update error:", error_2);
            throw error_2;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Message Management
  WhatsAppService.prototype.sendMessage = function (phoneNumber_1, content_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (phoneNumber, content, type, patientId, templateName) {
        var config, messageRequest, response, errorData, result, messageId, error_3;
        var _a, _b;
        if (type === void 0) {
          type = whatsapp_1.WhatsAppMessageType.TEXT;
        }
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, this.getConfig()];
            case 1:
              config = _c.sent();
              if (!config || !config.isActive) {
                throw new Error("WhatsApp is not configured or inactive");
              }
              _c.label = 2;
            case 2:
              _c.trys.push([2, 8, , 10]);
              messageRequest = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: type,
              };
              // Add content based on message type
              if (type === whatsapp_1.WhatsAppMessageType.TEXT) {
                messageRequest.text = {
                  preview_url: true,
                  body: content,
                };
              } else if (type === whatsapp_1.WhatsAppMessageType.TEMPLATE && templateName) {
                messageRequest.template = {
                  name: templateName,
                  language: {
                    code: "pt_BR",
                  },
                };
              }
              return [
                4 /*yield*/,
                fetch("".concat(WHATSAPP_API_BASE, "/").concat(config.phoneNumberId, "/messages"), {
                  method: "POST",
                  headers: {
                    Authorization: "Bearer ".concat(config.accessToken),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(messageRequest),
                }),
              ];
            case 3:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 5];
              return [4 /*yield*/, response.json()];
            case 4:
              errorData = _c.sent();
              throw new Error(
                "WhatsApp API error: ".concat(
                  ((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) ||
                    "Unknown error",
                ),
              );
            case 5:
              return [4 /*yield*/, response.json()];
            case 6:
              result = _c.sent();
              messageId = (_b = result.messages[0]) === null || _b === void 0 ? void 0 : _b.id;
              if (!messageId) {
                throw new Error("No message ID returned from WhatsApp API");
              }
              // Store message in database
              return [
                4 /*yield*/,
                this.storeMessage({
                  patientId: patientId,
                  phoneNumber: phoneNumber,
                  messageType: type,
                  templateName: templateName,
                  content: content,
                  status: whatsapp_1.WhatsAppMessageStatus.SENT,
                  sentAt: new Date(),
                  metadata: { whatsappMessageId: messageId },
                }),
              ];
            case 7:
              // Store message in database
              _c.sent();
              return [2 /*return*/, messageId];
            case 8:
              error_3 = _c.sent();
              console.error("Error sending WhatsApp message:", error_3);
              // Store failed message
              return [
                4 /*yield*/,
                this.storeMessage({
                  patientId: patientId,
                  phoneNumber: phoneNumber,
                  messageType: type,
                  templateName: templateName,
                  content: content,
                  status: whatsapp_1.WhatsAppMessageStatus.FAILED,
                  errorMessage: error_3 instanceof Error ? error_3.message : "Unknown error",
                }),
              ];
            case 9:
              // Store failed message
              _c.sent();
              throw error_3;
            case 10:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  WhatsAppService.prototype.sendTemplateMessage = function (phoneNumber_1, templateName_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (phoneNumber, templateName, parameters, patientId) {
        var config,
          template,
          components,
          messageRequest,
          response,
          errorData,
          result,
          messageId,
          error_4;
        var _a, _b;
        if (parameters === void 0) {
          parameters = {};
        }
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [4 /*yield*/, this.getConfig()];
            case 1:
              config = _c.sent();
              if (!config || !config.isActive) {
                throw new Error("WhatsApp is not configured or inactive");
              }
              _c.label = 2;
            case 2:
              _c.trys.push([2, 9, , 11]);
              return [4 /*yield*/, this.getTemplate(templateName)];
            case 3:
              template = _c.sent();
              if (!template || !template.isActive) {
                throw new Error("Template '".concat(templateName, "' not found or inactive"));
              }
              components = this.buildTemplateComponents(template, parameters);
              messageRequest = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phoneNumber,
                type: "template",
                template: {
                  name: templateName,
                  language: {
                    code: template.language,
                  },
                  components: components,
                },
              };
              return [
                4 /*yield*/,
                fetch("".concat(WHATSAPP_API_BASE, "/").concat(config.phoneNumberId, "/messages"), {
                  method: "POST",
                  headers: {
                    Authorization: "Bearer ".concat(config.accessToken),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(messageRequest),
                }),
              ];
            case 4:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 6];
              return [4 /*yield*/, response.json()];
            case 5:
              errorData = _c.sent();
              throw new Error(
                "WhatsApp API error: ".concat(
                  ((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) ||
                    "Unknown error",
                ),
              );
            case 6:
              return [4 /*yield*/, response.json()];
            case 7:
              result = _c.sent();
              messageId = (_b = result.messages[0]) === null || _b === void 0 ? void 0 : _b.id;
              if (!messageId) {
                throw new Error("No message ID returned from WhatsApp API");
              }
              // Store message in database
              return [
                4 /*yield*/,
                this.storeMessage({
                  patientId: patientId,
                  phoneNumber: phoneNumber,
                  messageType: whatsapp_1.WhatsAppMessageType.TEMPLATE,
                  templateName: templateName,
                  content: JSON.stringify(parameters),
                  status: whatsapp_1.WhatsAppMessageStatus.SENT,
                  sentAt: new Date(),
                  metadata: { whatsappMessageId: messageId, parameters: parameters },
                }),
              ];
            case 8:
              // Store message in database
              _c.sent();
              return [2 /*return*/, messageId];
            case 9:
              error_4 = _c.sent();
              console.error("Error sending template message:", error_4);
              // Store failed message
              return [
                4 /*yield*/,
                this.storeMessage({
                  patientId: patientId,
                  phoneNumber: phoneNumber,
                  messageType: whatsapp_1.WhatsAppMessageType.TEMPLATE,
                  templateName: templateName,
                  content: JSON.stringify(parameters),
                  status: whatsapp_1.WhatsAppMessageStatus.FAILED,
                  errorMessage: error_4 instanceof Error ? error_4.message : "Unknown error",
                }),
              ];
            case 10:
              // Store failed message
              _c.sent();
              throw error_4;
            case 11:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  WhatsAppService.prototype.storeMessage = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase.from("whatsapp_messages").insert(
                __assign(__assign({}, message), {
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }),
              ),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error storing WhatsApp message:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Database error storing message:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Template Management
  WhatsAppService.prototype.getTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("whatsapp_templates")
                .select("*")
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching templates:", error);
              throw new Error("Failed to fetch WhatsApp templates");
            }
            return [2 /*return*/, data || []];
          case 3:
            error_6 = _b.sent();
            console.error("Templates fetch error:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.getTemplate = function (name) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("whatsapp_templates").select("*").eq("name", name).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              console.error("Error fetching template:", error);
              throw new Error("Failed to fetch WhatsApp template");
            }
            return [2 /*return*/, data];
          case 3:
            error_7 = _b.sent();
            console.error("Template fetch error:", error_7);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.buildTemplateComponents = function (template, parameters) {
    return template.components.map(function (component) {
      if (component.type === "BODY" && component.text) {
        // Replace placeholders with actual parameters
        var text_1 = component.text;
        Object.entries(parameters).forEach(function (_a) {
          var key = _a[0],
            value = _a[1];
          text_1 = text_1.replace(new RegExp("{{".concat(key, "}}"), "g"), value);
        });
        return {
          type: "body",
          parameters: Object.values(parameters).map(function (value) {
            return {
              type: "text",
              text: value,
            };
          }),
        };
      }
      return component;
    });
  };
  // Webhook handling
  WhatsAppService.prototype.handleWebhook = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, entry, _b, _c, change, error_8;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 7, , 8]);
            (_i = 0), (_a = payload.entry);
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            entry = _a[_i];
            (_b = 0), (_c = entry.changes);
            _d.label = 2;
          case 2:
            if (!(_b < _c.length)) return [3 /*break*/, 5];
            change = _c[_b];
            if (!(change.field === "messages")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.processWebhookMessages(change.value)];
          case 3:
            _d.sent();
            _d.label = 4;
          case 4:
            _b++;
            return [3 /*break*/, 2];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_8 = _d.sent();
            console.error("Error processing webhook:", error_8);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.processWebhookMessages = function (value) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, status_1, _b, _c, message;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            if (!value.statuses) return [3 /*break*/, 4];
            (_i = 0), (_a = value.statuses);
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            status_1 = _a[_i];
            return [
              4 /*yield*/,
              this.updateMessageStatus(status_1.id, status_1.status, status_1.timestamp),
            ];
          case 2:
            _d.sent();
            _d.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            if (!value.messages) return [3 /*break*/, 8];
            (_b = 0), (_c = value.messages);
            _d.label = 5;
          case 5:
            if (!(_b < _c.length)) return [3 /*break*/, 8];
            message = _c[_b];
            return [4 /*yield*/, this.handleIncomingMessage(message)];
          case 6:
            _d.sent();
            _d.label = 7;
          case 7:
            _b++;
            return [3 /*break*/, 5];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.updateMessageStatus = function (whatsappMessageId, status, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, error, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            updateData = {
              status: status.toLowerCase(),
              updated_at: new Date().toISOString(),
            };
            if (status === "delivered") {
              updateData.delivered_at = new Date(parseInt(timestamp) * 1000).toISOString();
            } else if (status === "read") {
              updateData.read_at = new Date(parseInt(timestamp) * 1000).toISOString();
            }
            return [
              4 /*yield*/,
              supabase
                .from("whatsapp_messages")
                .update(updateData)
                .eq("metadata->whatsappMessageId", whatsappMessageId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error updating message status:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Database error updating message status:", error_9);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.handleIncomingMessage = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            // Store incoming message for future reference
            return [
              4 /*yield*/,
              this.storeMessage({
                phoneNumber: message.from,
                messageType: whatsapp_1.WhatsAppMessageType.TEXT,
                content:
                  ((_a = message.text) === null || _a === void 0 ? void 0 : _a.body) ||
                  "Mensagem recebida",
                status: whatsapp_1.WhatsAppMessageStatus.DELIVERED,
                sentAt: new Date(parseInt(message.timestamp) * 1000),
                metadata: { whatsappMessageId: message.id, incoming: true },
              }),
            ];
          case 1:
            // Store incoming message for future reference
            _b.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _b.sent();
            console.error("Error handling incoming message:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Opt-in Management
  WhatsAppService.prototype.checkOptIn = function (phoneNumber) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("whatsapp_opt_ins")
                .select("is_opted_in")
                .eq("phone_number", phoneNumber)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              console.error("Error checking opt-in:", error);
              return [2 /*return*/, false];
            }
            return [
              2 /*return*/,
              (data === null || data === void 0 ? void 0 : data.is_opted_in) || false,
            ];
          case 3:
            error_11 = _b.sent();
            console.error("Opt-in check error:", error_11);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  WhatsAppService.prototype.recordOptIn = function (patientId_1, phoneNumber_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (patientId, phoneNumber, source, consentMessage) {
        var error, error_12;
        if (source === void 0) {
          source = "manual";
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase.from("whatsapp_opt_ins").upsert({
                  patient_id: patientId,
                  phone_number: phoneNumber,
                  is_opted_in: true,
                  opt_in_source: source,
                  opt_in_date: new Date().toISOString(),
                  consent_message: consentMessage,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }),
              ];
            case 1:
              error = _a.sent().error;
              if (error) {
                console.error("Error recording opt-in:", error);
                throw new Error("Failed to record WhatsApp opt-in");
              }
              return [3 /*break*/, 3];
            case 2:
              error_12 = _a.sent();
              console.error("Opt-in record error:", error_12);
              throw error_12;
            case 3:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  // Analytics
  WhatsAppService.prototype.getAnalytics = function (startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("whatsapp_analytics")
                .select("*")
                .gte("date", startDate.toISOString().split("T")[0])
                .lte("date", endDate.toISOString().split("T")[0])
                .order("date", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching analytics:", error);
              throw new Error("Failed to fetch WhatsApp analytics");
            }
            return [2 /*return*/, data || []];
          case 3:
            error_13 = _b.sent();
            console.error("Analytics fetch error:", error_13);
            throw error_13;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Bulk messaging
  WhatsAppService.prototype.sendBulkMessages = function (phoneNumbers_1, templateName_1) {
    return __awaiter(this, arguments, void 0, function (phoneNumbers, templateName, parameters) {
      var results, _i, phoneNumbers_2, phoneNumber, isOptedIn, error_14;
      if (parameters === void 0) {
        parameters = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            results = { sent: 0, failed: 0, errors: [] };
            (_i = 0), (phoneNumbers_2 = phoneNumbers);
            _a.label = 1;
          case 1:
            if (!(_i < phoneNumbers_2.length)) return [3 /*break*/, 8];
            phoneNumber = phoneNumbers_2[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 6, , 7]);
            return [4 /*yield*/, this.checkOptIn(phoneNumber)];
          case 3:
            isOptedIn = _a.sent();
            if (!isOptedIn) {
              results.failed++;
              results.errors.push(
                "".concat(phoneNumber, ": Not opted in for WhatsApp communications"),
              );
              return [3 /*break*/, 7];
            }
            return [4 /*yield*/, this.sendTemplateMessage(phoneNumber, templateName, parameters)];
          case 4:
            _a.sent();
            results.sent++;
            // Add delay to avoid rate limiting
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }),
            ];
          case 5:
            // Add delay to avoid rate limiting
            _a.sent();
            return [3 /*break*/, 7];
          case 6:
            error_14 = _a.sent();
            results.failed++;
            results.errors.push(
              ""
                .concat(phoneNumber, ": ")
                .concat(error_14 instanceof Error ? error_14.message : "Unknown error"),
            );
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, results];
        }
      });
    });
  };
  return WhatsAppService;
})();
var createwhatsAppService = function () {
  return new WhatsAppService();
};
exports.createwhatsAppService = createwhatsAppService;
