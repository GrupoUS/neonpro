# @neonpro/ai-services

AI provider management and clinical decision support for the NeonPro healthcare platform.

## Features

- **Multi-Provider Support**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Clinical Decision Support**: AI-powered medical assistance and recommendations
- **Medical Analysis**: Treatment analysis, risk assessment, and follow-up care suggestions
- **Patient Education**: Generated educational content for different reading levels
- **Healthcare-Specific**: Built for medical contexts with proper disclaimers and safeguards
- **Streaming Support**: Real-time responses for interactive applications
- **Vision Analysis**: Image analysis for medical imaging and documentation

## Installation

```bash
# Install the package
bun add @neonpro/ai-services @neonpro/types @neonpro/shared @neonpro/healthcare-core

# Install AI provider dependencies
bun add @anthropic-ai/sdk @google/generative-ai openai ai zod
```

## Usage

### Basic AI Provider Usage

```typescript
import { AnthropicProvider, ProviderFactory } from '@neonpro/ai-services';

// Create a provider
const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 4000,
});

// Generate text completion
const response = await provider.generateCompletion(
  'What are the common symptoms of influenza?',
  {
    temperature: 0.3,
    maxTokens: 1000,
    systemPrompt: 'You are a medical AI assistant providing general health information.'
  }
);

console.log(response.text);
```

### Clinical Decision Support

```typescript
import { ClinicalAIService } from '@neonpro/ai-services';

const clinicalAI = new ClinicalAIService(provider);

// Generate pre-assessment based on symptoms
const assessment = await clinicalAI.generatePreAssessment(
  ['fever', 'cough', 'fatigue'],
  {
    age: 35,
    gender: 'female',
    medicalHistory: ['asthma'],
    currentMedications: ['albuterol inhaler'],
    allergies: ['penicillin']
  }
);

console.log('Possible explanations:', assessment.possibleExplanations);
console.log('Recommendations:', assessment.recommendations);

// Analyze treatment options
const treatmentAnalysis = await clinicalAI.analyzeTreatmentOptions(
  'moderate acne',
  {
    age: 25,
    gender: 'male',
    conditions: ['acne vulgaris'],
    currentMedications: [],
    previousTreatments: ['topical benzoyl peroxide']
  }
);

console.log('Conventional treatments:', treatmentAnalysis.conventionalTreatments);
```

### Patient Education Generation

```typescript
// Generate patient education content
const education = await clinicalAI.generatePatientEducation(
  'managing type 2 diabetes',
  'basic',
  'pt-BR'
);

console.log('Education content:', education.content);
```

### Risk Assessment

```typescript
// Assess procedure risks
const riskAssessment = await clinicalAI.assessProcedureRisk(
  'rhinoplasty',
  {
    age: 28,
    gender: 'female',
    bmi: 22.5,
    conditions: ['seasonal allergies'],
    currentMedications: ['loratadine']
  }
);

console.log('Common risks:', riskAssessment.commonRisks);
console.log('Pre-procedure considerations:', riskAssessment.preProcedure);
```

### Provider Factory

```typescript
import { ProviderFactory } from '@neonpro/ai-services';

// Register providers
ProviderFactory.registerProvider('anthropic', AnthropicProvider);
ProviderFactory.registerProvider('openai', OpenAIProvider);
ProviderFactory.registerProvider('google', GoogleProvider);

// Create provider from configuration
const provider = ProviderFactory.createProvider({
  name: 'anthropic',
  config: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-sonnet-20240229'
  }
});
```

### Streaming Responses

```typescript
// Generate streaming completion
const stream = provider.generateCompletionStream(
  'Explain the benefits of regular exercise...',
  { temperature: 0.5 }
);

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
  if (chunk.isComplete) {
    console.log('\nStream completed');
  }
}
```

### Image Analysis

```typescript
// Analyze medical images (when supported by provider)
if (provider.supportsVision) {
  const analysis = await provider.analyzeImage(
    'https://example.com/rash-image.jpg',
    'What does this skin condition appear to be?',
    { detail: 'high' }
  );
  
  console.log('Analysis:', analysis.analysis);
}
```

## Configuration

### Provider Configuration

```typescript
const config = {
  apiKey: 'your-api-key',
  model: 'model-name',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  baseUrl: 'https://api.example.com' // Optional custom endpoint
};
```

### Supported Models

**Anthropic Claude:**
- `claude-3-opus-20240229` - Most capable model
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fastest responses

**OpenAI GPT:**
- `gpt-4-turbo` - Latest GPT-4 model
- `gpt-4` - Standard GPT-4
- `gpt-3.5-turbo` - Fast and cost-effective

**Google Gemini:**
- `gemini-pro` - General purpose model
- `gemini-pro-vision` - Vision-capable model

## Healthcare Compliance

This package includes built-in safeguards for healthcare AI:

- **Medical Disclaimers**: AI-generated content includes clear disclaimers
- **Professional Guidance**: Always recommends consulting healthcare professionals
- **Privacy Protection**: No patient data is stored or used for training
- **Evidence-Based**: Responses based on medical literature and guidelines
- **Risk Awareness**: Includes risk assessment and contraindication information

## Development

### Testing

```bash
# Run all tests
bun test

# Run specific test suites
bun run test-clinical-ai

# Run with coverage
bun run test:coverage
```

### Building

```bash
# Build the package
bun run build

# Type checking
bun run type-check

# Linting
bun run lint
```

## Security Considerations

- API keys should be stored securely and never committed to version control
- Rate limits and quotas should be monitored
- AI-generated content should be reviewed by healthcare professionals
- Patient privacy must be maintained at all times

## Dependencies

- **@neonpro/types**: Shared TypeScript types
- **@neonpro/shared**: Common utilities and logging
- **@neonpro/healthcare-core**: Healthcare business logic
- **AI Provider SDKs**: Anthropic, OpenAI, Google
- **Validation**: Zod for schema validation

## License

MIT License - see LICENSE file for details.