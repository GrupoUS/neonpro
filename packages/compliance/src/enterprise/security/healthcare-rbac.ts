/**
 * Healthcare Role-Based Access Control (RBAC) Service
 * Constitutional healthcare access control with patient privacy protection and regulatory compliance
 * Compliance: LGPD + CFM + ANVISA + Constitutional Healthcare + ≥9.9/10 Standards
 */

import { z } from 'zod';

// Constitutional Healthcare RBAC Schemas
const HealthcareRoleSchema = z.object({
  role_id: z.string().uuid(),
  role_name: z.string().min(2).max(100),
  role_type: z.enum([
    'patient',
    'healthcare_professional',
    'physician',
    'nurse',
    'receptionist',
    'admin',
    'clinic_manager',
    'data_protection_officer',
    'compliance_officer',
    'system_administrator',
    'auditor',
  ]),
  hierarchy_level: z.number().min(1).max(10), // 1 = highest authority, 10 = lowest
  cfm_professional_type: z
    .enum([
      'medico',
      'enfermeiro',
      'fisioterapeuta',
      'psicologo',
      'nutricionista',
      'farmaceutico',
      'administrativo',
      'tecnico',
      'outros',
    ])
    .optional(),
  permissions: z.array(z.string()),
  restrictions: z.array(z.string()),
  data_access_level: z.enum(['none', 'basic', 'standard', 'enhanced', 'full']),
  patient_data_access: z.object({
    can_view_personal_data: z.boolean(),
    can_view_medical_records: z.boolean(),
    can_modify_medical_records: z.boolean(),
    can_delete_medical_records: z.boolean(),
    can_export_patient_data: z.boolean(),
    anonymized_access_only: z.boolean(),
    consent_required_for_access: z.boolean(),
  }),
  constitutional_compliance: z.object({
    patient_autonomy_respected: z.boolean(),
    medical_secrecy_enforced: z.boolean(),
    lgpd_compliance_validated: z.boolean(),
    cfm_ethics_approved: z.boolean(),
  }),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const HealthcareUserSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string().min(2).max(50),
  email: z.string().email(),
  full_name: z.string().min(2).max(200),
  professional_credentials: z.object({
    cfm_registration: z.string().optional(),
    coren_registration: z.string().optional(),
    crefito_registration: z.string().optional(),
    crp_registration: z.string().optional(),
    other_registrations: z.array(z.string()).optional(),
    license_expiry_date: z.string().datetime().optional(),
  }),
  assigned_roles: z.array(z.string().uuid()),
  clinic_assignments: z.array(z.string().uuid()),
  tenant_id: z.string().uuid(),
  access_level: z.enum([
    'restricted',
    'standard',
    'elevated',
    'administrative',
  ]),
  security_clearance: z.object({
    background_check_completed: z.boolean(),
    lgpd_training_completed: z.boolean(),
    cfm_ethics_training_completed: z.boolean(),
    security_awareness_training: z.boolean(),
    last_security_review: z.string().datetime().optional(),
  }),
  session_management: z.object({
    max_concurrent_sessions: z.number().min(1).max(5),
    session_timeout_minutes: z.number().min(5).max(480),
    require_mfa: z.boolean(),
    allowed_ip_ranges: z.array(z.string()).optional(),
  }),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),
});

const AccessRequestSchema = z.object({
  request_id: z.string().uuid(),
  user_id: z.string().uuid(),
  resource_type: z.enum([
    'patient_record',
    'medical_data',
    'appointment_schedule',
    'financial_data',
    'system_configuration',
    'compliance_reports',
    'audit_logs',
    'user_management',
    'clinic_management',
  ]),
  resource_id: z.string().optional(),
  action: z.enum(['read', 'write', 'delete', 'export', 'share', 'configure']),
  justification: z.string().min(10).max(500),
  urgency_level: z.enum(['low', 'normal', 'high', 'emergency']),
  patient_consent_obtained: z.boolean().optional(),
  medical_necessity: z.boolean().optional(),
  constitutional_basis: z.object({
    legal_basis: z.string(),
    patient_rights_considered: z.boolean(),
    privacy_impact_assessed: z.boolean(),
    cfm_ethics_reviewed: z.boolean(),
  }),
  approval_status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
});

const RbacConfigSchema = z.object({
  strict_mode_enabled: z.boolean().default(true),
  constitutional_validation: z.boolean().default(true),
  patient_consent_enforcement: z.boolean().default(true),
  cfm_ethics_validation: z.boolean().default(true),
  lgpd_compliance_mode: z.boolean().default(true),
  audit_all_access: z.boolean().default(true),
  role_hierarchy_enforcement: z.boolean().default(true),
  emergency_access_enabled: z.boolean().default(true),
  session_management_strict: z.boolean().default(true),
  multi_factor_required: z.boolean().default(true),
  ip_restriction_enabled: z.boolean().default(false),
  credential_verification_required: z.boolean().default(true),
});

// Type definitions
export type HealthcareRole = z.infer<typeof HealthcareRoleSchema>;
export type HealthcareUser = z.infer<typeof HealthcareUserSchema>;
export type AccessRequest = z.infer<typeof AccessRequestSchema>;
export type RbacConfig = z.infer<typeof RbacConfigSchema>;

