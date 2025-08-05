"use strict";
// Professional Management Supabase Functions
// FHIR-compliant healthcare professional data management with modern automation
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
exports.createProfessional = createProfessional;
exports.updateProfessional = updateProfessional;
exports.getProfessional = getProfessional;
exports.searchProfessionals = searchProfessionals;
exports.getProfessionalsWithExpiringLicenses = getProfessionalsWithExpiringLicenses;
exports.getMedicalSpecialties = getMedicalSpecialties;
exports.getSpecialtiesByCategory = getSpecialtiesByCategory;
exports.addProfessionalSpecialty = addProfessionalSpecialty;
exports.createCredential = createCredential;
exports.updateCredential = updateCredential;
exports.searchCredentials = searchCredentials;
exports.getExpiringCredentials = getExpiringCredentials;
exports.createService = createService;
exports.updateService = updateService;
exports.getServicesByProfessional = getServicesByProfessional;
exports.searchAvailableServices = searchAvailableServices;
exports.createMetric = createMetric;
exports.getMetricsByProfessional = getMetricsByProfessional;
exports.getPerformanceDashboardData = getPerformanceDashboardData;
exports.createDevelopmentActivity = createDevelopmentActivity;
exports.getDevelopmentByProfessional = getDevelopmentByProfessional;
exports.getCMECreditsSummary = getCMECreditsSummary;
exports.createWorkflow = createWorkflow;
exports.updateWorkflowStatus = updateWorkflowStatus;
exports.getActiveWorkflows = getActiveWorkflows;
exports.createAlert = createAlert;
exports.getActiveAlerts = getActiveAlerts;
exports.acknowledgeAlert = acknowledgeAlert;
exports.resolveAlert = resolveAlert;
exports.bulkUpdateProfessionalStatus = bulkUpdateProfessionalStatus;
exports.generateExpirationAlerts = generateExpirationAlerts;
exports.getComprehensiveProfessionalProfile = getComprehensiveProfessionalProfile;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
// ============================================
// PROFESSIONAL MANAGEMENT
// ============================================
/**
 * Create a new healthcare professional
 * Includes automatic FHIR ID generation and compliance checks
 */
function createProfessional(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, professional, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professionals')
                        .insert(__assign(__assign({}, data), { fhir_practitioner_id: data.fhir_practitioner_id || crypto.randomUUID(), status: data.status || 'pending_verification' }))
                        .select("\n      *,\n      supervisor:professionals!supervisor_id(id, first_name, last_name)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), professional = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create professional: ".concat(error.message));
                    }
                    return [2 /*return*/, professional];
            }
        });
    });
}
/**
 * Update professional information
 * Includes automated audit trail and compliance tracking
 */
function updateProfessional(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, professional, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professionals')
                        .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                        .eq('id', id)
                        .select("\n      *,\n      supervisor:professionals!supervisor_id(id, first_name, last_name)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), professional = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to update professional: ".concat(error.message));
                    }
                    return [2 /*return*/, professional];
            }
        });
    });
}
/**
 * Get professional by ID with related data
 */
function getProfessional(id) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, professional, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professionals')
                        .select("\n      *,\n      supervisor:professionals!supervisor_id(id, first_name, last_name),\n      specialties:professional_specialties(\n        *,\n        specialty:medical_specialties(*)\n      ),\n      credentials:professional_credentials(*),\n      services:professional_services(*),\n      metrics:performance_metrics(*),\n      development:professional_development(*),\n      workflows:credentialing_workflow(*),\n      alerts:credentialing_alerts(*)\n    ")
                        .eq('id', id)
                        .single()];
                case 1:
                    _a = _b.sent(), professional = _a.data, error = _a.error;
                    if (error) {
                        if (error.code === 'PGRST116')
                            return [2 /*return*/, null]; // Not found
                        throw new Error("Failed to get professional: ".concat(error.message));
                    }
                    return [2 /*return*/, professional];
            }
        });
    });
}
/**
 * Search professionals with advanced filtering
 * Supports full-text search, specialty filtering, and status management
 */
