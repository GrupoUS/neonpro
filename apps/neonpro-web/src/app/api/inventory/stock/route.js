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
exports.GET = GET;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var multi_location_inventory_service_1 = require("@/app/lib/services/multi-location-inventory-service");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, searchParams, filters, inventoryService, stock, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          filters = {
            clinic_id: searchParams.get("clinic_id") || undefined,
            room_id: searchParams.get("room_id") || undefined,
            low_stock: searchParams.get("low_stock") === "true",
            expiring_soon: searchParams.get("expiring_soon") === "true",
            batch_number: searchParams.get("batch_number") || undefined,
          };
          inventoryService = new multi_location_inventory_service_1.MultiLocationInventoryService();
          return [4 /*yield*/, inventoryService.getInventoryStock(filters)];
        case 3:
          stock = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json({ data: stock })];
        case 4:
          error_1 = _a.sent();
          console.error("Error fetching inventory stock:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to fetch inventory stock" },
              { status: 500 },
            ),
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
      session_1,
      body,
      updates,
      inventoryService_1,
      updatedStock,
      updateData,
      inventoryService,
      stock,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session_1 = _a.sent().data.session;
          if (!session_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          if (!Array.isArray(body)) return [3 /*break*/, 5];
          updates = body.map((update) =>
            __assign(__assign({}, update), { last_counted_by: session_1.user.id }),
          );
          inventoryService_1 =
            new multi_location_inventory_service_1.MultiLocationInventoryService();
          return [4 /*yield*/, inventoryService_1.bulkUpdateStock(updates)];
        case 4:
          updatedStock = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json({ data: updatedStock })];
        case 5:
          updateData = __assign(__assign({}, body), { last_counted_by: session_1.user.id });
          inventoryService = new multi_location_inventory_service_1.MultiLocationInventoryService();
          return [4 /*yield*/, inventoryService.updateStock(updateData)];
        case 6:
          stock = _a.sent();
          return [2 /*return*/, server_1.NextResponse.json({ data: stock })];
        case 7:
          error_2 = _a.sent();
          console.error("Error updating inventory stock:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to update inventory stock" },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
