/**
 * NeonPro Backup & Recovery System Types
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Tipos e interfaces para o sistema completo de backup automático,
 * backup incremental, disaster recovery e monitoramento.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleFrequency =
  exports.TaskStatus =
  exports.AlertSeverity =
  exports.AlertType =
  exports.DataType =
  exports.RecoveryStatus =
  exports.StorageType =
  exports.BackupPriority =
  exports.BackupStatus =
  exports.BackupType =
    void 0;
// ============================================================================
// ENUMS
// ============================================================================
/**
 * Tipos de backup disponíveis
 */
var BackupType;
((BackupType) => {
  BackupType["FULL"] = "FULL";
  BackupType["INCREMENTAL"] = "INCREMENTAL";
  BackupType["DIFFERENTIAL"] = "DIFFERENTIAL";
  BackupType["SNAPSHOT"] = "SNAPSHOT"; // Snapshot do sistema
})(BackupType || (exports.BackupType = BackupType = {}));
/**
 * Status do backup
 */
var BackupStatus;
((BackupStatus) => {
  BackupStatus["PENDING"] = "PENDING";
  BackupStatus["RUNNING"] = "RUNNING";
  BackupStatus["COMPLETED"] = "COMPLETED";
  BackupStatus["FAILED"] = "FAILED";
  BackupStatus["CANCELLED"] = "CANCELLED";
  BackupStatus["EXPIRED"] = "EXPIRED"; // Expirado
})(BackupStatus || (exports.BackupStatus = BackupStatus = {}));
/**
 * Prioridade do backup
 */
var BackupPriority;
((BackupPriority) => {
  BackupPriority["LOW"] = "LOW";
  BackupPriority["MEDIUM"] = "MEDIUM";
  BackupPriority["HIGH"] = "HIGH";
  BackupPriority["CRITICAL"] = "CRITICAL";
})(BackupPriority || (exports.BackupPriority = BackupPriority = {}));
/**
 * Tipos de storage para backup
 */
var StorageType;
((StorageType) => {
  StorageType["LOCAL"] = "LOCAL";
  StorageType["S3"] = "S3";
  StorageType["AZURE"] = "AZURE";
  StorageType["GCS"] = "GCS";
  StorageType["FTP"] = "FTP";
  StorageType["SFTP"] = "SFTP"; // SFTP Server
})(StorageType || (exports.StorageType = StorageType = {}));
/**
 * Status de recuperação
 */
var RecoveryStatus;
((RecoveryStatus) => {
  RecoveryStatus["NOT_STARTED"] = "NOT_STARTED";
  RecoveryStatus["IN_PROGRESS"] = "IN_PROGRESS";
  RecoveryStatus["COMPLETED"] = "COMPLETED";
  RecoveryStatus["FAILED"] = "FAILED";
  RecoveryStatus["PARTIAL"] = "PARTIAL";
})(RecoveryStatus || (exports.RecoveryStatus = RecoveryStatus = {}));
/**
 * Tipos de dados para backup
 */
var DataType;
((DataType) => {
  DataType["DATABASE"] = "DATABASE";
  DataType["FILES"] = "FILES";
  DataType["LOGS"] = "LOGS";
  DataType["CONFIG"] = "CONFIG";
  DataType["MEDIA"] = "MEDIA";
  DataType["DOCUMENTS"] = "DOCUMENTS"; // Documentos
})(DataType || (exports.DataType = DataType = {}));
// Adicionar os tipos que estavam faltando
var AlertType;
((AlertType) => {
  AlertType["BACKUP_FAILURE"] = "BACKUP_FAILURE";
  AlertType["STORAGE_FULL"] = "STORAGE_FULL";
  AlertType["PERFORMANCE_DEGRADATION"] = "PERFORMANCE_DEGRADATION";
  AlertType["SECURITY_BREACH"] = "SECURITY_BREACH";
  AlertType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
((AlertSeverity) => {
  AlertSeverity["LOW"] = "LOW";
  AlertSeverity["MEDIUM"] = "MEDIUM";
  AlertSeverity["HIGH"] = "HIGH";
  AlertSeverity["CRITICAL"] = "CRITICAL";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var TaskStatus;
((TaskStatus) => {
  TaskStatus["PENDING"] = "PENDING";
  TaskStatus["RUNNING"] = "RUNNING";
  TaskStatus["COMPLETED"] = "COMPLETED";
  TaskStatus["FAILED"] = "FAILED";
  TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var ScheduleFrequency;
((ScheduleFrequency) => {
  ScheduleFrequency["HOURLY"] = "HOURLY";
  ScheduleFrequency["DAILY"] = "DAILY";
  ScheduleFrequency["WEEKLY"] = "WEEKLY";
  ScheduleFrequency["MONTHLY"] = "MONTHLY";
  ScheduleFrequency["CUSTOM"] = "CUSTOM";
})(ScheduleFrequency || (exports.ScheduleFrequency = ScheduleFrequency = {}));
