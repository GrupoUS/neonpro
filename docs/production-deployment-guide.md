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

### Rollback Procedures

#### Code Rollback

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Custom deployment rollback
git checkout [previous-stable-commit]
pm2 restart all
```

#### Database Rollback

```bash
# Restore from backup
supabase db dump --db-url=[backup-url] | supabase db reset --db-url=[current-url]

# Point-in-time recovery
pg_restore -d neonpro backup_file.sql
```

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
