---
title: "Aesthetic Analysis API"
last_updated: 2025-09-24
form: reference
tags: [aesthetic, analysis, ai, skin, treatments]
priority: MEDIUM
related:
  - ./AGENTS.md
  - ./ai-agent-essentials.md
---

# Aesthetic Analysis API — AI-Powered Skin Analysis

## Core Endpoints

### Skin Analysis

```bash
POST /api/aesthetic/analyze/skin        # Analyze skin condition
POST /api/aesthetic/analyze/compare     # Before/after comparison
GET  /api/aesthetic/analysis/:id        # Get analysis results
```

### Treatment Recommendations

```bash
POST /api/aesthetic/recommend           # Get treatment recommendations
GET  /api/aesthetic/treatments          # Available treatments
POST /api/aesthetic/treatment/plan      # Create treatment plan
```

## Implementation Examples

### Skin Analysis

```typescript
interface SkinAnalysisRequest {
  patientId: string;
  imageUrl: string;
  analysisType: 'full' | 'acne' | 'aging' | 'pigmentation';
  bodyArea: 'face' | 'neck' | 'hands' | 'body';
  lighting: 'natural' | 'studio' | 'clinical';
}

const analysis = await fetch('/api/aesthetic/analyze/skin', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    patientId: 'patient_123',
    imageUrl: 'https://storage.neonpro.com/images/patient_123_face.jpg',
    analysisType: 'full',
    bodyArea: 'face',
    lighting: 'clinical',
  }),
});

// Response
interface SkinAnalysisResult {
  analysisId: string;
  skinMetrics: {
    hydration: number; // 0-100
    oiliness: number; // 0-100
    elasticity: number; // 0-100
    pigmentation: number; // 0-100
    wrinkles: number; // 0-100
    poreSize: number; // 0-100
    acneScore: number; // 0-100
    overallHealth: number; // 0-100
  };
  concerns: string[];
  recommendations: TreatmentRecommendation[];
  confidence: number;
}
```

### Treatment Recommendations

```typescript
interface TreatmentRecommendation {
  treatmentId: string;
  name: string;
  type: 'laser' | 'chemical_peel' | 'botox' | 'filler' | 'skincare';
  priority: 'high' | 'medium' | 'low';
  expectedResults: string[];
  duration: string;
  sessions: number;
  interval: string;
  contraindications: string[];
  cost: {
    min: number;
    max: number;
    currency: 'BRL';
  };
}

const recommendations = await fetch('/api/aesthetic/recommend', {
  method: 'POST',
  body: JSON.stringify({
    analysisId: 'analysis_123',
    patientAge: 35,
    skinType: 'mixed',
    concerns: ['wrinkles', 'pigmentation'],
    budget: 'medium',
  }),
});
```

### Before/After Comparison

```typescript
const comparison = await fetch('/api/aesthetic/analyze/compare', {
  method: 'POST',
  body: JSON.stringify({
    patientId: 'patient_123',
    beforeImageUrl: 'before.jpg',
    afterImageUrl: 'after.jpg',
    treatmentId: 'treatment_456',
    timeInterval: '3_months',
  }),
});

// Response
interface ComparisonResult {
  improvementScore: number; // 0-100
  metrics: {
    wrinkleReduction: number;
    pigmentationImprovement: number;
    skinTextureImprovement: number;
    overallImprovement: number;
  };
  visualChanges: string[];
  recommendedNextSteps: string[];
}
```

## Available Treatments

### Facial Treatments

- **Botox**: Wrinkle reduction, prevention
- **Dermal Fillers**: Volume restoration, contouring
- **Chemical Peels**: Skin texture, pigmentation
- **Laser Therapy**: Resurfacing, hair removal
- **Microneedling**: Collagen stimulation
- **Hydrafacial**: Deep cleansing, hydration

### Body Treatments

- **Body Contouring**: Fat reduction, sculpting
- **Cellulite Treatment**: Texture improvement
- **Stretch Mark Treatment**: Scar reduction
- **Skin Tightening**: Firmness improvement

## AI Analysis Features

### Computer Vision

- Automatic skin concern detection
- Facial landmark recognition
- Symmetry analysis
- Color analysis and correction
- Texture pattern recognition

### Machine Learning

- Treatment outcome prediction
- Personalized recommendations
- Progress tracking over time
- Trend analysis
- Risk assessment

## Quality Assurance

### Image Requirements

- **Resolution**: Minimum 1920x1080
- **Format**: JPEG, PNG
- **Lighting**: Consistent clinical lighting
- **Positioning**: Standardized angles
- **Background**: Neutral, uniform

### Validation

- Professional review required
- AI confidence thresholds
- Second opinion protocols
- Patient consent for analysis
- LGPD compliance for images

## Integration with Booking

### Treatment Scheduling

```bash
POST /api/aesthetic/schedule            # Schedule recommended treatment
GET  /api/aesthetic/availability        # Check availability
POST /api/aesthetic/consultation        # Book consultation
```

### Professional Matching

```bash
GET  /api/aesthetic/professionals       # List qualified professionals
POST /api/aesthetic/match               # Match patient to professional
```

## See Also

- [API Control Hub](./AGENTS.md)
- [AI Agent Essentials](./ai-agent-essentials.md)
- [Core API Reference](./core-api.md)
