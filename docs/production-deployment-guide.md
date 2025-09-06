# NeonPro Production Deployment & Maintenance Guide

**🏥 Healthcare-Compliant Production Deployment Guide**\
**Version:** 7.0 - Production Ready\
**Date:** December 2024\
**Compliance:** LGPD, ANVISA, CFM

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Production Environment Setup](#production-environment-setup)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Validation](#post-deployment-validation)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Emergency Procedures](#emergency-procedures)
8. [Compliance & Audit](#compliance--audit)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete production deployment and maintenance procedures for the NeonPro AI-First Advanced Aesthetic Platform. The platform is designed for healthcare compliance with LGPD, ANVISA, and CFM requirements.

### Architecture Overview

- **Frontend:** Next.js 15.5.2 with React 19
- **Backend:** Supabase with PostgreSQL
- **Authentication:** Supabase Auth with MFA
- **Storage:** Supabase Storage with encryption
- **Monitoring:** Comprehensive health checks and performance monitoring
- **Compliance:** LGPD data protection with audit trails

---

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] **Environment Variables Set**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_ENVIRONMENT` (production)

- [ ] **Domain & SSL**
  - Domain configured (`neonpro.com.br`)
  - SSL certificates installed
  - CDN configured (if applicable)

- [ ] **Database Setup**
  - Supabase project configured
  - RLS policies enabled
  - Indexes optimized
  - Backup schedules configured

### ✅ Code Quality

```bash
# Run pre-deployment validation
./scripts/production-deployment.sh
```

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Linting passed
- [ ] Security audit completed
- [ ] Performance benchmarks met

### ✅ Security Configuration

- [ ] **Security Headers**
  - Content Security Policy configured
  - HSTS enabled
  - Frame options set to DENY
  - Healthcare compliance headers

- [ ] **CORS Policies**
  - Allowed origins configured
  - Credentials handling secure
  - Preflight caching enabled

- [ ] **Rate Limiting**
  - API endpoints protected
  - Authentication limits applied
  - Upload restrictions enforced

### ✅ Healthcare Compliance

- [ ] **LGPD Compliance**
  - Data processing legal basis documented
  - Consent management implemented
  - Data retention policies configured
  - Right to be forgotten enabled

- [ ] **ANVISA Compliance**
  - Medical device classification documented
  - Quality management system in place
  - Audit trail enabled
  - Electronic signatures implemented

- [ ] **CFM Compliance**
  - Telemedicine regulations addressed
  - Patient consent mechanisms implemented
  - Professional identification enforced
  - Medical records security verified

---

## Production Environment Setup

### Server Requirements

**Minimum Specifications:**

- **CPU:** 2 vCPUs
- **RAM:** 4GB
- **Storage:** 50GB SSD
- **Network:** 100 Mbps

**Recommended Specifications:**

- **CPU:** 4+ vCPUs
- **RAM:** 8+ GB
- **Storage:** 100+ GB SSD
- **Network:** 1 Gbps

### Environment Variables

```bash
# Production Environment Variables
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Analytics and Monitoring
VERCEL_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### Database Configuration

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configure performance settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '64MB';
SELECT pg_reload_conf();
```

---

## Deployment Process

### 1. Automated Deployment

```bash
# Run comprehensive pre-deployment validation
./scripts/production-deployment.sh

# Deploy to production (example with Vercel)
vercel --prod

# Validate deployment
curl -f https://neonpro.com.br/api/health || exit 1
```

### 2. Manual Deployment Steps

#### Step 1: Build Application

```bash
cd /path/to/neonpro
pnpm install --frozen-lockfile
pnpm run build
```

#### Step 2: Database Migrations

```bash
# Apply database migrations (if any)
npx supabase db push

# Verify schema integrity
npx supabase db diff
```

#### Step 3: Deploy to Production

```bash
# Deploy to your hosting platform
# Example commands for different platforms:

# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Custom server
pm2 start ecosystem.config.js --env production
```

#### Step 4: Post-Deployment Verification

```bash
# Run production test suite
cd apps/web
npx tsx tests/production/production-test-suite.ts
```

---

## Post-Deployment Validation

### Health Check Verification

```bash
# Primary health check
curl https://neonpro.com.br/api/health

# Readiness probe
curl https://neonpro.com.br/api/health/ready

# Liveness probe
curl https://neonpro.com.br/api/health/live
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-12-05T10:00:00.000Z",
  "uptime": 3600,
  "version": "7.0.0",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "storage": { "status": "healthy" },
    "external": { "status": "healthy" }
  }
}
```

### Security Validation

```bash
# Test security headers
curl -I https://neonpro.com.br | grep -E "(Content-Security-Policy|X-Frame-Options|Strict-Transport-Security)"

