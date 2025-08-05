"use strict";
/**
 * Row Level Security (RLS) Policies for NeonPro RBAC
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This module contains SQL policies for Supabase RLS integration
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DROP_POLICIES_COMMANDS = exports.ENABLE_RLS_COMMANDS = exports.RLS_POLICIES = void 0;
exports.generateAllPolicies = generateAllPolicies;
exports.createRLSSetupScript = createRLSSetupScript;
/**
 * RLS Policy Definitions for NeonPro Tables
 * These policies enforce role-based access at the database level
 */
exports.RLS_POLICIES = {
    // Users table policies
    users: {
        // Users can read their own profile and clinic members (if manager+)
        select: "\n      CREATE POLICY \"users_select_policy\" ON users\n      FOR SELECT USING (\n        auth.uid() = id OR\n        (\n          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n        )\n      );\n    ",
        // Only owners and managers can insert new users
        insert: "\n      CREATE POLICY \"users_insert_policy\" ON users\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Users can update their own profile, managers can update clinic users
        update: "\n      CREATE POLICY \"users_update_policy\" ON users\n      FOR UPDATE USING (\n        auth.uid() = id OR\n        (\n          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n        )\n      );\n    ",
        // Only owners can delete users
        delete: "\n      CREATE POLICY \"users_delete_policy\" ON users\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' = 'owner' AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    "
    },
    // Patients table policies
    patients: {
        // Staff+ can read patients from their clinic
        select: "\n      CREATE POLICY \"patients_select_policy\" ON patients\n      FOR SELECT USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Staff+ can create patients in their clinic
        insert: "\n      CREATE POLICY \"patients_insert_policy\" ON patients\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Staff+ can update patients in their clinic
        update: "\n      CREATE POLICY \"patients_update_policy\" ON patients\n      FOR UPDATE USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Only managers+ can delete patients
        delete: "\n      CREATE POLICY \"patients_delete_policy\" ON patients\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    "
    },
    // Appointments table policies
    appointments: {
        // Staff can see their own appointments, managers+ see all clinic appointments
        select: "\n      CREATE POLICY \"appointments_select_policy\" ON appointments\n      FOR SELECT USING (\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid AND\n        (\n          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') OR\n          (\n            auth.jwt() ->> 'role' = 'staff' AND\n            staff_id = auth.uid()\n          )\n        )\n      );\n    ",
        // Staff+ can create appointments in their clinic
        insert: "\n      CREATE POLICY \"appointments_insert_policy\" ON appointments\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Staff can update their own appointments, managers+ can update all
        update: "\n      CREATE POLICY \"appointments_update_policy\" ON appointments\n      FOR UPDATE USING (\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid AND\n        (\n          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') OR\n          (\n            auth.jwt() ->> 'role' = 'staff' AND\n            staff_id = auth.uid()\n          )\n        )\n      );\n    ",
        // Managers+ can delete appointments
        delete: "\n      CREATE POLICY \"appointments_delete_policy\" ON appointments\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    "
    },
    // Billing table policies (financial data)
    billing: {
        // Only managers+ can access billing data
        select: "\n      CREATE POLICY \"billing_select_policy\" ON billing\n      FOR SELECT USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        insert: "\n      CREATE POLICY \"billing_insert_policy\" ON billing\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        update: "\n      CREATE POLICY \"billing_update_policy\" ON billing\n      FOR UPDATE USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        // Only owners can delete billing records
        delete: "\n      CREATE POLICY \"billing_delete_policy\" ON billing\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' = 'owner' AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    "
    },
    // Payments table policies
    payments: {
        // Only managers+ can access payment data
        select: "\n      CREATE POLICY \"payments_select_policy\" ON payments\n      FOR SELECT USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        insert: "\n      CREATE POLICY \"payments_insert_policy\" ON payments\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        update: "\n      CREATE POLICY \"payments_update_policy\" ON payments\n      FOR UPDATE USING (\n        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    ",
        delete: "\n      CREATE POLICY \"payments_delete_policy\" ON payments\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' = 'owner' AND\n        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n      );\n    "
    },
    // Clinics table policies
    clinics: {
        // Users can only see their own clinic
        select: "\n      CREATE POLICY \"clinics_select_policy\" ON clinics\n      FOR SELECT USING (\n        id = (auth.jwt() ->> 'clinic_id')::uuid OR\n        auth.jwt() ->> 'role' = 'admin'\n      );\n    ",
        // Only admins can create new clinics
        insert: "\n      CREATE POLICY \"clinics_insert_policy\" ON clinics\n      FOR INSERT WITH CHECK (\n        auth.jwt() ->> 'role' = 'admin'\n      );\n    ",
        // Only owners and admins can update clinic info
        update: "\n      CREATE POLICY \"clinics_update_policy\" ON clinics\n      FOR UPDATE USING (\n        (\n          auth.jwt() ->> 'role' = 'owner' AND\n          id = (auth.jwt() ->> 'clinic_id')::uuid\n        ) OR\n        auth.jwt() ->> 'role' = 'admin'\n      );\n    ",
        // Only admins can delete clinics
        delete: "\n      CREATE POLICY \"clinics_delete_policy\" ON clinics\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' = 'admin'\n      );\n    "
    },
    // Permission audit log policies
    permission_audit_log: {
        // Users can only see their own audit logs, managers+ see clinic logs
        select: "\n      CREATE POLICY \"audit_log_select_policy\" ON permission_audit_log\n      FOR SELECT USING (\n        user_id = auth.uid() OR\n        (\n          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND\n          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid\n        )\n      );\n    ",
        // System can insert audit logs
        insert: "\n      CREATE POLICY \"audit_log_insert_policy\" ON permission_audit_log\n      FOR INSERT WITH CHECK (true);\n    ",
        // No updates allowed on audit logs
        update: "\n      CREATE POLICY \"audit_log_update_policy\" ON permission_audit_log\n      FOR UPDATE USING (false);\n    ",
        // Only admins can delete audit logs (for cleanup)
        delete: "\n      CREATE POLICY \"audit_log_delete_policy\" ON permission_audit_log\n      FOR DELETE USING (\n        auth.jwt() ->> 'role' = 'admin'\n      );\n    "
    }
};
/**
 * Function to enable RLS on all tables
 */
