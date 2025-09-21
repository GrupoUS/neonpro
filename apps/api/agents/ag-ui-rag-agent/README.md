# AG-UI RAG Agent

A specialized RAG (Retrieval-Augmented Generation) agent for healthcare data operations with Supabase integration.

## Features

- **Supabase Integration**: Seamless integration with Supabase for vector storage and database operations
- **Healthcare-Specific**: Specialized retriever for medical data, patient information, and healthcare knowledge
- **Multi-Provider AI Support**: Support for OpenAI, Anthropic, and local AI models
- **Real-time Communication**: WebSocket support for live interactions
- **Compliance Ready**: Built-in LGPD compliance with audit logging and PII detection
- **Vector Search**: Advanced semantic search using pgvector and embeddings
- **Session Management**: Persistent conversation sessions with context tracking
- **Healthcare Data Retrieval**: Specialized functions for patient data, appointments, and financial summaries

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │    │   AG-UI Agent   │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  REST API   │ │◄──►│ │  Core Agent │ │◄──►│ │  PostgreSQL │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ + pgvector  │ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │ WebSocket   │ │◄──►│ │  Retriever  │ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │  RLS Policies│ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │Health Checks│ │    │ │ Vector Store│ │    │ ┌─────────────┐ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │Audit Logs   │ │
└─────────────────┘    │ ┌─────────────┐ │    │ └─────────────┘ │
                       │ │ Embeddings  │ │    └─────────────────┘
                       │ └─────────────┘ │
                       └─────────────────┘
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Supabase Configuration
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_key"
export SUPABASE_PROJECT_REF="your_project_ref"

# AI Provider Configuration
export OPENAI_API_KEY="your_openai_api_key"
export AI_PROVIDER="openai"
export AI_MODEL="gpt-4"

# Security Configuration
export ENCRYPTION_KEY="your_encryption_key"
export JWT_SECRET="your_jwt_secret"

# Agent Configuration
export AGUI_HOST="localhost"
export AGUI_PORT="8080"
```

## Usage

### Starting the Agent

```bash
python -m src.main
```

### API Endpoints

#### Health Check
```bash
curl http://localhost:8080/health
```

#### Process Query
```bash
curl -X POST http://localhost:8080/api/ai/data-agent \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me patient appointments for today",
    "session_id": "session_123",
    "user_id": "user_456",
    "patient_id": "patient_789"
  }'
```

#### Get Agent Status
```bash
curl http://localhost:8080/api/ai/status
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/agent/session_123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'query',
    query: 'What medications is this patient currently taking?',
    user_id: 'user_456',
    patient_id: 'patient_789'
  }));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Response:', response);
};
```

## Configuration

The agent is configured through environment variables and the `AgentConfig` class. Key configuration sections:

### Database Configuration
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `SUPABASE_PROJECT_REF`: Supabase project reference

### AI Provider Configuration
- `AI_PROVIDER`: AI provider (openai, anthropic, local)
- `AI_MODEL`: Model name (gpt-4, claude-3-sonnet-20240229, etc.)
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: API keys for respective providers

### Vector Store Configuration
- `EMBEDDING_MODEL`: Embedding model to use
- `EMBEDDING_DIMENSION`: Vector dimension (default: 1536)
- `VECTOR_TABLE_NAME`: Table name for vector embeddings

### Security Configuration
- `ENCRYPTION_KEY`: Key for data encryption
- `JWT_SECRET`: Secret for JWT tokens
- `AUDIT_LOGGING`: Enable audit logging (default: true)

## Healthcare Data Retrieval

The agent provides specialized functions for healthcare data:

### Patient Data Retrieval
```python
# Get comprehensive patient information
patient_data = await agent.healthcare_retriever.retrieve_patient_data(
    patient_id="patient_789",
    user_id="user_456"
)
```

### Medical Knowledge Search
```python
# Search medical knowledge base
knowledge = await agent.healthcare_retriever.search_medical_knowledge(
    query="diabetes treatment guidelines",
    limit=10
)
```

### Appointment Data
```python
# Retrieve appointment information
appointments = await agent.healthcare_retriever.retrieve_appointment_data(
    patient_id="patient_789",
    date_range=(start_date, end_date)
)
```

### Financial Summary
```python
# Get financial summary
financial = await agent.healthcare_retriever.retrieve_financial_summary(
    patient_id="patient_789"
)
```

## Compliance Features

### LGPD Compliance
- Automatic audit logging for all data access
- PII detection and sanitization
- Data retention policies
- Role-based access control

### Audit Logging
All data access and queries are logged with:
- User ID and session ID
- Patient ID (when applicable)
- Query content and response
- Timestamp and compliance standards
- IP address and user agent

### PII Protection
- Automatic detection of common PII patterns
- Sanitization of sensitive information in responses
- Configurable PII detection rules

## Development

### Running Tests
```bash
pytest tests/
```

### Code Quality
```bash
# Format code
black src/
isort src/

# Type checking
mypy src/
```

### Database Schema

The agent requires several database tables:

#### Vector Embeddings Table
```sql
CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536),
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id VARCHAR(100),
    access_level VARCHAR(20) DEFAULT 'public'
);
```

#### Sessions Table
```sql
CREATE TABLE rag_agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    title TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);
```

#### Audit Log Table
```sql
CREATE TABLE rag_agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    compliance_standards TEXT[]
);
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **Database Security**: Use Supabase RLS policies for data access control
3. **API Security**: Implement proper authentication and authorization
4. **Data Encryption**: Encrypt sensitive data at rest and in transit
5. **Audit Trails**: Maintain comprehensive audit logs for compliance
6. **Rate Limiting**: Implement rate limiting to prevent abuse

## Monitoring

The agent provides several monitoring endpoints:

- `/health`: Health check and agent status
- `/api/ai/status`: Detailed agent statistics and performance metrics
- Structured logging with JSON format for easy parsing
- Prometheus metrics integration (if configured)

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase URL and service key
   - Check network connectivity
   - Ensure pgvector extension is enabled

2. **AI Provider Issues**
   - Verify API keys are valid
   - Check API quotas and rate limits
   - Ensure model availability

3. **Memory Issues**
   - Monitor embedding batch sizes
   - Adjust vector search limits
   - Check database connection pool settings

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
```

## License

This project is part of the NeonPro healthcare system.