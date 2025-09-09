# Monorepo Audit & Optimization Tool

A comprehensive TypeScript-based tool for auditing and optimizing monorepo architectures, specifically designed for Turborepo workspaces using modern frameworks like Hono, TanStack Router, and React.

## 🎯 Purpose

This tool helps maintain clean, efficient monorepo architectures by:

- Scanning `apps/` and `packages/` directories for code assets
- Validating architectural compliance with Turborepo best practices
- Identifying unused and orphaned files across the workspace
- Providing safe cleanup operations with rollback capabilities
- Generating comprehensive reports with actionable insights

## 🚀 Quick Start

### Installation

```bash
cd tools/monorepo-audit
bun install
```

### Basic Usage

```bash
# Complete audit workflow
bun run cli audit

# Individual commands
bun run cli scan         # Scan workspace for files
bun run cli analyze      # Analyze dependencies  
bun run cli validate     # Validate architecture
bun run cli cleanup plan # Create cleanup plan
bun run cli report generate # Generate reports
```

## 📋 Features

### Core Capabilities

- **File Scanning**: Intelligent workspace discovery with pattern matching
- **Dependency Analysis**: TypeScript AST-based dependency graph construction
- **Architecture Validation**: Turborepo/Hono/TanStack Router compliance checking
- **Safe Cleanup**: Transaction-like operations with rollback support
- **Rich Reporting**: Multiple formats (HTML, JSON, Markdown, PDF)

### Advanced Features

- **Performance Monitoring**: Event loop lag detection and memory profiling
- **Comprehensive Logging**: Structured logs with rotation and context management
- **Configuration Management**: Multi-source config loading with live reloading
- **Error Recovery**: Circuit breaker pattern with intelligent retry logic
- **Interactive Dashboards**: Real-time progress and results visualization

## 🏗️ Architecture

### Core Components

```
src/
├── models/           # Domain models and interfaces
├── services/         # Business logic services  
├── cli/             # Command-line interface
├── utils/           # Shared utilities
└── types/           # Type definitions
```

### Service Layer

- **FileScanner**: Workspace file discovery and categorization
- **DependencyAnalyzer**: TypeScript AST parsing and graph construction
- **ArchitectureValidator**: Compliance checking against architectural patterns
- **CleanupEngine**: Safe file operations with backup/rollback
- **ReportGenerator**: Multi-format report creation and export

### Integration Layer

- **Logger**: Structured logging with performance monitoring
- **PerformanceMonitor**: System metrics and alerting
- **ConfigManager**: Configuration management with validation
- **ErrorHandler**: Comprehensive error handling and recovery

## 📖 CLI Commands

### Main Commands

#### `audit`

Complete audit workflow with all steps:

```bash
bun run cli audit [options]
  --config-path <path>     Custom config file location
  --output-dir <dir>       Output directory for reports  
  --format <format>        Report format (html|json|markdown|pdf)
  --dry-run               Show what would be done without changes
```

#### `scan`

Discover and categorize workspace files:

```bash
bun run cli scan [options]
  --workspace-path <path>  Root workspace directory
  --patterns <patterns>    File patterns to include/exclude
  --output <file>         Save results to file
```

#### `analyze`

Analyze dependencies and build dependency graph:

```bash
bun run cli analyze [options]
  --input <file>          Scan results input file
  --depth <number>        Analysis depth level
  --include-externals     Include external dependencies
```

#### `validate`

Validate architecture compliance:

```bash
bun run cli validate [options] 
  --rules <file>          Custom validation rules file
  --strict                Enable strict validation mode
  --fix                   Auto-fix violations when possible
```

#### `cleanup`

Manage cleanup operations:

```bash
# Create cleanup plan
bun run cli cleanup plan [options]
  --aggressive            More aggressive cleanup rules
  --backup-dir <dir>      Backup directory location

# Execute cleanup  
bun run cli cleanup execute [options]
  --plan-file <file>      Cleanup plan file
  --dry-run              Show changes without executing
  --interactive          Confirm each operation

# Rollback changes
bun run cli cleanup rollback [options]
  --backup-id <id>       Specific backup to rollback
  --force                Force rollback without confirmation
```

#### `report`

Generate and manage reports:

```bash
# Generate report
bun run cli report generate [options]
  --format <format>       Output format (html|json|markdown|pdf)  
  --template <template>   Custom report template
  --output <file>        Output file location

# Export data
bun run cli report export [options]
  --format <format>       Export format
  --include-raw          Include raw scan data

# Compare results  
bun run cli report compare <baseline> <current>
  --output <file>        Comparison report output
```

## ⚙️ Configuration

### Default Configuration

