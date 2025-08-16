# ANVISA Integration Testing Guide

## Overview

This guide provides comprehensive testing procedures for ANVISA integration and compliance features in the NeonPro aesthetic clinic management system.

## Test Categories

### 1. Database Schema Testing

#### 1.1 ANVISA Products Table

```sql
-- Test product registration
INSERT INTO anvisa_products (
  clinic_id,
  name,
  registration_number,
  manufacturer,
  category,
  description,
  expiry_date,
  compliance_score
) VALUES (
  'clinic-123',
  'Ácido Hialurônico Test',
  '12345.678.901-2',
  'Test Manufacturer',
  'dermal_filler',
  'Test product for integration',
  '2025-12-31',
  95.5
);

-- Verify Row Level Security
SELECT * FROM anvisa_products WHERE clinic_id = 'clinic-123';
```

#### 1.2 ANVISA Professionals Table

```sql
-- Test professional registration
INSERT INTO anvisa_professionals (
  clinic_id,
  user_id,
  crm_number,
  specialty,
  certification_status,
  authorization_level,
  compliance_score,
  authorized_procedures,
  certification_expiry
) VALUES (
  'clinic-123',
  'user-456',
  'CRM/SP 123456',
  'Dermatologia Estética',
  'active',
  'advanced',
  88.0,
  ARRAY['botox_application', 'dermal_filler', 'laser_treatment'],
  '2025-06-30'
);
```

### 2. API Route Testing

#### 2.1 Products API Testing

```bash
# Test GET products
curl -X GET "http://localhost:3000/api/anvisa/products?clinic_id=clinic-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test POST new product
curl -X POST "http://localhost:3000/api/anvisa/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "clinic_id": "clinic-123",
    "name": "Test Product API",
    "registration_number": "TEST.123.456-7",
    "manufacturer": "API Test Manufacturer",
    "category": "botulinum_toxin",
    "description": "API testing product",
    "expiry_date": "2025-12-31",
    "batch_number": "BATCH123",
    "lot_size": 50
  }'

# Test GET specific product
curl -X GET "http://localhost:3000/api/anvisa/products/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2.2 Professionals API Testing

```bash
# Test GET professionals
curl -X GET "http://localhost:3000/api/anvisa/professionals?clinic_id=clinic-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test authorization verification
curl -X GET "http://localhost:3000/api/anvisa/professionals?clinic_id=clinic-123&action=verify_authorization&professional_id=PROF_ID&procedure_code=botox_application" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test compliance score update
curl -X GET "http://localhost:3000/api/anvisa/professionals?clinic_id=clinic-123&action=update_compliance_score&professional_id=PROF_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Frontend Component Testing

#### 3.1 ANVISA Dashboard Testing

1. **Load Dashboard**: Navigate to `/dashboard/anvisa`
2. **Verify Metrics Display**: Check if compliance score, product count, professional count display correctly
3. **Test Tab Navigation**: Switch between Overview, Products, Professionals, Procedures, Alerts tabs
4. **Check Real-time Updates**: Verify data refreshes when clicking "Atualizar Dados"

#### 3.2 Product Registration Testing

1. **Form Validation**: Try submitting empty form, verify required field validation
2. **Successful Registration**: Fill all fields and submit, verify success message
3. **Product List Display**: Check if new product appears in the grid
4. **Status Badges**: Verify correct status and compliance score colors
5. **Search/Filter**: Test filtering by category, status, manufacturer

### 4. Security Testing

#### 4.1 Authentication Testing

```bash
# Test without authentication
curl -X GET "http://localhost:3000/api/anvisa/products?clinic_id=clinic-123"
# Should return 401 Unauthorized

# Test with invalid token
curl -X GET "http://localhost:3000/api/anvisa/products?clinic_id=clinic-123" \
  -H "Authorization: Bearer INVALID_TOKEN"
# Should return 401 Unauthorized
```

### 5. Test Data Cleanup

```sql
-- Clean up test data
DELETE FROM anvisa_adverse_events WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
DELETE FROM anvisa_procedures WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
DELETE FROM anvisa_product_batches WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
DELETE FROM anvisa_professionals WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
DELETE FROM anvisa_products WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
DELETE FROM anvisa_compliance_alerts WHERE clinic_id LIKE 'test-%' OR clinic_id = 'clinic-123';
```

## Test Execution Checklist

- [ ] Database schema validation
- [ ] API endpoint testing (all CRUD operations)
- [ ] Frontend component functionality
- [ ] Security and authentication
- [ ] Performance benchmarks
- [ ] Error handling scenarios
- [ ] Integration between modules
- [ ] Compliance regulation adherence
- [ ] Data cleanup and reset procedures
