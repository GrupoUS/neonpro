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
exports.useLgpdConsent = useLgpdConsent;
var react_1 = require("react");
var sonner_1 = require("sonner");
function useLgpdConsent() {
  var _a = (0, react_1.useState)(null),
    consentData = _a[0],
    setConsentData = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  // Record initial consent
  var recordConsent = (0, react_1.useCallback)(
    (consent, patientId) =>
      __awaiter(this, void 0, void 0, function () {
        var consentWithTimestamp, response, result, err_1, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              consentWithTimestamp = __assign(__assign({}, consent), {
                consentDate: new Date().toISOString(),
                consentVersion: "1.0",
              });
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/consent"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(consentWithTimestamp),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao registrar consentimento");
              }
              return [4 /*yield*/, response.json()];
            case 3:
              result = _a.sent();
              setConsentData(result.consent);
              // Log consent action for audit
              return [4 /*yield*/, logDataAccess(patientId, Object.keys(consent), "consent_given")];
            case 4:
              // Log consent action for audit
              _a.sent();
              sonner_1.toast.success("Consentimento registrado com sucesso");
              return [2 /*return*/, true];
            case 5:
              err_1 = _a.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Erro desconhecido";
              setError(errorMessage);
              sonner_1.toast.error("Erro ao registrar consentimento: ".concat(errorMessage));
              return [2 /*return*/, false];
            case 6:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Revoke specific consent types
  var revokeConsent = (0, react_1.useCallback)(
    (patientId, consentTypes) =>
      __awaiter(this, void 0, void 0, function () {
        var response, err_2, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/consent"), {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ consentTypes: consentTypes }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao revogar consentimento");
              }
              // Log revocation for audit
              return [4 /*yield*/, logDataAccess(patientId, consentTypes, "consent_revoked")];
            case 3:
              // Log revocation for audit
              _a.sent();
              sonner_1.toast.success("Consentimento revogado com sucesso");
              return [2 /*return*/, true];
            case 4:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Erro desconhecido";
              setError(errorMessage);
              sonner_1.toast.error("Erro ao revogar consentimento: ".concat(errorMessage));
              return [2 /*return*/, false];
            case 5:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Update existing consent
  var updateConsent = (0, react_1.useCallback)(
    (patientId, updates) =>
      __awaiter(this, void 0, void 0, function () {
        var response, result, err_3, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/consent"), {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(updates),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao atualizar consentimento");
              }
              return [4 /*yield*/, response.json()];
            case 3:
              result = _a.sent();
              setConsentData(result.consent);
              // Log update for audit
              return [4 /*yield*/, logDataModification(patientId, Object.keys(updates), "update")];
            case 4:
              // Log update for audit
              _a.sent();
              sonner_1.toast.success("Consentimento atualizado com sucesso");
              return [2 /*return*/, true];
            case 5:
              err_3 = _a.sent();
              errorMessage = err_3 instanceof Error ? err_3.message : "Erro desconhecido";
              setError(errorMessage);
              sonner_1.toast.error("Erro ao atualizar consentimento: ".concat(errorMessage));
              return [2 /*return*/, false];
            case 6:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Log data access for audit trail
  var logDataAccess = (0, react_1.useCallback)(
    (patientId, dataFields, action) =>
      __awaiter(this, void 0, void 0, function () {
        var auditEntry, err_4;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              auditEntry = {
                patientId: patientId,
                action: action,
                dataFields: dataFields,
                legalBasis: "Consentimento do titular (Art. 7°, I, LGPD)",
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              };
              return [
                4 /*yield*/,
                fetch("/api/lgpd/audit", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(auditEntry),
                }),
              ];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              err_4 = _a.sent();
              console.error("Erro ao registrar auditoria de acesso:", err_4);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Log data modification for audit trail
  var logDataModification = (0, react_1.useCallback)(
    (patientId, dataFields, action) =>
      __awaiter(this, void 0, void 0, function () {
        var auditEntry, err_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              auditEntry = {
                patientId: patientId,
                action: action,
                dataFields: dataFields,
                legalBasis: "Legítimo interesse (Art. 7°, IX, LGPD)",
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
              };
              return [
                4 /*yield*/,
                fetch("/api/lgpd/audit", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(auditEntry),
                }),
              ];
            case 1:
              _a.sent();
              return [3 /*break*/, 3];
            case 2:
              err_5 = _a.sent();
              console.error("Erro ao registrar auditoria de modificação:", err_5);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Check if consent is valid for specific data types
  var checkConsentValidity = (0, react_1.useCallback)(
    (patientId, dataTypes) =>
      __awaiter(this, void 0, void 0, function () {
        var response, result, err_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/consent/check"), {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ dataTypes: dataTypes }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                return [2 /*return*/, false];
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _a.sent();
              return [2 /*return*/, result.isValid];
            case 3:
              err_6 = _a.sent();
              console.error("Erro ao verificar validade do consentimento:", err_6);
              return [2 /*return*/, false];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Get consent history for patient
  var getConsentHistory = (0, react_1.useCallback)(
    (patientId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, result, err_7;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/consent/history")),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao buscar histórico de consentimento");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _a.sent();
              return [2 /*return*/, result.history];
            case 3:
              err_7 = _a.sent();
              console.error("Erro ao buscar histórico:", err_7);
              return [2 /*return*/, []];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // Export all patient data (LGPD portability right)
  var exportPatientData = (0, react_1.useCallback)(
    (patientId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, result, err_8, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/export"), {
                  method: "GET",
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao exportar dados do paciente");
              }
              return [
                4 /*yield*/,
                response.json(),
                // Log data export for audit
              ];
            case 3:
              result = _a.sent();
              // Log data export for audit
              return [4 /*yield*/, logDataAccess(patientId, ["all_data"], "read")];
            case 4:
              // Log data export for audit
              _a.sent();
              return [2 /*return*/, result.data];
            case 5:
              err_8 = _a.sent();
              errorMessage = err_8 instanceof Error ? err_8.message : "Erro desconhecido";
              setError(errorMessage);
              throw err_8;
            case 6:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [logDataAccess],
  );
  // Delete patient data (LGPD erasure right)
  var deletePatientData = (0, react_1.useCallback)(
    (patientId, confirmCode) =>
      __awaiter(this, void 0, void 0, function () {
        var response, err_9, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/delete"), {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ confirmCode: confirmCode }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao excluir dados do paciente");
              }
              // Log data deletion for audit
              return [4 /*yield*/, logDataModification(patientId, ["all_data"], "delete")];
            case 3:
              // Log data deletion for audit
              _a.sent();
              sonner_1.toast.success("Dados do paciente excluídos com sucesso");
              return [2 /*return*/, true];
            case 4:
              err_9 = _a.sent();
              errorMessage = err_9 instanceof Error ? err_9.message : "Erro desconhecido";
              setError(errorMessage);
              sonner_1.toast.error("Erro ao excluir dados: ".concat(errorMessage));
              return [2 /*return*/, false];
            case 5:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [logDataModification],
  );
  // Anonymize patient data (LGPD anonymization right)
  var anonymizePatientData = (0, react_1.useCallback)(
    (patientId) =>
      __awaiter(this, void 0, void 0, function () {
        var response, err_10, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch("/api/patients/".concat(patientId, "/lgpd/anonymize"), {
                  method: "POST",
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Erro ao anonimizar dados do paciente");
              }
              // Log data anonymization for audit
              return [4 /*yield*/, logDataModification(patientId, ["all_data"], "update")];
            case 3:
              // Log data anonymization for audit
              _a.sent();
              sonner_1.toast.success("Dados do paciente anonimizados com sucesso");
              return [2 /*return*/, true];
            case 4:
              err_10 = _a.sent();
              errorMessage = err_10 instanceof Error ? err_10.message : "Erro desconhecido";
              setError(errorMessage);
              sonner_1.toast.error("Erro ao anonimizar dados: ".concat(errorMessage));
              return [2 /*return*/, false];
            case 5:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [logDataModification],
  );
  return {
    // State
    consentData: consentData,
    isLoading: isLoading,
    error: error,
    // Consent management
    recordConsent: recordConsent,
    revokeConsent: revokeConsent,
    updateConsent: updateConsent,
    // Audit functions
    logDataAccess: logDataAccess,
    logDataModification: logDataModification,
    // Compliance checks
    checkConsentValidity: checkConsentValidity,
    getConsentHistory: getConsentHistory,
    // Data rights
    exportPatientData: exportPatientData,
    deletePatientData: deletePatientData,
    anonymizePatientData: anonymizePatientData,
  };
}
