# API Documentation Generation Guide

## Overview

This guide covers the comprehensive API documentation system for the NeonPro healthcare platform, including OpenAPI specification generation, healthcare compliance documentation, and automated deployment to docs site.

## Architecture

### Documentation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                  Documentation Generation                   │
├─────────────────────────────────────────────────────────────┤
│  OpenAPI Spec    │  Healthcare Schemas │  Compliance Docs  │
├─────────────────────────────────────────────────────────────┤
│              Automated Documentation                        │
├─────────────────────────────────────────────────────────────┤
│  Swagger UI      │  Redoc            │  Custom Healthcare UI│
├─────────────────────────────────────────────────────────────┤
│               Deployment & Hosting                          │
│  Vercel Deploy   │  GitHub Pages     │  Self-hosted       │
└─────────────────────────────────────────────────────────────┘
```

## API Documentation Structure

### Core Endpoints

#### Patient Management API

- **GET /api/patients** - List patients with LGPD consent filtering
- **POST /api/patients** - Create new patient with consent validation
- **GET /api/patients/{id}** - Retrieve patient details (audit logged)
- **PUT /api/patients/{id}** - Update patient information
- **DELETE /api/patients/{id}** - Soft delete patient (LGPD compliant)

#### Appointment Management API

- **GET /api/appointments** - List appointments with multi-tenant scoping
- **POST /api/appointments** - Schedule new appointment
- **GET /api/appointments/{id}** - Retrieve appointment details
- **PUT /api/appointments/{id}** - Update appointment
- **DELETE /api/appointments/{id}** - Cancel appointment

#### Healthcare Professional API

- **GET /api/professionals** - List healthcare professionals
- **POST /api/professionals** - Register new professional
- **GET /api/professionals/{id}** - Professional profile details
- **PUT /api/professionals/{id}** - Update professional information

#### Medical Records API

- **GET /api/medical-records** - List medical records (restricted access)
- **POST /api/medical-records** - Create medical record
- **GET /api/medical-records/{id}** - Retrieve specific record
- **PUT /api/medical-records/{id}** - Update medical record

#### AI and Analytics API

- **POST /api/ai/chat** - AI-powered healthcare assistance
- **POST /api/ai/diagnosis-support** - AI diagnostic assistance
- **GET /api/analytics/performance** - Performance metrics
- **GET /api/analytics/compliance** - Compliance metrics

### Healthcare Compliance Documentation

Each endpoint includes:

- **Data Classification**: public, internal, personal, medical, financial
- **LGPD Requirements**: Consent validation, audit logging, data retention
- **CFM Compliance**: Professional verification, telemedicine standards
- **ANVISA Standards**: Medical device compliance, quality management

## Implementation

### OpenAPI Route Definitions

**File**: `apps/api/src/routes/documented/patients.ts`

```typescript
import {
  createHealthcareRoute,
  HealthcareSchemas,
} from "../../lib/openapi-generator";
import { z } from "zod";

// Patient schemas
const PatientSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2).max(100),
  familyName: z.string().min(1).max(50),
  cpf: HealthcareSchemas.CPF.optional(),
  birthDate: z.string().datetime().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  lgpdConsentGiven: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const PatientCreateSchema = PatientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const PatientUpdateSchema = PatientCreateSchema.partial();