export interface HealthcareRbacAudit {
  audit_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  access_granted: boolean;
  constitutional_validation_result: Record<string, any>;
  patient_privacy_impact: Record<string, any>;
  cfm_ethics_compliance: boolean;
  lgpd_compliance_verified: boolean;
  session_details: Record<string, any>;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Healthcare Role-Based Access Control Service
 * Constitutional healthcare access control with comprehensive compliance
 */
export class HealthcareRbacService {
  private readonly config: RbacConfig;
  private readonly roles: Map<string, HealthcareRole> = new Map();
  private readonly users: Map<string, HealthcareUser> = new Map();
  private readonly accessRequests: Map<string, AccessRequest> = new Map();
  private readonly auditTrail: HealthcareRbacAudit[] = [];
  private readonly activeSessions: Map<string, any> = new Map();

  constructor(config: RbacConfig) {
    this.config = RbacConfigSchema.parse(config);
    this.initializeDefaultRoles();
  }

  /**
   * Create healthcare role with constitutional compliance validation
   */
  async createHealthcareRole(
    roleData: Omit<HealthcareRole, 'role_id' | 'created_at' | 'updated_at'>,
  ): Promise<{
    success: boolean;
    role_id: string;
    constitutional_validation: Record<string, any>;
  }> {
    const now = new Date().toISOString();
    const fullRoleData: HealthcareRole = {
      role_id: crypto.randomUUID(),
      ...roleData,
      created_at: now,
      updated_at: now,
    };

    const validatedRole = HealthcareRoleSchema.parse(fullRoleData);

    // Constitutional compliance validation
    await this.validateRoleConstitutionalCompliance(validatedRole);

    // CFM professional validation if applicable
    if (validatedRole.cfm_professional_type) {
      await this.validateCfmProfessionalRole(validatedRole);
    }

    // LGPD compliance validation for data access permissions
    await this.validateRoleLgpdCompliance(validatedRole);

    // Store role
    this.roles.set(validatedRole.role_id, validatedRole);

    // Create audit entry
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: 'system',
      action: 'role_created',
      resource_type: 'rbac_role',
      resource_id: validatedRole.role_id,
      access_granted: true,
      constitutional_validation_result: {
        patient_autonomy_considered:
          validatedRole.constitutional_compliance.patient_autonomy_respected,
        medical_secrecy_enforced: validatedRole.constitutional_compliance.medical_secrecy_enforced,
        role_permissions_validated: true,
        hierarchy_level_appropriate: validatedRole.hierarchy_level >= 1,
      },
      patient_privacy_impact: {
        patient_data_access_level: validatedRole.data_access_level,
        anonymized_access_only: validatedRole.patient_data_access.anonymized_access_only,
        consent_required: validatedRole.patient_data_access.consent_required_for_access,
      },
      cfm_ethics_compliance: validatedRole.constitutional_compliance.cfm_ethics_approved,
      lgpd_compliance_verified: validatedRole.constitutional_compliance.lgpd_compliance_validated,
      session_details: {},
      created_at: now,
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      role_id: validatedRole.role_id,
      constitutional_validation: auditEntry.constitutional_validation_result,
    };
  }

