"use strict";
// RBAC Types for NeonPro Authentication System
// Story 1.2: Role-Based Permissions Enhancement
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_GROUPS = exports.DEFAULT_ROLES = void 0;
// Default role configurations
exports.DEFAULT_ROLES = {
    owner: {
        id: 'role_owner',
        name: 'owner',
        displayName: 'Clinic Owner',
        description: 'Full system access with all administrative privileges',
        permissions: [
            // All permissions - owner has unrestricted access
            'users.create', 'users.read', 'users.update', 'users.delete', 'users.invite', 'users.suspend',
            'patients.create', 'patients.read', 'patients.update', 'patients.delete',
            'patients.medical_records.read', 'patients.medical_records.write', 'patients.sensitive_data.read',
            'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
            'appointments.schedule', 'appointments.reschedule', 'appointments.cancel',
            'billing.create', 'billing.read', 'billing.update', 'billing.delete',
            'payments.process', 'payments.refund', 'financial_reports.read',
            'system.settings.read', 'system.settings.write', 'system.users.manage',
            'system.roles.manage', 'system.audit.read', 'system.backup.manage',
            'clinic.settings.read', 'clinic.settings.write', 'clinic.staff.manage',
            'clinic.reports.read', 'clinic.analytics.read',
            'data.export', 'data.import', 'privacy.settings.manage', 'lgpd.compliance.manage'
        ],
        hierarchy: 1,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    manager: {
        id: 'role_manager',
        name: 'manager',
        displayName: 'Clinic Manager',
        description: 'Administrative access with staff and operational management',
        permissions: [
            'users.read', 'users.update', 'users.invite',
            'patients.create', 'patients.read', 'patients.update',
            'patients.medical_records.read', 'patients.medical_records.write',
            'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
            'appointments.schedule', 'appointments.reschedule', 'appointments.cancel',
            'billing.create', 'billing.read', 'billing.update',
            'payments.process', 'financial_reports.read',
            'clinic.settings.read', 'clinic.staff.manage', 'clinic.reports.read', 'clinic.analytics.read',
            'data.export'
        ],
        hierarchy: 2,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    staff: {
        id: 'role_staff',
        name: 'staff',
        displayName: 'Clinic Staff',
        description: 'Operational access for daily clinic activities',
        permissions: [
            'users.read',
            'patients.create', 'patients.read', 'patients.update',
            'patients.medical_records.read', 'patients.medical_records.write',
            'appointments.create', 'appointments.read', 'appointments.update',
            'appointments.schedule', 'appointments.reschedule',
            'billing.read', 'billing.create',
            'clinic.settings.read'
        ],
        hierarchy: 3,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    patient: {
        id: 'role_patient',
        name: 'patient',
        displayName: 'Patient',
        description: 'Limited access to own data and appointment management',
        permissions: [
            'appointments.read', 'appointments.schedule',
            'billing.read'
        ],
        hierarchy: 4,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
};
// Permission groups for easier management
exports.PERMISSION_GROUPS = {
    USER_MANAGEMENT: [
        'users.create', 'users.read', 'users.update', 'users.delete', 'users.invite', 'users.suspend'
    ],
    PATIENT_MANAGEMENT: [
        'patients.create', 'patients.read', 'patients.update', 'patients.delete',
        'patients.medical_records.read', 'patients.medical_records.write', 'patients.sensitive_data.read'
    ],
    APPOINTMENT_MANAGEMENT: [
        'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
        'appointments.schedule', 'appointments.reschedule', 'appointments.cancel'
    ],
    FINANCIAL_MANAGEMENT: [
        'billing.create', 'billing.read', 'billing.update', 'billing.delete',
        'payments.process', 'payments.refund', 'financial_reports.read'
    ],
    SYSTEM_ADMINISTRATION: [
        'system.settings.read', 'system.settings.write', 'system.users.manage',
        'system.roles.manage', 'system.audit.read', 'system.backup.manage'
    ],
    CLINIC_MANAGEMENT: [
        'clinic.settings.read', 'clinic.settings.write', 'clinic.staff.manage',
        'clinic.reports.read', 'clinic.analytics.read'
    ],
    DATA_PRIVACY: [
        'data.export', 'data.import', 'privacy.settings.manage', 'lgpd.compliance.manage'
    ]
};
