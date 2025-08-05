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
var globals_1 = require("@jest/globals");
var multi_location_inventory_service_1 = require("@/lib/services/multi-location-inventory-service");
// Mock Supabase client
var mockSupabase = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        order: globals_1.jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: globals_1.jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: globals_1.jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    delete: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
};
globals_1.jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => mockSupabase,
}));
(0, globals_1.describe)("Multi-Location Inventory Service", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("getInventoryStock", () => {
    (0, globals_1.it)("should fetch inventory stock without filters", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockData = [
                {
                  item_id: "1",
                  item_name: "Test Item",
                  current_quantity: 50,
                  clinic_name: "Test Clinic",
                },
              ];
              mockSupabase.from().select().order.mockResolvedValue({
                data: mockData,
                error: null,
              });
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.getInventoryStock(),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toEqual(mockData);
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("inventory_stock");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should apply clinic_id filter when provided", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = { clinic_id: "clinic-1" };
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.getInventoryStock(
                  filters,
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockSupabase.from().select().eq).toHaveBeenCalledWith(
                "clinic_id",
                "clinic-1",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle service errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase
                .from()
                .select()
                .order.mockResolvedValue({
                  data: null,
                  error: { message: "Database error" },
                });
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  multi_location_inventory_service_1.multiLocationInventoryService.getInventoryStock(),
                ).rejects.toThrow("Database error"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("createStockTransfer", () => {
    (0, globals_1.it)("should create a new stock transfer", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var transferData, mockResponse, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              transferData = {
                from_clinic_id: "clinic-1",
                to_clinic_id: "clinic-2",
                item_id: "item-1",
                quantity: 10,
                reason: "Restock",
                notes: "Emergency transfer",
              };
              mockResponse = {
                data: [__assign({ id: "transfer-1" }, transferData)],
                error: null,
              };
              mockSupabase.from().insert.mockResolvedValue(mockResponse);
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.createStockTransfer(
                  transferData,
                ),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toEqual(mockResponse.data[0]);
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("stock_transfers");
              (0, globals_1.expect)(mockSupabase.from().insert).toHaveBeenCalledWith([
                transferData,
              ]);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("getLocationStockSummary", () => {
    (0, globals_1.it)("should fetch location stock summary", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSummary, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSummary = [
                {
                  clinic_id: "clinic-1",
                  clinic_name: "Test Clinic",
                  total_items: 100,
                  total_value: 50000,
                  low_stock_count: 5,
                  expiring_count: 2,
                },
              ];
              mockSupabase.from().select().order.mockResolvedValue({
                data: mockSummary,
                error: null,
              });
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.getLocationStockSummary(),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toEqual(mockSummary);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("getLowStockAlerts", () => {
    (0, globals_1.it)("should fetch low stock alerts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAlerts, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAlerts = [
                {
                  item_id: "item-1",
                  item_name: "Low Stock Item",
                  current_quantity: 2,
                  minimum_quantity: 10,
                },
              ];
              mockSupabase.from().select().order.mockResolvedValue({
                data: mockAlerts,
                error: null,
              });
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.getLowStockAlerts(),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toEqual(mockAlerts);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("updateStock", () => {
    (0, globals_1.it)("should update stock quantity", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var updateData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              updateData = {
                item_id: "item-1",
                clinic_id: "clinic-1",
                quantity_change: 10,
                transaction_type: "adjustment",
                reason: "Manual adjustment",
              };
              mockSupabase
                .from()
                .update()
                .eq.mockResolvedValue({
                  data: [{ current_quantity: 60 }],
                  error: null,
                });
              return [
                4 /*yield*/,
                multi_location_inventory_service_1.multiLocationInventoryService.updateStock(
                  updateData,
                ),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result).toEqual({ current_quantity: 60 });
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("inventory_stock");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
