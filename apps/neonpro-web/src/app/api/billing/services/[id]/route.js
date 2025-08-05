"use strict";
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
exports.DELETE = DELETE;
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var UpdateServiceSchema = zod_1.z.object({
  name: zod_1.z.string().min(1, "Nome é obrigatório").optional(),
  description: zod_1.z.string().optional(),
  category: zod_1.z.string().optional(),
  service_type: zod_1.z.enum(["procedure", "consultation", "package"]).optional(),
  base_price: zod_1.z.number().min(0, "Preço deve ser positivo").optional(),
  duration_minutes: zod_1.z.number().int().min(0).optional(),
  is_active: zod_1.z.boolean().optional(),
  requires_appointment: zod_1.z.boolean().optional(),
});
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var resolvedParams, supabase, user, _c, service, error, error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, params];
        case 1:
          resolvedParams = _d.sent();
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          user = _d.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("services").select("*").eq("id", resolvedParams.id).single(),
          ];
        case 4:
          (_c = _d.sent()), (service = _c.data), (error = _c.error);
          if (error || !service) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Service not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ service: service })];
        case 5:
          error_1 = _d.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var resolvedParams, supabase, user, body, validatedData, _c, service, error, error_2;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [4 /*yield*/, params];
        case 1:
          resolvedParams = _d.sent();
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          user = _d.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _d.sent();
          validatedData = UpdateServiceSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("services")
              .update(validatedData)
              .eq("id", resolvedParams.id)
              .select()
              .single(),
          ];
        case 5:
          (_c = _d.sent()), (service = _c.data), (error = _c.error);
          if (error) {
            console.error("Error updating service:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to update service" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ service: service })];
        case 6:
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
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var resolvedParams,
      supabase,
      user,
      _c,
      invoices,
      invoiceError,
      _d,
      service,
      error_4,
      error,
      error_3;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 8, , 9]);
          return [4 /*yield*/, params];
        case 1:
          resolvedParams = _e.sent();
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          user = _e.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("invoice_items")
              .select("id")
              .eq("service_id", resolvedParams.id)
              .limit(1),
          ];
        case 4:
          (_c = _e.sent()), (invoices = _c.data), (invoiceError = _c.error);
          if (invoiceError) {
            console.error("Error checking service relations:", invoiceError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to check service relations" },
                { status: 500 },
              ),
            ];
          }
          if (!(invoices && invoices.length > 0)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("services")
              .update({ is_active: false })
              .eq("id", resolvedParams.id)
              .select()
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (service = _d.data), (error_4 = _d.error);
          if (error_4) {
            console.error("Error deactivating service:", error_4);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to deactivate service" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              service: service,
              message: "Service deactivated due to existing invoices",
            }),
          ];
        case 6:
          return [4 /*yield*/, supabase.from("services").delete().eq("id", resolvedParams.id)];
        case 7:
          error = _e.sent().error;
          if (error) {
            console.error("Error deleting service:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to delete service" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ message: "Service deleted successfully" }),
          ];
        case 8:
          error_3 = _e.sent();
          console.error("API Error:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
