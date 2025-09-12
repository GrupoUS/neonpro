# API Schema / OpenAPI Generation

## Overview

This document describes the comprehensive OpenAPI schema generation implementation for the NeonPro Healthcare API, providing automatic Swagger UI documentation, schema validation, and API contract enforcement.

## Implementation

### Core Components

#### 1. Zod Schemas (`/src/schemas/openapi-schemas.ts`)
- **Healthcare-specific validation**: CPF, email, phone number patterns
- **LGPD compliance schemas**: Patient data with consent validation
- **Error handling schemas**: Standardized error responses with codes
- **Response schemas**: Comprehensive API response definitions

#### 2. OpenAPI Route Definitions (`/src/schemas/openapi-routes.ts`)
- **Route specifications**: Complete OpenAPI route definitions using `@hono/zod-openapi`
- **Security requirements**: JWT Bearer token authentication
- **LGPD documentation**: Clear consent requirements and error responses
- **Healthcare validation**: ANVISA-compliant field validation

#### 3. OpenAPI Configuration (`/src/schemas/openapi-config.ts`)
- **API metadata**: Comprehensive API information and description
- **Security schemes**: JWT Bearer token configuration
- **Documentation UI**: Custom Swagger UI with healthcare branding
- **Server configurations**: Development, staging, and production endpoints

#### 4. App Integration (`/src/app.ts`)
- **OpenAPI app instance**: Using `@hono/zod-openapi` for validation
- **Route mounting**: OpenAPI routes alongside existing handlers
- **Documentation endpoints**: `/docs`, `/openapi.json`, `/documentation`

### Features

#### LGPD Compliance Documentation
- **Consent requirements**: Documented for all patient data endpoints
- **Error responses**: Specific LGPD consent error codes and messages
- **Data minimization**: Only necessary fields returned in responses
- **Audit trail**: Documented requirements for access tracking

#### Healthcare Validation
- **CPF validation**: Brazilian tax ID format validation
- **Email/phone patterns**: Healthcare-appropriate contact validation
- **ANVISA compliance**: Healthcare data structure requirements
- **Professional validation**: Medical professional data structures

#### Security & Authentication
- **JWT Bearer tokens**: Documented authentication requirements
- **Rate limiting documentation**: Endpoint-specific limits
- **Error handling**: Comprehensive error response documentation
- **Security headers**: CORS and security configuration

### API Documentation

#### Available Endpoints

**System Endpoints:**
- `GET /health` - Basic health check
- `GET /v1/health` - Detailed health with environment info
- `GET /v1/info` - API version and runtime information

**Authentication:**
- `GET /v1/auth/status` - Authentication service status

**Patient Management (LGPD Protected):**
- `GET /v1/patients` - List patients with consent
- `GET /v1/patients/{id}` - Get patient details (requires consent)

**Appointment Management:**
- `GET /v1/appointments` - List appointments
- `GET /v1/appointments/patient/{id}` - Patient appointments (requires consent)

**Documentation:**
- `GET /docs` - Swagger UI interface
- `GET /openapi.json` - OpenAPI 3.1 schema
- `GET /documentation` - Redirects to /docs
- `GET /docs/health` - Documentation health check

#### Schema Features

**Request/Response Validation:**
- Automatic validation using Zod schemas
- Type-safe request/response handling
- Comprehensive error messages for validation failures

**Security Documentation:**
- JWT token requirements clearly documented
- LGPD consent requirements explained
- Rate limiting policies documented

**Healthcare-Specific Features:**
- CPF format validation and masking
- LGPD consent tracking and validation
- ANVISA compliance documentation
- Professional license validation

### Testing

#### Test Coverage
- **OpenAPI integration tests**: Full endpoint validation
- **Schema validation tests**: Request/response schema compliance
- **LGPD compliance tests**: Consent requirement validation
- **Healthcare validation tests**: Field format and compliance
- **Error handling tests**: Proper error response formats

#### Debug Tools
- **Schema debugging**: Tools to inspect OpenAPI structure
- **Route testing**: Validation of all documented endpoints
- **Security testing**: JWT token and consent validation

### Configuration

#### Environment Variables
```env
# API Configuration
NODE_ENV=development|staging|production

# Authentication
JWT_SECRET=your-jwt-secret

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Error Tracking (optional)
ERROR_TRACKING_PROVIDERS=sentry,rollbar
SENTRY_DSN=your-sentry-dsn
```

#### Dependencies
```json
{
  "@hono/zod-openapi": "^0.17.7",
  "zod": "^3.23.8",
  "hono": "^4.x"
}
```

### Documentation Access

#### Development
- **Local Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI Schema**: `http://localhost:3000/api/openapi.json`

#### Production
- **Swagger UI**: `https://api.neonpro.health/docs`
- **OpenAPI Schema**: `https://api.neonpro.health/openapi.json`

### LGPD Compliance Features

#### Patient Data Protection
- **Consent validation**: All patient endpoints require explicit LGPD consent
- **Data minimization**: Only necessary fields returned
- **Audit documentation**: Clear requirements for access tracking
- **Error handling**: Specific consent-related error responses

#### Error Codes
- `LGPD_CONSENT_REQUIRED`: Patient has not provided consent
- `HEALTHCARE_VALIDATION_FAILED`: Data doesn't meet ANVISA requirements
- `AUTHENTICATION_REQUIRED`: Valid JWT token required
- `RATE_LIMIT_EXCEEDED`: Too many requests

### Performance

#### Optimizations
- **Schema caching**: OpenAPI schemas cached for performance
- **Validation efficiency**: Zod schemas optimized for speed
- **Documentation generation**: Efficient Swagger UI rendering
- **Error handling**: Fast validation error responses

#### Monitoring
- **Endpoint usage**: Track API documentation access
- **Validation errors**: Monitor schema validation failures
- **Performance metrics**: Response times for documentation endpoints

### Maintenance

#### Schema Updates
1. Update Zod schemas in `/src/schemas/openapi-schemas.ts`
2. Update route definitions in `/src/schemas/openapi-routes.ts`
3. Run tests to validate changes
4. Build and deploy

#### Documentation Updates
1. Update API description in `/src/schemas/openapi-config.ts`
2. Add new endpoints to route definitions
3. Update security requirements as needed
4. Regenerate documentation

### Troubleshooting

#### Common Issues
- **Missing security schemes**: Ensure `securitySchemes` are properly configured
- **Validation errors**: Check Zod schema definitions match API responses
- **Route conflicts**: Ensure OpenAPI routes don't conflict with existing handlers
- **CORS issues**: Verify CORS configuration for documentation endpoints

#### Debugging
- Use debug tests to inspect OpenAPI schema structure
- Check browser developer tools for Swagger UI issues
- Validate OpenAPI schema using external validators
- Test endpoints individually for validation issues

## Conclusion

The OpenAPI implementation provides comprehensive API documentation with LGPD compliance, healthcare validation, and security features. The system automatically generates interactive documentation while enforcing API contracts through schema validation.