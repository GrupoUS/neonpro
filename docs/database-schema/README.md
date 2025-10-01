# Database Documentation

## Overview

The NeonPro Healthcare Platform uses Supabase as the backend database service. Supabase provides a PostgreSQL database with real-time capabilities, authentication, storage, and edge functions.

## Architecture

### PostgreSQL

The database is built on PostgreSQL, a powerful, open-source relational database system. PostgreSQL provides:

- ACID compliance for data integrity
- Advanced indexing for performance
- Full-text search capabilities
- JSON support for flexible data structures
- Row-level security for fine-grained access control

### Supabase

Supabase provides a layer of services on top of PostgreSQL:

- Real-time subscriptions for live data updates
- Authentication with JWT tokens
- Storage for files and media
- Edge functions for serverless computing
- Database migrations and schema management

## Schema

### Tables

#### architecture_configs

Stores architecture configuration data for different environments.

```sql
CREATE TABLE architecture_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  edge_enabled BOOLEAN NOT NULL DEFAULT true,
  supabase_functions_enabled BOOLEAN NOT NULL DEFAULT true,
  bun_enabled BOOLEAN NOT NULL DEFAULT true,
  performance_metrics JSONB NOT NULL,
  compliance_status JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(environment)
);
```

#### package_manager_configs

Stores package manager configuration data.

```sql
CREATE TABLE package_manager_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  package_manager TEXT NOT NULL CHECK (package_manager IN ('npm', 'pnpm', 'yarn', 'bun')),
  build_performance JSONB NOT NULL,
  bundle_size JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### migration_states

Stores migration state data for different environments.

```sql
CREATE TABLE migration_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  phase TEXT NOT NULL CHECK (phase IN ('setup', 'tests', 'implementation', 'integration', 'polish')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  tasks JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(environment)
);
```

#### performance_metrics

Stores performance metrics data for different environments.

```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  edge_performance JSONB NOT NULL,
  realtime_performance JSONB NOT NULL,
  ai_performance JSONB NOT NULL,
  build_performance JSONB NOT NULL,
  system_performance JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(environment)
);
```

#### compliance_statuses

Stores compliance status data for different environments.

```sql
CREATE TABLE compliance_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  lgpd JSONB NOT NULL,
  anvisa JSONB NOT NULL,
  cfm JSONB NOT NULL,
  wcag JSONB NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(environment)
);
```

#### compliance_checks

Stores compliance check data.

```sql
CREATE TABLE compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id UUID NOT NULL REFERENCES compliance_statuses(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  framework TEXT NOT NULL CHECK (framework IN ('LGPD', 'ANVISA', 'CFM', 'WCAG')),
  status TEXT NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'pending')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_check TIMESTAMP WITH TIME ZONE NOT NULL,
  issues_found INTEGER NOT NULL DEFAULT 0,
  issues_resolved INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  tags JSONB NOT NULL,
  assignee TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### compliance_issues

Stores compliance issue data.

```sql
CREATE TABLE compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_id UUID NOT NULL REFERENCES compliance_statuses(id) ON DELETE CASCADE,
  regulation TEXT NOT NULL CHECK (regulation IN ('LGPD', 'ANVISA', 'CFM', 'WCAG')),
  requirement TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
```

#### performance_metrics_history

Stores historical performance metrics data.

```sql
CREATE TABLE performance_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metrics_id UUID NOT NULL REFERENCES performance_metrics(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('edgePerformance', 'realtimePerformance', 'aiPerformance', 'buildPerformance', 'systemPerformance')),
  metric JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Views

#### architecture_configs_with_metrics

A view that joins architecture configs with performance metrics.

```sql
CREATE VIEW architecture_configs_with_metrics AS
SELECT
  ac.id,
  ac.name,
  ac.environment,
  ac.edge_enabled,
  ac.supabase_functions_enabled,
  ac.bun_enabled,
  ac.performance_metrics,
  ac.compliance_status,
  ac.created_at,
  ac.updated_at,
  pm.edge_performance,
  pm.realtime_performance,
  pm.ai_performance,
  pm.build_performance,
  pm.system_performance
