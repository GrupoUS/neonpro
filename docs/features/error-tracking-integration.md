# Error Tracking Integration

Complete error tracking and monitoring solution for NeonPro API with support for multiple providers and production-ready configuration.

## Overview

This implementation provides a comprehensive error tracking system with:

- **Multi-Provider Support**: Sentry, Rollbar, LogRocket, or custom tracking
- **Environment Gating**: Different configurations for dev/staging/production
- **Healthcare Compliance**: Audit logging for healthcare operations
- **Security Monitoring**: Detection and tracking of security threats
- **Performance Monitoring**: Slow request detection and reporting
- **Structured Context**: Rich error context with request/user information

## Supported Providers

### 1. Sentry (Recommended)
**Pros**: 
- Excellent error grouping and analysis
- Rich performance monitoring
- Strong React/Node.js integration
- Generous free tier

**Setup**:
```bash
npm install @sentry/node
```

**Configuration**:
```env
ERROR_TRACKING_PROVIDER=sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
ERROR_TRACKING_SAMPLE_RATE=0.1
ERROR_TRACKING_PERFORMANCE=true
```

### 2. Rollbar
**Pros**:
- Real-time error tracking
- Deployment tracking
- Good pricing for teams

**Setup**:
```bash
npm install rollbar
```

**Configuration**:
```env
ERROR_TRACKING_PROVIDER=rollbar
ROLLBAR_ACCESS_TOKEN=your-rollbar-token
ERROR_TRACKING_SAMPLE_RATE=1.0
```

### 3. Custom Tracking
**Pros**:
- Full control over data
- No external dependencies
- Privacy compliant

**Configuration**:
```env
ERROR_TRACKING_PROVIDER=custom
ERROR_TRACKING_DEBUG=true
```

## Environment Configuration

### Production Environment Variables

Add these to your Vercel project settings:

```env
# Core Configuration
ERROR_TRACKING_PROVIDER=sentry
SENTRY_DSN=https://your-production-dsn@sentry.io/project
ERROR_TRACKING_SAMPLE_RATE=0.1
ERROR_TRACKING_PERFORMANCE=false

# Environment Gates
ERROR_TRACKING_ENABLE_PROD=true
ERROR_TRACKING_ENABLE_DEV=true
ERROR_TRACKING_ENABLE_TEST=false
```

### Development Configuration

Create `.env.local`:

```env
ERROR_TRACKING_PROVIDER=custom
ERROR_TRACKING_SAMPLE_RATE=1.0
ERROR_TRACKING_PERFORMANCE=true
ERROR_TRACKING_DEBUG=true
```

## Integration Points

### 1. Application Startup

Error tracking is automatically initialized in `app.ts`:

```typescript
import { initializeErrorTracking } from './lib/error-tracking';

// Initialize error tracking
initializeErrorTracking().catch((error) => {
  logger.warn('Error tracking initialization failed', { error: error.message });
});
```

### 2. Middleware Stack

The middleware stack is automatically applied:

```typescript
import { getErrorTrackingMiddlewareStack } from './middleware/error-tracking-middleware';

// Error tracking middleware stack
const errorTrackingStack = getErrorTrackingMiddlewareStack();
errorTrackingStack.forEach(middleware => app.use('*', middleware));
```

### 3. Manual Error Reporting

You can manually report errors in your code:

```typescript
import { errorTracker } from '../lib/error-tracking';

// In route handlers
app.get('/example', async (c) => {
  try {
    // Your code here
    const result = await someOperation();
    return c.json(result);
  } catch (error) {
    // Manual error reporting with context
    const context = errorTracker.extractContextFromHono(c, {
      extra: { operationType: 'example_operation' }
    });
    
    errorTracker.captureException(error as Error, context);
    
    return c.json({ error: 'Operation failed' }, 500);
  }
});
```

## Error Context and Metadata

### Automatic Context Collection

Every error includes:

- **Request Information**: Method, path, headers, IP
- **User Context**: User ID, clinic ID, patient ID (when available)  
- **Environment**: Node version, deployment info, release version
- **Timing**: Request duration, memory usage
- **Healthcare Context**: Patient/clinic data access tracking

### Example Error Context

```json
{
  "requestId": "req-123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-456",
  "clinicId": "clinic-789",
  "patientId": "patient-321",
  "endpoint": "/api/v1/patients/321",
  "method": "POST",
  "userAgent": "Mozilla/5.0...",
  "ip": "203.0.113.1",
  "timestamp": "2024-12-28T12:00:00.000Z",
  "environment": "production",
  "release": "abc123def456",
  "extra": {
    "duration": 1250,
    "memoryUsage": "45.2MB",
    "operationType": "patient_update"
  }
}
```

## Security and Compliance Features

### 1. Data Sanitization

Sensitive data is automatically redacted:

- Passwords, tokens, secrets
- Patient SSN, CPF, RG numbers  
- Credit card information
- Authorization headers

### 2. Healthcare Audit Logging

Healthcare operations are automatically tracked:

```typescript
// Automatically tracked operations
POST /api/v1/patients           // Patient creation
PUT  /api/v1/patients/:id       // Patient updates  
GET  /api/v1/patients/:id       // Patient data access
POST /api/v1/appointments       // Appointment creation
```

### 3. Security Threat Detection

Automatic detection and reporting of:

