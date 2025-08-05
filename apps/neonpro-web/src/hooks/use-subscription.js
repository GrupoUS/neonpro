"use client";
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
exports.useSubscription = useSubscription;
exports.SubscriptionProvider = SubscriptionProvider;
exports.useSubscriptionContext = useSubscriptionContext;
var react_1 = require("react");
function useSubscription() {
  var _a = (0, react_1.useState)(null),
    subscription = _a[0],
    setSubscription = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  (0, react_1.useEffect)(function () {
    function fetchSubscription() {
      return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, 6, 7]);
              return [4 /*yield*/, fetch("/api/subscription/current")];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setSubscription(data);
              return [3 /*break*/, 4];
            case 3:
              if (response.status === 401) {
                setError("Não autorizado");
              } else {
                setError("Erro ao carregar assinatura");
              }
              _a.label = 4;
            case 4:
              return [3 /*break*/, 7];
            case 5:
              error_1 = _a.sent();
              console.error("Error fetching subscription:", error_1);
              setError("Erro de conexão");
              return [3 /*break*/, 7];
            case 6:
              setLoading(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    }
    fetchSubscription();
  }, []);
  var hasFeature = function (feature) {
    if (!subscription || !subscription.features) return false;
    return subscription.features.includes(feature);
  };
  var canAddPatients = function (currentPatientCount) {
    if (!subscription || !subscription.max_patients) return true; // Unlimited
    return currentPatientCount < subscription.max_patients;
  };
  var canAddClinics = function (currentClinicsCount) {
    if (!subscription || !subscription.max_clinics) return true; // Unlimited
    return currentClinicsCount < subscription.max_clinics;
  };
  var isActive = function () {
    if (!subscription) return false;
    var now = new Date();
    var periodEnd = new Date(subscription.current_period_end);
    return subscription.status === "active" && periodEnd > now;
  };
  var daysUntilRenewal = function () {
    if (!subscription) return 0;
    var renewalDate = new Date(subscription.current_period_end);
    var today = new Date();
    var diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  var isExpiringSoon = function (days) {
    if (days === void 0) {
      days = 7;
    }
    return daysUntilRenewal() <= days && daysUntilRenewal() > 0;
  };
  return {
    subscription: subscription,
    loading: loading,
    error: error,
    hasFeature: hasFeature,
    canAddPatients: canAddPatients,
    canAddClinics: canAddClinics,
    isActive: isActive,
    daysUntilRenewal: daysUntilRenewal,
    isExpiringSoon: isExpiringSoon,
  };
}
var SubscriptionContext = (0, react_1.createContext)(undefined);
function SubscriptionProvider(_a) {
  var _this = this;
  var children = _a.children,
    user = _a.user;
  var _b = (0, react_1.useState)(null),
    subscription = _b[0],
    setSubscription = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var refreshSubscription = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!user) {
              setSubscription(null);
              setLoading(false);
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            setLoading(true);
            setError(null);
            return [4 /*yield*/, fetch("/api/subscription/current")];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setSubscription(data);
            return [3 /*break*/, 5];
          case 4:
            if (response.status === 401) {
              setError("Não autorizado");
            } else {
              setError("Erro ao carregar assinatura");
            }
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_2 = _a.sent();
            console.error("Error fetching subscription:", error_2);
            setError("Erro de conexão");
            return [3 /*break*/, 8];
          case 7:
            setLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      refreshSubscription();
    },
    [user === null || user === void 0 ? void 0 : user.id],
  );
  return (
    <SubscriptionContext.Provider
      value={{
        subscription: subscription,
        loading: loading,
        error: error,
        refreshSubscription: refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
function useSubscriptionContext() {
  var context = (0, react_1.useContext)(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
  }
  return context;
}
