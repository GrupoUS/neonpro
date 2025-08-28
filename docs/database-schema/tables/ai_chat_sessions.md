# AI Chat Sessions Table

## Schema

| Column | Type | Constraints | Default | Description | LGPD Classification |
|--------|------|-------------|---------|-------------|-------------------|
| id | uuid | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique session identifier | Public |
| user_id | uuid | FK | - | Healthcare professional user reference | Personal Data |
| clinic_id | uuid | FK | - | Clinic context reference | Organizational Data |
| session_type | varchar(50) | NOT NULL | 'general' | Type of AI chat session | Metadata |
| title | varchar(255) | - | - | Session title/description | Personal Data |
| status | varchar(20) | - | 'active' | Session status | Metadata |
| context | jsonb | - | '{}' | Session context and configuration | Metadata |
| metadata | jsonb | - | '{}' | Additional session metadata | Metadata |
| last_message_at | timestamptz | - | now() | Timestamp of last message | Metadata |
| created_at | timestamptz | - | now() | Session creation timestamp | Metadata |
| updated_at | timestamptz | - | now() | Last update timestamp | Metadata |

## Healthcare Compliance

**LGPD Status**: ✅ **Compliant** - Contains AI interaction data with healthcare professionals
**PHI Protection**: No patient health information stored directly (sanitized before storage)
**Professional Oversight**: All AI interactions linked to healthcare professionals
**Data Retention**: 2 years (AI interaction audit trail)
**AI Transparency**: Complete audit trail for AI-assisted healthcare decisions

## Relationships

- `auth.users.id` ← `ai_chat_sessions.user_id` (RESTRICT - preserve professional AI interaction history)
- `clinics.id` ← `ai_chat_sessions.clinic_id` (RESTRICT - maintain clinic AI usage tracking)
- `ai_chat_messages.session_id` → `ai_chat_sessions.id` (CASCADE DELETE - remove messages with session)
- `ai_compliance_logs.session_id` → `ai_chat_sessions.id` (RESTRICT - preserve compliance records)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - AI session protection and professional isolation

### Current Policies

```sql
-- Professionals access own AI sessions only
CREATE POLICY "professionals_own_ai_sessions" ON ai_chat_sessions
  FOR ALL USING (
    user_id = auth.uid()
  );

-- Clinic admins access clinic AI sessions
CREATE POLICY "clinic_admin_ai_sessions" ON ai_chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = ai_chat_sessions.clinic_id
      AND p.role IN ('admin', 'manager')
    )
  );

-- AI compliance auditors access for monitoring
CREATE POLICY "ai_compliance_audit_access" ON ai_chat_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role = 'compliance_auditor'
    )
  );
```

## AI Session Types

### Healthcare AI Sessions
- **general** - General healthcare assistance and information
- **diagnosis_support** - AI-assisted diagnostic support (not replacement)
- **treatment_planning** - Treatment recommendation assistance
- **patient_communication** - Patient communication drafting assistance
- **clinical_documentation** - Medical record documentation assistance
- **medication_review** - Medication interaction and review assistance
- **emergency_protocol** - Emergency response protocol guidance
- **compliance_check** - Regulatory compliance verification

### Administrative AI Sessions
- **scheduling_optimization** - Appointment scheduling assistance
- **staff_coordination** - Team coordination and communication
- **inventory_management** - Inventory and supply management
- **financial_analysis** - Financial reporting and analysis
- **marketing_content** - Marketing and patient education content
- **training_simulation** - Professional training simulations

## AI Context Management

### Context Structure
```json
// context field structure
{
  "patient_context": {
    "patient_id": "uuid", // Only if patient-specific session
    "anonymized": true,   // Always true for AI processing
    "consent_verified": true
  },
  "clinical_context": {
    "specialty": "aesthetic_medicine",
    "procedure_focus": "facial_treatments",
    "urgency_level": "routine"
  },
  "ai_configuration": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4000,
    "temperature": 0.3,
    "safety_filters": ["phi_detection", "medication_safety", "emergency_protocols"]
  },
  "compliance_settings": {
    "lgpd_mode": true,
    "professional_oversight": true,
    "audit_level": "comprehensive"
  }
}
```

### Metadata Structure
```json
// metadata field structure
{
  "ai_metrics": {
    "total_messages": 15,
    "total_tokens_used": 12500,
    "avg_response_time_ms": 850,
    "safety_triggers": 0
  },
  "professional_feedback": {
    "session_rating": 4.5,
    "usefulness_score": 5,
    "accuracy_rating": 4.8
  },
  "compliance_markers": {
    "phi_sanitization_applied": true,
    "professional_review_required": false,
    "emergency_protocols_triggered": false
  },
  "integration_data": {
    "related_appointments": ["appointment_uuid"],
    "referenced_patients": ["patient_uuid"],
    "generated_documents": ["document_uuid"]
  }
}
```

