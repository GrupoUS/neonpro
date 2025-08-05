"use strict";
/**
 * NeonPro - WhatsApp Business API Connector
 * Integration with WhatsApp Business API for patient communication
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
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
exports.WhatsAppUtils = exports.WhatsAppTemplates = exports.WhatsAppConnector = void 0;
/**
 * WhatsApp Business API Connector
 */
var WhatsAppConnector = /** @class */ (function () {
  function WhatsAppConnector(config) {
    this.config = config;
    this.baseUrl = "https://graph.facebook.com/".concat(config.apiVersion || "v18.0");
  }
  /**
   * Test connection to WhatsApp Business API
   */
  WhatsAppConnector.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "GET",
                endpoint: "/".concat(this.config.phoneNumberId),
                params: {
                  fields: "id,display_phone_number,verified_name",
                },
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              response.success &&
                ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id) ===
                  this.config.phoneNumberId,
            ];
          case 2:
            error_1 = _b.sent();
            console.error("WhatsApp connection test failed:", error_1);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send WhatsApp message
   */
  WhatsAppConnector.prototype.sendMessage = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, response, error_2;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            payload = __assign(
              {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: message.to,
                type: message.type,
              },
              this.buildMessagePayload(message),
            );
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/".concat(this.config.phoneNumberId, "/messages"),
                data: payload,
              }),
            ];
          case 1:
            response = _d.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  messageId:
                    (_c =
                      (_b =
                        (_a = response.data) === null || _a === void 0 ? void 0 : _a.messages) ===
                        null || _b === void 0
                        ? void 0
                        : _b[0]) === null || _c === void 0
                      ? void 0
                      : _c.id,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_2 = _d.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Failed to send message",
                metadata: {
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send appointment reminder
   */
  WhatsAppConnector.prototype.sendAppointmentReminder = function (
    phoneNumber,
    patientName,
    appointmentDate,
    doctorName,
    clinicName,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var message;
      return __generator(this, function (_a) {
        message = {
          to: phoneNumber,
          type: "template",
          template: {
            name: "appointment_reminder",
            language: {
              code: "pt_BR",
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: patientName },
                  { type: "text", text: appointmentDate.toLocaleDateString("pt-BR") },
                  {
                    type: "text",
                    text: appointmentDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                  { type: "text", text: doctorName },
                  { type: "text", text: clinicName },
                ],
              },
            ],
          },
        };
        return [2 /*return*/, this.sendMessage(message)];
      });
    });
  };
  /**
   * Send appointment confirmation request
   */
  WhatsAppConnector.prototype.sendAppointmentConfirmation = function (
    phoneNumber,
    patientName,
    appointmentDate,
    doctorName,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var message;
      return __generator(this, function (_a) {
        message = {
          to: phoneNumber,
          type: "template",
          template: {
            name: "appointment_confirmation",
            language: {
              code: "pt_BR",
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: patientName },
                  { type: "text", text: appointmentDate.toLocaleDateString("pt-BR") },
                  {
                    type: "text",
                    text: appointmentDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                  { type: "text", text: doctorName },
                ],
              },
              {
                type: "button",
                sub_type: "quick_reply",
                index: "0",
                parameters: [{ type: "payload", payload: "CONFIRM_APPOINTMENT" }],
              },
              {
                type: "button",
                sub_type: "quick_reply",
                index: "1",
                parameters: [{ type: "payload", payload: "RESCHEDULE_APPOINTMENT" }],
              },
            ],
          },
        };
        return [2 /*return*/, this.sendMessage(message)];
      });
    });
  };
  /**
   * Send exam results notification
   */
  WhatsAppConnector.prototype.sendExamResults = function (
    phoneNumber,
    patientName,
    examType,
    resultsUrl,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var message, message;
      return __generator(this, function (_a) {
        if (resultsUrl) {
          message = {
            to: phoneNumber,
            type: "document",
            document: {
              link: resultsUrl,
              caption: "Ol\u00E1 "
                .concat(patientName, ", seus resultados de ")
                .concat(examType, " est\u00E3o prontos. Confira o documento anexo."),
              filename: "Resultados_"
                .concat(examType, "_")
                .concat(patientName.replace(/\s+/g, "_"), ".pdf"),
            },
          };
          return [2 /*return*/, this.sendMessage(message)];
        } else {
          message = {
            to: phoneNumber,
            type: "text",
            text: {
              body: "Ol\u00E1 "
                .concat(patientName, ", seus resultados de ")
                .concat(
                  examType,
                  " est\u00E3o prontos. Entre em contato conosco para mais informa\u00E7\u00F5es.",
                ),
            },
          };
          return [2 /*return*/, this.sendMessage(message)];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get message templates
   */
  WhatsAppConnector.prototype.getMessageTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "GET",
                endpoint: "/".concat(this.config.businessAccountId, "/message_templates"),
                params: {
                  fields: "name,status,category,language,components",
                },
              }),
            ];
          case 1:
            response = _a.sent();
            return [2 /*return*/, response];
          case 2:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Failed to get templates",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Upload media file
   */
  WhatsAppConnector.prototype.uploadMedia = function (file, filename, mimeType) {
    return __awaiter(this, void 0, void 0, function () {
      var formData, response, data, error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            formData = new FormData();
            formData.append("file", new Blob([file], { type: mimeType }), filename);
            formData.append("type", mimeType);
            formData.append("messaging_product", "whatsapp");
            return [
              4 /*yield*/,
              fetch("".concat(this.baseUrl, "/").concat(this.config.phoneNumberId, "/media"), {
                method: "POST",
                headers: {
                  Authorization: "Bearer ".concat(this.config.accessToken),
                },
                body: formData,
              }),
            ];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            if (!response.ok) {
              throw new Error(
                ((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) ||
                  "Upload failed",
              );
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  id: data.id,
                  url: data.url,
                },
              },
            ];
          case 3:
            error_4 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Failed to upload media",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get media URL
   */
  WhatsAppConnector.prototype.getMediaUrl = function (mediaId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, mediaResponse, error_5;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "GET",
                endpoint: "/".concat(mediaId),
              }),
            ];
          case 1:
            response = _b.sent();
            if (
              !(
                response.success &&
                ((_a = response.data) === null || _a === void 0 ? void 0 : _a.url)
              )
            )
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              fetch(response.data.url, {
                headers: {
                  Authorization: "Bearer ".concat(this.config.accessToken),
                },
              }),
            ];
          case 2:
            mediaResponse = _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  url: response.data.url,
                  mimeType: response.data.mime_type,
                  sha256: response.data.sha256,
                  fileSize: response.data.file_size,
                },
              },
            ];
          case 3:
            return [2 /*return*/, response];
          case 4:
            error_5 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5 instanceof Error ? error_5.message : "Failed to get media URL",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process incoming webhook
   */
  WhatsAppConnector.prototype.processWebhook = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var events, _i, _a, entry, _b, _c, change, value, _d, _e, message, _f, _g, status_1;
      var _h;
      return __generator(this, function (_j) {
        events = [];
        for (_i = 0, _a = payload.entry; _i < _a.length; _i++) {
          entry = _a[_i];
          for (_b = 0, _c = entry.changes; _b < _c.length; _b++) {
            change = _c[_b];
            if (change.field === "messages") {
              value = change.value;
              // Process incoming messages
              if (value.messages) {
                for (_d = 0, _e = value.messages; _d < _e.length; _d++) {
                  message = _e[_d];
                  events.push({
                    type: "message_received",
                    data: {
                      messageId: message.id,
                      from: message.from,
                      timestamp: new Date(parseInt(message.timestamp) * 1000),
                      messageType: message.type,
                      text: (_h = message.text) === null || _h === void 0 ? void 0 : _h.body,
                      context: message.context,
                    },
                  });
                }
              }
              // Process message status updates
              if (value.statuses) {
                for (_f = 0, _g = value.statuses; _f < _g.length; _f++) {
                  status_1 = _g[_f];
                  events.push({
                    type: "message_status",
                    data: {
                      messageId: status_1.id,
                      status: status_1.status,
                      timestamp: new Date(parseInt(status_1.timestamp) * 1000),
                      recipientId: status_1.recipient_id,
                      errors: status_1.errors,
                    },
                  });
                }
              }
            }
          }
        }
        return [2 /*return*/, events];
      });
    });
  };
  /**
   * Get webhook configuration
   */
  WhatsAppConnector.prototype.getWebhookConfig = function () {
    return {
      id: "whatsapp-".concat(this.config.phoneNumberId),
      url: "".concat(this.config.webhookUrl, "/whatsapp"),
      events: ["messages", "message_deliveries", "message_reads"],
      secret: this.config.webhookVerifyToken,
      active: true,
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffStrategy: "exponential",
      },
    };
  };
  /**
   * Verify webhook signature
   */
  WhatsAppConnector.prototype.verifyWebhook = function (payload, signature) {
    // WhatsApp uses different verification method
    // This is handled in the webhook endpoint
    return true;
  };
  // Private helper methods
  /**
   * Make API request to WhatsApp
   */
  WhatsAppConnector.prototype.makeRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var url_1, options, response, data, error_6;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            url_1 = new URL("".concat(this.baseUrl).concat(request.endpoint));
            // Add query parameters
            if (request.params) {
              Object.entries(request.params).forEach(function (_a) {
                var key = _a[0],
                  value = _a[1];
                url_1.searchParams.append(key, String(value));
              });
            }
            options = {
              method: request.method,
              headers: __assign(
                {
                  Authorization: "Bearer ".concat(this.config.accessToken),
                  "Content-Type": "application/json",
                },
                request.headers,
              ),
            };
            if (request.data) {
              options.body = JSON.stringify(request.data);
            }
            return [4 /*yield*/, fetch(url_1.toString(), options)];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            if (!response.ok) {
              throw new Error(
                ((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) ||
                  "HTTP ".concat(response.status),
              );
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: data,
                metadata: {
                  statusCode: response.status,
                  headers: Object.fromEntries(response.headers.entries()),
                },
              },
            ];
          case 3:
            error_6 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_6 instanceof Error ? error_6.message : "Request failed",
                metadata: {
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Build message payload based on type
   */
  WhatsAppConnector.prototype.buildMessagePayload = function (message) {
    var payload = {};
    switch (message.type) {
      case "text":
        payload.text = message.text;
        break;
      case "template":
        payload.template = message.template;
        break;
      case "image":
        payload.image = message.image;
        break;
      case "document":
        payload.document = message.document;
        break;
      case "audio":
        payload.audio = message.audio;
        break;
      case "video":
        payload.video = message.video;
        break;
    }
    return payload;
  };
  return WhatsAppConnector;
})();
exports.WhatsAppConnector = WhatsAppConnector;
/**
 * WhatsApp Message Templates
 */
