"use strict";
// WhatsApp Send Message API Route
// Handles sending individual and template messages via WhatsApp Business API
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
var whatsapp_service_1 = require("@/app/lib/services/whatsapp-service");
var server_2 = require("@/lib/supabase/server");
var whatsapp_1 = require("@/app/types/whatsapp");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      phoneNumber,
      content,
      _a,
      type,
      patientId,
      templateName,
      supabase,
      session,
      config,
      isOptedIn,
      messageId,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 8, , 9]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          console.log("WhatsApp send message request:", body);
          (phoneNumber = body.phoneNumber),
            (content = body.content),
            (_a = body.type),
            (type = _a === void 0 ? whatsapp_1.WhatsAppMessageType.TEXT : _a),
            (patientId = body.patientId),
            (templateName = body.templateName);
          if (!phoneNumber) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Phone number is required" }, { status: 400 }),
            ];
          }
          if (!content && type !== whatsapp_1.WhatsAppMessageType.TEMPLATE) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Content is required for non-template messages" },
                { status: 400 },
              ),
            ];
          }
          if (type === whatsapp_1.WhatsAppMessageType.TEMPLATE && !templateName) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Template name is required for template messages" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _b.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, (0, whatsapp_service_1.createwhatsAppService)().getConfig()];
        case 4:
          config = _b.sent();
          if (!config || !config.isActive) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "WhatsApp is not configured or inactive" },
                { status: 400 },
              ),
            ];
          }
          if (!patientId) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            (0, whatsapp_service_1.createwhatsAppService)().checkOptIn(phoneNumber),
          ];
        case 5:
          isOptedIn = _b.sent();
          if (!isOptedIn) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Patient has not opted in for WhatsApp communications" },
                { status: 400 },
              ),
            ];
          }
          _b.label = 6;
        case 6:
          return [
            4 /*yield*/,
            (0, whatsapp_service_1.createwhatsAppService)().sendMessage(
              phoneNumber,
              content,
              type,
              patientId,
              templateName,
            ),
          ];
        case 7:
          messageId = _b.sent();
          console.log("WhatsApp message sent successfully:", messageId);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              messageId: messageId,
              message: "Message sent successfully",
            }),
          ];
        case 8:
          error_1 = _b.sent();
          console.error("Error sending WhatsApp message:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: error_1 instanceof Error ? error_1.message : "Internal server error",
                details: error_1 instanceof Error ? error_1.stack : undefined,
              },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
