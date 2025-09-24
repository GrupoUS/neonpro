---
title: "AI SDK Essentials"
last_updated: 2025-09-24
form: reference
tags: [ai-sdk, vercel, streaming, essential]
related:
  - ./AGENTS.md
  - ./ai-agent-essentials.md
---

# AI SDK Essentials — Working Patterns

## Quick Setup

### Install Dependencies

```bash
pnpm add ai @ai-sdk/openai zod
```

### Environment

```bash
OPENAI_API_KEY=your_key_here
```

## Server Implementation (Hono)

```typescript
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { Hono } from 'hono'

const app = new Hono()

app.post('/api/chat', async (c) => {
  const { messages } = await c.req.json()

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: 'Você é um assistente para clínicas estéticas.',
  })

  return result.toDataStreamResponse()
})
```

## Client Implementation (React)

```tsx
import { useChat } from 'ai/react'

export function ChatInterface() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  return (
    <div>
      <div>
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Digite sua mensagem...'
        />
        <button disabled={isLoading}>Enviar</button>
      </form>
    </div>
  )
}
```

## Tool Calling

```typescript
import { tool } from 'ai'
import { z } from 'zod'

const tools = {
  getAppointments: tool({
    description: 'Buscar agendamentos',
    parameters: z.object({
      date: z.string().optional(),
    }),
    execute: async ({ date }) => {
      // Buscar no banco de dados
      const appointments = await db.appointments.findMany({
        where: date ? { date } : {},
      })
      return appointments
    },
  }),
}

// Use in streamText
const result = await streamText({
  model: openai('gpt-4o'),
  messages,
  tools,
})
```

## Healthcare Compliance

```typescript
// Redact PII in responses
const result = await streamText({
  model: openai('gpt-4o'),
  messages,
  onFinish: ({ text }) => {
    // Log for LGPD compliance
    logAIInteraction({
      userId: user.id,
      query: lastMessage,
      response: redactPII(text),
    })
  },
})
```

## Error Handling

```typescript
const { messages, error, retry } = useChat({
  api: '/api/chat',
  onError: (error) => {
    console.error('Chat error:', error)
    toast.error('Erro na conversa. Tente novamente.')
  },
})

if (error) {
  return (
    <div>
      <p>Erro: {error.message}</p>
      <button onClick={retry}>Tentar novamente</button>
    </div>
  )
}
```

## Performance Tips

```typescript
// Stream for better UX
const { messages, isLoading } = useChat({
  api: '/api/chat',
  streamMode: 'stream-data', // Better than "text"
})

// Debounce input
const debouncedInput = useMemo(
  () => debounce(setInput, 300),
  [],
)
```

## See Also

- [API Control Hub](./AGENTS.md)
- [AI Agent Essentials](./ai-agent-essentials.md)
