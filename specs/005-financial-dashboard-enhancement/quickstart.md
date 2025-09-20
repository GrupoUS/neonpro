# Quickstart Guide: Financial Dashboard Enhancement

## Overview

This guide provides step-by-step validation scenarios for the Financial Dashboard Enhancement feature. Each scenario corresponds to acceptance criteria from the feature specification and ensures the system meets user requirements with full Constitution v1.2.0 compliance.

## Prerequisites

- NeonPro application running locally or in staging environment
- HTTPS properly configured with TLS 1.3
- Valid user accounts with different financial permission levels
- Test financial data populated in Supabase
- Shadcn MCP components available
- Mobile device or browser dev tools for responsive testing

## Test Environment Setup

### 1. HTTPS Verification
```bash
# Verify HTTPS configuration
curl -I https://localhost:3000/api/health
# Should return HTTPS headers including HSTS

# Check TLS version
openssl s_client -connect localhost:3000 -tls1_3
# Should connect successfully with TLS 1.3

# Verify security headers
curl -I https://localhost:3000/api/financial/metrics
# Should include: Strict-Transport-Security, X-Content-Type-Options, etc.
```

### 2. Authentication Setup
```bash
# Create test users with financial permissions
# - admin@clinic.com (admin role, full financial access)
# - manager@clinic.com (manager role, read/export access)
# - receptionist@clinic.com (receptionist role, basic view only)
# - doctor@clinic.com (doctor role, patient revenue only)
```

### 3. Test Data Preparation
```sql
-- Insert test financial transactions
INSERT INTO financial_transactions (amount, type, date, patient_id) VALUES 
  (500.00, 'treatment', '2025-09-20', 'patient_001'),
  (1200.00, 'consultation', '2025-09-19', 'patient_002'),
  (800.00, 'procedure', '2025-09-18', 'patient_003');

-- Insert test KPI data
INSERT INTO clinic_metrics (metric_name, value, date) VALUES
  ('room_utilization', 82.5, '2025-09-20'),
  ('conversion_rate', 15.3, '2025-09-20'),
  ('average_ticket', 650.00, '2025-09-20');
```

## Validation Scenarios

### Scenario 1: Dashboard Loading Performance
**Acceptance Criteria**: Dashboard loads within 2 seconds with all financial metrics

**Test Steps**:
1. Navigate to `/financeiro` page
2. Start performance timer
3. Wait for all charts to render
4. Verify load time ≤ 2 seconds

**Expected Results**:
- Page loads within 2 seconds
- All financial metrics display correctly
- Charts render with proper data
- No console errors

**Validation Commands**:
```bash
# Lighthouse performance test
lighthouse https://localhost:3000/financeiro --only-categories=performance
# Should score ≥ 90

# API response time test
curl -w "@curl-format.txt" -o /dev/null -s https://localhost:3000/api/financial/metrics
# Should be ≤ 500ms
```### Scenario 2: Role-Based Access Control
**Acceptance Criteria**: Different user roles see appropriate financial data

**Test Steps**:
1. Login as admin@clinic.com
2. Verify access to all financial metrics
3. Login as manager@clinic.com  
4. Verify read/export access only
5. Login as receptionist@clinic.com
6. Verify basic view only

**Expected Results**:
- Admin sees all financial data and controls
- Manager can view and export reports
- Receptionist sees limited dashboard view
- Unauthorized access attempts are blocked

### Scenario 3: Interactive Chart Components
**Acceptance Criteria**: Charts respond to user interactions within 500ms

**Test Steps**:
1. Navigate to financial dashboard
2. Click on revenue trend chart data points
3. Hover over profit breakdown pie chart
4. Use date range picker to filter data
5. Verify response times ≤ 500ms

**Expected Results**:
- Chart interactions respond within 500ms
- Tooltips display accurate data
- Date filtering updates all charts
- Smooth animations and transitions

### Scenario 4: Mobile Responsiveness
**Acceptance Criteria**: Dashboard works on mobile devices with touch optimization

**Test Steps**:
1. Open dashboard on mobile device (or use dev tools)
2. Test touch interactions on charts
3. Verify horizontal scrolling for tables
4. Test export functionality on mobile

**Expected Results**:
- Charts scale properly to mobile viewport
- Touch interactions work smoothly
- Tables scroll horizontally without breaking layout
- Export buttons are touch-friendly

