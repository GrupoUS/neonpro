# Sentry Integration Setup Guide - NeonPro

Complete integration guide for Sentry error monitoring and performance tracking in NeonPro.

## 🎯 Overview

Sentry has been integrated into NeonPro to provide:
- **Error Monitoring**: Automatic error capture and reporting
- **Performance Monitoring**: API response times and user interactions
- **Session Replay**: User session recordings for debugging
- **Real-time Alerts**: Immediate notifications for critical issues
- **Source Maps**: Detailed error stack traces in production

## 📋 Prerequisites

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new Next.js project in Sentry
3. Get your DSN and access tokens

## 🔧 Configuration

### 1. Environment Variables

Update your `.env.local` file with Sentry configuration:

```env
# Sentry Monitoring Configuration
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project-id
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_ACCESS_TOKEN=sntryu_your_sentry_access_token

# App versioning for releases
NEXT_PUBLIC_APP_VERSION=1.0.0
APP_VERSION=1.0.0
```

### 2. Files Created

The following files have been created/updated:

#### Configuration Files
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration  
- `sentry.edge.config.ts` - Edge runtime configuration
- `instrumentation.ts` - Next.js 15 instrumentation hook

#### Utilities
- `lib/monitoring.ts` - Centralized monitoring utilities
- `app/api/example/sentry-integration/route.ts` - Example API integration

#### Updated Files
- `next.config.mjs` - Added Sentry webpack plugin
- `package.json` - Added Sentry scripts and dependency
- `components/ui/error-boundary.tsx` - Added Sentry error reporting
- `components/dashboard/appointments/enhanced-appointment-form.tsx` - Replaced TODO with Sentry integration

## 🚀 Usage Examples

### Error Boundary Integration

```typescript
import { withErrorBoundary } from '@/components/ui/error-boundary'

const MyComponent = () => {
  // Your component code
}

// Automatically reports errors to Sentry
export default withErrorBoundary(MyComponent, {
  onError: (error, errorInfo) => {
    console.error('Component error:', error, errorInfo)
    // Error is automatically reported to Sentry
  },
})
```

### Manual Error Reporting

```typescript
import { reportError } from '@/lib/monitoring'

try {
  // Some risky operation
  await riskyOperation()
} catch (error) {
  reportError(error, {
    user: {
      id: session.user.id,
      email: session.user.email,
      clinicId: session.user.clinicId,
    },
    tags: {
      component: 'appointment-booking',
      feature: 'conflict-prevention',
    },
    extra: {
      appointmentData: appointment,
      timestamp: new Date().toISOString(),
    },
    level: 'error',
  })
}
```

### API Route Error Handling

```typescript
import { withErrorMonitoring } from '@/lib/monitoring'

export const POST = withErrorMonitoring(async (request: NextRequest) => {
  // Your API logic here
  // Errors are automatically captured and reported
  return NextResponse.json({ success: true })
})
```

### Performance Monitoring

```typescript
import { withPerformanceMonitoring, trackBusinessMetric } from '@/lib/monitoring'

// Monitor function performance
const result = await withPerformanceMonitoring(
  'appointment-booking',
  async () => {
    return await bookAppointment(appointmentData)
  }
)

// Track business metrics
trackBusinessMetric('appointments_created', 1, {
  clinicId: session.user.clinicId,
  type: 'consultation',
})
```

### User Action Tracking

```typescript
import { trackUserAction } from '@/lib/monitoring'

const handleAppointmentBooking = async () => {
  trackUserAction('appointment_booked', {
    clinicId: session.user.clinicId,
    appointmentType: 'consultation',
    source: 'dashboard',
  })
  
  // Booking logic...
}
```

## 🔄 Deployment & Source Maps

### Build with Source Maps

```bash
# Development build
pnpm dev

# Production build with source maps
pnpm build

# Deploy with Sentry integration
pnpm run deploy
```

### Manual Source Map Upload

```bash
# Create a release
pnpm run sentry:create-release

# Upload source maps
pnpm run sentry:upload-sourcemaps

# Finalize the release
pnpm run sentry:finalize-release
```

## 📊 Monitoring Features

### Error Monitoring
- Automatic error capture in React components
- API route error handling
- Unhandled promise rejections
- Client-side JavaScript errors

### Performance Monitoring
- API response times
- Database query performance
- User interaction tracking
- Core Web Vitals

### Session Replay
- User session recordings
- Error reproduction
- Privacy-first masking

### Alerts
- Real-time error notifications
- Performance degradation alerts
- Custom threshold alerts

## 🏥 NeonPro-Specific Features

### Healthcare Data Compliance
```typescript
// Sensitive data is automatically filtered
Sentry.init({
  beforeSend(event) {
    // Remove PII from error reports
    if (event.extra?.patientData) {
      delete event.extra.patientData
    }
    return event
  }
})
```

### Clinic-Specific Tagging
```typescript
// All errors are tagged with clinic context
reportError(error, {
  user: {
    id: user.id,
    clinicId: user.clinicId, // Automatic clinic isolation
  },
  tags: {
    feature: 'appointment-booking',
    clinic_tier: 'premium',
  }
})
```

### Business Metrics
```typescript
// Track important business events
trackBusinessMetric('revenue_generated', amount, {
  clinicId: session.user.clinicId,
  paymentMethod: 'credit_card',
})

trackBusinessMetric('patient_satisfaction', rating, {
  clinicId: session.user.clinicId,
  appointmentType: 'consultation',
})
```

## 🔍 Debugging

### Development Mode
- Full error details visible
- Console logging enabled
- Session replay active
- High sampling rate

### Production Mode
- Filtered error reporting
- Reduced sampling rates
- PII filtering active
- Performance optimized

### Testing Sentry Integration

1. Visit `/api/example/sentry-integration`
2. Send POST request with `{ "simulateError": true }`
3. Check Sentry dashboard for error reports

## 📈 Best Practices

### Error Reporting
1. Always include user context when available
2. Add relevant tags for filtering
3. Use appropriate error levels
4. Include actionable context data

### Performance Monitoring
1. Monitor critical user journeys
2. Track business-relevant metrics
3. Set up alerts for degradation
4. Use transactions for multi-step operations

### Privacy & Compliance
1. Filter out PII in beforeSend
2. Use appropriate data retention policies
3. Tag data by sensitivity level
4. Regular audit of captured data

## 🚨 Troubleshooting

### Common Issues

1. **Source maps not uploading**
   - Check `SENTRY_ACCESS_TOKEN` is valid
   - Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct

2. **Errors not appearing in Sentry**
   - Verify DSN configuration
   - Check network connectivity
   - Ensure error occurs in monitored code

3. **High error volume**
   - Adjust sampling rates
   - Add error filtering
   - Review beforeSend configuration

### Support
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [NeonPro Internal Support](mailto:dev@neonpro.com)

---

**🎯 Integration Status**: ✅ Complete  
**📅 Last Updated**: January 2025  
**👨‍💻 Maintained By**: NeonPro Development Team