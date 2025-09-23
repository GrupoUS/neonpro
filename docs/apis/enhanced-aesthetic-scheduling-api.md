---
title: "Enhanced Aesthetic Scheduling API"
last_updated: 2025-09-23
form: reference
tags: [api, aesthetic-scheduling, enhanced, multi-session, recovery-planning]
related:
  - ./README.md
  - ./ai-clinical-support-api.md
  - ../architecture/tech-stack.md
---

# Enhanced Aesthetic Scheduling API

## Overview

The Enhanced Aesthetic Scheduling API provides comprehensive scheduling capabilities specifically designed for aesthetic clinics, including multi-session treatment planning, recovery period management, and professional certification validation.

**Target Audience**: Aesthetic clinics, beauty professionals, cosmetic treatment centers  
**Compliance**: LGPD, CFM, COREN, CFF, CNEP regulations  
**Features**: Multi-session scheduling, recovery planning, certification validation

## Base URL

```
https://api.neonpro.com.br/v1/aesthetic-scheduling
```

## Authentication

### Bearer Token Authentication

```http
Authorization: Bearer <your-jwt-token>
```

### Professional License Authentication

```http
X-Professional-License: <license-number>
```

## Core Endpoints

### Enhanced Scheduling

#### Schedule Aesthetic Procedure

```http
POST /schedule
```

Schedule aesthetic procedures with multi-session support and recovery planning.

**Request Body:**

```json
{
  "clientId": "client-uuid",
  "professionalId": "professional-uuid",
  "procedureType": "toxina_botulinica",
  "sessions": [
    {
      "date": "2024-01-15T14:00:00Z",
      "duration": 30,
      "room": "sala-01"
    },
    {
      "date": "2024-02-15T14:00:00Z",
      "duration": 30,
      "room": "sala-01"
    }
  ],
  "recoveryPlanning": {
    "recoveryPeriodDays": 7,
    "aftercareInstructions": "Evitar deitar por 4 horas, não exercitar por 24h",
    "followUpRequired": true
  },
  "contraindicationsCheck": {
    "pregnancy": false,
    "breastfeeding": false,
    "neuromuscularDiseases": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "treatment-uuid",
    "clientId": "client-uuid",
    "professionalId": "professional-uuid",
    "procedureType": "toxina_botulinica",
    "status": "scheduled",
    "sessions": [
      {
        "id": "session-uuid",
        "date": "2024-01-15T14:00:00Z",
        "duration": 30,
        "room": "sala-01",
        "status": "scheduled"
      }
    ],
    "recoveryPlanning": {
      "recoveryPeriodDays": 7,
      "aftercareInstructions": "Evitar deitar por 4 horas, não exercitar por 24h",
      "followUpRequired": true
    },
    "certificationValidation": {
      "isValid": true,
      "professionalLicense": "CRM/SP123456",
      "requiredCertification": "botox_certification",
      "validationDate": "2024-01-15T00:00:00Z"
    }
  }
}
```

#### Get Treatment Schedule

```http
GET /schedule/{treatmentId}
```