### Scenario 5: HTTPS Security Validation
**Acceptance Criteria**: All financial data transmitted over HTTPS with proper security headers

**Test Steps**:
1. Attempt HTTP access to financial endpoints
2. Verify automatic HTTPS redirect
3. Check security headers in responses
4. Test certificate validity

**Expected Results**:
- HTTP requests redirect to HTTPS
- HSTS header present with proper values
- Security headers prevent XSS/clickjacking
- Valid TLS 1.3 certificate

**Security Validation Commands**:
```bash
# Test HTTP redirect
curl -I http://localhost:3000/api/financial/metrics
# Should return 301/302 redirect to HTTPS

# Verify security headers
curl -I https://localhost:3000/api/financial/metrics | grep -E "(Strict-Transport|Content-Type-Options|Frame-Options)"
# Should show all required security headers

# Test certificate
openssl s_client -connect localhost:3000 -servername localhost < /dev/null 2>/dev/null | openssl x509 -text
# Should show valid certificate with proper CN
```### Scenario 6: Real-time Data Updates
**Acceptance Criteria**: Financial data updates in real-time within 1 second

**Test Steps**:
1. Open dashboard in two browser windows
2. Add new financial transaction in window 1
3. Verify update appears in window 2 within 1 second
4. Test with multiple concurrent users

**Expected Results**:
- Real-time updates appear within 1 second
- No data inconsistencies between clients
- WebSocket connections handle concurrent users
- Graceful fallback if real-time fails

### Scenario 7: Export Functionality
**Acceptance Criteria**: Financial reports export in multiple formats with LGPD compliance

**Test Steps**:
1. Select report period and type
2. Export as PDF, Excel, and CSV
3. Verify file downloads successfully
4. Check exported data accuracy
5. Verify LGPD compliance markers

**Expected Results**:
- All export formats download successfully
- Data matches dashboard display
- Files include LGPD compliance watermarks
- Export process completes within 10 seconds

### Scenario 8: LGPD Compliance Validation
**Acceptance Criteria**: All financial data handling respects LGPD requirements

**Test Steps**:
1. Verify patient data anonymization options
2. Test data retention policy enforcement
3. Check audit trail for financial access
4. Verify consent management integration

**Expected Results**:
- Patient identifiable data can be anonymized
- Old financial records are properly archived
- All data access is logged with user attribution
- Consent withdrawal affects financial data display

## Performance Benchmarks

### Load Testing
```bash
# Artillery load test
artillery quick --count 50 --num 10 https://localhost:3000/api/financial/metrics
# Should handle 50 concurrent users with <2s response time

# Database query performance
EXPLAIN ANALYZE SELECT * FROM financial_metrics WHERE date >= NOW() - INTERVAL '30 days';
# Should execute in <100ms
```

### Browser Performance
```bash
# Core Web Vitals validation
lighthouse https://localhost:3000/financeiro --only-categories=performance
# LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1

# Bundle size analysis
npm run build && npm run analyze
# Financial dashboard bundle should be <100KB impact
```

## Troubleshooting Guide

### Common Issues

**Dashboard not loading**:
- Check HTTPS configuration
- Verify authentication tokens
- Check browser console for errors

**Charts not rendering**:
- Verify Shadcn MCP components are installed
- Check API endpoints are returning data
- Validate chart data format

**Performance issues**:
- Check database query performance
- Verify CDN configuration
- Test network latency

**HTTPS certificate errors**:
- Verify certificate validity
- Check TLS configuration
- Validate domain name matching

### Debug Commands
```bash
# Check API health
curl https://localhost:3000/api/health

# Verify database connection
psql -h localhost -U postgres -d neonpro -c "SELECT COUNT(*) FROM financial_transactions;"

# Test authentication
curl -H "Authorization: Bearer $JWT_TOKEN" https://localhost:3000/api/financial/metrics
```

## Success Criteria Checklist

- [ ] Dashboard loads within 2 seconds
- [ ] All chart interactions respond within 500ms  
- [ ] Mobile experience is fully functional
- [ ] HTTPS properly configured with TLS 1.3
- [ ] Role-based access control enforced
- [ ] Real-time updates work within 1 second
- [ ] Export functionality works for all formats
- [ ] LGPD compliance validated
- [ ] Performance benchmarks met
- [ ] Security headers properly configured