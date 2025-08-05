"use strict";
/**
 * Payment Processing API
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * POST /api/subscription/payment/create-checkout - Create payment checkout session
 */
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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
// Note: Stripe/MercadoPago integration to be implemented in next phase
// This is the structure for payment processing
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      body,
      plan_id,
      billing_cycle,
      _a,
      payment_provider,
      userClinic,
      _b,
      plan,
      planError,
      price,
      existingSubscription,
      checkoutData,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 13, , 14]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          (plan_id = body.plan_id),
            (billing_cycle = body.billing_cycle),
            (_a = body.payment_provider),
            (payment_provider = _a === void 0 ? "stripe" : _a);
          // Validate input
          if (!plan_id || !billing_cycle) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required fields: plan_id, billing_cycle" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id")
              .eq("user_id", session.user.id)
              .eq("is_active", true)
              .single(),
          ];
        case 4:
          userClinic = _c.sent().data;
          if (!userClinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No active clinic found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("subscription_plans")
              .select("*")
              .eq("id", plan_id)
              .eq("is_active", true)
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (plan = _b.data), (planError = _b.error);
          if (planError || !plan) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 }),
            ];
          }
          price = void 0;
          switch (billing_cycle) {
            case "monthly":
              price = plan.price_monthly || 0;
              break;
            case "quarterly":
              price = plan.price_quarterly || 0;
              break;
            case "yearly":
              price = plan.price_yearly || 0;
              break;
            default:
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 }),
              ];
          }
          if (price <= 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Price not available for selected billing cycle" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("user_subscriptions")
              .select("*")
              .eq("clinic_id", userClinic.clinic_id)
              .in("status", ["trial", "active"])
              .single(),
          ];
        case 6:
          existingSubscription = _c.sent().data;
          if (existingSubscription && !existingSubscription.cancel_at_period_end) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Existing active subscription found",
                  code: "EXISTING_SUBSCRIPTION",
                  message:
                    "Voce ja possui uma assinatura ativa. Para alterar o plano, use a funcao de upgrade/downgrade.",
                },
                { status: 409 },
              ),
            ];
          }
          checkoutData = void 0;
          if (!(payment_provider === "stripe")) return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            createStripeCheckout({
              plan: plan,
              billing_cycle: billing_cycle,
              price: price,
              user: session.user,
              clinic_id: userClinic.clinic_id,
            }),
          ];
        case 7:
          checkoutData = _c.sent();
          return [3 /*break*/, 11];
        case 8:
          if (!(payment_provider === "mercado_pago")) return [3 /*break*/, 10];
          return [
            4 /*yield*/,
            createMercadoPagoCheckout({
              plan: plan,
              billing_cycle: billing_cycle,
              price: price,
              user: session.user,
              clinic_id: userClinic.clinic_id,
            }),
          ];
        case 9:
          checkoutData = _c.sent();
          return [3 /*break*/, 11];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Unsupported payment provider" }, { status: 400 }),
          ];
        case 11:
          // Create billing event record
          return [
            4 /*yield*/,
            supabase.from("billing_events").insert({
              subscription_id:
                (existingSubscription === null || existingSubscription === void 0
                  ? void 0
                  : existingSubscription.id) || null,
              event_type: "invoice_created",
              amount: price,
              currency: "BRL",
              status: "pending",
              external_event_id: checkoutData.session_id,
              metadata: {
                plan_id: plan_id,
                billing_cycle: billing_cycle,
                payment_provider: payment_provider,
                clinic_id: userClinic.clinic_id,
                user_id: session.user.id,
              },
            }),
          ];
        case 12:
          // Create billing event record
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                checkout_url: checkoutData.url,
                session_id: checkoutData.session_id,
                payment_provider: payment_provider,
                amount: price,
                currency: "BRL",
                billing_cycle: billing_cycle,
                plan: {
                  id: plan.id,
                  name: plan.name,
                  display_name: plan.display_name,
                },
              },
            }),
          ];
        case 13:
          error_1 = _c.sent();
          console.error("Payment creation API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
// Stripe checkout creation (placeholder - to be implemented with actual Stripe SDK)
function createStripeCheckout(params) {
  return __awaiter(this, void 0, void 0, function () {
    var plan, billing_cycle, price, user, clinic_id;
    return __generator(this, function (_a) {
      (plan = params.plan),
        (billing_cycle = params.billing_cycle),
        (price = params.price),
        (user = params.user),
        (clinic_id = params.clinic_id);
      // Placeholder response - replace with actual Stripe implementation
      return [
        2 /*return*/,
        {
          url: "".concat(
            process.env.NEXT_PUBLIC_APP_URL,
            "/subscription/checkout/stripe?session_id=placeholder_session_id",
          ),
          session_id: "cs_test_"
            .concat(Date.now(), "_")
            .concat(Math.random().toString(36).substr(2, 9)),
        },
      ];
    });
  });
}
// MercadoPago checkout creation (placeholder - to be implemented with actual MP SDK)
function createMercadoPagoCheckout(params) {
  return __awaiter(this, void 0, void 0, function () {
    var plan, billing_cycle, price, user, clinic_id;
    return __generator(this, function (_a) {
      (plan = params.plan),
        (billing_cycle = params.billing_cycle),
        (price = params.price),
        (user = params.user),
        (clinic_id = params.clinic_id);
      // Placeholder response - replace with actual MercadoPago implementation
      return [
        2 /*return*/,
        {
          url: "".concat(
            process.env.NEXT_PUBLIC_APP_URL,
            "/subscription/checkout/mercado-pago?session_id=placeholder_session_id",
          ),
          session_id: "mp_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
        },
      ];
    });
  });
}
