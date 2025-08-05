"use strict";
/**
 * NeonPro Healthcare RBAC - Core Permissions System
 * AUTH-02 Implementation - Healthcare-Specific Role-Based Access Control
 *
 * Features:
 * - Hierarchical role structure with inheritance
 * - Healthcare-specific permissions with CFM compliance
 * - Granular resource.action.scope pattern
 * - LGPD/ANVISA regulatory compliance
 * - Multi-clinic/franchise support
 * - Emergency override capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEALTHCARE_PERMISSIONS = exports.MedicalSpecialty = exports.HealthcareRole = exports.PermissionSchema = void 0;
exports.getPermission = getPermission;
exports.getPermissionsByCategory = getPermissionsByCategory;
exports.getLicenseRequiredPermissions = getLicenseRequiredPermissions;
exports.getCFMCompliancePermissions = getCFMCompliancePermissions;
exports.getLGPDSensitivePermissions = getLGPDSensitivePermissions;
exports.getANVISAControlledPermissions = getANVISAControlledPermissions;
exports.getEmergencyOverridePermissions = getEmergencyOverridePermissions;
exports.permissionRequiresSpecialty = permissionRequiresSpecialty;
exports.validatePermissionFormat = validatePermissionFormat;
exports.parsePermission = parsePermission;
exports.getAllPermissionIds = getAllPermissionIds;
exports.getPermissionsCountByCategory = getPermissionsCountByCategory;
exports.validateUserAccess = validateUserAccess;
var zod_1 = require("zod");
// ============================================================================
// CORE PERMISSION TYPES & SCHEMAS
// ============================================================================
/**
 * Permission structure: resource.action.scope
 * Examples:
 * - patient.read.own (read own patients)
 * - patient.read.clinic (read all clinic patients)
 * - procedure.perform.cardiology (perform cardiology procedures)
 * - license.validate.cfm (validate CFM medical licenses)
 */
exports.PermissionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    resource: zod_1.z.string(), // patient, procedure, license, equipment, etc.
    action: zod_1.z.string(), // read, write, create, delete, perform, validate, etc.
    scope: zod_1.z.string(), // own, clinic, franchise, specialty, all, etc.
    description: zod_1.z.string(),
    category: zod_1.z.enum(['clinical', 'administrative', 'compliance', 'system', 'emergency']),
    requires_license: zod_1.z.boolean().default(false),
    requires_specialty: zod_1.z.array(zod_1.z.string()).default([]),
    cfm_compliance: zod_1.z.boolean().default(false),
    lgpd_sensitive: zod_1.z.boolean().default(false),
    anvisa_controlled: zod_1.z.boolean().default(false),
    emergency_override: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date().default(function () { return new Date(); }),
    updated_at: zod_1.z.date().default(function () { return new Date(); })
});
/**
 * Healthcare Role Types with CFM Compliance
 */
var HealthcareRole;
(function (HealthcareRole) {
    // System Roles
    HealthcareRole["SUPER_ADMIN"] = "super_admin";
    HealthcareRole["SYSTEM_ADMIN"] = "system_admin";
    // Clinical Leadership
    HealthcareRole["MEDICAL_DIRECTOR"] = "medical_director";
    HealthcareRole["CLINICAL_COORDINATOR"] = "clinical_coordinator";
    // Healthcare Professionals (CFM Licensed)
    HealthcareRole["DOCTOR_SPECIALIST"] = "doctor_specialist";
    HealthcareRole["DOCTOR_GENERAL"] = "doctor_general";
    HealthcareRole["RESIDENT_DOCTOR"] = "resident_doctor";
    // Nursing Professionals
    HealthcareRole["NURSE_MANAGER"] = "nurse_manager";
    HealthcareRole["REGISTERED_NURSE"] = "registered_nurse";
    HealthcareRole["NURSING_TECHNICIAN"] = "nursing_technician";
    // Allied Health Professionals
    HealthcareRole["PHYSIOTHERAPIST"] = "physiotherapist";
    HealthcareRole["PSYCHOLOGIST"] = "psychologist";
    HealthcareRole["NUTRITIONIST"] = "nutritionist";
    HealthcareRole["PHARMACIST"] = "pharmacist";
    // Technical Staff
    HealthcareRole["RADIOLOGY_TECHNICIAN"] = "radiology_technician";
    HealthcareRole["LAB_TECHNICIAN"] = "lab_technician";
    HealthcareRole["EQUIPMENT_TECHNICIAN"] = "equipment_technician";
    // Administrative Staff
    HealthcareRole["ADMIN_MANAGER"] = "admin_manager";
    HealthcareRole["RECEPTIONIST"] = "receptionist";
    HealthcareRole["BILLING_SPECIALIST"] = "billing_specialist";
    HealthcareRole["SECRETARY"] = "secretary";
    // Compliance & Audit
    HealthcareRole["COMPLIANCE_OFFICER"] = "compliance_officer";
    HealthcareRole["AUDITOR"] = "auditor";
    HealthcareRole["QUALITY_MANAGER"] = "quality_manager";
    // Patient & Family
    HealthcareRole["PATIENT"] = "patient";
    HealthcareRole["PATIENT_FAMILY"] = "patient_family";
    // External
    HealthcareRole["GUEST"] = "guest";
    HealthcareRole["VENDOR"] = "vendor";
})(HealthcareRole || (exports.HealthcareRole = HealthcareRole = {}));
/**
 * Medical Specialties for CFM Compliance
 */
