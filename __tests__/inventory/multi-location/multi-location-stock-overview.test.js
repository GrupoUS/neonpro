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
require("@testing-library/jest-dom");
var react_1 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var multi_location_inventory_service_1 = require("@/lib/services/multi-location-inventory-service");
var multi_location_stock_overview_1 = require("@/components/inventory/multi-location/multi-location-stock-overview");
// Mock the service
globals_1.jest.mock("@/lib/services/multi-location-inventory-service");
var mockService = multi_location_inventory_service_1.multiLocationInventoryService;
var mockStockData = [
  {
    item_id: "1",
    item_name: "Botox 100u",
    item_sku: "BTX100",
    clinic_id: "clinic-1",
    clinic_name: "Clínica Centro",
    room_id: "room-1",
    room_name: "Sala 1",
    current_quantity: 50,
    minimum_quantity: 10,
    expiry_date: "2025-06-01",
    batch_number: "BTX001",
    cost_per_unit: 250.0,
    total_value: 12500.0,
    last_updated: "2024-01-20T10:00:00Z",
  },
  {
    item_id: "2",
    item_name: "Preenchimento 1ml",
    item_sku: "FIL1ML",
    clinic_id: "clinic-2",
    clinic_name: "Clínica Norte",
    room_id: "room-2",
    room_name: "Sala 2",
    current_quantity: 5,
    minimum_quantity: 10,
    expiry_date: "2024-03-01",
    batch_number: "FIL001",
    cost_per_unit: 180.0,
    total_value: 900.0,
    last_updated: "2024-01-20T11:00:00Z",
  },
];
var mockLocationSummary = [
  {
    clinic_id: "clinic-1",
    clinic_name: "Clínica Centro",
    total_items: 25,
    total_value: 45000.0,
    low_stock_count: 2,
    expiring_count: 1,
  },
  {
    clinic_id: "clinic-2",
    clinic_name: "Clínica Norte",
    total_items: 18,
    total_value: 32000.0,
    low_stock_count: 3,
    expiring_count: 2,
  },
];
function TestWrapper(_a) {
  var children = _a.children;
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>
  );
}
(0, globals_1.describe)("MultiLocationStockOverview", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
    mockService.getInventoryStock.mockResolvedValue(mockStockData);
    mockService.getLocationStockSummary.mockResolvedValue(mockLocationSummary);
    mockService.getLowStockAlerts.mockResolvedValue([mockStockData[1]]);
    mockService.getExpiringItems.mockResolvedValue([mockStockData[1]]);
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.it)("renders loading state initially", () => {
    (0, react_1.render)(
      <TestWrapper>
        <multi_location_stock_overview_1.MultiLocationStockOverview />
      </TestWrapper>,
    );
    (0, globals_1.expect)(react_1.screen.getByText("Carregando...")).toBeInTheDocument();
  });
  (0, globals_1.it)("renders stock overview with data", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <multi_location_stock_overview_1.MultiLocationStockOverview />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(
                  react_1.screen.getByText("Visão Geral do Estoque"),
                ).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(react_1.screen.getByText("Botox 100u")).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText("BTX100")).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText("Clínica Centro")).toBeInTheDocument();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("shows low stock and expiring alerts", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <multi_location_stock_overview_1.MultiLocationStockOverview />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(
                  react_1.screen.getByText("Estoque Baixo"),
                ).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(react_1.screen.getByText("Vencendo")).toBeInTheDocument();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("filters by search term", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var searchInput;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <multi_location_stock_overview_1.MultiLocationStockOverview />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(react_1.screen.getByText("Botox 100u")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            searchInput = react_1.screen.getByPlaceholderText(
              "Buscar por nome, SKU ou localização...",
            );
            react_1.fireEvent.change(searchInput, { target: { value: "Botox" } });
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(mockService.getInventoryStock).toHaveBeenCalledWith(
                  globals_1.expect.objectContaining({
                    search: "Botox",
                  }),
                );
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("shows location filter when showLocationFilter is true", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <multi_location_stock_overview_1.MultiLocationStockOverview
                  showLocationFilter={true}
                />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(react_1.screen.getByText("Localização")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(
              react_1.screen.getByText("Todas Localizações"),
            ).toBeInTheDocument();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("does not show location filter when showLocationFilter is false", () => {
    (0, react_1.render)(
      <TestWrapper>
        <multi_location_stock_overview_1.MultiLocationStockOverview showLocationFilter={false} />
      </TestWrapper>,
    );
    (0, globals_1.expect)(react_1.screen.queryByText("Localização")).not.toBeInTheDocument();
  });
  (0, globals_1.it)("handles category filter changes", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var categorySelect, medicationOption;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <multi_location_stock_overview_1.MultiLocationStockOverview />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(react_1.screen.getByText("Categoria")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            categorySelect = react_1.screen.getByDisplayValue("Todas Categorias");
            react_1.fireEvent.click(categorySelect);
            medicationOption = react_1.screen.getByText("Medicamentos");
            react_1.fireEvent.click(medicationOption);
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(mockService.getInventoryStock).toHaveBeenCalledWith(
                  globals_1.expect.objectContaining({
                    category: "medication",
                  }),
                );
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
});
