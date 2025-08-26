# NeonPro Healthcare AI Services Integration Guide

This comprehensive guide provides examples and best practices for integrating with the NeonPro
Healthcare AI Services API.

## Table of Contents

- [Authentication](#authentication)
- [SDK Examples](#sdk-examples)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [Python](#python)
  - [Java](#java)
  - [C# .NET](#c-net)
- [Healthcare Compliance](#healthcare-compliance)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Best Practices](#best-practices)

## Authentication

All API requests require JWT Bearer token authentication. Here's how to authenticate:

### Getting an Access Token

```bash
curl -X POST "https://api.neonpro.healthcare/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password",
    "scope": "ai-services"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "refresh_token": "refresh-token-here",
  "scope": "ai-services"
}
```

## SDK Examples

### JavaScript/TypeScript

#### Installation

```bash
npm install @neonpro/healthcare-ai-sdk
```

#### Basic Usage

```typescript
import { NeonProHealthcareAI } from '@neonpro/healthcare-ai-sdk';

// Initialize the client
const client = new NeonProHealthcareAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.neonpro.healthcare',
  timeout: 30000,
});

// Create a chat session
async function createChatSession(userId: string) {
  try {
    const session = await client.universalChat.createSession({
      user_id: userId,
      language: 'pt-BR',
      context: {
        specialty: 'cardiology',
        clinic_id: 'clinic-001',
      },
      consent: {
        data_processing_consent: true,
        ai_interaction_consent: true,
        anonymized_analytics_consent: true,
      },
    });

    console.log('Session created:', session.data.session_id);
    return session.data.session_id;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

// Send a message
async function sendMessage(sessionId: string, message: string) {
  try {
    const response = await client.universalChat.sendMessage({
      session_id: sessionId,
      message: message,
      context: {
        urgency_level: 'medium',
      },
    });

    console.log('AI Response:', response.data.ai_response);

    // Check for emergency escalation
    if (response.data.analysis.emergency_escalation) {
      console.warn('EMERGENCY: Escalation required!');
      await handleEmergencyEscalation(sessionId, response.data);
    }

    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// No-show prediction example
async function predictNoShow(patientId: string, appointmentDetails: any) {
  try {
    const prediction = await client.predictiveAnalytics.predictNoShow({
      patient_id: patientId,
      appointment_details: appointmentDetails,
      patient_history: {
        total_appointments: 10,
        no_shows: 1,
        cancellations: 0,
        last_appointment_date: '2024-01-10',
        days_since_last_visit: 15,
      },
    });

    console.log(`No-show probability: ${prediction.data.no_show_probability}`);
    console.log(`Risk category: ${prediction.data.risk_category}`);

    // Implement interventions based on prediction
    if (prediction.data.risk_category === 'high') {
      await implementNoShowInterventions(patientId, prediction.data.recommendations);
    }

    return prediction.data;
  } catch (error) {
    console.error('Prediction failed:', error);
    throw error;
  }
}

// Healthcare compliance validation
async function validateLGPDCompliance(serviceOperation: any) {
  try {
    const validation = await client.compliance.validateLGPD({
      service_name: 'universal-chat',
      operation_data: serviceOperation,
      validation_context: {
        user_consent_verified: true,
        data_minimization_applied: true,
        purpose_limitation_respected: true,
        retention_period_defined: true,
        cross_border_transfer: false,
      },
    });

    if (!validation.data.compliance_status.lgpd_compliant) {
      console.error('LGPD Compliance violation detected!');
      await handleComplianceViolation(validation.data);
    }

    return validation.data;
  } catch (error) {
    console.error('Compliance validation failed:', error);
    throw error;
  }
}

// Real-time monitoring
async function monitorServiceHealth() {
  try {
    const healthStatus = await client.monitoring.getServicesHealth();

    healthStatus.data.forEach(service => {
      console.log(`${service.service}: ${service.status} (${service.uptime_percentage}% uptime)`);

      if (service.status !== 'healthy') {
        console.warn(`Service ${service.service} is ${service.status}`);
        // Implement alerting logic
      }
    });

    return healthStatus.data;
  } catch (error) {
    console.error('Health monitoring failed:', error);
    throw error;
  }
}
```

#### Advanced Features

```typescript
// Feature flag evaluation
async function checkFeatureFlag(flagName: string, userId: string) {
  const flagResult = await client.featureManagement.evaluateFlag({
    flag_name: flagName,
    context: {
      user_id: userId,
      user_role: 'patient',
      clinic_id: 'clinic-001',
    },
  });

  return flagResult.data.enabled;
}

// Appointment optimization
async function optimizeAppointments(requests: any[]) {
  const optimization = await client.appointmentManagement.optimize({
    requests: requests,
    optimization_goals: {
      maximize_utilization: 0.4,
      minimize_wait_times: 0.3,
      maximize_satisfaction: 0.3,
    },
    constraints: {
      available_providers: ['provider-123', 'provider-456'],
      business_hours: {
        start_time: '08:00',
        end_time: '18:00',
      },
    },
  });

  console.log(`Scheduled ${optimization.data.optimized_appointments.length} appointments`);
  console.log(`Utilization rate: ${optimization.data.optimization_summary.utilization_rate}`);

  return optimization.data;
}
```

### Python

#### Installation

```bash
pip install neonpro-healthcare-ai
```

#### Basic Usage

```python
from neonpro_healthcare_ai import NeonProHealthcareAI
import asyncio
import logging

# Configure logging for healthcare compliance
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize client
client = NeonProHealthcareAI(
    api_key='your-api-key',
    base_url='https://api.neonpro.healthcare',
    timeout=30
)

async def create_chat_session(user_id: str) -> str:
    """Create a new AI chat session with healthcare compliance."""
    try:
        response = await client.universal_chat.create_session(
            user_id=user_id,
            language='pt-BR',
            context={
                'specialty': 'cardiology',
                'clinic_id': 'clinic-001'
            },
            consent={
                'data_processing_consent': True,
                'ai_interaction_consent': True,
                'anonymized_analytics_consent': True
            }
        )
        
        session_id = response.data['session_id']
        logging.info(f"Chat session created: {session_id}")
        
        return session_id
    except Exception as e:
        logging.error(f"Failed to create chat session: {e}")
        raise

async def send_message(session_id: str, message: str) -> dict:
    """Send a message and handle AI response."""
    try:
        response = await client.universal_chat.send_message(
            session_id=session_id,
            message=message,
            context={
                'urgency_level': 'medium',
                'symptoms': ['chest_pain'] if 'dor no peito' in message.lower() else []
            }
        )
        
        ai_response = response.data['ai_response']
        analysis = response.data['analysis']
        
        logging.info(f"AI Response: {ai_response}")
        
        # Handle emergency escalation
        if analysis.get('emergency_escalation'):
            logging.critical("EMERGENCY ESCALATION REQUIRED")
            await handle_emergency_escalation(session_id, response.data)
        
        return response.data
    except Exception as e:
        logging.error(f"Failed to send message: {e}")
        raise

async def predict_no_show(patient_id: str, appointment_details: dict) -> dict:
    """Predict appointment no-show probability."""
    try:
        prediction = await client.predictive_analytics.predict_no_show(
            patient_id=patient_id,
            appointment_details=appointment_details,
            patient_history={
                'total_appointments': 10,
                'no_shows': 1,
                'cancellations': 0,
                'last_appointment_date': '2024-01-10',
                'days_since_last_visit': 15
            }
        )
        
        probability = prediction.data['no_show_probability']
        risk_category = prediction.data['risk_category']
        
        logging.info(f"No-show prediction: {probability:.2%} ({risk_category} risk)")
        
        # Implement interventions for high-risk patients
        if risk_category == 'high':
            await implement_interventions(patient_id, prediction.data['recommendations'])
        
        return prediction.data
    except Exception as e:
        logging.error(f"No-show prediction failed: {e}")
        raise

async def validate_lgpd_compliance(service_name: str, operation_data: dict) -> dict:
    """Validate LGPD compliance for healthcare operations."""
    try:
        validation = await client.compliance.validate_lgpd(
            service_name=service_name,
            operation_data=operation_data,
            validation_context={
                'user_consent_verified': True,
                'data_minimization_applied': True,
                'purpose_limitation_respected': True,
                'retention_period_defined': True,
                'cross_border_transfer': False
            }
        )
        
        compliance_status = validation.data['compliance_status']
        
        if not compliance_status['lgpd_compliant']:
            logging.error("LGPD COMPLIANCE VIOLATION DETECTED")
            await handle_compliance_violation(validation.data)
        else:
            logging.info(f"LGPD compliant (score: {compliance_status['compliance_score']:.2%})")
        
        return validation.data
    except Exception as e:
        logging.error(f"LGPD validation failed: {e}")
        raise

# Healthcare workflow example
async def healthcare_consultation_workflow():
    """Complete healthcare consultation workflow with AI assistance."""
    try:
        # Step 1: Create patient session
        patient_id = "patient-12345"
        session_id = await create_chat_session(patient_id)
        
        # Step 2: Patient describes symptoms
        message = "Estou sentindo dores no peito há 3 dias, principalmente quando faço esforço"
        response = await send_message(session_id, message)
        
        # Step 3: Validate compliance
        await validate_lgpd_compliance('universal-chat', {
            'data_types': ['health_data', 'conversation_history'],
            'processing_purpose': 'healthcare_consultation_assistance',
            'data_subjects': [{'subject_id': patient_id, 'subject_type': 'patient'}]
        })
        
        # Step 4: Schedule follow-up if needed
        if response['analysis']['urgency_detected'] in ['high', 'emergency']:
            appointment_details = {
                'appointment_datetime': '2024-01-22T14:30:00Z',
                'appointment_type': 'consultation',
                'healthcare_provider_id': 'provider-123',
                'specialty': 'cardiology',
                'estimated_duration_minutes': 30
            }
            
            # Predict no-show probability
            no_show_prediction = await predict_no_show(patient_id, appointment_details)
            
            logging.info(f"Consultation workflow completed for patient {patient_id}")
        
    except Exception as e:
        logging.error(f"Healthcare workflow failed: {e}")
        raise

# Run the workflow
if __name__ == "__main__":
    asyncio.run(healthcare_consultation_workflow())
```

### Java

#### Maven Dependency

```xml
<dependency>
    <groupId>com.neonpro</groupId>
    <artifactId>healthcare-ai-sdk</artifactId>
    <version>2.0.0</version>
</dependency>
```

#### Basic Usage

```java
package com.example.healthcare;

import com.neonpro.healthcare.ai.NeonProHealthcareAI;
import com.neonpro.healthcare.ai.models.*;
import com.neonpro.healthcare.ai.exceptions.NeonProException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class HealthcareAIService {
    private static final Logger logger = LoggerFactory.getLogger(HealthcareAIService.class);
    private final NeonProHealthcareAI client;
    
    public HealthcareAIService(String apiKey) {
        this.client = NeonProHealthcareAI.builder()
            .apiKey(apiKey)
            .baseUrl("https://api.neonpro.healthcare")
            .timeout(Duration.ofSeconds(30))
            .build();
    }
    
    public CompletableFuture<String> createChatSession(String userId) {
        logger.info("Creating chat session for user: {}", userId);
        
        CreateSessionRequest request = CreateSessionRequest.builder()
            .userId(userId)
            .language("pt-BR")
            .context(SessionContext.builder()
                .specialty("cardiology")
                .clinicId("clinic-001")
                .build())
            .consent(ConsentData.builder()
                .dataProcessingConsent(true)
                .aiInteractionConsent(true)
                .anonymizedAnalyticsConsent(true)
                .build())
            .build();
            
        return client.universalChat().createSession(request)
            .thenApply(response -> {
                String sessionId = response.getData().getSessionId();
                logger.info("Chat session created: {}", sessionId);
                return sessionId;
            })
            .exceptionally(throwable -> {
                logger.error("Failed to create chat session", throwable);
                throw new RuntimeException(throwable);
            });
    }
    
    public CompletableFuture<MessageResponse> sendMessage(String sessionId, String message) {
        logger.info("Sending message to session: {}", sessionId);
        
        SendMessageRequest request = SendMessageRequest.builder()
            .sessionId(sessionId)
            .message(message)
            .context(MessageContext.builder()
                .urgencyLevel("medium")
                .build())
            .build();
            
        return client.universalChat().sendMessage(request)
            .thenApply(response -> {
                MessageResponseData data = response.getData();
                logger.info("AI Response: {}", data.getAiResponse());
                
                // Handle emergency escalation
                if (data.getAnalysis().isEmergencyEscalation()) {
                    logger.warn("EMERGENCY ESCALATION REQUIRED");
                    handleEmergencyEscalation(sessionId, data);
                }
                
                return response;
            })
            .exceptionally(throwable -> {
                logger.error("Failed to send message", throwable);
                throw new RuntimeException(throwable);
            });
    }
    
    public CompletableFuture<NoShowPrediction> predictNoShow(String patientId, AppointmentDetails appointmentDetails) {
        logger.info("Predicting no-show for patient: {}", patientId);
        
        PredictNoShowRequest request = PredictNoShowRequest.builder()
            .patientId(patientId)
            .appointmentDetails(appointmentDetails)
            .patientHistory(PatientHistory.builder()
                .totalAppointments(10)
                .noShows(1)
                .cancellations(0)
                .lastAppointmentDate("2024-01-10")
                .daysSinceLastVisit(15)
                .build())
            .build();
            
        return client.predictiveAnalytics().predictNoShow(request)
            .thenApply(response -> {
                NoShowPrediction prediction = response.getData();
                logger.info("No-show prediction: {}% ({})", 
                    prediction.getNoShowProbability() * 100, 
                    prediction.getRiskCategory());
                    
                // Implement interventions for high-risk patients
                if ("high".equals(prediction.getRiskCategory())) {
                    implementInterventions(patientId, prediction.getRecommendations());
                }
                
                return prediction;
            })
            .exceptionally(throwable -> {
                logger.error("No-show prediction failed", throwable);
                throw new RuntimeException(throwable);
            });
    }
    
    public CompletableFuture<LGPDValidationResult> validateLGPDCompliance(String serviceName, OperationData operationData) {
        logger.info("Validating LGPD compliance for service: {}", serviceName);
        
        ValidateLGPDRequest request = ValidateLGPDRequest.builder()
            .serviceName(serviceName)
            .operationData(operationData)
            .validationContext(ValidationContext.builder()
                .userConsentVerified(true)
                .dataMinimizationApplied(true)
                .purposeLimitationRespected(true)
                .retentionPeriodDefined(true)
                .crossBorderTransfer(false)
                .build())
            .build();
            
        return client.compliance().validateLGPD(request)
            .thenApply(response -> {
                LGPDValidationResult result = response.getData();
                
                if (!result.getComplianceStatus().isLgpdCompliant()) {
                    logger.error("LGPD COMPLIANCE VIOLATION DETECTED");
                    handleComplianceViolation(result);
                } else {
                    logger.info("LGPD compliant (score: {}%)", 
                        result.getComplianceStatus().getComplianceScore() * 100);
                }
                
                return result;
            })
            .exceptionally(throwable -> {
                logger.error("LGPD validation failed", throwable);
                throw new RuntimeException(throwable);
            });
    }
    
    private void handleEmergencyEscalation(String sessionId, MessageResponseData data) {
        // Implement emergency escalation logic
        logger.critical("Emergency escalation for session: {}", sessionId);
        // Send alerts, notify medical staff, etc.
    }
    
    private void implementInterventions(String patientId, List<Recommendation> recommendations) {
        // Implement no-show intervention logic
        recommendations.forEach(rec -> {
            logger.info("Implementing intervention for patient {}: {}", patientId, rec.getInterventionType());
            // Send reminders, make calls, etc.
        });
    }
    
    private void handleComplianceViolation(LGPDValidationResult result) {
        // Handle compliance violations
        logger.error("Compliance violation: {}", result.getComplianceDetails());
        // Notify compliance team, generate reports, etc.
    }
}
```

### C# .NET

#### NuGet Package

```xml
<PackageReference Include="NeonPro.Healthcare.AI" Version="2.0.0" />
```

#### Basic Usage

```csharp
using NeonPro.Healthcare.AI;
using NeonPro.Healthcare.AI.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Healthcare.Example
{
    public class HealthcareAIService
    {
        private readonly INeonProHealthcareAI _client;
        private readonly ILogger<HealthcareAIService> _logger;
        
        public HealthcareAIService(INeonProHealthcareAI client, ILogger<HealthcareAIService> logger)
        {
            _client = client;
            _logger = logger;
        }
        
        public async Task<string> CreateChatSessionAsync(string userId)
        {
            _logger.LogInformation("Creating chat session for user: {UserId}", userId);
            
            var request = new CreateSessionRequest
            {
                UserId = userId,
                Language = "pt-BR",
                Context = new SessionContext
                {
                    Specialty = "cardiology",
                    ClinicId = "clinic-001"
                },
                Consent = new ConsentData
                {
                    DataProcessingConsent = true,
                    AiInteractionConsent = true,
                    AnonymizedAnalyticsConsent = true
                }
            };
            
            try
            {
                var response = await _client.UniversalChat.CreateSessionAsync(request);
                var sessionId = response.Data.SessionId;
                
                _logger.LogInformation("Chat session created: {SessionId}", sessionId);
                return sessionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create chat session");
                throw;
            }
        }
        
        public async Task<MessageResponse> SendMessageAsync(string sessionId, string message)
        {
            _logger.LogInformation("Sending message to session: {SessionId}", sessionId);
            
            var request = new SendMessageRequest
            {
                SessionId = sessionId,
                Message = message,
                Context = new MessageContext
                {
                    UrgencyLevel = "medium"
                }
            };
            
            try
            {
                var response = await _client.UniversalChat.SendMessageAsync(request);
                var data = response.Data;
                
                _logger.LogInformation("AI Response: {Response}", data.AiResponse);
                
                // Handle emergency escalation
                if (data.Analysis.EmergencyEscalation)
                {
                    _logger.LogWarning("EMERGENCY ESCALATION REQUIRED");
                    await HandleEmergencyEscalationAsync(sessionId, data);
                }
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send message");
                throw;
            }
        }
        
        public async Task<NoShowPrediction> PredictNoShowAsync(string patientId, AppointmentDetails appointmentDetails)
        {
            _logger.LogInformation("Predicting no-show for patient: {PatientId}", patientId);
            
            var request = new PredictNoShowRequest
            {
                PatientId = patientId,
                AppointmentDetails = appointmentDetails,
                PatientHistory = new PatientHistory
                {
                    TotalAppointments = 10,
                    NoShows = 1,
                    Cancellations = 0,
                    LastAppointmentDate = "2024-01-10",
                    DaysSinceLastVisit = 15
                }
            };
            
            try
            {
                var response = await _client.PredictiveAnalytics.PredictNoShowAsync(request);
                var prediction = response.Data;
                
                _logger.LogInformation("No-show prediction: {Probability}% ({RiskCategory})", 
                    prediction.NoShowProbability * 100, 
                    prediction.RiskCategory);
                
                // Implement interventions for high-risk patients
                if (prediction.RiskCategory == "high")
                {
                    await ImplementInterventionsAsync(patientId, prediction.Recommendations);
                }
                
                return prediction;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "No-show prediction failed");
                throw;
            }
        }
        
        public async Task<LGPDValidationResult> ValidateLGPDComplianceAsync(string serviceName, OperationData operationData)
        {
            _logger.LogInformation("Validating LGPD compliance for service: {ServiceName}", serviceName);
            
            var request = new ValidateLGPDRequest
            {
                ServiceName = serviceName,
                OperationData = operationData,
                ValidationContext = new ValidationContext
                {
                    UserConsentVerified = true,
                    DataMinimizationApplied = true,
                    PurposeLimitationRespected = true,
                    RetentionPeriodDefined = true,
                    CrossBorderTransfer = false
                }
            };
            
            try
            {
                var response = await _client.Compliance.ValidateLGPDAsync(request);
                var result = response.Data;
                
                if (!result.ComplianceStatus.LgpdCompliant)
                {
                    _logger.LogError("LGPD COMPLIANCE VIOLATION DETECTED");
                    await HandleComplianceViolationAsync(result);
                }
                else
                {
                    _logger.LogInformation("LGPD compliant (score: {Score}%)", 
                        result.ComplianceStatus.ComplianceScore * 100);
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LGPD validation failed");
                throw;
            }
        }
        
        private async Task HandleEmergencyEscalationAsync(string sessionId, MessageResponseData data)
        {
            // Implement emergency escalation logic
            _logger.LogCritical("Emergency escalation for session: {SessionId}", sessionId);
            // Send alerts, notify medical staff, etc.
        }
        
        private async Task ImplementInterventionsAsync(string patientId, IList<Recommendation> recommendations)
        {
            // Implement no-show intervention logic
            foreach (var recommendation in recommendations)
            {
                _logger.LogInformation("Implementing intervention for patient {PatientId}: {InterventionType}", 
                    patientId, recommendation.InterventionType);
                // Send reminders, make calls, etc.
            }
        }
        
        private async Task HandleComplianceViolationAsync(LGPDValidationResult result)
        {
            // Handle compliance violations
            _logger.LogError("Compliance violation: {Details}", result.ComplianceDetails);
            // Notify compliance team, generate reports, etc.
        }
    }
    
    // Dependency Injection Configuration
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddNeonProHealthcareAI(options =>
            {
                options.ApiKey = Configuration["NeonPro:ApiKey"];
                options.BaseUrl = "https://api.neonpro.healthcare";
                options.Timeout = TimeSpan.FromSeconds(30);
            });
            
            services.AddTransient<HealthcareAIService>();
        }
    }
}
```

## Healthcare Compliance

### LGPD (Lei Geral de Proteção de Dados) Compliance

The NeonPro Healthcare AI Services are designed to be fully compliant with Brazil's LGPD. Here are
key considerations:

#### Data Processing Consent

```typescript
// Always verify consent before processing personal data
const consentData = {
  data_processing_consent: true, // Required for LGPD
  ai_interaction_consent: true, // Required for AI processing
  anonymized_analytics_consent: false, // Optional for analytics
};

// Include consent in all API calls
const session = await client.universalChat.createSession({
  user_id: userId,
  consent: consentData,
  // ... other parameters
});
```

#### Data Minimization

```typescript
// Only collect and process necessary data
const context = {
  specialty: 'cardiology', // Necessary for AI context
  clinic_id: 'clinic-001', // Necessary for routing
  // Do NOT include unnecessary personal identifiers
};
```

#### Audit Trail

```typescript
// All API calls automatically generate audit trails
const response = await client.universalChat.sendMessage({
  session_id: sessionId,
  message: message,
});

// Access audit information
console.log('Audit Trail ID:', response.metadata.audit_trail_id);
```

### ANVISA Compliance

For medical device and software compliance:

```typescript
// Validate AI recommendations don't constitute medical diagnosis
const response = await client.universalChat.sendMessage({
  session_id: sessionId,
  message: 'Estou sentindo dores no peito',
  context: {
    medical_advice_disclaimer: true, // Ensures proper disclaimers
    professional_oversight_required: true,
  },
});

// Check compliance status
if (!response.data.compliance_check.medical_advice_disclaimer) {
  throw new Error('ANVISA compliance violation: Missing medical disclaimer');
}
```

### CFM (Conselho Federal de Medicina) Guidelines

```typescript
// Ensure telemedicine guidelines are followed
const validation = await client.compliance.validateCFM({
  interaction_type: 'ai_assistance',
  healthcare_professional_present: true, // Required for CFM compliance
  patient_identification_verified: true,
  medical_records_access: 'read_only',
});
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "validation_errors": [
        {
          "field": "user_id",
          "message": "User ID is required"
        }
      ]
    },
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "request_id": "req-abc123"
}
```

### Error Handling Best Practices

```typescript
async function robustAPICall() {
  try {
    const response = await client.universalChat.sendMessage({
      session_id: sessionId,
      message: message,
    });

    return response.data;
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, error.details.retry_after_seconds * 1000));
      return robustAPICall(); // Retry
    }

    if (error.code === 'COMPLIANCE_VIOLATION') {
      // Handle compliance issues immediately
      await handleComplianceViolation(error);
      throw error; // Don't retry compliance violations
    }

    if (error.code === 'SERVICE_UNAVAILABLE') {
      // Implement circuit breaker pattern
      throw new ServiceUnavailableError('AI service temporarily unavailable');
    }

    // Log and re-throw unexpected errors
    console.error('Unexpected API error:', error);
    throw error;
  }
}
```

## Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642261200
X-RateLimit-Window: 60
```

### Handling Rate Limits

```typescript
class RateLimitedClient {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;

  async makeRequest(requestFn: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          if (error.code === 'RATE_LIMIT_EXCEEDED') {
            // Wait for the specified time
            const waitTime = error.details.retry_after_seconds * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Retry the request
            return this.makeRequest(requestFn);
          }
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      await request();

      // Add small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }
}
```

## Best Practices

### 1. Connection Management

```typescript
// Use connection pooling
const client = new NeonProHealthcareAI({
  apiKey: process.env.NEONPRO_API_KEY,
  baseURL: 'https://api.neonpro.healthcare',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  // Connection pooling options
  pool: {
    maxConnections: 10,
    keepAlive: true,
    keepAliveMsecs: 30000,
  },
});
```

### 2. Caching

```typescript
// Cache feature flag evaluations
const flagCache = new Map();

async function getCachedFeatureFlag(flagName: string, context: any) {
  const cacheKey = `${flagName}-${JSON.stringify(context)}`;

  if (flagCache.has(cacheKey)) {
    const cached = flagCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.value;
    }
  }

  const result = await client.featureManagement.evaluateFlag({
    flag_name: flagName,
    context: context,
  });

  flagCache.set(cacheKey, {
    value: result.data.enabled,
    timestamp: Date.now(),
  });

  return result.data.enabled;
}
```

### 3. Health Monitoring

```typescript
// Regular health checks
class HealthMonitor {
  private healthCheckInterval: NodeJS.Timeout;

  start() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await client.monitoring.getServicesHealth();

        health.data.forEach(service => {
          if (service.status !== 'healthy') {
            console.warn(`Service ${service.service} is ${service.status}`);
            // Send alerts, implement fallbacks, etc.
          }
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
```

### 4. Security

```typescript
// Secure token management
class TokenManager {
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;

  async getValidToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 300000) { // 5 minutes buffer
      return this.accessToken;
    }

    // Refresh token if needed
    await this.refreshAccessToken();
    return this.accessToken;
  }

  private async refreshAccessToken() {
    const response = await fetch('https://api.neonpro.healthcare/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.refreshToken}`,
      },
    });

    const data = await response.json();

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + (data.expires_in * 1000);
  }
}
```

### 5. Logging and Auditing

```typescript
// Comprehensive logging for healthcare compliance
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'healthcare-ai-client' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'audit.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Log all API interactions for compliance
client.on('request', (requestData) => {
  logger.info('API Request', {
    method: requestData.method,
    url: requestData.url,
    user_id: requestData.userId,
    request_id: requestData.requestId,
    timestamp: new Date().toISOString(),
  });
});

client.on('response', (responseData) => {
  logger.info('API Response', {
    status: responseData.status,
    request_id: responseData.requestId,
    response_time_ms: responseData.responseTime,
    compliance_validated: responseData.complianceValidated,
    timestamp: new Date().toISOString(),
  });
});
```

---

For more examples and detailed API documentation, visit
[https://docs.neonpro.healthcare](https://docs.neonpro.healthcare)