function searchProfessionals(filters) {
    return __awaiter(this, void 0, void 0, function () {
        var query, futureDate, from, to, _a, professionals, error, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('professionals')
                        .select("\n      *,\n      supervisor:professionals!supervisor_id(id, first_name, last_name),\n      specialties:professional_specialties(\n        is_primary,\n        specialty:medical_specialties(name, code, category)\n      )\n    ", { count: 'exact' });
                    // Text search across name fields
                    if (filters.search) {
                        query = query.or("first_name.ilike.%".concat(filters.search, "%,last_name.ilike.%").concat(filters.search, "%,email.ilike.%").concat(filters.search, "%"));
                    }
                    // Status filters
                    if (filters.status && filters.status.length > 0) {
                        query = query.in('status', filters.status);
                    }
                    if (filters.employment_status && filters.employment_status.length > 0) {
                        query = query.in('employment_status', filters.employment_status);
                    }
                    // Specialty filter
                    if (filters.primary_specialty && filters.primary_specialty.length > 0) {
                        query = query.in('primary_specialty', filters.primary_specialty);
                    }
                    // Department filter
                    if (filters.department && filters.department.length > 0) {
                        query = query.in('department', filters.department);
                    }
                    // Date range filters
                    if (filters.hire_date_from) {
                        query = query.gte('hire_date', filters.hire_date_from);
                    }
                    if (filters.hire_date_to) {
                        query = query.lte('hire_date', filters.hire_date_to);
                    }
                    // License state filter
                    if (filters.license_state && filters.license_state.length > 0) {
                        query = query.in('license_state', filters.license_state);
                    }
                    // License expiration warning
                    if (filters.license_expiring_within_days) {
                        futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + filters.license_expiring_within_days);
                        query = query.lte('license_expiration', futureDate.toISOString());
                    }
                    // Sorting
                    query = query.order(filters.sort_by || 'last_name', { ascending: filters.sort_order === 'asc' });
                    from = (filters.page - 1) * filters.limit;
                    to = from + filters.limit - 1;
                    query = query.range(from, to);
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), professionals = _a.data, error = _a.error, count = _a.count;
                    if (error) {
                        throw new Error("Failed to search professionals: ".concat(error.message));
                    }
                    return [2 /*return*/, {
                            data: professionals || [],
                            count: count || 0,
                            page: filters.page,
                            limit: filters.limit,
                            totalPages: Math.ceil((count || 0) / filters.limit)
                        }];
            }
        });
    });
}
/**
 * Get professionals with expiring licenses
 * For compliance monitoring and automated alerts
 */
function getProfessionalsWithExpiringLicenses() {
    return __awaiter(this, arguments, void 0, function (daysAhead) {
        var futureDate, _a, professionals, error;
        if (daysAhead === void 0) { daysAhead = 30; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + daysAhead);
                    return [4 /*yield*/, supabase
                            .from('professionals')
                            .select("\n      id,\n      first_name,\n      last_name,\n      email,\n      license_number,\n      license_state,\n      license_expiration,\n      status\n    ")
                            .lte('license_expiration', futureDate.toISOString())
                            .eq('status', 'active')
                            .order('license_expiration')];
                case 1:
                    _a = _b.sent(), professionals = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get professionals with expiring licenses: ".concat(error.message));
                    }
                    return [2 /*return*/, professionals || []];
            }
        });
    });
}
// ============================================
// MEDICAL SPECIALTIES MANAGEMENT
// ============================================
/**
 * Get all active medical specialties
 */
function getMedicalSpecialties() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, specialties, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('medical_specialties')
                        .select('*')
                        .eq('is_active', true)
                        .order('name')];
                case 1:
                    _a = _b.sent(), specialties = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get medical specialties: ".concat(error.message));
                    }
                    return [2 /*return*/, specialties || []];
            }
        });
    });
}
/**
 * Get specialties by category
 */
function getSpecialtiesByCategory(category) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, specialties, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('medical_specialties')
                        .select('*')
                        .eq('category', category)
                        .eq('is_active', true)
                        .order('name')];
                case 1:
                    _a = _b.sent(), specialties = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get specialties by category: ".concat(error.message));
                    }
                    return [2 /*return*/, specialties || []];
            }
        });
    });
}
/**
 * Add specialty to professional
 */
function addProfessionalSpecialty(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, specialty, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_specialties')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(*),\n      specialty:medical_specialties(*)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), specialty = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to add professional specialty: ".concat(error.message));
                    }
                    return [2 /*return*/, specialty];
            }
        });
    });
}
// ============================================
// CREDENTIALS MANAGEMENT
// ============================================
/**
 * Create professional credential
 * Includes automatic verification workflow initiation
 */
