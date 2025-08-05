"use client";
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
exports.useCashRegisters = useCashRegisters;
exports.useCashFlowEntries = useCashFlowEntries;
exports.useCashFlowAnalytics = useCashFlowAnalytics;
// Temporary hooks for cash flow development
// These will be replaced with proper implementation
var react_1 = require("react");
// Mock data for development
var mockRegisters = [
  {
    id: "1",
    clinic_id: "clinic-1",
    register_name: "Caixa Principal",
    register_code: "CP001",
    location: "Recepção",
    responsible_user_id: "user-1",
    current_balance: 1500.5,
    opening_balance: 1000.0,
    expected_balance: 1500.5,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];
var mockEntries = [
  {
    id: "1",
    clinic_id: "clinic-1",
    register_id: "1",
    transaction_type: "receipt",
    category: "service_payment",
    amount: 150.0,
    currency: "BRL",
    description: "Consulta dermatológica",
    payment_method: "pix",
    created_by: "user-1",
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-01-20T10:00:00Z",
    is_reconciled: false,
  },
];
var mockAnalytics = {
  totalIncome: 1500.0,
  totalExpenses: 500.0,
  netCashFlow: 1000.0,
  periodStart: "2025-01-01",
  periodEnd: "2025-01-31",
  byCategory: [{ category: "service_payment", amount: 1500.0, percentage: 100 }],
  byPaymentMethod: [{ method: "pix", amount: 1500.0, count: 10 }],
  byDay: [],
  registers: [{ id: "1", name: "Caixa Principal", balance: 1500.5, transactions: 10 }],
};
function useCashRegisters(clinicId) {
  var _a = (0, react_1.useState)(mockRegisters),
    registers = _a[0],
    setRegisters = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var refetch = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setRegisters(mockRegisters);
          setLoading(false);
        }, 500);
        return [2 /*return*/];
      });
    });
  return { registers: registers, loading: loading, refetch: refetch };
}
function useCashFlowEntries(clinicId, filters) {
  var _a = (0, react_1.useState)(mockEntries),
    entries = _a[0],
    setEntries = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var refetch = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setEntries(mockEntries);
          setLoading(false);
        }, 500);
        return [2 /*return*/];
      });
    });
  return { entries: entries, loading: loading, refetch: refetch };
}
function useCashFlowAnalytics(clinicId, filters) {
  var _a = (0, react_1.useState)(mockAnalytics),
    analytics = _a[0],
    setAnalytics = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var refetch = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 500);
        return [2 /*return*/];
      });
    });
  return { analytics: analytics, loading: loading, refetch: refetch };
}
