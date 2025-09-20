# Quickstart Guide: AI Agent Database Integration

## Overview

This guide provides step-by-step validation scenarios for the AI Agent Database Integration feature. Each scenario corresponds to acceptance criteria from the feature specification and ensures the system meets user requirements.

## Prerequisites

- NeonPro application running locally or in staging environment
- HTTPS properly configured with TLS 1.3
- Valid user accounts with different permission levels
- Test data populated in Supabase (clients, appointments, financial records)
- AI agent backend service running
- CopilotKit chat interface accessible

## Test Environment Setup

### 1. HTTPS Verification
```bash
# Verify HTTPS configuration
curl -I https://localhost:3000/api/health
# Should return HTTPS headers including HSTS

# Check TLS version
openssl s_client -connect localhost:3000 -tls1_3
# Should connect successfully with TLS 1.3
```

### 2. Authentication Setup
```bash
# Create test users with different roles
# - doctor@test.com (doctor role, full access)
# - nurse@test.com (nurse role, limited access)  
# - receptionist@test.com (receptionist role, basic access)
```

### 3. Test Data Preparation
```sql
-- Insert test clients
INSERT INTO clients (name, email, domain) VALUES 
('Maria Silva', 'maria@example.com', 'test-clinic'),
('João Santos', 'joao@example.com', 'test-clinic');

-- Insert test appointments
INSERT INTO appointments (client_id, datetime, status, domain) VALUES
(client_id_maria, '2025-09-21 10:00:00', 'scheduled', 'test-clinic'),
(client_id_joao, '2025-09-21 14:30:00', 'confirmed', 'test-clinic');

-- Insert test financial data
INSERT INTO financial_records (amount, type, description, domain) VALUES
(150.00, 'payment', 'Consultation fee', 'test-clinic'),
(300.00, 'payment', 'Procedure fee', 'test-clinic');
```

## Validation Scenarios

### Scenario 1: Query Upcoming Appointments
**User Story**: As a healthcare professional, I want to ask "Quais os próximos agendamentos?" and see upcoming appointments.

**Steps**:
1. Login as doctor@test.com
2. Open AI chat interface
3. Type: "Quais os próximos agendamentos?"
4. Submit query

**Expected Result**:
- Response within 2 seconds
- Display list of upcoming appointments
- Show client names, dates, times, status
- Include interactive "Ver detalhes" buttons
- All data respects user's domain permissions

**Validation Checklist**:
- [ ] Query processed successfully
- [ ] Response time ≤ 2 seconds
- [ ] Appointments displayed in list format
- [ ] Only domain-appropriate data shown
- [ ] Interactive elements present
- [ ] HTTPS headers present in response

### Scenario 2: Query Client Information
**User Story**: As a healthcare professional, I want to ask "Me mostre os clientes cadastrados" and see accessible clients.

**Steps**:
1. Login as nurse@test.com
2. Open AI chat interface
3. Type: "Me mostre os clientes cadastrados"
4. Submit query

**Expected Result**:
- Response within 2 seconds
- Display list of registered clients
- Show names and basic contact information
- Respect role-based access limitations
- Interactive elements for client details

**Validation Checklist**:
- [ ] Query processed successfully
- [ ] Response time ≤ 2 seconds
- [ ] Clients displayed appropriately for nurse role
- [ ] No sensitive information exposed
- [ ] RLS policies enforced
- [ ] Security headers present

### Scenario 3: Query Financial Summary
**User Story**: As a healthcare professional, I want to ask "Como está o faturamento?" and see financial summary.

**Steps**:
1. Login as admin@test.com
2. Open AI chat interface
3. Type: "Como está o faturamento?"
4. Submit query

**Expected Result**:
- Response within 2 seconds
- Display financial summary with charts/tables
- Show revenue, payments, pending amounts
- Appropriate level of detail for user role
- Interactive drill-down options

**Validation Checklist**:
- [ ] Query processed successfully
- [ ] Response time ≤ 2 seconds
- [ ] Financial data displayed in chart/table format
- [ ] Role-based access enforced
- [ ] Data aggregated appropriately
- [ ] Audit logging triggered

### Scenario 4: Specific Client Query
**User Story**: As a healthcare professional, I want to ask about specific client data by providing a client name.

**Steps**:
1. Login as doctor@test.com
2. Open AI chat interface
3. Type: "Me mostre informações da Maria Silva"
4. Submit query

**Expected Result**:
- Response within 2 seconds
- Display specific client information
- Show appointments, medical history, contact details
- Respect privacy and role permissions
- Interactive elements for related actions

**Validation Checklist**:
- [ ] Query processed successfully
- [ ] Response time ≤ 2 seconds
- [ ] Specific client data retrieved
- [ ] Privacy rules enforced
- [ ] Related data linked appropriately
- [ ] Conversation context maintained