# Test CORS
curl -H "Origin: https://malicious-site.com" https://neonpro.com.br/api/health
```

### Performance Validation

```bash
# Test response times
curl -w "Total time: %{time_total}s\n" -o /dev/null -s https://neonpro.com.br

# Test Web Vitals endpoint
curl https://neonpro.com.br/api/performance
```

---

## Monitoring & Maintenance

### Real-time Monitoring

#### Health Dashboards

- **Primary:** `https://neonpro.com.br/api/monitoring?action=dashboard`
- **Health Status:** `https://neonpro.com.br/api/monitoring?action=health`
- **Metrics:** `https://neonpro.com.br/api/monitoring?action=metrics`

#### Key Metrics to Monitor

1. **System Health**
   - API response times (< 500ms average)
   - Database query times (< 100ms average)
   - Error rates (< 1%)
   - Uptime (> 99.9%)

2. **Healthcare-Specific Metrics**
   - Patient data access time (< 2s)
   - Medical record retrieval (< 1s)
   - Consent processing (< 500ms)
   - Audit log generation (< 100ms)

3. **Compliance Metrics**
   - LGPD audit trail integrity
   - Data retention compliance
   - Consent tracking accuracy
   - Security incident detection

### Automated Monitoring

#### Alert Configuration

```typescript
// Example alert rules (configured in alert-system.ts)
{
  name: 'High Patient Data Access Time',
  category: 'healthcare',
  severity: 'critical',
  conditions: [{
    metric: 'patient_data_access',
    operator: 'gt',
    threshold: 3000, // 3 seconds
    duration: 2 // minutes
  }],
  actions: [
    { type: 'log', target: 'healthcare', priority: 1 },
    { type: 'database', target: 'alerts', priority: 2 }
  ]
}
```

#### Log Monitoring

```bash
# Monitor application logs
tail -f /var/log/neonpro/application.log | grep "ERROR\|WARN"

# Monitor performance logs
tail -f /var/log/neonpro/performance.log | grep "critical\|high"

# Monitor compliance logs (LGPD)
tail -f /var/log/neonpro/compliance.log | grep "VIOLATION\|ALERT"
```

### Regular Maintenance Tasks

#### Daily Tasks

- [ ] Check system health dashboard
- [ ] Review error logs and alerts
- [ ] Verify backup completion
- [ ] Monitor performance metrics
- [ ] Check compliance status

#### Weekly Tasks

- [ ] **Database Maintenance**
  ```sql
  -- Analyze query performance
  SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

  -- Check index usage
  SELECT * FROM pg_stat_user_indexes WHERE idx_scan < 10;

  -- Vacuum and analyze
  VACUUM ANALYZE;
  ```

- [ ] **Security Audit**
  ```bash
  # Check for suspicious login attempts
  grep "failed.*login" /var/log/neonpro/security.log

  # Verify SSL certificate expiration
  openssl x509 -in /etc/ssl/certs/neonpro.crt -dates -noout
  ```

- [ ] **Performance Review**
  - Analyze Web Vitals data
  - Review API response times
  - Check resource utilization
  - Optimize slow queries

