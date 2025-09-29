# Phase 1: Data Model - Hybrid Architecture Implementation

**Date**: 2025-09-29  
**Architecture**: Hybrid (Vercel Edge + Supabase Functions)  
**Package Manager**: Bun (target)  
**Runtime**: Node.js (current) → Bun + Edge (target)

## Core Entities

### 1. Architecture Configuration
```typescript
interface ArchitectureConfig {
  id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  edgeEnabled: boolean;
  supabaseFunctionsEnabled: boolean;
  bunEnabled: boolean;
  performanceMetrics: PerformanceMetrics;
  complianceStatus: ComplianceStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Package Management
```typescript
interface PackageManagerConfig {
  id: string;
  name: 'bun' | 'pnpm' | 'npm';
  version: string;
  scripts: BuildScripts;
  dependencies: Dependency[];
  devDependencies: Dependency[];
  buildPerformance: BuildPerformance;
  compatibility: CompatibilityMatrix;
}
```

### 3. Build Scripts
```typescript
interface BuildScripts {
  dev: string;
  build: string;
  test: string;
  lint: string;
  typeCheck: string;
  clean: string;
  db: {
    push: string;
    types: string;
    reset: string;
    studio: string;
  };
  deploy: {
    staging: string;
    production: string;
  };
}
```

### 4. Performance Metrics
```typescript
interface PerformanceMetrics {
  edgeTTFB: number; // Target: ≤ 150ms
  realtimeUIPatch: number; // Target: ≤ 1.5s
  copilotToolRoundtrip: number; // Target: ≤ 2s
  buildTime: number; // Current: baseline, Target: 3-5x improvement
  bundleSize: {
    main: number;
    vendor: number;
    total: number;
  };
  uptime: number; // Target: > 99.9%
}
```

### 5. Compliance Status
```typescript
interface ComplianceStatus {
  lgpd: {
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    issues: ComplianceIssue[];
  };
  anvisa: {
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    issues: ComplianceIssue[];
  };
  cfm: {
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    issues: ComplianceIssue[];
  };
  wcag: {
    level: '2.1 AA+' | '2.1 AAA';
    compliant: boolean;
    lastAudit: Date;
    issues: AccessibilityIssue[];
  };
}
```

### 6. Migration State
```typescript
interface MigrationState {
  id: string;
  phase: 'planning' | 'bun-migration' | 'edge-expansion' | 'security-enhancement' | 'performance-optimization' | 'complete';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  rollbackPoint?: string;
  issues: MigrationIssue[];
}
```

### 7. Edge Function Configuration
```typescript
interface EdgeFunctionConfig {
  id: string;
  name: string;
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  cachePolicy: CachePolicy;
  security: SecurityConfig;
  performance: PerformanceConfig;
  deployment: DeploymentConfig;
}
```

### 8. Supabase Function Configuration
```typescript
interface SupabaseFunctionConfig {
  id: string;
  name: string;
  runtime: 'nodejs' | 'deno';
  handler: string;
  rlsEnabled: boolean;
  jwtValidation: boolean;
  performance: PerformanceConfig;
  deployment: DeploymentConfig;
}
```

## Entity Relationships

### 1. Architecture → Components
```
ArchitectureConfig (1) → (N) PackageManagerConfig
ArchitectureConfig (1) → (N) EdgeFunctionConfig
ArchitectureConfig (1) → (N) SupabaseFunctionConfig
ArchitectureConfig (1) → (1) PerformanceMetrics
ArchitectureConfig (1) → (1) ComplianceStatus
```

### 2. Migration Tracking
```
MigrationState (1) → (N) MigrationPhase
MigrationPhase (1) → (N) MigrationTask
MigrationTask (1) → (N) MigrationIssue
```

### 3. Compliance Flow
```
ComplianceStatus (1) → (N) ComplianceAudit
ComplianceAudit (1) → (N) ComplianceIssue
ComplianceIssue (1) → (N) ComplianceAction
```

## State Transitions

### 1. Migration Phase Flow
```typescript
type MigrationPhase = 
  | 'planning'
  | 'bun-migration'
  | 'edge-expansion'
  | 'security-enhancement'
  | 'performance-optimization'
  | 'complete';

const MigrationPhaseTransitions: Record<MigrationPhase, MigrationPhase[]> = {
  planning: ['bun-migration'],
  'bun-migration': ['edge-expansion', 'planning'], // Can rollback
  'edge-expansion': ['security-enhancement', 'bun-migration'],
  'security-enhancement': ['performance-optimization', 'edge-expansion'],
  'performance-optimization': ['complete', 'security-enhancement'],
  complete: [] // Terminal state
};
```

### 2. Compliance Status Flow
```typescript
type ComplianceStatus = 'compliant' | 'non-compliant' | 'pending-review' | 'under-audit';