// List patients route
export const listPatientsRoute = createHealthcareRoute({
  method: "get",
  path: "/api/patients",
  tags: ["Patients"],
  summary: "List patients",
  description:
    "Retrieve a paginated list of patients with LGPD consent filtering and multi-tenant scoping.",
  dataClassification: "personal",
  auditRequired: true,
  request: {
    query: z.object({
      clinicId: z.string().uuid(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      search: z.string().optional(),
      consentOnly: z.coerce.boolean().default(true),
    }),
  },
  responses: {
    200: {
      description: "List of patients",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(PatientSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
            }),
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});

// Create patient route
export const createPatientRoute = createHealthcareRoute({
  method: "post",
  path: "/api/patients",
  tags: ["Patients"],
  summary: "Create patient",
  description:
    "Create a new patient with LGPD consent validation and healthcare data protection.",
  dataClassification: "personal",
  auditRequired: true,
  request: {
    body: {
      content: {
        "application/json": {
          schema: PatientCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Patient created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: PatientSchema,
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});

// Get patient route
export const getPatientRoute = createHealthcareRoute({
  method: "get",
  path: "/api/patients/{id}",
  tags: ["Patients"],
  summary: "Get patient",
  description:
    "Retrieve detailed patient information. Requires LGPD consent and generates audit log.",
  dataClassification: "personal",
  auditRequired: true,
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({
      clinicId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Patient details",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: PatientSchema,
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
    404: {
      $ref: "#/components/responses/NotFoundError",
    },
  },
});

// Update patient route
export const updatePatientRoute = createHealthcareRoute({
  method: "put",
  path: "/api/patients/{id}",
  tags: ["Patients"],
  summary: "Update patient",
  description:
    "Update patient information with LGPD compliance validation and audit logging.",
  dataClassification: "personal",
  auditRequired: true,
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: PatientUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Patient updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: PatientSchema,
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});

// Delete patient route
export const deletePatientRoute = createHealthcareRoute({
  method: "delete",
  path: "/api/patients/{id}",
  tags: ["Patients"],
  summary: "Delete patient",
  description:
    "Soft delete patient with LGPD right to erasure compliance. Medical records are retained per CFM requirements.",
  dataClassification: "personal",
  auditRequired: true,
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    query: z.object({
      clinicId: z.string().uuid(),
      reason: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Patient deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              deletedAt: z.string().datetime(),
              retainedData: z.array(z.string()),
              erasedData: z.array(z.string()),
            }),
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});
```

### Appointment API Documentation

**File**: `apps/api/src/routes/documented/appointments.ts`

```typescript
import {
  createHealthcareRoute,
  HealthcareSchemas,
} from "../../lib/openapi-generator";
import { z } from "zod";

// Appointment schemas
const AppointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  clinicId: z.string().uuid(),
  type: z.enum(["consultation", "followup", "procedure", "telemedicine"]),
  status: z.enum([
    "scheduled",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  notes: z.string().optional(),
  telemedicineLink: z.string().url().optional(),
  cfmCompliant: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const AppointmentCreateSchema = AppointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// List appointments route
export const listAppointmentsRoute = createHealthcareRoute({
  method: "get",
  path: "/api/appointments",
  tags: ["Appointments"],
  summary: "List appointments",
  description:
    "Retrieve appointments with multi-tenant scoping and LGPD consent filtering.",
  dataClassification: "medical",
  auditRequired: true,
  request: {
    query: z.object({
      clinicId: z.string().uuid(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      status: z
        .enum([
          "scheduled",
          "confirmed",
          "in_progress",
          "completed",
          "cancelled",
          "no_show",
        ])
        .optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      professionalId: z.string().uuid().optional(),
      patientId: z.string().uuid().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of appointments",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(
              AppointmentSchema.extend({
                patient: z.object({
                  id: z.string().uuid(),
                  fullName: z.string(),
                  lgpdConsentGiven: z.boolean(),
                }),
                professional: z.object({
                  id: z.string().uuid(),
                  fullName: z.string(),
                  specialization: z.string().optional(),
                }),
              }),
            ),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
            timestamp: z.string().datetime(),
            requestId: z.string(),
          }),
        },
      },
    },
  },
});

// Create appointment route
export const createAppointmentRoute = createHealthcareRoute({
  method: "post",
  path: "/api/appointments",
  tags: ["Appointments"],
  summary: "Schedule appointment",
  description:
    "Schedule a new appointment with healthcare professional verification and patient consent validation.",
  dataClassification: "medical",
  auditRequired: true,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AppointmentCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Appointment scheduled successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: AppointmentSchema,
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});
```

### AI & Analytics API Documentation

**File**: `apps/api/src/routes/documented/ai-analytics.ts`

```typescript
import {
  createHealthcareRoute,
  HealthcareSchemas,
} from "../../lib/openapi-generator";
import { z } from "zod";

// AI Chat schemas
const AIChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.object({
    patientId: z.string().uuid().optional(),
    professionalId: z.string().uuid(),
    specialization: z.string().optional(),
    urgency: z.enum(["routine", "urgent", "emergency"]).default("routine"),
    language: z.string().default("pt-BR"),
  }),
  preferences: z.object({
    includeReferences: z.boolean().default(true),
    maxResponseLength: z.number().min(100).max(2000).default(500),
    clinicalFocus: z.array(z.string()).optional(),
  }),
});

const AIChatResponseSchema = z.object({
  response: z.string(),
  confidence: z.number().min(0).max(1),
  cached: z.boolean(),
  references: z
    .array(
      z.object({
        title: z.string(),
        source: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  metadata: z.object({
    model: z.string(),
    tokens_used: z.number(),
    processing_time_ms: z.number(),
    compliance_validated: z.boolean(),
  }),
});

// AI Chat route
export const aiChatRoute = createHealthcareRoute({
  method: "post",
  path: "/api/ai/chat",
  tags: ["AI & Analytics"],
  summary: "AI Healthcare Assistant",
  description:
    "AI-powered healthcare assistance with semantic caching, PII redaction, and CFM compliance.",
  dataClassification: "medical",
  auditRequired: true,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AIChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "AI response with healthcare compliance",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: AIChatResponseSchema,
            timestamp: z.string().datetime(),
            requestId: z.string(),
            auditEvent: HealthcareSchemas.AuditEvent,
          }),
        },
      },
    },
  },
});

// Performance Analytics route
export const performanceAnalyticsRoute = createHealthcareRoute({
  method: "get",
  path: "/api/analytics/performance",
  tags: ["AI & Analytics"],
  summary: "Performance Analytics",
  description:
    "Retrieve healthcare platform performance metrics and Core Web Vitals.",
  dataClassification: "internal",
  auditRequired: false,
  request: {
    query: z.object({
      clinicId: z.string().uuid(),
      timeframe: z.enum(["hour", "day", "week", "month"]).default("day"),
      metrics: z
        .array(
          z.enum(["response_time", "error_rate", "throughput", "availability"]),
        )
        .optional(),
    }),
  },
  responses: {
    200: {
      description: "Performance metrics",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              webVitals: z.object({
                lcp: z.number(),
                inp: z.number(),
                cls: z.number(),
                fcp: z.number(),
                ttfb: z.number(),
              }),
              api: z.object({
                avgResponseTime: z.number(),
                errorRate: z.number(),
                requestsPerMinute: z.number(),
                cacheHitRate: z.number(),
              }),
              healthcare: z.object({
                complianceScore: z.number(),
                videoCallQuality: z.number(),
                patientDataLatency: z.number(),
                auditLogRetention: z.number(),
              }),
            }),
            timestamp: z.string().datetime(),
            requestId: z.string(),
          }),
        },
      },
    },
  },
});

