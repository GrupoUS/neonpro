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

import { z } from 'zod';
import {
  getPermission,
  HEALTHCARE_PERMISSIONS,
  HealthcareRole,
  MedicalSpecialty,
  type Permission,
} from './permissions';

// ============================================================================
// CORE RBAC TYPES & SCHEMAS
// ============================================================================

/**
 * User Role Context with Healthcare-Specific Information
 */
export const UserRoleContextSchema = z.object({
  user_id: z.string().uuid(),
  role: z.nativeEnum(HealthcareRole),
  clinic_id: z.string().uuid(),
  franchise_id: z.string().uuid().optional(),

  // Medical Professional Information
  medical_license: z.string().optional(),
  cfm_number: z.string().optional(),
  medical_specialty: z.nativeEnum(MedicalSpecialty).optional(),
  license_expiry: z.date().optional(),
  license_active: z.boolean().default(true),

  // Additional Specialties/Certifications
  additional_specialties: z.array(z.nativeEnum(MedicalSpecialty)).default([]),
  certifications: z.array(z.string()).default([]),

  // Access Context
  active: z.boolean().default(true),
  temporary_access: z.boolean().default(false),
  emergency_access: z.boolean().default(false),
  access_granted_at: z.date().default(() => new Date()),
  access_expires_at: z.date().optional(),

  // Audit Information
  granted_by: z.string().uuid().optional(),
  last_validated: z.date().default(() => new Date()),
  validation_required: z.boolean().default(false),

  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export type UserRoleContext = z.infer<typeof UserRoleContextSchema>;

/**
 * Role Definition with Hierarchy and Permissions
 */
export const RoleDefinitionSchema = z.object({
  role: z.nativeEnum(HealthcareRole),
  name: z.string(),
  description: z.string(),
  level: z.number(), // Hierarchy level (higher = more privileges)
  category: z.enum([
    'system',
    'clinical',
    'administrative',
    'compliance',
    'patient',
    'external',
  ]),

  // Permission Management
  permissions: z.array(z.string()),
  inherited_from: z.array(z.nativeEnum(HealthcareRole)).default([]),
  can_delegate_to: z.array(z.nativeEnum(HealthcareRole)).default([]),

  // Healthcare-Specific Requirements
  requires_medical_license: z.boolean().default(false),
  requires_cfm_registration: z.boolean().default(false),
  allowed_specialties: z.array(z.nativeEnum(MedicalSpecialty)).default([]),

  // Compliance Requirements
  requires_background_check: z.boolean().default(false),
  requires_continuing_education: z.boolean().default(false),
  audit_frequency_days: z.number().default(90),

  // Access Control
  multi_clinic_access: z.boolean().default(false),
  emergency_override_capable: z.boolean().default(false),
  can_approve_emergency_access: z.boolean().default(false),

  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;

/**
 * Permission Check Result
 */
export const PermissionCheckResultSchema = z.object({
  granted: z.boolean(),
  permission: z.string(),
  user_id: z.string(),
  role: z.nativeEnum(HealthcareRole),
  reason: z.string(),

  // Context Information
  clinic_id: z.string().optional(),
  requires_validation: z.boolean().default(false),
  emergency_override: z.boolean().default(false),

  // Compliance Checks
  license_valid: z.boolean().default(true),
  specialty_match: z.boolean().default(true),
  cfm_compliant: z.boolean().default(true),
  lgpd_compliant: z.boolean().default(true),

  // Audit Trail
  checked_at: z.date().default(() => new Date()),
  audit_log_id: z.string().optional(),
});

export type PermissionCheckResult = z.infer<typeof PermissionCheckResultSchema>;

// ============================================================================
// HEALTHCARE ROLE DEFINITIONS
// ============================================================================

/**
 * Complete Healthcare Role Hierarchy with Permissions
 */
export const HEALTHCARE_ROLE_DEFINITIONS: Record<
  HealthcareRole,
  RoleDefinition
> = {
  // ===== SYSTEM ROLES =====
  [HealthcareRole.SUPER_ADMIN]: {
    role: HealthcareRole.SUPER_ADMIN,
    name: 'Super Administrator',
    description: 'System-wide administrative access with all permissions',
    level: 100,
    category: 'system',
    permissions: Object.keys(HEALTHCARE_PERMISSIONS),
    inherited_from: [],
    can_delegate_to: Object.values(HealthcareRole),
    requires_medical_license: false,
    requires_cfm_registration: false,
    allowed_specialties: Object.values(MedicalSpecialty),
    requires_background_check: true,
    requires_continuing_education: false,
    audit_frequency_days: 30,
    multi_clinic_access: true,
    emergency_override_capable: true,
    can_approve_emergency_access: true,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.SYSTEM_ADMIN]: {
    role: HealthcareRole.SYSTEM_ADMIN,
    name: 'System Administrator',
    description: 'Technical system administration without clinical access',
    level: 90,
    category: 'system',
    permissions: [
      'system.manage.users',
      'system.configure.clinic',
      'audit.access.clinic',
      'compliance.report.lgpd',
      'scheduling.manage.clinic',
    ],
    inherited_from: [],
    can_delegate_to: [
      HealthcareRole.ADMIN_MANAGER,
      HealthcareRole.COMPLIANCE_OFFICER,
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
    updated_at: new Date(),
  },

  // ===== CLINICAL LEADERSHIP =====
  [HealthcareRole.MEDICAL_DIRECTOR]: {
    role: HealthcareRole.MEDICAL_DIRECTOR,
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
      'system.configure.clinic',
    ],
    inherited_from: [],
    can_delegate_to: [
      HealthcareRole.CLINICAL_COORDINATOR,
      HealthcareRole.DOCTOR_SPECIALIST,
      HealthcareRole.DOCTOR_GENERAL,
      HealthcareRole.NURSE_MANAGER,
    ],
    requires_medical_license: true,
    requires_cfm_registration: true,
    allowed_specialties: Object.values(MedicalSpecialty),
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 30,
    multi_clinic_access: true,
    emergency_override_capable: true,
    can_approve_emergency_access: true,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.CLINICAL_COORDINATOR]: {
    role: HealthcareRole.CLINICAL_COORDINATOR,
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
      'compliance.report.cfm',
    ],
    inherited_from: [HealthcareRole.REGISTERED_NURSE],
    can_delegate_to: [
      HealthcareRole.REGISTERED_NURSE,
      HealthcareRole.NURSING_TECHNICIAN,
    ],
    requires_medical_license: true,
    requires_cfm_registration: true,
    allowed_specialties: [MedicalSpecialty.GENERAL_PRACTICE],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 60,
    multi_clinic_access: false,
    emergency_override_capable: true,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ===== HEALTHCARE PROFESSIONALS (CFM Licensed) =====
  [HealthcareRole.DOCTOR_SPECIALIST]: {
    role: HealthcareRole.DOCTOR_SPECIALIST,
    name: 'Specialist Doctor',
    description:
      'Medical specialist with specialty-specific procedure authorization',
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
      'emergency.override.access',
    ],
    inherited_from: [HealthcareRole.DOCTOR_GENERAL],
    can_delegate_to: [
      HealthcareRole.RESIDENT_DOCTOR,
      HealthcareRole.REGISTERED_NURSE,
    ],
    requires_medical_license: true,
    requires_cfm_registration: true,
    allowed_specialties: Object.values(MedicalSpecialty),
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 60,
    multi_clinic_access: false,
    emergency_override_capable: true,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.DOCTOR_GENERAL]: {
    role: HealthcareRole.DOCTOR_GENERAL,
    name: 'General Practitioner',
    description:
      'General practice physician with standard clinical permissions',
    level: 70,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.general',
      'prescription.create.standard',
      'equipment.operate.standard',
      'scheduling.manage.own',
      'emergency.override.access',
    ],
    inherited_from: [],
    can_delegate_to: [
      HealthcareRole.RESIDENT_DOCTOR,
      HealthcareRole.REGISTERED_NURSE,
    ],
    requires_medical_license: true,
    requires_cfm_registration: true,
    allowed_specialties: [MedicalSpecialty.GENERAL_PRACTICE],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: true,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.RESIDENT_DOCTOR]: {
    role: HealthcareRole.RESIDENT_DOCTOR,
    name: 'Resident Doctor',
    description: 'Medical resident with supervised clinical permissions',
    level: 60,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.general',
      'equipment.operate.standard',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: true,
    allowed_specialties: [MedicalSpecialty.GENERAL_PRACTICE],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 30,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ===== NURSING PROFESSIONALS =====
  [HealthcareRole.NURSE_MANAGER]: {
    role: HealthcareRole.NURSE_MANAGER,
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
      'audit.access.clinic',
    ],
    inherited_from: [HealthcareRole.REGISTERED_NURSE],
    can_delegate_to: [
      HealthcareRole.REGISTERED_NURSE,
      HealthcareRole.NURSING_TECHNICIAN,
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
    updated_at: new Date(),
  },

  [HealthcareRole.REGISTERED_NURSE]: {
    role: HealthcareRole.REGISTERED_NURSE,
    name: 'Registered Nurse',
    description: 'Licensed nursing professional with clinical care permissions',
    level: 55,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.general',
      'equipment.operate.standard',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [HealthcareRole.NURSING_TECHNICIAN],
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
    updated_at: new Date(),
  },

  [HealthcareRole.NURSING_TECHNICIAN]: {
    role: HealthcareRole.NURSING_TECHNICIAN,
    name: 'Nursing Technician',
    description: 'Nursing support with basic clinical permissions',
    level: 45,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'equipment.operate.standard',
      'scheduling.manage.own',
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
    updated_at: new Date(),
  },

  // ===== ALLIED HEALTH PROFESSIONALS =====
  [HealthcareRole.PHYSIOTHERAPIST]: {
    role: HealthcareRole.PHYSIOTHERAPIST,
    name: 'Physiotherapist',
    description: 'Physical therapy professional with specialty permissions',
    level: 50,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.specialty',
      'equipment.operate.standard',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false, // COFFITO registration
    allowed_specialties: [MedicalSpecialty.PHYSIOTHERAPY],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.PSYCHOLOGIST]: {
    role: HealthcareRole.PSYCHOLOGIST,
    name: 'Psychologist',
    description:
      'Mental health professional with psychological care permissions',
    level: 50,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.specialty',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false, // CRP registration
    allowed_specialties: [MedicalSpecialty.PSYCHOLOGY],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.NUTRITIONIST]: {
    role: HealthcareRole.NUTRITIONIST,
    name: 'Nutritionist',
    description: 'Nutrition professional with dietary care permissions',
    level: 50,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'patient.write.own',
      'procedure.perform.specialty',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false, // CRN registration
    allowed_specialties: [MedicalSpecialty.NUTRITION],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.PHARMACIST]: {
    role: HealthcareRole.PHARMACIST,
    name: 'Pharmacist',
    description:
      'Pharmaceutical professional with medication management permissions',
    level: 55,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'prescription.create.standard',
      'prescription.create.controlled',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false, // CRF registration
    allowed_specialties: [MedicalSpecialty.PHARMACY],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 60,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  // ===== TECHNICAL STAFF =====
  [HealthcareRole.RADIOLOGY_TECHNICIAN]: {
    role: HealthcareRole.RADIOLOGY_TECHNICIAN,
    name: 'Radiology Technician',
    description:
      'Medical imaging technician with equipment operation permissions',
    level: 40,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'equipment.operate.standard',
      'equipment.operate.advanced',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false,
    allowed_specialties: [MedicalSpecialty.RADIOLOGY],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.LAB_TECHNICIAN]: {
    role: HealthcareRole.LAB_TECHNICIAN,
    name: 'Laboratory Technician',
    description: 'Laboratory technician with specimen processing permissions',
    level: 40,
    category: 'clinical',
    permissions: [
      'patient.read.own',
      'equipment.operate.standard',
      'scheduling.manage.own',
    ],
    inherited_from: [],
    can_delegate_to: [],
    requires_medical_license: true,
    requires_cfm_registration: false,
    allowed_specialties: [MedicalSpecialty.PATHOLOGY],
    requires_background_check: true,
    requires_continuing_education: true,
    audit_frequency_days: 90,
    multi_clinic_access: false,
    emergency_override_capable: false,
    can_approve_emergency_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  },

  [HealthcareRole.EQUIPMENT_TECHNICIAN]: {
    role: HealthcareRole.EQUIPMENT_TECHNICIAN,
    name: 'Equipment Technician',
    description: 'Medical equipment maintenance and operation technician',
    level: 35,
    category: 'clinical',
    permissions: [
      'equipment.operate.standard',
      'equipment.operate.advanced',
      'scheduling.manage.own',
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
    updated_at: new Date(),
  },

  // ===== ADMINISTRATIVE STAFF =====
  [HealthcareRole.ADMIN_MANAGER]: {
    role: HealthcareRole.ADMIN_MANAGER,
    name: 'Administrative Manager',
    description: 'Administrative operations management',
    level: 60,
    category: 'administrative',
    permissions: [
      'patient.create.clinic',
      'scheduling.manage.clinic',
      'billing.process.standard',
      'audit.access.clinic',
      'system.configure.clinic',
    ],
    inherited_from: [],
    can_delegate_to: [
      HealthcareRole.RECEPTIONIST,
      HealthcareRole.BILLING_SPECIALIST,
      HealthcareRole.SECRETARY,
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
    updated_at: new Date(),
  },

  [HealthcareRole.RECEPTIONIST]: {
    role: HealthcareRole.RECEPTIONIST,
    name: 'Receptionist',
    description: 'Front desk operations and patient scheduling',
    level: 30,
    category: 'administrative',
    permissions: [
      'patient.create.clinic',
      'scheduling.manage.clinic',
      'billing.process.standard',
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
    updated_at: new Date(),
  },

  [HealthcareRole.BILLING_SPECIALIST]: {
    role: HealthcareRole.BILLING_SPECIALIST,
    name: 'Billing Specialist',
    description: 'Medical billing and insurance processing',
    level: 35,
    category: 'administrative',
    permissions: ['billing.process.standard', 'scheduling.manage.own'],
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
    updated_at: new Date(),
  },

  [HealthcareRole.SECRETARY]: {
    role: HealthcareRole.SECRETARY,
    name: 'Secretary',
    description: 'Administrative support and documentation',
    level: 25,
    category: 'administrative',
    permissions: ['scheduling.manage.own'],
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
    updated_at: new Date(),
  },

  // ===== COMPLIANCE & AUDIT =====
  [HealthcareRole.COMPLIANCE_OFFICER]: {
    role: HealthcareRole.COMPLIANCE_OFFICER,
    name: 'Compliance Officer',
    description: 'Regulatory compliance monitoring and reporting',
    level: 70,
    category: 'compliance',
    permissions: [
      'audit.access.clinic',
      'compliance.report.cfm',
      'compliance.report.lgpd',
      'license.validate.cfm',
      'license.monitor.expiration',
    ],
    inherited_from: [],
    can_delegate_to: [HealthcareRole.AUDITOR],
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
    updated_at: new Date(),
  },

  [HealthcareRole.AUDITOR]: {
    role: HealthcareRole.AUDITOR,
    name: 'Auditor',
    description: 'Read-only access for compliance auditing',
    level: 50,
    category: 'compliance',
    permissions: [
      'audit.access.clinic',
      'compliance.report.cfm',
      'compliance.report.lgpd',
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
    updated_at: new Date(),
  },

  [HealthcareRole.QUALITY_MANAGER]: {
    role: HealthcareRole.QUALITY_MANAGER,
    name: 'Quality Manager',
    description: 'Quality assurance and improvement management',
    level: 65,
    category: 'compliance',
    permissions: [
      'audit.access.clinic',
      'compliance.report.cfm',
      'compliance.report.lgpd',
      'license.monitor.expiration',
    ],
    inherited_from: [],
    can_delegate_to: [HealthcareRole.AUDITOR],
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
    updated_at: new Date(),
  },

  // ===== PATIENT & FAMILY =====
  [HealthcareRole.PATIENT]: {
    role: HealthcareRole.PATIENT,
    name: 'Patient',
    description: 'Patient with access to own medical records',
    level: 10,
    category: 'patient',
    permissions: ['patient.read.own', 'scheduling.manage.own'],
    inherited_from: [],
    can_delegate_to: [HealthcareRole.PATIENT_FAMILY],
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
    updated_at: new Date(),
  },

  [HealthcareRole.PATIENT_FAMILY]: {
    role: HealthcareRole.PATIENT_FAMILY,
    name: 'Patient Family Member',
    description: 'Family member with limited patient record access',
    level: 5,
    category: 'patient',
    permissions: ['patient.read.own'],
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
    updated_at: new Date(),
  },

  // ===== EXTERNAL =====
  [HealthcareRole.GUEST]: {
    role: HealthcareRole.GUEST,
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
    updated_at: new Date(),
  },

  [HealthcareRole.VENDOR]: {
    role: HealthcareRole.VENDOR,
    name: 'Vendor',
    description: 'External vendor with limited system access',
    level: 15,
    category: 'external',
    permissions: ['equipment.operate.standard'],
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
    updated_at: new Date(),
  },
};

// ============================================================================
// RBAC ENGINE CLASS
// ============================================================================

/**
 * Healthcare RBAC Engine with CFM Compliance
 */
export class HealthcareRBACEngine {
  private supabase: any;
  private permissionCache: Map<string, PermissionCheckResult[]> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Check if user has specific permission with healthcare context
   */
  async checkPermission(
    userId: string,
    permission: string,
    context?: {
      clinicId?: string;
      patientId?: string;
      emergencyOverride?: boolean;
    }
  ): Promise<PermissionCheckResult> {
    try {
      // Get user role context
      const userContext = await this.getUserRoleContext(userId);
      if (!userContext) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          HealthcareRole.GUEST,
          'User not found'
        );
      }

      // Check cache first
      const cacheKey = `${userId}:${permission}:${JSON.stringify(context)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get role definition
      const roleDefinition = HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
      if (!roleDefinition) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          userContext.role,
          'Role not found'
        );
      }

      // Emergency override check
      if (
        context?.emergencyOverride &&
        roleDefinition.emergency_override_capable
      ) {
        const result = this.createPermissionResult(
          true,
          permission,
          userId,
          userContext.role,
          'Emergency override granted',
          { emergency_override: true }
        );
        this.setCache(cacheKey, result);
        await this.logAuditTrail(result, context);
        return result;
      }

      // Check base permission
      const hasBasePermission = roleDefinition.permissions.includes(permission);
      if (!hasBasePermission) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          userContext.role,
          'Permission not granted to role'
        );
      }

      // Get permission definition
      const permissionDef = getPermission(permission);
      if (!permissionDef) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          userContext.role,
          'Permission definition not found'
        );
      }

      // Healthcare-specific validation
      const healthcareValidation = await this.validateHealthcareRequirements(
        userContext,
        permissionDef
      );
      if (!healthcareValidation.valid) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          userContext.role,
          healthcareValidation.reason,
          {
            license_valid: healthcareValidation.license_valid,
            specialty_match: healthcareValidation.specialty_match,
            cfm_compliant: healthcareValidation.cfm_compliant,
          }
        );
      }

      // Context-specific validation
      const contextValidation = await this.validateContext(
        userContext,
        permissionDef,
        context
      );
      if (!contextValidation.valid) {
        return this.createPermissionResult(
          false,
          permission,
          userId,
          userContext.role,
          contextValidation.reason
        );
      }

      // Permission granted
      const result = this.createPermissionResult(
        true,
        permission,
        userId,
        userContext.role,
        'Permission granted',
        {
          license_valid: healthcareValidation.license_valid,
          specialty_match: healthcareValidation.specialty_match,
          cfm_compliant: healthcareValidation.cfm_compliant,
          lgpd_compliant: true,
        }
      );

      this.setCache(cacheKey, result);
      await this.logAuditTrail(result, context);
      return result;
    } catch (error) {
      console.error('Permission check error:', error);
      return this.createPermissionResult(
        false,
        permission,
        userId,
        HealthcareRole.GUEST,
        'System error during permission check'
      );
    }
  }

  /**
   * Check multiple permissions at once
   */
  async checkPermissions(
    userId: string,
    permissions: string[],
    context?: {
      clinicId?: string;
      patientId?: string;
      emergencyOverride?: boolean;
    }
  ): Promise<PermissionCheckResult[]> {
    const results = await Promise.all(
      permissions.map((permission) =>
        this.checkPermission(userId, permission, context)
      )
    );
    return results;
  }

  /**
   * Get user's effective permissions (including inherited)
   */
  async getUserEffectivePermissions(userId: string): Promise<string[]> {
    const userContext = await this.getUserRoleContext(userId);
    if (!userContext) return [];

    const roleDefinition = HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
    if (!roleDefinition) return [];

    // Start with role permissions
    const permissions = new Set(roleDefinition.permissions);

    // Add inherited permissions
    for (const inheritedRole of roleDefinition.inherited_from) {
      const inheritedRoleDef = HEALTHCARE_ROLE_DEFINITIONS[inheritedRole];
      if (inheritedRoleDef) {
        inheritedRoleDef.permissions.forEach((p) => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  /**
   * Grant temporary access with expiry
   */
  async grantTemporaryAccess(
    userId: string,
    grantedBy: string,
    permissions: string[],
    expiresAt: Date,
    reason: string
  ): Promise<boolean> {
    try {
      // Validate granter has authority
      const granterContext = await this.getUserRoleContext(grantedBy);
      if (!granterContext) return false;

      const granterRole = HEALTHCARE_ROLE_DEFINITIONS[granterContext.role];
      if (!granterRole.can_approve_emergency_access) return false;

      // Create temporary access record
      if (this.supabase) {
        await this.supabase.from('temporary_access').insert({
          user_id: userId,
          granted_by: grantedBy,
          permissions,
          expires_at: expiresAt.toISOString(),
          reason,
          active: true,
        });
      }

      // Clear cache for user
      this.clearUserCache(userId);

      return true;
    } catch (error) {
      console.error('Grant temporary access error:', error);
      return false;
    }
  }

  /**
   * Revoke access immediately
   */
  async revokeAccess(
    userId: string,
    revokedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      // Validate revoker has authority
      const revokerContext = await this.getUserRoleContext(revokedBy);
      if (!revokerContext) return false;

      const revokerRole = HEALTHCARE_ROLE_DEFINITIONS[revokerContext.role];
      if (!revokerRole.can_approve_emergency_access) return false;

      // Revoke active access
      if (this.supabase) {
        await this.supabase
          .from('user_roles')
          .update({
            active: false,
            revoked_at: new Date().toISOString(),
            revoked_by: revokedBy,
            revoke_reason: reason,
          })
          .eq('user_id', userId);

        await this.supabase
          .from('temporary_access')
          .update({
            active: false,
            revoked_at: new Date().toISOString(),
            revoked_by: revokedBy,
            revoke_reason: reason,
          })
          .eq('user_id', userId);
      }

      // Clear cache
      this.clearUserCache(userId);

      return true;
    } catch (error) {
      console.error('Revoke access error:', error);
      return false;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getUserRoleContext(
    userId: string
  ): Promise<UserRoleContext | null> {
    try {
      if (!this.supabase) return null;

      const { data, error } = await this.supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (error || !data) return null;

      return UserRoleContextSchema.parse(data);
    } catch (error) {
      console.error('Get user role context error:', error);
      return null;
    }
  }

  private async validateHealthcareRequirements(
    userContext: UserRoleContext,
    permission: Permission
  ): Promise<{
    valid: boolean;
    reason: string;
    license_valid: boolean;
    specialty_match: boolean;
    cfm_compliant: boolean;
  }> {
    // Check medical license requirement
    if (permission.requires_license && !userContext.medical_license) {
      return {
        valid: false,
        reason: 'Medical license required',
        license_valid: false,
        specialty_match: true,
        cfm_compliant: false,
      };
    }

    // Check license expiry
    if (userContext.license_expiry && userContext.license_expiry < new Date()) {
      return {
        valid: false,
        reason: 'Medical license expired',
        license_valid: false,
        specialty_match: true,
        cfm_compliant: false,
      };
    }

    // Check license active status
    if (permission.requires_license && !userContext.license_active) {
      return {
        valid: false,
        reason: 'Medical license not active',
        license_valid: false,
        specialty_match: true,
        cfm_compliant: false,
      };
    }

    // Check specialty requirements
    const specialtyMatch = this.checkSpecialtyRequirement(
      userContext,
      permission
    );
    if (!specialtyMatch) {
      return {
        valid: false,
        reason: 'Medical specialty not authorized for this procedure',
        license_valid: true,
        specialty_match: false,
        cfm_compliant: true,
      };
    }

    // CFM compliance check
    if (permission.cfm_compliance && !userContext.cfm_number) {
      return {
        valid: false,
        reason: 'CFM registration required',
        license_valid: true,
        specialty_match: true,
        cfm_compliant: false,
      };
    }

    return {
      valid: true,
      reason: 'Healthcare requirements validated',
      license_valid: true,
      specialty_match: true,
      cfm_compliant: true,
    };
  }

  private checkSpecialtyRequirement(
    userContext: UserRoleContext,
    permission: Permission
  ): boolean {
    if (permission.requires_specialty.length === 0) return true;
    if (
      !userContext.medical_specialty &&
      userContext.additional_specialties.length === 0
    )
      return false;

    const userSpecialties = [
      ...(userContext.medical_specialty ? [userContext.medical_specialty] : []),
      ...userContext.additional_specialties,
    ];

    return permission.requires_specialty.some((required) =>
      userSpecialties.includes(required)
    );
  }

  private async validateContext(
    userContext: UserRoleContext,
    permission: Permission,
    context?: {
      clinicId?: string;
      patientId?: string;
      emergencyOverride?: boolean;
    }
  ): Promise<{ valid: boolean; reason: string }> {
    // Clinic context validation
    if (context?.clinicId && context.clinicId !== userContext.clinic_id) {
      const roleDefinition = HEALTHCARE_ROLE_DEFINITIONS[userContext.role];
      if (!roleDefinition.multi_clinic_access) {
        return { valid: false, reason: 'Cross-clinic access not authorized' };
      }
    }

    // Patient context validation
    if (context?.patientId && permission.scope === 'own') {
      // Check if user has relationship with patient
      const hasPatientRelationship = await this.checkPatientRelationship(
        userContext.user_id,
        context.patientId
      );
      if (!hasPatientRelationship) {
        return {
          valid: false,
          reason: 'No authorized relationship with patient',
        };
      }
    }

    return { valid: true, reason: 'Context validated' };
  }

  private async checkPatientRelationship(
    userId: string,
    patientId: string
  ): Promise<boolean> {
    if (!this.supabase) return false;

    const { data, error } = await this.supabase
      .from('patient_relationships')
      .select('id')
      .eq('healthcare_provider_id', userId)
      .eq('patient_id', patientId)
      .eq('active', true)
      .single();

    return !error && !!data;
  }

  private createPermissionResult(
    granted: boolean,
    permission: string,
    userId: string,
    role: HealthcareRole,
    reason: string,
    additionalData: Partial<PermissionCheckResult> = {}
  ): PermissionCheckResult {
    return {
      granted,
      permission,
      user_id: userId,
      role,
      reason,
      requires_validation: false,
      emergency_override: false,
      license_valid: true,
      specialty_match: true,
      cfm_compliant: true,
      lgpd_compliant: true,
      checked_at: new Date(),
      ...additionalData,
    };
  }

  private async logAuditTrail(
    result: PermissionCheckResult,
    context?: any
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase.from('audit_logs').insert({
        user_id: result.user_id,
        action: 'permission_check',
        resource: result.permission,
        result: result.granted ? 'granted' : 'denied',
        reason: result.reason,
        context,
        emergency_override: result.emergency_override,
        timestamp: result.checked_at,
      });
    } catch (error) {
      console.error('Audit trail logging error:', error);
    }
  }

  private getFromCache(key: string): PermissionCheckResult | null {
    const cached = this.permissionCache.get(key);
    if (!cached || cached.length === 0) return null;

    const result = cached[0];
    const age = Date.now() - result.checked_at.getTime();

    if (age > this.cacheExpiry) {
      this.permissionCache.delete(key);
      return null;
    }

    return result;
  }

  private setCache(key: string, result: PermissionCheckResult): void {
    this.permissionCache.set(key, [result]);
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.permissionCache.keys()).filter((key) =>
      key.startsWith(`${userId}:`)
    );
    keysToDelete.forEach((key) => this.permissionCache.delete(key));
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get role definition by role
 */
export function getRoleDefinition(
  role: HealthcareRole
): RoleDefinition | undefined {
  return HEALTHCARE_ROLE_DEFINITIONS[role];
}

/**
 * Get roles by category
 */
export function getRolesByCategory(
  category: RoleDefinition['category']
): RoleDefinition[] {
  return Object.values(HEALTHCARE_ROLE_DEFINITIONS).filter(
    (role) => role.category === category
  );
}

/**
 * Get roles requiring medical license
 */
export function getLicenseRequiredRoles(): RoleDefinition[] {
  return Object.values(HEALTHCARE_ROLE_DEFINITIONS).filter(
    (role) => role.requires_medical_license
  );
}

/**
 * Get roles by hierarchy level
 */
export function getRolesByLevel(
  minLevel: number,
  maxLevel?: number
): RoleDefinition[] {
  return Object.values(HEALTHCARE_ROLE_DEFINITIONS).filter((role) => {
    return role.level >= minLevel && (!maxLevel || role.level <= maxLevel);
  });
}

/**
 * Check if role can delegate to another role
 */
export function canDelegate(
  fromRole: HealthcareRole,
  toRole: HealthcareRole
): boolean {
  const fromRoleDef = HEALTHCARE_ROLE_DEFINITIONS[fromRole];
  return fromRoleDef?.can_delegate_to.includes(toRole);
}

/**
 * Get role hierarchy path
 */
export function getRoleHierarchyPath(role: HealthcareRole): HealthcareRole[] {
  const roleDef = HEALTHCARE_ROLE_DEFINITIONS[role];
  if (!roleDef) return [];

  const path = [role];
  for (const inherited of roleDef.inherited_from) {
    path.push(...getRoleHierarchyPath(inherited));
  }

  return Array.from(new Set(path));
}

export default HealthcareRBACEngine;