#### Monthly Tasks

- [ ] **Compliance Audit**
  - Review LGPD compliance reports
  - Verify data retention policies
  - Check consent management
  - Update audit documentation

- [ ] **Security Assessment**
  - Review access controls
  - Update security policies
  - Check for vulnerabilities
  - Test incident response procedures

- [ ] **Backup Verification**
  - Test restore procedures
  - Verify backup integrity
  - Review retention policies
  - Update disaster recovery plan

---

## Emergency Procedures

### Incident Response

#### 1. System Outage

**Immediate Actions:**

1. Check health endpoints: `/api/health`
2. Review error logs
3. Check external service status (Supabase, CDN)
4. Implement emergency fallbacks if available

**Communication:**

- Update status page
- Notify stakeholders
- Document incident timeline

#### 2. Data Breach Response

**LGPD Compliance Requirements:**

1. **Within 72 hours:** Notify regulatory authorities
2. **Within 72 hours:** Notify affected individuals
3. **Document:** Incident details and response actions

**Immediate Actions:**

```bash
# Isolate affected systems
pm2 stop all

# Enable maintenance mode
echo "Maintenance mode enabled" > /var/www/html/maintenance.html

# Preserve evidence
cp -r /var/log/neonpro /backup/incident-$(date +%Y%m%d)
```

#### 3. Performance Degradation

**Diagnostic Steps:**

```bash
# Check system resources
htop
df -h
free -h

# Check database performance
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check application metrics
curl https://neonpro.com.br/api/monitoring?action=metrics
```

### Comprehensive Rollback Procedures

#### Overview

Rollback procedures are critical for maintaining system stability and data integrity. This section provides detailed step-by-step procedures for different rollback scenarios, including verification steps and communication protocols.

#### Rollback Decision Matrix

| Severity     | Conditions                                                | Rollback Type                | Timeline             |
| ------------ | --------------------------------------------------------- | ---------------------------- | -------------------- |
| **Critical** | System outage, data corruption, security breach           | Full system rollback         | Immediate (< 15 min) |
| **High**     | Major functionality broken, performance degradation > 50% | Application rollback         | < 30 minutes         |
| **Medium**   | Minor features broken, UI issues                          | Feature rollback or hotfix   | < 1 hour             |
| **Low**      | Cosmetic issues, non-critical bugs                        | Scheduled maintenance window | Next deployment      |

#### 1. Application Code Rollback

##### Pre-Rollback Checklist

- [ ] Document current issue and impact
- [ ] Identify last known good deployment
- [ ] Notify stakeholders of planned rollback
- [ ] Backup current state before rollback

##### Step-by-Step Rollback Process

```bash
# 1. Get current deployment information
vercel ls --scope=neonpro

# 2. Identify target rollback deployment
vercel rollback --help

# 3. Execute rollback (Vercel)
vercel promote [deployment-url] --scope=neonpro

# 4. For custom deployments
# Store current deployment info
echo "$(git rev-parse HEAD)" > /tmp/rollback-from-commit.txt
echo "$(date)" >> /tmp/rollback-from-commit.txt

# Rollback to previous stable commit
git checkout [previous-stable-commit]

# Rebuild application
pnpm install --frozen-lockfile
pnpm build

# Restart services
pm2 restart all --update-env

# 5. Verify rollback success
curl -f https://neonpro.com.br/api/health
curl -f https://neonpro.com.br/api/health/quick
```

##### Post-Rollback Verification

```bash
# 1. Run health checks
./scripts/post-rollback-verification.sh

# 2. Test critical user journeys
npx playwright test --config=playwright.config.rollback.ts

# 3. Verify data integrity
curl https://neonpro.com.br/api/health/database

# 4. Check performance metrics
curl https://neonpro.com.br/api/monitoring?action=metrics
```

#### 2. Database Rollback

