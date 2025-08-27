# Supabase MCP Configuration

## ✅ Project Configuration

- **Project ID**: `ownkoxryswokcdanrdgj`
- **Project Name**: NeonPro Brasil
- **Region**: sa-east-1 (São Paulo)
- **Status**: ACTIVE_HEALTHY
- **Database Version**: 17.4.1.057
- **Project URL**: https://ownkoxryswokcdanrdgj.supabase.co
- **Anonymous Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E

## ✅ MCP Tools Available

All Supabase MCP tools are configured and ready:

### Core Project Management

- `list_projects()` - ✅ Validated: 4 projects accessible
- `get_project(project_id)` - ✅ Available
- `get_project_url(project_id)` - ✅ Tested
- `get_anon_key(project_id)` - ✅ Retrieved

### Database Operations

- `list_tables(project_id, schemas)` - ✅ Available
- `execute_sql(project_id, query)` - ✅ Available
- `apply_migration(project_id, name, query)` - ✅ Available

### Type Safety & Development

- `generate_typescript_types(project_id)` - ✅ Available (large response - use carefully)

### Security & Monitoring

- `get_advisors(project_id, type)` - ✅ Configured
- `get_logs(project_id, service)` - ✅ Available

### Documentation & Support

- `search_docs(graphql_query)` - ✅ Available

## 🔒 Security Advisors Detected

Current security issues that need attention:

### Critical Issues (ERROR Level):

1. **Security Definer Views** - 3 views need review:
   - `public.ml_model_performance`
   - `public.ab_test_summary`
   - `public.drift_detection_summary`
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)

### Warnings (WARN Level):

1. **Function Search Path Mutable**
   - `public.update_updated_at_column` function needs secure search_path
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

2. **Extensions in Public Schema**
   - `pg_trgm` extension should be moved to another schema
   - `btree_gist` extension should be moved to another schema
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)

3. **Auth Leaked Password Protection Disabled**
   - Enable leaked password protection in Auth settings
   - [Fix Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

## 🚀 Environment Variables Setup

Add to your `.env.local`:

```bash
# Supabase Configuration (NeonPro Brasil)
NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E
SUPABASE_PROJECT_ID=ownkoxryswokcdanrdgj

# For service role operations (keep secure)
# SUPABASE_SERVICE_ROLE_KEY=[obtain separately for production]
```

## 📊 Monitoring Setup

### Health Monitoring Commands:

```javascript
// Check project health
await mcp__supabase - mcp__get_project("ownkoxryswokcdanrdgj");

// Monitor security
await mcp__supabase - mcp__get_advisors("ownkoxryswokcdanrdgj", "security");

// Monitor performance
await mcp__supabase - mcp__get_advisors("ownkoxryswokcdanrdgj", "performance");

// Check logs
await mcp__supabase - mcp__get_logs("ownkoxryswokcdanrdgj", "api");
```

## 🔧 Development Workflow

### 1. Use MCP Tools for All Database Operations

```javascript
// Instead of direct SQL, use MCP tools:
const tables = await mcp__supabase - mcp__list_tables("ownkoxryswokcdanrdgj");
const result = await mcp__supabase
  - mcp__execute_sql("ownkoxryswokcdanrdgj", "SELECT * FROM users LIMIT 10");
```

### 2. Type Generation

```bash
# Generate types for development (use carefully due to large response)
# Run during build process, not in development
```

### 3. Migration Management

```javascript
// Apply migrations via MCP
await mcp__supabase - mcp__apply_migration(
  "ownkoxryswokcdanrdgj",
  "add_user_preferences",
  `
  CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`,
);
```

## ✅ Integration Checklist

- [x] Project connection validated
- [x] API URL and keys configured
- [x] Security monitoring setup
- [x] Environment variables documented
- [x] MCP tools integration ready
- [ ] Security issues resolution (next steps)
- [ ] Performance monitoring setup (large dataset)
- [ ] CI/CD integration with MCP tools

## 🎯 Next Steps

1. **Fix Security Issues**: Address the 7 security advisors identified
2. **Performance Review**: Setup performance monitoring workflow
3. **CI/CD Integration**: Add MCP tools to deployment pipeline
4. **Team Training**: Document MCP usage patterns for developers
5. **Type Generation**: Setup automated type generation in build process

---

✅ **Supabase MCP Configuration Complete**\
All core tools are operational and ready for development use.
