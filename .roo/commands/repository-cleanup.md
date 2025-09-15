# Repository Cleanup Workflow

## Description
Safe repository cleanup system with validation, backup, and healthcare compliance for NeonPro platform. Supports both analysis (dry-run) and execution modes.

## Category
Operations

## Complexity
High

## MCP Tools Required
- sequential-thinking
- archon
- serena
- desktop-commander

## Execution Flow

### Phase 1: Analysis
1. **Architecture Document Loading**
   - Read docs/AGENTS.md
   - Read docs/architecture/AGENTS.md
   - Read docs/architecture/source-tree.md
   - Read docs/architecture/tech-stack.md
   - Read docs/rules/coding-standards.md
   - Read docs/memory.md

2. **Repository State Mapping**
   - Analyze current repository structure
   - Compare with expected architecture from source-tree.md
   - Extract app and package counts dynamically
   - Generate repository state analysis and architecture validation

### Phase 2: Classification
1. **Candidate Scanning**
   - Scan repository for cleanup candidates
   - Apply include/exclude patterns and gitignore rules
   - Respect max_depth and max_items constraints
   - Generate classified candidate list with risk assessment

2. **Orphan File Analysis (Optional)**
   - Build reference graph from package.json, tsconfig.json, imports
   - Identify unreferenced files outside protected paths
   - Generate orphan candidate list with validation requirements
   - Assess risk and impact of orphan removal

### Phase 3: Validation
1. **Safety Checks**
   - Verify never_delete rules (code-source, configuration, environment, documentation)
   - Ensure Git-tracked files are never removed
   - Validate architecture boundaries from source-tree.md
   - Respect min_age_days parameter for file age validation

2. **Compliance Validation**
   - Scan for PHI/PII in cleanup candidates
   - Validate LGPD compliance for data handling
   - Ensure audit trail preservation
   - Generate compliance validation report

### Phase 4: Planning
1. **Manifest Generation**
   - Create detailed cleanup manifest in JSON format
   - Include mode, root_path, timestamp, phases with items
   - Generate summary statistics and error tracking
   - Validate manifest completeness and accuracy

2. **Human-Readable Report**
   - Generate Markdown report with summary and tables
   - Include checkpoint results and recommendations
   - Provide clear guidance for next steps
   - Ensure report is comprehensive and actionable

### Phase 5: Execution (Apply Mode Only)
1. **Backup Creation**
   - Create complete backup of items before removal
   - Store backup in log directory with timestamp
   - Enable rollback capability if needed
   - Validate backup completeness

2. **Category-Based Execution**
   - Execute cleanup by category with confirmation prompts
   - Follow order: temporarios → logs → backups → reports → orphans
   - Log each operation with timestamp and status
   - Verify repository integrity after each phase

3. **Post-Execution Validation**
   - Verify apps/packages still present per source-tree.md
   - Check critical files (package.json, lockfiles, configs) exist
   - Run basic repository operations (pnpm -v, pnpm install)
   - Validate repository functionality and health

## Input Parameters
- **dry_run**: Analysis mode only (true) or execution mode (false)
- **root_path**: Repository root path for cleanup operations
- **include**: File patterns to include in cleanup scan
- **exclude**: File patterns to exclude from cleanup scan
- **gitignore**: Respect .gitignore rules (true/false)
- **min_age_days**: Minimum age in days for file removal
- **confirm_categories**: Categories requiring explicit confirmation
- **include_orphans_scan**: Include orphan file analysis (true/false)
- **max_items_per_phase**: Maximum items to process per phase
- **max_depth**: Maximum directory depth for scanning
- **timeout_seconds**: Operation timeout in seconds
- **log_dir**: Directory for logs and manifests

## Output Requirements
- **manifest-[timestamp].json**: Detailed cleanup manifest with all items
- **report-[timestamp].md**: Human-readable cleanup report
- **errors-[timestamp].log**: Error log with detailed information
- **backup-[timestamp].txt**: Complete list before removal (apply mode)
- **validation_report**: Post-execution validation results

## Quality Gates
- **Architecture Compliance**: 100% alignment with source-tree.md
- **Safety Compliance**: No protected files in candidate list
- **Git Safety**: Only untracked and ignored files affected
- **Age Validation**: All candidates meet min_age_days requirement
- **Compliance Validation**: No PHI/PII exposure risks identified
- **Backup Completeness**: Complete backup available for rollback (apply mode)

## Error Handling
- **Architecture Mismatch**: Abort with detailed divergence report
- **Command Failure**: Abort with command error details and recovery steps
- **Protected File Access**: Abort with protection violation details
- **Timeout**: Abort with timeout details and partial results
- **Compliance Violations**: Report specific violations and halt execution

## Success Criteria
- **Dry Run Mode**:
  - Repository structure analyzed and understood
  - All candidates properly classified and validated
  - Manifest and report generated successfully
  - No protected files in candidate list

- **Apply Mode**:
  - All confirmed categories cleaned successfully
  - Post-execution validation checks pass
  - Repository functionality preserved
  - Backup information available for rollback

## Constitutional Compliance
- **KISS/YAGNI**: Cleanup operations are simple and necessary
- **Test-First**: Validation steps ensure repository health before and after
- **Architecture**: Strict adherence to source-tree.md boundaries and structure
- **Healthcare**: LGPD compliance with PHI/PII protection and audit trail
- **Observability**: Complete logging and monitoring of all operations

## Safety Guards
- **Never Delete Protected**:
  - Code-source: apps/, packages/, src/
  - Configuration: package.json, tsconfig.json, turbo.json, pnpm-workspace.yaml
  - Environment: .env*, .npmrc
  - Documentation: docs/, README.md, CHANGELOG.md, .github/, .gitignore, .git/
  - Lockfiles: pnpm-lock.yaml, bun.lockb, package-lock.json
  - Templates: templates/, .github/prompts/

- **Git Protection**: Never remove Git-tracked files (only untracked and ignored)
- **Architecture Authority**: Read and respect docs/architecture/source-tree.md
- **Idempotency**: Repeating should not cause additional effects
- **Anomaly Detection**: Stop immediately on architecture divergence or command failures
- **Scope Limitation**: Limit to safe categories only

## Confirmation Protocol
- **Apply Mode**: Requires explicit "CONFIRMO LIMPAR" phrase
- **Category Confirmation**: Ask before each category: "Remover [category]? (sim/nao)"
- **Extra Confirmation**: Required for potentially destructive actions (directory removal)
- **Pre-Execution Display**: Show item count, estimated size, categories, and risks

## Integration Points
- **Sequential Thinking**: Structured analysis and validation process
- **Archon**: Architecture document loading and knowledge management
- **Serena**: Code analysis and repository structure validation
- **Desktop Commander**: File system operations and cleanup execution