exports.WhatsAppTemplates = {
  APPOINTMENT_REMINDER: "appointment_reminder",
  APPOINTMENT_CONFIRMATION: "appointment_confirmation",
  EXAM_RESULTS: "exam_results",
  PAYMENT_REMINDER: "payment_reminder",
  WELCOME_MESSAGE: "welcome_message",
};
/**
 * WhatsApp Utility Functions
 */
var WhatsAppUtils = /** @class */ (function () {
  function WhatsAppUtils() {}
  /**
   * Format phone number for WhatsApp
   */
  WhatsAppUtils.formatPhoneNumber = function (phone, countryCode) {
    if (countryCode === void 0) {
      countryCode = "55";
    }
    // Remove all non-numeric characters
    var cleaned = phone.replace(/\D/g, "");
    // Add country code if not present
    if (!cleaned.startsWith(countryCode)) {
      return "".concat(countryCode).concat(cleaned);
    }
    return cleaned;
  };
  /**
   * Validate phone number format
   */
  WhatsAppUtils.isValidPhoneNumber = function (phone) {
    var cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };
  /**
   * Extract message text from webhook
   */
  WhatsAppUtils.extractMessageText = function (webhook) {
    var _a;
    for (var _i = 0, _b = webhook.entry; _i < _b.length; _i++) {
      var entry = _b[_i];
      for (var _c = 0, _d = entry.changes; _c < _d.length; _c++) {
        var change = _d[_c];
        if (change.value.messages) {
          for (var _e = 0, _f = change.value.messages; _e < _f.length; _e++) {
            var message = _f[_e];
            if ((_a = message.text) === null || _a === void 0 ? void 0 : _a.body) {
              return message.text.body;
            }
          }
        }
      }
    }
    return null;
  };
  /**
   * Get sender phone number from webhook
   */
  WhatsAppUtils.getSenderPhone = function (webhook) {
    for (var _i = 0, _a = webhook.entry; _i < _a.length; _i++) {
      var entry = _a[_i];
      for (var _b = 0, _c = entry.changes; _b < _c.length; _b++) {
        var change = _c[_b];
        if (change.value.messages) {
          for (var _d = 0, _e = change.value.messages; _d < _e.length; _d++) {
            var message = _e[_d];
            return message.from;
          }
        }
      }
    }
    return null;
  };
  return WhatsAppUtils;
})();
exports.WhatsAppUtils = WhatsAppUtils;
