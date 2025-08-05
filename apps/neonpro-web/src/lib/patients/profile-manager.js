"use strict";
/**
 * Patient Profile Manager
 *
 * Comprehensive patient profile management system for the NeonPro clinic management platform.
 * Handles patient demographics, medical history, care preferences, emergency contacts,
 * and provides 360-degree patient view with profile completeness scoring.
 *
 * Enhanced with LGPD compliance automation and comprehensive audit trail for
 * real-time compliance validation and complete traceability.
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileManager = void 0;
var audit_logger_1 = require("@/lib/auth/audit/audit-logger");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var server_1 = require("@/lib/supabase/server");
var ProfileManager = /** @class */ (function () {
    function ProfileManager() {
        this.mockProfiles = new Map();
        this.initialized = false;
        // Initialize compliance manager synchronously
        this.complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
    }
    /**
     * Initialize async dependencies
     */
    ProfileManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        this.auditLogger = new audit_logger_1.AuditLogger(supabase);
                        this.initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new comprehensive patient profile
     */
    ProfileManager.prototype.createPatientProfile = function (profileData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, completenessScore, profile, executionTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        startTime = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        // LGPD Compliance Validation
                        return [4 /*yield*/, this.complianceManager.validateDataConsent(profileData, 'patient_profile_creation')];
                    case 3:
                        // LGPD Compliance Validation
                        _a.sent();
                        return [4 /*yield*/, this.calculateProfileCompleteness(profileData)];
                    case 4:
                        completenessScore = _a.sent();
                        profile = {
                            patient_id: profileData.patient_id || "patient_".concat(Date.now()),
                            demographics: profileData.demographics || {
                                name: '',
                                date_of_birth: '',
                                gender: 'prefer_not_to_say',
                                phone: '',
                                email: '',
                                address: ''
                            },
                            medical_information: profileData.medical_information || {
                                medical_history: [],
                                chronic_conditions: [],
                                current_medications: [],
                                allergies: []
                            },
                            vital_signs: profileData.vital_signs || {},
                            care_preferences: profileData.care_preferences || {
                                communication_method: 'email',
                                appointment_preferences: {},
                                language: 'en'
                            },
                            emergency_contacts: profileData.emergency_contacts || [],
                            profile_completeness_score: completenessScore,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            is_active: true
                        };
                        // Store in mock database
                        this.mockProfiles.set(profile.patient_id, profile);
                        // Audit Trail - Patient Profile Creation
                        return [4 /*yield*/, this.auditLogger.log({
                                user_id: userId || 'system',
                                event_type: 'patient_profile_created',
                                event_description: "Patient profile created for ".concat(profile.demographics.name),
                                metadata: {
                                    patient_id: profile.patient_id,
                                    completeness_score: completenessScore,
                                    performance_ms: Date.now() - startTime,
                                    compliance_validated: true
                                }
                            })];
                    case 5:
                        // Audit Trail - Patient Profile Creation
                        _a.sent();
                        executionTime = Date.now() - startTime;
                        if (executionTime > 20000) {
                            console.warn("Patient profile creation exceeded 20s target: ".concat(executionTime, "ms"));
                        }
                        console.log("Created patient profile for ".concat(profile.patient_id, " with completeness: ").concat(completenessScore, " (").concat(executionTime, "ms)"));
                        return [2 /*return*/, profile];
                    case 6:
                        error_1 = _a.sent();
                        // Audit Trail - Error
                        return [4 /*yield*/, this.auditLogger.log({
                                user_id: userId || 'system',
                                event_type: 'patient_profile_creation_error',
                                event_description: "Failed to create patient profile: ".concat(error_1.message),
                                metadata: {
                                    error: error_1.message,
                                    performance_ms: Date.now() - startTime
                                }
                            })];
                    case 7:
                        // Audit Trail - Error
                        _a.sent();
                        console.error('Error in createPatientProfile:', error_1);
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieve complete patient profile with all related data
     */
    ProfileManager.prototype.getPatientProfile = function (patientId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, profile, executionTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        startTime = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        profile = this.mockProfiles.get(patientId);
                        if (!profile || !profile.is_active) {
                            return [2 /*return*/, null];
                        }
                        // Update last accessed timestamp
                        profile.last_accessed = new Date().toISOString();
                        this.mockProfiles.set(patientId, profile);
                        // Audit Trail - Patient Profile Access
                        return [4 /*yield*/, this.auditLogger.log({
                                user_id: userId || 'system',
                                event_type: 'patient_profile_accessed',
                                event_description: "Patient profile accessed for ".concat(profile.demographics.name),
                                metadata: {
                                    patient_id: patientId,
                                    performance_ms: Date.now() - startTime,
                                    access_timestamp: profile.last_accessed
                                }
                            })];
                    case 3:
                        // Audit Trail - Patient Profile Access
                        _a.sent();
                        executionTime = Date.now() - startTime;
                        if (executionTime > 2000) {
                            console.warn("Patient profile retrieval exceeded 2s target: ".concat(executionTime, "ms"));
                        }
                        console.log("Retrieved patient profile for ".concat(patientId, " (").concat(executionTime, "ms)"));
                        return [2 /*return*/, profile];
                    case 4:
                        error_2 = _a.sent();
                        // Audit Trail - Error
                        return [4 /*yield*/, this.auditLogger.log({
                                user_id: userId || 'system',
                                event_type: 'patient_profile_access_error',
                                event_description: "Failed to access patient profile: ".concat(error_2.message),
                                metadata: {
                                    patient_id: patientId,
                                    error: error_2.message,
                                    performance_ms: Date.now() - startTime
                                }
                            })];
                    case 5:
                        // Audit Trail - Error
                        _a.sent();
                        console.error('Error in getPatientProfile:', error_2);
                        return [2 /*return*/, null];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update patient profile with selective updates
     */
    ProfileManager.prototype.updatePatientProfile = function (patientId, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var currentProfile, mergedData, newCompleteness, updatedProfile, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        currentProfile = this.mockProfiles.get(patientId);
                        if (!currentProfile) {
                            throw new Error('Patient profile not found');
                        }
                        mergedData = this.mergeProfileData(currentProfile, updateData);
                        return [4 /*yield*/, this.calculateProfileCompleteness(mergedData)];
                    case 3:
                        newCompleteness = _a.sent();
                        updatedProfile = __assign(__assign({}, mergedData), { profile_completeness_score: newCompleteness, updated_at: new Date().toISOString() });
                        this.mockProfiles.set(patientId, updatedProfile);
                        console.log("Updated patient profile for ".concat(patientId, ", new completeness: ").concat(newCompleteness));
                        return [2 /*return*/, updatedProfile];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Error in updatePatientProfile:', error_3);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate comprehensive profile completeness score
     */
    ProfileManager.prototype.calculateProfileCompleteness = function (profileData) {
        return __awaiter(this, void 0, void 0, function () {
            var weights, totalScore, demoFields, requiredFields, demoScore, medFields, medOptional, medScore, vitalFields, vitalOptional, vitalScore, careFields, careOptional, careScore, primaryContact, contactFields, contactScore;
            return __generator(this, function (_a) {
                weights = {
                    demographics: 0.3,
                    medical_information: 0.25,
                    vital_signs: 0.2,
                    care_preferences: 0.15,
                    emergency_contacts: 0.1
                };
                totalScore = 0;
                // Demographics completeness
                if (profileData.demographics) {
                    demoFields = [
                        'name', 'date_of_birth', 'gender', 'phone', 'email', 'address'
                    ];
                    requiredFields = ['insurance_provider', 'preferred_language', 'emergency_contact_name'];
                    demoScore = this.calculateSectionCompleteness(profileData.demographics, demoFields, requiredFields);
                    totalScore += demoScore * weights.demographics;
                }
                // Medical information completeness
                if (profileData.medical_information) {
                    medFields = ['medical_history', 'chronic_conditions', 'current_medications', 'allergies'];
                    medOptional = ['immunizations', 'family_medical_history'];
                    medScore = this.calculateSectionCompleteness(profileData.medical_information, medFields, medOptional);
                    totalScore += medScore * weights.medical_information;
                }
                // Vital signs completeness
                if (profileData.vital_signs) {
                    vitalFields = ['height_cm', 'weight_kg', 'blood_type'];
                    vitalOptional = ['blood_pressure_systolic', 'heart_rate', 'temperature_celsius'];
                    vitalScore = this.calculateSectionCompleteness(profileData.vital_signs, vitalFields, vitalOptional);
                    totalScore += vitalScore * weights.vital_signs;
                }
                // Care preferences completeness
                if (profileData.care_preferences) {
                    careFields = ['communication_method', 'language'];
                    careOptional = ['appointment_preferences', 'accessibility_needs'];
                    careScore = this.calculateSectionCompleteness(profileData.care_preferences, careFields, careOptional);
                    totalScore += careScore * weights.care_preferences;
                }
                // Emergency contacts completeness
                if (profileData.emergency_contacts && profileData.emergency_contacts.length > 0) {
                    primaryContact = profileData.emergency_contacts.find(function (contact) { return contact.is_primary; });
                    if (primaryContact) {
                        contactFields = ['name', 'relationship', 'phone'];
                        contactScore = this.calculateSectionCompleteness(primaryContact, contactFields, ['email', 'address']);
                        totalScore += contactScore * weights.emergency_contacts;
                    }
                }
                return [2 /*return*/, Math.min(100, Math.round(totalScore * 100))]; // Return as percentage (0-100)
            });
        });
    };
    /**
     * Search patients by various criteria
     */
    ProfileManager.prototype.searchPatients = function (searchCriteria) {
        return __awaiter(this, void 0, void 0, function () {
            var allPatients, results;
            return __generator(this, function (_a) {
                try {
                    allPatients = Array.from(this.mockProfiles.values())
                        .filter(function (patient) { return patient.is_active; });
                    results = allPatients;
                    // Apply search filters
                    if (searchCriteria.name) {
                        results = results.filter(function (patient) {
                            return patient.demographics.name.toLowerCase().includes(searchCriteria.name.toLowerCase());
                        });
                    }
                    if (searchCriteria.phone) {
                        results = results.filter(function (patient) {
                            return patient.demographics.phone === searchCriteria.phone;
                        });
                    }
                    if (searchCriteria.email) {
                        results = results.filter(function (patient) {
                            return patient.demographics.email.toLowerCase().includes(searchCriteria.email.toLowerCase());
                        });
                    }
                    if (searchCriteria.dateOfBirth) {
                        results = results.filter(function (patient) {
                            return patient.demographics.date_of_birth === searchCriteria.dateOfBirth;
                        });
                    }
                    if (searchCriteria.insuranceId) {
                        results = results.filter(function (patient) {
                            return patient.demographics.insurance_id === searchCriteria.insuranceId;
                        });
                    }
                    // Apply limit
                    if (searchCriteria.limit) {
                        results = results.slice(0, searchCriteria.limit);
                    }
                    return [2 /*return*/, results.sort(function (a, b) {
                            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                        })];
                }
                catch (error) {
                    console.error('Error in searchPatients:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get patients with incomplete profiles
     */
    ProfileManager.prototype.getIncompleteProfiles = function () {
        return __awaiter(this, arguments, void 0, function (threshold) {
            if (threshold === void 0) { threshold = 0.8; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        try {
                            return [2 /*return*/, Array.from(this.mockProfiles.values())
                                    .filter(function (patient) {
                                    return patient.is_active && patient.profile_completeness_score < threshold;
                                })
                                    .sort(function (a, b) { return a.profile_completeness_score - b.profile_completeness_score; })];
                        }
                        catch (error) {
                            console.error('Error in getIncompleteProfiles:', error);
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Archive patient profile (soft delete)
     */
    ProfileManager.prototype.archivePatientProfile = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        try {
                            profile = this.mockProfiles.get(patientId);
                            if (!profile) {
                                return [2 /*return*/, false];
                            }
                            profile.is_active = false;
                            profile.updated_at = new Date().toISOString();
                            this.mockProfiles.set(patientId, profile);
                            console.log("Archived patient profile for ".concat(patientId));
                            return [2 /*return*/, true];
                        }
                        catch (error) {
                            console.error('Error in archivePatientProfile:', error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get patient statistics and analytics
     */
    ProfileManager.prototype.getPatientAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allPatients, activePatients, avgCompleteness, needingAttention, sevenDaysAgo_1, recentlyUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        try {
                            allPatients = Array.from(this.mockProfiles.values());
                            activePatients = allPatients.filter(function (patient) { return patient.is_active; });
                            avgCompleteness = activePatients.length > 0
                                ? activePatients.reduce(function (sum, patient) { return sum + patient.profile_completeness_score; }, 0) / activePatients.length
                                : 0;
                            needingAttention = activePatients.filter(function (patient) {
                                return patient.profile_completeness_score < 0.7;
                            });
                            sevenDaysAgo_1 = new Date();
                            sevenDaysAgo_1.setDate(sevenDaysAgo_1.getDate() - 7);
                            recentlyUpdated = activePatients.filter(function (patient) {
                                return new Date(patient.updated_at) >= sevenDaysAgo_1;
                            });
                            return [2 /*return*/, {
                                    totalPatients: allPatients.length,
                                    activePatients: activePatients.length,
                                    averageCompleteness: Math.round(avgCompleteness * 100) / 100,
                                    profilesNeedingAttention: needingAttention.length,
                                    recentlyUpdated: recentlyUpdated.length
                                }];
                        }
                        catch (error) {
                            console.error('Error in getPatientAnalytics:', error);
                            return [2 /*return*/, {
                                    totalPatients: 0,
                                    activePatients: 0,
                                    averageCompleteness: 0,
                                    profilesNeedingAttention: 0,
                                    recentlyUpdated: 0
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Private helper methods
    ProfileManager.prototype.calculateSectionCompleteness = function (sectionData, requiredFields, optionalFields) {
        if (optionalFields === void 0) { optionalFields = []; }
        if (!sectionData)
            return 0;
        var score = 0;
        var totalFields = requiredFields.length + optionalFields.length;
        // Check required fields (weighted more heavily)
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (this.hasValidValue(sectionData[field])) {
                score += 2; // Required fields worth 2 points
            }
        }
        // Check optional fields
        for (var _a = 0, optionalFields_1 = optionalFields; _a < optionalFields_1.length; _a++) {
            var field = optionalFields_1[_a];
            if (this.hasValidValue(sectionData[field])) {
                score += 1; // Optional fields worth 1 point
            }
        }
        // Calculate percentage (required fields count double)
        var maxScore = (requiredFields.length * 2) + optionalFields.length;
        return maxScore > 0 ? score / maxScore : 0;
    };
    ProfileManager.prototype.hasValidValue = function (value) {
        if (value === null || value === undefined)
            return false;
        if (typeof value === 'string' && value.trim() === '')
            return false;
        if (Array.isArray(value) && value.length === 0)
            return false;
        return true;
    };
    ProfileManager.prototype.mergeProfileData = function (currentProfile, updateData) {
        return __assign(__assign({}, currentProfile), { demographics: updateData.demographics
                ? __assign(__assign({}, currentProfile.demographics), updateData.demographics) : currentProfile.demographics, medical_information: updateData.medical_information
                ? __assign(__assign({}, currentProfile.medical_information), updateData.medical_information) : currentProfile.medical_information, vital_signs: updateData.vital_signs
                ? __assign(__assign({}, currentProfile.vital_signs), updateData.vital_signs) : currentProfile.vital_signs, care_preferences: updateData.care_preferences
                ? __assign(__assign({}, currentProfile.care_preferences), updateData.care_preferences) : currentProfile.care_preferences, emergency_contacts: updateData.emergency_contacts || currentProfile.emergency_contacts });
    };
    /**
     * Archive patient profile (soft delete)
     */
    ProfileManager.prototype.archivePatient = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        try {
                            profile = this.mockProfiles.get(patientId);
                            if (!profile) {
                                console.error("Patient ".concat(patientId, " not found for archiving"));
                                return [2 /*return*/, false];
                            }
                            // Mark as inactive (soft delete)
                            profile.is_active = false;
                            profile.updated_at = new Date().toISOString();
                            // Update the profile in the mock database
                            this.mockProfiles.set(patientId, profile);
                            console.log("Archived patient profile for ".concat(patientId));
                            return [2 /*return*/, true];
                        }
                        catch (error) {
                            console.error('Error in archivePatient:', error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProfileManager;
}());
exports.ProfileManager = ProfileManager;
exports.default = ProfileManager;
