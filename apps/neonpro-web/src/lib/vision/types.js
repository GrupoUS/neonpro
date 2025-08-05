"use strict";
/**
 * Vision Analysis System Types
 * Comprehensive TypeScript type definitions for NeonPro Computer Vision System
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 *
 * VOIDBEAST V4.0 APEX ENHANCED - Quality ≥9.5/10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnalysisResult = isAnalysisResult;
exports.isValidTreatmentType = isValidTreatmentType;
exports.isValidAnalysisStatus = isValidAnalysisStatus;
exports.isValidErrorCode = isValidErrorCode;
var config_1 = require("./config");
// Type Guards
function isAnalysisResult(obj) {
  return obj && typeof obj.id === "string" && typeof obj.analysisData === "object";
}
function isValidTreatmentType(type) {
  return Object.values(config_1.TREATMENT_TYPES).includes(type);
}
function isValidAnalysisStatus(status) {
  return Object.values(config_1.ANALYSIS_STATUS).includes(status);
}
function isValidErrorCode(code) {
  return Object.values(config_1.ERROR_CODES).includes(code);
}
