"use strict";
// =====================================================
// Session Components Index - Export All Session Components
// Story 1.4: Session Management & Security
// =====================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskLevels =
  exports.securityLevels =
  exports.componentSizes =
  exports.defaultSessionConfig =
  exports.ManagementComponents =
  exports.StatusComponents =
  exports.SessionComponents =
  exports.SecurityDashboard =
  exports.DeviceManagement =
  exports.SessionWarning =
  exports.SessionStatus =
    void 0;
// Main session components
var SessionStatus_1 = require("./SessionStatus");
Object.defineProperty(exports, "SessionStatus", {
  enumerable: true,
  get: function () {
    return SessionStatus_1.default;
  },
});
var SessionWarning_1 = require("./SessionWarning");
Object.defineProperty(exports, "SessionWarning", {
  enumerable: true,
  get: function () {
    return SessionWarning_1.default;
  },
});
var DeviceManagement_1 = require("./DeviceManagement");
Object.defineProperty(exports, "DeviceManagement", {
  enumerable: true,
  get: function () {
    return DeviceManagement_1.default;
  },
});
var SecurityDashboard_1 = require("./SecurityDashboard");
Object.defineProperty(exports, "SecurityDashboard", {
  enumerable: true,
  get: function () {
    return SecurityDashboard_1.default;
  },
});
// =====================================================
// COMPONENT COLLECTIONS
// =====================================================
// All session management components
exports.SessionComponents = {
  SessionStatus: SessionStatus,
  SessionWarning: SessionWarning,
  DeviceManagement: DeviceManagement,
  SecurityDashboard: SecurityDashboard,
};
// Component categories
exports.StatusComponents = {
  SessionStatus: SessionStatus,
  SessionWarning: SessionWarning,
};
exports.ManagementComponents = {
  DeviceManagement: DeviceManagement,
  SecurityDashboard: SecurityDashboard,
};
// =====================================================
// UTILITY EXPORTS
// =====================================================
// Common component configurations
exports.defaultSessionConfig = {
  sessionStatus: {
    showExtendButton: true,
    showLogoutButton: true,
    showSecurityScore: true,
    showTimeRemaining: true,
    compact: false,
  },
  sessionWarning: {
    warningThreshold: 5, // minutes
    criticalThreshold: 2, // minutes
    autoShow: true,
    showAsDialog: true,
    showAsAlert: false,
  },
  deviceManagement: {
    showAddDevice: true,
    showRemoveDevice: true,
    maxDevices: 5,
  },
  securityDashboard: {
    showDetailedEvents: true,
    maxEvents: 10,
    autoRefresh: true,
    refreshInterval: 30, // seconds
  },
};
// Component size variants
exports.componentSizes = {
  compact: "compact",
  normal: "normal",
  expanded: "expanded",
};
// Security levels
exports.securityLevels = {
  secure: "secure",
  moderate: "moderate",
  warning: "warning",
  critical: "critical",
};
// Device risk levels
exports.riskLevels = {
  low: "low",
  medium: "medium",
  high: "high",
};
