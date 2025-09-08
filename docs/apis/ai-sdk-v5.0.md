# Vercel AI SDK v5.0 Best Practices - Version: 1.0.0

## Purpose & Scope

This rule establishes production-ready patterns and best practices for using the Vercel AI SDK v5.0, covering the redesigned chat system, agentic loop control, type-safe UI integration, streaming data parts, and advanced tool calling. Based on the major architectural improvements in v5.0.

## Core Principles

- **Type Safety First**: Leverage end-to-end type safety from server to client
- **Separation of Concerns**: Use UIMessage for UI state, ModelMessage for LLM communication
- **Streaming by Default**: Implement streaming for better user experience
- **Modular Architecture**: Use transport abstraction for flexible integrations
- **Agentic Control**: Implement precise control over multi-step AI workflows

## Key v5.0 Changes & Migration

### 1. Redesigned Chat with Message Separation

**MUST** separate UI and Model messages for better persistence and type safety:

```typescript
// ✅ DO: Use separate message types
import { convertToModelMessages, UIMessage, } from 'ai'

const uiMessages: UIMessage[] = await loadChatHistory(chatId,)
const modelMessages = convertToModelMessages(uiMessages,)

const result = await streamText({
  model: openai('gpt-4o',),
  messages: modelMessages,
},)

return result.toUIMessageStreamResponse({
  originalMessages: uiMessages,
  onFinish: ({ messages, responseMessage, },) => {
    // Save complete UIMessage array - your source of truth
    await saveChat({ chatId, messages, },)
  },
},)
```

### 2. Custom UIMessage Types for Type Safety

**MUST** define custom message types for your application:

```typescript
// ✅ DO: Define custom message type once
import { InferUITools, UIMessage, } from 'ai'

type MyMetadata = {
  model?: string
  totalTokens?: number
  createdAt?: number
}

type MyDataParts = {
  'data-weather': { city: string; weather?: string; status: 'loading' | 'success' }
  'data-notification': { message: string; level: 'info' | 'warning' | 'error' }
}

type MyUITools = InferUITools<typeof tools>
type MyUIMessage = UIMessage<MyMetadata, MyDataParts, MyUITools>

// Use across client and server
const { messages, } = useChat<MyUIMessage>()
const stream = createUIMessageStream<MyUIMessage>() /* ... */
```

### 3. Data Parts for Streaming Custom Data

**MUST** use data parts for streaming type-safe custom data:

```typescript
// ✅ DO: Server - Stream custom data with type safety
const stream = createUIMessageStream<MyUIMessage>({
  async execute({ writer, },) {
    const dataPartId = 'weather-1'

    // Send loading state
    writer.write({
      type: 'data-weather',
      id: dataPartId,
      data: { city: 'San Francisco', status: 'loading', },
    },)

    // Update with result (same ID replaces previous)
    const weather = await getWeather('San Francisco',)
    writer.write({
      type: 'data-weather',
      id: dataPartId,
      data: { city: 'San Francisco', weather, status: 'success', },
    },)
  },
},)

// ✅ DO: Client - Render typed data parts
{
  messages.map(message =>
    message.parts.map((part, index,) => {
      switch (part.type) {
        case 'data-weather':
          return (
            <div key={index}>
              {part.data.status === 'loading'
                ? `Getting weather for ${part.data.city}...`
                : `Weather in ${part.data.city}: ${part.data.weather}`}
            </div>
          )
      }
    },)
  )
}
```

### 4. Transient Data Parts for Status Updates

**SHOULD** use transient data parts for temporary UI updates:

```typescript
// ✅ DO: Server - Send transient notifications
writer.write({
  type: 'data-notification',
  data: { message: 'Processing...', level: 'info', },
  transient: true, // Won't be persisted in message history
},)

// ✅ DO: Client - Handle via onData callback
const [notification, setNotification,] = useState()

const { messages, } = useChat({
  onData: ({ data, type, },) => {
    if (type === 'data-notification') {
      setNotification({ message: data.message, level: data.level, },)
    }
  },
},)
```

## Advanced Chat Features

### 1. Type-Safe Tool Invocations with Streaming

**MUST** implement type-safe tool calling with automatic input streaming:

```typescript
// ✅ DO: Client - Handle tool states with type safety
{
  messages.map(message => (
    <>
      {message.parts.map(part => {
        switch (part.type) {
          case 'tool-getWeather':
            switch (part.state) {
              case 'input-streaming':
                return <div>Getting weather for {part.input.location}...</div>
              case 'input-available':
                return <div>Getting weather for {part.input.location}...</div>
              case 'output-available':
                return <div>Weather: {part.output}</div>
              case 'output-error':
                return <div>Error: {part.errorText}</div>
            }
            break
          case 'dynamic-tool':
            return (
              <div>
                <h4>Tool: {part.toolName}</h4>
                {part.state === 'output-available' && (
                  <pre>{JSON.stringify(part.output, null, 2)}</pre>
                )}
              </div>
            )
        }
      },)}
    </>
  ))
}
```

### 2. Message Metadata for Context

**SHOULD** attach metadata for tracking and display:

```typescript
// ✅ DO: Server - Send metadata
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part, },) => {
    if (part.type === 'start') {
      return { model: 'gpt-4o', createdAt: Date.now(), }
    }
    if (part.type === 'finish') {
      return {
        model: part.response.modelId,
        totalTokens: part.totalUsage.totalTokens,
      }
    }
  },
},)

// ✅ DO: Client - Display metadata
{
  messages.map(message => (
    <div key={message.id}>
      {message.metadata?.model && <span>Model: {message.metadata.model}</span>}
      {message.metadata?.totalTokens && <span>{message.metadata.totalTokens} tokens</span>}
      {/* Message content */}
    </div>
  ))
}
```

## Agentic Loop Control

### 1. stopWhen for Controlled Execution

**MUST** use stopWhen for precise agent control:

```typescript
// ✅ DO: Control agent execution with conditions
import { hasToolCall, stepCountIs, } from 'ai'

const result = await generateText({
  model: openai('gpt-4o',),
  tools: {/* your tools */},
  // Stop after 5 steps OR when finalAnswer tool is called
  stopWhen: [stepCountIs(5,), hasToolCall('finalAnswer',),],
},)
```

### 2. prepareStep for Dynamic Configuration

**MUST** use prepareStep for step-by-step control:

```typescript
// ✅ DO: Adjust settings per step
const result = await streamText({
  model: openai('gpt-4o',),
  messages: convertToModelMessages(messages,),
  tools: {/* your tools */},
  prepareStep: async ({ stepNumber, messages, },) => {
    if (stepNumber === 0) {
      return {
        model: openai('gpt-4o-mini',), // Different model for first step
        toolChoice: { type: 'tool', toolName: 'analyzeIntent', },
      }
    }

    // Compress context for longer conversations
    if (messages.length > 10) {
      return {
        model: openai('gpt-4-turbo',), // Larger context window
        messages: messages.slice(-10,),
      }
    }
  },
},)
```

### 3. Agent Abstraction for Reusability

**SHOULD** use Agent class for encapsulated agent logic:

```typescript
// ✅ DO: Create reusable agents
import { Experimental_Agent as Agent, stepCountIs, } from 'ai'

const codingAgent = new Agent({
  model: openai('gpt-4o',),
  system: 'You are a coding agent specializing in Next.js and TypeScript.',
  stopWhen: stepCountIs(10,),
  tools: {/* your tools */},
},)

// Use with generate or stream
const result = await codingAgent.generate({
  prompt: 'Build an AI coding agent.',
},)

const streamResult = await codingAgent.stream({
  prompt: 'Build an AI coding agent.',
},)
```

## Transport and Framework Integration

### 1. Custom Transport Configuration

**SHOULD** use custom transport for advanced scenarios:

```typescript
// ✅ DO: Configure custom transport behavior
const { messages, sendMessage, } = useChat({
  transport: new DefaultChatTransport({
    prepareSendMessagesRequest: ({ id, messages, trigger, messageId, },) => {
      if (trigger === 'submit-user-message') {
        return {
          body: {
            trigger: 'submit-user-message',
            id,
            message: messages[messages.length - 1],
            messageId,
          },
        }
      } else if (trigger === 'regenerate-assistant-message') {
        return {
          body: {
            trigger: 'regenerate-assistant-message',
            id,
            messageId,
          },
        }
      }
      throw new Error(`Unsupported trigger: ${trigger}`,)
    },
  },),
},)
```