const ComplianceStatusTransitions: Record<ComplianceStatus, ComplianceStatus[]> = {
  compliant: ['pending-review', 'under-audit'],
  'pending-review': ['compliant', 'non-compliant', 'under-audit'],
  'under-audit': ['compliant', 'non-compliant'],
  'non-compliant': ['pending-review', 'under-audit']
};
```

## Validation Rules

### 1. Architecture Configuration Validation
```typescript
const ArchitectureConfigValidation = {
  edgeEnabled: (value: boolean) => true, // Always valid
  supabaseFunctionsEnabled: (value: boolean) => true, // Always valid
  bunEnabled: (value: boolean) => {
    // Bun requires Edge or Functions to be enabled
    if (value && !edgeEnabled && !supabaseFunctionsEnabled) {
      return false;
    }
    return true;
  },
  performanceMetrics: (metrics: PerformanceMetrics) => {
    return metrics.edgeTTFB <= 150 &&
           metrics.realtimeUIPatch <= 1.5 &&
           metrics.copilotToolRoundtrip <= 2 &&
           metrics.uptime >= 99.9;
  }
};
```

### 2. Compliance Validation
```typescript
const ComplianceValidation = {
  lgpd: (status: ComplianceStatus['lgpd']) => {
    return status.compliant && 
           status.nextAudit > new Date() &&
           status.issues.length === 0;
  },
  anvisa: (status: ComplianceStatus['anvisa']) => {
    return status.compliant && 
           status.nextAudit > new Date() &&
           status.issues.length === 0;
  },
  cfm: (status: ComplianceStatus['cfm']) => {
    return status.compliant && 
           status.nextAudit > new Date() &&
           status.issues.length === 0;
  },
  wcag: (status: ComplianceStatus['wcag']) => {
    return status.compliant && 
           status.level === '2.1 AA+' &&
           status.issues.length === 0;
  }
};
```

### 3. Migration Validation
```typescript
const MigrationValidation = {
  phaseTransition: (current: MigrationPhase, next: MigrationPhase) => {
    return MigrationPhaseTransitions[current].includes(next);
  },
  rollbackCapability: (phase: MigrationPhase) => {
    // All phases except planning can rollback
    return phase !== 'planning';
  },
  completionCriteria: (phase: MigrationPhase, progress: number) => {
    return progress === 100;
  }
};
```

## Data Storage Requirements

### 1. Database Schema
```sql
-- Architecture configurations
CREATE TABLE architecture_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  edge_enabled BOOLEAN DEFAULT false,
  supabase_functions_enabled BOOLEAN DEFAULT false,
  bun_enabled BOOLEAN DEFAULT false,
  performance_metrics JSONB NOT NULL,
  compliance_status JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration tracking
CREATE TABLE migration_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT NOT NULL CHECK (phase IN ('planning', 'bun-migration', 'edge-expansion', 'security-enhancement', 'performance-optimization', 'complete')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  rollback_point TEXT,
  issues JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package manager configurations
CREATE TABLE package_manager_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name IN ('bun', 'pnpm', 'npm')),
  version TEXT NOT NULL,
  scripts JSONB NOT NULL,
  dependencies JSONB DEFAULT '[]',
  dev_dependencies JSONB DEFAULT '[]',
  build_performance JSONB NOT NULL,
  compatibility JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function configurations
CREATE TABLE function_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('edge', 'supabase')),
  config JSONB NOT NULL,
  performance_metrics JSONB DEFAULT '{}',
  deployment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Indexes
```sql
-- Performance indexes
CREATE INDEX idx_architecture_configs_environment ON architecture_configs(environment);
CREATE INDEX idx_migration_states_phase ON migration_states(phase);
CREATE INDEX idx_migration_states_status ON migration_states(status);
CREATE INDEX idx_package_manager_configs_name ON package_manager_configs(name);
CREATE INDEX idx_function_configs_type ON function_configs(type);
CREATE INDEX idx_function_configs_deployment_status ON function_configs(deployment_status);

-- Time-based indexes
CREATE INDEX idx_architecture_configs_created_at ON architecture_configs(created_at);
CREATE INDEX idx_migration_states_created_at ON migration_states(created_at);
CREATE INDEX idx_function_configs_updated_at ON function_configs(updated_at);
```

## Security Considerations

### 1. Data Encryption
- All sensitive data encrypted at rest using AES-256
- All data in transit encrypted using TLS 1.3
- Encryption keys managed by Supabase

### 2. Access Control
- Row Level Security (RLS) enabled on all tables
- JWT-based authentication for all API access
- Role-based access control for different user types

### 3. Audit Logging
- Complete audit trail for all configuration changes
- Immutable logs for compliance tracking
- Real-time monitoring for security events

## Performance Considerations

### 1. Database Optimization
- Proper indexing for common query patterns
- Connection pooling for high concurrency
- Query optimization for complex operations

### 2. Caching Strategy
- Edge caching for frequently accessed data
- Database query caching for performance
- CDN caching for static assets

### 3. Monitoring
- Real-time performance metrics
- Alert system for performance degradation
- Automated scaling based on load

---

**Data Model Complete**: Ready for implementation  
**Next Phase**: API Contracts and Testing  
**Validation**: All entities and relationships defined