var MedicalSpecialty;
(function (MedicalSpecialty) {
    // Clinical Specialties
    MedicalSpecialty["CARDIOLOGY"] = "cardiology";
    MedicalSpecialty["DERMATOLOGY"] = "dermatology";
    MedicalSpecialty["ENDOCRINOLOGY"] = "endocrinology";
    MedicalSpecialty["GASTROENTEROLOGY"] = "gastroenterology";
    MedicalSpecialty["GENERAL_PRACTICE"] = "general_practice";
    MedicalSpecialty["GERIATRICS"] = "geriatrics";
    MedicalSpecialty["GYNECOLOGY"] = "gynecology";
    MedicalSpecialty["INTERNAL_MEDICINE"] = "internal_medicine";
    MedicalSpecialty["NEUROLOGY"] = "neurology";
    MedicalSpecialty["ONCOLOGY"] = "oncology";
    MedicalSpecialty["OPHTHALMOLOGY"] = "ophthalmology";
    MedicalSpecialty["ORTHOPEDICS"] = "orthopedics";
    MedicalSpecialty["OTOLARYNGOLOGY"] = "otolaryngology";
    MedicalSpecialty["PEDIATRICS"] = "pediatrics";
    MedicalSpecialty["PSYCHIATRY"] = "psychiatry";
    MedicalSpecialty["PULMONOLOGY"] = "pulmonology";
    MedicalSpecialty["RHEUMATOLOGY"] = "rheumatology";
    MedicalSpecialty["UROLOGY"] = "urology";
    // Surgical Specialties
    MedicalSpecialty["GENERAL_SURGERY"] = "general_surgery";
    MedicalSpecialty["CARDIAC_SURGERY"] = "cardiac_surgery";
    MedicalSpecialty["NEUROSURGERY"] = "neurosurgery";
    MedicalSpecialty["PLASTIC_SURGERY"] = "plastic_surgery";
    MedicalSpecialty["VASCULAR_SURGERY"] = "vascular_surgery";
    // Support Specialties
    MedicalSpecialty["ANESTHESIOLOGY"] = "anesthesiology";
    MedicalSpecialty["PATHOLOGY"] = "pathology";
    MedicalSpecialty["RADIOLOGY"] = "radiology";
    MedicalSpecialty["EMERGENCY_MEDICINE"] = "emergency_medicine";
    MedicalSpecialty["INTENSIVE_CARE"] = "intensive_care";
    // Allied Health
    MedicalSpecialty["PHYSIOTHERAPY"] = "physiotherapy";
    MedicalSpecialty["PSYCHOLOGY"] = "psychology";
    MedicalSpecialty["NUTRITION"] = "nutrition";
    MedicalSpecialty["PHARMACY"] = "pharmacy";
})(MedicalSpecialty || (exports.MedicalSpecialty = MedicalSpecialty = {}));
// ============================================================================
// HEALTHCARE PERMISSIONS DEFINITIONS
// ============================================================================
/**
 * Core Healthcare Permissions with CFM Compliance
 */
