"use strict";
/**
 * NeonPro Healthcare RBAC Engine
 * AUTH-02 Implementation - Healthcare Role-Based Access Control Engine
 *
 * Features:
 * - Hierarchical role management with inheritance
 * - Healthcare-specific role definitions with CFM compliance
 * - Context-aware permission validation
 * - Just-in-time access provisioning
 * - Emergency override capabilities
 * - Multi-clinic/franchise support
 * - Comprehensive audit trail
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareRBACEngine = exports.HEALTHCARE_ROLE_DEFINITIONS = exports.PermissionCheckResultSchema = exports.RoleDefinitionSchema = exports.UserRoleContextSchema = void 0;
exports.getRoleDefinition = getRoleDefinition;
exports.getRolesByCategory = getRolesByCategory;
exports.getLicenseRequiredRoles = getLicenseRequiredRoles;
exports.getRolesByLevel = getRolesByLevel;
exports.canDelegate = canDelegate;
exports.getRoleHierarchyPath = getRoleHierarchyPath;
var zod_1 = require("zod");
var permissions_1 = require("./permissions");
// ============================================================================
// CORE RBAC TYPES & SCHEMAS
// ============================================================================
/**
 * User Role Context with Healthcare-Specific Information
 */
exports.UserRoleContextSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    role: zod_1.z.nativeEnum(permissions_1.HealthcareRole),
    clinic_id: zod_1.z.string().uuid(),
    franchise_id: zod_1.z.string().uuid().optional(),
    // Medical Professional Information
    medical_license: zod_1.z.string().optional(),
    cfm_number: zod_1.z.string().optional(),
    medical_specialty: zod_1.z.nativeEnum(permissions_1.MedicalSpecialty).optional(),
    license_expiry: zod_1.z.date().optional(),
    license_active: zod_1.z.boolean().default(true),
    // Additional Specialties/Certifications
    additional_specialties: zod_1.z.array(zod_1.z.nativeEnum(permissions_1.MedicalSpecialty)).default([]),
    certifications: zod_1.z.array(zod_1.z.string()).default([]),
    // Access Context
    active: zod_1.z.boolean().default(true),
    temporary_access: zod_1.z.boolean().default(false),
    emergency_access: zod_1.z.boolean().default(false),
    access_granted_at: zod_1.z.date().default(function () { return new Date(); }),
    access_expires_at: zod_1.z.date().optional(),
    // Audit Information
    granted_by: zod_1.z.string().uuid().optional(),
    last_validated: zod_1.z.date().default(function () { return new Date(); }),
    validation_required: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date().default(function () { return new Date(); }),
    updated_at: zod_1.z.date().default(function () { return new Date(); })
});
/**
 * Role Definition with Hierarchy and Permissions
 */
exports.RoleDefinitionSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(permissions_1.HealthcareRole),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    level: zod_1.z.number(), // Hierarchy level (higher = more privileges)
    category: zod_1.z.enum(['system', 'clinical', 'administrative', 'compliance', 'patient', 'external']),
    // Permission Management
    permissions: zod_1.z.array(zod_1.z.string()),
    inherited_from: zod_1.z.array(zod_1.z.nativeEnum(permissions_1.HealthcareRole)).default([]),
    can_delegate_to: zod_1.z.array(zod_1.z.nativeEnum(permissions_1.HealthcareRole)).default([]),
    // Healthcare-Specific Requirements
    requires_medical_license: zod_1.z.boolean().default(false),
    requires_cfm_registration: zod_1.z.boolean().default(false),
    allowed_specialties: zod_1.z.array(zod_1.z.nativeEnum(permissions_1.MedicalSpecialty)).default([]),
    // Compliance Requirements
    requires_background_check: zod_1.z.boolean().default(false),
    requires_continuing_education: zod_1.z.boolean().default(false),
    audit_frequency_days: zod_1.z.number().default(90),
    // Access Control
    multi_clinic_access: zod_1.z.boolean().default(false),
    emergency_override_capable: zod_1.z.boolean().default(false),
    can_approve_emergency_access: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date().default(function () { return new Date(); }),
    updated_at: zod_1.z.date().default(function () { return new Date(); })
});
/**
 * Permission Check Result
 */
