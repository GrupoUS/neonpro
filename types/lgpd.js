"use strict";
// LGPD Types and Interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.LGPD_STATUS_COLORS = exports.LGPD_SEVERITY_COLORS = exports.LGPD_CONSTANTS = void 0;
// Constants
exports.LGPD_CONSTANTS = {
  MAX_RETENTION_YEARS: 10,
  DEFAULT_CONSENT_EXPIRY_MONTHS: 24,
  BREACH_NOTIFICATION_HOURS: 72,
  DATA_PORTABILITY_DAYS: 30,
  ERASURE_REQUEST_DAYS: 30,
  ACCESS_REQUEST_DAYS: 15,
  RECTIFICATION_REQUEST_DAYS: 15,
  ASSESSMENT_FREQUENCY_MONTHS: 6,
  AUDIT_RETENTION_YEARS: 5,
};
exports.LGPD_SEVERITY_COLORS = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
};
exports.LGPD_STATUS_COLORS = {
  pending: "gray",
  in_progress: "blue",
  completed: "green",
  rejected: "red",
  reported: "orange",
  investigating: "blue",
  contained: "yellow",
  resolved: "green",
  failed: "red",
};