The tool uses a layered configuration system:

```typescript
// Default configuration
{
  workspace: {
    rootPath: process.cwd(),
    appsDir: 'apps',
    packagesDir: 'packages',
    includePatterns: ['**/*.{ts,tsx,js,jsx}'],
    excludePatterns: ['**/node_modules/**', '**/.git/**']
  },
  analysis: {
    maxDepth: 10,
    includeExternalDeps: false,
    followSymlinks: true
  },
  validation: {
    strictMode: false,
    autoFix: false,
    rules: {
      turborepo: true,
      hono: true,
      tanstackRouter: true
    }
  },
  cleanup: {
    aggressive: false,
    backupDir: '.audit-backups',
    confirmBeforeDelete: true
  },
  reporting: {
    defaultFormat: 'html',
    includeCharts: true,
    outputDir: 'audit-reports'
  }
}
```

### Configuration Sources

1. **Default values** (built-in)
2. **Configuration file** (`audit.config.json`)
3. **Environment variables** (prefixed with `AUDIT_`)
4. **Command-line arguments** (highest priority)

### Environment Variables

```bash
# Workspace configuration
AUDIT_WORKSPACE_ROOT=/path/to/workspace
AUDIT_APPS_DIR=apps
AUDIT_PACKAGES_DIR=packages

# Analysis settings  
AUDIT_MAX_DEPTH=10
AUDIT_INCLUDE_EXTERNALS=true

# Validation rules
AUDIT_STRICT_MODE=true
AUDIT_AUTO_FIX=false

# Cleanup settings
AUDIT_AGGRESSIVE_CLEANUP=false
AUDIT_BACKUP_DIR=.backups

# Reporting
AUDIT_DEFAULT_FORMAT=html
AUDIT_OUTPUT_DIR=reports
```

## 📊 Reports & Output

### HTML Reports

Interactive dashboards with:

- Executive summary with key metrics
- Detailed findings with drill-down capabilities
- Dependency graphs and visualizations
- Cleanup recommendations with impact analysis
- Performance metrics and benchmarks

### JSON Reports

Machine-readable format for:

- CI/CD pipeline integration
- Custom tooling and automation
- Data analysis and processing
- API integrations

### Markdown Reports

Documentation-friendly format for:

- README updates
- Pull request descriptions
- Architecture decision records
- Team communication

### PDF Reports

Professional format for:

- Stakeholder presentations
- Architecture reviews
- Compliance documentation
- Executive summaries

## 🔧 Development

### Prerequisites

- Node.js 20+
- Bun package manager
- TypeScript 5.7.2+

### Setup

```bash
git clone <repository>
cd tools/monorepo-audit
bun install
```

### Development Scripts

```bash
bun run dev          # Development mode with watching
bun run build        # Production build
bun run test         # Run test suite  
bun run test:watch   # Watch mode testing
bun run lint         # Code linting
bun run type-check   # TypeScript validation
```

### Testing

The tool uses comprehensive TDD methodology:

```bash
# Run all tests
bun run test

# Run specific test suites
bun run test:contracts      # Contract compliance tests
bun run test:integration    # Integration tests  
bun run test:performance    # Performance benchmarks
bun run test:e2e           # End-to-end tests
```

### Architecture Validation

Built-in validation for:

- **Turborepo patterns**: Workspace configuration, build caching, task pipelines
- **Hono framework**: Route definitions, middleware patterns, type safety
- **TanStack Router**: Route configuration, type-safe navigation, lazy loading
- **TypeScript**: Import/export patterns, type definitions, module boundaries

## 🎯 Performance Targets

- **File Scanning**: <30 seconds for 10,000 files
- **Memory Usage**: <500MB peak during analysis
- **Complete Workflow**: <3 minutes end-to-end
- **Report Generation**: <10 seconds for standard reports

## 🛡️ Safety Features

### Backup & Rollback

- Automatic backup creation before cleanup operations
- Transaction-like operations with atomic commits
- Comprehensive rollback capabilities with verification
- Backup retention and cleanup policies

### Validation & Confirmation

- Dry-run mode for all destructive operations
- Interactive confirmation prompts
- Impact analysis before changes
- Rollback verification and integrity checks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TDD methodology (RED-GREEN-REFACTOR)
4. Ensure all tests pass (`bun run test`)
5. Update documentation as needed
6. Submit pull request

### Code Standards

- TypeScript with strict mode enabled
- Comprehensive test coverage (>90%)
- ESLint + Prettier for code formatting
- Conventional commits for version management

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Turborepo monorepo architectures
- Supports Hono web framework patterns
- Integrates with TanStack Router best practices
- Follows modern TypeScript development standards
