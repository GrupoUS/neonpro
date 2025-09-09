# 🏛️ Constitutional TDD - Development Workflow Integration

## 📋 Quick Start Commands

```bash
# Setup constitutional compliance hooks (one-time)
npm run constitutional:setup

# Quick validation (recommended for development)
npm run constitutional:quick

# Full constitutional compliance check
npm run constitutional:full

# Performance benchmarks
npm run constitutional:benchmark
```

## 🔄 Development Workflow Integration

### 1. **Pre-commit Validation** 
**Automatic constitutional compliance checking**
```bash
# Git hooks automatically run on every commit
git commit -m "feat: implement new feature"
# → Triggers constitutional audit validation
```

### 2. **VS Code Integration**
**Tasks available in Command Palette (`Ctrl+Shift+P` → "Tasks: Run Task")**
- `🏛️ Constitutional Audit - Quick` - Fast validation
- `🏛️ Constitutional Audit - Full` - Complete compliance check
- `📈 Performance Benchmark` - Performance testing
- `🏥 Healthcare Compliance Check` - LGPD/ANVISA validation

### 3. **GitHub Actions**
**Automated CI/CD pipeline validation**
- **Pull Requests**: Quick constitutional audit
- **Main Branch**: Full constitutional compliance
- **Daily Schedule**: Comprehensive validation at 2 AM UTC
- **Security Scan**: LGPD compliance + dependency audit

## 🎯 Developer Guidelines

### Constitutional Requirements
- ✅ **File Count**: Must process 10,000+ files
- ✅ **Time Limit**: Validation completes within 4 hours
- ✅ **Memory Limit**: Peak usage under 2GB
- ✅ **Quality Standard**: Maintain ≥9.5/10 code quality

### Healthcare Compliance (LGPD/ANVISA)
- 🏥 **Data Protection**: Validate patient data handling
- 🏥 **Audit Trails**: Ensure comprehensive logging
- 🏥 **Access Control**: Verify permission systems
- 🏥 **Encryption**: Check sensitive data encryption

## 📊 Integration Points

### Git Workflow
```bash
# 1. Make changes
git add .

# 2. Commit (triggers pre-commit hook)
git commit -m "feat: add new validation"
# → Constitutional audit runs automatically

# 3. Push (triggers GitHub Actions)
git push origin feature/new-validation
# → CI/CD pipeline validates compliance
```

### Local Development
```bash
# Before starting work
npm run constitutional:quick

# During development (optional)
npm run constitutional:benchmark

# Before major commits
npm run constitutional:full
```

## 🚨 Troubleshooting

### Common Issues

**1. Pre-commit Hook Fails**
```bash
# Skip hook (NOT recommended)
git commit --no-verify -m "emergency fix"

# Better: Fix issues and recommit
npm run constitutional:quick --verbose
git add . && git commit -m "fix: constitutional compliance"
```

**2. GitHub Actions Fails**
- Check workflow logs in Actions tab
- Run local validation: `npm run constitutional:full`
- Review audit reports in `tools/audit/audit-reports/`

**3. Memory/Performance Issues**
```bash
# Check system resources
npm run constitutional:benchmark

# Reduce validation scope (temporarily)
cd tools/audit && npx tsx src/cli/index.ts quick --target ./src --verbose
```

## 📈 Monitoring & Metrics

### Key Metrics Tracked
- **Component Validation**: 17/17 core components
- **Integration Tests**: 9/9 integration patterns
- **Performance**: Sub-3s for critical operations  
- **Memory Usage**: Peak ~126MB (94% under limit)
- **File Processing**: 60,954+ files validated

### Reporting
- **Local Reports**: `tools/audit/audit-reports/`
- **CI/CD Artifacts**: Downloaded from GitHub Actions
- **Real-time Logs**: Console output during validation

## 🔧 Advanced Configuration

### Custom Validation Rules
Edit `tools/audit/config/development.json`:
```json
{
  "constitutional": {
    "enforceFileLimit": false,
    "minFileCount": 1000,
    "qualityThreshold": 8.5
  }
}
```

### Production Override
Edit `tools/audit/config/production.json`:
```json
{
  "constitutional": {
    "enforceFileLimit": true,
    "enableStrictMode": true,
    "qualityThreshold": 9.5
  }
}
```

## 🏆 Best Practices

### For Developers
1. **Run Quick Audit**: Before every commit
2. **Full Validation**: Before major releases
3. **Monitor Metrics**: Check performance impacts
4. **Healthcare Compliance**: Validate LGPD patterns

### For Teams
1. **Mandatory Hooks**: Enforce pre-commit validation
2. **CI/CD Integration**: Block non-compliant merges
3. **Regular Audits**: Schedule weekly full validations
4. **Documentation**: Keep compliance docs updated

## 📞 Support

### Getting Help
- **Documentation**: Check `tools/audit/docs/`
- **Logs**: Review `tools/audit/audit-reports/`
- **Issues**: Check GitHub repository issues
- **Constitution**: Review constitutional requirements

### Emergency Procedures
```bash
# Emergency bypass (use sparingly)
git commit --no-verify -m "emergency: bypass constitutional audit"

# Production incident response
npm run constitutional:full --verbose > incident-report.log 2>&1
```

---
*Updated: 2025-09-09*  
*Version: Constitutional TDD v1.0*  
*Integration Status: ✅ PRODUCTION READY*