FROM architecture_configs ac
LEFT JOIN performance_metrics pm ON ac.environment = pm.environment;
```

#### compliance_statuses_with_checks

A view that joins compliance statuses with compliance checks.

```sql
CREATE VIEW compliance_statuses_with_checks AS
SELECT
  cs.id,
  cs.name,
  cs.environment,
  cs.lgpd,
  cs.anvisa,
  cs.cfm,
  cs.wcag,
  cs.overall_score,
  cs.last_updated,
  cs.created_at,
  cs.updated_at,
  COUNT(cc.id) AS total_checks,
  COUNT(CASE WHEN cc.status = 'compliant' THEN 1 END) AS compliant_checks,
  COUNT(CASE WHEN cc.status = 'non_compliant' THEN 1 END) AS non_compliant_checks,
  COUNT(CASE WHEN cc.status = 'pending' THEN 1 END) AS pending_checks
FROM compliance_statuses cs
LEFT JOIN compliance_checks cc ON cs.id = cc.status_id
GROUP BY cs.id, cs.name, cs.environment, cs.lgpd, cs.anvisa, cs.cfm, cs.wcag, cs.overall_score, cs.last_updated, cs.created_at, cs.updated_at;
```

### Functions

#### update_updated_at_column()

A function that updates the updated_at column automatically.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

#### record_performance_metric()

A function that records a performance metric.

```sql
CREATE OR REPLACE FUNCTION record_performance_metric(
  metrics_id UUID,
  metric_type TEXT,
  metric JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO performance_metrics_history (metrics_id, metric_type, metric)
  VALUES (metrics_id, metric_type, metric);

  UPDATE performance_metrics
  SET
    edge_performance = CASE WHEN metric_type = 'edgePerformance' THEN metric ELSE edge_performance END,
    realtime_performance = CASE WHEN metric_type = 'realtimePerformance' THEN metric ELSE realtime_performance END,
    ai_performance = CASE WHEN metric_type = 'aiPerformance' THEN metric ELSE ai_performance END,
    build_performance = CASE WHEN metric_type = 'buildPerformance' THEN metric ELSE build_performance END,
    system_performance = CASE WHEN metric_type = 'systemPerformance' THEN metric ELSE system_performance END,
    updated_at = NOW()
  WHERE id = metrics_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### run_compliance_check()

A function that runs a compliance check.

```sql
CREATE OR REPLACE FUNCTION run_compliance_check(
  status_id UUID,
  framework TEXT,
  check_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  check_result JSONB;
  check_id UUID;
BEGIN
  -- Run the compliance check (simplified for this example)
  check_result := jsonb_build_object(
    'status', 'compliant',
    'score', 95,
    'issuesFound', 0,
    'issuesResolved', 0,
    'description', 'Compliance check passed',
    'recommendations', ARRAY[]::TEXT[],
    'tags', ARRAY[]::TEXT[],
    'assignee', 'compliance-officer'
  );

  -- Insert the compliance check
  INSERT INTO compliance_checks (
    status_id,
    check_type,
    framework,
    status,
    severity,
    score,
    last_checked,
    next_check,
    issues_found,
    issues_resolved,
    description,
    recommendations,
    tags,
    assignee
  )
  VALUES (
    status_id,
    check_type,
    framework,
    check_result->>'status',
    'low',
    (check_result->>'score')::INTEGER,
    NOW(),
    NOW() + INTERVAL '1 month',
    (check_result->>'issuesFound')::INTEGER,
    (check_result->>'issuesResolved')::INTEGER,
    check_result->>'description',
    check_result->'recommendations',
    check_result->'tags',
    check_result->>'assignee'
  )
  RETURNING id INTO check_id;

  -- Return the check result with the ID
  check_result := jsonb_set(check_result, '{id}', to_jsonb(check_id));

  RETURN check_result;
END;
$$ LANGUAGE plpgsql;
```

### Triggers

#### update_architecture_configs_updated_at

A trigger that updates the updated_at column for architecture_configs.

```sql
CREATE TRIGGER update_architecture_configs_updated_at
  BEFORE UPDATE ON architecture_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### update_package_manager_configs_updated_at

A trigger that updates the updated_at column for package_manager_configs.

```sql
CREATE TRIGGER update_package_manager_configs_updated_at
  BEFORE UPDATE ON package_manager_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### update_migration_states_updated_at

A trigger that updates the updated_at column for migration_states.

```sql
CREATE TRIGGER update_migration_states_updated_at
  BEFORE UPDATE ON migration_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### update_performance_metrics_updated_at

A trigger that updates the updated_at column for performance_metrics.

```sql
CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### update_compliance_statuses_updated_at

A trigger that updates the updated_at column for compliance_statuses.

```sql
CREATE TRIGGER update_compliance_statuses_updated_at
  BEFORE UPDATE ON compliance_statuses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### update_compliance_checks_updated_at

A trigger that updates the updated_at column for compliance_checks.

```sql
CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Security

### Row Level Security (RLS)

Row Level Security (RLS) is enabled on all tables to ensure that users can only access data they are authorized to access.

#### Policies

##### architecture_configs

```sql
-- Enable RLS
ALTER TABLE architecture_configs ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view architecture configs for their environment" ON architecture_configs
  FOR SELECT USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );

CREATE POLICY "Users can update architecture configs for their environment" ON architecture_configs
  FOR UPDATE USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );
```

##### package_manager_configs

```sql
-- Enable RLS
ALTER TABLE package_manager_configs ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view all package manager configs" ON package_manager_configs
  FOR SELECT USING (true);

CREATE POLICY "Admins can update package manager configs" ON package_manager_configs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

##### migration_states

```sql
-- Enable RLS
ALTER TABLE migration_states ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view migration states for their environment" ON migration_states
  FOR SELECT USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );

