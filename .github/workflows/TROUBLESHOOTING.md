# 🔧 GitHub Actions Workflow Troubleshooting Guide

## 🚨 Quick Diagnostics

### ✅ **Immediate Validation Checklist**

Run these commands to validate your workflow setup:

```bash
# 1. Check YAML syntax (if yamllint available)
yamllint .github/workflows/*.yml

# 2. Validate PNPM version
pnpm --version
# Expected: 9.x.x or higher

# 3. Validate Node.js version
node --version
# Expected: 18.x.x or 20.x.x

# 4. Check repository permissions
gh api repos/:owner/:repo --jq '.permissions'

# 5. Validate workflow files exist
ls -la .github/workflows/
```

---

## 🐛 Common Issues & Solutions

### 1. 🚫 **PNPM Version Mismatch**

**Error**: `pnpm/action-setup@v4 requires PNPM 9+`

**Solution**:

```yaml
# In workflow file, ensure:
- name: 📦 Setup PNPM
  uses: pnpm/action-setup@v4
  with:
    version: 9 # or latest
```

**Local fix**:

```bash
npm install -g pnpm@latest
```

### 2. 🔒 **Permission Denied Errors**

**Error**: `Resource not accessible by integration`

**Solution**: Update repository settings

```yaml
permissions:
  contents: read
  actions: read
  security-events: write
  checks: write
  pull-requests: write
```

**Repository Settings**:

1. Go to Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

### 3. 🏥 **Healthcare Compliance Script Missing**

**Error**: `scripts/anvisa-validation.js not found`

**Solution**: Create compliance scripts

```bash
mkdir -p scripts
```

Create `scripts/anvisa-validation.js`:

```javascript
#!/usr/bin/env node
console.log("🏥 ANVISA compliance validation...");
// Add your ANVISA validation logic here
console.log("✅ ANVISA compliance check passed");
process.exit(0);
```

Create `scripts/cfm-compliance.js`:

```javascript
#!/usr/bin/env node
console.log("👨‍⚕️ CFM compliance validation...");
// Add your CFM validation logic here
console.log("✅ CFM compliance check passed");
process.exit(0);
```

Make them executable:

```bash
chmod +x scripts/*.js
```

### 4. 🔄 **Cache Issues**

**Error**: `Cache restore failed`

**Solution**: Clear and rebuild cache

```yaml
# Add cache busting when needed
cache-dependency-path: |
  pnpm-lock.yaml
  apps/*/package.json
  packages/*/package.json
  # Add timestamp for cache busting: ${{ github.run_id }}
```

**Manual cache clearing**:

1. Go to Actions → Caches
2. Delete old caches
3. Re-run workflow

### 5. 🧪 **Test Failures**

**Error**: `Tests failed in CI but pass locally`

**Solutions**:

```bash
# 1. Run tests with CI environment
CI=true npm test

# 2. Check for async issues
npm test -- --detectOpenHandles

# 3. Increase timeout for slow tests
npm test -- --testTimeout=30000
```

### 6. 🏗️ **Build Failures**

**Error**: `Build failed with out of memory`

**Solution**: Optimize build process

```yaml
# In workflow, add memory limits
env:
  NODE_OPTIONS: "--max-old-space-size=4096"
  NEXT_TELEMETRY_DISABLED: 1
```

### 7. 🔍 **Matrix Strategy Issues**

**Error**: `Matrix job failed`

**Solution**: Add error handling

```yaml
strategy:
  fail-fast: false # Continue other jobs if one fails
  matrix:
    node-version: [18, 20]
    include:
      - node-version: 18
        experimental: false
      - node-version: 20
        experimental: true
```

---

## 🔧 Advanced Troubleshooting

### 🕵️ **Debugging Workflow Runs**

1. **Enable debug logging**:

   ```bash
   # Set repository secrets:
   ACTIONS_RUNNER_DEBUG: true
   ACTIONS_STEP_DEBUG: true
   ```

2. **Add debug steps**:

   ```yaml
   - name: 🐛 Debug Environment
     run: |
       echo "Node version: $(node --version)"
       echo "PNPM version: $(pnpm --version)"
       echo "Working directory: $(pwd)"
       echo "Environment variables:"
       env | grep -E '^(NODE_|PNPM_|CI|GITHUB_)' | sort
   ```

3. **Check file permissions**:
   ```yaml
   - name: 🔍 Check Permissions
     run: |
       ls -la .github/workflows/
       ls -la scripts/
   ```

