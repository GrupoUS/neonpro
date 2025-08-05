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
// app/api/auth/mfa/email/send/route.ts
// API route for sending email verification codes
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      email,
      code,
      userId,
      supabase,
      _b,
      user,
      authError,
      rateLimitResult,
      response,
      result,
      emailError_1,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, undefined, 11]);
          return [
            4 /*yield*/,
            request.json(),
            // Validate input
          ];
        case 1:
          (_a = _c.sent()), (email = _a.email), (code = _a.code), (userId = _a.userId);
          // Validate input
          if (!email || !code || !userId) {
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
          return [4 /*yield*/, checkEmailRateLimit(userId)];
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
          _c.label = 5;
        case 5:
          _c.trys.push([5, 8, undefined, 9]);
          return [
            4 /*yield*/,
            fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: "Bearer ".concat(process.env.RESEND_API_KEY),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "NeonPro <no-reply@neonpro.app>",
                to: [email],
                subject: "Your NeonPro Verification Code",
                html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h1 style="color: #333; text-align: center;">NeonPro Verification Code</h1>\n              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">\n                <h2 style="font-size: 32px; letter-spacing: 4px; margin: 0; color: #007bff;">'.concat(
                  code,
                  '</h2>\n              </div>\n              <p style="color: #666; line-height: 1.6;">\n                Use this verification code to complete your multi-factor authentication setup. \n                This code will expire in 10 minutes.\n              </p>\n              <p style="color: #666; line-height: 1.6;">\n                If you didn\'t request this code, please ignore this email or contact support if you have concerns.\n              </p>\n              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">\n              <p style="color: #999; font-size: 12px; text-align: center;">\n                This email was sent by NeonPro. Please do not reply to this email.\n              </p>\n            </div>\n          ',
                ),
                text: "Your NeonPro verification code is: ".concat(
                  code,
                  ". This code will expire in 10 minutes. If you didn't request this code, please ignore this email.",
                ),
              }),
            }),
          ];
        case 6:
          response = _c.sent();
          if (!response.ok) {
            throw new Error("Email service error: ".concat(response.status));
          }
          return [4 /*yield*/, response.json()];
        case 7:
          result = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              messageId: result.id,
              message: "Email sent successfully",
            }),
          ];
        case 8:
          emailError_1 = _c.sent();
          console.error("Email sending error:", emailError_1);
          // Fallback: Log the code for development
          console.log("Email MFA Code for ".concat(email, ": ").concat(code));
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              messageId: "mock-".concat(Date.now()),
              message: "Email sent successfully (development mode)",
              warning: "Email service unavailable, check console for code",
            }),
          ];
        case 9:
          return [3 /*break*/, 11];
        case 10:
          error_1 = _c.sent();
          console.error("Email MFA error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error: "Failed to send email" },
              { status: 500 },
            ),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// Rate limiting for email sending
function checkEmailRateLimit(userId) {
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
              .eq("type", "email")
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