CREATE POLICY "Users can update migration states for their environment" ON migration_states
  FOR UPDATE USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );
```

##### performance_metrics

```sql
-- Enable RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view performance metrics for their environment" ON performance_metrics
  FOR SELECT USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );

CREATE POLICY "Users can update performance metrics for their environment" ON performance_metrics
  FOR UPDATE USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );
```

##### compliance_statuses

```sql
-- Enable RLS
ALTER TABLE compliance_statuses ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view compliance statuses for their environment" ON compliance_statuses
  FOR SELECT USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );

CREATE POLICY "Users can update compliance statuses for their environment" ON compliance_statuses
  FOR UPDATE USING (
    environment = (
      SELECT current_setting('app.current_environment', true)
    )
  );
```

##### compliance_checks

```sql
-- Enable RLS
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view compliance checks for their environment" ON compliance_checks
  FOR SELECT USING (
    status_id IN (
      SELECT id FROM compliance_statuses
      WHERE environment = (
        SELECT current_setting('app.current_environment', true)
      )
    )
  );

CREATE POLICY "Compliance officers can update compliance checks" ON compliance_checks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'compliance_officer')
    )
  );
```

##### compliance_issues

```sql
-- Enable RLS
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view compliance issues for their environment" ON compliance_issues
  FOR SELECT USING (
    status_id IN (
      SELECT id FROM compliance_statuses
      WHERE environment = (
        SELECT current_setting('app.current_environment', true)
      )
    )
  );

CREATE POLICY "Compliance officers can update compliance issues" ON compliance_issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'compliance_officer')
    )
  );
```

## Migrations

### Setup

To set up the database, run the following script:

```bash
bun packages/database/scripts/setup.ts
```

This script will:

1. Create the database schema
2. Enable RLS on all tables
3. Create the necessary policies
4. Seed the database with initial data

### Migration

To run database migrations, run the following script:

```bash
bun packages/database/scripts/migrate.ts
```

This script will:

1. Run any pending migrations
2. Update the database schema
3. Enable RLS on new tables
4. Create the necessary policies

### Seeding

To seed the database with test data, run the following script:

```bash
bun packages/database/scripts/seed.ts
```

This script will:

1. Seed the database with test data
2. Create test users
3. Create test configurations
4. Create test metrics

### Reset

To reset the database, run the following script:

```bash
bun packages/database/scripts/reset.ts
```

This script will:

1. Drop all tables
2. Recreate the database schema
3. Enable RLS on all tables
4. Create the necessary policies
5. Seed the database with initial data

## Real-time

### Subscriptions

The database supports real-time subscriptions using Supabase. You can subscribe to changes in any table:

```javascript
// Subscribe to changes in architecture_configs
const subscription = supabase
  .channel('architecture_configs')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'architecture_configs'
    },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe()
