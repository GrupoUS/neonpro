# AI Chat Messages Table

## Schema

| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique message identifier | Public |
| session_id | uuid | FK, NOT NULL | - | AI chat session reference | Personal Data |
| role | varchar(20) | NOT NULL | - | Message role (user, assistant, system, tool) | Metadata |
| content | text | NOT NULL | - | Message content (PHI-sanitized) | Health Data (Sanitized) |
| tokens_used | integer | - | 0 | Number of tokens consumed | Metadata |
| model_used | varchar(100) | - | - | AI model used for response | Metadata |
| response_time_ms | integer | - | - | AI response time in milliseconds | Metadata |
| confidence_score | numeric | - | - | AI confidence score (0.0-1.0) | Metadata |
| compliance_flags | jsonb | - | '{}' | Compliance and safety flags | Compliance Data |
| metadata | jsonb | - | '{}' | Additional message metadata | Metadata |
| created_at | timestamptz | - | now() | Message creation timestamp | Metadata |

## Healthcare Compliance

**LGPD Status**: ✅ **Compliant** - PHI-sanitized AI conversation data
**PHI Sanitization**: All patient health information removed before storage
**Professional Context**: All messages linked to healthcare professional sessions
**AI Transparency**: Complete audit trail for AI-assisted healthcare decisions
**Data Retention**: 2 years (AI interaction compliance records)

## Relationships

- `ai_chat_sessions.id` ← `ai_chat_messages.session_id` (CASCADE DELETE - remove messages with session)
- `ai_compliance_logs.message_id` → `ai_chat_messages.id` (RESTRICT - preserve compliance audit)
- `ai_safety_incidents.message_id` → `ai_chat_messages.id` (RESTRICT - preserve safety records)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - AI message protection through session isolation

### Current Policies

```sql
-- Messages accessible through session permissions
CREATE POLICY "ai_messages_via_session" ON ai_chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Compliance auditors access for monitoring
CREATE POLICY "ai_compliance_message_audit" ON ai_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role = 'compliance_auditor'
    )
  );

-- Research access (anonymized data only)
CREATE POLICY "ai_research_access" ON ai_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role = 'ai_researcher'
    ) AND
    compliance_flags->>'contains_phi' = 'false'
  );
```

## Message Roles & Types

### Standard AI Message Roles
- **user** - Healthcare professional input messages
- **assistant** - AI model responses and recommendations
- **system** - System messages and instructions
- **tool** - Function call results and tool outputs

### Healthcare-Specific Message Types
- **clinical_query** - Clinical questions and consultations
- **diagnostic_support** - Diagnostic assistance requests
- **treatment_recommendation** - Treatment planning assistance
- **medication_review** - Medication interaction checks
- **emergency_protocol** - Emergency response guidance
- **compliance_check** - Regulatory compliance verification
- **patient_communication** - Patient communication drafting
- **documentation_assist** - Clinical documentation support

## PHI Sanitization & Compliance

### Automatic PHI Detection & Removal
```json
// compliance_flags structure
{
  "phi_detected": true,
  "phi_sanitized": true,
  "sanitization_applied": [
    "cpf_removal",
    "name_anonymization", 
    "phone_masking",
    "address_redaction"
  ],
  "safety_triggers": [
    "medication_interaction_detected",
    "emergency_protocol_suggested"
  ],
  "professional_review_required": false,
  "regulatory_flags": {
    "lgpd_compliant": true,
    "cfm_guidelines_followed": true,
    "anvisa_requirements_met": true
  }
}
```

### Content Sanitization Process
1. **Input Sanitization**: PHI removed from user messages before AI processing
2. **AI Response Filtering**: AI responses filtered for PHI and safety concerns
3. **Storage Sanitization**: Only sanitized content stored in database
4. **Audit Logging**: Complete PHI sanitization audit trail
5. **Professional Validation**: Critical AI recommendations flagged for review

## AI Performance Metrics

### Message-Level Metrics
- **Response Time**: AI model response latency tracking
- **Token Usage**: Token consumption for cost and performance optimization
- **Confidence Score**: AI model confidence in responses
- **Accuracy Feedback**: Professional feedback on AI accuracy
- **Safety Triggers**: Safety and compliance issue detection

