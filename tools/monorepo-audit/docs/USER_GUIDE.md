# User Guide - Monorepo Audit Tool

## Table of Contents

1. [Getting Started](#getting-started)
2. [Workflow Examples](#workflow-examples)
3. [Command Reference](#command-reference)
4. [Configuration Guide](#configuration-guide)
5. [Report Interpretation](#report-interpretation)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites Checklist

- [ ] Node.js 20 or higher installed
- [ ] Bun package manager installed
- [ ] Turborepo workspace structure
- [ ] Write permissions in workspace directory

### Installation Steps

1. **Navigate to the tool directory**:
   ```bash
   cd tools/monorepo-audit
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Verify installation**:
   ```bash
   bun run cli --version
   ```

4. **Run initial scan** (optional):
   ```bash
   bun run cli scan --dry-run
   ```

## Workflow Examples

### Example 1: First-Time Audit

Perfect for new projects or when setting up the tool for the first time:

```bash
# Step 1: Run complete audit with dry-run to see what would happen
bun run cli audit --dry-run --output-dir ./first-audit

# Step 2: Review the generated report (opens in browser)
open ./first-audit/audit-report.html

# Step 3: If satisfied, run actual audit  
bun run cli audit --output-dir ./first-audit

# Step 4: Review cleanup recommendations
bun run cli cleanup plan --output ./cleanup-plan.json

# Step 5: Execute safe cleanup (with backups)
bun run cli cleanup execute --plan-file ./cleanup-plan.json --interactive
```

### Example 2: Regular Maintenance Audit

For periodic workspace maintenance:

```bash
# Quick audit with focused scope
bun run cli audit \
  --config-path ./audit.config.json \
  --format json \
  --output-dir ./maintenance-$(date +%Y%m%d)

# Generate comparison report against baseline
bun run cli report compare \
  ./baseline/audit-results.json \
  ./maintenance-$(date +%Y%m%d)/audit-results.json \
  --output ./maintenance-comparison.html
```

### Example 3: Pre-Deployment Validation

Before major releases or deployments:

```bash
# Strict validation with auto-fix
bun run cli validate \
  --strict \
  --fix \
  --rules ./custom-validation-rules.json

# Generate compliance report
bun run cli report generate \
  --format pdf \
  --template compliance \
  --output ./deployment-validation-$(date +%Y%m%d).pdf

# Verify no critical issues remain
bun run cli audit --dry-run | grep "CRITICAL" && exit 1 || echo "✅ Ready for deployment"
```

## Command Reference

### Core Commands Deep Dive

#### `audit` - Complete Workflow

The `audit` command runs the complete analysis workflow:

**Basic Usage:**

```bash
bun run cli audit [options]
```

**Options:**

- `--config-path <path>`: Custom configuration file
- `--output-dir <dir>`: Output directory for all results
- `--format <format>`: Primary report format (html, json, markdown, pdf)
- `--dry-run`: Simulate operations without making changes
- `--verbose`: Enable detailed logging
- `--parallel`: Enable parallel processing for faster execution

**Example with all options:**

```bash
bun run cli audit \
  --config-path ./production.config.json \
  --output-dir ./audit-$(date +%Y%m%d-%H%M%S) \
  --format html \
  --verbose \
  --parallel
```

#### `scan` - File Discovery

Discovers and categorizes all files in the workspace:

**Basic Usage:**

```bash
bun run cli scan [options]
```

**Advanced Patterns:**

```bash
# Scan only TypeScript files in apps directory
bun run cli scan --patterns "apps/**/*.{ts,tsx}" --output scan-apps.json

# Exclude test files and node_modules
bun run cli scan \
  --patterns "**/*.{ts,tsx,js,jsx}" \
  --exclude "**/node_modules/**,**/*.test.{ts,tsx},**/*.spec.{ts,tsx}" \
  --output scan-production.json
```

## Configuration Guide

### Configuration File Structure

Create `audit.config.json` in your project root:

```json
{
  "workspace": {
    "rootPath": ".",
    "appsDir": "apps",
    "packagesDir": "packages",
    "includePatterns": [
      "**/*.{ts,tsx,js,jsx}",
      "**/*.json",
      "**/*.md"
    ],
    "excludePatterns": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/.next/**"
    ]
  },
  "analysis": {
    "maxDepth": 10,
    "includeExternalDeps": false,
    "followSymlinks": true
  },
  "validation": {
    "strictMode": false,
    "autoFix": true,
    "rules": {
      "turborepo": true,
      "hono": true,
      "tanstackRouter": true
    }
  },
  "cleanup": {
    "aggressive": false,
    "backupDir": ".audit-backups",
    "confirmBeforeDelete": true
  },
  "reporting": {
    "defaultFormat": "html",
    "includeCharts": true,
    "outputDir": "audit-reports"
  }
}
```

## Report Interpretation

### HTML Dashboard Sections

#### 1. Executive Summary

- **Health Score**: Overall workspace health (0-100)
- **Critical Issues**: Issues requiring immediate attention
- **File Count**: Total files scanned and analyzed
- **Dependency Count**: Internal and external dependencies
- **Architecture Compliance**: Percentage of rules passing

#### 2. File Analysis

- **File Categories**: Breakdown by file type and purpose
- **Size Distribution**: File size analysis and outliers
- **Usage Patterns**: Most/least referenced files
- **Orphaned Files**: Files with no references

#### 3. Dependency Analysis

- **Dependency Graph**: Visual representation of relationships
- **Circular Dependencies**: Potential architecture issues
- **External Dependencies**: Third-party package usage
- **Unused Dependencies**: Candidates for removal

### Understanding Health Scores

**90-100: Excellent**

- Well-organized codebase
- Minimal technical debt
- Strong architecture compliance
- Few or no cleanup opportunities

**80-89: Good**

- Generally well-maintained
- Minor optimization opportunities
- Good architecture compliance
- Some cleanup recommendations

**70-79: Fair**

- Moderate technical debt
- Architecture compliance issues
- Multiple cleanup opportunities
- Requires attention

**60-69: Poor**

- Significant technical debt
- Multiple architecture violations
- Many unused/orphaned files
- Needs immediate attention

**Below 60: Critical**

- Major structural issues
- Poor architecture compliance
- Substantial cleanup needed
- Risk to project maintainability

## Troubleshooting

### Common Issues

#### Issue: "Cannot find workspace root"

**Symptoms**: Error when running any command
**Solution**:

```bash
# Verify you're in correct directory
pwd
ls -la | grep "package.json\|turbo.json"

# Use explicit workspace path
bun run cli scan --workspace-path /path/to/your/workspace
```

#### Issue: "Out of memory during analysis"

**Symptoms**: Process crashes or becomes unresponsive
**Solutions**:

```bash
# Reduce parallelism
bun run cli audit --config-path ./low-memory.config.json

# Or use Node.js memory flags  
NODE_OPTIONS="--max-old-space-size=4096" bun run cli audit
```

#### Issue: "TypeScript parsing errors"

**Symptoms**: Analysis incomplete or incorrect results
**Solutions**:

```bash
# Check TypeScript configuration
cat tsconfig.json

# Verify TypeScript version compatibility
bun run tsc --version

# Use lenient parsing mode
bun run cli analyze --lenient-parsing --skip-type-check
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Full debug output
DEBUG=audit:* bun run cli audit --verbose

# Specific component debugging  
DEBUG=audit:scanner bun run cli scan --verbose
DEBUG=audit:analyzer bun run cli analyze --verbose
DEBUG=audit:validator bun run cli validate --verbose

# Performance debugging
bun run cli audit --profile --output-profile audit-profile.json
```

### Support Information

When reporting issues, please include:

1. **Environment Information**:
   ```bash
   bun --version
   node --version
   cat package.json | jq '.engines'
   ```

2. **Configuration**:
   ```bash
   cat audit.config.json
   ```

3. **Debug Output**:
   ```bash
   DEBUG=audit:* bun run cli [command] --verbose > debug.log 2>&1
   ```

For additional support, check the GitHub Issues or create a new issue with the above information.