##### Database Migration Rollback

```bash
# 1. Stop application to prevent new database writes
pm2 stop all

# 2. Create point-in-time backup before rollback (custom format for pg_restore)
pg_dump -h localhost -U postgres -d neonpro -Fc -f /backup/pre-rollback-$(date +%Y%m%d_%H%M%S).dump

# 3. Rollback specific migration
supabase migration down [migration-name]

# 4. Verify schema state
supabase db diff

# 5. Restart application with previous version
git checkout [previous-database-compatible-commit]
pnpm build
pm2 start all
```

##### Full Database Restore

```bash
# 1. Emergency database restore procedure
# Create maintenance mode
echo '{"maintenance": true, "message": "Emergency maintenance in progress"}' > /var/www/html/maintenance.json

# 2. Stop all services accessing database
pm2 stop all
systemctl stop nginx  # if applicable

# 3. Create backup of current state (custom format)
pg_dump -h localhost -U postgres -d neonpro_current -Fc -f /backup/emergency-backup-$(date +%Y%m%d_%H%M%S).dump

# 4. Restore from backup (matching custom format)
dropdb neonpro_current
createdb neonpro_current
pg_restore -d neonpro_current /backup/[backup-file].dump

# 5. Verify database integrity
psql -d neonpro_current -c "SELECT COUNT(*) FROM patients;"
psql -d neonpro_current -c "SELECT COUNT(*) FROM appointments;"

# 6. Update application configuration if needed
# Check that SUPABASE_URL points to correct database

# 7. Restart services
pm2 start all
systemctl start nginx

# 8. Remove maintenance mode
rm /var/www/html/maintenance.json
```

##### Point-in-Time Recovery

```bash
# 1. Determine recovery point
echo "Target recovery time: [YYYY-MM-DD HH:MM:SS]"

# 2. Stop application
pm2 stop all

# 3. Restore to specific point in time (Supabase)
# Prerequisites: Pro/Team/Enterprise plan with PITR add-on, physical backups enabled, adequate compute size.
# Use Supabase Dashboard or Management API. Example (Management API):
# POST /v1/projects/{project_ref}/database/backups/restore-pitr
# Body JSON fields:
#   - recovery_time_target_unix: <epoch_seconds>
#   - backup_id (optional): <physical_backup_id_if_required>
#   - source: "pitr"
# Restores must be initiated via the Dashboard or the Management API; CLI restore with recovery-time is not supported.

# 4. Verify recovery point
psql -c "SELECT MAX(created_at) FROM audit_logs;"

# 5. Restart application
pm2 start all
```

#### 3. Environment Configuration Rollback

##### Environment Variable Rollback

```bash
# 1. Backup current environment variables
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# 2. Restore previous environment configuration
cp .env.production.previous .env.production

# 3. Verify critical variables are set
grep -E "SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|JWT_SECRET" .env.production

# 4. Restart application with new environment
pm2 restart all --update-env

# 5. Verify application starts correctly
sleep 10
curl -f https://neonpro.com.br/api/health
```

##### Supabase Configuration Rollback

```bash
# 1. Rollback Supabase project settings
supabase projects list
supabase link --project-ref [previous-project-ref]

# 2. Update environment variables
export NEXT_PUBLIC_SUPABASE_URL=[previous-url]
export SUPABASE_SERVICE_ROLE_KEY=[previous-key]

# 3. Update application configuration
sed -i 's/current-supabase-url/previous-supabase-url/g' .env.production

# 4. Restart with updated configuration
pm2 restart all --update-env
```

#### 4. Feature Flag Rollback

```bash
# 1. Identify feature flags to rollback
curl https://neonpro.com.br/api/feature-flags | jq '.'

# 2. Disable problematic features
curl -X POST https://neonpro.com.br/api/feature-flags \
  -H "Content-Type: application/json" \
  -d '{"flag": "new-appointment-ui", "enabled": false}'

# 3. Verify feature is disabled
curl https://neonpro.com.br/api/feature-flags/new-appointment-ui

# 4. Clear feature flag cache
curl -X POST https://neonpro.com.br/api/cache/clear?type=feature-flags
```