  /**
   * Create healthcare user with comprehensive validation
   */
  async createHealthcareUser(
    userData: Omit<HealthcareUser, 'user_id' | 'created_at' | 'updated_at'>,
  ): Promise<{
    success: boolean;
    user_id: string;
    security_clearance_status: Record<string, any>;
  }> {
    const now = new Date().toISOString();
    const fullUserData: HealthcareUser = {
      user_id: crypto.randomUUID(),
      ...userData,
      created_at: now,
      updated_at: now,
    };

    const validatedUser = HealthcareUserSchema.parse(fullUserData);

    // Validate professional credentials if applicable
    await this.validateProfessionalCredentials(validatedUser);

    // Validate role assignments
    await this.validateUserRoleAssignments(validatedUser);

    // Validate security clearance requirements
    await this.validateSecurityClearance(validatedUser);

    // Constitutional compliance validation for user creation
    await this.validateUserConstitutionalCompliance(validatedUser);

    // Store user
    this.users.set(validatedUser.user_id, validatedUser);

    // Create audit entry
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: validatedUser.user_id,
      action: 'user_created',
      resource_type: 'rbac_user',
      resource_id: validatedUser.user_id,
      access_granted: true,
      constitutional_validation_result: {
        professional_credentials_validated: this.hasProfessionalCredentials(validatedUser),
        security_clearance_completed: validatedUser.security_clearance.background_check_completed,
        training_requirements_met: this.allTrainingCompleted(validatedUser),
      },
      patient_privacy_impact: {
        access_level: validatedUser.access_level,
        patient_data_access_potential: validatedUser.assigned_roles.length > 0,
        constitutional_protections_applied: true,
      },
      cfm_ethics_compliance: validatedUser.security_clearance.cfm_ethics_training_completed,
      lgpd_compliance_verified: validatedUser.security_clearance.lgpd_training_completed,
      session_details: validatedUser.session_management,
      created_at: now,
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      user_id: validatedUser.user_id,
      security_clearance_status: auditEntry.constitutional_validation_result,
    };
  }

  /**
   * Check access permission with constitutional validation
   */
  async checkAccess(
    userId: string,
    resourceType: string,
    resourceId: string | undefined,
    action: string,
    context?: Record<string, any>,
  ): Promise<{
    access_granted: boolean;
    constitutional_basis: Record<string, any>;
    restrictions: string[];
    audit_trail_id: string;
  }> {
    // Get user
    const user = this.users.get(userId);
    if (!user?.active) {
      return this.denyAccess(
        userId,
        resourceType,
        resourceId,
        action,
        'User not found or inactive',
      );
    }

    // Validate session
    const sessionValid = await this.validateUserSession(userId, context);
    if (!sessionValid) {
      return this.denyAccess(
        userId,
        resourceType,
        resourceId,
        action,
        'Invalid or expired session',
      );
    }

    // Get user roles and permissions
    const userRoles = await this.getUserRoles(userId);
    const permissions = await this.getUserPermissions(userRoles);

    // Check basic permission
    const hasPermission = this.checkBasicPermission(
      permissions,
      resourceType,
      action,
    );
    if (!hasPermission) {
      return this.denyAccess(
        userId,
        resourceType,
        resourceId,
        action,
        'Insufficient permissions',
      );
    }

    // Constitutional validation for patient data access
    if (this.isPatientDataResource(resourceType)) {
      const constitutionalValidation = await this.validatePatientDataAccess(
        user,
        userRoles,
        resourceType,
        resourceId,
        action,
        context,
      );

      if (!constitutionalValidation.access_granted) {
        return this.denyAccess(
          userId,
          resourceType,
          resourceId,
          action,
          constitutionalValidation.reason || 'Access denied',
        );
      }
    }

    // Emergency access validation
    if (context?.emergency_access) {
      const emergencyValidation = await this.validateEmergencyAccess(
        user,
        resourceType,
        action,
        context,
      );
      if (!emergencyValidation.valid) {
        return this.denyAccess(
          userId,
          resourceType,
          resourceId,
          action,
          'Emergency access not authorized',
        );
      }
    }

    // Grant access with constitutional basis
    return this.grantAccess(
      userId,
      resourceType,
      resourceId,
      action,
      userRoles,
      context,
    );
  }

  /**
   * Request elevated access with justification
   */
  async requestAccess(
    userId: string,
    accessRequest: Omit<
      AccessRequest,
      'request_id' | 'approval_status' | 'created_at'
    >,
  ): Promise<{
    success: boolean;
    request_id: string;
    estimated_approval_time: string;
  }> {
    const now = new Date().toISOString();
    const fullRequest: AccessRequest = {
      request_id: crypto.randomUUID(),
      ...accessRequest,
      approval_status: 'pending',
      created_at: now,
    };

    const validatedRequest = AccessRequestSchema.parse(fullRequest);

    // Validate user can make request
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Constitutional validation for access request
    await this.validateAccessRequestConstitutional(validatedRequest, user);

    // Set expiry based on urgency
    const expiryHours = this.getRequestExpiryHours(
      validatedRequest.urgency_level,
    );
    const expiresAt = new Date(
      Date.now() + expiryHours * 60 * 60 * 1000,
    ).toISOString();
    validatedRequest.expires_at = expiresAt;

    // Store request
    this.accessRequests.set(validatedRequest.request_id, validatedRequest);

    // Create audit entry
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: userId,
      action: 'access_requested',
      resource_type: validatedRequest.resource_type,
      resource_id: validatedRequest.resource_id,
      access_granted: false,
      constitutional_validation_result: {
        justification_provided: validatedRequest.justification.length >= 10,
        constitutional_basis_valid: validatedRequest.constitutional_basis.legal_basis.length > 0,
        patient_rights_considered: validatedRequest.constitutional_basis.patient_rights_considered,
        privacy_impact_assessed: validatedRequest.constitutional_basis.privacy_impact_assessed,
      },
      patient_privacy_impact: {
        patient_consent_obtained: validatedRequest.patient_consent_obtained,
        medical_necessity: validatedRequest.medical_necessity,
        urgency_level: validatedRequest.urgency_level,
      },
      cfm_ethics_compliance: validatedRequest.constitutional_basis.cfm_ethics_reviewed,
      lgpd_compliance_verified: true,
      session_details: {},
      created_at: now,
    };

    this.auditTrail.push(auditEntry);

    // Estimate approval time based on urgency
    const estimatedApprovalTime = this.getEstimatedApprovalTime(
      validatedRequest.urgency_level,
    );

    return {
      success: true,
      request_id: validatedRequest.request_id,
      estimated_approval_time: estimatedApprovalTime,
    };
  }

  /**
   * Approve or reject access request
   */
  async processAccessRequest(
    requestId: string,
    approverId: string,
    decision: 'approved' | 'rejected',
    justification: string,
  ): Promise<{
    success: boolean;
    decision: string;
    constitutional_validation: Record<string, any>;
  }> {
    const request = this.accessRequests.get(requestId);
    if (!request) {
      throw new Error('Access request not found');
    }

    if (request.approval_status !== 'pending') {
      throw new Error('Request already processed');
    }

    // Validate approver authority
    const approver = this.users.get(approverId);
    if (!approver) {
      throw new Error('Approver not found');
    }

    await this.validateApproverAuthority(approver, request);

    // Update request
    request.approval_status = decision;
    request.approved_by = approverId;
    request.approved_at = new Date().toISOString();

    this.accessRequests.set(requestId, request);

    // Create audit entry
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: approverId,
      action: `access_request_${decision}`,
      resource_type: request.resource_type,
      resource_id: request.resource_id,
      access_granted: decision === 'approved',
      constitutional_validation_result: {
        approver_authority_validated: true,
        constitutional_basis_reviewed: true,
        patient_rights_protected: true,
        decision_justified: justification.length >= 10,
      },
      patient_privacy_impact: {
        access_granted_for_patient_data: this.isPatientDataResource(request.resource_type)
          && decision === 'approved',
        constitutional_protections_maintained: true,
      },
      cfm_ethics_compliance: true,
      lgpd_compliance_verified: true,
      session_details: { justification },
      created_at: new Date().toISOString(),
    };

    this.auditTrail.push(auditEntry);

    return {
      success: true,
      decision,
      constitutional_validation: auditEntry.constitutional_validation_result,
    };
  }

  /**
   * Initialize default healthcare roles
   */
  private async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        role_name: 'Patient',
        role_type: 'patient' as const,
        hierarchy_level: 10,
        permissions: [
          'view_own_data',
          'update_own_profile',
          'consent_management',
        ],
        restrictions: ['no_other_patient_access', 'no_system_administration'],
        data_access_level: 'basic' as const,
        patient_data_access: {
          can_view_personal_data: true,
          can_view_medical_records: true,
          can_modify_medical_records: false,
          can_delete_medical_records: false,
          can_export_patient_data: true,
          anonymized_access_only: false,
          consent_required_for_access: false,
        },
        constitutional_compliance: {
          patient_autonomy_respected: true,
          medical_secrecy_enforced: true,
          lgpd_compliance_validated: true,
          cfm_ethics_approved: true,
        },
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        role_name: 'Physician',
        role_type: 'physician' as const,
        hierarchy_level: 2,
        cfm_professional_type: 'medico' as const,
        permissions: [
          'view_patient_data',
          'modify_medical_records',
          'prescribe_treatments',
          'access_medical_history',
        ],
        restrictions: ['no_financial_data_access', 'no_system_configuration'],
        data_access_level: 'full' as const,
        patient_data_access: {
          can_view_personal_data: true,
          can_view_medical_records: true,
          can_modify_medical_records: true,
          can_delete_medical_records: false,
          can_export_patient_data: true,
          anonymized_access_only: false,
          consent_required_for_access: true,
        },
        constitutional_compliance: {
          patient_autonomy_respected: true,
          medical_secrecy_enforced: true,
          lgpd_compliance_validated: true,
          cfm_ethics_approved: true,
        },
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        role_name: 'Nurse',
        role_type: 'nurse' as const,
        hierarchy_level: 4,
        cfm_professional_type: 'enfermeiro' as const,
        permissions: [
          'view_patient_data',
          'update_patient_records',
          'schedule_appointments',
        ],
        restrictions: ['no_prescription_authority', 'no_diagnosis_authority'],
        data_access_level: 'enhanced' as const,
        patient_data_access: {
          can_view_personal_data: true,
          can_view_medical_records: true,
          can_modify_medical_records: true,
          can_delete_medical_records: false,
          can_export_patient_data: false,
          anonymized_access_only: false,
          consent_required_for_access: true,
        },
        constitutional_compliance: {
          patient_autonomy_respected: true,
          medical_secrecy_enforced: true,
          lgpd_compliance_validated: true,
          cfm_ethics_approved: true,
        },
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        role_name: 'Receptionist',
        role_type: 'receptionist' as const,
        hierarchy_level: 6,
        permissions: [
          'schedule_appointments',
          'view_basic_patient_info',
          'manage_appointments',
        ],
        restrictions: ['no_medical_records_access', 'no_sensitive_data_access'],
        data_access_level: 'basic' as const,
        patient_data_access: {
          can_view_personal_data: true,
          can_view_medical_records: false,
          can_modify_medical_records: false,
          can_delete_medical_records: false,
          can_export_patient_data: false,
          anonymized_access_only: false,
          consent_required_for_access: false,
        },
        constitutional_compliance: {
          patient_autonomy_respected: true,
          medical_secrecy_enforced: true,
          lgpd_compliance_validated: true,
          cfm_ethics_approved: true,
        },
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        role_name: 'Data Protection Officer',
        role_type: 'data_protection_officer' as const,
        hierarchy_level: 2,
        permissions: [
          'access_privacy_data',
          'audit_data_processing',
          'manage_consent',
          'lgpd_compliance',
        ],
        restrictions: ['no_medical_diagnosis', 'no_treatment_prescription'],
        data_access_level: 'full' as const,
        patient_data_access: {
          can_view_personal_data: true,
          can_view_medical_records: false,
          can_modify_medical_records: false,
          can_delete_medical_records: false,
          can_export_patient_data: true,
          anonymized_access_only: true,
          consent_required_for_access: false,
        },
        constitutional_compliance: {
          patient_autonomy_respected: true,
          medical_secrecy_enforced: true,
          lgpd_compliance_validated: true,
          cfm_ethics_approved: true,
        },
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const roleData of defaultRoles) {
      await this.createHealthcareRole(roleData);
    }
  }

  // Helper methods for access control validation

  private async validateRoleConstitutionalCompliance(
    role: HealthcareRole,
  ): Promise<void> {
    if (!this.config.constitutional_validation) {
      return;
    }

    // Validate patient autonomy consideration
    if (!role.constitutional_compliance.patient_autonomy_respected) {
      throw new Error('Role must respect patient autonomy principle');
    }

    // Validate medical secrecy enforcement
    if (!role.constitutional_compliance.medical_secrecy_enforced) {
      throw new Error('Role must enforce medical secrecy');
    }

    // Validate data access level appropriateness
    if (role.data_access_level === 'full' && role.hierarchy_level > 3) {
      throw new Error(
        'Full data access not appropriate for low hierarchy roles',
      );
    }
  }

  private async validateCfmProfessionalRole(
    role: HealthcareRole,
  ): Promise<void> {
    if (!this.config.cfm_ethics_validation) {
      return;
    }

    // Validate CFM professional type matches role permissions
    if (
      role.cfm_professional_type === 'medico'
      && !role.permissions.includes('prescribe_treatments')
    ) {
      throw new Error(
        'Medical professional roles must include prescription authority',
      );
    }

    if (
      role.cfm_professional_type
      && !role.constitutional_compliance.cfm_ethics_approved
    ) {
      throw new Error('CFM professional roles require ethics approval');
    }
  }

  private async validateRoleLgpdCompliance(
    role: HealthcareRole,
  ): Promise<void> {
    if (!this.config.lgpd_compliance_mode) {
      return;
    }

    // Validate consent requirements for patient data access
    if (
      role.patient_data_access.can_view_medical_records
      && !role.patient_data_access.consent_required_for_access
      && role.role_type !== 'patient'
    ) {
      throw new Error(
        'Non-patient roles accessing medical records must require consent',
      );
    }

    // Validate anonymization for non-medical roles
    if (
      role.data_access_level === 'full'
      && !['physician', 'nurse', 'admin'].includes(role.role_type)
      && !role.patient_data_access.anonymized_access_only
    ) {
      throw new Error(
        'Non-medical roles with full access must use anonymized data only',
      );
    }
  }

  private async validateProfessionalCredentials(
    user: HealthcareUser,
  ): Promise<void> {
    if (!this.config.credential_verification_required) {
      return;
    }

    // Check for required professional credentials based on assigned roles
    const userRoles = await this.getUserRoles(user.user_id);
    const requiresCfm = userRoles.some(
      (role) => role.cfm_professional_type === 'medico',
    );

    if (requiresCfm && !user.professional_credentials.cfm_registration) {
      throw new Error(
        'CFM registration required for medical professional roles',
      );
    }

    // Check license expiry
    if (user.professional_credentials.license_expiry_date) {
      const expiryDate = new Date(
        user.professional_credentials.license_expiry_date,
      );
      if (expiryDate <= new Date()) {
        throw new Error('Professional license expired');
      }
    }
  }

  private async validateUserRoleAssignments(
    user: HealthcareUser,
  ): Promise<void> {
    // Validate all assigned roles exist
    for (const roleId of user.assigned_roles) {
      const role = this.roles.get(roleId);
      if (!role?.active) {
        throw new Error(`Invalid or inactive role assignment: ${roleId}`);
      }
    }

    // Validate role hierarchy conflicts
    const userRoles = user.assigned_roles.map(
      (roleId) => this.roles.get(roleId)!,
    );
    const hierarchyLevels = userRoles.map((role) => role.hierarchy_level);

    // Check for inappropriate hierarchy combinations
    if (Math.max(...hierarchyLevels) - Math.min(...hierarchyLevels) > 5) {
      throw new Error('User assigned roles with incompatible hierarchy levels');
    }
  }

  private async validateSecurityClearance(user: HealthcareUser): Promise<void> {
    if (!this.config.strict_mode_enabled) {
      return;
    }

    const clearance = user.security_clearance;

    // Require background check for elevated access
    if (
      (user.access_level === 'elevated'
        || user.access_level === 'administrative')
      && !clearance.background_check_completed
    ) {
      throw new Error('Background check required for elevated access');
    }

    // Require LGPD training
    if (!clearance.lgpd_training_completed) {
      throw new Error('LGPD training completion required');
    }

    // Require CFM ethics training for medical roles
    const userRoles = await this.getUserRoles(user.user_id);
    const hasMedicalRole = userRoles.some((role) => role.cfm_professional_type);

    if (hasMedicalRole && !clearance.cfm_ethics_training_completed) {
      throw new Error('CFM ethics training required for medical roles');
    }
  }

  private async validateUserConstitutionalCompliance(
    user: HealthcareUser,
  ): Promise<void> {
    if (!this.config.constitutional_validation) {
      return;
    }

    // Validate session management settings
    if (this.config.session_management_strict) {
      if (user.session_management.session_timeout_minutes > 120) {
        throw new Error('Session timeout too long for healthcare compliance');
      }

      if (
        user.access_level === 'administrative'
        && user.session_management.max_concurrent_sessions > 2
      ) {
        throw new Error(
          'Administrative users limited to 2 concurrent sessions',
        );
      }
    }

    // Validate MFA requirement
    if (
      this.config.multi_factor_required
      && !user.session_management.require_mfa
    ) {
      throw new Error(
        'Multi-factor authentication required for healthcare access',
      );
    }
  }

  private async validateUserSession(
    userId: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    // Mock session validation - in production, this would check actual session store
    const session = this.activeSessions.get(userId);
    if (!session) {
      return false;
    }

    // Check session timeout
    const sessionAge = Date.now() - session.created_at;
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    const timeoutMs = user.session_management.session_timeout_minutes * 60 * 1000;
    if (sessionAge > timeoutMs) {
      this.activeSessions.delete(userId);
      return false;
    }

    // Check IP restrictions if enabled
    if (
      this.config.ip_restriction_enabled
      && user.session_management.allowed_ip_ranges
    ) {
      const clientIp = context?.ip_address;
      if (
        clientIp
        && !this.isIpAllowed(clientIp, user.session_management.allowed_ip_ranges)
      ) {
        return false;
      }
    }

    return true;
  }

  private async getUserRoles(userId: string): Promise<HealthcareRole[]> {
    const user = this.users.get(userId);
    if (!user) {
      return [];
    }

    return user.assigned_roles
      .map((roleId) => this.roles.get(roleId))
      .filter(
        (role): role is HealthcareRole => role !== undefined && role.active === true,
      );
  }

  private async getUserPermissions(roles: HealthcareRole[]): Promise<string[]> {
    const permissions = new Set<string>();

    for (const role of roles) {
      for (const permission of role.permissions) {
        permissions.add(permission);
      }
    }

    return [...permissions];
  }

  private checkBasicPermission(
    permissions: string[],
    resourceType: string,
    action: string,
  ): boolean {
    // Map resource types and actions to required permissions
    const permissionMap: Record<string, Record<string, string>> = {
      patient_record: {
        read: 'view_patient_data',
        write: 'modify_medical_records',
        delete: 'delete_medical_records',
      },
      medical_data: {
        read: 'view_patient_data',
        write: 'modify_medical_records',
      },
      appointment_schedule: {
        read: 'view_appointments',
        write: 'schedule_appointments',
      },
    };

    const requiredPermission = permissionMap[resourceType]?.[action];
    if (!requiredPermission) {
      return false;
    }

    return permissions.includes(requiredPermission);
  }

  private isPatientDataResource(resourceType: string): boolean {
    return ['patient_record', 'medical_data'].includes(resourceType);
  }

  private async validatePatientDataAccess(
    user: HealthcareUser,
    roles: HealthcareRole[],
    _resourceType: string,
    resourceId: string | undefined,
    action: string,
    context?: Record<string, any>,
  ): Promise<{ access_granted: boolean; reason?: string; }> {
    // Check if patient consent is required and obtained
    const requiresConsent = roles.some(
      (role) => role.patient_data_access.consent_required_for_access,
    );
    if (requiresConsent && !context?.patient_consent_obtained) {
      return {
        access_granted: false,
        reason: 'Patient consent required for data access',
      };
    }

    // Check if user is accessing their own data (patient autonomy)
    if (
      user.assigned_roles.some(
        (roleId) => this.roles.get(roleId)?.role_type === 'patient',
      )
      && resourceId === user.user_id
    ) {
      return { access_granted: true }; // Patients can access their own data
    }

    // Check medical necessity for healthcare professionals
    const isMedicalProfessional = roles.some((role) =>
      ['physician', 'nurse', 'healthcare_professional'].includes(
        role.role_type,
      )
    );
    if (
      isMedicalProfessional
      && action === 'read'
      && !(context?.medical_necessity || context?.emergency_access)
    ) {
      return {
        access_granted: false,
        reason: 'Medical necessity or emergency access required',
      };
    }

    return { access_granted: true };
  }

  private async validateEmergencyAccess(
    user: HealthcareUser,
    _resourceType: string,
    _action: string,
    context: Record<string, any>,
  ): Promise<{ valid: boolean; reason?: string; }> {
    if (!this.config.emergency_access_enabled) {
      return { valid: false, reason: 'Emergency access not enabled' };
    }

    // Validate emergency justification
    if (
      !context.emergency_justification
      || context.emergency_justification.length < 20
    ) {
      return { valid: false, reason: 'Insufficient emergency justification' };
    }

    // Validate user has emergency access authority
    const userRoles = await this.getUserRoles(user.user_id);
    const hasEmergencyAuthority = userRoles.some(
      (role) =>
        ['physician', 'nurse', 'admin'].includes(role.role_type)
        && role.hierarchy_level <= 5,
    );

    if (!hasEmergencyAuthority) {
      return { valid: false, reason: 'User lacks emergency access authority' };
    }

    return { valid: true };
  }

  private grantAccess(
    userId: string,
    resourceType: string,
    resourceId: string | undefined,
    action: string,
    roles: HealthcareRole[],
    context?: Record<string, any>,
  ): {
    access_granted: boolean;
    constitutional_basis: Record<string, any>;
    restrictions: string[];
    audit_trail_id: string;
  } {
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: userId,
      action: `access_granted_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      access_granted: true,
      constitutional_validation_result: {
        patient_autonomy_respected: true,
        medical_secrecy_maintained: true,
        consent_validated: context?.patient_consent_obtained,
        medical_necessity_established: context?.medical_necessity,
      },
      patient_privacy_impact: {
        patient_data_accessed: this.isPatientDataResource(resourceType),
        constitutional_protections_applied: true,
        emergency_access_used: context?.emergency_access,
      },
      cfm_ethics_compliance: true,
      lgpd_compliance_verified: true,
      session_details: context || {},
      created_at: new Date().toISOString(),
      ip_address: context?.ip_address,
      user_agent: context?.user_agent,
    };

    this.auditTrail.push(auditEntry);

    // Generate restrictions based on role hierarchy and permissions
    const restrictions = this.generateAccessRestrictions(
      roles,
      resourceType,
      action,
    );

    return {
      access_granted: true,
      constitutional_basis: {
        legal_basis: 'Constitutional healthcare access with patient privacy protection',
        patient_rights_protected: true,
        cfm_ethics_compliant: true,
        lgpd_compliant: true,
      },
      restrictions,
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private denyAccess(
    userId: string,
    resourceType: string,
    resourceId: string | undefined,
    action: string,
    reason: string,
  ): {
    access_granted: boolean;
    constitutional_basis: Record<string, any>;
    restrictions: string[];
    audit_trail_id: string;
  } {
    const auditEntry: HealthcareRbacAudit = {
      audit_id: crypto.randomUUID(),
      user_id: userId,
      action: `access_denied_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      access_granted: false,
      constitutional_validation_result: {
        denial_reason: reason,
        constitutional_protections_applied: true,
      },
      patient_privacy_impact: {
        patient_data_protected: this.isPatientDataResource(resourceType),
        unauthorized_access_prevented: true,
      },
      cfm_ethics_compliance: true,
      lgpd_compliance_verified: true,
      session_details: { denial_reason: reason },
      created_at: new Date().toISOString(),
    };

    this.auditTrail.push(auditEntry);

    return {
      access_granted: false,
      constitutional_basis: {
        legal_basis: 'Access denied to protect constitutional healthcare rights',
        patient_rights_protected: true,
        denial_reason: reason,
      },
      restrictions: ['access_denied'],
      audit_trail_id: auditEntry.audit_id,
    };
  }

  private generateAccessRestrictions(
    roles: HealthcareRole[],
    resourceType: string,
    action: string,
  ): string[] {
    const restrictions: string[] = [];

    // Add role-based restrictions
    for (const role of roles) {
      restrictions.push(...role.restrictions);
    }

    // Add resource-specific restrictions
    if (this.isPatientDataResource(resourceType)) {
      restrictions.push('patient_data_anonymization_required');
      restrictions.push('medical_secrecy_enforcement');
    }

    // Add action-specific restrictions
    if (action === 'export') {
      restrictions.push('export_audit_trail_required');
      restrictions.push('data_minimization_applied');
    }

    return [...new Set(restrictions)]; // Remove duplicates
  }

  // Helper methods for access request management

  private async validateAccessRequestConstitutional(
    request: AccessRequest,
    _user: HealthcareUser,
  ): Promise<void> {
    if (!this.config.constitutional_validation) {
      return;
    }

    // Validate constitutional basis is provided
    if (!request.constitutional_basis.legal_basis) {
      throw new Error('Constitutional legal basis required for access request');
    }

    // Validate patient rights consideration
    if (
      this.isPatientDataResource(request.resource_type)
      && !request.constitutional_basis.patient_rights_considered
    ) {
      throw new Error(
        'Patient rights consideration required for patient data access requests',
      );
    }

    // Validate privacy impact assessment
    if (!request.constitutional_basis.privacy_impact_assessed) {
      throw new Error('Privacy impact assessment required for access requests');
    }
  }

  private getRequestExpiryHours(urgencyLevel: string): number {
    const expiryMap = {
      emergency: 1,
      high: 4,
      normal: 24,
      low: 72,
    };
    return expiryMap[urgencyLevel as keyof typeof expiryMap] || 24;
  }

  private getEstimatedApprovalTime(urgencyLevel: string): string {
    const timeMap = {
      emergency: '15 minutes',
      high: '2 hours',
      normal: '24 hours',
      low: '3 business days',
    };
    return timeMap[urgencyLevel as keyof typeof timeMap] || '24 hours';
  }

  private async validateApproverAuthority(
    approver: HealthcareUser,
    request: AccessRequest,
  ): Promise<void> {
    const approverRoles = await this.getUserRoles(approver.user_id);

    // Check if approver has sufficient hierarchy level
    const minHierarchyLevel = Math.min(
      ...approverRoles.map((role) => role.hierarchy_level),
    );
    if (minHierarchyLevel > 3) {
      throw new Error('Insufficient authority to approve access requests');
    }

    // Check if approver has appropriate role for request type
    if (this.isPatientDataResource(request.resource_type)) {
      const hasMedicalAuthority = approverRoles.some((role) =>
        ['physician', 'data_protection_officer', 'admin'].includes(
          role.role_type,
        )
      );
      if (!hasMedicalAuthority) {
        throw new Error(
          'Medical authority required to approve patient data access requests',
        );
      }
    }
  }

  private hasProfessionalCredentials(user: HealthcareUser): boolean {
    const creds = user.professional_credentials;
    return Boolean(
      creds.cfm_registration
        || creds.coren_registration
        || creds.crefito_registration
        || creds.crp_registration,
    );
  }

  private allTrainingCompleted(user: HealthcareUser): boolean {
    const clearance = user.security_clearance;
    return (
      clearance.lgpd_training_completed
      && clearance.cfm_ethics_training_completed
      && clearance.security_awareness_training
    );
  }

  private isIpAllowed(clientIp: string, allowedRanges: string[]): boolean {
    // Simplified IP range check - in production, use proper CIDR matching
    return allowedRanges.some((range) => clientIp.startsWith(range.split('/')[0]));
  }

  /**
   * Get all roles for administrative purposes
   */
  getAllRoles(): HealthcareRole[] {
    return [...this.roles.values()];
  }

  /**
   * Get all users for administrative purposes
   */
  getAllUsers(): HealthcareUser[] {
    return [...this.users.values()];
  }

  /**
   * Get audit trail for compliance reporting
   */
  getAuditTrail(): HealthcareRbacAudit[] {
    return [...this.auditTrail];
  }

  /**
   * Get pending access requests
   */
  getPendingAccessRequests(): AccessRequest[] {
    return [...this.accessRequests.values()].filter(
      (req) => req.approval_status === 'pending',
    );
  }

  /**
   * Validate constitutional compliance of RBAC system
   */
  async validateConstitutionalCompliance(): Promise<{
    compliant: boolean;
    score: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let score = 10;

    // Check strict mode
    if (!this.config.strict_mode_enabled) {
      issues.push('Strict mode not enabled - security risk');
      score -= 0.2;
    }

    // Check constitutional validation
    if (!this.config.constitutional_validation) {
      issues.push(
        'Constitutional validation not enabled - compliance violation',
      );
      score -= 0.3;
    }

    // Check patient consent enforcement
    if (!this.config.patient_consent_enforcement) {
      issues.push(
        'Patient consent enforcement not enabled - constitutional violation',
      );
      score -= 0.3;
    }

    // Check CFM ethics validation
    if (!this.config.cfm_ethics_validation) {
      issues.push('CFM ethics validation not enabled');
      score -= 0.2;
    }

    // Check LGPD compliance mode
    if (!this.config.lgpd_compliance_mode) {
      issues.push('LGPD compliance mode not enabled');
      score -= 0.2;
    }

    // Check audit requirements
    if (!this.config.audit_all_access) {
      issues.push('Complete access auditing not enabled');
      score -= 0.2;
    }

    // Check MFA requirement
    if (!this.config.multi_factor_required) {
      issues.push('Multi-factor authentication not required');
      score -= 0.1;
    }

    return {
      compliant: score >= 9.9 && issues.length === 0,
      score: Math.max(score, 0),
      issues,
    };
  }
}