Retrieve detailed treatment schedule with all sessions and recovery information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "treatment-uuid",
    "clientId": "client-uuid",
    "professionalId": "professional-uuid",
    "procedureType": "toxina_botulinica",
    "status": "in_progress",
    "sessions": [
      {
        "id": "session-uuid",
        "date": "2024-01-15T14:00:00Z",
        "duration": 30,
        "room": "sala-01",
        "status": "completed",
        "notes": "Procedimento realizado com sucesso"
      }
    ],
    "recoveryPlanning": {
      "recoveryPeriodDays": 7,
      "aftercareInstructions": "Evitar deitar por 4 horas, não exercitar por 24h",
      "followUpRequired": true,
      "followUpDate": "2024-01-22T14:00:00Z"
    },
    "progressTracking": {
      "completedSessions": 1,
      "totalSessions": 2,
      "completionPercentage": 50
    }
  }
}
```

### Treatment Packages

#### Create Treatment Package

```http
POST /packages
```

Create comprehensive treatment packages with multiple procedures.

**Request Body:**

```json
{
  "name": "Pacote Harmonização Facial",
  "description": "Pacote completo para harmonização facial",
  "procedures": [
    {
      "type": "toxina_botulinica",
      "sessions": 1,
      "intervalDays": 0
    },
    {
      "type": "acido_hialuronico",
      "sessions": 2,
      "intervalDays": 30
    }
  ],
  "totalDuration": 60,
  "basePrice": 3500.00,
  "discount": 10,
  "recoveryPlanning": {
    "totalRecoveryDays": 14,
    "staggeredRecovery": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "package-uuid",
    "name": "Pacote Harmonização Facial",
    "description": "Pacote completo para harmonização facial",
    "totalSessions": 3,
    "totalDuration": 60,
    "basePrice": 3500.00,
    "discountedPrice": 3150.00,
    "procedures": [
      {
        "type": "toxina_botulinica",
        "sessions": 1,
        "duration": 30
      },
      {
        "type": "acido_hialuronico",
        "sessions": 2,
        "duration": 30
      }
    ],
    "schedulingConstraints": {
      "minimumIntervalDays": 14,
      "maximumDurationPerSession": 60
    }
  }
}
```

#### Get Treatment Packages

```http
GET /packages
```

Retrieve available treatment packages with filtering options.

**Query Parameters:**

- `category`: `injectable`, `laser`, `facial`, `body`
- `priceRange`: `0-1000`, `1000-5000`, `5000+`
- `sessions`: `single`, `multiple`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "package-uuid",
      "name": "Pacote Harmonização Facial",
      "category": "injectable",
      "totalSessions": 3,
      "basePrice": 3500.00,
      "discountedPrice": 3150.00,
      "popularity": 85,
      "recommendedFor": ["facial_harmonization", "wrinkle_reduction"]
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 15
  }
}
```

### Resource Optimization

#### Get Resource Availability

```http
GET /resources/availability
```

Check resource availability for scheduling optimization.

**Query Parameters:**

