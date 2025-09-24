---
title: "AI Agent API Essentials"
last_updated: 2025-09-24
form: reference
tags: [ai-agent, api, essential, chat]
related:
  - ./AGENTS.md
  - ./core-api.md
---

# AI Agent API Essentials — Reference

## Core Endpoints

### Chat Interface

```bash
POST /api/ai/chat         # Send message to AI agent
GET  /api/ai/sessions/:id # Get session history
```

### Data Queries

```bash
POST /api/ai/query        # Natural language data queries
GET  /api/ai/status       # Agent health check
```

## Authentication

```bash
Authorization: Bearer <JWT_TOKEN>
```

## Basic Usage

### Send Chat Message

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Quais os próximos agendamentos?',
    sessionId: 'session_123',
  }),
});

const data = await response.json();
```

### Response Format

```typescript
interface AgentResponse {
  id: string;
  type: 'text' | 'table' | 'list';
  content: {
    title: string;
    text?: string;
    data?: any[];
  };
  metadata: {
    processingTime: number;
    confidence: number;
  };
}
```

## WebSocket Support

```typescript
const ws = new WebSocket('wss://api.neonpro.com/ai/ws');
ws.send(JSON.stringify({
  type: 'chat',
  message: 'Hello',
  sessionId: 'session_123',
}));
```

## Rate Limits

- **REST API**: 100 requests/minute
- **WebSocket**: 50 connections/user

## See Also

- [API Control Hub](./AGENTS.md)
- [Core API Reference](./core-api.md)
