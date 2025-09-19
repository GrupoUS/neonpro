# AI Chat Database Schema

**Version**: Phase 1  
**Last Updated**: 2025-01-27  
**Migration Status**: ✅ Complete  

## Overview

The AI Chat database schema supports secure, LGPD-compliant conversational AI for healthcare professionals. It includes session management, message storage, audit logging, and comprehensive Row Level Security (RLS) for multi-tenant isolation.

## Schema Design Principles

- **Multi-tenant Isolation**: RLS policies ensure clinic-level data separation
- **LGPD Compliance**: Audit trails, data retention, consent management
- **Performance Optimized**: Efficient indexing for real-time chat operations
- **Security First**: Encryption, secure defaults, minimal data exposure
- **Scalability**: Designed for high-volume chat interactions

## Tables

### ai_chat_sessions

Manages AI chat session lifecycle and context.

```sql
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL,
    
    -- Session management
    status ai_chat_session_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Chat context
    context JSONB NOT NULL DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    
    -- Usage tracking
    message_count INTEGER DEFAULT 0,
    token_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Custom enum for session status
CREATE TYPE ai_chat_session_status AS ENUM (
    'active',
    'expired', 
    'terminated',
    'suspended'
);
```

**Key Fields:**

- `context`: Stores consultation type, specialty, patient context
- `preferences`: User preferences (provider, language, streaming)
- `message_count`: Track usage against session limits
- `token_count`: Monitor API costs and usage
- `expires_at`: Automatic session expiration (default: 1 hour)

**Indexes:**
```sql
-- Performance indexes
CREATE INDEX idx_ai_chat_sessions_user_clinic ON ai_chat_sessions(user_id, clinic_id);
CREATE INDEX idx_ai_chat_sessions_status_expires ON ai_chat_sessions(status, expires_at);
CREATE INDEX idx_ai_chat_sessions_created_at ON ai_chat_sessions(created_at);

-- Partial indexes for active sessions (most common queries)
CREATE INDEX idx_ai_chat_sessions_active ON ai_chat_sessions(clinic_id, user_id) 
    WHERE status = 'active';
```

### ai_chat_messages

Stores individual messages within chat sessions.

```sql
CREATE TABLE ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    
    -- Message content
    role ai_chat_message_role NOT NULL,
    content TEXT NOT NULL,
    
    -- AI metadata
    provider VARCHAR(50), -- 'openai', 'anthropic', etc.
    model VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,
    
    -- Compliance and safety
    pii_detected BOOLEAN DEFAULT FALSE,
    content_filtered BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'
);

-- Message role enum
CREATE TYPE ai_chat_message_role AS ENUM (
    'user',
    'assistant', 
    'system'
);
```

**Key Fields:**

- `role`: Distinguishes user messages from AI responses
- `provider`/`model`: Track which AI service generated response
- `tokens_used`: Cost tracking and usage analytics
- `response_time_ms`: Performance monitoring
- `pii_detected`: LGPD compliance tracking
- `content_filtered`: Safety filter tracking

**Indexes:**
```sql
-- Session-based queries (most common)
CREATE INDEX idx_ai_chat_messages_session_created ON ai_chat_messages(session_id, created_at);

-- Analytics and reporting
CREATE INDEX idx_ai_chat_messages_provider_created ON ai_chat_messages(provider, created_at);
CREATE INDEX idx_ai_chat_messages_pii_created ON ai_chat_messages(pii_detected, created_at) 
    WHERE pii_detected = TRUE;
```

### ai_chat_audit_events

Comprehensive audit logging for LGPD compliance.

```sql
CREATE TABLE ai_chat_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id UUID,
    session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE SET NULL,
    message_id UUID REFERENCES ai_chat_messages(id) ON DELETE SET NULL,
    
    -- Event details
    event_type ai_chat_audit_event_type NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    
    -- Compliance tracking
    ip_address INET,
    user_agent TEXT,
    consent_version VARCHAR(20),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit event types
CREATE TYPE ai_chat_audit_event_type AS ENUM (
    'session_created',
    'session_terminated', 
    'message_sent',
    'message_received',
    'pii_detected',
    'content_filtered',
    'rate_limit_exceeded',
    'consent_validated',
    'data_export_requested',
    'data_deletion_requested'
);
```

**Key Fields:**

