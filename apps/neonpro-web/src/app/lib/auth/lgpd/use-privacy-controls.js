"use strict";
/**
 * React Hook for LGPD Privacy Management
 *
 * Provides comprehensive privacy controls, consent management, and data subject
 * rights interface for the NeonPro healthcare application.
 */
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePrivacyControls = usePrivacyControls;
exports.useConsentManagement = useConsentManagement;
exports.useDataSubjectRequests = useDataSubjectRequests;
var react_1 = require("react");
var lgpd_compliance_manager_1 = require("./lgpd-compliance-manager");
function usePrivacyControls(userId) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    settings = _a[0],
    setSettings = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(),
    error = _c[0],
    setError = _c[1];
  // Load privacy settings
  var loadSettings = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var privacySettings, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(undefined);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.getPrivacySettings(userId),
              ];
            case 2:
              privacySettings = _a.sent();
              setSettings(privacySettings);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              console.error("Error loading privacy settings:", err_1);
              setError("Falha ao carregar configurações de privacidade");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  // Update consent
  var updateConsent = (0, react_1.useCallback)(
    function (type, granted) {
      return __awaiter(_this, void 0, void 0, function () {
        var updatedSettings, err_2;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!userId || !settings) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              updatedSettings = __assign(__assign({}, settings), {
                consents: __assign(
                  __assign({}, settings.consents),
                  ((_a = {}), (_a[type] = granted), _a),
                ),
              });
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.updatePrivacySettings(
                  userId,
                  updatedSettings,
                ),
              ];
            case 2:
              _b.sent();
              setSettings(updatedSettings);
              return [3 /*break*/, 4];
            case 3:
              err_2 = _b.sent();
              console.error("Error updating consent:", err_2);
              setError("Falha ao atualizar consentimento");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, settings],
  );
  // Update communication preferences
  var updateCommunicationPreferences = (0, react_1.useCallback)(
    function (preferences) {
      return __awaiter(_this, void 0, void 0, function () {
        var updatedSettings, err_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId || !settings) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              updatedSettings = __assign(__assign({}, settings), {
                communicationPreferences: __assign(
                  __assign({}, settings.communicationPreferences),
                  preferences,
                ),
              });
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.updatePrivacySettings(
                  userId,
                  updatedSettings,
                ),
              ];
            case 2:
              _a.sent();
              setSettings(updatedSettings);
              return [3 /*break*/, 4];
            case 3:
              err_3 = _a.sent();
              console.error("Error updating communication preferences:", err_3);
              setError("Falha ao atualizar preferências de comunicação");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, settings],
  );
  // Request data export
  var requestDataExport = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.processDataSubjectRequest(
                  userId,
                  lgpd_compliance_manager_1.LGPDRights.PORTABILITY,
                ),
                // In production, would trigger download or email
              ];
            case 2:
              _a.sent();
              // In production, would trigger download or email
              alert(
                "Solicitação de exportação de dados enviada. Você receberá um email com os dados em até 30 dias.",
              );
              return [3 /*break*/, 4];
            case 3:
              err_4 = _a.sent();
              console.error("Error requesting data export:", err_4);
              setError("Falha ao solicitar exportação de dados");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  // Request data deletion
  var requestDataDeletion = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var confirmed, err_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              confirmed = window.confirm(
                "Tem certeza que deseja solicitar a exclusão dos seus dados? " +
                  "Esta ação pode não ser reversível. Dados médicos podem ser mantidos " +
                  "conforme exigências legais.",
              );
              if (!confirmed) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.processDataSubjectRequest(
                  userId,
                  lgpd_compliance_manager_1.LGPDRights.DELETION,
                ),
              ];
            case 2:
              _a.sent();
              alert(
                "Solicitação de exclusão de dados enviada. Entraremos em contato em até 30 dias.",
              );
              return [3 /*break*/, 4];
            case 3:
              err_5 = _a.sent();
              console.error("Error requesting data deletion:", err_5);
              setError("Falha ao solicitar exclusão de dados");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  // Request data access
  var requestDataAccess = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.processDataSubjectRequest(
                  userId,
                  lgpd_compliance_manager_1.LGPDRights.ACCESS,
                ),
              ];
            case 2:
              _a.sent();
              alert(
                "Solicitação de acesso aos dados enviada. Você receberá um relatório em até 30 dias.",
              );
              return [3 /*break*/, 4];
            case 3:
              err_6 = _a.sent();
              console.error("Error requesting data access:", err_6);
              setError("Falha ao solicitar acesso aos dados");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  // Get data inventory
  var getDataInventory = (0, react_1.useCallback)(function () {
    return lgpd_compliance_manager_1.lgpdComplianceManager.getDataRetentionSchedule();
  }, []);
  // Refresh settings
  var refresh = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadSettings()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadSettings],
  );
  // Load settings on mount
  (0, react_1.useEffect)(
    function () {
      loadSettings();
    },
    [loadSettings],
  );
  return {
    settings: settings,
    isLoading: isLoading,
    error: error,
    updateConsent: updateConsent,
    updateCommunicationPreferences: updateCommunicationPreferences,
    requestDataExport: requestDataExport,
    requestDataDeletion: requestDataDeletion,
    requestDataAccess: requestDataAccess,
    getDataInventory: getDataInventory,
    refresh: refresh,
  };
}
// Hook for consent management
function useConsentManagement(userId) {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    consents = _a[0],
    setConsents = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var loadConsents = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var stored, allConsents, userConsents;
        return __generator(this, function (_a) {
          if (!userId) return [2 /*return*/];
          try {
            setIsLoading(true);
            stored = localStorage.getItem("lgpd_consents");
            allConsents = stored ? JSON.parse(stored) : [];
            userConsents = allConsents.filter(function (c) {
              return c.userId === userId;
            });
            setConsents(userConsents);
          } catch (err) {
            console.error("Error loading consents:", err);
          } finally {
            setIsLoading(false);
          }
          return [2 /*return*/];
        });
      });
    },
    [userId],
  );
  var grantConsent = (0, react_1.useCallback)(
    function (type, purpose) {
      return __awaiter(_this, void 0, void 0, function () {
        var consent_1, err_7;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.recordConsent(
                  userId,
                  type,
                  purpose,
                  true,
                ),
              ];
            case 2:
              consent_1 = _a.sent();
              setConsents(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [consent_1], false);
              });
              return [3 /*break*/, 4];
            case 3:
              err_7 = _a.sent();
              console.error("Error granting consent:", err_7);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  var withdrawConsent = (0, react_1.useCallback)(
    function (type, purpose) {
      return __awaiter(_this, void 0, void 0, function () {
        var consent_2, err_8;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.recordConsent(
                  userId,
                  type,
                  purpose,
                  false,
                ),
              ];
            case 2:
              consent_2 = _a.sent();
              setConsents(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [consent_2], false);
              });
              return [3 /*break*/, 4];
            case 3:
              err_8 = _a.sent();
              console.error("Error withdrawing consent:", err_8);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  (0, react_1.useEffect)(
    function () {
      loadConsents();
    },
    [loadConsents],
  );
  return {
    consents: consents,
    isLoading: isLoading,
    grantConsent: grantConsent,
    withdrawConsent: withdrawConsent,
    refresh: loadConsents,
  };
}
// Hook for data subject requests
function useDataSubjectRequests(userId) {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    requests = _a[0],
    setRequests = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var loadRequests = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var stored, allRequests, userRequests;
        return __generator(this, function (_a) {
          if (!userId) return [2 /*return*/];
          try {
            setIsLoading(true);
            stored = localStorage.getItem("lgpd_requests");
            allRequests = stored ? JSON.parse(stored) : [];
            userRequests = allRequests.filter(function (r) {
              return r.userId === userId;
            });
            setRequests(userRequests);
          } catch (err) {
            console.error("Error loading data subject requests:", err);
          } finally {
            setIsLoading(false);
          }
          return [2 /*return*/];
        });
      });
    },
    [userId],
  );
  var submitRequest = (0, react_1.useCallback)(
    function (type, description) {
      return __awaiter(_this, void 0, void 0, function () {
        var request_1, err_9;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!userId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                lgpd_compliance_manager_1.lgpdComplianceManager.processDataSubjectRequest(
                  userId,
                  type,
                  description,
                ),
              ];
            case 2:
              request_1 = _a.sent();
              setRequests(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [request_1], false);
              });
              return [2 /*return*/, request_1];
            case 3:
              err_9 = _a.sent();
              console.error("Error submitting data subject request:", err_9);
              throw err_9;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId],
  );
  (0, react_1.useEffect)(
    function () {
      loadRequests();
    },
    [loadRequests],
  );
  return {
    requests: requests,
    isLoading: isLoading,
    submitRequest: submitRequest,
    refresh: loadRequests,
  };
}
