# NeonPro Database Schema Documentation - Version: 2.0.0

## Overview

This documentation covers the NeonPro AI Healthcare Platform database schema, built on **Supabase PostgreSQL 17** with advanced healthcare compliance features. The database supports over 200 tables organized around core business domains: patient management, AI-powered features, compliance tracking, and financial operations.

### Key Features

- **LGPD/ANVISA/CFM Compliance**: Built-in regulatory compliance for Brazilian healthcare
- **Row Level Security (RLS)**: Constitutional security patterns for healthcare data
- **AI Integration**: Native support for Vercel AI SDK and healthcare AI features
- **Audit Trail**: Immutable logging for all medical data operations
- **Multi-tenant Architecture**: Secure clinic isolation and data segregation

### Database Architecture

- **Engine**: PostgreSQL 17.4.1.057 on Supabase
- **Region**: South America East (sa-east-1)
- **Extensions**: pgvector for AI embeddings, various healthcare-specific extensions
- **Performance**: Optimized for <200ms critical healthcare operations

## Supabase Integration Guidelines

### Client Configuration (Following .ruler/supabase.md)

- **Centralized Setup**: All Supabase clients in `lib/supabase/` (client, server-rls, admin)
- **Environment Variables**: Store credentials securely in `.env.local`
- **RLS First**: Use Row Level Security for all healthcare data access
- **Service Role Caution**: Admin client usage requires explicit validation
- **MCP Integration**: Use Supabase MCP tools for database operations

### Healthcare Security Patterns

```typescript
// Client factory for RLS-enabled operations
const supabase = createClient(); // Uses anon key + RLS

// Service role for admin operations (use carefully)
const adminClient = createAdminClient(); // Bypasses RLS

// Example healthcare RLS policy
CREATE POLICY "professionals_access_own_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professional_patient_access
      WHERE patient_id = patients.id
      AND professional_id = auth.uid()
    )
  );
```

## Database Schema Instructions

### File Organization Structure Example

```
docs/database-schema/
├── tables/
│   ├── users.md
│   ├── events.md
│   ├── registrations.md
│   └── [other-tables].md
├── functions.md
├── triggers.md
├── relationships.md
└── enums.md
```

### Table Organization by Domain

The NeonPro database contains **200+ tables** organized into logical domains:

#### Core Business Tables (Priority 1)

- **patients** - Patient records and demographics
- **appointments** - Appointment scheduling and management
- **professionals** - Healthcare professionals and staff
- **clinics** - Clinic information and settings
- **services** - Medical services and procedures

#### AI & Intelligence Tables (Priority 2)

- **ai_chat_sessions** - AI chat conversation sessions
- **ai_chat_messages** - Individual AI chat messages
- **ai_no_show_predictions** - No-show prediction analytics
- **ai_performance_metrics** - AI system performance tracking

#### Compliance & Audit Tables (Priority 3)

- **compliance_tracking** - LGPD/ANVISA compliance monitoring
- **audit_logs** - System audit trail
- **medical_records** - Protected medical information
- **consent_records** - Patient consent management

### Required Files

#### 1. Tables Folder (`tables/`)

- **Purpose**: Each core table gets its own file (YAGNI approach - only document essential tables)
- **Naming**: Use exact table name as filename (e.g., `patients.md`, `appointments.md`)
- **Content**: Schema, relationships, RLS policies, and healthcare compliance notes

#### 2. Functions (`functions.md`)

- **Purpose**: Document all custom database functions
- **Content**: Function signatures, parameters, return types, purpose

#### 3. Triggers (`triggers.md`)

- **Purpose**: Document all database triggers
- **Content**: Trigger name, table, event, function called

#### 4. Relationships (`relationships.md`)

- **Purpose**: Document foreign key relationships
- **Content**: Simple list of FK relationships and cascade actions

#### 5. Enums (`enums.md`)

- **Purpose**: Document custom enum types
- **Content**: Enum name and possible values

### How to Document Each Component

#### Healthcare Table Documentation Template

````markdown
# Table Name

## Schema

| Column     | Type        | Constraints  | Default           | Description        | LGPD Classification |
| ---------- | ----------- | ------------ | ----------------- | ------------------ | ------------------- |
| id         | uuid        | PRIMARY KEY  | gen_random_uuid() | Primary identifier | Public              |
| patient_id | uuid        | FK, NOT NULL | -                 | Patient reference  | Personal Data       |
| created_at | timestamptz | NOT NULL     | NOW()             | Record creation    | Metadata            |

## Healthcare Compliance

**LGPD Status**: ✅ **Compliant** - Contains personal/sensitive data
**ANVISA Requirements**: Medical device software compliance (Class IIa)
**Data Retention**: 7 years (Brazilian medical records law)

## Relationships

- `patients.id` ← `table_name.patient_id` (CASCADE DELETE for LGPD Right to Erasure)
- `professionals.id` ← `table_name.professional_id` (RESTRICT - preserve audit trail)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Healthcare data protection mandatory

### Current Policies

```sql
-- Professionals access only their patients
CREATE POLICY "professionals_own_patients" ON table_name
  FOR ALL USING (
    professional_id = auth.uid() OR
    EXISTS (SELECT 1 FROM professional_patient_access
            WHERE patient_id = table_name.patient_id
            AND professional_id = auth.uid())
  );

-- Patients access own data only
CREATE POLICY "patients_own_data" ON table_name
  FOR SELECT USING (patient_id = auth.uid());
```

### Audit Requirements

**Triggers**: ✅ Audit trail enabled for all CUD operations
**Encryption**: ✅ AES-256 for sensitive fields
**Anonymization**: ✅ LGPD compliance functions available
````

