"use strict";
/**
 * Complication Detection Types
 * Epic 10 - Story 10.3: Automated Complication Detection + Alerts (≥90% Accuracy)
 *
 * Comprehensive TypeScript type definitions for the complication detection system
 * Supports ≥90% accuracy requirements with immediate alerts and emergency protocols
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLICATION_DETECTION_CONSTANTS = exports.AlertAcknowledgmentSchema = exports.ValidationRequestSchema = exports.ComplicationDetectionRequestSchema = void 0;
var zod_1 = require("zod");
// Zod Schemas for Runtime Validation
exports.ComplicationDetectionRequestSchema = zod_1.z.object({
    imageId: zod_1.z.string().uuid('Invalid image ID format'),
    patientId: zod_1.z.string().uuid('Invalid patient ID format'),
    treatmentType: zod_1.z.string().min(1, 'Treatment type is required'),
    previousAnalysisId: zod_1.z.string().uuid().optional(),
    clinicianId: zod_1.z.string().uuid('Invalid clinician ID format'),
    urgencyLevel: zod_1.z.enum(['routine', 'urgent', 'emergency']).default('routine'),
    metadata: zod_1.z.object({
        captureDate: zod_1.z.string().datetime('Invalid capture date format'),
        deviceInfo: zod_1.z.string().optional(),
        lighting: zod_1.z.enum(['natural', 'artificial', 'mixed']).optional(),
        angle: zod_1.z.string().optional(),
        distance: zod_1.z.string().optional()
    }).optional()
});
exports.ValidationRequestSchema = zod_1.z.object({
    detectionResultId: zod_1.z.string().uuid('Invalid detection result ID'),
    validatorId: zod_1.z.string().uuid('Invalid validator ID'),
    validationType: zod_1.z.enum(['expert_review', 'automated_check', 'peer_review']),
    validationData: zod_1.z.object({
        actualDiagnosis: zod_1.z.string().optional(),
        clinicalNotes: zod_1.z.string().optional(),
        imageQualityAssessment: zod_1.z.number().min(0).max(10).optional(),
        treatmentOutcome: zod_1.z.string().optional(),
        followUpResults: zod_1.z.string().optional()
    })
});
exports.AlertAcknowledgmentSchema = zod_1.z.object({
    alertId: zod_1.z.string().uuid('Invalid alert ID'),
    acknowledgedBy: zod_1.z.string().uuid('Invalid user ID'),
    notes: zod_1.z.string().optional(),
    escalate: zod_1.z.boolean().default(false),
    escalateTo: zod_1.z.string().optional()
});
// Constants
exports.COMPLICATION_DETECTION_CONSTANTS = {
    MIN_ACCURACY_THRESHOLD: 0.90, // Story requirement: ≥90% accuracy
    MIN_CONFIDENCE_THRESHOLD: 0.85,
    MAX_PROCESSING_TIME_MS: 30000, // 30 seconds max
    QUALITY_THRESHOLD: 9.8, // VOIDBEAST V6.0 standard
    ALERT_TIMEFRAMES: {
        critical: 'immediate', // < 5 minutes
        high: '1_hour',
        medium: '4_hours',
        low: '24_hours',
        none: 'routine'
    },
    DEFAULT_MODEL_TYPES: [
        'infection_detector',
        'adverse_reaction_detector',
        'healing_issue_detector',
        'procedural_complication_detector'
    ]
};
