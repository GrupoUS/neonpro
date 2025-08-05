"use strict";
/**
 * React Hook for Real-Time LGPD Compliance Monitoring
 *
 * Provides real-time compliance status, alerts, and violation management
 * for healthcare compliance dashboards and monitoring interfaces.
 */
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
exports.useComplianceMonitoring = useComplianceMonitoring;
exports.useComplianceMetrics = useComplianceMetrics;
exports.useComplianceViolations = useComplianceViolations;
exports.useComplianceAlerts = useComplianceAlerts;
exports.useComplianceRecommendations = useComplianceRecommendations;
var react_1 = require("react");
var compliance_monitoring_1 = require("./compliance-monitoring");
function useComplianceMonitoring() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    status = _a[0],
    setStatus = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(),
    error = _c[0],
    setError = _c[1];
  var statusUpdateRef = (0, react_1.useRef)();
  // Status update handler
  var handleStatusUpdate = (0, react_1.useCallback)(function (newStatus) {
    setStatus(newStatus);
    setIsLoading(false);
  }, []);
  // Start monitoring
  var startMonitoring = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var initialStatus, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              setIsLoading(true);
              setError(undefined);
              return [
                4 /*yield*/,
                compliance_monitoring_1.realTimeComplianceMonitor.startMonitoring(),
                // Add status listener
              ];
            case 1:
              _a.sent();
              // Add status listener
              statusUpdateRef.current = handleStatusUpdate;
              compliance_monitoring_1.realTimeComplianceMonitor.addStatusListener(
                handleStatusUpdate,
              );
              return [
                4 /*yield*/,
                compliance_monitoring_1.realTimeComplianceMonitor.getCurrentStatus(),
              ];
            case 2:
              initialStatus = _a.sent();
              setStatus(initialStatus);
              setIsLoading(false);
              return [3 /*break*/, 4];
            case 3:
              err_1 = _a.sent();
              console.error("Error starting compliance monitoring:", err_1);
              setError("Falha ao iniciar monitoramento de conformidade");
              setIsLoading(false);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [handleStatusUpdate],
  );
  // Stop monitoring
  var stopMonitoring = (0, react_1.useCallback)(function () {
    compliance_monitoring_1.realTimeComplianceMonitor.stopMonitoring();
    if (statusUpdateRef.current) {
      compliance_monitoring_1.realTimeComplianceMonitor.removeStatusListener(
        statusUpdateRef.current,
      );
      statusUpdateRef.current = undefined;
    }
  }, []);
  // Refresh status
  var refresh = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var currentStatus, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            setIsLoading(true);
            setError(undefined);
            return [
              4 /*yield*/,
              compliance_monitoring_1.realTimeComplianceMonitor.getCurrentStatus(),
            ];
          case 1:
            currentStatus = _a.sent();
            setStatus(currentStatus);
            setIsLoading(false);
            return [3 /*break*/, 3];
          case 2:
            err_2 = _a.sent();
            console.error("Error refreshing compliance status:", err_2);
            setError("Falha ao atualizar status de conformidade");
            setIsLoading(false);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Report violation
  var reportViolation = (0, react_1.useCallback)(function (violation) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              compliance_monitoring_1.realTimeComplianceMonitor.reportViolation(violation),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_3 = _a.sent();
            console.error("Error reporting violation:", err_3);
            setError("Falha ao reportar violação");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Resolve violation
  var resolveViolation = (0, react_1.useCallback)(function (violationId, resolution, responsible) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              compliance_monitoring_1.realTimeComplianceMonitor.resolveViolation(
                violationId,
                resolution,
                responsible,
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_4 = _a.sent();
            console.error("Error resolving violation:", err_4);
            setError("Falha ao resolver violação");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Acknowledge alert
  var acknowledgeAlert = (0, react_1.useCallback)(function (alertId, acknowledgedBy) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              compliance_monitoring_1.realTimeComplianceMonitor.acknowledgeAlert(
                alertId,
                acknowledgedBy,
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_5 = _a.sent();
            console.error("Error acknowledging alert:", err_5);
            setError("Falha ao confirmar alerta");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Trigger manual assessment
  var triggerAssessment = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var err_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              compliance_monitoring_1.realTimeComplianceMonitor.triggerAssessment(),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_6 = _a.sent();
            console.error("Error triggering assessment:", err_6);
            setError("Falha ao executar avaliação");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Cleanup on unmount
  (0, react_1.useEffect)(function () {
    return function () {
      if (statusUpdateRef.current) {
        compliance_monitoring_1.realTimeComplianceMonitor.removeStatusListener(
          statusUpdateRef.current,
        );
      }
    };
  }, []);
  return {
    status: status,
    isLoading: isLoading,
    isMonitoring: (status === null || status === void 0 ? void 0 : status.isMonitoring) || false,
    error: error,
    startMonitoring: startMonitoring,
    stopMonitoring: stopMonitoring,
    refresh: refresh,
    reportViolation: reportViolation,
    resolveViolation: resolveViolation,
    acknowledgeAlert: acknowledgeAlert,
    triggerAssessment: triggerAssessment,
  };
}
// Hook for compliance metrics with filtering and sorting
function useComplianceMetrics() {
  var _a = useComplianceMonitoring(),
    status = _a.status,
    isLoading = _a.isLoading;
  var metrics = (status === null || status === void 0 ? void 0 : status.metrics) || null;
  var getComplianceLevelColor = (0, react_1.useCallback)(function (level) {
    switch (level) {
      case compliance_monitoring_1.ComplianceLevel.EXCELLENT:
        return "text-green-600";
      case compliance_monitoring_1.ComplianceLevel.GOOD:
        return "text-blue-600";
      case compliance_monitoring_1.ComplianceLevel.FAIR:
        return "text-yellow-600";
      case compliance_monitoring_1.ComplianceLevel.POOR:
        return "text-orange-600";
      case compliance_monitoring_1.ComplianceLevel.CRITICAL:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }, []);
  var getComplianceLevelText = (0, react_1.useCallback)(function (level) {
    switch (level) {
      case compliance_monitoring_1.ComplianceLevel.EXCELLENT:
        return "Excelente";
      case compliance_monitoring_1.ComplianceLevel.GOOD:
        return "Boa";
      case compliance_monitoring_1.ComplianceLevel.FAIR:
        return "Regular";
      case compliance_monitoring_1.ComplianceLevel.POOR:
        return "Ruim";
      case compliance_monitoring_1.ComplianceLevel.CRITICAL:
        return "Crítica";
      default:
        return "Desconhecida";
    }
  }, []);
  return {
    metrics: metrics,
    isLoading: isLoading,
    getComplianceLevelColor: getComplianceLevelColor,
    getComplianceLevelText: getComplianceLevelText,
  };
}
// Hook for violations management
function useComplianceViolations() {
  var _a = useComplianceMonitoring(),
    status = _a.status,
    isLoading = _a.isLoading,
    reportViolation = _a.reportViolation,
    resolveViolation = _a.resolveViolation;
  var violations = (status === null || status === void 0 ? void 0 : status.violations) || [];
  var getViolationsByType = (0, react_1.useCallback)(
    function (type) {
      if (!type) return violations;
      return violations.filter(function (v) {
        return v.type === type;
      });
    },
    [violations],
  );
  var getViolationsByCategory = (0, react_1.useCallback)(
    function (category) {
      if (!category) return violations;
      return violations.filter(function (v) {
        return v.category === category;
      });
    },
    [violations],
  );
  var getCriticalViolations = (0, react_1.useCallback)(
    function () {
      return violations.filter(function (v) {
        return v.severity === "critical";
      });
    },
    [violations],
  );
  var getViolationTypeText = (0, react_1.useCallback)(function (type) {
    switch (type) {
      case compliance_monitoring_1.ViolationType.CONSENT_VIOLATION:
        return "Violação de Consentimento";
      case compliance_monitoring_1.ViolationType.DATA_ACCESS_VIOLATION:
        return "Violação de Acesso a Dados";
      case compliance_monitoring_1.ViolationType.RETENTION_VIOLATION:
        return "Violação de Retenção";
      case compliance_monitoring_1.ViolationType.AUDIT_VIOLATION:
        return "Violação de Auditoria";
      case compliance_monitoring_1.ViolationType.DISCLOSURE_VIOLATION:
        return "Violação de Divulgação";
      case compliance_monitoring_1.ViolationType.SECURITY_VIOLATION:
        return "Violação de Segurança";
      case compliance_monitoring_1.ViolationType.RESPONSE_TIME_VIOLATION:
        return "Violação de Prazo de Resposta";
      default:
        return "Violação Desconhecida";
    }
  }, []);
  var getSeverityColor = (0, react_1.useCallback)(function (severity) {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);
  return {
    violations: violations,
    isLoading: isLoading,
    reportViolation: reportViolation,
    resolveViolation: resolveViolation,
    getViolationsByType: getViolationsByType,
    getViolationsByCategory: getViolationsByCategory,
    getCriticalViolations: getCriticalViolations,
    getViolationTypeText: getViolationTypeText,
    getSeverityColor: getSeverityColor,
  };
}
// Hook for alerts management
function useComplianceAlerts() {
  var _a = useComplianceMonitoring(),
    status = _a.status,
    isLoading = _a.isLoading,
    acknowledgeAlert = _a.acknowledgeAlert;
  var alerts = (status === null || status === void 0 ? void 0 : status.alerts) || [];
  var getUnacknowledgedAlerts = (0, react_1.useCallback)(
    function () {
      return alerts.filter(function (a) {
        return !a.acknowledged;
      });
    },
    [alerts],
  );
  var getCriticalAlerts = (0, react_1.useCallback)(
    function () {
      return alerts.filter(function (a) {
        return a.severity === "critical";
      });
    },
    [alerts],
  );
  var getAlertsByCategory = (0, react_1.useCallback)(
    function (category) {
      if (!category) return alerts;
      return alerts.filter(function (a) {
        return a.category === category;
      });
    },
    [alerts],
  );
  var getAlertSeverityColor = (0, react_1.useCallback)(function (severity) {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "error":
        return "text-orange-600 bg-orange-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);
  return {
    alerts: alerts,
    isLoading: isLoading,
    acknowledgeAlert: acknowledgeAlert,
    getUnacknowledgedAlerts: getUnacknowledgedAlerts,
    getCriticalAlerts: getCriticalAlerts,
    getAlertsByCategory: getAlertsByCategory,
    getAlertSeverityColor: getAlertSeverityColor,
  };
}
// Hook for recommendations
function useComplianceRecommendations() {
  var _a = useComplianceMonitoring(),
    status = _a.status,
    isLoading = _a.isLoading;
  var recommendations =
    (status === null || status === void 0 ? void 0 : status.recommendations) || [];
  var getRecommendationsByPriority = (0, react_1.useCallback)(
    function (priority) {
      if (!priority) return recommendations;
      return recommendations.filter(function (r) {
        return r.priority === priority;
      });
    },
    [recommendations],
  );
  var getCriticalRecommendations = (0, react_1.useCallback)(
    function () {
      return recommendations.filter(function (r) {
        return r.priority === "critical";
      });
    },
    [recommendations],
  );
  var getRecommendationsByCategory = (0, react_1.useCallback)(
    function (category) {
      if (!category) return recommendations;
      return recommendations.filter(function (r) {
        return r.category === category;
      });
    },
    [recommendations],
  );
  var getPriorityColor = (0, react_1.useCallback)(function (priority) {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }, []);
  return {
    recommendations: recommendations,
    isLoading: isLoading,
    getRecommendationsByPriority: getRecommendationsByPriority,
    getCriticalRecommendations: getCriticalRecommendations,
    getRecommendationsByCategory: getRecommendationsByCategory,
    getPriorityColor: getPriorityColor,
  };
}
