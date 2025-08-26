# Claude CLI Consolidation Plan

## Executive Summary

Consolidate ~25 CLI commands into 13 core commands, reducing cognitive load by 60% while maintaining
all functionality and following modern CLI UX patterns.

## Current State Analysis

- **Total Commands**: ~33 across multiple organizational patterns
- **Issues**: Cognitive overload, inconsistent naming, functional overlap
- **Goal**: Reduce to 12-15 commands with improved discoverability

## Proposed Consolidated Structure (13 Commands)

### 1. `init` - Project Initialization

**Consolidates**: `quick-project-init`, `dev/init-project` **Purpose**: Single entry point for
project creation

### 2. `dev` - Development Workflow

**Subcommands**: `feature`, `refactor`, `review` **Consolidates**: `dev/feature`,
`rapid-feature-development`, `dev/refactor`, `dev/review` **Usage**:

- `claude dev feature` - Feature development workflow
- `claude dev refactor` - Refactoring operations
- `claude dev review` - Code review processes

### 3. `test` - Testing Operations

**Subcommands**: `run`, `watch`, `dashboard`, `report`, `integration` **Consolidates**: `dev/test`,
`dev/test-watch`, `dev/test-dashboard`, `dev/test-report`, `test-integration` **Usage**:

- `claude test run` - Execute tests
- `claude test watch` - Watch mode testing
- `claude test dashboard` - Test results dashboard
- `claude test report` - Generate test reports
- `claude test integration` - Integration testing

### 4. `build` - Build & Deployment

**Subcommands**: `deploy`, `optimize` **Consolidates**: `dev/deploy`, `pnpm-optimize` **Usage**:

- `claude build deploy` - Deploy application
- `claude build optimize` - Build optimization

### 5. `analyze` - Code & Architecture Analysis

**Subcommands**: `code`, `architecture`, `debug`, `performance` **Consolidates**: `analyze`,
`audit-architecture`, `debug`, `qa/performance` **Usage**:

- `claude analyze code` - Code analysis
- `claude analyze architecture` - Architecture audit
- `claude analyze debug` - Debug analysis
- `claude analyze performance` - Performance analysis

### 6. `quality` - Quality Assurance

**Subcommands**: `validate`, `format`, `cleanup` **Consolidates**: `validate-quality`,
`ultracite-format`, `cleanup-detector` **Usage**:

- `claude quality validate` - Quality validation
- `claude quality format` - Code formatting
- `claude quality cleanup` - Cleanup operations

### 7. `security` - Security & Compliance

**Subcommands**: `scan`, `compliance` **Consolidates**: `qa/security`, `qa/compliance` **Usage**:

- `claude security scan` - Security scanning
- `claude security compliance` - Compliance checks

### 8. `research` - Knowledge & Research

**Subcommands**: `docs`, `examples`, `patterns` **Consolidates**: `research`, `research/knowledge`
**Usage**:

- `claude research docs` - Documentation lookup
- `claude research examples` - Code examples
- `claude research patterns` - Design patterns

### 9. `task` - Task Management

**Keep as-is**: `archon-task-manager` **Purpose**: Archon-based task coordination

### 10. `workflow` - Project Orchestration

**Subcommands**: `plan`, `coordinate`, `execute`, `deliver`, `discover`, `validate`
**Consolidates**: All `workflow/` commands **Usage**:

- `claude workflow plan` - Project planning
- `claude workflow coordinate` - Coordination
- `claude workflow execute` - Execution
- `claude workflow deliver` - Delivery
- `claude workflow discover` - Discovery
- `claude workflow validate` - Validation

### 11. `reality-check` - Reality Validation

**Keep standalone** - Unique validation concept **Purpose**: Comprehensive project validation

### 12. `status` - Project Status

**New consolidated command** **Purpose**: Single command for project health overview

### 13. `fix` - Quick Maintenance

**New consolidated command** **Purpose**: Quick fixes and cleanup operations

## Key Benefits

### UX Improvements

- **60% reduction** in top-level commands (25 → 13)
- **Improved discoverability** through logical grouping
- **Consistent patterns** following Git/Docker/Kubectl conventions
- **Reduced decision fatigue** for users

### Technical Benefits

- **Maintained functionality** - No features lost
- **Better organization** - Clear functional boundaries
- **Future-proof structure** - Easy to extend
- **Consistent help system** - Easier documentation

## Implementation Strategy

### Phase 1: Core Command Consolidation

1. Create new primary command structures
2. Implement subcommand routing
3. Maintain backward compatibility during transition

### Phase 2: Migration & Testing

1. Test all consolidated command paths
2. Validate functionality preservation
3. Update documentation and help systems

### Phase 3: Cleanup

1. Remove deprecated command files
2. Update internal references
3. Final validation of consolidated structure

## Command Mapping Reference

### OLD → NEW Mapping

```
quick-project-init → init
dev/init-project → init

dev/feature → dev feature
rapid-feature-development → dev feature
dev/refactor → dev refactor
dev/review → dev review

dev/test → test run
dev/test-watch → test watch
dev/test-dashboard → test dashboard
dev/test-report → test report
test-integration → test integration

dev/deploy → build deploy
pnpm-optimize → build optimize

analyze → analyze code
audit-architecture → analyze architecture
debug → analyze debug
qa/performance → analyze performance

validate-quality → quality validate
ultracite-format → quality format
cleanup-detector → quality cleanup

qa/security → security scan
qa/compliance → security compliance

research → research docs
research/knowledge → research examples

archon-task-manager → task (keep as-is)

workflow/* → workflow * (maintain subcommands)

reality-check → reality-check (keep standalone)
```

## Success Metrics

- [ ] All 25+ commands consolidated into 13 core commands
- [ ] 100% functionality preservation
- [ ] Improved command discovery time
- [ ] Consistent help documentation
- [ ] User feedback validation
- [ ] Zero breaking changes for existing users

This consolidation will significantly improve the CLI user experience while maintaining all existing
functionality and following modern CLI design patterns.
