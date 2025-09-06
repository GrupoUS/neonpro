---
title: "Prisma–Supabase Parity & RLS Audit"
last_updated: 2025-09-05
form: reference
---

# Prisma–Supabase Parity & RLS Audit (Skeleton)

## Scope
- Ensure Prisma schema (SoT) matches live Supabase Postgres.
- Document and validate RLS policies per entity.
- Confirm multi-tenant and LGPD constraints are enforced.

## Sources
- Prisma SoT: `packages/database/prisma/schema.prisma`
- App schema: `apps/web/prisma/schema.prisma` (temporary duplicate)
- Supabase: project policies and table definitions
## Model Inventory (from SoT)
- User, Clinic, Patient, HealthcareProfessional, Appointment
- Enums: UserRole, UserStatus, AppointmentStatus, AppointmentType, NotificationType (...)

## Parity Checklist
- Columns/types/defaults match DB
- Indexes/unique constraints present
- Relations and onDelete behaviors aligned
- Migrations linear and applied to target env

## Drift Detection
- Prisma migrate status vs DB
- Introspection diff report
- Manual review of critical tables (users, patients, appointments)
## RLS Policy Mapping (Template)
For each table:
- Policies list (name, predicate)
- Auth context used (JWT claims, tenant id)
- Required roles (roles/claims)
- Read/Write separation

Example — appointments:
- tenant read: clinic_id == jwt.clinic_id
- owner write: created_by == auth.uid() OR role in [DOCTOR,NURSE]
- auditor read: role == AUDITOR

## Next Actions
- Extract Supabase policies via CLI/SQL and paste here
- Validate each policy against model semantics
- Propose missing/incorrect policies with SQL