- Path traversal attempts (`../`)
- XSS injection (`<script>`)
- SQL injection (`union select`, `drop table`)
- JavaScript injection (`javascript:`)
- Suspicious user agents

## Performance Monitoring

### Slow Request Detection

- **Warning**: Requests > 5 seconds
- **Error**: Requests > 30 seconds
- **Metrics**: Duration, memory usage, endpoint

### Performance Thresholds

```typescript
// Configurable thresholds
const PERFORMANCE_THRESHOLDS = {
  slowRequestWarning: 5000,    // 5s
  verySlowRequestError: 30000, // 30s
  memoryUsageWarning: 100 * 1024 * 1024, // 100MB
};
```

## Production Rollout Strategy

### Phase 1: Development Setup
1. ✅ Install and configure error tracking library
2. ✅ Set up development environment variables
3. ✅ Test error reporting in development
4. ✅ Validate error context collection

### Phase 2: Staging Deployment  
1. Configure staging environment variables
2. Deploy to staging with error tracking enabled
3. Generate test errors to validate pipeline
4. Review error grouping and context

### Phase 3: Production Rollout
1. Set up production Sentry/Rollbar project
2. Configure production environment variables with low sample rate (10%)
3. Deploy with error tracking enabled
4. Monitor for 24-48 hours
5. Gradually increase sample rate based on volume

### Phase 4: Monitoring & Optimization
1. Set up alert rules for error thresholds
2. Create dashboards for error trends
3. Implement automated error notifications
4. Regular review of error patterns and fixes

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ERROR_TRACKING_PROVIDER` | No | `custom` | Provider: sentry, rollbar, custom, disabled |
| `SENTRY_DSN` | If using Sentry | - | Sentry project DSN |
| `ROLLBAR_ACCESS_TOKEN` | If using Rollbar | - | Rollbar access token |
| `ERROR_TRACKING_SAMPLE_RATE` | No | `0.1` | Error sampling rate (0.0-1.0) |
| `ERROR_TRACKING_PERFORMANCE` | No | `false` | Enable performance monitoring |
| `ERROR_TRACKING_ENABLE_PROD` | No | `true` | Enable in production |
| `ERROR_TRACKING_ENABLE_DEV` | No | `true` | Enable in development |
| `ERROR_TRACKING_ENABLE_TEST` | No | `false` | Enable in test environment |
| `ERROR_TRACKING_DEBUG` | No | `false` | Enable debug logging |

## Vercel Configuration

### Environment Variables Setup

1. Go to Vercel Dashboard → Project → Settings → Environment Variables

2. Add production variables:
```
ERROR_TRACKING_PROVIDER=sentry (Production)
SENTRY_DSN=https://... (Production) 
ERROR_TRACKING_SAMPLE_RATE=0.1 (Production)
ERROR_TRACKING_PERFORMANCE=false (Production)
```

3. Add development variables:
```
ERROR_TRACKING_PROVIDER=custom (Development)
ERROR_TRACKING_DEBUG=true (Development)
ERROR_TRACKING_SAMPLE_RATE=1.0 (Development)
```

### Build Configuration

Error tracking libraries are automatically included in production builds. No additional Vercel configuration required.

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Error Rate**: Errors per minute/hour
2. **Error Distribution**: By endpoint, user, clinic  
3. **Performance**: Slow requests, memory usage
4. **Security**: Threat detection events
5. **Healthcare Compliance**: Data access patterns

### Recommended Alert Rules

```javascript
// Sentry alert rules
{
  "High Error Rate": "error count > 10 in 5 minutes",
  "Server Errors": "HTTP 5xx > 5 in 10 minutes", 
  "Slow Requests": "request duration > 10s",
  "Security Threats": "security events > 3 in 1 hour",
  "Healthcare Violations": "unauthorized data access"
}
```

## Testing Error Tracking

### Development Testing

```bash
# Test error reporting
curl -X POST http://localhost:3004/api/test-error
```

### Staging Validation

1. Deploy to staging with error tracking enabled
2. Generate test errors using provided test endpoints
3. Verify errors appear in error tracking dashboard
4. Validate error context and metadata
5. Test alert notifications

### Production Monitoring

1. Monitor error dashboard daily for first week
2. Review error patterns and common issues  
3. Adjust sample rates based on volume
4. Fine-tune alert thresholds

## Cost Management

### Sentry Pricing Optimization

- **Sample Rate**: Start with 10% in production
- **Performance Monitoring**: Disable in production initially
- **Data Retention**: Use default 90-day retention
- **Release Tracking**: Enable for deployment correlation

### Expected Monthly Costs

- **Development**: Free (custom tracking)
- **Production (Sentry)**: $0-26/month (based on error volume)
- **Enterprise**: $80/month (includes advanced features)

## Troubleshooting

### Common Issues

**Error tracking not initialized**
```
Solution: Check environment variables and provider configuration
```

**High error volume**
```
Solution: Reduce sample rate or add error filtering
```

**Missing context data**
```
Solution: Verify middleware order and context extraction
```

**Performance impact**
```
Solution: Disable performance monitoring or reduce sample rate
```

### Debug Mode

Enable debug logging:
```env
ERROR_TRACKING_DEBUG=true
```

This will log all error tracking operations to the console.

---

**Implementation Status**: ✅ Complete
**Last Updated**: 2024-12-28  
**Next Review**: 2025-01-28
**Production Ready**: Yes