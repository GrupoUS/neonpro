Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.auditLog = exports.AuditLogger = void 0;
// Audit logger for compliance and security
var AuditLogger = /** @class */ (() => {
  function AuditLogger() {}
  AuditLogger.log = (event) => {
    console.log("[AUDIT]", event);
  };
  AuditLogger.error = (error) => {
    console.error("[AUDIT ERROR]", error);
  };
  return AuditLogger;
})();
exports.AuditLogger = AuditLogger;
exports.auditLog = {
  log: (event) => AuditLogger.log(event),
  error: (error) => AuditLogger.error(error),
};
exports.auditLogger = exports.auditLog;
