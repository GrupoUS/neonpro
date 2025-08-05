"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceReports = exports.StorageMonitor = exports.BackupHistory = exports.RecoveryWizard = exports.BackupScheduler = exports.BackupConfigForm = exports.BackupDashboard = void 0;
// Backup System Components
var backup_dashboard_1 = require("./backup-dashboard");
Object.defineProperty(exports, "BackupDashboard", { enumerable: true, get: function () { return backup_dashboard_1.default; } });
var backup_config_form_1 = require("./backup-config-form");
Object.defineProperty(exports, "BackupConfigForm", { enumerable: true, get: function () { return backup_config_form_1.default; } });
var BackupScheduler_1 = require("./BackupScheduler");
Object.defineProperty(exports, "BackupScheduler", { enumerable: true, get: function () { return BackupScheduler_1.default; } });
var RecoveryWizard_1 = require("./RecoveryWizard");
Object.defineProperty(exports, "RecoveryWizard", { enumerable: true, get: function () { return RecoveryWizard_1.default; } });
var BackupHistory_1 = require("./BackupHistory");
Object.defineProperty(exports, "BackupHistory", { enumerable: true, get: function () { return BackupHistory_1.default; } });
var StorageMonitor_1 = require("./StorageMonitor");
Object.defineProperty(exports, "StorageMonitor", { enumerable: true, get: function () { return StorageMonitor_1.default; } });
var ComplianceReports_1 = require("./ComplianceReports");
Object.defineProperty(exports, "ComplianceReports", { enumerable: true, get: function () { return ComplianceReports_1.default; } });