#### 5. Rollback Testing Procedures

##### Automated Rollback Testing

```bash
# Create rollback test script
cat > scripts/test-rollback-procedures.sh << 'EOF'
#!/bin/bash
set -e

echo "🧪 Testing rollback procedures..."

# 1. Test health endpoints after rollback
echo "Testing health endpoints..."
curl -f https://neonpro.com.br/api/health || exit 1
curl -f https://neonpro.com.br/api/health/database || exit 1

# 2. Test critical functionality
echo "Testing critical functionality..."
curl -f https://neonpro.com.br/api/patients || exit 1
curl -f https://neonpro.com.br/api/appointments || exit 1

# 3. Test authentication
echo "Testing authentication..."
curl -X POST https://neonpro.com.br/api/auth/health || exit 1

# 4. Test performance
echo "Testing performance..."
response_time=$(curl -o /dev/null -s -w '%{time_total}' https://neonpro.com.br)
if (( $(echo "$response_time > 3.0" | bc -l) )); then
  echo "❌ Response time too slow: ${response_time}s"
  exit 1
fi

echo "✅ All rollback tests passed"
EOF

chmod +x scripts/test-rollback-procedures.sh
```

##### Manual Testing Checklist

After any rollback, verify:

- [ ] **Authentication Flow**
  - Login/logout functionality
  - Password reset
  - Session management

- [ ] **Core Features**
  - Patient registration
  - Appointment booking
  - Medical records access
  - Clinic management

- [ ] **Data Integrity**
  - Recent patient data accessible
  - Appointments show correctly
  - Audit logs intact
  - Consent records preserved

- [ ] **Compliance Features**
  - LGPD data processing
  - Audit trail generation
  - Consent management
  - Data retention policies

#### 6. Communication During Rollback

##### Internal Communication Template

```markdown
**PRODUCTION ROLLBACK NOTIFICATION**

**Status:** IN PROGRESS / COMPLETED
**Severity:** Critical / High / Medium / Low
**Start Time:** [YYYY-MM-DD HH:MM UTC]
**Expected Completion:** [YYYY-MM-DD HH:MM UTC]

**Issue Description:**
[Brief description of the issue requiring rollback]

**Rollback Scope:**

- [ ] Application code
- [ ] Database changes
- [ ] Environment configuration
- [ ] Feature flags

**Impact:**

- Affected users: [number/percentage]
- Affected features: [list]
- Estimated downtime: [duration]

**Current Status:**
[Update on rollback progress]

**Next Update:** [when next update will be provided]
```

##### External Communication Template

```markdown
**SERVICE MAINTENANCE UPDATE**

We are currently performing emergency maintenance to resolve a service issue.

**Status:** Maintenance in progress
**Affected Services:** [list affected features]
**Expected Resolution:** [time]

We apologize for any inconvenience and will provide updates as they become available.

For urgent matters, please contact: emergency@neonpro.com.br
```

#### 7. Post-Rollback Procedures

##### Immediate Actions (0-15 minutes)

1. **Verify System Health**
   ```bash
   # Run comprehensive health check
   curl https://neonpro.com.br/api/health | jq '.'

   # Check all critical endpoints
   ./scripts/test-rollback-procedures.sh
   ```

2. **Monitor Key Metrics**
   ```bash
   # Monitor error rates
   curl https://neonpro.com.br/api/monitoring?action=errors&timeframe=5m

   # Monitor response times
   curl https://neonpro.com.br/api/monitoring?action=performance&timeframe=5m
   ```

3. **Update Status Communications**
   - Internal team notification
   - User-facing status page update
   - Stakeholder communication

##### Short-term Actions (15 minutes - 2 hours)