- `event_type`: Categorizes audit events for reporting
- `event_data`: Flexible JSON storage for event-specific data
- `ip_address`/`user_agent`: Security and compliance tracking
- `consent_version`: Track consent changes over time

**Indexes:**
```sql
-- LGPD compliance queries
CREATE INDEX idx_ai_chat_audit_user_clinic ON ai_chat_audit_events(user_id, clinic_id);
CREATE INDEX idx_ai_chat_audit_event_type_created ON ai_chat_audit_events(event_type, created_at);

-- Data retention cleanup
CREATE INDEX idx_ai_chat_audit_created_at ON ai_chat_audit_events(created_at);
```

## Row Level Security (RLS)

All tables implement comprehensive RLS policies for multi-tenant data isolation.

### ai_chat_sessions Policies

```sql
-- Enable RLS
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions within their clinic
CREATE POLICY ai_chat_sessions_user_access ON ai_chat_sessions
    FOR ALL USING (
        user_id = auth.uid() AND 
        clinic_id = get_user_clinic_id(auth.uid())
    );

-- Clinic admins can view all clinic sessions
CREATE POLICY ai_chat_sessions_admin_access ON ai_chat_sessions
    FOR SELECT USING (
        clinic_id = get_user_clinic_id(auth.uid()) AND
        has_clinic_permission(auth.uid(), 'ai_chat_admin')
    );

-- Service role bypass for system operations
CREATE POLICY ai_chat_sessions_service_access ON ai_chat_sessions
    FOR ALL USING (auth.role() = 'service_role');
```

### ai_chat_messages Policies

```sql
-- Enable RLS
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access messages from their own sessions
CREATE POLICY ai_chat_messages_user_access ON ai_chat_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_chat_sessions s 
            WHERE s.id = session_id 
            AND s.user_id = auth.uid()
            AND s.clinic_id = get_user_clinic_id(auth.uid())
        )
    );

-- Service role bypass
CREATE POLICY ai_chat_messages_service_access ON ai_chat_messages
    FOR ALL USING (auth.role() = 'service_role');
```

### ai_chat_audit_events Policies

```sql
-- Enable RLS  
ALTER TABLE ai_chat_audit_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit events
CREATE POLICY ai_chat_audit_user_access ON ai_chat_audit_events
    FOR SELECT USING (
        user_id = auth.uid() AND
        clinic_id = get_user_clinic_id(auth.uid())
    );

-- Clinic admins can view all clinic audit events
CREATE POLICY ai_chat_audit_admin_access ON ai_chat_audit_events
    FOR SELECT USING (
        clinic_id = get_user_clinic_id(auth.uid()) AND
        has_clinic_permission(auth.uid(), 'audit_access')
    );

-- System can insert audit events
CREATE POLICY ai_chat_audit_system_insert ON ai_chat_audit_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

## Database Functions

### Session Management

```sql
-- Automatically expire old sessions
CREATE OR REPLACE FUNCTION expire_old_ai_chat_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE ai_chat_sessions 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule automatic expiration (run every 5 minutes)
SELECT cron.schedule('expire-ai-chat-sessions', '*/5 * * * *', 'SELECT expire_old_ai_chat_sessions();');
```

### Usage Tracking

```sql
-- Update session counters when messages are added
CREATE OR REPLACE FUNCTION update_session_counters()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_chat_sessions 
    SET 
        message_count = message_count + 1,
        token_count = token_count + COALESCE(NEW.tokens_used, 0),
        updated_at = NOW()
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ai_chat_messages_update_counters
    AFTER INSERT ON ai_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_counters();
