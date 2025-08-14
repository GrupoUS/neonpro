# Troubleshooting Guide - Subscription Middleware

## Common Issues and Solutions

### 1. Subscription Validation Failures

#### Symptoms
- Users getting "Access Denied" errors
- Subscription status showing as "inactive" for active users
- Features being incorrectly disabled

#### Diagnosis
```bash
# Check user subscription status
pnpm run debug:subscription-status --user-id=<user_id>

# Verify database connection
pnpm run debug:db-connection

# Check cache status
pnpm run debug:cache-status
```

#### Solutions
```typescript
// Clear user subscription cache
await cacheManager.delete(`subscription:${userId}`);

// Force subscription refresh
await subscriptionService.refreshUserSubscription(userId);

// Verify RLS policies
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId);
```

### 2. Performance Issues

#### Symptoms
- Response times >100ms
- High memory usage
- Database query timeouts

#### Diagnosis
```bash
# Run performance analysis
pnpm run test:performance

# Check slow queries
pnpm run debug:slow-queries

# Monitor memory usage
pnpm run debug:memory-usage
```