1. **Conduct Post-Rollback Analysis**
   - Document root cause of original issue
   - Identify what went wrong with deployment
   - Create action items to prevent recurrence

2. **Monitor for Side Effects**
   - Watch for data inconsistencies
   - Monitor user complaints or support tickets
   - Check compliance audit trails

3. **Plan Forward Path**
   - Determine fix strategy for original issue
   - Schedule proper deployment of corrected version
   - Update deployment procedures if needed

##### Long-term Actions (2+ hours)

1. **Create Incident Report**
   ```markdown
   **INCIDENT REPORT: [YYYY-MM-DD]**

   **Timeline:**

   - [HH:MM] Issue detected
   - [HH:MM] Rollback decision made
   - [HH:MM] Rollback initiated
   - [HH:MM] Rollback completed
   - [HH:MM] System verified healthy

   **Root Cause:**
   [Detailed analysis of what caused the issue]

   **Impact Analysis:**

   - Downtime duration: [X minutes]
   - Users affected: [number]
   - Data integrity: [status]

   **Preventive Measures:**

   - [ ] Improve testing procedures
   - [ ] Update deployment checklist
   - [ ] Add monitoring alerts
   - [ ] Enhance rollback automation
   ```

2. **Update Rollback Procedures**
   - Document any new rollback scenarios encountered
   - Update automation scripts based on lessons learned
   - Train team on updated procedures

3. **Schedule Follow-up Deployment**
   - Fix original issue
   - Enhanced testing for the fix
   - Staged rollout plan
   - Improved monitoring for the corrected deployment

#### 8. Rollback Automation Scripts

##### Quick Rollback Script

```bash
#!/bin/bash
# scripts/emergency-rollback.sh

set -e

ROLLBACK_TYPE=${1:-"full"}
ROLLBACK_TARGET=${2:-""}

echo "🚨 Emergency rollback initiated: $ROLLBACK_TYPE"

case $ROLLBACK_TYPE in
  "app")
    echo "Rolling back application..."
    vercel rollback $ROLLBACK_TARGET
    ;;
  "db")
    echo "Rolling back database..."
    # Implement database rollback logic
    ./scripts/db-rollback.sh $ROLLBACK_TARGET
    ;;
  "full")
    echo "Full system rollback..."
    ./scripts/app-rollback.sh $ROLLBACK_TARGET
    ./scripts/db-rollback.sh $ROLLBACK_TARGET
    ;;
  *)
    echo "Invalid rollback type. Use: app, db, or full"
    exit 1
    ;;
esac

# Verify rollback
sleep 30
./scripts/test-rollback-procedures.sh

echo "✅ Emergency rollback completed successfully"
```

This comprehensive rollback section ensures that the team has detailed, step-by-step procedures for various rollback scenarios, proper testing mechanisms, and communication protocols to minimize downtime and maintain system stability.

---

## Compliance & Audit

### LGPD Compliance Monitoring

#### Data Processing Audit

```sql
-- Query audit logs for data processing activities
SELECT 
    action,
    table_name,
    user_id,
    details,
    created_at
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '30 days'
AND action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
ORDER BY created_at DESC;
```

#### Consent Management Audit

```sql
-- Check consent status for all patients
SELECT 
    p.id,
    p.name,
    c.consent_type,
    c.status,
    c.granted_at,
    c.expires_at
FROM patients p
LEFT JOIN consent_records c ON p.id = c.patient_id
WHERE c.status = 'active';
```

#### Data Retention Compliance

```sql
-- Identify data exceeding retention periods
SELECT 
    table_name,
    COUNT(*) as records,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM (
    SELECT 'patients' as table_name, created_at FROM patients WHERE created_at < NOW() - INTERVAL '5 years'
    UNION ALL
    SELECT 'medical_records', created_at FROM medical_records WHERE created_at < NOW() - INTERVAL '7 years'
    UNION ALL
    SELECT 'audit_logs', created_at FROM audit_logs WHERE created_at < NOW() - INTERVAL '7 years'
) data_age
GROUP BY table_name;
```