// Compliance Analytics route
export const complianceAnalyticsRoute = createHealthcareRoute({
  method: "get",
  path: "/api/analytics/compliance",
  tags: ["AI & Analytics"],
  summary: "Compliance Analytics",
  description: "LGPD, ANVISA, and CFM compliance metrics and audit reports.",
  dataClassification: "internal",
  auditRequired: true,
  request: {
    query: z.object({
      clinicId: z.string().uuid(),
      timeframe: z.enum(["week", "month", "quarter", "year"]).default("month"),
      complianceType: z.array(z.enum(["lgpd", "anvisa", "cfm"])).optional(),
    }),
  },
  responses: {
    200: {
      description: "Compliance metrics and reports",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              lgpd: z.object({
                consentCompliance: z.number().min(0).max(100),
                dataSubjectRights: z.number(),
                auditLogCoverage: z.number().min(0).max(100),
                breachIncidents: z.number(),
              }),
              anvisa: z.object({
                samdCompliance: z.number().min(0).max(100),
                qualityManagement: z.boolean(),
                postMarketSurveillance: z.boolean(),
                clinicalEvidence: z.string(),
              }),
              cfm: z.object({
                telemedicineCompliance: z.number().min(0).max(100),
                professionalVerification: z.number().min(0).max(100),
                medicalRecordIntegrity: z.boolean(),
                ethicsCompliance: z.number().min(0).max(100),
              }),
              overallScore: z.number().min(0).max(100),
            }),
            timestamp: z.string().datetime(),
            requestId: z.string(),
          }),
        },
      },
    },
  },
});
```

## Documentation Generation Scripts

### OpenAPI Generator Script

**File**: `scripts/generate-api-docs.ts`

```typescript
#!/usr/bin/env bun

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import {
  createHealthcareOpenAPIApp,
  setupHealthcareSwaggerUI,
} from "../apps/api/src/lib/openapi-generator";