### Model Performance Tracking
```json
// metadata structure for performance tracking
{
  "ai_performance": {
    "model_version": "claude-3-5-sonnet-20241022",
    "response_quality_score": 4.2,
    "hallucination_detected": false,
    "factual_accuracy_verified": true,
    "clinical_relevance_score": 4.5
  },
  "professional_interaction": {
    "follow_up_questions": 2,
    "clarification_requests": 0,
    "professional_override": false,
    "recommendation_accepted": true
  },
  "system_context": {
    "concurrent_sessions": 3,
    "server_load": "normal",
    "api_latency_ms": 850,
    "cache_hit_rate": 0.75
  }
}
```

## Healthcare AI Safety Features

### Safety Monitoring
- **Emergency Detection**: Automatic detection of emergency situations
- **Medication Safety**: Drug interaction and contraindication alerts
- **Dosage Validation**: Medication dosage safety verification
- **Professional Escalation**: Automatic escalation for critical situations
- **Compliance Monitoring**: Real-time regulatory compliance checking

### Clinical Decision Support Safeguards
- **Disclaimer Integration**: Automatic medical disclaimer inclusion
- **Professional Oversight**: Clear indication of professional judgment requirement
- **Evidence-Based Recommendations**: AI responses linked to clinical evidence
- **Uncertainty Communication**: Clear communication of AI uncertainty levels
- **Scope Limitations**: Clear boundaries of AI assistance scope

## Performance Optimizations

### Indexes
```sql
-- Core message queries
CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages (session_id);
CREATE INDEX idx_ai_chat_messages_role ON ai_chat_messages (role);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages (created_at DESC);

-- Performance tracking
CREATE INDEX idx_ai_chat_messages_model ON ai_chat_messages (model_used);
CREATE INDEX idx_ai_chat_messages_tokens ON ai_chat_messages (tokens_used);
CREATE INDEX idx_ai_chat_messages_response_time ON ai_chat_messages (response_time_ms);

-- Compliance monitoring
CREATE INDEX idx_ai_chat_messages_compliance ON ai_chat_messages USING GIN (compliance_flags);
CREATE INDEX idx_ai_chat_messages_confidence ON ai_chat_messages (confidence_score);
```

### Query Optimizations
```sql
-- Get session conversation
SELECT role, content, created_at, confidence_score
FROM ai_chat_messages 
WHERE session_id = 'session_uuid'
ORDER BY created_at ASC;

-- Find messages requiring professional review
SELECT id, session_id, content, compliance_flags
FROM ai_chat_messages
WHERE compliance_flags->>'professional_review_required' = 'true'
  AND created_at > NOW() - INTERVAL '24 hours';

-- Performance analytics
SELECT 
  model_used,
  AVG(response_time_ms) as avg_response_time,
  AVG(tokens_used) as avg_tokens,
  AVG(confidence_score) as avg_confidence
FROM ai_chat_messages
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY model_used;
```

## Integration Points

### Vercel AI SDK Integration
- **Streaming Support**: Real-time message streaming to frontend
- **Function Calling**: Integration with healthcare-specific functions
- **Model Switching**: Dynamic model selection based on query type
- **Token Management**: Automatic token usage tracking and limits
- **Error Handling**: Robust error handling and fallback mechanisms

### Healthcare System Integration
- **EMR Integration**: Link AI insights to electronic medical records
- **Appointment System**: AI-powered scheduling optimization
- **Billing Integration**: AI-assisted coding and billing support
- **Compliance Systems**: Integration with regulatory compliance platforms
- **Training Systems**: AI conversation data for professional training

## Audit & Compliance Monitoring

### Message Audit Trail
```sql
-- Message lifecycle tracking
CREATE TRIGGER ai_chat_messages_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_ai_message_audit_log();

-- PHI sanitization verification
CREATE TRIGGER ai_message_phi_sanitization_trigger
  BEFORE INSERT OR UPDATE ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION verify_phi_sanitization();

-- Safety compliance monitoring
CREATE TRIGGER ai_message_safety_monitor_trigger
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION monitor_ai_safety_compliance();
```

### Regulatory Compliance Tracking
- **LGPD Compliance**: Complete data protection audit trail
- **CFM Guidelines**: Medical professional AI usage compliance
- **ANVISA Requirements**: Medical device software AI compliance
- **Professional Standards**: Healthcare professional practice standards
- **Quality Assurance**: Continuous AI quality monitoring and improvement

---

> **AI Safety Notice**: All AI messages are subject to PHI sanitization and healthcare compliance monitoring. Professional oversight is required for all clinical decisions regardless of AI recommendations.

> **Data Protection**: Messages contain only PHI-sanitized content. Original patient health information is never stored in AI systems, ensuring complete LGPD and healthcare privacy compliance.