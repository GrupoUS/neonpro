"use strict";
// hooks/useLGPDCompliance.ts
// React hooks for LGPD compliance in NeonPro frontend
// Provides easy-to-use hooks for audit logging, consent management, and data subject rights
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
exports.useLGPDComplianceStatus =
  exports.withLGPDProtection =
  exports.useDataSubjectRights =
  exports.useConsentManagement =
  exports.useLGPDAudit =
    void 0;
var client_1 = require("@/lib/supabase/client");
var lgpd_compliance_1 = require("@/lib/supabase/lgpd-compliance");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
// Main LGPD audit logging hook
var useLGPDAudit = function () {
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(null),
    error = _b[0],
    setError = _b[1];
  var supabase = yield (0, client_1.createClient)();
  var compliance = new lgpd_compliance_1.LGPDComplianceManager();
  var logEvent = (0, react_1.useCallback)(
    function (eventType, details) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result, err_1, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _a.sent().data.user;
              if (!user) {
                throw new Error("User not authenticated");
              }
              return [
                4 /*yield*/,
                compliance.createAuditLog({
                  event_type: eventType,
                  user_id: user.id,
                  patient_id: details.patientId,
                  clinic_id: details.clinicId,
                  table_name: details.tableName,
                  action: details.action,
                  record_id: details.recordId,
                  purpose: details.purpose || "Healthcare service provision",
                  legal_basis: "Article 11, II - Protection of life or physical safety",
                }),
              ];
            case 2:
              result = _a.sent();
              if (!result.success) {
                throw new Error(result.error || "Failed to log LGPD event");
              }
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Unknown error occurred";
              setError(errorMessage);
              console.error("LGPD Audit Log Error:", err_1);
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
    [compliance, supabase],
  );
  var logPatientAccess = (0, react_1.useCallback)(
    function (patientId_1, clinicId_1, action_1) {
      var args_1 = [];
      for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
      }
      return __awaiter(
        void 0,
        __spreadArray([patientId_1, clinicId_1, action_1], args_1, true),
        void 0,
        function (patientId, clinicId, action, tableName, recordId) {
          if (tableName === void 0) {
            tableName = "patients";
          }
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [
                  4 /*yield*/,
                  logEvent("patient_record_access", {
                    patientId: patientId,
                    clinicId: clinicId,
                    tableName: tableName,
                    action: action,
                    recordId: recordId,
                    purpose: "Patient care and medical record management",
                  }),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [logEvent],
  );
  var logSensitiveAccess = (0, react_1.useCallback)(
    function (patientId, clinicId, dataType, action, recordId) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, err_2, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _a.sent().data.user;
              if (!user) {
                throw new Error("User not authenticated");
              }
              return [
                4 /*yield*/,
                compliance.logSensitiveDataAccess(
                  user.id,
                  patientId,
                  clinicId,
                  dataType,
                  action,
                  recordId,
                ),
              ];
            case 2:
              _a.sent();
              return [3 /*break*/, 5];
            case 3:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Unknown error occurred";
              setError(errorMessage);
              console.error("LGPD Sensitive Access Log Error:", err_2);
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
    [compliance, supabase],
  );
  return {
    logEvent: logEvent,
    logPatientAccess: logPatientAccess,
    logSensitiveAccess: logSensitiveAccess,
    isLoading: isLoading,
    error: error,
  };
};
exports.useLGPDAudit = useLGPDAudit;
// Consent management hook
var useConsentManagement = function (patientId, clinicId) {
  var _a = (0, react_1.useState)([]),
    consents = _a[0],
    setConsents = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var supabase = yield (0, client_1.createClient)();
  var compliance = new lgpd_compliance_1.LGPDComplianceManager();
  var refreshConsents = (0, react_1.useCallback)(
    function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, fetchError, err_3, errorMessage;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!patientId || !clinicId) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("patient_consents")
                  .select("*")
                  .eq("patient_id", patientId)
                  .eq("clinic_id", clinicId)
                  .order("created_at", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
              if (fetchError) {
                throw new Error(fetchError.message);
              }
              setConsents(data || []);
              return [3 /*break*/, 5];
            case 3:
              err_3 = _b.sent();
              errorMessage = err_3 instanceof Error ? err_3.message : "Failed to fetch consents";
              setError(errorMessage);
              console.error("Consent Fetch Error:", err_3);
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
    [patientId, clinicId, supabase],
  );
  (0, react_1.useEffect)(
    function () {
      refreshConsents();
    },
    [refreshConsents],
  );
  var activeConsents = consents.filter(function (consent) {
    return consent.consent_status === "active";
  });
  var checkConsent = (0, react_1.useCallback)(
    function (consentType) {
      return activeConsents.some(function (consent) {
        return consent.consent_type === consentType;
      });
    },
    [activeConsents],
  );
  var grantConsent = (0, react_1.useCallback)(
    function (consentType, purpose, details) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, consentData, insertError, err_4, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!patientId || !clinicId) {
                setError("Patient ID and Clinic ID are required");
                return [2 /*return*/, false];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, 7, 8]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              user = _a.sent().data.user;
              if (!user) {
                throw new Error("User not authenticated");
              }
              consentData = lgpd_compliance_1.lgpdUtils.generateConsentFormData(
                consentType,
                purpose,
              );
              return [
                4 /*yield*/,
                supabase
                  .from("patient_consents")
                  .insert(
                    __assign(
                      __assign(
                        { patient_id: patientId, clinic_id: clinicId, user_id: user.id },
                        consentData,
                      ),
                      details,
                    ),
                  ),
              ];
            case 3:
              insertError = _a.sent().error;
              if (insertError) {
                throw new Error(insertError.message);
              }
              // Log consent action
              return [
                4 /*yield*/,
                compliance.logConsentAction(
                  patientId,
                  clinicId,
                  consentType,
                  "granted",
                  __assign({ purpose: purpose }, details),
                ),
              ];
            case 4:
              // Log consent action
              _a.sent();
              return [4 /*yield*/, refreshConsents()];
            case 5:
              _a.sent();
              return [2 /*return*/, true];
            case 6:
              err_4 = _a.sent();
              errorMessage = err_4 instanceof Error ? err_4.message : "Failed to grant consent";
              setError(errorMessage);
              console.error("Grant Consent Error:", err_4);
              return [2 /*return*/, false];
            case 7:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      });
    },
    [patientId, clinicId, supabase, compliance, refreshConsents],
  );
  var revokeConsent = (0, react_1.useCallback)(
    function (consentId, reason) {
      return __awaiter(void 0, void 0, void 0, function () {
        var updateError, consent, err_5, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!patientId || !clinicId) {
                setError("Patient ID and Clinic ID are required");
                return [2 /*return*/, false];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, 7, 8]);
              setIsLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                supabase
                  .from("patient_consents")
                  .update({
                    consent_status: "withdrawn",
                    withdrawal_date: new Date().toISOString(),
                    metadata: { withdrawal_reason: reason },
                  })
                  .eq("id", consentId),
              ];
            case 2:
              updateError = _a.sent().error;
              if (updateError) {
                throw new Error(updateError.message);
              }
              consent = consents.find(function (c) {
                return c.id === consentId;
              });
              if (!consent) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                compliance.logConsentAction(patientId, clinicId, consent.consent_type, "revoked", {
                  reason: reason,
                  consent_id: consentId,
                }),
              ];
            case 3:
              _a.sent();
              _a.label = 4;
            case 4:
              return [4 /*yield*/, refreshConsents()];
            case 5:
              _a.sent();
              return [2 /*return*/, true];
            case 6:
              err_5 = _a.sent();
              errorMessage = err_5 instanceof Error ? err_5.message : "Failed to revoke consent";
              setError(errorMessage);
              console.error("Revoke Consent Error:", err_5);
              return [2 /*return*/, false];
            case 7:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      });
    },
    [patientId, clinicId, supabase, compliance, consents, refreshConsents],
  );
  return {
    consents: consents,
    activeConsents: activeConsents,
    checkConsent: checkConsent,
    grantConsent: grantConsent,
    revokeConsent: revokeConsent,
    refreshConsents: refreshConsents,
    isLoading: isLoading,
    error: error,
  };
};
exports.useConsentManagement = useConsentManagement;
// Data subject rights hook
var useDataSubjectRights = function (patientId, clinicId) {
  var _a = (0, react_1.useState)([]),
    requests = _a[0],
    setRequests = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var supabase = yield (0, client_1.createClient)();
  var compliance = new lgpd_compliance_1.LGPDComplianceManager();
  var router = (0, navigation_1.useRouter)();
  var refreshRequests = (0, react_1.useCallback)(
    function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, fetchError, err_6;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!patientId || !clinicId) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              return [
                4 /*yield*/,
                supabase
                  .from("data_subject_requests")
                  .select("*")
                  .eq("patient_id", patientId)
                  .eq("clinic_id", clinicId)
                  .order("submitted_at", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
              if (fetchError) throw new Error(fetchError.message);
              setRequests(data || []);
              return [3 /*break*/, 5];
            case 3:
              err_6 = _b.sent();
              setError(err_6 instanceof Error ? err_6.message : "Failed to fetch requests");
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
    [patientId, clinicId, supabase],
  );
  (0, react_1.useEffect)(
    function () {
      refreshRequests();
    },
    [refreshRequests],
  );
  var submitRequest = (0, react_1.useCallback)(
    function (requestType, description, details) {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, _a, data, insertError, err_7, errorMessage;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (!patientId || !clinicId) {
                setError("Patient ID and Clinic ID are required");
                return [2 /*return*/, { success: false }];
              }
              _b.label = 1;
            case 1:
              _b.trys.push([1, 7, 8, 9]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              user = _b.sent().data.user;
              if (!user) {
                throw new Error("User not authenticated");
              }
              return [
                4 /*yield*/,
                supabase
                  .from("data_subject_requests")
                  .insert({
                    patient_id: patientId,
                    clinic_id: clinicId,
                    requestor_user_id: user.id,
                    request_type: requestType,
                    request_description: description,
                    metadata: details || {},
                  })
                  .select("id")
                  .single(),
              ];
            case 3:
              (_a = _b.sent()), (data = _a.data), (insertError = _a.error);
              if (insertError) {
                throw new Error(insertError.message);
              }
              if (!(data === null || data === void 0 ? void 0 : data.id)) return [3 /*break*/, 5];
              return [
                4 /*yield*/,
                compliance.processDataSubjectRequest(
                  patientId,
                  clinicId,
                  requestType,
                  __assign({ description: description }, details),
                ),
              ];
            case 4:
              _b.sent();
              _b.label = 5;
            case 5:
              return [4 /*yield*/, refreshRequests()];
            case 6:
              _b.sent();
              return [
                2 /*return*/,
                { success: true, requestId: data === null || data === void 0 ? void 0 : data.id },
              ];
            case 7:
              err_7 = _b.sent();
              errorMessage = err_7 instanceof Error ? err_7.message : "Failed to submit request";
              setError(errorMessage);
              return [2 /*return*/, { success: false }];
            case 8:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 9:
              return [2 /*return*/];
          }
        });
      });
    },
    [patientId, clinicId, supabase, compliance, refreshRequests],
  );
  var trackRequest = (0, react_1.useCallback)(
    function (requestId) {
      return (
        requests.find(function (req) {
          return req.id === requestId;
        }) || null
      );
    },
    [requests],
  );
  var downloadData = (0, react_1.useCallback)(
    function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result, blob, url, link, err_8, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!patientId || !clinicId) {
                setError("Patient ID and Clinic ID are required");
                return [2 /*return*/, { success: false }];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              return [
                4 /*yield*/,
                compliance.processDataSubjectRequest(patientId, clinicId, "portability", {
                  format: "json",
                  include_metadata: true,
                }),
              ];
            case 2:
              result = _a.sent();
              if (result.success && result.data) {
                blob = new Blob([JSON.stringify(result.data, null, 2)], {
                  type: "application/json",
                });
                url = URL.createObjectURL(blob);
                link = document.createElement("a");
                link.href = url;
                link.download = "patient-data-"
                  .concat(patientId, "-")
                  .concat(new Date().toISOString().split("T")[0], ".json");
                link.click();
                URL.revokeObjectURL(url);
              }
              return [2 /*return*/, result];
            case 3:
              err_8 = _a.sent();
              errorMessage = err_8 instanceof Error ? err_8.message : "Failed to download data";
              setError(errorMessage);
              return [2 /*return*/, { success: false }];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [patientId, clinicId, compliance],
  );
  var requestDeletion = (0, react_1.useCallback)(
    function (reason) {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                submitRequest(
                  "erasure",
                  reason || "Patient requests deletion of personal data under LGPD Article 18",
                  { deletion_reason: reason },
                ),
              ];
            case 1:
              return [2 /*return*/, _a.sent()];
          }
        });
      });
    },
    [submitRequest],
  );
  return {
    requests: requests,
    submitRequest: submitRequest,
    trackRequest: trackRequest,
    downloadData: downloadData,
    requestDeletion: requestDeletion,
    isLoading: isLoading,
    error: error,
  };
};
exports.useDataSubjectRights = useDataSubjectRights;
// Higher-order component for LGPD-protected components
var withLGPDProtection = function (Component, config) {
  if (config === void 0) {
    config = {};
  }
  return function LGPDProtectedComponent(props) {
    var logEvent = (0, exports.useLGPDAudit)().logEvent;
    var _a = (0, react_1.useState)(false),
      accessLogged = _a[0],
      setAccessLogged = _a[1];
    (0, react_1.useEffect)(
      function () {
        if (config.logAccess && !accessLogged) {
          logEvent("data_access", {
            tableName: "component_access",
            action: "view",
            purpose: "Component access logging",
          });
          setAccessLogged(true);
        }
      },
      [logEvent, accessLogged],
    );
    return react_1.default.createElement(Component, props);
  };
};
exports.withLGPDProtection = withLGPDProtection;
// Utility hook for LGPD compliance status
var useLGPDComplianceStatus = function (patientId, clinicId) {
  var _a = (0, react_1.useState)({
      hasActiveConsents: false,
      pendingRequests: 0,
      recentAuditEntries: 0,
      lastAccess: null,
      complianceScore: 0,
    }),
    complianceStatus = _a[0],
    setComplianceStatus = _a[1];
  var supabase = yield (0, client_1.createClient)();
  (0, react_1.useEffect)(
    function () {
      if (!patientId || !clinicId) return;
      var fetchComplianceStatus = function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var data, error_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [
                  4 /*yield*/,
                  supabase
                    .from("lgpd_compliance_summary")
                    .select("*")
                    .eq("patient_id", patientId)
                    .eq("clinic_id", clinicId)
                    .single(),
                ];
              case 1:
                data = _a.sent().data;
                if (data) {
                  setComplianceStatus({
                    hasActiveConsents: data.active_consents > 0,
                    pendingRequests: data.total_requests - data.completed_requests,
                    recentAuditEntries: data.recent_audit_entries,
                    lastAccess: data.last_record_access,
                    complianceScore: calculateComplianceScore(data),
                  });
                }
                return [3 /*break*/, 3];
              case 2:
                error_1 = _a.sent();
                console.error("Failed to fetch compliance status:", error_1);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      };
      fetchComplianceStatus();
    },
    [patientId, clinicId, supabase],
  );
  return complianceStatus;
};
exports.useLGPDComplianceStatus = useLGPDComplianceStatus;
// Helper function to calculate compliance score
var calculateComplianceScore = function (data) {
  var score = 0;
  // Has active consents
  if (data.active_consents > 0) score += 30;
  // No pending requests
  if (data.total_requests === data.completed_requests) score += 25;
  // Recent audit activity indicates proper monitoring
  if (data.recent_audit_entries > 0) score += 25;
  // Recent access indicates active use
  if (data.last_record_access) score += 20;
  return score;
};
exports.default = {
  useLGPDAudit: exports.useLGPDAudit,
  useConsentManagement: exports.useConsentManagement,
  useDataSubjectRights: exports.useDataSubjectRights,
  withLGPDProtection: exports.withLGPDProtection,
  useLGPDComplianceStatus: exports.useLGPDComplianceStatus,
};
