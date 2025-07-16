# NeonPro Backend Development Rules

## API Design Standards

### Route Structure
```
/api/auth/*          - Authentication endpoints
/api/dashboard/*     - Dashboard data endpoints
/api/analytics/*     - Analytics and reporting
/api/users/*         - User management
/api/settings/*      - Application settings
/api/integrations/*  - Third-party integrations
```

### Response Format
```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string,
  meta?: {
    pagination?: PaginationInfo,
    timestamp: string
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}
```

## Database Schema Guidelines

### Table Naming
- Use snake_case for table and column names
- Prefix tables with project context: `neonpro_users`, `neonpro_dashboards`
- Use descriptive names that reflect business logic

### Required Fields
```sql
-- Every table should have:
id SERIAL PRIMARY KEY,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
deleted_at TIMESTAMP NULL  -- For soft deletes
```

### Indexing Strategy
- Index all foreign keys
- Index frequently queried columns
- Composite indexes for multi-column queries
- Partial indexes for conditional queries

## Security Implementation

### Authentication
- JWT tokens with proper expiration
- Refresh token rotation
- Rate limiting on auth endpoints
- Password hashing with bcrypt (min 12 rounds)

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API key management for integrations
- Audit logging for sensitive operations

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

## Performance Optimization

### Caching Strategy
- Redis for session storage
- Database query result caching
- API response caching with appropriate TTL
- CDN for static assets

### Database Optimization
- Connection pooling
- Query optimization and monitoring
- Proper use of transactions
- Background job processing for heavy operations

## Error Handling

### Logging Standards
```typescript
// Use structured logging
logger.info('User dashboard accessed', {
  userId: user.id,
  dashboardId: dashboard.id,
  timestamp: new Date().toISOString(),
  userAgent: req.headers['user-agent']
});
```

### Error Categories
- `VALIDATION_ERROR` - Input validation failures
- `AUTHENTICATION_ERROR` - Auth-related errors
- `AUTHORIZATION_ERROR` - Permission denied
- `BUSINESS_LOGIC_ERROR` - Domain-specific errors
- `SYSTEM_ERROR` - Infrastructure/system errors

## Testing Requirements

### Unit Tests
- Test all business logic functions
- Mock external dependencies
- Test error conditions and edge cases
- Minimum 80% code coverage

### Integration Tests
- Test API endpoints end-to-end
- Test database operations
- Test authentication flows
- Test third-party integrations

### Performance Tests
- Load testing for critical endpoints
- Database performance testing
- Memory leak detection
- Response time monitoring