function createCredential(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, credential, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_credentials')
                        .insert(__assign(__assign({}, data), { verification_status: data.verification_status || 'pending' }))
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), credential = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create credential: ".concat(error.message));
                    }
                    return [2 /*return*/, credential];
            }
        });
    });
}
/**
 * Update credential information
 */
function updateCredential(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, credential, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_credentials')
                        .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                        .eq('id', id)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), credential = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to update credential: ".concat(error.message));
                    }
                    return [2 /*return*/, credential];
            }
        });
    });
}
/**
 * Search credentials with filtering
 */
function searchCredentials(filters) {
    return __awaiter(this, void 0, void 0, function () {
        var query, futureDate, from, to, _a, credentials, error, count;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('professional_credentials')
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email, npi_number)\n    ", { count: 'exact' });
                    // Professional filter
                    if (filters.professional_id) {
                        query = query.eq('professional_id', filters.professional_id);
                    }
                    // Credential type filter
                    if (filters.credential_type && filters.credential_type.length > 0) {
                        query = query.in('credential_type', filters.credential_type);
                    }
                    // Verification status filter
                    if (filters.verification_status && filters.verification_status.length > 0) {
                        query = query.in('verification_status', filters.verification_status);
                    }
                    // Issuing organization filter
                    if (filters.issuing_organization && filters.issuing_organization.length > 0) {
                        query = query.in('issuing_organization', filters.issuing_organization);
                    }
                    // Expiring credentials
                    if (filters.expiring_within_days) {
                        futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + filters.expiring_within_days);
                        query = query.lte('expiration_date', futureDate.toISOString());
                    }
                    // Expired credentials
                    if (filters.expired === true) {
                        query = query.lt('expiration_date', new Date().toISOString());
                    }
                    else if (filters.expired === false) {
                        query = query.or('expiration_date.is.null,expiration_date.gt.' + new Date().toISOString());
                    }
                    // Date range filters
                    if (filters.issued_after) {
                        query = query.gte('issue_date', filters.issued_after);
                    }
                    if (filters.issued_before) {
                        query = query.lte('issue_date', filters.issued_before);
                    }
                    // Sorting
                    query = query.order(filters.sort_by || 'expiration_date', { ascending: filters.sort_order === 'asc' });
                    from = (filters.page - 1) * filters.limit;
                    to = from + filters.limit - 1;
                    query = query.range(from, to);
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), credentials = _a.data, error = _a.error, count = _a.count;
                    if (error) {
                        throw new Error("Failed to search credentials: ".concat(error.message));
                    }
                    return [2 /*return*/, {
                            data: credentials || [],
                            count: count || 0,
                            page: filters.page,
                            limit: filters.limit,
                            totalPages: Math.ceil((count || 0) / filters.limit)
                        }];
            }
        });
    });
} /**
 * Get credentials expiring within specified timeframe
 * Used for automated alert generation and compliance monitoring
 */
function getExpiringCredentials() {
    return __awaiter(this, arguments, void 0, function (daysAhead) {
        var futureDate, _a, credentials, error;
        if (daysAhead === void 0) { daysAhead = 30; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + daysAhead);
                    return [4 /*yield*/, supabase
                            .from('professional_credentials')
                            .select("\n      *,\n      professional:professionals(id, first_name, last_name, email, phone)\n    ")
                            .lte('expiration_date', futureDate.toISOString())
                            .eq('verification_status', 'verified')
                            .order('expiration_date')];
                case 1:
                    _a = _b.sent(), credentials = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get expiring credentials: ".concat(error.message));
                    }
                    return [2 /*return*/, credentials || []];
            }
        });
    });
}
// ============================================
// PROFESSIONAL SERVICES MANAGEMENT
// ============================================
/**
 * Create professional service
 */
function createService(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, service, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_services')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name),\n      specialty:medical_specialties(name, code, category)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), service = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create service: ".concat(error.message));
                    }
                    return [2 /*return*/, service];
            }
        });
    });
}
/**
 * Update professional service
 */
function updateService(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, service, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_services')
                        .update(__assign(__assign({}, data), { updated_at: new Date().toISOString() }))
                        .eq('id', id)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name),\n      specialty:medical_specialties(name, code, category)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), service = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to update service: ".concat(error.message));
                    }
                    return [2 /*return*/, service];
            }
        });
    });
}
/**
 * Get services by professional
 */
