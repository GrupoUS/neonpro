---
title: "AI Clinical Decision Support API"
last_updated: 2025-09-23
form: reference
tags: [api, ai-clinical-support, treatment-recommendations, contraindication-analysis]
related:
  - ./README.md
  - ./enhanced-aesthetic-scheduling-api.md
  - ../architecture/tech-stack.md
---

# AI Clinical Decision Support API

## Overview

The AI Clinical Decision Support API provides intelligent treatment recommendations, contraindication analysis, and outcome prediction specifically designed for aesthetic clinics and healthcare professionals.

**Target Audience**: Aesthetic clinics, healthcare professionals, cosmetic treatment centers  
**Compliance**: LGPD, CFM, COREN, CFF, CNEP regulations  
**Features**: Treatment recommendations, contraindication analysis, progress monitoring

## Base URL

```
https://api.neonpro.com.br/v1/ai-clinical-support
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

### Treatment Recommendations

#### Generate Treatment Recommendations

```http
POST /recommendations
```

Generate personalized treatment recommendations based on patient assessment.

**Request Body:**

```json
{
  "patientAssessment": {
    "patientId": "patient-uuid",
    "age": 35,
    "gender": "female",
    "skinType": "oleosa",
    "concerns": ["rugas", "flacidez", "manchas"],
    "medicalHistory": {
      "allergies": [],
      "pregnancy": false,
      "breastfeeding": false,
      "medications": ["anticoncepcional"]
    },
    "previousTreatments": [
      {
        "type": "toxina_botulinica",
        "date": "2024-01-15",
        "results": "satisfatorio"
      }
    ],
    "treatmentGoals": ["rejuvenescimento_facial", "melhora_textura_pele"]
  },
  "preferences": {
    "downtimeTolerance": "low",
    "budgetRange": "medium",
    "treatmentFrequency": "quarterly"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "treatment": "toxina_botulinica",
        "confidence": 0.92,
        "reasoning": "Excelente candidato para redução de rugas dinâmicas, baseado na idade e preocupações relatadas",
        "expectedResults": "Redução de 70-80% das rugas de expressão",
        "sessions": 1,
        "duration": 30,
        "priceRange": 800-1200,
        "recovery": "2-3 dias de leve vermelhidão",
        "contraindications": ["gravidez", "amamentação", "doenças neuromusculares"]
      },
      {
        "treatment": "acido_hialuronico",
        "confidence": 0.88,
        "reasoning": "Indicado para restaurar volume facial e melhorar contornos",
        "expectedResults": "Melhora imediata na harmonização facial",
        "sessions": 2,
        "duration": 45,
        "priceRange": 1500-2500,
        "recovery": "3-5 dias de edema leve",
        "contraindications": ["gravidez", "amamentação", "infecção ativa"]
      }
    ],
    "personalizedNotes": [
      "Paciente é excelente candidata para procedimentos combinados",
      "Recomendar sessão de consulta detalhada para avaliação presencial",
      "Considerar protocolo de tratamento em etapas para melhor resultado"
    ],
    "safetyScore": 95,
    "effectivenessScore": 88
  }
}
```

#### Get Treatment Information

```http
GET /treatments/{treatmentType}
```

Get detailed information about specific aesthetic treatments.

**Response:**

```json
{
  "success": true,
  "data": {
    "treatment": "toxina_botulinica",
    "description": "Aplicação de toxina botulínica para redução de rugas dinâmicas",
    "mechanism": "Bloqueio temporário da transmissão neuromuscular",
    "indications": [
      "rugas_glabelares",
      "rugas_frontais",
      "patas_de_galinha",
      "linha_marionete"
    ],
    "contraindications": [
      "gravidez",
      "amamentação", 
      "doenças_neuromusculares",
      "alergia_proteinas_clostridium"
    ],
    "expectedResults": {
      "onset": "3-7 dias",
      "peak": "14 dias",
      "duration": "3-6 meses"
    },
    "protocol": {
      "sessions": 1,
      "duration": 30,
      "anesthesia": "topica",
      "aftercare": "evitar_deitar_4h_nao_exercitar_24h"
    },
    "safetyProfile": {
      "commonEffects": ["vermelhidao_leve", "edema_localizado"],
      "rareEffects": ["ptose_palpebral", "cefaleia"],
      "resolutionTime": "1-7 dias"
    }
  }
}
```

### Contraindication Analysis

#### Analyze Contraindications

```http
POST /contraindications
```

Analyze potential contraindications for specific treatments.

**Request Body:**

```json
{
  "patientProfile": {
    "patientId": "patient-uuid",
    "age": 35,
    "gender": "female",
    "medicalHistory": {
      "pregnancy": false,
      "breastfeeding": false,
      "allergies": ["iodo"],
      "medications": ["anticocepcional", "aspirina"],
      "conditions": ["hipotireoidismo"]
    },
    "previousProcedures": ["toxina_botulinica"]
  },
  "targetTreatments": ["toxina_botulinica", "acido_hialuronico", "laser_fraxel"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "analysis": {
      "toxina_botulinica": {
        "contraindicated": false,
        "warnings": [
          "Uso de aspirina pode aumentar risco de hematomas",
          "Monitorar função tireoidiana durante tratamento"
        ],
        "precautions": [
          "Suspender aspirina 7 dias antes do procedimento",
          "Realizar teste cutâneo preliminar"
        ],
        "riskLevel": "low",
        "recommendation": "Procedimento seguro com precauções"
      },
      "acido_hialuronico": {
        "contraindicated": true,
        "reason": "Alergia a iodo (possível reação cruzada)",
        "alternatives": [
          "calcio_hidroxiapatita",
          "pllafina"
        ],
        "riskLevel": "high",
        "recommendation": "Evitar tratamento, considerar alternativas"
      }
    },
    "overallSafety": "moderate",
    "requiredMonitoring": ["sinais_alergicos", "reacoes_locais"],
    "consultationRequired": true
  }
}
```

### Progress Monitoring

#### Track Treatment Progress

```http
POST /progress/track
```

Track and analyze treatment progress with AI-powered insights.

**Request Body:**

```json
{
  "treatmentId": "treatment-uuid",
  "patientId": "patient-uuid",
  "treatmentType": "toxina_botulinica",
  "sessionNumber": 1,
  "followUpData": {
    "patientFeedback": {
      "satisfaction": 8,
      "painLevel": 2,
      "sideEffects": ["vermelhidao_leve", "edema_minimo"]
    },
    "clinicalAssessment": {
      "efficacy": "excelente",
      "symmetry": "otima",
      "naturalAppearance": "sim"
    },
    "photos": [
      {
        "url": "https://storage.neonpro.com.br/photos/before.jpg",
        "angle": "frontal",
        "date": "2024-01-15"
      },
      {
        "url": "https://storage.neonpro.com.br/photos/after.jpg",
        "angle": "frontal",
        "date": "2024-02-15"
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "progressAnalysis": {
      "treatmentId": "treatment-uuid",
      "currentStatus": "responding_well",
      "progressPercentage": 85,
      "efficacyScore": 92,
      "satisfactionScore": 80,
      "insights": [
        "Excelente resposta ao tratamento com redução significativa de rugas",
        "Simetria facial mantida com resultados naturais",
        "Efeitos colaterais mínimos e bem tolerados"
      ],
      "recommendations": [
        "Manter acompanhamento trimestral",
        "Considerar tratamento de manutenção aos 4 meses",
        "Documentar evolução fotográfica detalhada"
      ],
      "nextSteps": {
        "nextSession": "2024-05-15",
        "followUpDate": "2024-04-15",
        "additionalTests": []
      }
    },
    "trendAnalysis": {
      "overallTrend": "improving",
      "expectedDuration": "4 meses",
      "maintenanceSchedule": "trimestral"
    }
  }
}
```

#### Get Treatment History

```http
GET /progress/history/{patientId}
```

Retrieve comprehensive treatment history and progress analysis.

**Response:**

```json
{
  "success": true,
  "data": {
    "patientId": "patient-uuid",
    "treatmentHistory": [
      {
        "treatmentId": "treatment-uuid",
        "treatmentType": "toxina_botulinica",
        "startDate": "2024-01-15",
        "completedSessions": 1,
        "status": "completed",
        "efficacy": "excellent",
        "satisfaction": 90,
        "progressPhotos": [
          {
            "date": "2024-01-15",
            "beforeUrl": "https://storage.neonpro.com.br/before.jpg",
            "afterUrl": "https://storage.neonpro.com.br/after.jpg"
          }
        ]
      }
    ],
    "overallTrends": {
      "mostEffectiveTreatments": ["toxina_botulinica"],
      "treatmentFrequency": "biannual",
      "averageSatisfaction": 88
    },
    "recommendations": [
      "Manter protocolo atual com ajustes sazonais",
      "Considerar novos tratamentos para áreas não abordadas"
    ]
  }
}
```

### Outcome Prediction

#### Predict Treatment Outcomes

```http
POST /outcomes/predict
```

Predict treatment outcomes based on patient characteristics and treatment parameters.

**Request Body:**

```json
{
  "patientProfile": {
    "age": 35,
    "gender": "female",
    "skinType": "oleosa",
    "lifestyle": ["fumante", "exposicao_solar"],
    "geneticFactors": ["flacidez_familiar"]
  },
  "treatmentPlan": {
    "treatmentType": "toxina_botulinica",
    "dosage": 20,
    "areas": ["glabela", "frontal"],
    "frequency": "trimestral"
  },
  "predictionHorizon": "6_months"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "prediction": {
      "overallEfficacy": 0.87,
      "confidence": 0.92,
      "expectedResults": {
        "wrinkleReduction": "75-85%",
        "duration": "4-5 meses",
        "onset": "5-7 dias",
        "peakEffect": "14 dias"
      },
      "riskFactors": [
        {
          "factor": "tabagismo",
          "impact": "moderate",
          "description": "Pode reduzir duração dos efeitos em 15-20%"
        },
        {
          "factor": "exposicao_solar",
          "impact": "low",
          "description": "Recomendar proteção solar rigorosa"
        }
      ],
      "personalizedRecommendations": [
        "Considerar dosagem ligeiramente superior devido ao tabagismo",
        "Agendar acompanhamento mais frequente",
        "Reforçar importância da proteção solar"
      ],
      "alternativeApproaches": [
        {
          "approach": "combinar_com_preenchimento",
          "benefit": "Resultados mais abrangentes e duradouros",
          "suitability": "high"
        }
      ]
    },
    "safetyAssessment": {
      "overallRisk": "low",
      "monitoringRequired": false,
      "precautions": ["evitar_exposicao_solar_intensa"]
    }
  }
}
```

### AI Consultation

#### Clinical Consultation

```http
POST /consult
```

AI-powered clinical consultation for treatment questions and concerns.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Quais são os riscos da toxina botulínica para uma paciente de 35 anos com hipotireoidismo?"
    }
  ],
  "clinicalContext": {
    "patientId": "patient-uuid",
    "professionalId": "professional-uuid",
    "treatmentFocus": "toxina_botulinica",
    "consultationType": "risk_assessment"
  },
  "options": {
    "temperature": 0.3,
    "maxTokens": 1000,
    "includeEvidence": true,
    "includeReferences": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "consultation-uuid",
    "response": {
      "content": "Para uma paciente de 35 anos com hipotireoidismo controlado, a toxina botulínica é geralmente segura com algumas precauções específicas:\n\n**Riscos Específicos:**\n- Hipotireoidismo controlado não é contraindicação absoluta\n- Monitorar função tireoidiana antes do procedimento\n- Ajustar dosagem caso a paciente esteja em tratamento hormonal\n\n**Precauções Recomendadas:**\n1. Realizar exames de função tireoidiana recentes\n2. Consultar endocrinologista antes do procedimento\n3. Usar dosagem conservadora inicialmente\n4. Acompanhamento mais frequente\n\n**Evidências Científicas:**\nEstudos mostram que pacientes com hipotireoidismo controlado respondem bem ao tratamento, com perfil de segurança similar à população geral. No entanto, recomenda-se avaliação individualizada e monitoramento cuidadoso.",
      "references": [
        {
          "title": "Safety of Botulinum Toxin in Patients with Thyroid Disorders",
          "journal": "Journal of Cosmetic Dermatology",
          "year": 2023,
          "url": "https://doi.org/..."
        }
      ]
    },
    "clinicalNotes": [
      "Paciente requer avaliação endocrinológica prévia",
      "Dosagem inicial deve ser conservadora",
      "Monitoramento pós-procedimento recomendado"
    ],
    "safetyScore": 95,
    "evidenceLevel": "high"
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
    "message": "Dados da avaliação inválidos",
    "details": [
      {
        "field": "patientAssessment.age",
        "message": "Idade do paciente é obrigatória"
      }
    ],
    "timestamp": "2024-01-15T00:00:00Z",
    "requestId": "request-uuid"
  }
}
```

### AI Clinical Support-Specific Errors

```json
{
  "success": false,
  "error": {
    "code": "CONTRAINDICATION_DETECTED",
    "message": "Contraindicação grave identificada para o tratamento",
    "details": {
      "contraindication": "gravidez",
      "treatment": "toxina_botulinica",
      "severity": "high",
      "recommendation": "Procedimento contraindicado durante gravidez"
    },
    "clinicalContext": {
      "patientId": "patient-uuid",
      "treatmentType": "toxina_botulinica"
    }
  }
}
```

## Rate Limiting

### Standard Limits

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **API Keys**: 10,000 requests per hour

### AI Clinical Support Operations

- **Treatment Recommendations**: 50 requests per hour
- **Contraindication Analysis**: 100 requests per hour
- **Progress Tracking**: 200 requests per hour
- **AI Consultation**: 100 requests per hour

## Webhooks

### Treatment Events

```http
POST /webhooks/treatment-events
```

Receive real-time treatment event notifications.

**Event Payload:**

```json
{
  "event": "treatment.completed",
  "timestamp": "2024-01-15T00:00:00Z",
  "data": {
    "treatmentId": "treatment-uuid",
    "patientId": "patient-uuid",
    "professionalId": "professional-uuid",
    "treatmentType": "toxina_botulinica",
    "outcome": "successful",
    "nextFollowUp": "2024-02-15"
  }
}
```

### AI Insights

```http
POST /webhooks/ai-insights
```

Receive AI-generated insights and recommendations.

**Event Payload:**

```json
{
  "event": "ai.insight.generated",
  "timestamp": "2024-01-15T00:00:00Z",
  "data": {
    "insightType": "treatment_optimization",
    "patientId": "patient-uuid",
    "recommendation": "Ajustar dosagem baseado na resposta individual",
    "confidence": 0.85,
    "actionRequired": true
  }
}
```

## Implementation Examples

### React Frontend Integration

```typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { aiClinicalSupportAPI } from "@neonpro/ai-clinical-support";

interface TreatmentRecommendationRequest {
  patientAssessment: {
    age: number;
    gender: string;
    skinType: string;
    concerns: string[];
    medicalHistory: {
      pregnancy: boolean;
      breastfeeding: boolean;
      medications: string[];
    };
  };
  preferences: {
    downtimeTolerance: string;
    budgetRange: string;
  };
}

function TreatmentRecommendations() {
  const { mutate: getRecommendations, isPending } = useMutation({
    mutationFn: (data: TreatmentRecommendationRequest) =>
      aiClinicalSupportAPI.getRecommendations(data),
    onSuccess: (data) => {
      // Handle recommendations
    },
    onError: (error) => {
      // Handle error
    },
  });

  const handleSubmit = (formData: TreatmentRecommendationRequest) => {
    getRecommendations(formData);
  };

  return <RecommendationForm onSubmit={handleSubmit} />;
}

function ContraindicationAnalysis() {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["contraindication-analysis", "patient-uuid"],
    queryFn: () =>
      aiClinicalSupportAPI.analyzeContraindications({
        patientProfile: {
          patientId: "patient-uuid",
          medicalHistory: {
            pregnancy: false,
            medications: ["aspirina"],
          },
        },
        targetTreatments: ["toxina_botulinica", "acido_hialuronico"],
      }),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!analysis) return <div>Indisponível</div>;

  return <ContraindicationReport analysis={analysis.data} />;
}
```

### Backend Integration

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AIClinicalDecisionSupport } from "@neonpro/core-services";

