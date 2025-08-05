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
exports.EmailService = void 0;
var nodemailer_1 = require("nodemailer");
var client_ses_1 = require("@aws-sdk/client-ses");
// =======================================
// EMAIL SERVICE CLASS
// =======================================
var EmailService = /** @class */ (() => {
  function EmailService(supabase, clinicId) {
    this.supabase = supabase;
    this.clinicId = clinicId;
    this.providers = new Map();
    this.settings = null;
  }
  // =======================================
  // PROVIDER MANAGEMENT
  // =======================================
  EmailService.prototype.initializeProviders = function (configs) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, configs_1, config, provider, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (_i = 0), (configs_1 = configs);
            _a.label = 1;
          case 1:
            if (!(_i < configs_1.length)) return [3 /*break*/, 6];
            config = configs_1[_i];
            if (!config.isActive) return [3 /*break*/, 5];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.createProvider(config)];
          case 3:
            provider = _a.sent();
            if (provider) {
              this.providers.set(config.provider, provider);
            }
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error(
              "Failed to initialize email provider ".concat(config.provider, ":"),
              error_1,
            );
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmailService.prototype.createProvider = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (config.provider) {
          case "smtp":
            return [2 /*return*/, new SMTPEmailProvider(config.settings)];
          case "ses":
            return [2 /*return*/, new SESEmailProvider(config.settings)];
          case "sendgrid":
            return [2 /*return*/, new SendGridEmailProvider(config.settings)];
          case "mailgun":
            return [2 /*return*/, new MailgunEmailProvider(config.settings)];
          case "resend":
            return [2 /*return*/, new ResendEmailProvider(config.settings)];
          case "postmark":
            return [2 /*return*/, new PostmarkEmailProvider(config.settings)];
          default:
            console.warn("Unknown email provider: ".concat(config.provider));
            return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  // =======================================
  // EMAIL SENDING
  // =======================================
  EmailService.prototype.sendEmail = function (message, providerPreference) {
    return __awaiter(this, void 0, void 0, function () {
      var provider, validationResult, processedMessage, result, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            provider = this.selectProvider(providerPreference);
            if (!provider) {
              throw new Error("No email provider available");
            }
            return [4 /*yield*/, this.validateMessage(message)];
          case 1:
            validationResult = _b.sent();
            if (!validationResult.isValid) {
              throw new Error("Message validation failed: ".concat(validationResult.reason));
            }
            return [4 /*yield*/, this.applySettings(message)];
          case 2:
            processedMessage = _b.sent();
            return [4 /*yield*/, provider.sendEmail(processedMessage)];
          case 3:
            result = _b.sent();
            // Log the send attempt
            return [
              4 /*yield*/,
              this.logEmailEvent({
                id: crypto.randomUUID(),
                emailId: message.id || crypto.randomUUID(),
                messageId: result.messageId || crypto.randomUUID(),
                event: result.success ? "sent" : "failed",
                timestamp: new Date(),
                metadata: {
                  provider: this.getProviderName(provider),
                  recipient: (_a = message.to[0]) === null || _a === void 0 ? void 0 : _a.email,
                  subject: message.subject,
                  error: result.error,
                },
              }),
            ];
          case 4:
            // Log the send attempt
            _b.sent();
            return [2 /*return*/, result];
          case 5:
            error_2 = _b.sent();
            console.error("Email sending failed:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Unknown error occurred",
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  EmailService.prototype.sendBulkEmail = function (messages_1, providerPreference_1) {
    return __awaiter(this, arguments, void 0, function (messages, providerPreference, batchSize) {
      var provider,
        results,
        totalSent,
        totalFailed,
        i,
        batch,
        batchResult,
        _i,
        _a,
        result,
        batchError_1,
        _b,
        batch_1,
        message,
        error_3;
      var _c;
      if (batchSize === void 0) {
        batchSize = 10;
      }
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 13, , 14]);
            provider = this.selectProvider(providerPreference);
            if (!provider) {
              throw new Error("No email provider available");
            }
            results = [];
            totalSent = 0;
            totalFailed = 0;
            i = 0;
            _d.label = 1;
          case 1:
            if (!(i < messages.length)) return [3 /*break*/, 12];
            batch = messages.slice(i, i + batchSize);
            _d.label = 2;
          case 2:
            _d.trys.push([2, 10, , 11]);
            return [4 /*yield*/, provider.sendBulkEmail(batch)];
          case 3:
            batchResult = _d.sent();
            results.push.apply(results, batchResult.results);
            totalSent += batchResult.totalSent;
            totalFailed += batchResult.totalFailed;
            if (!(i + batchSize < messages.length)) return [3 /*break*/, 5];
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            (_i = 0), (_a = batchResult.results);
            _d.label = 6;
          case 6:
            if (!(_i < _a.length)) return [3 /*break*/, 9];
            result = _a[_i];
            return [
              4 /*yield*/,
              this.logEmailEvent({
                id: crypto.randomUUID(),
                emailId: crypto.randomUUID(),
                messageId: result.messageId || crypto.randomUUID(),
                event: result.success ? "sent" : "failed",
                timestamp: new Date(),
                metadata: {
                  provider: this.getProviderName(provider),
                  recipient: result.email,
                  error: result.error,
                  batch: Math.floor(i / batchSize) + 1,
                },
              }),
            ];
          case 7:
            _d.sent();
            _d.label = 8;
          case 8:
            _i++;
            return [3 /*break*/, 6];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            batchError_1 = _d.sent();
            console.error("Batch ".concat(Math.floor(i / batchSize) + 1, " failed:"), batchError_1);
            // Mark all emails in batch as failed
            for (_b = 0, batch_1 = batch; _b < batch_1.length; _b++) {
              message = batch_1[_b];
              results.push({
                email:
                  ((_c = message.to[0]) === null || _c === void 0 ? void 0 : _c.email) || "unknown",
                success: false,
                error: batchError_1 instanceof Error ? batchError_1.message : "Batch failed",
              });
              totalFailed++;
            }
            return [3 /*break*/, 11];
          case 11:
            i += batchSize;
            return [3 /*break*/, 1];
          case 12:
            return [
              2 /*return*/,
              {
                success: totalSent > 0,
                results: results,
                totalSent: totalSent,
                totalFailed: totalFailed,
              },
            ];
          case 13:
            error_3 = _d.sent();
            console.error("Bulk email sending failed:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                results: messages.map((msg) => {
                  var _a;
                  return {
                    email:
                      ((_a = msg.to[0]) === null || _a === void 0 ? void 0 : _a.email) || "unknown",
                    success: false,
                    error: error_3 instanceof Error ? error_3.message : "Unknown error occurred",
                  };
                }),
                totalSent: 0,
                totalFailed: messages.length,
              },
            ];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  // =======================================
  // TEMPLATE MANAGEMENT
  // =======================================
  EmailService.prototype.createTemplate = function (template) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("email_templates")
                .insert([
                  __assign(__assign({}, template), {
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                ])
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to create email template: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseTemplate(data)];
        }
      });
    });
  };
  EmailService.prototype.updateTemplate = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("email_templates")
                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                .eq("id", id)
                .eq("clinic_id", this.clinicId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to update email template: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseTemplate(data)];
        }
      });
    });
  };
  EmailService.prototype.deleteTemplate = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase.from("email_templates").delete().eq("id", id).eq("clinic_id", this.clinicId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to delete email template: ".concat(error.message));
            }
            return [2 /*return*/];
        }
      });
    });
  };
  EmailService.prototype.getTemplate = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("email_templates")
                .select("*")
                .eq("id", id)
                .eq("clinic_id", this.clinicId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") return [2 /*return*/, null];
              throw new Error("Failed to get email template: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseTemplate(data)];
        }
      });
    });
  };
  EmailService.prototype.getTemplates = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("email_templates")
              .select("*")
              .eq("clinic_id", this.clinicId)
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.category) {
              query = query.eq("category", filters.category);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.isActive) !== undefined
            ) {
              query = query.eq("is_active", filters.isActive);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
              query = query.or(
                "name.ilike.%"
                  .concat(filters.search, "%,subject.ilike.%")
                  .concat(filters.search, "%"),
              );
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get email templates: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseTemplate)];
        }
      });
    });
  };
  // =======================================
  // PREVIEW & VALIDATION
  // =======================================
  EmailService.prototype.previewTemplate = function (templateId, variables) {
    return __awaiter(this, void 0, void 0, function () {
      var template;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getTemplate(templateId)];
          case 1:
            template = _a.sent();
            if (!template) {
              throw new Error("Template not found");
            }
            return [
              2 /*return*/,
              {
                subject: this.interpolateTemplate(template.subject, variables),
                htmlContent: this.interpolateTemplate(template.htmlContent, variables),
                textContent: template.textContent
                  ? this.interpolateTemplate(template.textContent, variables)
                  : undefined,
                variables: variables,
              },
            ];
        }
      });
    });
  };
  EmailService.prototype.validateEmail = function (email) {
    return __awaiter(this, void 0, void 0, function () {
      var emailRegex, suppressedEmail;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  email: email,
                  reason: "Invalid email format",
                },
              ];
            }
            return [
              4 /*yield*/,
              supabase
                .from("email_suppressions")
                .select("*")
                .eq("email", email.toLowerCase())
                .eq("clinic_id", this.clinicId)
                .single(),
            ];
          case 1:
            suppressedEmail = _a.sent().data;
            if (suppressedEmail) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  email: email,
                  reason: "Email is suppressed: ".concat(suppressedEmail.reason),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                isValid: true,
                email: email,
              },
            ];
        }
      });
    });
  };
  // =======================================
  // ANALYTICS & REPORTING
  // =======================================
  EmailService.prototype.getEmailAnalytics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, _b, events, error;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            query = supabase.from("email_events").select("*").eq("clinic_id", this.clinicId);
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
              query = query.gte("timestamp", filters.startDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
              query = query.lte("timestamp", filters.endDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.templateId) {
              query = query.eq("template_id", filters.templateId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.campaignId) {
              query = query.eq("campaign_id", filters.campaignId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()),
              (_b = _a.data),
              (events = _b === void 0 ? [] : _b),
              (error = _a.error);
            if (error) {
              throw new Error("Failed to get email analytics: ".concat(error.message));
            }
            return [2 /*return*/, this.calculateAnalytics(events)];
        }
      });
    });
  };
  EmailService.prototype.getDeliveryReport = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        data,
        error,
        events,
        sentEvent,
        deliveredEvent,
        openedEvent,
        clickedEvent,
        bouncedEvent;
      var _b, _c, _d, _e, _f, _g, _h;
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _j.sent();
            return [
              4 /*yield*/,
              supabase
                .from("email_events")
                .select("*")
                .eq("message_id", messageId)
                .order("timestamp", { ascending: true }),
            ];
          case 2:
            (_a = _j.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get delivery report: ".concat(error.message));
            }
            if (!data || data.length === 0) {
              return [2 /*return*/, null];
            }
            events = data.map(this.mapDatabaseEvent);
            sentEvent = events.find((e) => e.event === "sent");
            deliveredEvent = events.find((e) => e.event === "delivered");
            openedEvent = events.find((e) => e.event === "opened");
            clickedEvent = events.find((e) => e.event === "clicked");
            bouncedEvent = events.find((e) => e.event === "bounced");
            return [
              2 /*return*/,
              {
                messageId: messageId,
                recipient:
                  ((_c = (_b = events[0]) === null || _b === void 0 ? void 0 : _b.metadata) ===
                    null || _c === void 0
                    ? void 0
                    : _c.recipient) || "unknown",
                status:
                  ((_d = events[events.length - 1]) === null || _d === void 0
                    ? void 0
                    : _d.event) || "unknown",
                sentAt:
                  (sentEvent === null || sentEvent === void 0 ? void 0 : sentEvent.timestamp) ||
                  new Date(),
                deliveredAt:
                  deliveredEvent === null || deliveredEvent === void 0
                    ? void 0
                    : deliveredEvent.timestamp,
                openedAt:
                  openedEvent === null || openedEvent === void 0 ? void 0 : openedEvent.timestamp,
                clickedAt:
                  clickedEvent === null || clickedEvent === void 0
                    ? void 0
                    : clickedEvent.timestamp,
                bounceReason:
                  bouncedEvent === null || bouncedEvent === void 0 ? void 0 : bouncedEvent.reason,
                provider:
                  ((_f = (_e = events[0]) === null || _e === void 0 ? void 0 : _e.metadata) ===
                    null || _f === void 0
                    ? void 0
                    : _f.provider) || "unknown",
                cost:
                  (_h = (_g = events[0]) === null || _g === void 0 ? void 0 : _g.metadata) ===
                    null || _h === void 0
                    ? void 0
                    : _h.cost,
              },
            ];
        }
      });
    });
  };
  // =======================================
  // PRIVATE HELPER METHODS
  // =======================================
  EmailService.prototype.selectProvider = function (preference) {
    if (preference && this.providers.has(preference)) {
      return this.providers.get(preference);
    }
    // Return first available provider
    var providers = Array.from(this.providers.values());
    return providers.length > 0 ? providers[0] : null;
  };
  EmailService.prototype.getProviderName = function (provider) {
    for (var _i = 0, _a = this.providers.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        name_1 = _b[0],
        p = _b[1];
      if (p === provider) return name_1;
    }
    return "unknown";
  };
  EmailService.prototype.validateMessage = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, recipient, validation;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!message.to || message.to.length === 0) {
              return [2 /*return*/, { isValid: false, reason: "No recipients specified" }];
            }
            if (!message.subject || message.subject.trim() === "") {
              return [2 /*return*/, { isValid: false, reason: "Subject is required" }];
            }
            if (!message.htmlContent || message.htmlContent.trim() === "") {
              return [2 /*return*/, { isValid: false, reason: "Content is required" }];
            }
            (_i = 0), (_a = message.to);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            recipient = _a[_i];
            return [4 /*yield*/, this.validateEmail(recipient.email)];
          case 2:
            validation = _b.sent();
            if (!validation.isValid) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  reason: "Invalid recipient "
                    .concat(recipient.email, ": ")
                    .concat(validation.reason),
                },
              ];
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, { isValid: true }];
        }
      });
    });
  };
  EmailService.prototype.applySettings = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            if (this.settings) return [3 /*break*/, 2];
            _a = this;
            return [4 /*yield*/, this.getEmailSettings()];
          case 1:
            _a.settings = _d.sent();
            _d.label = 2;
          case 2:
            // Apply default from if not specified
            if (
              !message.from.email &&
              ((_b = this.settings) === null || _b === void 0 ? void 0 : _b.defaultFrom)
            ) {
              message.from = this.settings.defaultFrom;
            }
            // Apply default reply-to if not specified
            if (
              !message.replyTo &&
              ((_c = this.settings) === null || _c === void 0 ? void 0 : _c.defaultReplyTo)
            ) {
              message.replyTo = this.settings.defaultReplyTo;
            }
            return [2 /*return*/, message];
        }
      });
    });
  };
  EmailService.prototype.getEmailSettings = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("email_settings").select("*").eq("clinic_id", this.clinicId).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") return [2 /*return*/, null];
              throw new Error("Failed to get email settings: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  EmailService.prototype.interpolateTemplate = (template, variables) =>
    template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
      variables[key] !== undefined ? String(variables[key]) : match,
    );
  EmailService.prototype.mapDatabaseTemplate = (data) => ({
    id: data.id,
    name: data.name,
    subject: data.subject,
    htmlContent: data.html_content,
    textContent: data.text_content,
    variables: data.variables || [],
    category: data.category,
    isActive: data.is_active,
    clinicId: data.clinic_id,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  });
  EmailService.prototype.mapDatabaseEvent = (data) => ({
    id: data.id,
    emailId: data.email_id,
    messageId: data.message_id,
    event: data.event,
    timestamp: new Date(data.timestamp),
    metadata: data.metadata || {},
    providerEventId: data.provider_event_id,
    reason: data.reason,
    userAgent: data.user_agent,
    ipAddress: data.ip_address,
    linkUrl: data.link_url,
  });
  EmailService.prototype.calculateAnalytics = (events) => {
    var eventCounts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {});
    var totalSent = eventCounts.sent || 0;
    var delivered = eventCounts.delivered || 0;
    var bounced = eventCounts.bounced || 0;
    var opened = eventCounts.opened || 0;
    var clicked = eventCounts.clicked || 0;
    var unsubscribed = eventCounts.unsubscribed || 0;
    var complained = eventCounts.complained || 0;
    var failed = eventCounts.failed || 0;
    return {
      totalSent: totalSent,
      delivered: delivered,
      bounced: bounced,
      opened: opened,
      clicked: clicked,
      unsubscribed: unsubscribed,
      complained: complained,
      failed: failed,
      deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
      complaintRate: delivered > 0 ? (complained / delivered) * 100 : 0,
    };
  };
  EmailService.prototype.logEmailEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, createClient()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("email_events").insert([
                __assign(__assign({}, event), {
                  clinic_id: this.clinicId,
                  timestamp: event.timestamp.toISOString(),
                }),
              ]),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to log email event:", error_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return EmailService;
})();
exports.EmailService = EmailService;
// =======================================
// EMAIL PROVIDER IMPLEMENTATIONS
// =======================================
var SMTPEmailProvider = /** @class */ (() => {
  function SMTPEmailProvider(config) {
    this.config = config;
    this.transporter = nodemailer_1.default.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      pool: config.pool,
      maxConnections: config.maxConnections,
      maxMessages: config.maxMessages,
    });
  }
  SMTPEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_5;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.transporter.sendMail({
                from: "".concat(message.from.name || "", " <").concat(message.from.email, ">"),
                to: message.to
                  .map((r) => "".concat(r.name || "", " <").concat(r.email, ">"))
                  .join(", "),
                cc:
                  (_a = message.cc) === null || _a === void 0
                    ? void 0
                    : _a.map((r) => "".concat(r.name || "", " <").concat(r.email, ">")).join(", "),
                bcc:
                  (_b = message.bcc) === null || _b === void 0
                    ? void 0
                    : _b.map((r) => "".concat(r.name || "", " <").concat(r.email, ">")).join(", "),
                replyTo: message.replyTo
                  ? "".concat(message.replyTo.name || "", " <").concat(message.replyTo.email, ">")
                  : undefined,
                subject: message.subject,
                html: message.htmlContent,
                text: message.textContent,
                attachments:
                  (_c = message.attachments) === null || _c === void 0
                    ? void 0
                    : _c.map((att) => ({
                        filename: att.filename,
                        content: att.content,
                        contentType: att.contentType,
                        cid: att.cid,
                      })),
              }),
            ];
          case 1:
            result = _d.sent();
            return [
              2 /*return*/,
              {
                success: true,
                messageId: result.messageId,
                providerMessageId: result.messageId,
              },
            ];
          case 2:
            error_5 = _d.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5 instanceof Error ? error_5.message : "SMTP send failed",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SMTPEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      var results, totalSent, totalFailed, _i, messages_1, message, result;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            results = [];
            totalSent = 0;
            totalFailed = 0;
            (_i = 0), (messages_1 = messages);
            _b.label = 1;
          case 1:
            if (!(_i < messages_1.length)) return [3 /*break*/, 4];
            message = messages_1[_i];
            return [4 /*yield*/, this.sendEmail(message)];
          case 2:
            result = _b.sent();
            results.push({
              email:
                ((_a = message.to[0]) === null || _a === void 0 ? void 0 : _a.email) || "unknown",
              success: result.success,
              messageId: result.messageId,
              error: result.error,
            });
            if (result.success) {
              totalSent++;
            } else {
              totalFailed++;
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              2 /*return*/,
              {
                success: totalSent > 0,
                results: results,
                totalSent: totalSent,
                totalFailed: totalFailed,
              },
            ];
        }
      });
    });
  };
  SMTPEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // SMTP doesn't provide delivery status by default
        return [2 /*return*/, "sent"];
      });
    });
  };
  SMTPEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.transporter.verify()];
          case 1:
            _b.sent();
            return [2 /*return*/, true];
          case 2:
            _a = _b.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SMTPEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // SMTP doesn't have quota limits by default
        return [2 /*return*/, { used: 0, limit: Number.MAX_SAFE_INTEGER }];
      });
    });
  };
  return SMTPEmailProvider;
})();
var SESEmailProvider = /** @class */ (() => {
  function SESEmailProvider(config) {
    this.config = config;
    this.client = new client_ses_1.SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  SESEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      var command, result, error_6;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            command = new client_ses_1.SendEmailCommand({
              Source: "".concat(message.from.name || "", " <").concat(message.from.email, ">"),
              Destination: {
                ToAddresses: message.to.map((r) =>
                  "".concat(r.name || "", " <").concat(r.email, ">"),
                ),
                CcAddresses:
                  (_a = message.cc) === null || _a === void 0
                    ? void 0
                    : _a.map((r) => "".concat(r.name || "", " <").concat(r.email, ">")),
                BccAddresses:
                  (_b = message.bcc) === null || _b === void 0
                    ? void 0
                    : _b.map((r) => "".concat(r.name || "", " <").concat(r.email, ">")),
              },
              Message: {
                Subject: { Data: message.subject },
                Body: {
                  Html: { Data: message.htmlContent },
                  Text: message.textContent ? { Data: message.textContent } : undefined,
                },
              },
              ReplyToAddresses: message.replyTo
                ? ["".concat(message.replyTo.name || "", " <").concat(message.replyTo.email, ">")]
                : undefined,
              ConfigurationSetName: this.config.configurationSet,
            });
            return [4 /*yield*/, this.client.send(command)];
          case 1:
            result = _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                messageId: result.MessageId,
                providerMessageId: result.MessageId,
              },
            ];
          case 2:
            error_6 = _c.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_6 instanceof Error ? error_6.message : "SES send failed",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SESEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      var results, totalSent, totalFailed, _i, messages_2, message, result;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            results = [];
            totalSent = 0;
            totalFailed = 0;
            (_i = 0), (messages_2 = messages);
            _b.label = 1;
          case 1:
            if (!(_i < messages_2.length)) return [3 /*break*/, 4];
            message = messages_2[_i];
            return [4 /*yield*/, this.sendEmail(message)];
          case 2:
            result = _b.sent();
            results.push({
              email:
                ((_a = message.to[0]) === null || _a === void 0 ? void 0 : _a.email) || "unknown",
              success: result.success,
              messageId: result.messageId,
              error: result.error,
            });
            if (result.success) {
              totalSent++;
            } else {
              totalFailed++;
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              2 /*return*/,
              {
                success: totalSent > 0,
                results: results,
                totalSent: totalSent,
                totalFailed: totalFailed,
              },
            ];
        }
      });
    });
  };
  SESEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Would need to implement SES event tracking
        return [2 /*return*/, "sent"];
      });
    });
  };
  SESEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var SendingEnabled, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.client.send({ input: {} })];
          case 1:
            SendingEnabled = _b.sent().SendingEnabled;
            return [2 /*return*/, SendingEnabled !== false];
          case 2:
            _a = _b.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SESEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Would need to implement SES quota checking
        return [2 /*return*/, { used: 0, limit: 200 }]; // SES default for new accounts
      });
    });
  };
  return SESEmailProvider;
})();
// Placeholder implementations for other providers
var SendGridEmailProvider = /** @class */ (() => {
  function SendGridEmailProvider(config) {
    this.config = config;
  }
  SendGridEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // SendGrid implementation would go here
        return [2 /*return*/, { success: false, error: "SendGrid not implemented yet" }];
      });
    });
  };
  SendGridEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, results: [], totalSent: 0, totalFailed: messages.length },
      ]);
    });
  };
  SendGridEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, "sent"]);
    });
  };
  SendGridEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, false]);
    });
  };
  SendGridEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { used: 0, limit: 100 }]);
    });
  };
  return SendGridEmailProvider;
})();
var MailgunEmailProvider = /** @class */ (() => {
  function MailgunEmailProvider(config) {
    this.config = config;
  }
  MailgunEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, error: "Mailgun not implemented yet" },
      ]);
    });
  };
  MailgunEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, results: [], totalSent: 0, totalFailed: messages.length },
      ]);
    });
  };
  MailgunEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, "sent"]);
    });
  };
  MailgunEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, false]);
    });
  };
  MailgunEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { used: 0, limit: 100 }]);
    });
  };
  return MailgunEmailProvider;
})();
var ResendEmailProvider = /** @class */ (() => {
  function ResendEmailProvider(config) {
    this.config = config;
  }
  ResendEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, error: "Resend not implemented yet" },
      ]);
    });
  };
  ResendEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, results: [], totalSent: 0, totalFailed: messages.length },
      ]);
    });
  };
  ResendEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, "sent"]);
    });
  };
  ResendEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, false]);
    });
  };
  ResendEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { used: 0, limit: 100 }]);
    });
  };
  return ResendEmailProvider;
})();
var PostmarkEmailProvider = /** @class */ (() => {
  function PostmarkEmailProvider(config) {
    this.config = config;
  }
  PostmarkEmailProvider.prototype.sendEmail = function (message) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, error: "Postmark not implemented yet" },
      ]);
    });
  };
  PostmarkEmailProvider.prototype.sendBulkEmail = function (messages) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [
        2 /*return*/,
        { success: false, results: [], totalSent: 0, totalFailed: messages.length },
      ]);
    });
  };
  PostmarkEmailProvider.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, "sent"]);
    });
  };
  PostmarkEmailProvider.prototype.validateConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, false]);
    });
  };
  PostmarkEmailProvider.prototype.getQuotaUsage = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, { used: 0, limit: 100 }]);
    });
  };
  return PostmarkEmailProvider;
})();
// =======================================
// EXPORT
// =======================================
exports.default = EmailService;