- `date`: `2024-01-15`
- `resourceType`: `room`, `equipment`, `professional`
- `procedureType`: `toxina_botulinica`

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "rooms": [
      {
        "id": "sala-01",
        "name": "Sala de Procedimentos 1",
        "availability": [
          {
            "start": "09:00",
            "end": "10:00",
            "available": true
          },
          {
            "start": "14:00",
            "end": "15:00",
            "available": false,
            "reason": "maintenance"
          }
        ]
      }
    ],
    "professionals": [
      {
        "id": "professional-uuid",
        "name": "Dr. João Silva",
        "specialty": "dermatologia",
        "availableSlots": 8,
        "maxProcedures": 12
      }
    ],
    "equipment": [
      {
        "id": "laser-01",
        "name": "Laser Fraxel",
        "status": "available",
        "maintenanceSchedule": null
      }
    ]
  }
}
```

#### Optimize Schedule

```http
POST /optimize
```

Optimize schedule based on resource availability and constraints.

**Request Body:**

```json
{
  "dateRange": {
    "start": "2024-01-15",
    "end": "2024-01-19"
  },
  "constraints": {
    "maxConcurrentProcedures": 3,
    "minimumBreakTime": 15,
    "roomRequirements": ["sala-01", "sala-02"],
    "professionalAvailability": ["professional-uuid"]
  },
  "objectives": [
    "maximize_utilization",
    "minimize_waiting_time",
    "balance_workload"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "optimizedSchedule": [
      {
        "time": "2024-01-15T09:00:00Z",
        "professionalId": "professional-uuid",
        "roomId": "sala-01",
        "procedureType": "toxina_botulinica",
        "confidence": 0.92
      }
    ],
    "metrics": {
      "utilization": 87,
      "averageWaitTime": 5,
      "workloadBalance": 92
    }
  }
}
```

### Professional Certification

#### Validate Professional Certification

```http
POST /professionals/validate
```

Validate professional certifications for specific procedures.

**Request Body:**

```json
{
  "professionalId": "professional-uuid",
  "licenseNumber": "CRM/SP123456",
  "procedureType": "toxina_botulinica",
  "requiredCertifications": ["botox_certification", "advanced_injectables"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "professional": {
      "id": "professional-uuid",
      "name": "Dr. João Silva",
      "license": "CRM/SP123456",
      "specialty": "dermatologia"
    },
    "certifications": [
      {
        "type": "botox_certification",
        "valid": true,
        "expiryDate": "2025-12-31",
        "issuer": "Allergan"
      },
      {
        "type": "advanced_injectables",
        "valid": true,
        "expiryDate": "2026-06-30",
        "issuer": "Brazilian Aesthetic Association"
      }
    ],
    "validationScore": 95,
    "recommendations": [
      "Certificação atualizada e válida para o procedimento"
    ]
  }
}
```

#### Get Professional Certifications

```http
GET /professionals/{professionalId}/certifications
```

Retrieve all certifications for a professional.

**Response:**

```json
{
  "success": true,
  "data": {
    "professionalId": "professional-uuid",
    "certifications": [
      {
        "id": "cert-uuid",
        "type": "botox_certification",
        "name": "Certificação em Aplicação de Toxina Botulínica",
        "issuer": "Allergan",
        "issueDate": "2023-01-15",
        "expiryDate": "2025-12-31",
        "valid": true,
        "procedures": ["toxina_botulinica", "rejuvenescimento_facial"]
      }
    ],
    "overallStatus": "active",
    "nextRenewalDate": "2025-12-31"
  }
}
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de agendamento inválidos",
    "details": [
      {
        "field": "clientId",
        "message": "ID do cliente é obrigatório"
      }
    ],
    "timestamp": "2024-01-15T00:00:00Z",
    "requestId": "request-uuid"
  }
}
```

### Aesthetic Scheduling-Specific Errors

```json
{
  "success": false,
  "error": {
    "code": "CERTIFICATION_REQUIRED",
    "message": "Profissional não possui certificação necessária para o procedimento",
    "details": {
      "requiredCertification": "botox_certification",
      "availableCertifications": ["basic_injectables"],
      "recommendation": "Obter certificação específica para toxina botulínica"
    },
    "professionalContext": {
      "professionalId": "professional-uuid",
      "procedureType": "toxina_botulinica"
    }
  }
}
```

## Rate Limiting

### Standard Limits

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **API Keys**: 10,000 requests per hour

### Aesthetic Scheduling Operations

- **Schedule Creation**: 100 requests per hour
- **Resource Optimization**: 50 requests per hour
- **Certification Validation**: 200 requests per hour

## Webhooks

### Scheduling Events

```http
POST /webhooks/scheduling
```

Receive real-time scheduling event notifications.

**Event Payload:**

```json
{
  "event": "treatment.scheduled",
  "timestamp": "2024-01-15T00:00:00Z",
  "data": {
    "treatmentId": "treatment-uuid",
    "clientId": "client-uuid",
    "professionalId": "professional-uuid",
    "procedureType": "toxina_botulinica",
    "scheduledSessions": 2,
    "totalDuration": 60
  }
}
```

### Resource Events

```http
POST /webhooks/resources
```

Receive resource availability notifications.

**Event Payload:**

```json
{
  "event": "resource.unavailable",
  "timestamp": "2024-01-15T00:00:00Z",
  "data": {
    "resourceId": "sala-01",
    "resourceType": "room",
    "unavailablePeriod": {
      "start": "2024-01-15T14:00:00Z",
      "end": "2024-01-15T16:00:00Z"
    },
    "reason": "maintenance"
  }
}
```

## Implementation Examples

### React Frontend Integration

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { aestheticSchedulingAPI } from "@neonpro/aesthetic-scheduling";

interface ScheduleTreatmentRequest {
  clientId: string;
  professionalId: string;
  procedureType: string;
  sessions: Array<{
    date: string;
    duration: number;
    room: string;
  }>;
}

function ScheduleTreatmentForm() {
  const { mutate: scheduleTreatment, isPending } = useMutation({
    mutationFn: (data: ScheduleTreatmentRequest) =>
      aestheticSchedulingAPI.schedule(data),
    onSuccess: (data) => {
      toast.success("Tratamento agendado com sucesso!");
      // Handle success
    },
    onError: (error) => {
      toast.error("Erro ao agendar tratamento");
      // Handle error
    },
  });

  const handleSubmit = (formData: ScheduleTreatmentRequest) => {
    scheduleTreatment(formData);
  };

  return <ScheduleTreatmentFormComponent onSubmit={handleSubmit} />;
}

function ResourceAvailability() {
  const { data: availability, isLoading } = useQuery({
    queryKey: ["resource-availability", new Date().toISOString()],
    queryFn: () =>
      aestheticSchedulingAPI.getResourceAvailability({
        date: new Date().toISOString().split("T")[0],
        resourceType: "room",
      }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!availability) return <div>Indisponível</div>;

  return <ResourceCalendar availability={availability.data} />;
}
```