````
#### Functions Documentation Template
```markdown
# Database Functions

## Function Name
**Purpose**: What the function does
**Parameters**: Input parameters and types
**Returns**: Return type and description
**Usage**: When and how to use it

```sql
CREATE OR REPLACE FUNCTION function_name(param1 type1)
RETURNS return_type AS $$
-- Function body
$$ LANGUAGE plpgsql;
````

````
#### Triggers Documentation Template
```markdown
# Database Triggers

## Trigger Name
**Table**: Which table the trigger is on
**Event**: INSERT/UPDATE/DELETE
**Timing**: BEFORE/AFTER
**Function**: Which function it calls
**Purpose**: What it accomplishes

```sql
CREATE TRIGGER trigger_name
  AFTER INSERT ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION function_name();
````

````
### Healthcare Documentation Rules

1. **LGPD Compliance First**: Always classify data types (Public, Personal, Sensitive, Medical)
2. **RLS Mandatory**: All healthcare tables MUST have RLS enabled and documented
3. **Audit Trail Required**: Document audit triggers and compliance logging
4. **Current State Only**: Document actual database implementation, no speculation
5. **Security Focus**: Emphasize data protection, encryption, and access controls
6. **Consistent Templates**: Follow healthcare-specific templates exactly
7. **Professional Access**: Document how healthcare professionals access patient data
8. **Data Retention**: Specify Brazilian healthcare data retention requirements

### NeonPro Healthcare Best Practices

1. **Compliance First**: Ensure all changes meet LGPD/ANVISA/CFM requirements before implementation
2. **RLS by Design**: Every new table with healthcare data MUST have RLS policies from creation
3. **Audit Everything**: All patient data operations require audit trail triggers
4. **Test in Staging**: Healthcare changes must be tested in staging environment first
5. **Document Security**: Always document encryption, access patterns, and data classification
6. **Migration Safety**: Use Supabase migrations for all schema changes with rollback plans
7. **Professional Validation**: Healthcare professionals must validate data access patterns
8. **Performance Monitoring**: Healthcare operations must maintain <200ms response times
9. **Backup Verification**: Verify backup integrity for critical healthcare data
10. **Incident Response**: Document procedures for healthcare data security incidents

### Example Documentation

#### Example Healthcare Table File (`tables/patients.md`)
```markdown
# Patients Table

## Schema
| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique patient identifier | Public |
| cpf | text | UNIQUE, ENCRYPTED | - | Brazilian CPF (encrypted) | Sensitive Personal Data |
| name | text | NOT NULL, ENCRYPTED | - | Patient full name (encrypted) | Personal Data |
| birth_date | date | ENCRYPTED | - | Date of birth (encrypted) | Personal Data |
| created_at | timestamptz | NOT NULL | NOW() | Record creation time | Metadata |
| clinic_id | uuid | FK, NOT NULL | - | Clinic reference | Organizational Data |

## Healthcare Compliance
**LGPD Status**: ✅ **Compliant** - Contains sensitive personal and health data
**ANVISA Requirements**: Patient data for medical device software (Class IIa)
**Data Retention**: 7 years minimum (Brazilian medical records law)

## Relationships
- `clinics.id` ← `patients.clinic_id` (RESTRICT - preserve records)
- `appointments.patient_id` → `patients.id` (CASCADE DELETE for LGPD erasure)

## Row Level Security (RLS)
**Status**: ✅ **Enabled** - Healthcare data protection mandatory

### Current Policies
```sql
-- Professionals access patients in their clinics only
CREATE POLICY "professionals_clinic_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = patients.clinic_id
      AND p.active = true
    )
  );

-- Patients access own data only
CREATE POLICY "patients_own_data" ON patients
  FOR SELECT USING (auth.uid()::text = id);
````

````
#### Example Functions File (`functions.md`)
```markdown
# Database Functions

## generate_user_id
**Purpose**: Generate unique user identifier
**Parameters**: None
**Returns**: text
**Usage**: Called automatically on user creation

```sql
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS text AS $$
BEGIN
  RETURN 'usr_' || substr(md5(random()::text), 1, 12);
END;
$$ LANGUAGE plpgsql;
````

````
#### Example Triggers File (`triggers.md`)
```markdown
# Database Triggers

## update_user_timestamp
**Table**: users
**Event**: UPDATE
**Timing**: BEFORE
**Function**: update_timestamp()
**Purpose**: Automatically update updated_at column

```sql
CREATE TRIGGER update_user_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
````

```

## NeonPro Supabase Extensions & Features

### Enabled Extensions
- **pgvector**: Vector similarity search for AI embeddings
- **uuid-ossp**: UUID generation for primary keys
- **pgcrypto**: Encryption functions for sensitive healthcare data
- **pg_audit**: Audit logging for compliance requirements

### Supabase Features in Use
- **Row Level Security**: Constitutional security for all healthcare data
- **Real-time Subscriptions**: Live updates for appointment scheduling
- **Edge Functions**: AI processing with healthcare compliance
- **Database Triggers**: Automated audit trail and compliance logging
- **Auth Integration**: Professional authentication with CFM validation

### Performance Optimizations
- **Connection Pooling**: PgBouncer for high-concurrency healthcare operations
- **Read Replicas**: Geographic distribution for Brazilian healthcare market
- **Prepared Statements**: Optimized queries for healthcare workflows
- **Index Strategy**: Healthcare-specific indexing for <200ms response times

---

> **Healthcare Compliance Note**: This documentation is maintained according to Brazilian healthcare regulations (LGPD, ANVISA, CFM). All schema changes must preserve audit trails and comply with medical data protection requirements.

> **Last Updated**: August 28, 2025 - NeonPro Database Schema v2.0.0
```