```

### Broadcast

The database supports broadcasting messages to clients:

```javascript
// Broadcast a message
supabase
  .channel('system')
  .send({
    type: 'broadcast',
    event: 'system-update',
    payload: { message: 'System updated' }
  })
```

## Performance

### Indexing

The database is optimized with indexes for frequently queried columns:

```sql
-- Indexes for architecture_configs
CREATE INDEX idx_architecture_configs_environment ON architecture_configs(environment);
CREATE INDEX idx_architecture_configs_created_at ON architecture_configs(created_at);

-- Indexes for migration_states
CREATE INDEX idx_migration_states_environment ON migration_states(environment);
CREATE INDEX idx_migration_states_status ON migration_states(status);
CREATE INDEX idx_migration_states_phase ON migration_states(phase);

-- Indexes for performance_metrics
CREATE INDEX idx_performance_metrics_environment ON performance_metrics(environment);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);

-- Indexes for compliance_statuses
CREATE INDEX idx_compliance_statuses_environment ON compliance_statuses(environment);
CREATE INDEX idx_compliance_statuses_overall_score ON compliance_statuses(overall_score);

-- Indexes for compliance_checks
CREATE INDEX idx_compliance_checks_status_id ON compliance_checks(status_id);
CREATE INDEX idx_compliance_checks_framework ON compliance_checks(framework);
CREATE INDEX idx_compliance_checks_status ON compliance_checks(status);

-- Indexes for compliance_issues
CREATE INDEX idx_compliance_issues_status_id ON compliance_issues(status_id);
CREATE INDEX idx_compliance_issues_regulation ON compliance_issues(regulation);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);

-- Indexes for performance_metrics_history
CREATE INDEX idx_performance_metrics_history_metrics_id ON performance_metrics_history(metrics_id);
CREATE INDEX idx_performance_metrics_history_metric_type ON performance_metrics_history(metric_type);
CREATE INDEX idx_performance_metrics_history_timestamp ON performance_metrics_history(timestamp);
```

### Connection Pooling

The database uses connection pooling to optimize performance:

```javascript
// Configure connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
})
```

## Backup

### Automated Backups

The database is automatically backed up by Supabase:

- Daily backups are retained for 30 days
- Weekly backups are retained for 4 weeks
- Monthly backups are retained for 12 months

### Manual Backups

To create a manual backup, run the following script:

```bash
bun packages/database/scripts/backup.ts
```

This script will:

1. Create a backup of the database
2. Store the backup in a secure location
3. Log the backup for audit purposes

## Monitoring

### Performance Metrics

The database performance is monitored using:

- Query execution time
- Connection count
- Memory usage
- Disk usage
- CPU usage

### Error Tracking

The database errors are tracked using:

- Error logs
- Error notifications
- Error reports

## Compliance

### LGPD Compliance

The database is compliant with LGPD:

- Data minimization
- Data retention
- Data portability
- Right to be forgotten

### ANVISA Compliance

The database is compliant with ANVISA:

- Medical device regulations
- Quality management
- Clinical evaluation
- Post-market surveillance

### CFM Compliance

The database is compliant with CFM:

- Medical ethics
- Professional conduct
- Patient safety
- Medical records

### WCAG Compliance

The database is compliant with WCAG:

- Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast

## Conclusion

The NeonPro Healthcare Platform database is designed to be secure, performant, and compliant with healthcare regulations. It uses PostgreSQL with Supabase to provide a powerful, scalable, and reliable backend for the platform.