### 2. Request-Level Configuration

**MUST** use request-level options for dynamic configuration:

```typescript
// ✅ DO: Configure per request
sendMessage(
  { text: input, },
  {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      'X-Custom-Header': 'custom-value',
    },
    body: {
      temperature: 0.7,
      max_tokens: 100,
      user_id: getCurrentUserId(),
    },
    metadata: {
      userId: 'user123',
      sessionId: 'session456',
    },
  },
)
```

## Tool Improvements in v5.0

### 1. Updated Tool Definition (parameters → inputSchema)

**MUST** use new tool definition format:

```typescript
// ✅ DO: v5.0 tool definition
const weatherTool = tool({
  description: 'Get the weather for a location',
  inputSchema: z.object({ location: z.string(), },), // was 'parameters'
  outputSchema: z.string(), // New in v5.0 (optional)
  execute: async ({ location, },) => {
    return `Weather in ${location}: sunny, 72°F`
  },
},)
```

### 2. Dynamic Tools for Runtime Tools

**SHOULD** use dynamic tools for MCP or runtime-defined tools:

```typescript
// ✅ DO: Handle dynamic tools
import { dynamicTool, } from 'ai'

const customDynamicTool = dynamicTool({
  description: 'Execute a custom user-defined function',
  inputSchema: z.object({},),
  execute: async input => {
    const { action, parameters, } = input as any
    return { result: `Executed ${action} with ${JSON.stringify(parameters,)}`, }
  },
},)

const result = await generateText({
  model: 'openai/gpt-4o',
  tools: {
    weatherTool, // Static tool with known types
    customDynamicTool, // Dynamic tool
  },
  onStepFinish: ({ toolCalls, },) => {
    for (const toolCall of toolCalls) {
      if (toolCall.dynamic) {
        console.log('Dynamic:', toolCall.toolName, toolCall.input,)
      } else {
        // Static tool: full type inference
        switch (toolCall.toolName) {
          case 'weather':
            console.log(toolCall.input.location,) // typed as string
            break
        }
      }
    }
  },
},)
```

### 3. Provider-Executed Tools

**SHOULD** use provider-executed tools when available:

```typescript
// ✅ DO: Use provider-executed tools
import { openai, } from '@ai-sdk/openai'

const result = await generateText({
  model: openai.responses('gpt-4o-mini',),
  tools: {
    web_search_preview: openai.tools.webSearchPreview({},),
  },
  // Results automatically appended to message history
},)
```

## Performance & Error Handling

### 1. Stream Error Handling

**MUST** implement proper error handling for streams:

```typescript
// ✅ DO: Handle stream errors
const result = streamText({
  model: openai('gpt-4o',),
  prompt: 'Generate content...',
  onError({ error, },) {
    console.error('Stream error:', error,)
    // Your error logging logic
  },
},)

// ✅ DO: Server error handling
return result.toUIMessageStreamResponse({
  onError: error => {
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  },
},)
```

### 2. Global Provider Configuration

**SHOULD** use global provider for simplified model switching:

```typescript
// ✅ DO: Set global provider once
import { openai, } from '@ai-sdk/openai'

// Initialize once during startup
globalThis.AI_SDK_DEFAULT_PROVIDER = openai

// Use anywhere with simple string
const result = streamText({
  model: 'gpt-4o', // Uses OpenAI provider without prefix
  prompt: 'Generate content...',
},)
```

## Common Pitfalls to Avoid

- **DON'T** mix v4 and v5 patterns (parameters vs inputSchema)
- **DON'T** use content property directly - use parts array instead
- **DON'T** forget to handle tool states (input-streaming, output-available, etc.)
- **DON'T** ignore transient data parts for status updates
- **DON'T** skip type definitions for custom UIMessage types
- **DON'T** use blocking UI when streaming is available

## Speech Generation & Transcription (Experimental)

### 1. Unified Speech API

**SHOULD** use unified speech API for consistent provider abstraction:

```typescript
// ✅ DO: Text-to-Speech generation
import { openai, } from '@ai-sdk/openai'
import { experimental_generateSpeech as generateSpeech, } from 'ai'

const { audio, } = await generateSpeech({
  model: openai.speech('tts-1',),
  text: 'Hello, world!',
  voice: 'alloy',
},)

// ✅ DO: Speech-to-Text transcription
import { experimental_transcribe as transcribe, } from 'ai'

const { text, segments, } = await transcribe({
  model: openai.transcription('whisper-1',),
  audio: await readFile('audio.mp3',),
},)
```

## Framework Support (Vue, Svelte, Angular)

### 1. Cross-Framework Compatibility

**MUST** use appropriate framework-specific hooks:

```typescript
// ✅ DO: Vue.js with Composition API
import { useChat } from '@ai-sdk/vue';

export default {
  setup() {
    const { messages, sendMessage } = useChat<MyUIMessage>();
    return { messages, sendMessage };
  }
};

// ✅ DO: Svelte with stores
import { useChat } from '@ai-sdk/svelte';

const { messages, sendMessage } = useChat<MyUIMessage>();

// ✅ DO: Angular with signals
import { useChat } from '@ai-sdk/angular';

@Component({...})
export class ChatComponent {
  private chat = useChat<MyUIMessage>();
  messages = this.chat.messages;
  sendMessage = this.chat.sendMessage;
}
```

## Advanced Streaming Features

### 1. Server-Sent Events (SSE) Protocol

**MUST** use SSE as the standard streaming protocol:

```typescript
// ✅ DO: SSE streaming is now default
const result = streamText({
  model: openai('gpt-4o',),
  prompt: 'Generate content...',
},)

// Automatically uses SSE for better debugging and reliability
return result.toUIMessageStreamResponse()
```

### 2. Raw Response Access

**SHOULD** access raw responses when needed for debugging:

```typescript
// ✅ DO: Access raw streaming chunks
const result = streamText({
  model: openai('gpt-4o-mini',),
  prompt: 'Generate content...',
  includeRawChunks: true,
},)

for await (const part of result.fullStream) {
  if (part.type === 'raw') {
    console.log('Raw chunk:', part.rawValue,)
  }
}

// ✅ DO: Access request/response bodies
const result = await generateText({
  model: openai('gpt-4o',),
  prompt: 'Write a haiku about debugging',
},)

console.log('Request:', result.request.body,)
console.log('Response:', result.response.body,)
```

### 3. Stream Transformations

**SHOULD** use stream transformations for custom processing:

```typescript
// ✅ DO: Use built-in smooth streaming
import { smoothStream, } from 'ai'

const result = streamText({
  model: openai('gpt-4o',),
  prompt: 'Generate content...',
  experimental_transform: smoothStream(),
},)

// ✅ DO: Custom transformation
const upperCaseTransform =
  <TOOLS extends ToolSet,>() => (options: { tools: TOOLS; stopStream: () => void },) =>
    new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      transform(chunk, controller,) {
        controller.enqueue(
          chunk.type === 'text'
            ? { ...chunk, text: chunk.text.toUpperCase(), }
            : chunk,
        )
      },
    },)

const result = streamText({
  model: openai('gpt-4o',),
  prompt: 'Generate content...',
  experimental_transform: upperCaseTransform(),
},)
```

## Migration from v4.0

### 1. Automated Migration

**MUST** use codemods for initial migration:

```bash
# ✅ DO: Run automated migration
npx @ai-sdk/codemod upgrade
```

### 2. Key Breaking Changes

**MUST** update these patterns manually:

```typescript
// ❌ DON'T: v4.0 patterns
const { messages, input, handleInputChange, handleSubmit, } = useChat()

// Tool definition
const tool = {
  parameters: z.object({ location: z.string(), },),
  execute: async ({ location, },) => {/* ... */},
}

// ✅ DO: v5.0 patterns
const { messages, sendMessage, } = useChat<MyUIMessage>()
const [input, setInput,] = useState('',)

// Tool definition
const tool = {
  inputSchema: z.object({ location: z.string(), },),
  outputSchema: z.string(), // Optional but recommended
  execute: async ({ location, },) => {/* ... */},
}
```

## Related Rules

- `@ai-sdk-v4.0.md`: Legacy patterns (for migration reference)
- `@react.md`: React component patterns and hooks usage
- `@error-handling.md`: Comprehensive error handling patterns

Files referenced: mention-files.md - Protocol for acknowledging rule files used in responses
