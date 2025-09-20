# Quickstart Guide: AI Agent Database Integration

This guide will help you set up and test the AI agent database integration feature.

## Prerequisites

- Node.js 18+ and Python 3.11+
- Access to NeonPro codebase
- Supabase project credentials
- OpenAI API key (for language model)

## Phase 1: Infrastructure Setup

### 1. Install Dependencies

#### Backend
```bash
cd apps/api
npm install @copilotkit/runtime ag-ui
# or
pnpm add @copilotkit/runtime ag-ui
```

#### Frontend
```bash
cd apps/web
npm install @copilotkit/react-core @copilotkit/react-ui
# or
pnpm add @copilotkit/react-core @copilotkit/react-ui
```

### 2. Backend Setup

Create the agent endpoint:
```typescript
// apps/api/src/routes/ai/data-agent.ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.post('/api/ai/data-agent', async (c) => {
  // TODO: Implement agent logic
  return c.json({
    success: true,
    response: {
      id: 'mock-response',
      type: 'text',
      content: {
        text: 'This is a mock response from the AI agent.'
      }
    }
  })
})

export default app
```

### 3. Frontend Setup

Create the chat component:
```typescript
// apps/web/src/components/ai/DataAgentChat.tsx
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotChat } from '@copilotkit/react-ui'

export function DataAgentChat() {
  return (
    <CopilotKit runtimeUrl="/api/ai/data-agent">
      <CopilotChat
        instructions="You are a helpful assistant for NeonPro healthcare system."
        labels={{
          title: 'NeonPro AI Assistant',
          initial: 'Hello! How can I help you today?'
        }}
      />
    </CopilotKit>
  )
}
```

## Phase 2: Testing the POC

### 1. Start Development Servers

```bash
# Terminal 1: Backend
cd apps/api
npm run dev

# Terminal 2: Frontend
cd apps/web
npm run dev
```

### 2. Test Basic Functionality

1. Open the application in your browser
2. Navigate to the page with the DataAgentChat component
3. Type a message like "Hello"
4. Verify you receive the mock response

## Phase 3: Database Integration

### 1. Create Data Service

```typescript
// apps/api/src/services/ai-data-service.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export class AIDataService {
  async getClientsByName(name: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .ilike('name', `%${name}%`)
    
    if (error) throw error
    return data
  }

  async getAppointmentsByDate(date: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (name)
      `)
      .gte('datetime', `${date}T00:00:00`)
      .lte('datetime', `${date}T23:59:59`)
      .order('datetime')
    
    if (error) throw error
    return data
  }

  async getFinancialSummary(period: 'week' | 'month' | 'year') {
    // Implement financial summary logic
  }
}
```

### 2. Update Agent Endpoint

Replace the mock logic with real data service calls:
```typescript
// In apps/api/src/routes/ai/data-agent.ts
import { AIDataService } from '../services/ai-data-service'

const dataService = new AIDataService()

app.post('/api/ai/data-agent', async (c) => {
  const { query, sessionId } = await c.req.json()
  
  // Parse query intent (simplified)
  if (query.toLowerCase().includes('agendamento')) {
    const appointments = await dataService.getAppointmentsByDate(new Date().toISOString().split('T')[0])
    return c.json({
      success: true,
      response: {
        type: 'list',
        content: {
          title: 'Agendamentos de Hoje',
          data: appointments,
          columns: [
            { key: 'datetime', label: 'Horário', type: 'datetime' },
            { key: 'clients.name', label: 'Cliente', type: 'text' },
            { key: 'status', label: 'Status', type: 'text' }
          ]
        }
      }
    })
  }
  
  // Handle other query types...
})
```

## Phase 4: Advanced Features

### 1. Natural Language Processing

Integrate with a language model service:
```typescript
// Use OpenAI or similar service to parse user intent
async function parseQueryIntent(query: string) {
  // Call LLM to extract intent
  // Return structured intent object
}
```

### 2. Rich UI Responses

Enhance responses with interactive elements:
```typescript
// In agent response
actions: [
  {
    id: 'view-details',
    label: 'Ver Detalhes',
    type: 'button',
    action: 'showAppointmentDetails',
    payload: { appointmentId: '123' }
  }
]
```

## Testing Scenarios

### Test Case 1: Appointments Query
1. Type: "Quais os próximos agendamentos?"
2. Expected: List of upcoming appointments
3. Verify: Data is from database, formatted correctly

### Test Case 2: Client Search
1. Type: "Buscar cliente Maria"
2. Expected: List of clients matching "Maria"
3. Verify: Only accessible clients shown

### Test Case 3: Financial Summary
1. Type: "Resumo financeiro mensal"
2. Expected: Financial summary chart/table
3. Verify: Numbers accurate, permissions respected

### Test Case 4: Access Denied
1. Try to access data outside your permissions
2. Expected: "Acesso negado" message
3. Verify: No sensitive data exposed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has proper CORS configuration
2. **RLS Policies**: Verify Supabase RLS policies allow service role access
3. **Environment Variables**: Check all required env variables are set
4. **Agent Not Responding**: Check logs for error messages

### Debug Mode

Enable debug logging:
```typescript
// Add to agent endpoint
console.log('Query:', query)
console.log('Intent:', intent)
console.log('Response:', response)
```

## Next Steps

1. Implement advanced NLP for better query understanding
2. Add support for more data types and queries
3. Implement caching for performance
4. Add analytics and monitoring
5. Deploy to production environment