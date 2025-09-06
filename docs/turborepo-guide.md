# Turborepo Guide - NeonPro Monorepo

> **Status**: ✅ **Production Ready** - Turborepo is fully implemented and optimized

## Overview

The NeonPro monorepo uses Turborepo for intelligent build orchestration, caching, and task management. This guide covers how to effectively use Turborepo in your daily development workflow.

## Architecture

### Package Structure

```
neonpro/
├── apps/
│   ├── api/              # Backend API (Hono.dev)
│   └── web/              # Frontend App (Next.js 15)
└── packages/
    ├── types/            # TypeScript definitions
    ├── database/         # Prisma + Supabase
    ├── shared/           # Shared schemas & API client
    ├── ui/               # UI components (shadcn/ui)
    ├── core-services/    # Business logic
    ├── security/         # Auth & security
    ├── utils/            # Utilities
    └── config/           # TypeScript configs
```

### Dependency Graph

```
@neonpro/types (foundation)
├── @neonpro/database
├── @neonpro/utils
└── @neonpro/shared
    ├── @neonpro/ui
    ├── @neonpro/core-services
    ├── @neonpro/security
    └── apps (web, api)
```

## Common Commands

### Development

```bash
# Start all development servers
bun run dev

# Start specific app
bun run dev:web    # Frontend only
bun run dev:api    # Backend only

# Build all packages
bun run build

# Build specific package
turbo run build --filter=@neonpro/ui
```

### Testing & Quality

```bash
# Run all tests
bun run test

# Run tests for changed packages only
bun run test:changed

# Lint and type-check
bun run quality:check

# Fix linting issues
bun run lint:fix
```

### Advanced Filtering

#### Package Filtering

```bash
# Build specific package
turbo run build --filter=@neonpro/ui

# Build package and its dependencies
turbo run build --filter=@neonpro/ui...

# Build package and its dependents
turbo run build --filter=...@neonpro/ui

# Build everything except specific package
turbo run build --filter=!@neonpro/ui
```

#### Scope Filtering

```bash
# Build only apps
turbo run build --filter=./apps/*

# Build only packages
turbo run build --filter=./packages/*

# Build changed packages since last commit
turbo run build --filter=...[HEAD^]
```

## Caching System

### Cache Performance

- **Local Cache**: Stored in `.turbo/cache/`
- **Remote Cache**: Enabled with Vercel (team sharing)
- **Cache Hits**: Instant builds (< 200ms)
- **Cache Miss**: Full rebuild with caching for next time

### Cache Debugging

```bash
# Dry run to see what would be cached
turbo run build --dry-run

# Force rebuild (skip cache)
turbo run build --force

# View cache summary
turbo run build --summarize
```

### Cache Optimization Tips

1. **Inputs**: Only include files that affect the build
2. **Outputs**: Specify all generated files for proper caching
3. **Environment Variables**: Only include necessary env vars
4. **Dependencies**: Ensure proper `dependsOn` relationships

## Task Configuration

### Available Tasks

- `build` - Compile packages and applications
- `dev` - Start development servers (persistent)
- `test` - Run test suites
- `lint` - Code linting with oxlint
- `type-check` - TypeScript validation
- `format` - Code formatting with dprint
- `clean` - Clean build artifacts

### Package-Specific Tasks

```bash
# Database operations
turbo run build --filter=@neonpro/database
bun run db:generate
bun run db:migrate:dev

# UI development
turbo run build --filter=@neonpro/ui
turbo run dev --filter=@neonpro/ui

# API development
turbo run build --filter=@neonpro/api
turbo run dev --filter=@neonpro/api
```

## Performance Optimization

### Memory Management

- Node.js processes optimized for large TypeScript projects
- Memory limits configured: `NODE_OPTIONS=--max-old-space-size=4096`
- Parallel execution with intelligent scheduling

### Build Optimization

- **Incremental Builds**: Only rebuild changed packages
- **Dependency Awareness**: Automatic dependency resolution
- **Parallel Execution**: Maximum concurrency where possible
- **Smart Caching**: File-based cache invalidation

## Troubleshooting

### Common Issues

#### Cache Issues

```bash
# Clear local cache
rm -rf .turbo/cache

# Rebuild without cache
turbo run build --force
```

#### Dependency Issues

```bash
# Check dependency graph
turbo run build --graph

# Validate configuration
turbo run build --dry-run
```

#### Memory Issues

```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=8192"
turbo run build
```

### Debug Mode

```bash
# Verbose logging
turbo run build --verbosity=2

# Show task timing
turbo run build --profile
```

## Best Practices

### Development Workflow

1. **Start with types**: Always build `@neonpro/types` first
2. **Use filtering**: Target specific packages during development
3. **Leverage cache**: Let Turborepo skip unchanged packages
4. **Monitor performance**: Use `--profile` to identify bottlenecks

### Configuration Management

1. **Inputs**: Be specific about what files affect builds
2. **Outputs**: Include all generated files
3. **Dependencies**: Maintain proper `dependsOn` relationships
4. **Environment**: Only include necessary environment variables

### Team Collaboration

1. **Remote Cache**: Shared cache improves team productivity
2. **Consistent Commands**: Use root package.json scripts
3. **Documentation**: Keep this guide updated with changes
4. **Monitoring**: Track cache hit rates and build performance

## Configuration Files

### Key Files

- `turbo.json` - Main Turborepo configuration
- `package.json` - Root workspace configuration
- `pnpm-workspace.yaml` - Package manager workspace config

### Environment Variables

- `TURBO_TOKEN` - Remote cache authentication
- `TURBO_TEAM` - Team identifier for remote cache
- `NODE_OPTIONS` - Memory optimization settings

## Monitoring & Analytics

### Performance Metrics

```bash
# Build summary with timing
turbo run build --summarize

# Task dependency visualization
turbo run build --graph

# Cache analysis
turbo run build --dry-run
```

### Success Indicators

- ✅ Cache hit rate > 80% in CI/CD
- ✅ Build time < 2 minutes for full rebuild
- ✅ Development server start < 30 seconds
- ✅ Type checking < 1 minute

---

## Quick Reference

### Essential Commands

```bash
bun run dev              # Start development
bun run build            # Build all
bun run test             # Test all
bun run quality:check    # Lint + type-check
turbo run build --filter=<package>  # Build specific package
```

### Cache Commands

```bash
turbo run build --dry-run    # Preview without execution
turbo run build --force      # Skip cache
turbo run build --graph      # Show dependencies
```

### Filtering Examples

```bash
--filter=@neonpro/ui         # Specific package
--filter=./apps/*            # All apps
--filter=...@neonpro/ui      # Package + dependents
--filter=@neonpro/ui...      # Package + dependencies
```

---

**Last Updated**: September 2025\
**Turborepo Version**: 2.5.6\
**Status**: Production Ready ✅