const app = new Hono();
const aiService = new AIClinicalDecisionSupport();

const TreatmentRecommendationSchema = z.object({
  patientAssessment: z.object({
    patientId: z.string().uuid(),
    age: z.number().min(18).max(80),
    gender: z.enum(["male", "female", "other"]),
    skinType: z.string(),
    concerns: z.array(z.string()),
    medicalHistory: z.object({
      pregnancy: z.boolean(),
      breastfeeding: z.boolean(),
      medications: z.array(z.string()),
    }),
  }),
  preferences: z.object({
    downtimeTolerance: z.enum(["low", "medium", "high"]),
    budgetRange: z.enum(["low", "medium", "high"]),
  }),
});

// Generate treatment recommendations
app.post(
  "/recommendations",
  zValidator("json", TreatmentRecommendationSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = c.get("user");

    try {
      const recommendations = await aiService.generateTreatmentRecommendations({
        ...data,
        professionalId: user.id,
      });

      return c.json({ success: true, data: recommendations });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: "RECOMMENDATION_ERROR",
            message: "Erro ao gerar recomendações",
          },
        },
        500,
      );
    }
  }
);

// Analyze contraindications
app.post("/contraindications", async (c) => {
  const { patientProfile, targetTreatments } = await c.req.json();
  const user = c.get("user");

  try {
    const analysis = await aiService.analyzeContraindications({
      patientProfile,
      targetTreatments,
      professionalId: user.id,
    });

    return c.json({ success: true, data: analysis });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "CONTRAINDICATION_ERROR",
          message: "Erro ao analisar contraindicações",
        },
      },
      500,
    );
  }
});

