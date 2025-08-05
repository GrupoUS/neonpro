"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.auditLog = exports.AuditLogger = void 0;
// Audit logger for compliance and security
var AuditLogger = /** @class */ (function () {
  function AuditLogger() {}
  AuditLogger.log = function (event) {
    console.log("[AUDIT]", event);
  };
  AuditLogger.error = function (error) {
    console.error("[AUDIT ERROR]", error);
  };
  return AuditLogger;
})();
exports.AuditLogger = AuditLogger;
exports.auditLog = {
  log: function (event) {
    return AuditLogger.log(event);
  },
  error: function (error) {
    return AuditLogger.error(error);
  },
};
exports.auditLogger = exports.auditLog;
