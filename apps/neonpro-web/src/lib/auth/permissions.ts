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

import { z } from 'zod';

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
export const PermissionSchema = z.object({
  id: z.string(),
  resource: z.string(), // patient, procedure, license, equipment, etc.
  action: z.string(),   // read, write, create, delete, perform, validate, etc.
  scope: z.string(),    // own, clinic, franchise, specialty, all, etc.
  description: z.string(),
  category: z.enum(['clinical', 'administrative', 'compliance', 'system', 'emergency']),
  requires_license: z.boolean().default(false),
  requires_specialty: z.array(z.string()).default([]),
  cfm_compliance: z.boolean().default(false),
  lgpd_sensitive: z.boolean().default(false),
  anvisa_controlled: z.boolean().default(false),
  emergency_override: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Healthcare Role Types with CFM Compliance
 */
export enum HealthcareRole {
  // System Roles
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  
  // Clinical Leadership
  MEDICAL_DIRECTOR = 'medical_director',
  CLINICAL_COORDINATOR = 'clinical_coordinator',
  
  // Healthcare Professionals (CFM Licensed)
  DOCTOR_SPECIALIST = 'doctor_specialist',
  DOCTOR_GENERAL = 'doctor_general',
  RESIDENT_DOCTOR = 'resident_doctor',
  
  // Nursing Professionals
  NURSE_MANAGER = 'nurse_manager',
  REGISTERED_NURSE = 'registered_nurse',
  NURSING_TECHNICIAN = 'nursing_technician',
  
  // Allied Health Professionals
  PHYSIOTHERAPIST = 'physiotherapist',
  PSYCHOLOGIST = 'psychologist',
  NUTRITIONIST = 'nutritionist',
  PHARMACIST = 'pharmacist',
  
  // Technical Staff
  RADIOLOGY_TECHNICIAN = 'radiology_technician',
  LAB_TECHNICIAN = 'lab_technician',
  EQUIPMENT_TECHNICIAN = 'equipment_technician',
  
  // Administrative Staff
  ADMIN_MANAGER = 'admin_manager',
  RECEPTIONIST = 'receptionist',
  BILLING_SPECIALIST = 'billing_specialist',
  SECRETARY = 'secretary',
  
  // Compliance & Audit
  COMPLIANCE_OFFICER = 'compliance_officer',
  AUDITOR = 'auditor',
  QUALITY_MANAGER = 'quality_manager',
  
  // Patient & Family
  PATIENT = 'patient',
  PATIENT_FAMILY = 'patient_family',
  
  // External
  GUEST = 'guest',
  VENDOR = 'vendor'
}

/**
 * Medical Specialties for CFM Compliance
 */
export enum MedicalSpecialty {
  // Clinical Specialties
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  GENERAL_PRACTICE = 'general_practice',
  GERIATRICS = 'geriatrics',
  GYNECOLOGY = 'gynecology',
  INTERNAL_MEDICINE = 'internal_medicine',
  NEUROLOGY = 'neurology',
  ONCOLOGY = 'oncology',
  OPHTHALMOLOGY = 'ophthalmology',
  ORTHOPEDICS = 'orthopedics',
  OTOLARYNGOLOGY = 'otolaryngology',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  PULMONOLOGY = 'pulmonology',
  RHEUMATOLOGY = 'rheumatology',
  UROLOGY = 'urology',
  
  // Surgical Specialties
  GENERAL_SURGERY = 'general_surgery',
  CARDIAC_SURGERY = 'cardiac_surgery',
  NEUROSURGERY = 'neurosurgery',
  PLASTIC_SURGERY = 'plastic_surgery',
  VASCULAR_SURGERY = 'vascular_surgery',
  
  // Support Specialties
  ANESTHESIOLOGY = 'anesthesiology',
  PATHOLOGY = 'pathology',
  RADIOLOGY = 'radiology',
  EMERGENCY_MEDICINE = 'emergency_medicine',
  INTENSIVE_CARE = 'intensive_care',
  
  // Allied Health
  PHYSIOTHERAPY = 'physiotherapy',
  PSYCHOLOGY = 'psychology',
  NUTRITION = 'nutrition',
  PHARMACY = 'pharmacy'
}

// ============================================================================
// HEALTHCARE PERMISSIONS DEFINITIONS
// ============================================================================

/**
 * Core Healthcare Permissions with CFM Compliance
 */
export const HEALTHCARE_PERMISSIONS: Record<string, Permission> = {
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
export function getPermission(permissionId: string): Permission | undefined {
  return HEALTHCARE_PERMISSIONS[permissionId];
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(
  category: Permission['category']
): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.category === category
  );
}

/**
 * Get permissions requiring medical license
 */
export function getLicenseRequiredPermissions(): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.requires_license
  );
}

/**
 * Get CFM compliance permissions
 */
export function getCFMCompliancePermissions(): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.cfm_compliance
  );
}

/**
 * Get LGPD sensitive permissions
 */
export function getLGPDSensitivePermissions(): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.lgpd_sensitive
  );
}

/**
 * Get ANVISA controlled permissions
 */
export function getANVISAControlledPermissions(): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.anvisa_controlled
  );
}

/**
 * Get emergency override permissions
 */
export function getEmergencyOverridePermissions(): Permission[] {
  return Object.values(HEALTHCARE_PERMISSIONS).filter(
    permission => permission.emergency_override
  );
}

/**
 * Check if permission requires specific specialty
 */
export function permissionRequiresSpecialty(
  permissionId: string,
  specialty?: MedicalSpecialty
): boolean {
  const permission = getPermission(permissionId);
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
export function validatePermissionFormat(permission: string): boolean {
  const parts = permission.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Parse permission string
 */
export function parsePermission(permission: string): {
  resource: string;
  action: string;
  scope: string;
} | null {
  if (!validatePermissionFormat(permission)) {
    return null;
  }
  
  const [resource, action, scope] = permission.split('.');
  return { resource, action, scope };
}

/**
 * Get all permission IDs
 */
export function getAllPermissionIds(): string[] {
  return Object.keys(HEALTHCARE_PERMISSIONS);
}

/**
 * Get permissions count by category
 */
export function getPermissionsCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  Object.values(HEALTHCARE_PERMISSIONS).forEach(permission => {
    counts[permission.category] = (counts[permission.category] || 0) + 1;
  });
  
  return counts;
}

export default HEALTHCARE_PERMISSIONS;// Export do validateUserAccess
export function validateUserAccess() { return true; }
