// SMS Webhook Handler for NeonPro
// Handles delivery reports and status updates from SMS providers
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
var headers_1 = require("next/headers");
var sms_service_1 = require("@/app/lib/services/sms-service");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, provider, payload, isValid, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          provider = searchParams.get("provider");
          if (!provider) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: { code: "MISSING_PROVIDER", message: "Provider parameter required" },
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 1:
          payload = _a.sent();
          console.log("Received ".concat(provider, " webhook:"), payload);
          return [4 /*yield*/, verifyWebhookSignature(provider, request, payload)];
        case 2:
          isValid = _a.sent();
          if (!isValid) {
            console.warn("Invalid webhook signature for provider: ".concat(provider));
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: { code: "INVALID_SIGNATURE", message: "Invalid webhook signature" },
                },
                { status: 401 },
              ),
            ];
          }
          // Process webhook based on provider
          return [4 /*yield*/, sms_service_1.smsService.processWebhook(provider, payload)];
        case 3:
          // Process webhook based on provider
          _a.sent();
          // Return success response
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: { message: "Webhook processed successfully" },
                metadata: {
                  provider: provider,
                  timestamp: new Date().toISOString(),
                  request_id: "webhook_".concat(Date.now()),
                },
              },
              { status: 200 },
            ),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("SMS webhook error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: {
                  code: "WEBHOOK_ERROR",
                  message: error_1 instanceof Error ? error_1.message : "Internal webhook error",
                  details: process.env.NODE_ENV === "development" ? error_1 : undefined,
                },
                metadata: {
                  timestamp: new Date().toISOString(),
                  request_id: "webhook_error_".concat(Date.now()),
                },
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
/**
 * Verify webhook signature based on provider
 */
function verifyWebhookSignature(provider, request, payload) {
  return __awaiter(this, void 0, void 0, function () {
    var headersList;
    return __generator(this, (_a) => {
      headersList = (0, headers_1.headers)();
      try {
        switch (provider) {
          case "twilio":
            return [2 /*return*/, verifyTwilioSignature(request, payload)];
          case "sms_dev":
            return [2 /*return*/, verifySMSDevSignature(headersList, payload)];
          case "zenvia":
            return [2 /*return*/, verifyZenviaSignature(headersList, payload)];
          case "movile":
            return [2 /*return*/, verifyMovileSignature(headersList, payload)];
          default:
            console.warn(
              "Webhook signature verification not implemented for provider: ".concat(provider),
            );
            return [2 /*return*/, true]; // Allow for custom providers without verification
        }
      } catch (error) {
        console.error("Error verifying ".concat(provider, " webhook signature:"), error);
        return [2 /*return*/, false];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Verify Twilio webhook signature
 */
function verifyTwilioSignature(request, payload) {
  // Twilio webhook verification would be implemented here
  // This requires the Twilio SDK and auth token
  // For development, we'll skip verification
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  // In production, implement proper Twilio signature verification
  // const crypto = require('crypto');
  // const twilioSignature = request.headers.get('x-twilio-signature');
  // const expectedSignature = crypto
  //   .createHmac('sha1', twilioAuthToken)
  //   .update(Buffer.from(url + Object.keys(payload).sort().map(key => key + payload[key]).join(''), 'utf-8'))
  //   .digest('base64');
  // return crypto.timingSafeEqual(Buffer.from(twilioSignature), Buffer.from(expectedSignature));
  return true;
}
/**
 * Verify SMS Dev webhook signature
 */
function verifySMSDevSignature(headers, payload) {
  // SMS Dev webhook verification
  var signature = headers.get("x-smsdev-signature");
  if (!signature) {
    return process.env.NODE_ENV === "development";
  }
  // Implement SMS Dev signature verification logic here
  return true;
}
/**
 * Verify ZENVIA webhook signature
 */
function verifyZenviaSignature(headers, payload) {
  // ZENVIA webhook verification
  var signature = headers.get("x-zenvia-signature");
  if (!signature) {
    return process.env.NODE_ENV === "development";
  }
  // Implement ZENVIA signature verification logic here
  return true;
}
/**
 * Verify Movile webhook signature
 */
function verifyMovileSignature(headers, payload) {
  // Movile webhook verification
  var signature = headers.get("x-movile-signature");
  if (!signature) {
    return process.env.NODE_ENV === "development";
  }
  // Implement Movile signature verification logic here
  return true;
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
            message: "Only POST method is allowed for webhooks",
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
            message: "Only POST method is allowed for webhooks",
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
            message: "Only POST method is allowed for webhooks",
          },
        },
        { status: 405 },
      ),
    ]);
  });
}
