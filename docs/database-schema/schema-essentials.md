---
title: "Database Schema Essentials"
last_updated: 2025-09-24
form: reference
tags: [database, schema, essential, supabase]
related:
  - ./AGENTS.md
  - ../apis/AGENTS.md
---

# Database Schema Essentials — Reference

## Core Tables

### Users & Authentication

```sql
-- users (managed by Supabase Auth)
-- profiles table for additional user data
```

### Healthcare Core

```sql
-- patients
-- appointments  
-- treatments
-- professionals
```

### Compliance

```sql
-- audit_logs
-- consent_records
-- data_retention_policies
```

## Key Migrations

```bash
# Run migrations
bunx prisma migrate dev

# Reset database
bunx prisma migrate reset

# Generate client
bunx prisma generate
```

## RLS Policies

- Row Level Security enabled on all tables
- Policies enforce clinic-based isolation
- LGPD compliance built-in

## Performance

- Indexes on frequently queried columns
- Connection pooling configured
- Query optimization enabled

## See Also

- [Database Control](./AGENTS.md)
- [API Documentation](../apis/AGENTS.md)
