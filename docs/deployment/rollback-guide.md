# 🔄 NeonPro Deployment Rollback Guide
*Emergency procedures for production deployment issues*

## 🚨 When to Rollback

### Immediate Rollback Triggers:
- **API Endpoints Down**: `/api/health` returning 5xx or wrong responses
- **Critical Functionality Broken**: Authentication, patient data access
- **Performance Degradation**: >3s response times, high error rates
- **Security Issues**: Data exposure, authentication bypass
- **Smoke Test Failure**: <80% success rate

### Warning Signs (Monitor Closely):
- Intermittent 5xx errors
- Slow response times (>1s for API)
- User reports of functionality issues
- Unusual Vercel function logs

---

## ⚡ Quick Rollback Commands

### 1. **Emergency Rollback (< 2 minutes)**
```bash
# Get current deployment info
vercel ls

# Rollback to previous deployment
vercel rollback [PREVIOUS_DEPLOYMENT_URL]

# Example:
vercel rollback https://neonpro-git-main-neonpro.vercel.app
```

### 2. **Promote Previous Deployment**
```bash
# List recent deployments
vercel ls --limit 10

# Promote specific deployment to production
vercel promote [DEPLOYMENT_URL]

# Example:
vercel promote https://neonpro-git-abc123-neonpro.vercel.app
```

### 3. **Redeploy Specific Commit**
```bash
# Deploy specific Git commit
vercel --prod --meta commit=[COMMIT_SHA]

# Example:
vercel --prod --meta commit=abc123def456
```

---

## 📋 Complete Rollback Procedure

### Phase 1: Assessment (1-2 minutes)
1. **Run Smoke Test**:
   ```bash
   chmod +x scripts/smoke-test.sh
   ./scripts/smoke-test.sh https://neonpro.vercel.app true
   ```

2. **Check Vercel Status**:
   ```bash
   vercel ls --limit 5
   vercel logs https://neonpro.vercel.app
   ```

3. **Identify Last Known Good Deployment**:
   - Look for deployments before the issue started
   - Check deployment timestamps
   - Verify previous deployment was working

### Phase 2: Rollback Execution (2-3 minutes)
1. **Backup Current State**:
   ```bash
   # Save current deployment URL
   CURRENT_DEPLOYMENT=$(vercel ls --limit 1 --json | jq -r '.[0].url')
   echo "Current deployment: $CURRENT_DEPLOYMENT" > rollback-log.txt
   ```

2. **Execute Rollback**:
   ```bash
   # Method A: Direct rollback
   vercel rollback [PREVIOUS_DEPLOYMENT_URL]
   
   # Method B: Promote previous deployment
   vercel promote [PREVIOUS_DEPLOYMENT_URL]
   ```

3. **Verify Rollback**:
   ```bash
   # Wait for propagation (30-60 seconds)
   sleep 60
   
   # Run smoke test on rolled back deployment
   ./scripts/smoke-test.sh https://neonpro.vercel.app
   ```

### Phase 3: Verification (3-5 minutes)
1. **Full System Test**:
   ```bash
   # Test all critical endpoints
   curl -f https://neonpro.vercel.app/api/health
   curl -f https://neonpro.vercel.app/api/v1/health
   curl -f https://neonpro.vercel.app/api/openapi.json
   ```

2. **Performance Validation**:
   ```bash
   # Benchmark key endpoints
   time curl https://neonpro.vercel.app/api/health
   time curl https://neonpro.vercel.app
   ```

3. **User Acceptance Test**:
   - Test critical user flows
   - Verify authentication works
   - Check data access and modification

---

## 🔧 Advanced Rollback Scenarios

### Scenario 1: Environment Variable Issues
```bash
# Check current environment variables
vercel env ls

# Compare with previous deployment
vercel env pull .env.vercel.backup

# Restore environment variables if needed
vercel env add VARIABLE_NAME [value] --target production
```

### Scenario 2: Database Migration Issues
```bash
# Check database connectivity
npx tsx -e "import { db } from './packages/database/src/client'; console.log(await db.raw('SELECT 1'))"

# If database issues, consider migration rollback
# (This requires careful planning and should be done by DBA)
```

### Scenario 3: Framework Detection Issues
```bash
# Force rebuild with specific framework
vercel --build-env FRAMEWORK=null
vercel --force --prod

# Alternative: Deploy to fresh project
vercel --name neonpro-emergency
```