```

### LGPD Compliance

```sql
-- Automatic audit event creation
CREATE OR REPLACE FUNCTION create_audit_event(
    p_event_type ai_chat_audit_event_type,
    p_user_id UUID DEFAULT NULL,
    p_clinic_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_message_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO ai_chat_audit_events (
        event_type, user_id, clinic_id, session_id, message_id, event_data,
        ip_address, user_agent, consent_version
    ) VALUES (
        p_event_type, p_user_id, p_clinic_id, p_session_id, p_message_id, p_event_data,
        inet_client_addr(), current_setting('request.headers.user-agent', true),
        get_user_consent_version(p_user_id)
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Data Retention & Cleanup

### Retention Policies

```sql
-- Clean up old sessions and messages (LGPD compliance)
CREATE OR REPLACE FUNCTION cleanup_old_ai_chat_data(retention_days INTEGER DEFAULT 365)
RETURNS TABLE(sessions_deleted INTEGER, messages_deleted INTEGER, audit_events_deleted INTEGER) AS $$
DECLARE
    session_count INTEGER;
    message_count INTEGER; 
    audit_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old messages (cascades from sessions)
    DELETE FROM ai_chat_sessions 
    WHERE created_at < cutoff_date;
    GET DIAGNOSTICS session_count = ROW_COUNT;
    
    -- Get message count (for reporting, messages deleted by cascade)
    SELECT COUNT(*) INTO message_count
    FROM ai_chat_messages m
    WHERE NOT EXISTS (SELECT 1 FROM ai_chat_sessions s WHERE s.id = m.session_id);
    
    -- Clean up orphaned audit events (keep audit longer than data)
    DELETE FROM ai_chat_audit_events 
    WHERE created_at < (cutoff_date - INTERVAL '1 year');
    GET DIAGNOSTICS audit_count = ROW_COUNT;
    
    RETURN QUERY SELECT session_count, message_count, audit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run daily at 2 AM)
SELECT cron.schedule('cleanup-ai-chat-data', '0 2 * * *', 
    'SELECT cleanup_old_ai_chat_data(365);');
```

## Migration Scripts

### Phase 1 Implementation

**Migration 1**: Core tables and types
```sql
-- File: 20250915010101_ai_chat_phase1.sql
-- Core table creation with proper types and constraints
-- See: packages/database/prisma/migrations/20250915010101_ai_chat_phase1/migration.sql
```

**Migration 2**: RLS policies and indexes
```sql
-- File: 20250915093000_ai_chat_phase1_policies_and_indexes.sql  
-- Row Level Security policies and performance indexes
-- See: packages/database/prisma/migrations/20250915093000_ai_chat_phase1_policies_and_indexes/migration.sql
```

### Future Migrations

**Phase 2 Planned**:
- Multi-modal support (image/document storage)
- Advanced analytics tables
- Integration with EHR systems
- Enhanced audit capabilities

## Performance Considerations

### Indexing Strategy

- **Session Queries**: Focus on (user_id, clinic_id) combinations
- **Message Retrieval**: Optimize for session-based pagination
- **Audit Queries**: Support compliance reporting by event type and date
- **Partial Indexes**: Use for frequently filtered conditions (active sessions)

### Query Optimization

```sql
-- Efficient session listing with message preview
SELECT 
    s.*,
    (SELECT content FROM ai_chat_messages m 
     WHERE m.session_id = s.id 
     ORDER BY created_at DESC LIMIT 1) as last_message
FROM ai_chat_sessions s 
WHERE s.user_id = $1 AND s.clinic_id = $2 
AND s.status = 'active'
ORDER BY s.updated_at DESC;

-- Efficient message pagination within session
SELECT * FROM ai_chat_messages 
WHERE session_id = $1 
ORDER BY created_at ASC 
LIMIT $2 OFFSET $3;
```

### Connection Pooling

- Use PgBouncer for connection pooling
- Configure appropriate pool sizes for chat workloads
- Monitor connection usage during peak hours

## Security Considerations

### Data Protection

- **Encryption at Rest**: All sensitive fields encrypted
- **Minimal Data Storage**: Only store necessary information
- **Secure Defaults**: Conservative permissions and settings
- **Regular Audits**: Automated security scanning

### Access Control

- **RLS Enforcement**: Multi-layer security with RLS + application logic
- **Principle of Least Privilege**: Minimal required permissions
- **Audit Everything**: Comprehensive audit trail for all actions
- **Session Security**: Secure session handling with proper expiration

### Compliance Features

- **LGPD Ready**: Built-in data protection and audit requirements
- **Right to Erasure**: Complete data deletion capabilities
- **Consent Tracking**: Version-controlled consent management
- **Data Export**: Structured data export for portability

---

**Status**: ✅ Implemented in Phase 1
**Next Review**: Phase 2 planning
**Related Docs**: 
- [Migration Files](../../../packages/database/prisma/migrations/)
- [API Reference](./api-reference.md)
- [Security Guidelines](../../rules/security-guidelines.md)