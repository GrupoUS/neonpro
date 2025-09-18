---
title: "CSP (Content Security Policy) Report-Only Headers & Endpoint"
last_updated: 2025-09-17
form: feature
tags: [security, csp, headers, compliance, lgpd]
related:
  - ../rules/security-headers.md
  - ../apis/csp-report.md
---

# CSP (Content Security Policy) Report-Only Headers & Endpoint

## Overview

NeonPro implements CSP (Content Security Policy) headers in **Report-Only mode** to monitor potential security violations without blocking content. This provides security insights while maintaining application functionality during the monitoring phase.

## Implementation

### CSP Headers Configuration

Headers are injected via Vercel configuration files:

**Location**: `vercel.json` and `api-vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co; report-uri /api/csp-report"
        }
      ]
    }
  ]
}
```

### CSP Report Endpoint

**Endpoint**: `/api/csp-report`  
**Method**: `POST`  
**Purpose**: Receives and logs CSP violation reports from browsers

**Sample Payload**:
```json
{
  "csp-report": {
    "document-uri": "https://neonpro.app/dashboard",
    "referrer": "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'...",
    "blocked-uri": "https://malicious-site.com/script.js",
    "status-code": 200,
    "script-sample": ""
  }
}
```

## CSP Policy Breakdown

| Directive | Policy | Rationale |
|-----------|--------|-----------|
| `default-src` | `'self'` | Only allow resources from same origin by default |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://js.stripe.com` | Allow app scripts, Vercel live reload, Stripe payments |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Allow app styles and Google Fonts |
| `font-src` | `'self' https://fonts.gstatic.com` | Allow app fonts and Google Fonts |
| `img-src` | `'self' data: https:` | Allow app images, data URIs, and HTTPS images |
| `connect-src` | `'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co` | Allow API calls to Stripe and Supabase |
| `report-uri` | `/api/csp-report` | Send violation reports to our endpoint |

## Security Benefits

### LGPD Compliance
- **Data Protection**: CSP helps prevent XSS attacks that could expose patient data
- **Audit Trail**: CSP reports provide security audit logs
- **Privacy by Design**: Proactive security monitoring aligns with LGPD principles

### Healthcare Security
- **Patient Data Protection**: Prevents malicious script injection
- **Compliance Monitoring**: CSP reports help maintain security standards
- **Incident Response**: Early warning system for potential security threats

## Monitoring & Alerting

### Report Processing
1. **Immediate Logging**: All CSP reports are logged for analysis
2. **Threat Detection**: Patterns in reports may indicate security threats
3. **Policy Refinement**: Reports help optimize CSP policies before enforcement

### Future Implementation
- **Alert System**: Integrate CSP reports with monitoring stack
- **Policy Enforcement**: Transition from Report-Only to enforcing mode
- **Automated Response**: Block suspicious sources based on report patterns

## Configuration Files

- **Frontend Headers**: `vercel.json` - CSP headers for web app
- **API Headers**: `api-vercel.json` - CSP headers for API routes
- **Report Handler**: `api/csp-report.ts` - Processes violation reports

## Best Practices

1. **Gradual Enforcement**: Start with Report-Only mode to avoid breaking changes
2. **Regular Review**: Analyze CSP reports to identify false positives
3. **Policy Updates**: Refine CSP directives based on legitimate usage patterns
4. **Documentation**: Keep CSP policies documented and version controlled

## Troubleshooting

### Common Issues
- **False Positives**: Browser extensions may trigger CSP violations
- **Third-party Services**: New integrations may require CSP policy updates
- **Development Mode**: Consider relaxed policies for development environments

### Report Analysis
- Monitor `/api/csp-report` logs for violation patterns
- Investigate unexpected `blocked-uri` values
- Review `violated-directive` for policy optimization opportunities

---

**Implementation Status**: ✅ Complete - Headers configured, endpoint active  
**Security Level**: Report-Only (monitoring phase)  
**Next Steps**: Monitor reports → Policy refinement → Enforcement mode