### ANVISA Compliance

#### Medical Device Validation

- [ ] Software classification: Class I Medical Device Software
- [ ] Quality management system: ISO 13485 compliant
- [ ] Risk management: ISO 14971 compliant
- [ ] Clinical evaluation documentation maintained

#### Audit Trail Requirements

```sql
-- ANVISA audit trail verification
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(created_at) as first_record,
    MAX(created_at) as last_record
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 year';
```

### CFM Compliance

#### Telemedicine Compliance Check

```sql
-- Verify telemedicine sessions have required elements
SELECT 
    t.id,
    t.patient_id,
    t.doctor_id,
    t.consent_recorded,
    t.professional_identification_verified,
    t.data_transmission_secured,
    t.session_date
FROM telemedicine_sessions t
WHERE t.session_date > NOW() - INTERVAL '30 days'
AND (
    t.consent_recorded = false OR
    t.professional_identification_verified = false OR
    t.data_transmission_secured = false
);
```

---

## Troubleshooting

### Common Issues

#### 1. Health Check Failures

**Symptoms:** `/api/health` returns 500 or timeout

**Diagnosis:**

```bash
# Check logs
tail -f /var/log/neonpro/error.log | grep health

# Test database connectivity
curl -f https://neonpro.com.br/api/health?check=database
```

**Solutions:**

- Restart application servers
- Check database connection pool
- Verify environment variables

#### 2. Performance Issues

**Symptoms:** Slow response times, high resource usage

**Diagnosis:**

```bash
# Check Web Vitals
curl https://neonpro.com.br/api/monitoring?action=metrics&type=performance

# Analyze slow queries
SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

**Solutions:**

- Optimize database queries
- Enable caching
- Scale resources
- Review index usage

#### 3. Security Alerts

**Symptoms:** Multiple failed logins, suspicious activity

**Diagnosis:**

```bash
# Check security logs
grep "SECURITY" /var/log/neonpro/application.log | tail -20

# Review rate limiting
curl -I https://neonpro.com.br/api/auth/login
```

**Solutions:**

- Update rate limiting rules
- Block suspicious IP addresses
- Review access controls
- Update security policies

### Contact Information

**Technical Support:**

- Email: tech-support@neonpro.com.br
- Phone: +55 11 9999-9999
- On-call: Available 24/7 for critical issues

**Compliance Officer:**

- Email: compliance@neonpro.com.br
- Phone: +55 11 8888-8888

**Emergency Contacts:**

- CTO: emergency-cto@neonpro.com.br
- Security Officer: security@neonpro.com.br

---

## Appendices

### A. Environment Variables Reference

```bash
# Core Application
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Healthcare Compliance
LGPD_COMPLIANCE_MODE=strict
ANVISA_DEVICE_CLASS=I
CFM_RESOLUTION=2.314/2022

# Monitoring & Analytics
VERCEL_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn

# External Integrations
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
SENDGRID_API_KEY=your-sendgrid-key
```

### B. Database Schema Validation

```sql
-- Validate critical tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'patients', 'medical_records', 'appointments', 
    'clinics', 'clinic_members', 'audit_logs',
    'consent_records', 'performance_metrics'
);

-- Validate RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### C. Backup Schedule Configuration

```yaml
# Backup Configuration
daily_backup:
  schedule: "0 2 * * *" # 2 AM daily
  retention: 30 days
  tables: all

weekly_backup:
  schedule: "0 3 * * 0" # 3 AM Sunday
  retention: 52 weeks
  type: full

monthly_backup:
  schedule: "0 4 1 * *" # 4 AM first day of month
  retention: 84 months
  type: full
  offsite: true
```

---

_This document is maintained by the NeonPro Technical Team and is updated with each release. Last updated: December 2024_