### Scenario 5: Access Denied Handling
**User Story**: As a user attempting to access data outside my permissions, I should receive an appropriate access denied message.

**Steps**:
1. Login as receptionist@test.com
2. Open AI chat interface
3. Type: "Me mostre todos os dados financeiros"
4. Submit query

**Expected Result**:
- Response within 2 seconds
- Clear access denied message in Portuguese
- Explanation of permission limitations
- Suggestion for allowed queries
- No sensitive data exposed

**Validation Checklist**:
- [ ] Query processed successfully
- [ ] Response time ≤ 2 seconds
- [ ] Clear access denied message
- [ ] No unauthorized data returned
- [ ] User-friendly error handling
- [ ] Security event logged

### Scenario 6: HTTPS Security Validation
**Technical Validation**: Verify all HTTPS security requirements are met.

**Steps**:
1. Access chat interface via HTTP (should redirect to HTTPS)
2. Check security headers in all responses
3. Verify TLS 1.3 negotiation
4. Test certificate transparency
5. Validate HSTS enforcement

**Expected Result**:
- All HTTP requests redirect to HTTPS
- All responses include mandatory security headers
- TLS 1.3 connection established
- Certificate transparency logging active
- HSTS policy enforced

**Validation Checklist**:
- [ ] HTTP to HTTPS redirect working
- [ ] Strict-Transport-Security header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy set
- [ ] TLS 1.3 connection successful
- [ ] Certificate transparency enabled

## Edge Case Testing

### Non-existent Data
**Test**: Query for appointments of non-existent client
**Input**: "Agendamentos do Pedro Inexistente"
**Expected**: Clear message indicating no data found

### Ambiguous Queries
**Test**: Submit unclear or ambiguous query
**Input**: "Me mostre dados"
**Expected**: Request for clarification with suggested queries

### Database Unavailable
**Test**: Simulate database connection failure
**Expected**: User-friendly error message, no system details exposed

### Large Dataset Request
**Test**: Query that would return large amount of data
**Input**: "Me mostre todos os clientes dos últimos 10 anos"
**Expected**: Paginated results or summary with drill-down options

### Session Expiry
**Test**: Submit query with expired session
**Expected**: Authentication prompt, session renewal flow

## Performance Validation

### Response Time Testing
```bash
# Test query response times
for i in {1..10}; do
  time curl -X POST https://localhost:3000/api/ai/data-agent \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d '{"query":"Próximos agendamentos","sessionId":"test-session"}'
done
# All responses should complete within 2 seconds
```

### HTTPS Handshake Testing
```bash
# Test HTTPS handshake performance
for i in {1..10}; do
  time openssl s_client -connect localhost:3000 -tls1_3 < /dev/null
done
# All handshakes should complete within 300ms
```

### Concurrent User Testing
```bash
# Simulate multiple concurrent users
ab -n 100 -c 10 -H "Authorization: Bearer $JWT_TOKEN" \
  -p query.json -T application/json \
  https://localhost:3000/api/ai/data-agent
# System should handle concurrent requests without degradation
```

## Security Validation

### OWASP Security Testing
- [ ] SQL Injection prevention (via RLS and parameterized queries)
- [ ] XSS prevention (via CSP and output encoding)
- [ ] CSRF protection (via CORS and token validation)
- [ ] Authentication bypass attempts
- [ ] Authorization escalation attempts
- [ ] Session management security

### Data Privacy Testing
- [ ] User can only access their domain's data
- [ ] Role-based access controls enforced
- [ ] Sensitive data properly masked
- [ ] Audit trails generated for data access
- [ ] LGPD compliance maintained

## Success Criteria

**All scenarios must pass with the following criteria**:
- ✅ All functional requirements demonstrated
- ✅ Response times within performance thresholds
- ✅ HTTPS security fully implemented
- ✅ Security headers present in all responses
- ✅ Role-based access control working
- ✅ Error handling user-friendly and secure
- ✅ Audit logging capturing all data access
- ✅ No exposure of sensitive system information

## Troubleshooting

### Common Issues
1. **HTTPS not working**: Check certificate configuration and TLS version
2. **Slow responses**: Verify database indexes and connection pooling
3. **Access denied errors**: Check RLS policies and user permissions
4. **Security header missing**: Verify middleware configuration
5. **Agent not responding**: Check ottomator-agents service status

### Debug Commands
```bash
# Check HTTPS configuration
curl -vI https://localhost:3000/api/health

# Test database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check agent service
curl https://localhost:8000/health

# Verify security headers
curl -I https://localhost:3000/api/ai/data-agent
```