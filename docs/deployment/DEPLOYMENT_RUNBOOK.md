# NeonPro Deployment Runbook

## Emergency Contact Information

### Primary Contacts
- **Platform Lead**: [Name] - [Phone] - [Email]
- **DevOps Engineer**: [Name] - [Phone] - [Email]
- **Security Officer**: [Name] - [Phone] - [Email]
- **Compliance Officer**: [Name] - [Phone] - [Email]

### Escalation Matrix
1. **Level 1**: Development Team (Slack #devops)
2. **Level 2**: Platform Lead (Call/Text)
3. **Level 3**: CTO (Call/Text)
4. **Level 4**: Executive Team (Emergency only)

## Pre-Deployment Checklist

### ✅ Requirements Verification
- [ ] All code changes reviewed and approved
- [ ] Automated tests passing (≥90% coverage)
- [ ] Security scan completed with no critical findings
- [ ] Compliance validation passed (LGPD/ANVISA/CFM)
- [ ] Performance benchmarks met
- [ ] Documentation updated

### ✅ Environment Preparation
- [ ] Vercel projects configured and accessible
- [ ] Environment variables verified in both projects
- [ ] Database migrations prepared and tested
- [ ] Backup procedures verified
- [ ] Rollback plan documented and tested

### ✅ Health Checks
- [ ] Local build successful (`bun run build`)
- [ ] All tests passing (`bun test`)
- [ ] Type checking successful (`bun run type-check`)
- [ ] Linting successful (`bun run lint`)
- [ ] Dependency vulnerabilities resolved

## Deployment Process

### Phase 1: Preparation (15 minutes)
```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Clean build artifacts
rm -rf .turbo
rm -rf node_modules/.cache
rm -rf packages/*/dist
rm -rf apps/*/dist

# 3. Install dependencies
bun install

# 4. Verify local build
bun run build
```

### Phase 2: Database Migration (10 minutes)
```bash
# 1. Create backup
supabase db dump --role=postgres > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Run migrations
cd packages/database
bun run prisma:migrate

# 3. Generate types
bun run prisma:generate

# 4. Verify migration
bun run test:health
```

### Phase 3: API Deployment (20 minutes)
```bash
# 1. Navigate to API directory
cd apps/api

# 2. Build and test
bun run build
bun test

# 3. Deploy to Vercel
vercel --prod --yes

# 4. Verify deployment
vercel logs --follow
```

### Phase 4: Web Application Deployment (20 minutes)
```bash
# 1. Navigate to web directory
cd apps/web

# 2. Build and test
bun run build
bun test

# 3. Deploy to Vercel
vercel --prod --yes

# 4. Verify deployment
vercel logs --follow
```

### Phase 5: Post-Deployment Verification (15 minutes)
```bash
# 1. Health check endpoints
curl https://neonpro-api.vercel.app/api/health
curl https://neonpro-web.vercel.app/api/health

# 2. Verify API connectivity
curl https://neonpro-api.vercel.app/api/chat/health

# 3. Test critical user flows
# (Manual verification through web interface)

# 4. Check monitoring dashboards
# (Vercel Analytics, logging services)
```

## Health Check Procedures

### API Health Checks
```bash
# Overall health
curl https://neonpro-api.vercel.app/health

# Database connectivity
curl https://neonpro-api.vercel.app/api/health/database

# AI services
curl https://neonpro-api.vercel.app/api/health/ai

# Authentication service
curl https://neonpro-api.vercel.app/api/health/auth
```

### Web Application Health Checks
```bash
# Overall health
curl https://neonpro-web.vercel.app/api/health

# Static assets serving
curl -I https://neonpro-web.vercel.app/assets/main.js

# Service worker registration
curl https://neonpro-web.vercel.app/sw.js
```

### Database Health Checks
```bash
# Connection test
bunx prisma db execute --stdin <<< "SELECT 1;"

# Table count verification
bunx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Recent data check
bunx prisma db execute --stdin <<< "SELECT COUNT(*) as total_users FROM users WHERE created_at > NOW() - INTERVAL '1 hour';"
```

## Incident Response Procedures

### P1 - Critical Outage (All users affected)
**Response Time**: 15 minutes
**Impact**: Complete service outage

1. **Immediate Actions (0-15 minutes)**
   - [ ] Alert on-call engineers
   - [ ] Create incident channel (#incident-YYYYMMDD-HHMM)
   - [ ] Determine scope and impact
   - [ ] Initiate rollback if necessary

2. **Investigation (15-45 minutes)**
   - [ ] Check Vercel status page
   - [ ] Review deployment logs
   - [ ] Check database connectivity
   - [ ] Verify third-party services

3. **Resolution (45-90 minutes)**
   - [ ] Implement fix or rollback
   - [ ] Verify service restoration
   - [ ] Monitor for recurrence
   - [ ] Communicate status updates

4. **Post-Incident (90+ minutes)**
   - [ ] Document root cause
   - [ ] Create preventive measures
   - [ ] Schedule post-mortem
   - [ ] Update runbook

### P2 - Partial Outage (Some users affected)
**Response Time**: 30 minutes
**Impact**: Degraded service or feature outage

1. **Immediate Actions (0-30 minutes)**
   - [ ] Alert development team
   - [ ] Assess impact and affected users
   - [ ] Check monitoring dashboards
   - [ ] Implement temporary workaround if possible

2. **Investigation (30-60 minutes)**
   - [ ] Review error logs
   - [ ] Check specific service health
   - [ ] Analyze user reports
   - [ ] Test affected features

3. **Resolution (60-120 minutes)**
   - [ ] Deploy fix or configuration change
   - [ ] Verify feature restoration
   - [ ] Monitor error rates
   - [ ] Update status page

### P3 - Performance Degradation
**Response Time**: 2 hours
**Impact**: Slow performance or intermittent issues

1. **Investigation (0-2 hours)**
   - [ ] Review performance metrics
   - [ ] Check database query performance
   - [ ] Analyze CDN and edge caching
   - [ ] Monitor third-party API performance

2. **Resolution (2-4 hours)**
   - [ ] Optimize slow queries
   - [ ] Adjust caching strategies
   - [ ] Scale resources if needed
   - [ ] Deploy performance improvements

## Rollback Procedures

### Emergency Rollback (Critical Issues)
```bash
# 1. Check recent deployments
vercel ls neonpro-api
vercel ls neonpro-web

# 2. Identify last stable deployment
vercel ls neonpro-api --limit=5
vercel ls neonpro-web --limit=5

# 3. Rollback API service
vercel rollback neonpro-api <deployment-id>

# 4. Rollback web application
vercel rollback neonpro-web <deployment-id>

# 5. Verify rollback success
curl https://neonpro-api.vercel.app/health
curl https://neonpro-web.vercel.app/health
```

### Database Rollback
```bash
# 1. Create current state backup
supabase db dump --role=postgres > pre-rollback-backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Restore from backup
supabase db restore backup-YYYYMMDD-HHMMSS.sql

# 3. Run reverse migrations if needed
bun run prisma:migrate:down

# 4. Verify data integrity
bun run test:compliance
```

## Monitoring and Alerting

### Key Metrics to Monitor
- **Response Time**: P95 < 2000ms
- **Error Rate**: < 1% of requests
- **Availability**: > 99.9%
- **Database Response Time**: < 500ms
- **Memory Usage**: < 80% of allocated
- **CPU Usage**: < 70% of allocated

### Alert Thresholds
```yaml
Critical:
  - error_rate > 5%
  - response_time_p95 > 5000ms
  - availability < 99%
  - database_connections > 80%

Warning:
  - error_rate > 1%
  - response_time_p95 > 2000ms
  - memory_usage > 70%
  - cpu_usage > 80%
```

### Dashboard Links
- [Vercel Analytics](https://vercel.com/neonpro/analytics)
- [Supabase Logs](https://supabase.com/project/logs)
- [Error Tracking](https://your-error-tracking-service.com)
- [Performance Monitoring](https://your-performance-monitoring.com)

## Backup and Recovery

### Database Backups
- **Automated Daily**: Full database dumps
- **Automated Hourly**: Transaction log backups
- **Real-time**: Point-in-time recovery enabled
- **Retention**: 30 days for daily, 7 days for hourly

### Backup Verification
```bash
# Test backup restore
supabase db restore backup-YYYYMMDD-HHMMSS.sql --dry-run

# Verify backup integrity
bunx prisma db execute --stdin <<< "SELECT COUNT(*) as total_records FROM users;"

# Test specific data recovery
bunx prisma db execute --stdin <<< "SELECT * FROM users WHERE id = 'test-user-id';"
```

### Disaster Recovery
1. **Infrastructure Recovery**: Vercel automatic deployment recovery
2. **Database Recovery**: Supabase point-in-time recovery
3. **Data Recovery**: From verified backups
4. **Service Recovery**: Automatic failover to secondary regions

## Security Incident Response

### Data Breach Response
1. **Immediate Containment**
   - [ ] Disable affected services
   - [ ] Rotate all credentials
   - [ ] Change encryption keys
   - [ ] Notify security team

2. **Investigation**
   - [ ] Determine breach scope
   - [ ] Identify compromised data
   - [ ] Collect forensic evidence
   - [ ] Document timeline

3. **Notification**
   - [ ] Legal team notification
   - [ ] Regulatory compliance (ANVISA/LGPD)
   - [ ] Affected user notification
   - [ ] Public statement preparation

4. **Recovery**
   - [ ] Patch vulnerabilities
   - [ ] Restore clean data
   - [ ] Implement additional security measures
   - [ ] Monitor for suspicious activity

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly patches, quarterly updates
- **Duration**: 2-4 hours
- **Notification**: 72 hours advance notice
- **Time Window**: Sunday 2:00 AM - 6:00 AM BRT

### Maintenance Checklist
- [ ] Communicate maintenance window to users
- [ ] Create backup before maintenance
- [ ] Apply security patches
- [ ] Update dependencies
- [ ] Test all services post-maintenance
- [ ] Monitor for issues for 24 hours

## Compliance Monitoring

### Healthcare Compliance Checks
- **Daily**: Automated compliance scans
- **Weekly**: Manual compliance review
- **Monthly**: Third-party compliance audit
- **Quarterly**: Full security assessment

### Required Compliance Frameworks
- **LGPD** (Lei Geral de Proteção de Dados)
- **ANVISA** (Agência Nacional de Vigilância Sanitária)
- **CFM** (Conselho Federal de Medicina)
- **ISO 27001** (Information Security Management)

## Post-Deployment Activities

### Monitoring (First 24 Hours)
- [ ] Monitor error rates every 30 minutes
- [ ] Check performance metrics hourly
- [ ] Review database performance
- [ ] Verify user adoption metrics

### Documentation Updates
- [ ] Update deployment logs
- [ ] Document any issues encountered
- [ ] Update runbook with new procedures
- [ ] Archive deployment artifacts

### Team Debrief
- [ ] Schedule post-deployment review
- [ ] Discuss successes and challenges
- [ ] Identify process improvements
- [ ] Update deployment checklist

## Runbook Maintenance

### Review Schedule
- **Monthly**: Verify contact information
- **Quarterly**: Update procedures and checklists
- **Bi-annually**: Full runbook review and update
- **Annually**: Third-party validation and audit

### Change Management
1. All runbook changes must be reviewed by the Platform Lead
2. Changes must be tested in a non-production environment
3. Team must be notified of significant procedure changes
4. Previous versions must be archived for audit purposes

## Emergency Procedures

### Complete System Failure
1. **Activate Disaster Recovery Plan**
2. **Escalate to Executive Team**
3. **Initiate customer communication protocol**
4. **Engage external support services**
5. **Implement business continuity measures**

### Security Incident
1. **Activate Security Incident Response Team**
2. **Preserve forensic evidence**
3. **Isolate affected systems**
4. **Notify legal and compliance teams**
5. **Begin regulatory reporting process**

### Data Loss Event
1. **Activate Data Recovery Plan**
2. **Assess data loss scope and impact**
3. **Initiate recovery from verified backups**
4. **Verify data integrity post-recovery**
5. **Implement additional data protection measures