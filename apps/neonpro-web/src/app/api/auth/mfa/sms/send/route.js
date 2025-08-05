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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
// app/api/auth/mfa/sms/send/route.ts
// API route for sending SMS verification codes
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
// Note: This will require Twilio or AWS SNS configuration
// For now, we'll use a mock implementation that logs the code
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, phoneNumber, code, userId, supabase, _b, user, authError, rateLimitResult, error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, undefined, 6]);
          return [
            4 /*yield*/,
            request.json(),
            // Validate input
          ];
        case 1:
          (_a = _c.sent()), (phoneNumber = _a.phoneNumber), (code = _a.code), (userId = _a.userId);
          // Validate input
          if (!phoneNumber || !code || !userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Missing required parameters" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_b = _c.sent()), (user = _b.data.user), (authError = _b.error);
          if (authError || !user || user.id !== userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, checkSMSRateLimit(userId)];
        case 4:
          rateLimitResult = _c.sent();
          if (!rateLimitResult.allowed) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Rate limit exceeded. Please wait before requesting another code.",
                  retryAfter: rateLimitResult.retryAfter,
                },
                { status: 429 },
              ),
            ];
          }
          // TODO: Replace with actual SMS provider integration
          // For development, we'll log the code
          console.log("SMS MFA Code for ".concat(phoneNumber, ": ").concat(code));
          // In production, implement Twilio or AWS SNS:
          /*
                    const twilioClient = require('twilio')(
                      process.env.TWILIO_ACCOUNT_SID,
                      process.env.TWILIO_AUTH_TOKEN
                    )
                    
                    const message = await twilioClient.messages.create({
                      body: `Your NeonPro verification code is: ${code}. Valid for 10 minutes.`,
                      from: process.env.TWILIO_PHONE_NUMBER,
                      to: phoneNumber
                    })
                    
                    return NextResponse.json({
                      success: true,
                      messageId: message.sid
                    })
                    */
          // For development/testing
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              messageId: "mock-".concat(Date.now()),
              message: "SMS sent successfully (development mode)",
            }),
          ];
        case 5:
          error_1 = _c.sent();
          console.error("SMS sending error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error: "Failed to send SMS" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Rate limiting for SMS sending
function checkSMSRateLimit(userId) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, fiveMinutesAgo, _a, data, error, count, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, undefined, 4]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase
              .from("mfa_verification_codes")
              .select("id")
              .eq("user_id", userId)
              .eq("type", "sms")
              .gte("created_at", fiveMinutesAgo.toISOString()),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Rate limit check error:", error);
            return [2 /*return*/, { allowed: true }]; // Allow on error
          }
          count = (data === null || data === void 0 ? void 0 : data.length) || 0;
          if (count >= 3) {
            return [
              2 /*return*/,
              {
                allowed: false,
                retryAfter: 300, // 5 minutes
              },
            ];
          }
          return [2 /*return*/, { allowed: true }];
        case 3:
          error_2 = _b.sent();
          console.error("Rate limit check error:", error_2);
          return [2 /*return*/, { allowed: true }]; // Allow on error
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