/**
 * Factory function to create healthcare RBAC service
 */
export function createHealthcareRbacService(
  config: RbacConfig,
): HealthcareRbacService {
  return new HealthcareRbacService(config);
}

/**
 * Constitutional validation for healthcare RBAC configuration
 */
export async function validateHealthcareRbac(
  config: RbacConfig,
): Promise<{ valid: boolean; violations: string[]; }> {
  const violations: string[] = [];

  // Validate strict mode requirement
  if (!config.strict_mode_enabled) {
    violations.push('Strict mode must be enabled for healthcare RBAC');
  }

  // Validate constitutional validation requirement
  if (!config.constitutional_validation) {
    violations.push(
      'Constitutional validation must be enabled for healthcare compliance',
    );
  }

  // Validate patient consent enforcement
  if (!config.patient_consent_enforcement) {
    violations.push(
      'Patient consent enforcement must be enabled for constitutional compliance',
    );
  }

  // Validate CFM ethics validation
  if (!config.cfm_ethics_validation) {
    violations.push(
      'CFM ethics validation must be enabled for medical professional compliance',
    );
  }

  // Validate LGPD compliance mode
  if (!config.lgpd_compliance_mode) {
    violations.push(
      'LGPD compliance mode must be enabled for Brazilian healthcare',
    );
  }

  // Validate audit requirements
  if (!config.audit_all_access) {
    violations.push(
      'Complete access auditing must be enabled for healthcare compliance',
    );
  }

  // Validate MFA requirement
  if (!config.multi_factor_required) {
    violations.push(
      'Multi-factor authentication should be required for healthcare access',
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
