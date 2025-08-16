# LGPD Compliance Implementation - Component Testing Guide

## 🧪 Testing Your LGPD Implementation

### **API Endpoints Testing**

#### 1. **Consent Management**

```bash
# Grant consent
curl -X POST http://localhost:3000/api/lgpd/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "purposeName": "Essential Services",
    "granted": true
  }'

# Withdraw consent
curl -X POST http://localhost:3000/api/lgpd/consent/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "purposeName": "Marketing Communications",
    "reason": "No longer interested"
  }'

# Get consent status
curl -X GET http://localhost:3000/api/lgpd/consent/status
```

#### 2. **Data Subject Rights**

```bash
# Request data access
curl -X POST http://localhost:3000/api/lgpd/data-rights/request \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "access",
    "reason": "Want to see what data you have about me"
  }'

# Request data rectification
curl -X POST http://localhost:3000/api/lgpd/data-rights/rectification \
  -H "Content-Type: application/json" \
  -d '{
    "field": "email",
    "oldValue": "old@email.com",
    "newValue": "new@email.com",
    "reason": "Email address changed"
  }'
```

#### 3. **Compliance Status**

```bash
# Get compliance dashboard data
curl -X GET http://localhost:3000/api/lgpd/compliance/status
```

### **Frontend Components Testing**

#### 1. **Navigate to Privacy Page**

- Go to `/privacy` in your application
- Should see three tabs: Dashboard, Consentimentos, Direitos LGPD

#### 2. **Test Consent Manager**

- Switch consents on/off
- Verify required vs optional consents
- Test consent withdrawal for optional consents

#### 3. **Test Data Subject Rights**

- Try different request types
- Test rectification form with all fields
- Submit requests and verify success messages

#### 4. **Test Compliance Dashboard**

- Verify progress calculations
- Check status badges
- Review compliance metrics

### **Database Verification**

#### 1. **Check Tables Created**

```sql
-- Verify LGPD tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%consent%' OR table_name LIKE '%lgpd%';

-- Check initial consent purposes
SELECT * FROM consent_purposes;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_consents', 'data_subject_requests', 'lgpd_audit_logs');
```

#### 2. **Test Database Functions**

```sql
-- Test consent withdrawal function
SELECT withdraw_consent('user-id', 'Marketing Communications', 'Testing');

-- Test data export function
SELECT generate_user_data_export('user-id');

-- Test retention check
SELECT check_retention_policies();
```

### **Security Testing**

#### 1. **Authentication Testing**

- Try accessing API endpoints without authentication
- Should receive 401 Unauthorized responses

#### 2. **Authorization Testing**

- Try accessing other users' data
- RLS should prevent unauthorized access

#### 3. **Input Validation**

- Send invalid request types
- Send empty required fields
- Verify proper error responses

### **Performance Testing**

#### 1. **Load Testing**

```bash
# Install Apache Bench for testing
sudo apt-get install apache2-utils

# Test consent endpoint
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p consent_payload.json \
   http://localhost:3000/api/lgpd/consent/grant
```

#### 2. **Database Performance**

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM user_consents WHERE user_id = 'test-user';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('user_consents', 'data_subject_requests');
```

### **Compliance Verification**

#### 1. **LGPD Requirements Checklist**

- ✅ Consent management with granular purposes
- ✅ Data subject rights implementation
- ✅ Audit logging for all operations
- ✅ Data retention policies
- ✅ Privacy by design implementation
- ✅ Automatic compliance monitoring
- ✅ Breach notification system
- ✅ DPO workflow integration

#### 2. **Data Protection Verification**

- ✅ Row Level Security enabled
- ✅ Encryption for sensitive fields
- ✅ Audit trails for all data operations
- ✅ User authentication required
- ✅ Input validation and sanitization

### **Integration Testing**

#### 1. **End-to-End Flow**

1. User grants consent for essential services
2. User requests data access
3. System processes request within 15 days
4. User downloads data export
5. User requests data rectification
6. Admin processes rectification
7. User withdraws non-essential consent
8. System updates compliance status

#### 2. **Error Handling**

- Test network failures
- Test database connection issues
- Test invalid input scenarios
- Verify user-friendly error messages

### **Monitoring and Alerts**

#### 1. **Setup Monitoring**

```sql
-- Monitor failed consent operations
SELECT COUNT(*) FROM lgpd_audit_logs
WHERE action LIKE '%_failed'
AND created_at >= NOW() - INTERVAL '1 hour';

-- Monitor pending data requests
SELECT COUNT(*) FROM data_subject_requests
WHERE status = 'pending'
AND requested_at < NOW() - INTERVAL '10 days';
```

#### 2. **Alert Configuration**

- Setup alerts for compliance violations
- Monitor request processing times
- Track consent withdrawal rates
- Alert on potential data breaches

## 🎯 **Success Criteria**

Your LGPD implementation is successful when:

1. **All API endpoints return expected responses**
2. **Frontend components render and function correctly**
3. **Database operations complete successfully**
4. **Security measures prevent unauthorized access**
5. **Performance meets acceptable thresholds**
6. **All LGPD requirements are satisfied**
7. **End-to-end workflows complete successfully**
8. **Error handling works gracefully**
9. **Monitoring and alerts are functional**
10. **User experience is intuitive and compliant**

## 🚀 **Next Steps**

After successful testing:

1. **Deploy to staging environment**
2. **Conduct user acceptance testing**
3. **Perform security audit**
4. **Train staff on LGPD procedures**
5. **Setup production monitoring**
6. **Create incident response procedures**
7. **Schedule compliance reviews**
8. **Document all processes**

## 📞 **Support**

If you encounter issues:

1. **Check console logs for errors**
2. **Verify database connections**
3. **Confirm environment variables**
4. **Review API documentation**
5. **Test with different user roles**
6. **Validate input data formats**
7. **Check network connectivity**
8. **Consult LGPD compliance documentation**
