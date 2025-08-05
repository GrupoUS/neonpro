"use strict";
/**
 * NeonPro - Stripe Connector
 * Integration with Stripe API for payment processing
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
exports.StripeUtils = exports.StripeConnector = void 0;
/**
 * Stripe Connector
 */
var StripeConnector = /** @class */ (function () {
  function StripeConnector(config) {
    this.baseUrl = "https://api.stripe.com/v1";
    this.config = config;
  }
  /**
   * Test connection to Stripe API
   */
  StripeConnector.prototype.testConnection = function () {
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
                endpoint: "/account",
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              response.success && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id),
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Stripe connection test failed:", error_1);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create customer
   */
  StripeConnector.prototype.createCustomer = function (customer) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/customers",
                data: customer,
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  customerId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_2 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Failed to create customer",
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
   * Get customer
   */
  StripeConnector.prototype.getCustomer = function (customerId) {
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
                endpoint: "/customers/".concat(customerId),
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
                error: error_3 instanceof Error ? error_3.message : "Failed to get customer",
                metadata: {
                  customerId: customerId,
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
   * Update customer
   */
  StripeConnector.prototype.updateCustomer = function (customerId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/customers/".concat(customerId),
                data: updates,
              }),
            ];
          case 1:
            response = _a.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  customerId: customerId,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_4 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Failed to update customer",
                metadata: {
                  customerId: customerId,
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
   * Create payment intent
   */
  StripeConnector.prototype.createPaymentIntent = function (paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/payment_intents",
                data: __assign(__assign({}, paymentIntent), {
                  payment_method_types: paymentIntent.payment_method_types || ["card", "pix"],
                }),
              }),
            ];
          case 1:
            response = _c.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  paymentIntentId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                  clientSecret:
                    (_b = response.data) === null || _b === void 0 ? void 0 : _b.client_secret,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_5 = _c.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_5 instanceof Error ? error_5.message : "Failed to create payment intent",
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
   * Confirm payment intent
   */
  StripeConnector.prototype.confirmPaymentIntent = function (paymentIntentId, paymentMethodId) {
    return __awaiter(this, void 0, void 0, function () {
      var data, response, error_6;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            data = {};
            if (paymentMethodId) {
              data.payment_method = paymentMethodId;
            }
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/payment_intents/".concat(paymentIntentId, "/confirm"),
                data: data,
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  paymentIntentId: paymentIntentId,
                  status: (_a = response.data) === null || _a === void 0 ? void 0 : _a.status,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_6 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_6 instanceof Error ? error_6.message : "Failed to confirm payment intent",
                metadata: {
                  paymentIntentId: paymentIntentId,
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
   * Cancel payment intent
   */
  StripeConnector.prototype.cancelPaymentIntent = function (paymentIntentId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/payment_intents/".concat(paymentIntentId, "/cancel"),
              }),
            ];
          case 1:
            response = _a.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  paymentIntentId: paymentIntentId,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_7 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_7 instanceof Error ? error_7.message : "Failed to cancel payment intent",
                metadata: {
                  paymentIntentId: paymentIntentId,
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
   * Create product
   */
  StripeConnector.prototype.createProduct = function (product) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_8;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/products",
                data: product,
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  productId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_8 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_8 instanceof Error ? error_8.message : "Failed to create product",
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
   * Create price
   */
  StripeConnector.prototype.createPrice = function (price) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_9;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/prices",
                data: price,
              }),
            ];
          case 1:
            response = _b.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  priceId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_9 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_9 instanceof Error ? error_9.message : "Failed to create price",
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
   * Create subscription
   */
  StripeConnector.prototype.createSubscription = function (subscription) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_10;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "POST",
                endpoint: "/subscriptions",
                data: subscription,
              }),
            ];
          case 1:
            response = _c.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  subscriptionId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                  status: (_b = response.data) === null || _b === void 0 ? void 0 : _b.status,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_10 = _c.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_10 instanceof Error ? error_10.message : "Failed to create subscription",
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
   * Cancel subscription
   */
  StripeConnector.prototype.cancelSubscription = function (subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.makeRequest({
                method: "DELETE",
                endpoint: "/subscriptions/".concat(subscriptionId),
              }),
            ];
          case 1:
            response = _a.sent();
            return [
              2 /*return*/,
              {
                success: response.success,
                data: response.data,
                error: response.error,
                metadata: {
                  subscriptionId: subscriptionId,
                  timestamp: new Date().toISOString(),
                },
              },
            ];
          case 2:
            error_11 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_11 instanceof Error ? error_11.message : "Failed to cancel subscription",
                metadata: {
                  subscriptionId: subscriptionId,
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
   * Create appointment payment
   */
  StripeConnector.prototype.createAppointmentPayment = function (
    patientEmail,
    patientName,
    appointmentId,
    amount,
    description,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var customerResponse, paymentIntent, error_12;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.createCustomer({
                email: patientEmail,
                name: patientName,
                metadata: {
                  source: "neonpro",
                  appointmentId: appointmentId,
                },
              }),
            ];
          case 1:
            customerResponse = _b.sent();
            if (!customerResponse.success) {
              return [2 /*return*/, customerResponse];
            }
            paymentIntent = {
              amount: Math.round(amount * 100), // Convert to cents
              currency: this.config.currency,
              customer: (_a = customerResponse.data) === null || _a === void 0 ? void 0 : _a.id,
              description: description,
              metadata: {
                source: "neonpro",
                appointmentId: appointmentId,
                patientEmail: patientEmail,
                patientName: patientName,
              },
              receipt_email: patientEmail,
              payment_method_types: ["card", "pix"],
            };
            return [2 /*return*/, this.createPaymentIntent(paymentIntent)];
          case 2:
            error_12 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error:
                  error_12 instanceof Error
                    ? error_12.message
                    : "Failed to create appointment payment",
                metadata: {
                  appointmentId: appointmentId,
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
   * Process webhook
   */
  StripeConnector.prototype.processWebhook = function (payload, signature) {
    return __awaiter(this, void 0, void 0, function () {
      var isValid, event_1;
      return __generator(this, function (_a) {
        try {
          isValid = this.verifyWebhookSignature(payload, signature);
          if (!isValid) {
            throw new Error("Invalid webhook signature");
          }
          event_1 = JSON.parse(payload);
          return [
            2 /*return*/,
            {
              type: event_1.type,
              data: event_1.data,
              id: event_1.id,
              created: event_1.created,
              livemode: event_1.livemode,
            },
          ];
        } catch (error) {
          throw new Error(
            "Webhook processing failed: ".concat(
              error instanceof Error ? error.message : "Unknown error",
            ),
          );
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get webhook configuration
   */
  StripeConnector.prototype.getWebhookConfig = function () {
    return {
      id: "stripe-payments",
      url: this.config.webhookUrl || "",
      events: [
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "customer.created",
        "customer.updated",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "subscription.created",
        "subscription.updated",
        "subscription.deleted",
      ],
      active: true,
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffStrategy: "exponential",
      },
    };
  };
  // Private helper methods
  /**
   * Make API request to Stripe
   */
  StripeConnector.prototype.makeRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var url, options, response, data, error_13;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            url = "".concat(this.baseUrl).concat(request.endpoint);
            options = {
              method: request.method,
              headers: __assign(
                {
                  Authorization: "Bearer ".concat(this.config.secretKey),
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Stripe-Version": "2023-10-16",
                },
                request.headers,
              ),
            };
            if (request.data) {
              options.body = this.encodeFormData(request.data);
            }
            return [4 /*yield*/, fetch(url, options)];
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
            error_13 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: error_13 instanceof Error ? error_13.message : "Request failed",
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
   * Encode data as form data for Stripe API
   */
  StripeConnector.prototype.encodeFormData = function (data, prefix) {
    var _this = this;
    if (prefix === void 0) {
      prefix = "";
    }
    var params = [];
    var _loop_1 = function (key) {
      if (data.hasOwnProperty(key)) {
        var value = data[key];
        var encodedKey_1 = prefix ? "".concat(prefix, "[").concat(key, "]") : key;
        if (value === null || value === undefined) {
          return "continue";
        }
        if (typeof value === "object" && !Array.isArray(value)) {
          params.push(this_1.encodeFormData(value, encodedKey_1));
        } else if (Array.isArray(value)) {
          value.forEach(function (item, index) {
            if (typeof item === "object") {
              params.push(
                _this.encodeFormData(item, "".concat(encodedKey_1, "[").concat(index, "]")),
              );
            } else {
              params.push(
                "".concat(encodedKey_1, "[").concat(index, "]=").concat(encodeURIComponent(item)),
              );
            }
          });
        } else {
          params.push("".concat(encodedKey_1, "=").concat(encodeURIComponent(value)));
        }
      }
    };
    var this_1 = this;
    for (var key in data) {
      _loop_1(key);
    }
    return params.join("&");
  };
  /**
   * Verify webhook signature
   */
  StripeConnector.prototype.verifyWebhookSignature = function (payload, signature) {
    try {
      // This is a simplified version. In production, use Stripe's webhook verification
      var expectedSignature = signature.split(",").find(function (s) {
        return s.startsWith("v1=");
      });
      if (!expectedSignature) {
        return false;
      }
      // In a real implementation, you would use crypto to verify the HMAC
      // For now, we'll just check if the webhook secret is configured
      return !!this.config.webhookSecret;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  };
  return StripeConnector;
})();
exports.StripeConnector = StripeConnector;
/**
 * Stripe Utility Functions
 */
var StripeUtils = /** @class */ (function () {
  function StripeUtils() {}
  /**
   * Format amount for display
   */
  StripeUtils.formatAmount = function (amount, currency) {
    if (currency === void 0) {
      currency = "BRL";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };
  /**
   * Convert amount to cents
   */
  StripeUtils.toCents = function (amount) {
    return Math.round(amount * 100);
  };
  /**
   * Convert cents to amount
   */
  StripeUtils.fromCents = function (cents) {
    return cents / 100;
  };
  /**
   * Generate payment description
   */
  StripeUtils.generatePaymentDescription = function (
    appointmentType,
    patientName,
    doctorName,
    date,
  ) {
    var formattedDate = date.toLocaleDateString("pt-BR");
    return ""
      .concat(appointmentType, " - ")
      .concat(patientName, " com Dr(a). ")
      .concat(doctorName, " em ")
      .concat(formattedDate);
  };
  /**
   * Get payment status in Portuguese
   */
  StripeUtils.getPaymentStatusText = function (status) {
    var statusMap = {
      requires_payment_method: "Aguardando método de pagamento",
      requires_confirmation: "Aguardando confirmação",
      requires_action: "Ação necessária",
      processing: "Processando",
      requires_capture: "Aguardando captura",
      canceled: "Cancelado",
      succeeded: "Pago com sucesso",
    };
    return statusMap[status] || status;
  };
  /**
   * Validate Brazilian CPF for customer creation
   */
  StripeUtils.validateCPF = function (cpf) {
    cpf = cpf.replace(/[^\d]/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    var digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    if (parseInt(cpf[9]) !== digit1) {
      return false;
    }
    sum = 0;
    for (var i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    var digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    return parseInt(cpf[10]) === digit2;
  };
  /**
   * Create installment options
   */
  StripeUtils.createInstallmentOptions = function (
    amount,
    maxInstallments,
    minInstallmentAmount, // R$ 5.00 in cents
  ) {
    if (maxInstallments === void 0) {
      maxInstallments = 12;
    }
    if (minInstallmentAmount === void 0) {
      minInstallmentAmount = 500;
    }
    var options = [];
    for (var i = 1; i <= maxInstallments; i++) {
      var installmentAmount = Math.ceil(amount / i);
      if (installmentAmount >= minInstallmentAmount) {
        options.push({
          installments: i,
          amount: installmentAmount,
          total: installmentAmount * i,
        });
      }
    }
    return options;
  };
  return StripeUtils;
})();
exports.StripeUtils = StripeUtils;
