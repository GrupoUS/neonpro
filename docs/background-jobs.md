# Background Jobs - Stock Alert System

## Overview

The NeonPro stock alert system includes automated background jobs that evaluate alert conditions and generate notifications without manual intervention. This ensures timely alerts for critical stock situations.

## Architecture

### Cron Jobs

The system uses Vercel's cron job functionality to schedule automated tasks:

- **Alert Evaluation Job**: Runs every 15 minutes to check alert conditions
- **Path**: `/api/cron/evaluate-alerts`
- **Schedule**: `*/15 * * * *` (every 15 minutes)
- **Timeout**: 60 seconds maximum

### Job Processing Flow

1. **Authentication**: Validates cron request using `CRON_SECRET`
2. **Clinic Discovery**: Finds all clinics with active alert configurations
3. **Batch Processing**: Processes clinics in batches to manage memory usage
4. **Alert Evaluation**: For each clinic:
   - Fetches active alert configurations
   - Evaluates product conditions against thresholds
   - Generates alerts for triggered conditions
   - Avoids duplicate alerts
5. **Statistics Recording**: Logs processing statistics for monitoring
6. **Error Handling**: Implements retry logic and graceful error handling

## Alert Types Evaluated

### 1. Low Stock Alerts
- **Condition**: `current_stock <= threshold_value`
- **Metric**: Quantity in units
- **Example**: Product has 5 units, threshold is 10

### 2. Expiring Product Alerts
- **Condition**: `days_until_expiration <= threshold_value AND > 0`
- **Metric**: Days until expiration
- **Example**: Product expires in 3 days, threshold is 7 days

### 3. Expired Product Alerts
- **Condition**: `days_until_expiration <= 0`
- **Metric**: Days past expiration
- **Example**: Product expired 2 days ago

### 4. Overstock Alerts
- **Condition**: `current_stock >= max_stock`
- **Metric**: Quantity in units
- **Example**: Product has 150 units, max stock is 100

## Configuration

### Environment Variables

```bash
# Required for production
CRON_SECRET=your-secure-cron-secret

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Vercel Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/evaluate-alerts",
      "schedule": "*/15 * * * *"
    }
  ],
  "functions": {
    "app/api/cron/evaluate-alerts/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## Performance Characteristics

### Scalability
- **Batch Size**: 100 clinics per batch
- **Memory Management**: Processes in chunks to avoid memory exhaustion
- **Timeout Handling**: Gracefully stops processing before Vercel timeout

### Retry Logic
- **Attempts**: Up to 3 retries per clinic
- **Backoff**: Exponential backoff (2^attempt seconds)
- **Error Isolation**: Failures in one clinic don't affect others

### Monitoring
- **Execution Time**: Tracked and logged
- **Statistics**: Stored in `alert_processing_stats` table
- **Error Logging**: Detailed error context for debugging

## Database Schema

### Alert Processing Stats
```sql
CREATE TABLE alert_processing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  clinics_processed INTEGER NOT NULL,
  alerts_generated INTEGER NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  error_count INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Alert Events (Audit Trail)
```sql
CREATE TABLE stock_alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  user_id UUID,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Manual Execution

### For Development/Testing
```bash
# Using curl
curl -X POST http://localhost:3000/api/cron/evaluate-alerts \
  -H "Authorization: Bearer your-cron-secret"

# Response
{
  "success": true,
  "message": "Alert evaluation completed",
  "data": {
    "clinicsProcessed": 15,
    "alertsGenerated": 8,
    "errors": [],
    "executionTime": 2500,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### For Production
Production execution is automatic via Vercel's cron system. Manual execution requires the correct `CRON_SECRET`.

## Monitoring and Observability

### Health Check
```bash
GET /api/cron/evaluate-alerts
```

Response:
```json
{
  "status": "healthy",
  "service": "alert-evaluation-cron",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Key Metrics to Monitor

1. **Execution Frequency**: Should run every 15 minutes
2. **Processing Time**: Should complete within 60 seconds
3. **Success Rate**: High percentage of successful executions
4. **Alert Generation Rate**: Reasonable number of alerts generated
5. **Error Rate**: Low error percentage

### Common Issues and Solutions

#### High Execution Time
- **Cause**: Too many clinics or complex evaluations
- **Solution**: Reduce batch size or optimize queries

#### Memory Issues
- **Cause**: Processing too much data at once
- **Solution**: Implement more aggressive batching

#### Timeout Errors
- **Cause**: Execution exceeds 60-second limit
- **Solution**: Optimize database queries or reduce scope

#### Authentication Failures
- **Cause**: Incorrect or missing `CRON_SECRET`
- **Solution**: Verify environment variable configuration

## Alert Deduplication

The system prevents duplicate alerts by:

1. **Checking Existing Alerts**: Before creating a new alert, checks for unacknowledged alerts
2. **Configuration Matching**: Ensures only one active alert per config + product combination
3. **Status Tracking**: Only creates new alerts when previous ones are acknowledged

## Integration with Notification System

When alerts are generated, the system can integrate with:

1. **Email Notifications**: Via configured SMTP or service
2. **In-App Notifications**: Stored in database for UI display
3. **WhatsApp/SMS**: Via external service APIs
4. **Webhook Notifications**: For external system integration

## Best Practices

### Configuration
- Set reasonable thresholds to avoid alert fatigue
- Use appropriate severity levels for different alert types
- Configure notification channels based on urgency

### Monitoring
- Regularly review processing statistics
- Monitor alert acknowledgment rates
- Track system performance metrics

### Maintenance
- Periodically clean up old alert events
- Archive processed statistics
- Review and optimize alert configurations

## Troubleshooting

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG_ALERTS=true
```

### Log Analysis
Check Vercel function logs for:
- Processing start/completion times
- Error messages and stack traces
- Performance metrics
- Database query performance

### Database Queries
Monitor slow queries in Supabase dashboard and optimize as needed.

## Future Enhancements

1. **Intelligent Scheduling**: Adjust frequency based on clinic activity
2. **Predictive Alerts**: ML-based prediction of stock needs
3. **Advanced Batching**: Priority-based processing
4. **Circuit Breaker**: Automatic failure recovery
5. **Multi-Region**: Distributed processing for global scale