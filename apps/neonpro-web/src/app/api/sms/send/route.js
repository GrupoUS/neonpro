// SMS Send Message API for NeonPro
// Send individual SMS messages
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var sms_service_1 = require("@/app/lib/services/sms-service");
var sms_1 = require("@/app/types/sms");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, body, validatedData, result, error_1, statusCode;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication required",
                  },
                },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validatedData = sms_1.SendSMSSchema.parse(body);
          return [
            4 /*yield*/,
            sms_service_1.smsService.sendMessage({
              provider_id: validatedData.provider_id,
              to: validatedData.to,
              body: validatedData.body,
              template_id: validatedData.template_id,
              variables: validatedData.variables,
            }),
          ];
        case 4:
          result = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: result,
                metadata: {
                  timestamp: new Date().toISOString(),
                  request_id: "send_".concat(Date.now()),
                  user_id: session.user.id,
                },
              },
              { status: 200 },
            ),
          ];
        case 5:
          error_1 = _a.sent();
          console.error("SMS send error:", error_1);
          // Handle validation errors
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid request data",
                    details: error_1.errors,
                  },
                },
                { status: 400 },
              ),
            ];
          }
          // Handle SMS service errors
          if (error_1 && typeof error_1 === "object" && "code" in error_1) {
            statusCode = getStatusCodeForError(error_1.code);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: {
                    code: error_1.code,
                    message: error_1.message || "SMS service error",
                    details: process.env.NODE_ENV === "development" ? error_1 : undefined,
                  },
                },
                { status: statusCode },
              ),
            ];
          }
          // Handle unknown errors
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Internal server error",
                  details: process.env.NODE_ENV === "development" ? error_1 : undefined,
                },
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get appropriate HTTP status code for SMS error
 */
function getStatusCodeForError(errorCode) {
  switch (errorCode) {
    case "INVALID_PHONE":
    case "INVALID_MESSAGE":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "RATE_LIMIT":
      return 429;
    case "INSUFFICIENT_BALANCE":
      return 402;
    case "OPT_OUT":
    case "BLACKLISTED":
      return 403;
    case "PROVIDER_ERROR":
    case "NETWORK_ERROR":
    default:
      return 500;
  }
}
// Handle other HTTP methods
function GET() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        {
          success: false,
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Only POST method is allowed",
          },
        },
        { status: 405 },
      ),
    ]);
  });
}
function PUT() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        {
          success: false,
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Only POST method is allowed",
          },
        },
        { status: 405 },
      ),
    ]);
  });
}
function DELETE() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json(
        {
          success: false,
          error: {
            code: "METHOD_NOT_ALLOWED",
            message: "Only POST method is allowed",
          },
        },
        { status: 405 },
      ),
    ]);
  });
}
