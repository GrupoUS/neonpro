"use strict";
// Central export file for all medical schemas
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lgpdHelpers = exports.healthcareValidators = exports.commonPatterns = exports.AvailableTimesSearchSchema = exports.AppointmentListFiltersSchema = exports.PatientSearchSchema = exports.PatientListFiltersSchema = exports.AuditLogSchema = exports.LGPDConsentSchema = exports.FinancialDataSchema = exports.TreatmentSchema = exports.UpdateAppointmentSchema = exports.CreateAppointmentSchema = exports.UpdatePatientSchema = exports.CreatePatientSchema = void 0;
exports.validateData = validateData;
exports.safeParseWithDefaults = safeParseWithDefaults;
// Medical schemas
__exportStar(require("./medical"), exports);
__exportStar(require("./patient"), exports);
__exportStar(require("./appointment"), exports);
// Re-export commonly used schemas with descriptive names
var medical_1 = require("./medical");
Object.defineProperty(exports, "CreatePatientSchema", { enumerable: true, get: function () { return medical_1.patientSchema; } });
Object.defineProperty(exports, "UpdatePatientSchema", { enumerable: true, get: function () { return medical_1.updatePatientSchema; } });
Object.defineProperty(exports, "CreateAppointmentSchema", { enumerable: true, get: function () { return medical_1.appointmentSchema; } });
Object.defineProperty(exports, "UpdateAppointmentSchema", { enumerable: true, get: function () { return medical_1.updateAppointmentSchema; } });
Object.defineProperty(exports, "TreatmentSchema", { enumerable: true, get: function () { return medical_1.treatmentSchema; } });
Object.defineProperty(exports, "FinancialDataSchema", { enumerable: true, get: function () { return medical_1.financialDataSchema; } });
Object.defineProperty(exports, "LGPDConsentSchema", { enumerable: true, get: function () { return medical_1.consentSchema; } });
Object.defineProperty(exports, "AuditLogSchema", { enumerable: true, get: function () { return medical_1.medicalAuditSchema; } });
var patient_1 = require("./patient");
Object.defineProperty(exports, "PatientListFiltersSchema", { enumerable: true, get: function () { return patient_1.patientFiltersSchema; } });
Object.defineProperty(exports, "PatientSearchSchema", { enumerable: true, get: function () { return patient_1.patientSearchSchema; } });
Object.defineProperty(exports, "AppointmentListFiltersSchema", { enumerable: true, get: function () { return patient_1.appointmentFiltersSchema; } });
Object.defineProperty(exports, "AvailableTimesSearchSchema", { enumerable: true, get: function () { return patient_1.availableTimesSchema; } });
// Utility function to validate data against any schema
function validateData(schema, data) {
    var _a;
    try {
        var result = schema.parse(data);
        return { success: true, data: result };
    }
    catch (error) {
        var errors = ((_a = error.errors) === null || _a === void 0 ? void 0 : _a.map(function (err) { return "".concat(err.path.join('.'), ": ").concat(err.message); })) || ['Validation failed'];
        return { success: false, errors: errors };
    }
}
// Utility function for safe parsing with default values
function safeParseWithDefaults(schema, data, defaults) {
    if (defaults === void 0) { defaults = {}; }
    var result = schema.safeParse(__assign(__assign({}, defaults), data));
    if (result.success) {
        return result.data;
    }
    else {
        console.warn('Schema validation failed, using defaults:', result.error.errors);
        return __assign(__assign({}, defaults), data);
    }
}
// Common validation patterns
exports.commonPatterns = {
    // Brazilian CPF validation
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
    // Brazilian phone validation
    phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/,
    // Brazilian CEP validation
    zipCode: /^\d{5}-?\d{3}$/,
    // Time validation (HH:MM)
    time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    // Brazilian state codes
    brazilianStates: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
        'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
        'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
};
// Healthcare-specific validation helpers
exports.healthcareValidators = {
    // Validate if patient is adult (18+)
    isAdult: function (birthDate) {
        var birth = new Date(birthDate);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 18;
        }
        return age >= 18;
    },
    // Validate appointment time is in business hours
    isBusinessHours: function (time) {
        var _a = time.split(':').map(Number), hours = _a[0], minutes = _a[1];
        var timeInMinutes = hours * 60 + minutes;
        var startTime = 8 * 60; // 08:00
        var endTime = 18 * 60; // 18:00
        return timeInMinutes >= startTime && timeInMinutes <= endTime;
    },
    // Validate appointment is not in the past
    isFutureDate: function (date) {
        var appointmentDate = new Date(date);
        var now = new Date();
        return appointmentDate > now;
    },
    // Validate treatment duration is reasonable
    isValidTreatmentDuration: function (duration) {
        return duration >= 15 && duration <= 480; // 15 minutes to 8 hours
    }
};
// LGPD compliance helpers
exports.lgpdHelpers = {
    // Generate consent record
    generateConsentRecord: function (patientId, consentTypes) { return ({
        patientId: patientId,
        consentTypes: consentTypes,
        consentDate: new Date(),
        ipAddress: '', // Should be filled by the calling code
        userAgent: '', // Should be filled by the calling code
        version: '1.0'
    }); },
    // Check if consent is still valid
    isConsentValid: function (consentDate, validityPeriod) {
        if (validityPeriod === void 0) { validityPeriod = 365; }
        var daysSinceConsent = (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceConsent <= validityPeriod;
    },
    // Generate audit log entry
    generateAuditLog: function (userId, action, resourceType, resourceId) { return ({
        userId: userId,
        action: action,
        resourceType: resourceType,
        resourceId: resourceId,
        timestamp: new Date(),
        ipAddress: '', // Should be filled by the calling code
        userAgent: '' // Should be filled by the calling code
    }); }
};
