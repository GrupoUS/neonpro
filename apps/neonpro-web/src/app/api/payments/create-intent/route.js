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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var stripe_1 = require("@/lib/payments/stripe");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      amount,
      _a,
      currency,
      invoiceId,
      patientId,
      _b,
      metadata,
      supabase,
      _c,
      user,
      authError,
      paymentIntent,
      updateError,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 7, , 8]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _d.sent();
          (amount = body.amount),
            (_a = body.currency),
            (currency = _a === void 0 ? stripe_1.STRIPE_CONFIG.currency : _a),
            (invoiceId = body.invoiceId),
            (patientId = body.patientId),
            (_b = body.metadata),
            (metadata = _b === void 0 ? {} : _b);
          // Validate required fields
          if (!amount || amount <= 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid amount provided" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            stripe_1.stripe.paymentIntents.create({
              amount: Math.round(amount * 100), // Convert to cents
              currency: currency,
              automatic_payment_methods: {
                enabled: true,
              },
              metadata: __assign(
                { userId: user.id, invoiceId: invoiceId || "", patientId: patientId || "" },
                metadata,
              ),
              description: "NeonPro Invoice Payment - ".concat(invoiceId || "N/A"),
            }),
            // Update invoice status in database if invoiceId provided
          ];
        case 4:
          paymentIntent = _d.sent();
          if (!invoiceId) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                payment_intent_id: paymentIntent.id,
                status: "pending_payment",
                updated_at: new Date().toISOString(),
              })
              .eq("id", invoiceId)
              .eq("user_id", user.id),
          ];
        case 5:
          updateError = _d.sent().error;
          if (updateError) {
            console.error("Error updating invoice:", updateError);
            // Continue anyway - payment intent created successfully
          }
          _d.label = 6;
        case 6:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              clientSecret: paymentIntent.client_secret,
              paymentIntentId: paymentIntent.id,
              status: paymentIntent.status,
            }),
          ];
        case 7:
          error_1 = _d.sent();
          console.error("Payment intent creation failed:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to create payment intent",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, paymentIntentId, supabase, _a, user, authError, paymentIntent, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          paymentIntentId = searchParams.get("paymentIntentId");
          if (!paymentIntentId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Payment Intent ID required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            stripe_1.stripe.paymentIntents.retrieve(paymentIntentId),
            // Verify ownership through metadata
          ];
        case 3:
          paymentIntent = _b.sent();
          // Verify ownership through metadata
          if (paymentIntent.metadata.userId !== user.id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Unauthorized access to payment intent" },
                { status: 403 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount / 100, // Convert back from cents
              currency: paymentIntent.currency,
              created: paymentIntent.created,
              metadata: paymentIntent.metadata,
            }),
          ];
        case 4:
          error_2 = _b.sent();
          console.error("Payment intent retrieval failed:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to retrieve payment intent",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
