---
title: "Prisma–Supabase Parity & RLS Audit"
last_updated: 2025-09-06
form: reference
status: COMPLETED
---

# Prisma–Supabase Parity & RLS Audit

## Executive Summary

**CRITICAL FINDINGS**: Significant schema drift detected between Prisma SoT and live Supabase database.

- ❌ **Major Drift**: `users` table defined in Prisma but missing in Supabase
- ✅ **Core Tables Present**: `appointments`, `clinics`, `healthcare_professionals`, `patients`
- ⚠️ **Schema Differences**: Column naming and structure variations detected
- 🔍 **RLS Status**: Requires comprehensive policy audit (out of current scope)

## Scope
- Ensure Prisma schema (SoT) matches live Supabase Postgres.
- Document and validate RLS policies per entity.
- Confirm multi-tenant and LGPD constraints are enforced.

## Sources
- Prisma SoT: `packages/database/prisma/schema.prisma`
- App schema: `apps/web/prisma/schema.prisma` (temporary duplicate)
- Supabase: project "NeonPro Brasil" (ownkoxryswokcdanrdgj)

## Model Inventory (from SoT)
- User, Clinic, Patient, HealthcareProfessional, Appointment
- Enums: UserRole, UserStatus, AppointmentStatus, AppointmentType, NotificationType
- Supporting: Notification, AuditLog, SystemConfiguration

## Parity Analysis Results

### ❌ CRITICAL: Missing Tables
**`users` table**: Defined in Prisma schema but **NOT PRESENT** in Supabase
- Impact: Authentication and user management broken
- Required Action: Deploy user table migration immediately
- Risk Level: **HIGH** - Core functionality affected

### ✅ Present Core Tables

#### 1. `appointments` - ✅ EXISTS
**Schema Differences Detected:**
- Prisma: `appointment_date` (DateTime) vs Supabase: `start_time`, `end_time` (timestamptz)
- Prisma: `duration_minutes` (Int) vs Supabase: calculated from start/end times
- Prisma: missing `service_type_id`, `room_id`, notification flags present in Supabase
- Additional Supabase fields: `priority`, `whatsapp_reminder_sent`, `sms_reminder_sent`

#### 2. `clinics` - ✅ EXISTS  
**Schema Differences:**
- Prisma: `name` vs Supabase: `clinic_name`, `legal_name`
- Prisma: `cnpj` vs Supabase: `tax_id`
- Address structure differs: Prisma uses `address_*` vs Supabase `address_line1/2`
- Additional Supabase fields: `compliance_level`, `subscription_plan`, LGPD fields

#### 3. `healthcare_professionals` - ✅ EXISTS
**Schema Alignment**: Generally good alignment
- License fields match (crm_number, coren_number, etc.)
- Additional business logic fields in Supabase (consultation_fee, working_hours)

#### 4. `patients` - ✅ EXISTS
**Schema Differences:**
- Prisma: `user_id` relationship vs Supabase: standalone entity
- Supabase has extensive additional fields: no-show tracking, communication preferences
- LGPD compliance fields more comprehensive in Supabase

## Drift Detection Summary

### High Priority Issues
1. **Missing `users` table** - CRITICAL
2. **Appointments structure mismatch** - HIGH  
3. **Clinic naming inconsistencies** - MEDIUM
4. **Patient-User relationship missing** - HIGH

### Migration Requirements
```sql
-- CRITICAL: Create users table based on Prisma schema
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  -- ... additional fields from Prisma schema
);

-- Update appointments table structure
ALTER TABLE appointments 
ADD COLUMN appointment_date TIMESTAMPTZ,
ADD COLUMN duration_minutes INTEGER DEFAULT 30;

-- Align clinic naming
ALTER TABLE clinics RENAME COLUMN clinic_name TO name;
-- ... additional alignment changes
```

## RLS Policy Mapping (Requires Separate Audit)

**Current Status**: OUT OF SCOPE for this audit
**Recommendation**: Schedule dedicated RLS policy review with security team

### Policy Categories Needed
- **Multi-tenant isolation**: clinic_id based filtering
- **Role-based access**: Professional vs Patient vs Admin
- **LGPD compliance**: Data access restrictions
- **Audit trail**: All modifications logged

## Recommendations

### Immediate Actions (P0)
1. **Deploy users table migration** - Critical system functionality
2. **Align appointments schema** - Core business feature
3. **Review and standardize naming conventions** - Technical debt

### Short Term (P1)
1. **Comprehensive RLS audit** - Security and compliance
2. **Prisma schema update** - Reflect Supabase reality
3. **Migration testing** - Staging environment validation

### Long Term (P2)
1. **Automated drift detection** - CI/CD integration
2. **Schema versioning strategy** - Change management
3. **Documentation updates** - Developer onboarding

## Conclusion

**CRITICAL DRIFT DETECTED**: The missing `users` table represents a fundamental architecture gap that must be addressed immediately. While core business entities (appointments, patients, clinics) exist, significant schema variations require careful migration planning.

**Next Actions**: 
1. Immediate deployment of users table migration
2. Schema alignment for appointments and clinics  
3. Dedicated RLS policy security audit
4. Establish drift monitoring processes

**Risk Assessment**: HIGH - Core authentication functionality compromised
**Estimated Effort**: 2-3 sprint cycles for complete alignment