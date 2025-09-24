---
title: "Production Operations Guide"
last_updated: 2025-09-24
form: how-to
tags: [deployment, operations, production, healthcare, compliance]
related:
  - ../AGENTS.md
  - ../rules/coding-standards.md
  - ../architecture/deployment-architecture.md
---

# Production Operations Guide — How-to

## Goal

Provide comprehensive operational procedures for NeonPro Aesthetic Clinic Platform in production, covering deployment, monitoring, compliance, and emergency procedures.

## Prerequisites

- Production environment access
- Compliance certifications current
- Backup systems verified
- Monitoring infrastructure operational

## Deployment Procedures

### Pre-Deployment Checklist

#### System Requirements

- [ ] All production servers provisioned and accessible
- [ ] Database servers operational and configured
- [ ] Load balancers configured and tested
- [ ] CDN and SSL certificates active
- [ ] Backup systems verified and current
- [ ] Monitoring infrastructure operational

#### Compliance Requirements

- [ ] LGPD compliance validation completed
- [ ] ANVISA cosmetic product registration verified
- [ ] Professional council compliance certification current
- [ ] Data Protection Officer (DPO) notified
- [ ] Security assessment completed
- [ ] Compliance documentation updated

### Production Deployment Process

```bash
# 1. Pre-deployment health check
./monitoring/scripts/health-check.sh
./monitoring/scripts/compliance-validator.sh

# 2. Database preparation
./scripts/backup-database.sh production
bunx prisma migrate deploy --preview-feature
bunx prisma db validate

# 3. Build and optimize assets
bun run build
bun run optimize:aesthetic
./scripts/generate-sri.sh

# 4. Deploy to production
vercel deploy --prod
vercel inspect neonpro-aesthetic-platform

# 5. Post-deployment validation
./monitoring/scripts/health-check.sh
curl -f https://api.neonpro.aesthetic/health
```

### Environment Configuration

```bash
# Application
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://api.neonpro.aesthetic
NEXT_PUBLIC_SUPABASE_URL=https://neonpro-db.supabase.co

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
SESSION_SECRET=your_session_secret

# Compliance
LGPD_CONSENT_REQUIRED=true
ANVISA_COSMETIC_COMPLIANCE=true
PROFESSIONAL_COUNCIL_STANDARDS=true

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

## Monitoring and Observability

### Dashboard Access

- **Grafana**: `https://monitoring.neonpro.aesthetic`
- **Kibana**: `https://logs.neonpro.aesthetic`
- **Sentry**: `https://sentry.neonpro.aesthetic`

### Key Metrics

- API Response Time < 2s
- Error Rate < 1%
- Availability > 99.9%
- Database Response Time < 500ms

### Aesthetic Clinic-Specific Metrics

- Active Client Count
- Treatment Appointment Success Rate
- Client Record Access Frequency
- Compliance Validation Status

## Security Operations

### Incident Response Process

1. **Detection**
   ```bash
   # Check security incidents
   curl -s https://api.neonpro.aesthetic/api/security/incidents/recent | jq '.incidents'

   # Review audit logs
   curl -s https://api.neonpro.aesthetic/api/audit/recent | jq '.events'
   ```

2. **Assessment**
   - Determine impact scope
   - Classify incident severity
   - Identify affected systems
   - Estimate client impact

3. **Containment**
   - Isolate affected systems
   - Preserve forensic evidence
   - Implement temporary controls
   - Notify stakeholders

4. **Recovery**
   - Restore normal operations
   - Monitor for recurrence
   - Update security controls
   - Document lessons learned

### Alert Escalation Matrix

| Severity | Response Time | Escalation Path              |
| -------- | ------------- | ---------------------------- |
| Critical | 15 minutes    | CEO → CTO → Security Lead    |
| High     | 30 minutes    | CTO → Security Lead → DevOps |
| Medium   | 1 hour        | Security Lead → DevOps       |
| Low      | 4 hours       | DevOps Team                  |

## Compliance Operations

### LGPD Compliance

- **Access Requests**: Process within 15 days
- **Deletion Requests**: Process within 30 days
- **Portability Requests**: Process within 30 days
- **Consent Withdrawal**: Process immediately

### ANVISA Compliance

- **Registration**: Valid ANVISA cosmetic registration required
- **Quality Management**: ISO 22716 compliance
- **Product Safety**: Adverse reaction reporting
- **Risk Management**: Cosmetic product safety compliance

### Data Breach Notification

- **Timeline**: Within 48 hours of discovery
- **ANVISA Notification**: For cosmetic product data breaches
- **Affected Individuals**: Direct notification required
- **Documentation**: Maintain breach records for 5 years

## Rollback Procedures

### Immediate Rollback Triggers

- Client Safety Risk
- Data Integrity Issues
- Security Breach
- Compliance Violation
- System Instability (>5% error rate or >30s response times)

### Rollback Process

```bash
# 1. Immediate containment
kubectl scale deployment/api --replicas=0

# 2. Restore previous version
vercel rollback --target=previous

# 3. Database rollback (if needed)
./scripts/rollback-database.sh

# 4. Validate rollback
./monitoring/scripts/health-check.sh

# 5. Notify stakeholders
./scripts/notify-rollback.sh
```

## Emergency Procedures

### Contact Information

- **Security Team**: `security@neonpro.aesthetic`
- **On-call Security**: `+5511999999999`
- **DPO**: `dpo@neonpro.aesthetic`
- **Legal Counsel**: `legal@neonpro.aesthetic`

### Emergency Response

1. Assess situation severity
2. Activate incident response team
3. Implement immediate containment
4. Communicate with stakeholders
5. Execute recovery procedures
6. Conduct post-incident review

## Troubleshooting

### Common Issues

- **High Response Times**
  - Check database performance
  - Verify CDN status
  - Review application metrics

- **Authentication Failures**
  - Verify JWT configuration
  - Check session management
  - Review security logs

- **Compliance Alerts**
  - Validate data encryption
  - Check audit logging
  - Review access controls

### Performance Optimization

- Monitor cache hit rates
- Optimize database queries
- Review API endpoints
- Check CDN performance

## See Also

- [Architecture Documentation](../architecture/AGENTS.md)
- [Security Guidelines](../security/security-hardening-summary.md)
- [Compliance Requirements](../compliance/README.md)
- [Monitoring Setup](../AGENTS.md)