### Backend Integration

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { EnhancedAestheticSchedulingService } from "@neonpro/core-services";

const app = new Hono();
const schedulingService = new EnhancedAestheticSchedulingService();

const ScheduleTreatmentSchema = z.object({
  clientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  procedureType: z.enum(["toxina_botulinica", "acido_hialuronico", "laser"]),
  sessions: z.array(
    z.object({
      date: z.string().datetime(),
      duration: z.number().min(15).max(240),
      room: z.string(),
    }),
  ),
  recoveryPlanning: z.object({
    recoveryPeriodDays: z.number().min(0).max(30),
    aftercareInstructions: z.string(),
    followUpRequired: z.boolean(),
  }),
});

// Schedule aesthetic treatment
app.post("/schedule", zValidator("json", ScheduleTreatmentSchema), async (c) => {
  const data = c.req.valid("json");
  const user = c.get("user");

  try {
    const result = await schedulingService.scheduleAestheticProcedures({
      ...data,
      createdBy: user.id,
    });

    return c.json({ success: true, data: result });
  } catch (error) {
    if (error.code === "CERTIFICATION_REQUIRED") {
      return c.json(
        {
          success: false,
          error: {
            code: "CERTIFICATION_REQUIRED",
            message: "Profissional não possui certificação necessária",
          },
        },
        403,
      );
    }

    return c.json(
      {
        success: false,
        error: {
          code: "SCHEDULING_ERROR",
          message: "Erro ao agendar tratamento",
        },
      },
      500,
    );
  }
});

// Get treatment packages
app.get("/packages", async (c) => {
  const category = c.req.query("category");
  const priceRange = c.req.query("priceRange");

  try {
    const packages = await schedulingService.getTreatmentPackages({
      category,
      priceRange,
    });

    return c.json({ success: true, data: packages });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "PACKAGES_ERROR",
          message: "Erro ao buscar pacotes de tratamento",
        },
      },
      500,
    );
  }
});

// Optimize schedule
app.post("/optimize", async (c) => {
  const { dateRange, constraints, objectives } = await c.req.json();

  try {
    const optimization = await schedulingService.optimizeSchedule({
      dateRange,
      constraints,
      objectives,
    });

    return c.json({ success: true, data: optimization });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "OPTIMIZATION_ERROR",
          message: "Erro ao otimizar agenda",
        },
      },
      500,
    );
  }
});
```

## SDK Integration

### TypeScript SDK

```typescript
import { AestheticSchedulingAPI } from "@neonpro/aesthetic-scheduling";