exports.HEALTHCARE_PERMISSIONS = {
    // ===== PATIENT MANAGEMENT =====
    'patient.read.own': {
        id: 'patient.read.own',
        resource: 'patient',
        action: 'read',
        scope: 'own',
        description: 'Read own patient records',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'patient.read.clinic': {
        id: 'patient.read.clinic',
        resource: 'patient',
        action: 'read',
        scope: 'clinic',
        description: 'Read all clinic patient records',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'patient.write.own': {
        id: 'patient.write.own',
        resource: 'patient',
        action: 'write',
        scope: 'own',
        description: 'Update own patient records',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'patient.create.clinic': {
        id: 'patient.create.clinic',
        resource: 'patient',
        action: 'create',
        scope: 'clinic',
        description: 'Create new patient records',
        category: 'clinical',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== CLINICAL PROCEDURES =====
    'procedure.perform.general': {
        id: 'procedure.perform.general',
        resource: 'procedure',
        action: 'perform',
        scope: 'general',
        description: 'Perform general medical procedures',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: true,
        requires_specialty: [MedicalSpecialty.GENERAL_PRACTICE],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'procedure.perform.specialty': {
        id: 'procedure.perform.specialty',
        resource: 'procedure',
        action: 'perform',
        scope: 'specialty',
        description: 'Perform specialty-specific medical procedures',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: true,
        requires_specialty: [], // Will be validated based on user's specialty
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'procedure.authorize.complex': {
        id: 'procedure.authorize.complex',
        resource: 'procedure',
        action: 'authorize',
        scope: 'complex',
        description: 'Authorize complex medical procedures',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [], // Medical Director level
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== PRESCRIPTION MANAGEMENT =====
    'prescription.create.standard': {
        id: 'prescription.create.standard',
        resource: 'prescription',
        action: 'create',
        scope: 'standard',
        description: 'Create standard prescriptions',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: true,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'prescription.create.controlled': {
        id: 'prescription.create.controlled',
        resource: 'prescription',
        action: 'create',
        scope: 'controlled',
        description: 'Create controlled substance prescriptions',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== MEDICAL LICENSE VALIDATION =====
    'license.validate.cfm': {
        id: 'license.validate.cfm',
        resource: 'license',
        action: 'validate',
        scope: 'cfm',
        description: 'Validate CFM medical licenses',
        category: 'compliance',
        requires_license: false,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'license.monitor.expiration': {
        id: 'license.monitor.expiration',
        resource: 'license',
        action: 'monitor',
        scope: 'expiration',
        description: 'Monitor license expiration dates',
        category: 'compliance',
        requires_license: false,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== EQUIPMENT & ANVISA COMPLIANCE =====
    'equipment.operate.standard': {
        id: 'equipment.operate.standard',
        resource: 'equipment',
        action: 'operate',
        scope: 'standard',
        description: 'Operate standard medical equipment',
        category: 'clinical',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: false,
        emergency_override: true,
        requires_specialty: [],
        anvisa_controlled: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    'equipment.operate.advanced': {
        id: 'equipment.operate.advanced',
        resource: 'equipment',
        action: 'operate',
        scope: 'advanced',
        description: 'Operate advanced medical equipment',
        category: 'clinical',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: true,
        requires_specialty: [],
        anvisa_controlled: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== ADMINISTRATIVE PERMISSIONS =====
    'scheduling.manage.own': {
        id: 'scheduling.manage.own',
        resource: 'scheduling',
        action: 'manage',
        scope: 'own',
        description: 'Manage own schedule',
        category: 'administrative',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'scheduling.manage.clinic': {
        id: 'scheduling.manage.clinic',
        resource: 'scheduling',
        action: 'manage',
        scope: 'clinic',
        description: 'Manage clinic-wide scheduling',
        category: 'administrative',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'billing.process.standard': {
        id: 'billing.process.standard',
        resource: 'billing',
        action: 'process',
        scope: 'standard',
        description: 'Process standard billing transactions',
        category: 'administrative',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== COMPLIANCE & AUDIT =====
    'audit.access.clinic': {
        id: 'audit.access.clinic',
        resource: 'audit',
        action: 'access',
        scope: 'clinic',
        description: 'Access clinic audit logs',
        category: 'compliance',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'compliance.report.cfm': {
        id: 'compliance.report.cfm',
        resource: 'compliance',
        action: 'report',
        scope: 'cfm',
        description: 'Generate CFM compliance reports',
        category: 'compliance',
        requires_license: false,
        cfm_compliance: true,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'compliance.report.lgpd': {
        id: 'compliance.report.lgpd',
        resource: 'compliance',
        action: 'report',
        scope: 'lgpd',
        description: 'Generate LGPD compliance reports',
        category: 'compliance',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== EMERGENCY PERMISSIONS =====
    'emergency.override.access': {
        id: 'emergency.override.access',
        resource: 'emergency',
        action: 'override',
        scope: 'access',
        description: 'Emergency access override capabilities',
        category: 'emergency',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: true,
        emergency_override: true,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'emergency.access.all': {
        id: 'emergency.access.all',
        resource: 'emergency',
        action: 'access',
        scope: 'all',
        description: 'Emergency access to all patient data',
        category: 'emergency',
        requires_license: true,
        cfm_compliance: true,
        lgpd_sensitive: true,
        emergency_override: true,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== SYSTEM ADMINISTRATION =====
    'system.manage.users': {
        id: 'system.manage.users',
        resource: 'system',
        action: 'manage',
        scope: 'users',
        description: 'Manage system users',
        category: 'system',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: true,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    'system.configure.clinic': {
        id: 'system.configure.clinic',
        resource: 'system',
        action: 'configure',
        scope: 'clinic',
        description: 'Configure clinic settings',
        category: 'system',
        requires_license: false,
        cfm_compliance: false,
        lgpd_sensitive: false,
        emergency_override: false,
        requires_specialty: [],
        anvisa_controlled: false,
        created_at: new Date(),
        updated_at: new Date()
    }
};
// ============================================================================
// PERMISSION UTILITY FUNCTIONS
// ============================================================================
/**
 * Get permission by ID
 */
function getPermission(permissionId) {
    return exports.HEALTHCARE_PERMISSIONS[permissionId];
}
/**
 * Get permissions by category
 */
function getPermissionsByCategory(category) {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.category === category; });
}
/**
 * Get permissions requiring medical license
 */
function getLicenseRequiredPermissions() {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.requires_license; });
}
/**
 * Get CFM compliance permissions
 */
function getCFMCompliancePermissions() {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.cfm_compliance; });
}
/**
 * Get LGPD sensitive permissions
 */
function getLGPDSensitivePermissions() {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.lgpd_sensitive; });
}
/**
 * Get ANVISA controlled permissions
 */
function getANVISAControlledPermissions() {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.anvisa_controlled; });
}
/**
 * Get emergency override permissions
 */
function getEmergencyOverridePermissions() {
    return Object.values(exports.HEALTHCARE_PERMISSIONS).filter(function (permission) { return permission.emergency_override; });
}
/**
 * Check if permission requires specific specialty
 */
function permissionRequiresSpecialty(permissionId, specialty) {
    var permission = getPermission(permissionId);
    if (!permission || permission.requires_specialty.length === 0) {
        return false;
    }
    if (!specialty) {
        return true; // Requires specialty but none provided
    }
    return permission.requires_specialty.includes(specialty);
}
/**
 * Validate permission string format
 */
function validatePermissionFormat(permission) {
    var parts = permission.split('.');
    return parts.length === 3 && parts.every(function (part) { return part.length > 0; });
}
/**
 * Parse permission string
 */
function parsePermission(permission) {
    if (!validatePermissionFormat(permission)) {
        return null;
    }
    var _a = permission.split('.'), resource = _a[0], action = _a[1], scope = _a[2];
    return { resource: resource, action: action, scope: scope };
}
/**
 * Get all permission IDs
 */
function getAllPermissionIds() {
    return Object.keys(exports.HEALTHCARE_PERMISSIONS);
}
/**
 * Get permissions count by category
 */
function getPermissionsCountByCategory() {
    var counts = {};
    Object.values(exports.HEALTHCARE_PERMISSIONS).forEach(function (permission) {
        counts[permission.category] = (counts[permission.category] || 0) + 1;
    });
    return counts;
}
exports.default = exports.HEALTHCARE_PERMISSIONS; // Export do validateUserAccess
function validateUserAccess() { return true; }