function getServicesByProfessional(professionalId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, services, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_services')
                        .select("\n      *,\n      specialty:medical_specialties(name, code, category)\n    ")
                        .eq('professional_id', professionalId)
                        .eq('is_active', true)
                        .order('service_name')];
                case 1:
                    _a = _b.sent(), services = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get services by professional: ".concat(error.message));
                    }
                    return [2 /*return*/, services || []];
            }
        });
    });
}
/**
 * Search available services
 * Used for appointment scheduling and service discovery
 */
function searchAvailableServices(filters) {
    return __awaiter(this, void 0, void 0, function () {
        var query, _a, services, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('professional_services')
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, status),\n      specialty:medical_specialties(name, code, category)\n    ")
                        .eq('is_active', true);
                    // Join with professionals to ensure only active professionals
                    query = query.eq('professional.status', 'active');
                    if (filters.specialty_id) {
                        query = query.eq('specialty_id', filters.specialty_id);
                    }
                    if (filters.service_type) {
                        query = query.eq('service_type', filters.service_type);
                    }
                    if (filters.location) {
                        query = query.ilike('location', "%".concat(filters.location, "%"));
                    }
                    if (filters.telemedicine_only) {
                        query = query.eq('telemedicine_available', true);
                    }
                    if (filters.emergency_only) {
                        query = query.eq('emergency_service', true);
                    }
                    return [4 /*yield*/, query.order('service_name')];
                case 1:
                    _a = _b.sent(), services = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to search available services: ".concat(error.message));
                    }
                    return [2 /*return*/, services || []];
            }
        });
    });
}
// ============================================
// PERFORMANCE METRICS MANAGEMENT
// ============================================
/**
 * Create performance metric
 */
function createMetric(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, metric, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('performance_metrics')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), metric = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create metric: ".concat(error.message));
                    }
                    return [2 /*return*/, metric];
            }
        });
    });
}
/**
 * Get metrics by professional and timeframe
 */
function getMetricsByProfessional(professionalId, timeframe, metricTypes) {
    return __awaiter(this, void 0, void 0, function () {
        var query, _a, metrics, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('performance_metrics')
                        .select('*')
                        .eq('professional_id', professionalId);
                    if (timeframe) {
                        query = query
                            .gte('measurement_period_start', timeframe.start)
                            .lte('measurement_period_end', timeframe.end);
                    }
                    if (metricTypes && metricTypes.length > 0) {
                        query = query.in('metric_type', metricTypes);
                    }
                    query = query.order('measurement_period_start', { ascending: false });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), metrics = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get metrics by professional: ".concat(error.message));
                    }
                    return [2 /*return*/, metrics || []];
            }
        });
    });
}
/**
 * Get aggregated performance data for dashboard
 */
function getPerformanceDashboardData(filters) {
    return __awaiter(this, void 0, void 0, function () {
        var query, _a, metrics, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('performance_metrics')
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, department, primary_specialty)\n    ");
                    if ((filters === null || filters === void 0 ? void 0 : filters.professional_ids) && filters.professional_ids.length > 0) {
                        query = query.in('professional_id', filters.professional_ids);
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.metric_types) && filters.metric_types.length > 0) {
                        query = query.in('metric_type', filters.metric_types);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.timeframe) {
                        query = query
                            .gte('measurement_period_start', filters.timeframe.start)
                            .lte('measurement_period_end', filters.timeframe.end);
                    }
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), metrics = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get performance dashboard data: ".concat(error.message));
                    }
                    return [2 /*return*/, metrics || []];
            }
        });
    });
}
// ============================================
// PROFESSIONAL DEVELOPMENT MANAGEMENT
// ============================================
/**
 * Create professional development activity
 */
function createDevelopmentActivity(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, activity, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professional_development')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), activity = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create development activity: ".concat(error.message));
                    }
                    return [2 /*return*/, activity];
            }
        });
    });
}
/**
 * Get development activities by professional
 */
function getDevelopmentByProfessional(professionalId, year) {
    return __awaiter(this, void 0, void 0, function () {
        var query, startOfYear, endOfYear, _a, activities, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('professional_development')
                        .select('*')
                        .eq('professional_id', professionalId);
                    if (year) {
                        startOfYear = new Date(year, 0, 1).toISOString();
                        endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
                        query = query
                            .gte('start_date', startOfYear)
                            .lte('start_date', endOfYear);
                    }
                    query = query.order('start_date', { ascending: false });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), activities = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get development activities: ".concat(error.message));
                    }
                    return [2 /*return*/, activities || []];
            }
        });
    });
}
/**
 * Get CME credits summary for professional
 */
