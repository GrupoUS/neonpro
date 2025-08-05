"use strict";
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
exports.GET = GET;
exports.PUT = PUT;
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schema for financial settings
var UpdateFinancialSettingsSchema = zod_1.z.object({
  company_name: zod_1.z.string().min(1, "Nome da empresa é obrigatório").optional(),
  address: zod_1.z.string().optional(),
  phone: zod_1.z.string().optional(),
  email: zod_1.z.string().email("Email inválido").optional(),
  tax_rate: zod_1.z.number().min(0).max(100, "Taxa não pode exceder 100%").optional(),
  default_payment_terms: zod_1.z.string().optional(),
  invoice_prefix: zod_1.z.string().min(1, "Prefixo da fatura é obrigatório").optional(),
  next_invoice_number: zod_1.z
    .number()
    .int()
    .min(1, "Número da próxima fatura deve ser positivo")
    .optional(),
  payment_prefix: zod_1.z.string().min(1, "Prefixo do pagamento é obrigatório").optional(),
  next_payment_number: zod_1.z
    .number()
    .int()
    .min(1, "Número do próximo pagamento deve ser positivo")
    .optional(),
  default_due_days: zod_1.z
    .number()
    .int()
    .min(1, "Dias de vencimento padrão deve ser positivo")
    .optional(),
  late_fee_percentage: zod_1.z
    .number()
    .min(0)
    .max(100, "Taxa de atraso não pode exceder 100%")
    .optional(),
  discount_limit_percentage: zod_1.z
    .number()
    .min(0)
    .max(100, "Limite de desconto não pode exceder 100%")
    .optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, _a, settings, error, defaultSettings, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("financial_settings").select("*").eq("clinic_id", user.id).single(),
          ];
        case 3:
          (_a = _b.sent()), (settings = _a.data), (error = _a.error);
          if (error && error.code === "PGRST116") {
            defaultSettings = {
              clinic_id: user.id,
              company_name: "",
              address: "",
              phone: "",
              email: user.email || "",
              tax_rate: 0,
              default_payment_terms: "30 dias",
              invoice_prefix: "INV",
              next_invoice_number: 1,
              payment_prefix: "PAY",
              next_payment_number: 1,
              default_due_days: 30,
              late_fee_percentage: 0,
              discount_limit_percentage: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            return [2 /*return*/, server_2.NextResponse.json({ settings: defaultSettings })];
          }
          if (error) {
            console.error("Error fetching financial settings:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch financial settings" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ settings: settings })];
        case 4:
          error_1 = _b.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      body,
      validatedData,
      _a,
      existingSettings,
      checkError,
      settings,
      error,
      _b,
      data,
      updateError,
      _c,
      data,
      insertError,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 9, , 10]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _d.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          validatedData = UpdateFinancialSettingsSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.from("financial_settings").select("id").eq("clinic_id", user.id).single(),
          ];
        case 4:
          (_a = _d.sent()), (existingSettings = _a.data), (checkError = _a.error);
          if (checkError && checkError.code !== "PGRST116") {
            console.error("Error checking financial settings:", checkError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to check existing settings" },
                { status: 500 },
              ),
            ];
          }
          settings = void 0;
          error = void 0;
          if (!existingSettings) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("financial_settings")
              .update(
                __assign(__assign({}, validatedData), { updated_at: new Date().toISOString() }),
              )
              .eq("clinic_id", user.id)
              .select()
              .single(),
          ];
        case 5:
          (_b = _d.sent()), (data = _b.data), (updateError = _b.error);
          settings = data;
          error = updateError;
          return [3 /*break*/, 8];
        case 6:
          return [
            4 /*yield*/,
            supabase
              .from("financial_settings")
              .insert(
                __assign(
                  __assign(
                    {
                      clinic_id: user.id,
                      company_name: "",
                      address: "",
                      phone: "",
                      email: user.email || "",
                      tax_rate: 0,
                      default_payment_terms: "30 dias",
                      invoice_prefix: "INV",
                      next_invoice_number: 1,
                      payment_prefix: "PAY",
                      next_payment_number: 1,
                      default_due_days: 30,
                      late_fee_percentage: 0,
                      discount_limit_percentage: 10,
                    },
                    validatedData,
                  ),
                  { created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                ),
              )
              .select()
              .single(),
          ];
        case 7:
          (_c = _d.sent()), (data = _c.data), (insertError = _c.error);
          settings = data;
          error = insertError;
          _d.label = 8;
        case 8:
          if (error) {
            console.error("Error updating financial settings:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to update financial settings" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ settings: settings })];
        case 9:
          error_2 = _d.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Validation failed", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("API Error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// Get next invoice/payment numbers
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      body,
      action,
      _a,
      settings,
      settingsError,
      updateData,
      _b,
      updatedSettings,
      updateError,
      error_3;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          action = body.action;
          if (!["next_invoice_number", "next_payment_number"].includes(action)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("financial_settings").select("*").eq("clinic_id", user.id).single(),
          ];
        case 4:
          (_a = _c.sent()), (settings = _a.data), (settingsError = _a.error);
          if (settingsError) {
            console.error("Error fetching financial settings:", settingsError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch financial settings" },
                { status: 500 },
              ),
            ];
          }
          updateData = {};
          if (action === "next_invoice_number") {
            updateData.next_invoice_number = settings.next_invoice_number + 1;
          } else {
            updateData.next_payment_number = settings.next_payment_number + 1;
          }
          updateData.updated_at = new Date().toISOString();
          return [
            4 /*yield*/,
            supabase
              .from("financial_settings")
              .update(updateData)
              .eq("clinic_id", user.id)
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (updatedSettings = _b.data), (updateError = _b.error);
          if (updateError) {
            console.error("Error updating financial settings:", updateError);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to update settings" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              settings: updatedSettings,
              message: "".concat(action, " incremented successfully"),
            }),
          ];
        case 6:
          error_3 = _c.sent();
          console.error("API Error:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