// Track treatment progress
app.post("/progress/track", async (c) => {
  const { treatmentId, patientId, followUpData } = await c.req.json();
  const user = c.get("user");

  try {
    const progress = await aiService.trackTreatmentProgress({
      treatmentId,
      patientId,
      professionalId: user.id,
      followUpData,
    });

    return c.json({ success: true, data: progress });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "PROGRESS_TRACKING_ERROR",
          message: "Erro ao rastrear progresso",
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
import { AIClinicalSupportAPI } from "@neonpro/ai-clinical-support";

const api = new AIClinicalSupportAPI({
  apiKey: "your-api-key",
  baseUrl: "https://api.neonpro.com.br/v1",
});

// Get treatment recommendations
const recommendations = await api.getRecommendations({
  patientAssessment: {
    patientId: "patient-uuid",
    age: 35,
    gender: "female",
    skinType: "oleosa",
    concerns: ["rugas", "flacidez"],
    medicalHistory: {
      pregnancy: false,
      breastfeeding: false,
      medications: [],
    },
  },
  preferences: {
    downtimeTolerance: "low",
    budgetRange: "medium",
  },
});

// Analyze contraindications
const contraindications = await api.analyzeContraindications({
  patientProfile: {
    patientId: "patient-uuid",
    medicalHistory: {
      pregnancy: false,
      medications: ["aspirina"],
    },
  },
  targetTreatments: ["toxina_botulinica", "acido_hialuronico"],
});

// Track treatment progress
const progress = await api.trackProgress({
  treatmentId: "treatment-uuid",
  patientId: "patient-uuid",
  treatmentType: "toxina_botulinica",
  sessionNumber: 1,
  followUpData: {
    patientFeedback: {
      satisfaction: 8,
      painLevel: 2,
    },
    clinicalAssessment: {
      efficacy: "excelente",
      symmetry: "otima",
    },
  },
});

// Predict treatment outcomes
const outcomes = await api.predictOutcomes({
  patientProfile: {
    age: 35,
    gender: "female",
    skinType: "oleosa",
    lifestyle: ["fumante"],
  },
  treatmentPlan: {
    treatmentType: "toxina_botulinica",
    dosage: 20,
    areas: ["glabela", "frontal"],
  },
  predictionHorizon: "6_months",
});
```

## Data Models

### TreatmentRecommendation

```typescript
interface TreatmentRecommendation {
  treatment: string;
  confidence: number;
  reasoning: string;
  expectedResults: string;
  sessions: number;
  duration: number;
  priceRange: string;
  recovery: string;
  contraindications: string[];
  personalizedNotes: string[];
}
```

### ContraindicationAnalysis

```typescript
interface ContraindicationAnalysis {
  contraindicated: boolean;
  warnings: string[];
  precautions: string[];
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  alternatives?: string[];
}
```

### TreatmentProgress

```typescript
interface TreatmentProgress {
  currentStatus: string;
  progressPercentage: number;
  efficacyScore: number;
  satisfactionScore: number;
  insights: string[];
  recommendations: string[];
  nextSteps: {
    nextSession?: string;
    followUpDate?: string;
    additionalTests?: string[];
  };
}
```

## Support

### Documentation

- [API Reference](https://docs.neonpro.com.br/api/ai-clinical-support)
- [Treatment Guidelines](https://docs.neonpro.com.br/guides/treatment-guidelines)
- [Safety Protocols](https://docs.neonpro.com.br/guides/safety-protocols)
- [Clinical Evidence](https://docs.neonpro.com.br/evidence)

### Contact

- **API Support**: api-support@neonpro.com.br
- **Clinical Support**: clinical-support@neonpro.com.br
- **Technical Support**: tech-support@neonpro.com.br
- **Compliance Questions**: compliance@neonpro.com.br

### Status

- **API Status**: https://status.neonpro.com.br
- **Maintenance Schedule**: https://status.neonpro.com.br/maintenance

## Changelog

### v1.0.0 (2024-01-15)

- Initial AI clinical decision support API release
- Treatment recommendation engine
- Contraindication analysis system
- Progress monitoring capabilities
- Outcome prediction algorithms
- AI-powered clinical consultation

### v1.1.0 (2024-02-01)

- Enhanced recommendation accuracy with larger training dataset
- Improved contraindication detection for complex medical histories
- Added support for more aesthetic treatment types
- Enhanced progress tracking with image analysis
- Real-time clinical consultation improvements

---

**Focus**: AI-powered clinical decision support for aesthetic treatments  
**Compliance**: LGPD, CFM, COREN, CFF, CNEP compliant  
**Target**: Healthcare professionals and aesthetic clinics  
**Version**: 1.1.0 - Production Ready  
**Last Updated**: 2025-09-23  
**Next Review**: 2025-12-23