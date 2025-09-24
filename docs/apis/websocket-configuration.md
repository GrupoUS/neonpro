---
title: "WebSocket Configuration for AI Agent"
last_updated: 2025-09-24
form: how-to
tags: [websocket, ai-agent, configuration, real-time]
related:
  - ../AGENTS.md
  - ./ai-agent-api.md
  - ../architecture/backend-architecture.md
---

# WebSocket Configuration for AI Agent — How-to

## Goal

Configure and implement WebSocket connections for real-time AI agent communication.

## Prerequisites

- AI Agent service running
- Environment variables configured
- Authentication system active

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# AI Agent WebSocket Configuration
NEXT_PUBLIC_AI_AGENT_WS_URL=ws://localhost:8001/ws/agent
AI_AGENT_SERVICE_URL=http://localhost:8001
AI_AGENT_WS_URL=ws://localhost:8001/ws/agent
```

## Architecture

```
Frontend (React)
    │
    ├── REST API (Hono.js) ──► apps/api/src/routes/ai/data-agent.ts
    │
    └── WebSocket ───────────► services/ai-agent/main.py
                                 │
                                 ├── Agent Service (agent_service.py)
                                 ├── Database Service (database_service.py)
                                 └── WebSocket Manager (websocket_manager.py)
```

## WebSocket vs REST

### WebSocket

- **Real-time communication**
- Lower latency for ongoing conversations
- Automatic reconnection
- Connection status indicators
- Better for chat applications

### REST API

- Simpler to implement
- Stateless
- Better for one-off queries
- No persistent connection overhead

## Implementation Details

### Frontend WebSocket Service

Location: `apps/web/src/services/websocket-agent-service.ts`

Features:

- Automatic reconnection
- Message queuing
- Request/response correlation
- Connection health monitoring

### Python WebSocket Server

Location: `services/ai-agent/main.py`

Features:

- AG-UI protocol support
- Connection management
- Health checks
- Load balancing ready

## Usage

### Basic WebSocket Connection

```typescript
import { useWebSocketAgent } from "@/services/websocket-agent-service";

function ChatComponent() {
  const { isConnected, sendQuery } = useWebSocketAgent();

  const handleSubmit = async (message: string) => {
    if (isConnected) {
      const response = await sendQuery(message, { userId: user.id });
      console.log(response);
    }
  };

  return (
    <div>
      Connection: {isConnected ? "Connected" : "Disconnected"}
      {/* Chat UI */}
    </div>
  );
}
```

### Message Format

```typescript
// Query message
{
  type: "query",
  query: "Buscar pacientes com nome João",
  context: {
    userId: "auth_123",
    clinicId: "clinic_456"
  },
  timestamp: "2024-01-01T00:00:00Z"
}

// Response message
{
  type: "data_response",
  data_type: "clients",
  data: [...],
  count: 5,
  timestamp: "2024-01-01T00:00:00Z"
}
```

## Deployment

### Docker

The Python agent service includes Docker configuration:

```bash
# Build and run with docker-compose
cd services/ai-agent
docker-compose up --build
```

### Manual Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8001
```

## Security

### CORS Configuration

Ensure your ALLOWED_ORIGINS includes your frontend URL:

```bash
ALLOWED_ORIGINS=["http://localhost:3000", "https://your-domain.com"]
```

### Authentication

WebSocket connections should include JWT tokens for authentication:

```typescript
const ws = new WebSocket("ws://localhost:8001/ws/agent?token=YOUR_JWT_TOKEN");
```

## Monitoring

### Health Check

```bash
curl http://localhost:8001/health
```

### Connection Metrics

The service provides connection statistics at:

```bash
ws://localhost:8001/ws/stats
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if the Python service is running on port 8001
   - Verify firewall settings
   - Check CORS configuration

2. **Messages Not Received**
   - Verify message format matches AG-UI protocol
   - Check console for WebSocket errors
   - Ensure authentication tokens are valid

3. **Reconnection Issues**
   - Check network stability
   - Verify server capacity limits
   - Monitor error logs

### Debug Logging

Enable debug logging:

```bash
LOG_LEVEL=DEBUG uvicorn main:app --reload
```

## Performance Considerations

- WebSocket connections are persistent
- Monitor memory usage with many connections
- Consider connection pooling for high traffic
- Implement rate limiting if needed