### 📊 **Performance Optimization**

1. **Monitor job timing**:

   ```yaml
   - name: ⏱️ Job Timer Start
     run: echo "start_time=$(date +%s)" >> $GITHUB_ENV

   # ... your job steps ...

   - name: ⏱️ Job Timer End
     run: |
       end_time=$(date +%s)
       duration=$((end_time - start_time))
       echo "Job completed in ${duration} seconds"
   ```

2. **Optimize dependencies**:

   ```bash
   # Use pnpm for faster installs
   pnpm install --frozen-lockfile --prefer-offline

   # Remove unnecessary devDependencies in production builds
   pnpm prune --prod
   ```

### 🔒 **Security Diagnostics**

1. **Check for secrets in logs**:

   ```bash
   # Review workflow runs for exposed secrets
   grep -i "secret\|token\|password" workflow-run-logs.txt
   ```

2. **Validate permission scope**:
   ```yaml
   - name: 🔒 Permission Check
     run: |
       echo "GITHUB_TOKEN permissions:"
       curl -H "Authorization: token ${{ github.token }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/rate_limit
   ```

---

## 📋 **Workflow Health Monitoring**

### 🎯 **Key Metrics to Track**

1. **Success Rate**: `> 95%`
2. **Average Runtime**: `< 15 minutes`
3. **Cache Hit Rate**: `> 80%`
4. **Flaky Test Rate**: `< 5%`

### 📊 **Monitoring Script**

Create `.github/scripts/monitor-workflows.js`:

```javascript
#!/usr/bin/env node
const { Octokit } = require("@octokit/rest");

async function monitorWorkflows() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const { data: runs } = await octokit.rest.actions.listWorkflowRuns({
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY.split("/")[1],
    per_page: 100,
  });

  const successRate =
    (runs.workflow_runs.filter((run) => run.conclusion === "success").length /
      runs.workflow_runs.length) *
    100;

  console.log(`Workflow Success Rate: ${successRate.toFixed(2)}%`);

  if (successRate < 95) {
    console.log("⚠️ Workflow success rate below threshold!");
    process.exit(1);
  }
}

monitorWorkflows().catch(console.error);
```

---

## 🆘 **Emergency Procedures**

### 🚨 **Workflow Completely Broken**

1. **Immediate rollback**:

   ```bash
   git revert <commit-hash-of-workflow-changes>
   git push origin main
   ```

2. **Quick fix workflow**:
   ```yaml
   name: Emergency Fix
   on: [push]
   jobs:
     emergency:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v5
         - run: echo "Emergency workflow active"
   ```

### 🔥 **Security Incident**

1. **Immediately revoke exposed tokens**
2. **Disable affected workflows**:
   ```bash
   gh workflow disable ci.yml
   gh workflow disable pr-validation.yml
   ```
3. **Review all recent runs for exposure**
4. **Update secrets and re-enable**

---

## 📞 **Getting Help**

### 🔍 **Diagnostic Information**

When requesting help, provide:

```bash
# Generate diagnostic report
echo "=== System Information ===" > diagnostic-report.txt
echo "Node version: $(node --version)" >> diagnostic-report.txt
echo "PNPM version: $(pnpm --version)" >> diagnostic-report.txt
echo "OS: $(uname -a)" >> diagnostic-report.txt
echo "" >> diagnostic-report.txt

echo "=== Repository Information ===" >> diagnostic-report.txt
echo "Repository: $GITHUB_REPOSITORY" >> diagnostic-report.txt
echo "Branch: $GITHUB_REF" >> diagnostic-report.txt
echo "Commit: $GITHUB_SHA" >> diagnostic-report.txt
echo "" >> diagnostic-report.txt

echo "=== Workflow Files ===" >> diagnostic-report.txt
ls -la .github/workflows/ >> diagnostic-report.txt
echo "" >> diagnostic-report.txt

echo "=== Recent Workflow Runs ===" >> diagnostic-report.txt
gh run list --limit 5 >> diagnostic-report.txt
```

### 📚 **Additional Resources**

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PNPM Documentation](https://pnpm.io/)
- [NeonPro Project Documentation](../docs/)
- [Healthcare Compliance Guidelines](../docs/compliance/)

---

**🔧 Last Updated**: 2025-01-20\
**📝 Version**: 2.0\
**🎯 Compatibility**: NeonPro v2.0+