const api = new AestheticSchedulingAPI({
  apiKey: "your-api-key",
  baseUrl: "https://api.neonpro.com.br/v1",
});

// Schedule treatment with multi-session support
const treatment = await api.schedule({
  clientId: "client-uuid",
  professionalId: "professional-uuid",
  procedureType: "toxina_botulinica",
  sessions: [
    {
      date: "2024-01-15T14:00:00Z",
      duration: 30,
      room: "sala-01",
    },
    {
      date: "2024-02-15T14:00:00Z",
      duration: 30,
      room: "sala-01",
    },
  ],
  recoveryPlanning: {
    recoveryPeriodDays: 7,
    aftercareInstructions: "Evitar deitar por 4 horas",
    followUpRequired: true,
  },
});

// Get treatment packages
const packages = await api.getPackages({
  category: "injectable",
  priceRange: "1000-5000",
});

// Optimize schedule
const optimization = await api.optimizeSchedule({
  dateRange: {
    start: "2024-01-15",
    end: "2024-01-19",
  },
  constraints: {
    maxConcurrentProcedures: 3,
    minimumBreakTime: 15,
  },
  objectives: ["maximize_utilization", "minimize_waiting_time"],
});

// Validate professional certification
const validation = await api.validateProfessional({
  professionalId: "professional-uuid",
  licenseNumber: "CRM/SP123456",
  procedureType: "toxina_botulinica",
});
```

## Data Models

### TreatmentSchedule

```typescript
interface TreatmentSchedule {
  id: string;
  clientId: string;
  professionalId: string;
  procedureType: AestheticProcedureType;
  status: TreatmentStatus;
  sessions: TreatmentSession[];
  recoveryPlanning: RecoveryPlanning;
  certificationValidation: CertificationValidation;
  progressTracking: ProgressTracking;
  createdAt: string;
  updatedAt: string;
}
```

### TreatmentPackage

```typescript
interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  category: AestheticCategory;
  procedures: PackageProcedure[];
  totalSessions: number;
  totalDuration: number;
  basePrice: number;
  discountedPrice: number;
  schedulingConstraints: SchedulingConstraints;
  popularity: number;
  recommendedFor: string[];
}
```

### ProfessionalCertification

```typescript
interface ProfessionalCertification {
  id: string;
  professionalId: string;
  type: CertificationType;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  valid: boolean;
  procedures: string[];
}
```

## Support

### Documentation

- [API Reference](https://docs.neonpro.com.br/api/aesthetic-scheduling)
- [Treatment Packages Guide](https://docs.neonpro.com.br/guides/treatment-packages)
- [Professional Certification](https://docs.neonpro.com.br/guides/certification)
- [Resource Optimization](https://docs.neonpro.com.br/guides/resource-optimization)

### Contact

- **API Support**: api-support@neonpro.com.br
- **Technical Support**: tech-support@neonpro.com.br
- **Compliance Questions**: compliance@neonpro.com.br

### Status

- **API Status**: https://status.neonpro.com.br
- **Maintenance Schedule**: https://status.neonpro.com.br/maintenance

## Changelog

### v1.0.0 (2024-01-15)

- Initial enhanced aesthetic scheduling API release
- Multi-session treatment scheduling
- Recovery period management
- Professional certification validation
- Treatment package creation
- Resource optimization algorithms

### v1.1.0 (2024-02-01)

- Enhanced resource optimization algorithms
- Improved certification validation
- Additional aesthetic procedure types
- Webhook support for real-time notifications
- Performance optimizations for large clinics

---

**Focus**: Enhanced aesthetic clinic scheduling with multi-session support  
**Compliance**: LGPD, CFM, COREN, CFF, CNEP compliant  
**Target**: Aesthetic clinic platform developers  
**Version**: 1.1.0 - Production Ready  
**Last Updated**: 2025-09-23  
**Next Review**: 2025-12-23