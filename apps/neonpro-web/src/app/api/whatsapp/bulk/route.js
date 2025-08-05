// WhatsApp Bulk Message API Route
// Handles sending bulk template messages to multiple recipients
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
var server_1 = require("next/server");
var whatsapp_service_1 = require("@/app/lib/services/whatsapp-service");
var server_2 = require("@/lib/supabase/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      templateName,
      _a,
      parameters,
      recipientType,
      _b,
      selectedPatients,
      _c,
      customPhoneNumbers,
      supabase,
      session,
      config,
      phoneNumbers,
      _d,
      optIns,
      error,
      _e,
      optIns,
      error,
      optInChecks,
      results,
      error_1;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 12, , 13]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _f.sent();
          console.log("WhatsApp bulk message request:", body);
          (templateName = body.templateName),
            (_a = body.parameters),
            (parameters = _a === void 0 ? {} : _a),
            (recipientType = body.recipientType),
            (_b = body.selectedPatients),
            (selectedPatients = _b === void 0 ? [] : _b),
            (_c = body.customPhoneNumbers),
            (customPhoneNumbers = _c === void 0 ? [] : _c);
          if (!templateName) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Template name is required" }, { status: 400 }),
            ];
          }
          if (
            !recipientType ||
            !["all_patients", "selected_patients", "custom_list"].includes(recipientType)
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error:
                    "Valid recipient type is required (all_patients, selected_patients, custom_list)",
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _f.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, (0, whatsapp_service_1.createwhatsAppService)().getConfig()];
        case 4:
          config = _f.sent();
          if (!config || !config.isActive) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "WhatsApp is not configured or inactive" },
                { status: 400 },
              ),
            ];
          }
          phoneNumbers = [];
          if (!(recipientType === "all_patients")) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase.from("whatsapp_opt_ins").select("phone_number").eq("is_opted_in", true),
          ];
        case 5:
          (_d = _f.sent()), (optIns = _d.data), (error = _d.error);
          if (error) {
            console.error("Error fetching opt-ins:", error);
            throw new Error("Failed to fetch patient opt-ins");
          }
          phoneNumbers =
            (optIns === null || optIns === void 0
              ? void 0
              : optIns.map((opt) => opt.phone_number)) || [];
          return [3 /*break*/, 10];
        case 6:
          if (!(recipientType === "selected_patients")) return [3 /*break*/, 8];
          if (!selectedPatients.length) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Selected patients are required for selected_patients type" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("whatsapp_opt_ins")
              .select("phone_number")
              .in("patient_id", selectedPatients)
              .eq("is_opted_in", true),
          ];
        case 7:
          (_e = _f.sent()), (optIns = _e.data), (error = _e.error);
          if (error) {
            console.error("Error fetching selected patient opt-ins:", error);
            throw new Error("Failed to fetch selected patient opt-ins");
          }
          phoneNumbers =
            (optIns === null || optIns === void 0
              ? void 0
              : optIns.map((opt) => opt.phone_number)) || [];
          return [3 /*break*/, 10];
        case 8:
          if (!(recipientType === "custom_list")) return [3 /*break*/, 10];
          if (!customPhoneNumbers.length) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Custom phone numbers are required for custom_list type" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all(
              customPhoneNumbers.map((phone) =>
                __awaiter(this, void 0, void 0, function () {
                  var isOptedIn;
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          (0, whatsapp_service_1.createwhatsAppService)().checkOptIn(phone),
                        ];
                      case 1:
                        isOptedIn = _a.sent();
                        return [2 /*return*/, isOptedIn ? phone : null];
                    }
                  });
                }),
              ),
            ),
          ];
        case 9:
          optInChecks = _f.sent();
          phoneNumbers = optInChecks.filter((phone) => phone !== null);
          _f.label = 10;
        case 10:
          if (!phoneNumbers.length) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "No valid recipients found with WhatsApp opt-in" },
                { status: 400 },
              ),
            ];
          }
          // Limit bulk sending to prevent abuse
          if (phoneNumbers.length > 1000) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Bulk sending limited to 1000 recipients per batch" },
                { status: 400 },
              ),
            ];
          }
          console.log("Starting bulk send to ".concat(phoneNumbers.length, " recipients"));
          return [
            4 /*yield*/,
            (0, whatsapp_service_1.createwhatsAppService)().sendBulkMessages(
              phoneNumbers,
              templateName,
              parameters,
            ),
          ];
        case 11:
          results = _f.sent();
          console.log("Bulk send completed:", results);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              results: {
                totalRecipients: phoneNumbers.length,
                sent: results.sent,
                failed: results.failed,
                errors: results.errors,
              },
              message: "Bulk sending completed: "
                .concat(results.sent, " sent, ")
                .concat(results.failed, " failed"),
            }),
          ];
        case 12:
          error_1 = _f.sent();
          console.error("Error sending bulk WhatsApp messages:", error_1);
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
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
