// WhatsApp Business API Webhook Handler
// Handles webhook events from Meta's WhatsApp Cloud API
// Used for message status updates and incoming messages
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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var whatsapp_service_1 = require("@/app/lib/services/whatsapp-service");
var server_2 = require("@/lib/supabase/server");
// Webhook verification (required by Meta)
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, mode, token, challenge, supabase, config, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          searchParams = request.nextUrl.searchParams;
          mode = searchParams.get("hub.mode");
          token = searchParams.get("hub.verify_token");
          challenge = searchParams.get("hub.challenge");
          console.log("WhatsApp webhook verification request:", {
            mode: mode,
            token: token,
            challenge: challenge,
          });
          if (!(mode === "subscribe")) return [3 /*break*/, 3];
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase.from("whatsapp_config").select("webhook_verify_token").single(),
          ];
        case 2:
          config = _a.sent().data;
          if (!(config === null || config === void 0 ? void 0 : config.webhook_verify_token)) {
            console.error("No webhook verify token configured");
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Webhook verify token not configured" },
                { status: 400 },
              ),
            ];
          }
          if (token === config.webhook_verify_token) {
            console.log("Webhook verification successful");
            return [2 /*return*/, new server_1.NextResponse(challenge, { status: 200 })];
          } else {
            console.error("Invalid webhook verify token");
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid verify token" }, { status: 403 }),
            ];
          }
          _a.label = 3;
        case 3:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid verification request" }, { status: 400 }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Webhook verification error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// Webhook event handler
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var payload, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 6]);
          return [4 /*yield*/, request.json()];
        case 1:
          payload = _a.sent();
          console.log("WhatsApp webhook payload received:", JSON.stringify(payload, null, 2));
          // Verify the webhook payload structure
          if (!payload.object || payload.object !== "whatsapp_business_account") {
            console.error("Invalid webhook object type:", payload.object);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid webhook object" }, { status: 400 }),
            ];
          }
          if (!payload.entry || !Array.isArray(payload.entry)) {
            console.error("Invalid webhook entry structure");
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid webhook entry" }, { status: 400 }),
            ];
          }
          // Process the webhook payload
          return [
            4 /*yield*/,
            (0, whatsapp_service_1.createwhatsAppService)().handleWebhook(payload),
          ];
        case 2:
          // Process the webhook payload
          _a.sent();
          // Log webhook event for debugging
          return [4 /*yield*/, logWebhookEvent(payload)];
        case 3:
          // Log webhook event for debugging
          _a.sent();
          console.log("Webhook processed successfully");
          return [2 /*return*/, server_1.NextResponse.json({ status: "success" }, { status: 200 })];
        case 4:
          error_2 = _a.sent();
          console.error("Webhook processing error:", error_2);
          // Log the error for debugging
          return [
            4 /*yield*/,
            logWebhookError(error_2 instanceof Error ? error_2.message : "Unknown error"),
          ];
        case 5:
          // Log the error for debugging
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Helper function to log webhook events
function logWebhookEvent(payload) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, error, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase.from("whatsapp_webhook_logs").insert({
              event_type: "webhook_received",
              payload: payload,
              status: "success",
              created_at: new Date().toISOString(),
            }),
          ];
        case 2:
          error = _a.sent().error;
          if (error) {
            console.error("Error logging webhook event:", error);
          }
          return [3 /*break*/, 4];
        case 3:
          error_3 = _a.sent();
          console.error("Database error logging webhook event:", error_3);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// Helper function to log webhook errors
function logWebhookError(errorMessage) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, error, error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [
            4 /*yield*/,
            supabase.from("whatsapp_webhook_logs").insert({
              event_type: "webhook_error",
              payload: { error: errorMessage },
              status: "error",
              created_at: new Date().toISOString(),
            }),
          ];
        case 2:
          error = _a.sent().error;
          if (error) {
            console.error("Error logging webhook error:", error);
          }
          return [3 /*break*/, 4];
        case 3:
          error_4 = _a.sent();
          console.error("Database error logging webhook error:", error_4);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