function getCMECreditsSummary(professionalId, year) {
    return __awaiter(this, void 0, void 0, function () {
        var startOfYear, endOfYear, _a, activities, error, totalCredits;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startOfYear = new Date(year, 0, 1).toISOString();
                    endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
                    return [4 /*yield*/, supabase
                            .from('professional_development')
                            .select('cme_credits, activity_type, completion_status')
                            .eq('professional_id', professionalId)
                            .eq('completion_status', 'completed')
                            .gte('completion_date', startOfYear)
                            .lte('completion_date', endOfYear)
                            .not('cme_credits', 'is', null)];
                case 1:
                    _a = _b.sent(), activities = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get CME credits summary: ".concat(error.message));
                    }
                    totalCredits = (activities || []).reduce(function (sum, activity) {
                        return sum + (activity.cme_credits || 0);
                    }, 0);
                    return [2 /*return*/, {
                            totalCredits: totalCredits,
                            activities: activities || [],
                            year: year
                        }];
            }
        });
    });
}
// ============================================
// CREDENTIALING WORKFLOW MANAGEMENT
// ============================================
/**
 * Create credentialing workflow
 */
function createWorkflow(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, workflow, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('credentialing_workflow')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), workflow = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create workflow: ".concat(error.message));
                    }
                    return [2 /*return*/, workflow];
            }
        });
    });
}
/**
 * Update workflow status
 */
function updateWorkflowStatus(id, status, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, workflow, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('credentialing_workflow')
                        .update(__assign(__assign({ status: status }, updates), { updated_at: new Date().toISOString() }))
                        .eq('id', id)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), workflow = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to update workflow status: ".concat(error.message));
                    }
                    return [2 /*return*/, workflow];
            }
        });
    });
}
/**
 * Get active workflows
 */
function getActiveWorkflows(assignedTo) {
    return __awaiter(this, void 0, void 0, function () {
        var query, _a, workflows, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('credentialing_workflow')
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email, npi_number)\n    ")
                        .in('status', ['pending', 'in_progress', 'requires_documents', 'under_review']);
                    if (assignedTo) {
                        query = query.eq('assigned_to', assignedTo);
                    }
                    query = query.order('due_date', { ascending: true });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), workflows = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get active workflows: ".concat(error.message));
                    }
                    return [2 /*return*/, workflows || []];
            }
        });
    });
}
// ============================================
// ALERTS MANAGEMENT
// ============================================
/**
 * Create alert
 */
function createAlert(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, alert, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('credentialing_alerts')
                        .insert(data)
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email),\n      related_credential:professional_credentials(credential_name, expiration_date),\n      related_workflow:credentialing_workflow(workflow_name, status)\n    ")
                        .single()];
                case 1:
                    _a = _b.sent(), alert = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to create alert: ".concat(error.message));
                    }
                    return [2 /*return*/, alert];
            }
        });
    });
}
/**
 * Get active alerts
 */
function getActiveAlerts(professionalId, severity) {
    return __awaiter(this, void 0, void 0, function () {
        var query, _a, alerts, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = supabase
                        .from('credentialing_alerts')
                        .select("\n      *,\n      professional:professionals(id, first_name, last_name, email),\n      related_credential:professional_credentials(credential_name, expiration_date),\n      related_workflow:credentialing_workflow(workflow_name, status)\n    ")
                        .eq('is_active', true)
                        .eq('resolved', false);
                    if (professionalId) {
                        query = query.eq('professional_id', professionalId);
                    }
                    if (severity && severity.length > 0) {
                        query = query.in('severity', severity);
                    }
                    query = query.order('severity', { ascending: false })
                        .order('due_date', { ascending: true });
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), alerts = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to get active alerts: ".concat(error.message));
                    }
                    return [2 /*return*/, alerts || []];
            }
        });
    });
}
/**
 * Acknowledge alert
 */
function acknowledgeAlert(id, acknowledgedBy) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, alert, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('credentialing_alerts')
                        .update({
                        acknowledged: true,
                        acknowledged_by: acknowledgedBy,
                        acknowledged_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                        .eq('id', id)
                        .select('*')
                        .single()];
                case 1:
                    _a = _b.sent(), alert = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to acknowledge alert: ".concat(error.message));
                    }
                    return [2 /*return*/, alert];
            }
        });
    });
}
/**
 * Resolve alert
 */