exports.ENABLE_RLS_COMMANDS = [
    'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE patients ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE billing ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE payments ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;'
];
/**
 * Function to create all RLS policies
 */
function generateAllPolicies() {
    var policies = [];
    // Add enable RLS commands
    policies.push.apply(policies, exports.ENABLE_RLS_COMMANDS);
    // Add all table policies
    Object.entries(exports.RLS_POLICIES).forEach(function (_a) {
        var table = _a[0], tablePolicies = _a[1];
        Object.entries(tablePolicies).forEach(function (_a) {
            var operation = _a[0], policy = _a[1];
            policies.push(policy);
        });
    });
    return policies;
}
/**
 * Function to drop all existing policies (for reset)
 */
exports.DROP_POLICIES_COMMANDS = [
    // Users policies
    'DROP POLICY IF EXISTS "users_select_policy" ON users;',
    'DROP POLICY IF EXISTS "users_insert_policy" ON users;',
    'DROP POLICY IF EXISTS "users_update_policy" ON users;',
    'DROP POLICY IF EXISTS "users_delete_policy" ON users;',
    // Patients policies
    'DROP POLICY IF EXISTS "patients_select_policy" ON patients;',
    'DROP POLICY IF EXISTS "patients_insert_policy" ON patients;',
    'DROP POLICY IF EXISTS "patients_update_policy" ON patients;',
    'DROP POLICY IF EXISTS "patients_delete_policy" ON patients;',
    // Appointments policies
    'DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;',
    'DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;',
    'DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;',
    'DROP POLICY IF EXISTS "appointments_delete_policy" ON appointments;',
    // Billing policies
    'DROP POLICY IF EXISTS "billing_select_policy" ON billing;',
    'DROP POLICY IF EXISTS "billing_insert_policy" ON billing;',
    'DROP POLICY IF EXISTS "billing_update_policy" ON billing;',
    'DROP POLICY IF EXISTS "billing_delete_policy" ON billing;',
    // Payments policies
    'DROP POLICY IF EXISTS "payments_select_policy" ON payments;',
    'DROP POLICY IF EXISTS "payments_insert_policy" ON payments;',
    'DROP POLICY IF EXISTS "payments_update_policy" ON payments;',
    'DROP POLICY IF EXISTS "payments_delete_policy" ON payments;',
    // Clinics policies
    'DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;',
    'DROP POLICY IF EXISTS "clinics_insert_policy" ON clinics;',
    'DROP POLICY IF EXISTS "clinics_update_policy" ON clinics;',
    'DROP POLICY IF EXISTS "clinics_delete_policy" ON clinics;',
    // Audit log policies
    'DROP POLICY IF EXISTS "audit_log_select_policy" ON permission_audit_log;',
    'DROP POLICY IF EXISTS "audit_log_insert_policy" ON permission_audit_log;',
    'DROP POLICY IF EXISTS "audit_log_update_policy" ON permission_audit_log;',
    'DROP POLICY IF EXISTS "audit_log_delete_policy" ON permission_audit_log;'
];
/**
 * Helper function to create a complete RLS setup script
 */
function createRLSSetupScript() {
    var script = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        '-- NeonPro RBAC Row Level Security Setup',
        '-- Generated automatically - do not edit manually',
        '',
        '-- Drop existing policies'
    ], exports.DROP_POLICIES_COMMANDS, true), [
        '',
        '-- Enable RLS on all tables'
    ], false), exports.ENABLE_RLS_COMMANDS, true), [
        '',
        '-- Create new policies'
    ], false), generateAllPolicies().slice(exports.ENABLE_RLS_COMMANDS.length), true), [
        '',
        '-- Grant necessary permissions',
        'GRANT USAGE ON SCHEMA public TO authenticated;',
        'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;',
        'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;',
        ''
    ], false);
    return script.join('\n');
}