---

## 📊 Rollback Validation Checklist

### ✅ Technical Validation:
- [ ] Smoke test passes (>95% success rate)
- [ ] API endpoints return expected responses
- [ ] Response times < 1s for API, < 3s for web
- [ ] No 5xx errors in logs
- [ ] Vercel functions showing as "Active"

### ✅ Functional Validation:
- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] Patient data accessible
- [ ] Form submissions work
- [ ] Real-time features functional

### ✅ Performance Validation:
- [ ] First Contentful Paint < 1.5s
- [ ] API response time < 500ms
- [ ] No memory leaks in function logs
- [ ] Cold start times < 1s

### ✅ Security Validation:
- [ ] Authentication still required
- [ ] CORS headers present
- [ ] Security headers (CSP, etc.) active
- [ ] No sensitive data exposed

---

## 📱 Monitoring After Rollback

### Immediate Monitoring (First Hour):
```bash
# Monitor logs continuously
vercel logs --follow

# Check error rates
watch -n 30 'curl -s https://neonpro.vercel.app/api/health'

# Monitor performance
watch -n 60 './scripts/smoke-test.sh https://neonpro.vercel.app'
```

### Extended Monitoring (First 24 Hours):
- Set up alerts for response time > 1s
- Monitor error rates < 0.1%
- Check user feedback channels
- Review Vercel analytics for anomalies

---

## 🚨 Emergency Contacts & Escalation

### Internal Team:
- **Development Team**: Alert about rollback status
- **Operations**: Notify about infrastructure changes
- **Business Stakeholders**: Inform about service disruption

### External:
- **Vercel Support**: For platform-level issues
- **Supabase Support**: For database connectivity issues

---

## 📚 Post-Rollback Actions

### 1. **Incident Documentation**:
```bash
# Create incident report
cat > incident-report-$(date +%Y%m%d-%H%M).md << 'EOF'
# Incident Report: [Date]

## Summary
- **Issue**: [Description]
- **Impact**: [User impact]
- **Duration**: [Start - End time]
- **Resolution**: [Rollback details]

## Timeline
- [Time]: Issue detected
- [Time]: Rollback initiated
- [Time]: Service restored

## Root Cause
[Analysis of what went wrong]

## Prevention
[Steps to prevent recurrence]
EOF
```

### 2. **Fix Development**:
- Identify root cause of failed deployment
- Develop fix in staging environment
- Test thoroughly before next production deployment
- Update deployment procedures if needed

### 3. **Process Improvements**:
- Review smoke test coverage
- Update monitoring alerts
- Improve deployment validation
- Document lessons learned

---

## ⚡ Quick Reference Commands

```bash
# Emergency rollback (copy-paste ready)
vercel rollback $(vercel ls --limit 2 --json | jq -r '.[1].url')

# Check deployment status
vercel ls --limit 5

# Monitor logs
vercel logs --follow

# Run full smoke test
./scripts/smoke-test.sh https://neonpro.vercel.app true

# Performance check
time curl https://neonpro.vercel.app/api/health

# Verify all endpoints
curl -f https://neonpro.vercel.app && \
curl -f https://neonpro.vercel.app/api/health && \
curl -f https://neonpro.vercel.app/api/v1/health && \
echo "All endpoints OK"
```

---

## 🔒 Security Considerations

### During Rollback:
- Verify no sensitive data exposed during deployment issue
- Check for potential security vulnerabilities in failed deployment
- Ensure authentication systems working correctly after rollback

### Post-Rollback:
- Review logs for any security incidents during downtime
- Verify user sessions remain secure
- Check for any data integrity issues

---

## 📈 Success Metrics

### Rollback Success Indicators:
- **Service Restoration**: < 5 minutes from decision to restore
- **System Health**: All smoke tests passing
- **User Impact**: Minimal disruption to end users
- **Data Integrity**: No data loss or corruption

### Key Performance Indicators:
- **Mean Time to Detect (MTTD)**: < 2 minutes
- **Mean Time to Resolve (MTTR)**: < 10 minutes
- **Service Availability**: > 99.9% uptime
- **User Satisfaction**: No user-reported issues post-rollback

Remember: The goal is rapid service restoration while maintaining data integrity and security.