function resolveAlert(id, resolvedBy, actionTaken) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, alert, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('credentialing_alerts')
                        .update({
                        resolved: true,
                        resolved_by: resolvedBy,
                        resolved_at: new Date().toISOString(),
                        action_taken: actionTaken,
                        updated_at: new Date().toISOString()
                    })
                        .eq('id', id)
                        .select('*')
                        .single()];
                case 1:
                    _a = _b.sent(), alert = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to resolve alert: ".concat(error.message));
                    }
                    return [2 /*return*/, alert];
            }
        });
    });
}
// ============================================
// BULK OPERATIONS AND UTILITIES
// ============================================
/**
 * Bulk update professional statuses
 */
function bulkUpdateProfessionalStatus(professionalIds, status, statusReason) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, professionals, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('professionals')
                        .update({
                        status: status,
                        status_reason: statusReason,
                        updated_at: new Date().toISOString()
                    })
                        .in('id', professionalIds)
                        .select('id, first_name, last_name, status')];
                case 1:
                    _a = _b.sent(), professionals = _a.data, error = _a.error;
                    if (error) {
                        throw new Error("Failed to bulk update professional status: ".concat(error.message));
                    }
                    return [2 /*return*/, professionals || []];
            }
        });
    });
}
/**
 * Generate expiration alerts for all credentials
 * Run periodically to maintain compliance
 */
function generateExpirationAlerts() {
    return __awaiter(this, arguments, void 0, function (daysAhead) {
        var expiringCredentials, alerts, _i, expiringCredentials_1, credential, alert_1, error_1;
        if (daysAhead === void 0) { daysAhead = 30; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getExpiringCredentials(daysAhead)];
                case 1:
                    expiringCredentials = _a.sent();
                    alerts = [];
                    _i = 0, expiringCredentials_1 = expiringCredentials;
                    _a.label = 2;
                case 2:
                    if (!(_i < expiringCredentials_1.length)) return [3 /*break*/, 7];
                    credential = expiringCredentials_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, createAlert({
                            professional_id: credential.professional_id,
                            alert_type: 'expiration',
                            title: "".concat(credential.credential_name, " Expiring Soon"),
                            message: "Your ".concat(credential.credential_name, " will expire on ").concat(credential.expiration_date, ". Please renew before expiration."),
                            severity: daysAhead <= 30 ? 'high' : 'medium',
                            due_date: credential.expiration_date,
                            auto_generated: true,
                            related_credential_id: credential.id,
                            action_required: true
                        })];
                case 4:
                    alert_1 = _a.sent();
                    alerts.push(alert_1);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Failed to create alert for credential ".concat(credential.id, ":"), error_1);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, alerts];
            }
        });
    });
}
/**
 * Get comprehensive professional profile
 * Used for detailed professional views and reports
 */
function getComprehensiveProfessionalProfile(id) {
    return __awaiter(this, void 0, void 0, function () {
        var professional, _a, recentMetrics, activeCredentials, currentServices, recentDevelopment, activeWorkflows, activeAlerts;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getProfessional(id)];
                case 1:
                    professional = _b.sent();
                    if (!professional)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, Promise.all([
                            getMetricsByProfessional(id, {
                                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 90 days
                                end: new Date().toISOString()
                            }),
                            searchCredentials({ professional_id: id, expired: false, limit: 50 }),
                            getServicesByProfessional(id),
                            getDevelopmentByProfessional(id, new Date().getFullYear()),
                            getActiveWorkflows(),
                            getActiveAlerts(id)
                        ])];
                case 2:
                    _a = _b.sent(), recentMetrics = _a[0], activeCredentials = _a[1], currentServices = _a[2], recentDevelopment = _a[3], activeWorkflows = _a[4], activeAlerts = _a[5];
                    return [2 /*return*/, {
                            professional: professional,
                            recentMetrics: recentMetrics,
                            activeCredentials: activeCredentials.data,
                            currentServices: currentServices,
                            recentDevelopment: recentDevelopment,
                            activeWorkflows: activeWorkflows.filter(function (w) { return w.professional_id === id; }),
                            activeAlerts: activeAlerts
                        }];
            }
        });
    });
}