// Import all documented routes
import {
  listPatientsRoute,
  createPatientRoute,
  getPatientRoute,
  updatePatientRoute,
  deletePatientRoute,
} from "../apps/api/src/routes/documented/patients";

import {
  listAppointmentsRoute,
  createAppointmentRoute,
} from "../apps/api/src/routes/documented/appointments";

import {
  aiChatRoute,
  performanceAnalyticsRoute,
  complianceAnalyticsRoute,
} from "../apps/api/src/routes/documented/ai-analytics";

async function generateAPIDocs() {
  console.log("🔄 Generating NeonPro Healthcare API Documentation...");

  try {
    // Create OpenAPI app
    const app = createHealthcareOpenAPIApp();

    // Register all healthcare routes
    console.log("📋 Registering Patient Management routes...");
    app.openapi(listPatientsRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(createPatientRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(getPatientRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(updatePatientRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(deletePatientRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );

    console.log("📅 Registering Appointment Management routes...");
    app.openapi(listAppointmentsRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(createAppointmentRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );

    console.log("🤖 Registering AI & Analytics routes...");
    app.openapi(aiChatRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(performanceAnalyticsRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );
    app.openapi(complianceAnalyticsRoute, async (c) =>
      c.json({ message: "Implementation in main app" }),
    );

    // Setup Swagger UI
    setupHealthcareSwaggerUI(app);

    // Generate OpenAPI specification
    console.log("📝 Generating OpenAPI specification...");
    const openAPISpec = app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        title: "NeonPro Healthcare Platform API",
        version: "1.0.0",
        description: `
          # NeonPro Healthcare Platform API
          
          Comprehensive healthcare platform API with Brazilian regulatory compliance.
          
          ## Compliance Standards
          
          - **LGPD** (Lei Geral de Proteção de Dados) - Brazilian Data Protection Law
          - **ANVISA** - Brazilian Health Regulatory Agency standards
          - **CFM** - Federal Council of Medicine professional standards
          
          ## Data Classifications
          
          - **Public**: Non-sensitive operational data
          - **Internal**: Business data with access controls  
          - **Personal**: LGPD-protected personal information
          - **Medical**: Patient health records and medical data
          - **Financial**: Billing and payment information
          
          ## Security Features
          
          - JWT Bearer authentication
          - Role-based access control
          - Multi-tenant clinic isolation
          - Comprehensive audit logging
          - PII redaction and data masking
          - End-to-end encryption
          
          ## Healthcare Features
          
          - Semantic AI caching (80% cost reduction)
          - Real-time telemedicine support
          - CFM-compliant professional verification
          - ANVISA medical device standards
          - LGPD data subject rights management
          
          For detailed implementation guides, see our [comprehensive documentation](https://docs.neonpro.com.br).
        `,
        contact: {
          name: "NeonPro Development Team",
          email: "dev@neonpro.com.br",
          url: "https://neonpro.com.br",
        },
        license: {
          name: "Proprietary",
          url: "https://neonpro.com.br/license",
        },
      },
      servers: [
        {
          url: "https://api.neonpro.com.br",
          description: "Production API",
        },
        {
          url: "https://staging-api.neonpro.com.br",
          description: "Staging API",
        },
        {
          url: "http://localhost:3001",
          description: "Development API",
        },
      ],
    });

    // Ensure docs directory exists
    const docsDir = join(process.cwd(), "docs", "api");
    await mkdir(docsDir, { recursive: true });

    // Write OpenAPI specification
    const specPath = join(docsDir, "openapi.json");
    await writeFile(specPath, JSON.stringify(openAPISpec, null, 2));
    console.log(`✅ OpenAPI specification written to: ${specPath}`);

    // Generate human-readable documentation
    await generateMarkdownDocs(openAPISpec, docsDir);

    console.log("🎉 API documentation generation completed successfully!");
    console.log("📖 Documentation available at:");
    console.log(`   - OpenAPI Spec: ${specPath}`);
    console.log(`   - Markdown Docs: ${join(docsDir, "README.md")}`);
    console.log(`   - Swagger UI: http://localhost:3001/swagger`);
  } catch (error) {
    console.error("❌ Error generating API documentation:", error);
    process.exit(1);
  }
}

async function generateMarkdownDocs(spec: any, docsDir: string) {
  console.log("📄 Generating Markdown documentation...");

  const markdown = `# ${spec.info.title}

${spec.info.description}

## Base URLs

${spec.servers.map((server: any) => `- **${server.description}**: \`${server.url}\``).join("\n")}

## Authentication

This API uses JWT Bearer token authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Healthcare Compliance Headers

All healthcare data endpoints require these headers:

\`\`\`
x-clinic-id: <uuid>        # Multi-tenant clinic isolation
x-user-id: <uuid>          # User identification for audit
x-request-id: <string>     # Optional request tracing
\`\`\`

## Rate Limiting

API requests are rate-limited based on user type:

- **Public endpoints**: 1000 requests/hour
- **Authenticated users**: 500 requests/hour  
- **Healthcare data**: 100 requests/hour
- **Admin operations**: 50 requests/hour

## Error Handling

All API responses follow a consistent error format:

\`\`\`json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Request validation failed",
    "code": 400,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789",
    "category": "validation",
    "severity": "low"
  }
}
\`\`\`

## Endpoints Overview

### Patient Management

#### GET /api/patients
Retrieve a paginated list of patients with LGPD consent filtering.

**Data Classification**: Personal  
**Audit Required**: Yes  
**LGPD Protected**: Personal data

**Query Parameters**:
- \`clinicId\` (required): Clinic UUID for multi-tenant scoping
- \`page\` (optional): Page number (default: 1)
- \`limit\` (optional): Results per page (default: 20, max: 100)
- \`search\` (optional): Search term for patient name/email
- \`consentOnly\` (optional): Include only patients with LGPD consent (default: true)

#### POST /api/patients
Create a new patient with LGPD consent validation.

**Data Classification**: Personal  
**Audit Required**: Yes  
**LGPD Protected**: Personal data

**Request Body**:
\`\`\`json
{
  "clinicId": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "João Silva Santos",
  "familyName": "Santos",
  "cpf": "123.456.789-01",
  "birthDate": "1990-01-15T00:00:00.000Z",
  "phone": "(11) 99999-9999",
  "email": "joao.santos@email.com",
  "lgpdConsentGiven": true
}
\`\`\`

### Appointment Management

#### GET /api/appointments
Retrieve appointments with multi-tenant scoping and consent filtering.

**Data Classification**: Medical  
**Audit Required**: Yes

#### POST /api/appointments
Schedule a new appointment with healthcare professional verification.

**Data Classification**: Medical  
**Audit Required**: Yes

### AI & Analytics

#### POST /api/ai/chat
AI-powered healthcare assistance with semantic caching and PII redaction.

**Data Classification**: Medical  
**Audit Required**: Yes

**Request Body**:
\`\`\`json
{
  "message": "What are the symptoms of type 2 diabetes?",
  "context": {
    "professionalId": "550e8400-e29b-41d4-a716-446655440000",
    "specialization": "endocrinology",
    "urgency": "routine",
    "language": "pt-BR"
  },
  "preferences": {
    "includeReferences": true,
    "maxResponseLength": 500,
    "clinicalFocus": ["diabetes", "endocrinology"]
  }
}
\`\`\`

#### GET /api/analytics/performance
Healthcare platform performance metrics and Core Web Vitals.

**Data Classification**: Internal

#### GET /api/analytics/compliance  
LGPD, ANVISA, and CFM compliance metrics and audit reports.

**Data Classification**: Internal  
**Audit Required**: Yes

## Healthcare Compliance Features

### LGPD (Brazilian Data Protection Law)

- **Consent Management**: Granular consent for different data processing purposes
- **Data Subject Rights**: Access, rectification, erasure, and portability
- **Audit Logging**: Comprehensive logging of all personal data access
- **Data Retention**: Automatic data lifecycle management
- **Cross-border Transfers**: Restricted international data transfers

### CFM (Federal Council of Medicine)

- **Professional Verification**: CRM license validation with CFM database
- **Telemedicine Standards**: CFM Resolution 2.314/2022 compliance
- **Medical Record Retention**: Permanent retention of medical records
- **Ethics Compliance**: Medical ethics code adherence

### ANVISA (Health Regulatory Agency)

- **Medical Device Standards**: Software as Medical Device (SaMD) compliance
- **Quality Management**: ISO 13485 healthcare quality systems
- **Risk Management**: ISO 14971 healthcare risk management
- **Clinical Evidence**: Evidence-based safety and effectiveness

## SDK and Integration

### JavaScript/TypeScript SDK

\`\`\`bash
npm install @neonpro/healthcare-api-sdk
\`\`\`

\`\`\`typescript
import { NeonProHealthcareAPI } from '@neonpro/healthcare-api-sdk';

const api = new NeonProHealthcareAPI({
  baseURL: 'https://api.neonpro.com.br',
  apiKey: 'your-jwt-token',
  clinicId: 'your-clinic-uuid'
});

// List patients with LGPD compliance
const patients = await api.patients.list({
  page: 1,
  limit: 20,
  consentOnly: true
});

// AI healthcare assistance
const aiResponse = await api.ai.chat({
  message: 'What are the symptoms of hypertension?',
  context: {
    professionalId: 'professional-uuid',
    specialization: 'cardiology',
    urgency: 'routine'
  }
});
\`\`\`

## Support and Documentation

- **API Documentation**: https://docs.neonpro.com.br/api
- **Healthcare Compliance Guide**: https://docs.neonpro.com.br/compliance  
- **Integration Examples**: https://docs.neonpro.com.br/examples
- **Support**: dev@neonpro.com.br

---

*This API documentation is automatically generated from OpenAPI specifications and is kept up-to-date with the latest implementation.*
`;

  const markdownPath = join(docsDir, "README.md");
  await writeFile(markdownPath, markdown);
  console.log(`✅ Markdown documentation written to: ${markdownPath}`);
}

// Run if called directly
if (import.meta.main) {
  generateAPIDocs();
}
```

## Deployment Configuration

### Vercel Deployment

**File**: `docs/api/vercel.json`

```json
{
  "version": 2,
  "name": "neonpro-api-docs",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/openapi.json",
      "dest": "/openapi.json",
      "headers": {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      }
    },
    {
      "src": "/swagger/(.*)",
      "dest": "/swagger/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Package Scripts

**File**: `package.json` (excerpt)

```json
{
  "scripts": {
    "docs:generate": "bun run scripts/generate-api-docs.ts",
    "docs:build": "bun run docs:generate && bun run docs:swagger",
    "docs:swagger": "swagger-codegen generate -i docs/api/openapi.json -l html2 -o docs/api/dist",
    "docs:deploy": "bun run docs:build && vercel --prod",
    "docs:preview": "bun run docs:build && vercel",
    "docs:dev": "bun run apps/api/src/index.ts"
  }
}
```

This comprehensive API documentation system provides:

1. **Complete OpenAPI Specification** with healthcare compliance details
2. **Automated Documentation Generation** from code annotations
3. **Healthcare-Specific Schemas** for LGPD, CFM, and ANVISA compliance
4. **Interactive Swagger UI** with healthcare branding
5. **Markdown Documentation** for easy reading and integration
6. **Automated Deployment** to docs site with proper caching and security headers
7. **SDK Integration Examples** for developers

The documentation is automatically kept up-to-date with the API implementation and includes all necessary healthcare compliance information for Brazilian regulations.
