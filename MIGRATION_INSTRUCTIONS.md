
# Supabase Migration Instructions for NEON PRO

This document contains step-by-step instructions for migrating your NEON PRO application from the current Supabase project to the new "GPUS" Supabase project.

## 1. Update Application Configuration

1. Locate the file `src/integrations/supabase/client.ts`
2. Replace the placeholder values with your actual GPUS Supabase credentials:
   - Replace `YOUR_NEW_GPUS_SUPABASE_URL` with your new Supabase URL (e.g., `https://yourproject.supabase.co`)
   - Replace `YOUR_NEW_GPUS_SUPABASE_ANON_KEY` with your new Supabase anon key
3. Update `supabase/config.toml` with your new GPUS project ID

## 2. Manual Migration Steps (REQUIRED)

### A. Set Up New "GPUS" Supabase Project

1. Create a new project named "GPUS" in your Supabase dashboard
2. Note the Project URL and anon key for updating your codebase

### B. Database Schema Migration

1. **Export Schema from Old Project:**
   - Use Supabase's SQL Editor to execute:
     ```sql
     SELECT 'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' || 
     string_agg(column_name || ' ' || data_type || 
     CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END || 
     CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END, ', ') 
     || ');' 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     GROUP BY table_name;
     ```
   - Alternatively, if you have Supabase CLI access:
     ```bash
     supabase db dump --schema-only -f schema.sql
     ```

2. **Import Schema to "GPUS" Project:**
   - Apply the exported DDL statements in the SQL Editor of your new "GPUS" project
   - Pay special attention to create all tables with the same structure

### C. Data Migration

1. **Export Data from Old Project:**
   - For each table, in the SQL Editor:
     ```sql
     SELECT * FROM public.table_name;
     ```
   - Download the results as CSV

2. **Import Data to "GPUS" Project:**
   - Use the "Table Editor" in Supabase to import each CSV into the corresponding table
   - Or use SQL Insert statements for bulk imports

3. **`auth.users` Migration:**
   - For user migration, consider one of these approaches:
     - Export users with password hashes (requires Supabase Pro plan or direct database access)
     - Have users reset passwords (simpler but requires user action)
     - Contact Supabase support for assistance with direct user migration

### D. Re-configure Authentication Providers

1. In the "GPUS" Supabase dashboard, navigate to Authentication > Providers
2. Re-configure Google OAuth and any other providers you were using:
   - Update callback URLs in the Google Cloud Console to point to your new project
   - Configure the Client ID and Secret in the Supabase auth settings

### E. Re-apply Row Level Security (RLS) Policies

1. For each table in your old project, note the RLS policies:
   ```sql
   SELECT tablename, policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

2. Apply these policies to your tables in the new project:
   ```sql
   CREATE POLICY "policy_name" ON "table_name" 
   FOR [ALL|SELECT|INSERT|UPDATE|DELETE]
   TO [authenticated|anon|role_name]
   USING (using_expression)
   [WITH CHECK (with_check_expression)];
   ```

### F. Re-create Database Functions & Triggers

1. Export functions from the old project:
   ```sql
   SELECT pg_get_functiondef(oid)
   FROM pg_proc
   WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
   ```

2. Export triggers:
   ```sql
   SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   ```

3. Apply these functions and triggers to the new "GPUS" project

### G. Storage Migration (if applicable)

1. Download all files from your existing buckets
2. Create matching buckets in your "GPUS" project
3. Upload the files to the new buckets
4. Re-apply any bucket policies

### H. Thorough Testing

After completing all the above steps:

1. Test user authentication (signup, login, password reset)
2. Test all data operations (create, read, update, delete)
3. Verify that user-specific views work correctly
4. Check that all application functions continue to work as expected

## Important Notes

- **Keep both projects running** during the transition period
- **Update your frontend environment** with the new Supabase configuration
- **Consider a phased migration** if you have an active user base

For any issues during migration, refer to the [Supabase documentation](https://supabase.com/docs) or contact Supabase support.