## AI Safety & Compliance Features

### PHI Protection
- **Automatic Sanitization**: All input sanitized before AI processing
- **No PHI Storage**: Patient health information never stored in AI tables
- **Anonymization**: Patient references anonymized for AI interactions
- **Consent Validation**: Patient consent verified for AI-assisted care

### Professional Oversight
- **Licensed Professional Required**: All AI sessions linked to licensed healthcare professionals
- **Clinical Decision Support Only**: AI provides support, not replacement for professional judgment
- **Professional Validation**: Critical AI recommendations require professional review
- **Emergency Protocols**: Automatic escalation for emergency situations

### Regulatory Compliance
- **LGPD Compliance**: Complete data protection compliance for AI interactions
- **CFM Guidelines**: Federal Council of Medicine AI usage guidelines
- **ANVISA Requirements**: Medical device software compliance for AI features
- **Audit Trail**: Complete tracking of AI-assisted healthcare decisions

## Performance Optimizations

### Indexes
```sql
-- Core AI session queries
CREATE INDEX idx_ai_chat_sessions_user_id ON ai_chat_sessions (user_id);
CREATE INDEX idx_ai_chat_sessions_clinic_id ON ai_chat_sessions (clinic_id);
CREATE INDEX idx_ai_chat_sessions_status ON ai_chat_sessions (status);
CREATE INDEX idx_ai_chat_sessions_type ON ai_chat_sessions (session_type);

-- Time-based queries
CREATE INDEX idx_ai_chat_sessions_last_message ON ai_chat_sessions (last_message_at DESC);
CREATE INDEX idx_ai_chat_sessions_created_at ON ai_chat_sessions (created_at DESC);

-- Context searches
CREATE INDEX idx_ai_chat_sessions_context ON ai_chat_sessions USING GIN (context);
CREATE INDEX idx_ai_chat_sessions_metadata ON ai_chat_sessions USING GIN (metadata);
```

### Session Management
- **Session Timeout**: Automatic session expiry after inactivity
- **Resource Limits**: Token usage limits per session and per professional
- **Concurrent Sessions**: Limit concurrent AI sessions per professional
- **Session Archival**: Automatic archival of old sessions

## Integration with Vercel AI SDK

### AI Model Configuration
- **Multiple Providers**: Support for OpenAI, Anthropic, and other providers
- **Model Selection**: Professional-configurable AI model selection
- **Streaming Support**: Real-time AI response streaming
- **Function Calling**: Integration with healthcare-specific functions

### Healthcare AI Tools
```json
// Available AI tools for healthcare professionals
{
  "patient_lookup": "Search anonymized patient information",
  "medication_check": "Verify medication interactions and dosages",
  "icd10_search": "Search ICD-10 diagnostic codes",
  "cpt_lookup": "Look up CPT procedure codes",
  "clinical_guidelines": "Access clinical practice guidelines",
  "emergency_protocols": "Emergency response protocol assistance",
  "compliance_check": "Verify regulatory compliance requirements"
}
```

## Audit & Monitoring

### AI Session Audit
```sql
-- AI session lifecycle tracking
CREATE TRIGGER ai_chat_sessions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION create_ai_audit_log();

-- Automatic timestamp updates
CREATE TRIGGER ai_chat_sessions_updated_at_trigger
  BEFORE UPDATE ON ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- AI compliance monitoring
CREATE TRIGGER ai_session_compliance_monitor_trigger
  AFTER INSERT OR UPDATE ON ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION monitor_ai_compliance();
```

### Healthcare AI Metrics
- **Usage Analytics**: Professional AI usage patterns and trends
- **Accuracy Tracking**: AI recommendation accuracy and professional feedback
- **Safety Monitoring**: Safety trigger tracking and incident reporting
- **Compliance Reporting**: Regular compliance audits and reporting
- **Cost Tracking**: AI usage costs and resource optimization

---

> **AI Safety Notice**: All AI interactions are subject to healthcare professional oversight and regulatory compliance. AI provides clinical decision support only and does not replace professional medical judgment.

> **PHI Protection**: No patient health information is stored in AI systems. All data is sanitized and anonymized before AI processing to ensure LGPD and healthcare privacy compliance.