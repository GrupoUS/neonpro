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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBudgetApproval = useBudgetApproval;
var react_1 = require("react");
function useBudgetApproval() {
  var _a = (0, react_1.useState)([]),
    budgets = _a[0],
    setBudgets = _a[1];
  var _b = (0, react_1.useState)(null),
    currentBudget = _b[0],
    setCurrentBudget = _b[1];
  var _c = (0, react_1.useState)(false),
    budgetLoading = _c[0],
    setBudgetLoading = _c[1];
  var _d = (0, react_1.useState)([]),
    approvals = _d[0],
    setApprovals = _d[1];
  var _e = (0, react_1.useState)(false),
    approvalLoading = _e[0],
    setApprovalLoading = _e[1];
  var _f = (0, react_1.useState)([]),
    recommendations = _f[0],
    setRecommendations = _f[1];
  var _g = (0, react_1.useState)([]),
    forecasts = _g[0],
    setForecasts = _g[1];
  var _h = (0, react_1.useState)(null),
    validationResult = _h[0],
    setValidationResult = _h[1];
  var pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending" || !("status" in approval),
  );
  var fetchBudgets = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setBudgetLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, 6, 7]);
            return [4 /*yield*/, fetch("/api/inventory/budget")];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setBudgets(data.budgets || []);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error fetching budgets:", error_1);
            return [3 /*break*/, 7];
          case 6:
            setBudgetLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var fetchApprovals = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setApprovalLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, 6, 7]);
            return [4 /*yield*/, fetch("/api/inventory/approvals")];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setApprovals(data.approvals || []);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_2 = _a.sent();
            console.error("Error fetching approvals:", error_2);
            return [3 /*break*/, 7];
          case 6:
            setApprovalLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var createBudget = (budgetData) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/budget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(budgetData),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchBudgets()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error creating budget:", error_3);
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var updateBudget = (budgetId, updates) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/budget/".concat(budgetId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchBudgets()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Error updating budget:", error_4);
            throw error_4;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var deleteBudget = (budgetId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/budget/".concat(budgetId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchBudgets()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error deleting budget:", error_5);
            throw error_5;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var createApproval = (approvalData) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(approvalData),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchApprovals()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_6 = _a.sent();
            console.error("Error creating approval:", error_6);
            throw error_6;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var processApproval = (approvalId, action, comments) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/approvals/".concat(approvalId, "/").concat(action), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comments: comments }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchApprovals()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Error processing approval:", error_7);
            throw error_7;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var generateOptimizationRecommendations = (budgetIds) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/budget/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ budget_ids: budgetIds }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setRecommendations(data.recommendations || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error("Error generating recommendations:", error_8);
            throw error_8;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var generateForecast = (budgetId_1) => {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(
      this,
      __spreadArray([budgetId_1], args_1, true),
      void 0,
      function (budgetId, periods) {
        var response, data, error_9;
        if (periods === void 0) {
          periods = 12;
        }
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch(
                  "/api/inventory/budget/optimize?budgetId="
                    .concat(budgetId, "&period=")
                    .concat(periods),
                ),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setForecasts(data.forecasts || []);
              _a.label = 3;
            case 3:
              return [3 /*break*/, 5];
            case 4:
              error_9 = _a.sent();
              console.error("Error generating forecast:", error_9);
              throw error_9;
            case 5:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  var validateBudget = (budgetId) =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // This would need a separate validation endpoint
          // For now, we'll simulate the validation
          setValidationResult({
            is_valid: true,
            errors: [],
            warnings: [],
            recommendations: [],
          });
        } catch (error) {
          console.error("Error validating budget:", error);
          throw error;
        }
        return [2 /*return*/];
      });
    });
  (0, react_1.useEffect)(() => {
    fetchBudgets();
    fetchApprovals();
  }, []);
  return {
    // Budget Management
    budgets: budgets,
    currentBudget: currentBudget,
    budgetLoading: budgetLoading,
    // Approval Management
    approvals: approvals,
    pendingApprovals: pendingApprovals,
    approvalLoading: approvalLoading,
    // Optimization & Forecasting
    recommendations: recommendations,
    forecasts: forecasts,
    validationResult: validationResult,
    // Actions
    createBudget: createBudget,
    updateBudget: updateBudget,
    deleteBudget: deleteBudget,
    // Approval Actions
    createApproval: createApproval,
    processApproval: processApproval,
    // Analytics
    generateOptimizationRecommendations: generateOptimizationRecommendations,
    generateForecast: generateForecast,
    validateBudget: validateBudget,
    // Refresh
    refreshBudgets: fetchBudgets,
    refreshApprovals: fetchApprovals,
  };
}