exports.PermissionCheckResultSchema = zod_1.z.object({
    granted: zod_1.z.boolean(),
    permission: zod_1.z.string(),
    user_id: zod_1.z.string(),
    role: zod_1.z.nativeEnum(permissions_1.HealthcareRole),
    reason: zod_1.z.string(),
    // Context Information
    clinic_id: zod_1.z.string().optional(),
    requires_validation: zod_1.z.boolean().default(false),
    emergency_override: zod_1.z.boolean().default(false),
    // Compliance Checks
    license_valid: zod_1.z.boolean().default(true),
    specialty_match: zod_1.z.boolean().default(true),
    cfm_compliant: zod_1.z.boolean().default(true),
    lgpd_compliant: zod_1.z.boolean().default(true),
    // Audit Trail
    checked_at: zod_1.z.date().default(function () { return new Date(); }),
    audit_log_id: zod_1.z.string().optional()
});
// ============================================================================
// HEALTHCARE ROLE DEFINITIONS
// ============================================================================
/**
 * Complete Healthcare Role Hierarchy with Permissions
 */
exports.HEALTHCARE_ROLE_DEFINITIONS = (_a = {},
    // ===== SYSTEM ROLES =====
    _a[permissions_1.HealthcareRole.SUPER_ADMIN] = {
        role: permissions_1.HealthcareRole.SUPER_ADMIN,
        name: 'Super Administrator',
        description: 'System-wide administrative access with all permissions',
        level: 100,
        category: 'system',
        permissions: Object.keys(permissions_1.HEALTHCARE_PERMISSIONS),
        inherited_from: [],
        can_delegate_to: Object.values(permissions_1.HealthcareRole),
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: Object.values(permissions_1.MedicalSpecialty),
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 30,
        multi_clinic_access: true,
        emergency_override_capable: true,
        can_approve_emergency_access: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.SYSTEM_ADMIN] = {
        role: permissions_1.HealthcareRole.SYSTEM_ADMIN,
        name: 'System Administrator',
        description: 'Technical system administration without clinical access',
        level: 90,
        category: 'system',
        permissions: [
            'system.manage.users',
            'system.configure.clinic',
            'audit.access.clinic',
            'compliance.report.lgpd',
            'scheduling.manage.clinic'
        ],
        inherited_from: [],
        can_delegate_to: [
            permissions_1.HealthcareRole.ADMIN_MANAGER,
            permissions_1.HealthcareRole.COMPLIANCE_OFFICER
        ],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 60,
        multi_clinic_access: true,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== CLINICAL LEADERSHIP =====
    _a[permissions_1.HealthcareRole.MEDICAL_DIRECTOR] = {
        role: permissions_1.HealthcareRole.MEDICAL_DIRECTOR,
        name: 'Medical Director',
        description: 'Senior clinical leadership with full medical authority',
        level: 85,
        category: 'clinical',
        permissions: [
            'patient.read.clinic',
            'patient.write.own',
            'patient.create.clinic',
            'procedure.perform.general',
            'procedure.perform.specialty',
            'procedure.authorize.complex',
            'prescription.create.standard',
            'prescription.create.controlled',
            'license.validate.cfm',
            'license.monitor.expiration',
            'equipment.operate.standard',
            'equipment.operate.advanced',
            'scheduling.manage.clinic',
            'billing.process.standard',
            'audit.access.clinic',
            'compliance.report.cfm',
            'compliance.report.lgpd',
            'emergency.override.access',
            'emergency.access.all',
            'system.configure.clinic'
        ],
        inherited_from: [],
        can_delegate_to: [
            permissions_1.HealthcareRole.CLINICAL_COORDINATOR,
            permissions_1.HealthcareRole.DOCTOR_SPECIALIST,
            permissions_1.HealthcareRole.DOCTOR_GENERAL,
            permissions_1.HealthcareRole.NURSE_MANAGER
        ],
        requires_medical_license: true,
        requires_cfm_registration: true,
        allowed_specialties: Object.values(permissions_1.MedicalSpecialty),
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 30,
        multi_clinic_access: true,
        emergency_override_capable: true,
        can_approve_emergency_access: true,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.CLINICAL_COORDINATOR] = {
        role: permissions_1.HealthcareRole.CLINICAL_COORDINATOR,
        name: 'Clinical Coordinator',
        description: 'Clinical operations coordination and oversight',
        level: 75,
        category: 'clinical',
        permissions: [
            'patient.read.clinic',
            'patient.write.own',
            'procedure.perform.general',
            'scheduling.manage.clinic',
            'license.validate.cfm',
            'equipment.operate.standard',
            'audit.access.clinic',
            'compliance.report.cfm'
        ],
        inherited_from: [permissions_1.HealthcareRole.REGISTERED_NURSE],
        can_delegate_to: [
            permissions_1.HealthcareRole.REGISTERED_NURSE,
            permissions_1.HealthcareRole.NURSING_TECHNICIAN
        ],
        requires_medical_license: true,
        requires_cfm_registration: true,
        allowed_specialties: [permissions_1.MedicalSpecialty.GENERAL_PRACTICE],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 60,
        multi_clinic_access: false,
        emergency_override_capable: true,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== HEALTHCARE PROFESSIONALS (CFM Licensed) =====
    _a[permissions_1.HealthcareRole.DOCTOR_SPECIALIST] = {
        role: permissions_1.HealthcareRole.DOCTOR_SPECIALIST,
        name: 'Specialist Doctor',
        description: 'Medical specialist with specialty-specific procedure authorization',
        level: 80,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.read.clinic',
            'patient.write.own',
            'procedure.perform.general',
            'procedure.perform.specialty',
            'prescription.create.standard',
            'prescription.create.controlled',
            'equipment.operate.standard',
            'equipment.operate.advanced',
            'scheduling.manage.own',
            'emergency.override.access'
        ],
        inherited_from: [permissions_1.HealthcareRole.DOCTOR_GENERAL],
        can_delegate_to: [
            permissions_1.HealthcareRole.RESIDENT_DOCTOR,
            permissions_1.HealthcareRole.REGISTERED_NURSE
        ],
        requires_medical_license: true,
        requires_cfm_registration: true,
        allowed_specialties: Object.values(permissions_1.MedicalSpecialty),
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 60,
        multi_clinic_access: false,
        emergency_override_capable: true,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.DOCTOR_GENERAL] = {
        role: permissions_1.HealthcareRole.DOCTOR_GENERAL,
        name: 'General Practitioner',
        description: 'General practice physician with standard clinical permissions',
        level: 70,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.general',
            'prescription.create.standard',
            'equipment.operate.standard',
            'scheduling.manage.own',
            'emergency.override.access'
        ],
        inherited_from: [],
        can_delegate_to: [
            permissions_1.HealthcareRole.RESIDENT_DOCTOR,
            permissions_1.HealthcareRole.REGISTERED_NURSE
        ],
        requires_medical_license: true,
        requires_cfm_registration: true,
        allowed_specialties: [permissions_1.MedicalSpecialty.GENERAL_PRACTICE],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: true,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.RESIDENT_DOCTOR] = {
        role: permissions_1.HealthcareRole.RESIDENT_DOCTOR,
        name: 'Resident Doctor',
        description: 'Medical resident with supervised clinical permissions',
        level: 60,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.general',
            'equipment.operate.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: true,
        allowed_specialties: [permissions_1.MedicalSpecialty.GENERAL_PRACTICE],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 30,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== NURSING PROFESSIONALS =====
    _a[permissions_1.HealthcareRole.NURSE_MANAGER] = {
        role: permissions_1.HealthcareRole.NURSE_MANAGER,
        name: 'Nurse Manager',
        description: 'Nursing team leadership and management',
        level: 65,
        category: 'clinical',
        permissions: [
            'patient.read.clinic',
            'patient.write.own',
            'procedure.perform.general',
            'equipment.operate.standard',
            'scheduling.manage.clinic',
            'audit.access.clinic'
        ],
        inherited_from: [permissions_1.HealthcareRole.REGISTERED_NURSE],
        can_delegate_to: [
            permissions_1.HealthcareRole.REGISTERED_NURSE,
            permissions_1.HealthcareRole.NURSING_TECHNICIAN
        ],
        requires_medical_license: true,
        requires_cfm_registration: false, // COREN registration
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 60,
        multi_clinic_access: false,
        emergency_override_capable: true,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.REGISTERED_NURSE] = {
        role: permissions_1.HealthcareRole.REGISTERED_NURSE,
        name: 'Registered Nurse',
        description: 'Licensed nursing professional with clinical care permissions',
        level: 55,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.general',
            'equipment.operate.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [permissions_1.HealthcareRole.NURSING_TECHNICIAN],
        requires_medical_license: true,
        requires_cfm_registration: false, // COREN registration
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.NURSING_TECHNICIAN] = {
        role: permissions_1.HealthcareRole.NURSING_TECHNICIAN,
        name: 'Nursing Technician',
        description: 'Nursing support with basic clinical permissions',
        level: 45,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'equipment.operate.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false, // COREN registration
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== ALLIED HEALTH PROFESSIONALS =====
    _a[permissions_1.HealthcareRole.PHYSIOTHERAPIST] = {
        role: permissions_1.HealthcareRole.PHYSIOTHERAPIST,
        name: 'Physiotherapist',
        description: 'Physical therapy professional with specialty permissions',
        level: 50,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.specialty',
            'equipment.operate.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false, // COFFITO registration
        allowed_specialties: [permissions_1.MedicalSpecialty.PHYSIOTHERAPY],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.PSYCHOLOGIST] = {
        role: permissions_1.HealthcareRole.PSYCHOLOGIST,
        name: 'Psychologist',
        description: 'Mental health professional with psychological care permissions',
        level: 50,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.specialty',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false, // CRP registration
        allowed_specialties: [permissions_1.MedicalSpecialty.PSYCHOLOGY],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.NUTRITIONIST] = {
        role: permissions_1.HealthcareRole.NUTRITIONIST,
        name: 'Nutritionist',
        description: 'Nutrition professional with dietary care permissions',
        level: 50,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'patient.write.own',
            'procedure.perform.specialty',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false, // CRN registration
        allowed_specialties: [permissions_1.MedicalSpecialty.NUTRITION],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.PHARMACIST] = {
        role: permissions_1.HealthcareRole.PHARMACIST,
        name: 'Pharmacist',
        description: 'Pharmaceutical professional with medication management permissions',
        level: 55,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'prescription.create.standard',
            'prescription.create.controlled',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false, // CRF registration
        allowed_specialties: [permissions_1.MedicalSpecialty.PHARMACY],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 60,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== TECHNICAL STAFF =====
    _a[permissions_1.HealthcareRole.RADIOLOGY_TECHNICIAN] = {
        role: permissions_1.HealthcareRole.RADIOLOGY_TECHNICIAN,
        name: 'Radiology Technician',
        description: 'Medical imaging technician with equipment operation permissions',
        level: 40,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'equipment.operate.standard',
            'equipment.operate.advanced',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false,
        allowed_specialties: [permissions_1.MedicalSpecialty.RADIOLOGY],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.LAB_TECHNICIAN] = {
        role: permissions_1.HealthcareRole.LAB_TECHNICIAN,
        name: 'Laboratory Technician',
        description: 'Laboratory technician with specimen processing permissions',
        level: 40,
        category: 'clinical',
        permissions: [
            'patient.read.own',
            'equipment.operate.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: true,
        requires_cfm_registration: false,
        allowed_specialties: [permissions_1.MedicalSpecialty.PATHOLOGY],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.EQUIPMENT_TECHNICIAN] = {
        role: permissions_1.HealthcareRole.EQUIPMENT_TECHNICIAN,
        name: 'Equipment Technician',
        description: 'Medical equipment maintenance and operation technician',
        level: 35,
        category: 'clinical',
        permissions: [
            'equipment.operate.standard',
            'equipment.operate.advanced',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== ADMINISTRATIVE STAFF =====
    _a[permissions_1.HealthcareRole.ADMIN_MANAGER] = {
        role: permissions_1.HealthcareRole.ADMIN_MANAGER,
        name: 'Administrative Manager',
        description: 'Administrative operations management',
        level: 60,
        category: 'administrative',
        permissions: [
            'patient.create.clinic',
            'scheduling.manage.clinic',
            'billing.process.standard',
            'audit.access.clinic',
            'system.configure.clinic'
        ],
        inherited_from: [],
        can_delegate_to: [
            permissions_1.HealthcareRole.RECEPTIONIST,
            permissions_1.HealthcareRole.BILLING_SPECIALIST,
            permissions_1.HealthcareRole.SECRETARY
        ],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.RECEPTIONIST] = {
        role: permissions_1.HealthcareRole.RECEPTIONIST,
        name: 'Receptionist',
        description: 'Front desk operations and patient scheduling',
        level: 30,
        category: 'administrative',
        permissions: [
            'patient.create.clinic',
            'scheduling.manage.clinic',
            'billing.process.standard'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 180,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.BILLING_SPECIALIST] = {
        role: permissions_1.HealthcareRole.BILLING_SPECIALIST,
        name: 'Billing Specialist',
        description: 'Medical billing and insurance processing',
        level: 35,
        category: 'administrative',
        permissions: [
            'billing.process.standard',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 120,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.SECRETARY] = {
        role: permissions_1.HealthcareRole.SECRETARY,
        name: 'Secretary',
        description: 'Administrative support and documentation',
        level: 25,
        category: 'administrative',
        permissions: [
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 180,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== COMPLIANCE & AUDIT =====
    _a[permissions_1.HealthcareRole.COMPLIANCE_OFFICER] = {
        role: permissions_1.HealthcareRole.COMPLIANCE_OFFICER,
        name: 'Compliance Officer',
        description: 'Regulatory compliance monitoring and reporting',
        level: 70,
        category: 'compliance',
        permissions: [
            'audit.access.clinic',
            'compliance.report.cfm',
            'compliance.report.lgpd',
            'license.validate.cfm',
            'license.monitor.expiration'
        ],
        inherited_from: [],
        can_delegate_to: [permissions_1.HealthcareRole.AUDITOR],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 30,
        multi_clinic_access: true,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.AUDITOR] = {
        role: permissions_1.HealthcareRole.AUDITOR,
        name: 'Auditor',
        description: 'Read-only access for compliance auditing',
        level: 50,
        category: 'compliance',
        permissions: [
            'audit.access.clinic',
            'compliance.report.cfm',
            'compliance.report.lgpd'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 60,
        multi_clinic_access: true,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.QUALITY_MANAGER] = {
        role: permissions_1.HealthcareRole.QUALITY_MANAGER,
        name: 'Quality Manager',
        description: 'Quality assurance and improvement management',
        level: 65,
        category: 'compliance',
        permissions: [
            'audit.access.clinic',
            'compliance.report.cfm',
            'compliance.report.lgpd',
            'license.monitor.expiration'
        ],
        inherited_from: [],
        can_delegate_to: [permissions_1.HealthcareRole.AUDITOR],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: true,
        audit_frequency_days: 60,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== PATIENT & FAMILY =====
    _a[permissions_1.HealthcareRole.PATIENT] = {
        role: permissions_1.HealthcareRole.PATIENT,
        name: 'Patient',
        description: 'Patient with access to own medical records',
        level: 10,
        category: 'patient',
        permissions: [
            'patient.read.own',
            'scheduling.manage.own'
        ],
        inherited_from: [],
        can_delegate_to: [permissions_1.HealthcareRole.PATIENT_FAMILY],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: false,
        requires_continuing_education: false,
        audit_frequency_days: 365,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.PATIENT_FAMILY] = {
        role: permissions_1.HealthcareRole.PATIENT_FAMILY,
        name: 'Patient Family Member',
        description: 'Family member with limited patient record access',
        level: 5,
        category: 'patient',
        permissions: [
            'patient.read.own'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: false,
        requires_continuing_education: false,
        audit_frequency_days: 365,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    // ===== EXTERNAL =====
    _a[permissions_1.HealthcareRole.GUEST] = {
        role: permissions_1.HealthcareRole.GUEST,
        name: 'Guest',
        description: 'Minimal access for temporary users',
        level: 1,
        category: 'external',
        permissions: [],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: false,
        requires_continuing_education: false,
        audit_frequency_days: 365,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a[permissions_1.HealthcareRole.VENDOR] = {
        role: permissions_1.HealthcareRole.VENDOR,
        name: 'Vendor',
        description: 'External vendor with limited system access',
        level: 15,
        category: 'external',
        permissions: [
            'equipment.operate.standard'
        ],
        inherited_from: [],
        can_delegate_to: [],
        requires_medical_license: false,
        requires_cfm_registration: false,
        allowed_specialties: [],
        requires_background_check: true,
        requires_continuing_education: false,
        audit_frequency_days: 90,
        multi_clinic_access: false,
        emergency_override_capable: false,
        can_approve_emergency_access: false,
        created_at: new Date(),
        updated_at: new Date()
    },
    _a);
// ============================================================================
// RBAC ENGINE CLASS
// ============================================================================
/**
 * Healthcare RBAC Engine with CFM Compliance
 */
var HealthcareRBACEngine = /** @class */ (function () {
    function HealthcareRBACEngine(supabaseClient) {
        this.permissionCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.supabase = supabaseClient;
    }
    /**
     * Check if user has specific permission with healthcare context
     */
    HealthcareRBACEngine.prototype.checkPermission = function (userId, permission, context) {
        return __awaiter(this, void 0, void 0, function () {
            var userContext, cacheKey, cached, roleDefinition, result_1, hasBasePermission, permissionDef, healthcareValidation, contextValidation, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getUserRoleContext(userId)];
                    case 1:
                        userContext = _a.sent();
                        if (!userContext) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, permissions_1.HealthcareRole.GUEST, 'User not found')];
                        }
                        cacheKey = "".concat(userId, ":").concat(permission, ":").concat(JSON.stringify(context));
                        cached = this.getFromCache(cacheKey);
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        roleDefinition = exports.HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
                        if (!roleDefinition) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, userContext.role, 'Role not found')];
                        }
                        if (!((context === null || context === void 0 ? void 0 : context.emergencyOverride) && roleDefinition.emergency_override_capable)) return [3 /*break*/, 3];
                        result_1 = this.createPermissionResult(true, permission, userId, userContext.role, 'Emergency override granted', { emergency_override: true });
                        this.setCache(cacheKey, result_1);
                        return [4 /*yield*/, this.logAuditTrail(result_1, context)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, result_1];
                    case 3:
                        hasBasePermission = roleDefinition.permissions.includes(permission);
                        if (!hasBasePermission) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, userContext.role, 'Permission not granted to role')];
                        }
                        permissionDef = (0, permissions_1.getPermission)(permission);
                        if (!permissionDef) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, userContext.role, 'Permission definition not found')];
                        }
                        return [4 /*yield*/, this.validateHealthcareRequirements(userContext, permissionDef)];
                    case 4:
                        healthcareValidation = _a.sent();
                        if (!healthcareValidation.valid) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, userContext.role, healthcareValidation.reason, {
                                    license_valid: healthcareValidation.license_valid,
                                    specialty_match: healthcareValidation.specialty_match,
                                    cfm_compliant: healthcareValidation.cfm_compliant
                                })];
                        }
                        return [4 /*yield*/, this.validateContext(userContext, permissionDef, context)];
                    case 5:
                        contextValidation = _a.sent();
                        if (!contextValidation.valid) {
                            return [2 /*return*/, this.createPermissionResult(false, permission, userId, userContext.role, contextValidation.reason)];
                        }
                        result = this.createPermissionResult(true, permission, userId, userContext.role, 'Permission granted', {
                            license_valid: healthcareValidation.license_valid,
                            specialty_match: healthcareValidation.specialty_match,
                            cfm_compliant: healthcareValidation.cfm_compliant,
                            lgpd_compliant: true
                        });
                        this.setCache(cacheKey, result);
                        return [4 /*yield*/, this.logAuditTrail(result, context)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 7:
                        error_1 = _a.sent();
                        console.error('Permission check error:', error_1);
                        return [2 /*return*/, this.createPermissionResult(false, permission, userId, permissions_1.HealthcareRole.GUEST, 'System error during permission check')];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check multiple permissions at once
     */
    HealthcareRBACEngine.prototype.checkPermissions = function (userId, permissions, context) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(permissions.map(function (permission) { return _this.checkPermission(userId, permission, context); }))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Get user's effective permissions (including inherited)
     */
    HealthcareRBACEngine.prototype.getUserEffectivePermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userContext, roleDefinition, permissions, _i, _a, inheritedRole, inheritedRoleDef;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getUserRoleContext(userId)];
                    case 1:
                        userContext = _b.sent();
                        if (!userContext)
                            return [2 /*return*/, []];
                        roleDefinition = exports.HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
                        if (!roleDefinition)
                            return [2 /*return*/, []];
                        permissions = new Set(roleDefinition.permissions);
                        // Add inherited permissions
                        for (_i = 0, _a = roleDefinition.inherited_from; _i < _a.length; _i++) {
                            inheritedRole = _a[_i];
                            inheritedRoleDef = exports.HEALTHCARE_ROLE_DEFINITIONS[inheritedRole];
                            if (inheritedRoleDef) {
                                inheritedRoleDef.permissions.forEach(function (p) { return permissions.add(p); });
                            }
                        }
                        return [2 /*return*/, Array.from(permissions)];
                }
            });
        });
    };
    /**
     * Grant temporary access with expiry
     */
    HealthcareRBACEngine.prototype.grantTemporaryAccess = function (userId, grantedBy, permissions, expiresAt, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var granterContext, granterRole, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getUserRoleContext(grantedBy)];
                    case 1:
                        granterContext = _a.sent();
                        if (!granterContext)
                            return [2 /*return*/, false];
                        granterRole = exports.HEALTHCARE_ROLE_DEFINITIONS[granterContext.role];
                        if (!granterRole.can_approve_emergency_access)
                            return [2 /*return*/, false];
                        if (!this.supabase) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.supabase.from('temporary_access').insert({
                                user_id: userId,
                                granted_by: grantedBy,
                                permissions: permissions,
                                expires_at: expiresAt.toISOString(),
                                reason: reason,
                                active: true
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // Clear cache for user
                        this.clearUserCache(userId);
                        return [2 /*return*/, true];
                    case 4:
                        error_2 = _a.sent();
                        console.error('Grant temporary access error:', error_2);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke access immediately
     */
    HealthcareRBACEngine.prototype.revokeAccess = function (userId, revokedBy, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var revokerContext, revokerRole, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getUserRoleContext(revokedBy)];
                    case 1:
                        revokerContext = _a.sent();
                        if (!revokerContext)
                            return [2 /*return*/, false];
                        revokerRole = exports.HEALTHCARE_ROLE_DEFINITIONS[revokerContext.role];
                        if (!revokerRole.can_approve_emergency_access)
                            return [2 /*return*/, false];
                        if (!this.supabase) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('user_roles')
                                .update({ active: false, revoked_at: new Date().toISOString(), revoked_by: revokedBy, revoke_reason: reason })
                                .eq('user_id', userId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('temporary_access')
                                .update({ active: false, revoked_at: new Date().toISOString(), revoked_by: revokedBy, revoke_reason: reason })
                                .eq('user_id', userId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Clear cache
                        this.clearUserCache(userId);
                        return [2 /*return*/, true];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Revoke access error:', error_3);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    HealthcareRBACEngine.prototype.getUserRoleContext = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!this.supabase)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.supabase
                                .from('user_roles')
                                .select('*')
                                .eq('user_id', userId)
                                .eq('active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, exports.UserRoleContextSchema.parse(data)];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Get user role context error:', error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    HealthcareRBACEngine.prototype.validateHealthcareRequirements = function (userContext, permission) {
        return __awaiter(this, void 0, void 0, function () {
            var specialtyMatch;
            return __generator(this, function (_a) {
                // Check medical license requirement
                if (permission.requires_license && !userContext.medical_license) {
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Medical license required',
                            license_valid: false,
                            specialty_match: true,
                            cfm_compliant: false
                        }];
                }
                // Check license expiry
                if (userContext.license_expiry && userContext.license_expiry < new Date()) {
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Medical license expired',
                            license_valid: false,
                            specialty_match: true,
                            cfm_compliant: false
                        }];
                }
                // Check license active status
                if (permission.requires_license && !userContext.license_active) {
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Medical license not active',
                            license_valid: false,
                            specialty_match: true,
                            cfm_compliant: false
                        }];
                }
                specialtyMatch = this.checkSpecialtyRequirement(userContext, permission);
                if (!specialtyMatch) {
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'Medical specialty not authorized for this procedure',
                            license_valid: true,
                            specialty_match: false,
                            cfm_compliant: true
                        }];
                }
                // CFM compliance check
                if (permission.cfm_compliance && !userContext.cfm_number) {
                    return [2 /*return*/, {
                            valid: false,
                            reason: 'CFM registration required',
                            license_valid: true,
                            specialty_match: true,
                            cfm_compliant: false
                        }];
                }
                return [2 /*return*/, {
                        valid: true,
                        reason: 'Healthcare requirements validated',
                        license_valid: true,
                        specialty_match: true,
                        cfm_compliant: true
                    }];
            });
        });
    };
    HealthcareRBACEngine.prototype.checkSpecialtyRequirement = function (userContext, permission) {
        if (permission.requires_specialty.length === 0)
            return true;
        if (!userContext.medical_specialty && userContext.additional_specialties.length === 0)
            return false;
        var userSpecialties = __spreadArray(__spreadArray([], (userContext.medical_specialty ? [userContext.medical_specialty] : []), true), userContext.additional_specialties, true);
        return permission.requires_specialty.some(function (required) { return userSpecialties.includes(required); });
    };
    HealthcareRBACEngine.prototype.validateContext = function (userContext, permission, context) {
        return __awaiter(this, void 0, void 0, function () {
            var roleDefinition, hasPatientRelationship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Clinic context validation
                        if ((context === null || context === void 0 ? void 0 : context.clinicId) && context.clinicId !== userContext.clinic_id) {
                            roleDefinition = exports.HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
                            if (!roleDefinition.multi_clinic_access) {
                                return [2 /*return*/, { valid: false, reason: 'Cross-clinic access not authorized' }];
                            }
                        }
                        if (!((context === null || context === void 0 ? void 0 : context.patientId) && permission.scope === 'own')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.checkPatientRelationship(userContext.user_id, context.patientId)];
                    case 1:
                        hasPatientRelationship = _a.sent();
                        if (!hasPatientRelationship) {
                            return [2 /*return*/, { valid: false, reason: 'No authorized relationship with patient' }];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, { valid: true, reason: 'Context validated' }];
                }
            });
        });
    };
    HealthcareRBACEngine.prototype.checkPatientRelationship = function (userId, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.supabase)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.supabase
                                .from('patient_relationships')
                                .select('id')
                                .eq('healthcare_provider_id', userId)
                                .eq('patient_id', patientId)
                                .eq('active', true)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        return [2 /*return*/, !error && !!data];
                }
            });
        });
    };
    HealthcareRBACEngine.prototype.createPermissionResult = function (granted, permission, userId, role, reason, additionalData) {
        if (additionalData === void 0) { additionalData = {}; }
        return __assign({ granted: granted, permission: permission, user_id: userId, role: role, reason: reason, requires_validation: false, emergency_override: false, license_valid: true, specialty_match: true, cfm_compliant: true, lgpd_compliant: true, checked_at: new Date() }, additionalData);
    };
    HealthcareRBACEngine.prototype.logAuditTrail = function (result, context) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.supabase)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.supabase.from('audit_logs').insert({
                                user_id: result.user_id,
                                action: 'permission_check',
                                resource: result.permission,
                                result: result.granted ? 'granted' : 'denied',
                                reason: result.reason,
                                context: context,
                                emergency_override: result.emergency_override,
                                timestamp: result.checked_at
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Audit trail logging error:', error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    HealthcareRBACEngine.prototype.getFromCache = function (key) {
        var cached = this.permissionCache.get(key);
        if (!cached || cached.length === 0)
            return null;
        var result = cached[0];
        var age = Date.now() - result.checked_at.getTime();
        if (age > this.cacheExpiry) {
            this.permissionCache.delete(key);
            return null;
        }
        return result;
    };
    HealthcareRBACEngine.prototype.setCache = function (key, result) {
        this.permissionCache.set(key, [result]);
    };
    HealthcareRBACEngine.prototype.clearUserCache = function (userId) {
        var _this = this;
        var keysToDelete = Array.from(this.permissionCache.keys()).filter(function (key) { return key.startsWith("".concat(userId, ":")); });
        keysToDelete.forEach(function (key) { return _this.permissionCache.delete(key); });
    };
    return HealthcareRBACEngine;
}());
exports.HealthcareRBACEngine = HealthcareRBACEngine;
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Get role definition by role
 */
