"use client";
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
exports.useLGPDDashboard = useLGPDDashboard;
exports.useConsentManagement = useConsentManagement;
exports.useDataSubjectRights = useDataSubjectRights;
exports.useBreachManagement = useBreachManagement;
exports.useAuditTrail = useAuditTrail;
exports.useComplianceAssessment = useComplianceAssessment;
exports.useConsentBanner = useConsentBanner;
var react_1 = require("react");
var auth_helpers_react_1 = require("@supabase/auth-helpers-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var sonner_1 = require("sonner");
// Main LGPD Dashboard Hook
function useLGPDDashboard() {
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var fetchMetrics = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, fetch("/api/lgpd/compliance")];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch LGPD metrics");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setMetrics(data.metrics);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              setError(err_1);
              sonner_1.toast.error("Erro ao carregar métricas LGPD");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  (0, react_1.useEffect)(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  return {
    metrics: metrics,
    isLoading: isLoading,
    error: error,
    refetch: fetchMetrics,
  };
}
// Consent Management Hook
function useConsentManagement() {
  var _a = (0, react_1.useState)([]),
    consents = _a[0],
    setConsents = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var user = (0, auth_helpers_react_1.useUser)();
  var fetchConsents = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_1, response, data, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              params_1 = new URLSearchParams();
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_1.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/consent?".concat(params_1))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch consents");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setConsents(data.consents);
              return [3 /*break*/, 5];
            case 3:
              err_2 = _a.sent();
              setError(err_2);
              sonner_1.toast.error("Erro ao carregar consentimentos");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var updateConsent = (0, react_1.useCallback)(
    (consentData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/consent", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(consentData),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to update consent");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Consentimento atualizado com sucesso");
              // Refresh consents
              return [4 /*yield*/, fetchConsents()];
            case 3:
              // Refresh consents
              _a.sent();
              return [2 /*return*/, data.consent];
            case 4:
              err_3 = _a.sent();
              setError(err_3);
              sonner_1.toast.error("Erro ao atualizar consentimento");
              throw err_3;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchConsents],
  );
  var withdrawConsent = (0, react_1.useCallback)(
    (consentId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, err_4;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/consent", {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ consent_id: consentId }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to withdraw consent");
              }
              sonner_1.toast.success("Consentimento retirado com sucesso");
              // Refresh consents
              return [4 /*yield*/, fetchConsents()];
            case 2:
              // Refresh consents
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              err_4 = _a.sent();
              setError(err_4);
              sonner_1.toast.error("Erro ao retirar consentimento");
              throw err_4;
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [fetchConsents],
  );
  return {
    consents: consents,
    isLoading: isLoading,
    error: error,
    fetchConsents: fetchConsents,
    updateConsent: updateConsent,
    withdrawConsent: withdrawConsent,
  };
}
// Data Subject Rights Hook
function useDataSubjectRights() {
  var _a = (0, react_1.useState)([]),
    requests = _a[0],
    setRequests = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchRequests = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_2, response, data, err_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              params_2 = new URLSearchParams();
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_2.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/data-subject-rights?".concat(params_2))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch data subject requests");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setRequests(data.requests);
              return [3 /*break*/, 5];
            case 3:
              err_5 = _a.sent();
              setError(err_5);
              sonner_1.toast.error("Erro ao carregar solicitações");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createRequest = (0, react_1.useCallback)(
    (requestData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/data-subject-rights", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(requestData),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to create request");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Solicitação criada com sucesso");
              // Refresh requests
              return [4 /*yield*/, fetchRequests()];
            case 3:
              // Refresh requests
              _a.sent();
              return [2 /*return*/, data.request];
            case 4:
              err_6 = _a.sent();
              setError(err_6);
              sonner_1.toast.error("Erro ao criar solicitação");
              throw err_6;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchRequests],
  );
  var updateRequest = (0, react_1.useCallback)(
    (requestId, updateData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_7;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/data-subject-rights", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(__assign({ request_id: requestId }, updateData)),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to update request");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Solicitação atualizada com sucesso");
              // Refresh requests
              return [4 /*yield*/, fetchRequests()];
            case 3:
              // Refresh requests
              _a.sent();
              return [2 /*return*/, data.request];
            case 4:
              err_7 = _a.sent();
              setError(err_7);
              sonner_1.toast.error("Erro ao atualizar solicitação");
              throw err_7;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchRequests],
  );
  return {
    requests: requests,
    isLoading: isLoading,
    error: error,
    fetchRequests: fetchRequests,
    createRequest: createRequest,
    updateRequest: updateRequest,
  };
}
// Breach Management Hook
function useBreachManagement() {
  var _a = (0, react_1.useState)([]),
    breaches = _a[0],
    setBreaches = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchBreaches = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_3, response, data, err_8;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              params_3 = new URLSearchParams();
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_3.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/breach?".concat(params_3))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch breach incidents");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setBreaches(data.breaches);
              return [3 /*break*/, 5];
            case 3:
              err_8 = _a.sent();
              setError(err_8);
              sonner_1.toast.error("Erro ao carregar incidentes");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var reportBreach = (0, react_1.useCallback)(
    (breachData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_9;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/breach", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(breachData),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to report breach");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Incidente reportado com sucesso");
              // Refresh breaches
              return [4 /*yield*/, fetchBreaches()];
            case 3:
              // Refresh breaches
              _a.sent();
              return [2 /*return*/, data.breach];
            case 4:
              err_9 = _a.sent();
              setError(err_9);
              sonner_1.toast.error("Erro ao reportar incidente");
              throw err_9;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchBreaches],
  );
  var updateBreach = (0, react_1.useCallback)(
    (breachId, updateData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_10;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/breach", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(__assign({ breach_id: breachId }, updateData)),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to update breach");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Incidente atualizado com sucesso");
              // Refresh breaches
              return [4 /*yield*/, fetchBreaches()];
            case 3:
              // Refresh breaches
              _a.sent();
              return [2 /*return*/, data.breach];
            case 4:
              err_10 = _a.sent();
              setError(err_10);
              sonner_1.toast.error("Erro ao atualizar incidente");
              throw err_10;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchBreaches],
  );
  return {
    breaches: breaches,
    isLoading: isLoading,
    error: error,
    fetchBreaches: fetchBreaches,
    reportBreach: reportBreach,
    updateBreach: updateBreach,
  };
}
// Audit Trail Hook
function useAuditTrail() {
  var _a = (0, react_1.useState)([]),
    events = _a[0],
    setEvents = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchEvents = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_4, response, data, err_11;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              params_4 = new URLSearchParams();
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_4.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/audit?".concat(params_4))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch audit events");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setEvents(data.events);
              return [3 /*break*/, 5];
            case 3:
              err_11 = _a.sent();
              setError(err_11);
              sonner_1.toast.error("Erro ao carregar eventos de auditoria");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var exportEvents = (0, react_1.useCallback)(
    (format, filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_5, response, blob, url, a, err_12;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              params_5 = new URLSearchParams();
              params_5.append("export", format);
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_5.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/audit?".concat(params_5))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to export audit events");
              }
              return [4 /*yield*/, response.blob()];
            case 2:
              blob = _a.sent();
              url = window.URL.createObjectURL(blob);
              a = document.createElement("a");
              a.href = url;
              a.download = "audit-trail-"
                .concat(new Date().toISOString().split("T")[0], ".")
                .concat(format);
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              sonner_1.toast.success("Exportação concluída com sucesso");
              return [3 /*break*/, 4];
            case 3:
              err_12 = _a.sent();
              setError(err_12);
              sonner_1.toast.error("Erro ao exportar eventos");
              throw err_12;
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  return {
    events: events,
    isLoading: isLoading,
    error: error,
    fetchEvents: fetchEvents,
    exportEvents: exportEvents,
  };
}
// Compliance Assessment Hook
function useComplianceAssessment() {
  var _a = (0, react_1.useState)([]),
    assessments = _a[0],
    setAssessments = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchAssessments = (0, react_1.useCallback)(
    (filters) =>
      __awaiter(this, void 0, void 0, function () {
        var params_6, response, data, err_13;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              params_6 = new URLSearchParams();
              if (filters) {
                Object.entries(filters).forEach((_a) => {
                  var key = _a[0],
                    value = _a[1];
                  if (value !== undefined) {
                    params_6.append(key, value.toString());
                  }
                });
              }
              return [4 /*yield*/, fetch("/api/lgpd/compliance?".concat(params_6))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch assessments");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setAssessments(data.assessments || []);
              return [3 /*break*/, 5];
            case 3:
              err_13 = _a.sent();
              setError(err_13);
              sonner_1.toast.error("Erro ao carregar avaliações");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var createAssessment = (0, react_1.useCallback)(
    (assessmentData) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_14;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/compliance", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(assessmentData),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to create assessment");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Avaliação criada com sucesso");
              // Refresh assessments
              return [4 /*yield*/, fetchAssessments()];
            case 3:
              // Refresh assessments
              _a.sent();
              return [2 /*return*/, data.assessment];
            case 4:
              err_14 = _a.sent();
              setError(err_14);
              sonner_1.toast.error("Erro ao criar avaliação");
              throw err_14;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchAssessments],
  );
  var runAutomatedAssessment = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_15;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/compliance", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to run automated assessment");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              sonner_1.toast.success("Avaliação automatizada executada com sucesso");
              // Refresh assessments
              return [4 /*yield*/, fetchAssessments()];
            case 3:
              // Refresh assessments
              _a.sent();
              return [2 /*return*/, data.assessment];
            case 4:
              err_15 = _a.sent();
              setError(err_15);
              sonner_1.toast.error("Erro ao executar avaliação automatizada");
              throw err_15;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [fetchAssessments],
  );
  return {
    assessments: assessments,
    isLoading: isLoading,
    error: error,
    fetchAssessments: fetchAssessments,
    createAssessment: createAssessment,
    runAutomatedAssessment: runAutomatedAssessment,
  };
}
// Consent Banner Hook (for public use)
function useConsentBanner() {
  var _a = (0, react_1.useState)([]),
    purposes = _a[0],
    setPurposes = _a[1];
  var _b = (0, react_1.useState)([]),
    userConsents = _b[0],
    setUserConsents = _b[1];
  var _c = (0, react_1.useState)(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var user = (0, auth_helpers_react_1.useUser)();
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var fetchConsentPurposes = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, data, error_1, err_16;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setIsLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("lgpd_consent_purposes")
                  .select("*")
                  .eq("active", true)
                  .order("display_order"),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (error_1 = _a.error);
              if (error_1) throw error_1;
              setPurposes(data || []);
              return [3 /*break*/, 4];
            case 2:
              err_16 = _b.sent();
              setError(err_16);
              sonner_1.toast.error("Erro ao carregar finalidades de consentimento");
              return [3 /*break*/, 4];
            case 3:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  var fetchUserConsents = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, err_17;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!(user === null || user === void 0 ? void 0 : user.id)) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              return [4 /*yield*/, fetch("/api/lgpd/consent?user_id=".concat(user.id))];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch user consents");
              }
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              setUserConsents(data.consents || []);
              return [3 /*break*/, 5];
            case 4:
              err_17 = _a.sent();
              setError(err_17);
              console.error("Error fetching user consents:", err_17);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [user === null || user === void 0 ? void 0 : user.id],
  );
  var updateUserConsent = (0, react_1.useCallback)(
    (purposeId, granted) =>
      __awaiter(this, void 0, void 0, function () {
        var response, err_18;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/lgpd/consent", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    purpose_id: purposeId,
                    granted: granted,
                    ip_address: window.location.hostname,
                    user_agent: navigator.userAgent,
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to update consent");
              }
              // Refresh user consents
              return [4 /*yield*/, fetchUserConsents()];
            case 2:
              // Refresh user consents
              _a.sent();
              sonner_1.toast.success(
                granted ? "Consentimento concedido" : "Consentimento retirado",
              );
              return [3 /*break*/, 4];
            case 3:
              err_18 = _a.sent();
              setError(err_18);
              sonner_1.toast.error("Erro ao atualizar consentimento");
              throw err_18;
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [fetchUserConsents],
  );
  (0, react_1.useEffect)(() => {
    fetchConsentPurposes();
  }, []);
  (0, react_1.useEffect)(() => {
    if (user === null || user === void 0 ? void 0 : user.id) {
      fetchUserConsents();
    }
  }, [user === null || user === void 0 ? void 0 : user.id, fetchUserConsents]);
  return {
    purposes: purposes,
    userConsents: userConsents,
    isLoading: isLoading,
    error: error,
    updateUserConsent: updateUserConsent,
    refetch: () => {
      fetchConsentPurposes();
      fetchUserConsents();
    },
  };
}
