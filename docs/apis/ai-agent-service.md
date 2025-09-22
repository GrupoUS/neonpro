# AI Agent Service Documentation

## Overview

The AI Agent Service is a Python-based microservice that provides intelligent querying capabilities for healthcare data using natural language processing. It implements the AG-UI protocol for real-time communication and integrates with the main NeonPro platform.

## Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP    ┌─────────────────┐
│   Frontend      │◄──────────────►│  AI Agent       │◄──────────►│    Supabase     │
│   (React)       │                │  Service        │                │    Database     │
└─────────────────┘                └─────────────────┘                └─────────────────┘
         │                                 │                                 │
         │          AG-UI Protocol         │                                 │
         └─────────────────────────────────┘                                 │
                                                                           │
            REST API for queries                                           │
            ┌─────────────────────────────────────────────────────────────┘
            │
            ▼
      ┌─────────────────┐
      │  LangChain      │
      │  OpenAI         │
      │  Anthropic      │
      └─────────────────┘
```

## Components

### 1. Agent Service (`agent_service.py`)
- **Purpose**: Core AI logic and query processing
- **Features**:
  - Intent detection for Portuguese queries
  - Entity extraction (names, dates, CPF)
  - Integration with multiple AI models
  - Conversation memory and context
  - LGPD compliance validation

### 2. Database Service (`database_service.py`)
- **Purpose**: Data access layer with caching
- **Features**:
  - Patient search by name
  - Appointment queries with date filtering
  - Financial transaction access
  - Audit logging for compliance
  - Built-in caching with TTL

### 3. WebSocket Manager (`websocket_manager.py`)
- **Purpose**: Real-time communication handler
- **Features**:
  - Connection management
  - Message broadcasting
  - Ping/pong for connection health
  - Client subscription management

## AG-UI Protocol Implementation

### Message Types

#### Query Message
```json
{
  "type": "query",
  "query": "Buscar agendamentos do paciente João Silva",
  "context": {
    "user_id": "auth_123",
    "clinic_id": "clinic_456"
  }
}
```

#### Data Response
```json
{
  "type": "data_response",
  "data_type": "appointments",
  "data": [...],
  "patient_name": "João Silva",
  "count": 3,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Action Message
```json
{
  "type": "action",
  "action_type": "export_data",
  "data": {
    "type": "appointments",
    "patient_id": "pat_123"
  }
}
```

## Intent Detection

The service automatically detects user intent based on Portuguese keywords:

| Intent | Keywords | Example |
|--------|----------|---------|
| CLIENT_SEARCH | buscar, procurar, achar, paciente | "Buscar pacientes com nome Maria" |
| APPOINTMENT_QUERY | consulta, agendamento, marcação | "Mostrar agendamentos de João" |
| FINANCIAL_QUERY | financeiro, pagamento, fatura | "Ver pagamentos pendentes" |
| SCHEDULE_MANAGEMENT | agenda, marcar, cancelar | "Marcar nova consulta" |
| REPORT_GENERATION | relatório, resumo | "Gerar relatório mensal" |

## Brazilian Healthcare Compliance

### LGPD Implementation
- Consent validation before data access
- Audit logging for all queries
- Data encryption in transit
- Automatic data retention policies

### Healthcare Validations
- CPF format validation
- Medical license verification
- ANVISA compliance checks
- CFM regulation adherence

## Configuration

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Database access key
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `JWT_SECRET`: JWT signing secret
- `ALLOWED_ORIGINS`: CORS allowed origins

### Service Settings
```python
# Maximum WebSocket connections
WS_MAX_CONNECTIONS = 100

# Ping interval for connection health
WS_PING_INTERVAL = 30  # seconds

# Cache TTL for database queries
CACHE_TTL = 300  # 5 minutes

# Data retention period
DATA_RETENTION_DAYS = 365
```

## Deployment

### Docker Deployment
1. Build the image:
   ```bash
   docker build -t neonpro-ai-agent .
   ```

2. Run with docker-compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Start the service:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001
   ```

## Monitoring

### Health Check
```bash
curl http://localhost:8001/health
```

### Connection Stats
Access WebSocket stats at:
```bash
ws://localhost:8001/ws/stats
```

## Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=services
```

## Integration with Frontend

The service integrates with the React frontend through:

1. **WebSocket Connection**: Real-time chat interface
2. **REST API**: Fallback for HTTP requests
3. **CopilotKit**: UI components for chat
4. **AG-UI Protocol**: Standardized message format

Example frontend integration:
```typescript
const ws = new WebSocket('ws://localhost:8001/ws/agent');

ws.send(JSON.stringify({
  type: 'query',
  query: 'Buscar pacientes chamados Silva',
  context: { userId: user.id }
}));
```

## Error Handling

The service implements comprehensive error handling:

- Database connection errors
- API rate limiting
- Invalid query formats
- Authentication failures
- LGPD compliance violations

All errors are logged with context and returned with appropriate HTTP status codes.

## Performance Considerations

- Database queries use caching with TTL
- WebSocket connections are limited and monitored
- AI model calls are optimized for healthcare queries
- Responses are paginated for large datasets
- Connection pooling for database access