function getRoleDefinition(role) {
    return exports.HEALTHCARE_ROLE_DEFINITIONS[role];
}
/**
 * Get roles by category
 */
function getRolesByCategory(category) {
    return Object.values(exports.HEALTHCARE_ROLE_DEFINITIONS).filter(function (role) { return role.category === category; });
}
/**
 * Get roles requiring medical license
 */
function getLicenseRequiredRoles() {
    return Object.values(exports.HEALTHCARE_ROLE_DEFINITIONS).filter(function (role) { return role.requires_medical_license; });
}
/**
 * Get roles by hierarchy level
 */
function getRolesByLevel(minLevel, maxLevel) {
    return Object.values(exports.HEALTHCARE_ROLE_DEFINITIONS).filter(function (role) {
        return role.level >= minLevel && (!maxLevel || role.level <= maxLevel);
    });
}
/**
 * Check if role can delegate to another role
 */
function canDelegate(fromRole, toRole) {
    var fromRoleDef = exports.HEALTHCARE_ROLE_DEFINITIONS[fromRole];
    return (fromRoleDef === null || fromRoleDef === void 0 ? void 0 : fromRoleDef.can_delegate_to.includes(toRole)) || false;
}
/**
 * Get role hierarchy path
 */
function getRoleHierarchyPath(role) {
    var roleDef = exports.HEALTHCARE_ROLE_DEFINITIONS[role];
    if (!roleDef)
        return [];
    var path = [role];
    for (var _i = 0, _a = roleDef.inherited_from; _i < _a.length; _i++) {
        var inherited = _a[_i];
        path.push.apply(path, getRoleHierarchyPath(inherited));
    }
    return Array.from(new Set(path));
}
exports.default = HealthcareRBACEngine;
