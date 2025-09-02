# Vercel AI SDK Best Practices - Version: 1.0.0

## Purpose & Scope

This rule establishes production-ready patterns and best practices for using the Vercel AI SDK, covering streaming, tools, multimodal content, error handling, and API integration. Based on real-world implementation patterns from the platform.

## Core Principles

- **Streaming First**: Always prefer streaming responses for better UX
- **Error Resilience**: Implement comprehensive error handling with user-friendly messages
- **Type Safety**: Use TypeScript interfaces and Zod schemas for all AI interactions
- **Resource Management**: Properly handle stream splitting, tee operations, and cleanup
- **Provider Abstraction**: Design for multiple AI providers with consistent interfaces

## Implementation Guidelines

### 1. Streaming Text Generation

**MUST** use `streamText` for real-time text generation:

```typescript
import { streamText, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

// ✅ DO: Basic streaming with proper configuration
const result = await streamText({
  model: openai('gpt-4o'),
  messages: chatHistory,
  temperature: 0.7,
  maxTokens: 8192,
  experimental_transform: smoothStream(), // Improves streaming experience
});

// ✅ DO: Consume the stream properly
for await (const textPart of result.textStream) {
  console.log(textPart);
}

// ❌ DON'T: Block on generateText unless absolutely necessary
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'This blocks until complete'
});
```

### 2. Stream Management and Tee Operations

**MUST** handle stream splitting correctly for saving and response:

```typescript
// ✅ DO: Proper stream tee for dual processing
const streamResult = await createChatStream(modelId, messages, context);

if (!streamResult.textStream || typeof streamResult.textStream.tee !== 'function') {
  throw new Error("Stream is not teeable");
}

const [streamForSaving, streamForResponse] = streamResult.textStream.tee();

// Process streams independently
handleStreamSaving(streamForSaving, chatId, modelId); // Async
return buildStreamResponse(streamForResponse, headers);

// ❌ DON'T: Try to use the same stream twice
const stream = result.textStream;
processStream1(stream); // First consumer
processStream2(stream); // This will fail - stream already consumed
```

### 3. Multimodal Content Processing

**MUST** handle images, PDFs, and files correctly:

```typescript
// ✅ DO: Process different attachment types
const processedParts: Array<TextPart | ImagePart> = [];

for (const attachment of attachments) {
  if (attachment.contentType.startsWith('image/')) {
    processedParts.push({
      type: 'image',
      image: new URL(attachment.url),
      mimeType: attachment.contentType
    });
  } else if (attachment.contentType.startsWith('application/pdf')) {
    const pdfData = await downloadPdfData(attachment.url);
    processedParts.push({
      type: 'file',
      data: pdfData,
      mimeType: attachment.contentType,
      filename: attachment.name || 'document.pdf'
    } as any); // Type assertion for AI SDK file parts
  }
}

const message: CoreMessage = {
  role: 'user',
  content: processedParts.length > 0 ? processedParts : messageText
};
```

### 4. Tools and Structured Generation

**MUST** use `streamObject` with Zod schemas for structured data:

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

// ✅ DO: Define tools with proper schemas
const result = await streamText({
  model: openai('gpt-4o'),
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: prompt }],
  tools: {
    generateImage: tool({
      description: 'Generate a new image from scratch',
      parameters: z.object({
        reasoning: z.string().describe('Why you chose to generate a new image'),
        prompt: z.string().describe('The image generation prompt')
      }),
      execute: async ({ reasoning, prompt }) => {
        const imageResult = await generateImage({
          model: openai.image('gpt-image-1'),
          prompt,
          size: '1024x1024'
        });
        return { success: true, url: imageResult.image.url };
      }
    })
  },
  maxSteps: 1, // Limit tool execution steps
});

// ❌ DON'T: Use tools without proper validation
const badTool = {
  generateImage: async (params: any) => {
    return await generateImage({ prompt: params.prompt }); // No validation
  }
};
```

### 5. Provider Configuration and Flexibility

**MUST** design for multiple AI providers:

```typescript
// ✅ DO: Provider abstraction with configuration
const providers = {
  openai: () => openai(modelId),
  openrouter: () => createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })(modelId),
  anthropic: () => anthropic(modelId)
};

const getProvider = (modelId: string) => {
  if (modelId.includes('gpt')) return providers.openai();
  if (modelId.includes('claude')) return providers.anthropic();
  return providers.openrouter();
};

// ✅ DO: Provider-specific configurations
const streamConfig = {
  model: getProvider(modelId),
  ...commonOptions,
  // Provider-specific options
  ...(isOpenRouter && hasPdfs && {
    extraBody: {
      plugins: [{
        id: 'file-parser',
        pdf: { engine: 'pdf-text' }
      }]
    }
  })
};
```

### 6. Error Handling and Resilience

**MUST** implement comprehensive error handling:

```typescript
// ✅ DO: Structured error handling with user-friendly messages
async function createChatStream(modelId: string, messages: CoreMessage[]) {
  try {
    const result = await streamText({
      model: getProvider(modelId),
      messages,
      ...config
    });
    
    return result;
  } catch (error: unknown) {
    const isError = error instanceof Error;
    const errorMessage = isError ? error.message : String(error);
    
    // Provide specific error handling
    if (errorMessage.includes('context_length_exceeded')) {
      throw new Error('Conversation too long for this model. Start a new chat.');
    } else if (errorMessage.includes('rate_limit')) {
      throw new Error('Rate limit reached. Please try again later.');
    } else if (errorMessage.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    } else {
      throw new Error(`AI processing error: ${errorMessage}`);
    }
  }
}

// ❌ DON'T: Generic error handling without context
try {
  const result = await streamText(config);
} catch (error) {
  throw error; // No context or user-friendly message
}
```

### 7. Response Building and Headers

**MUST** configure proper headers for streaming:

```typescript
// ✅ DO: Build responses with appropriate headers
const buildStreamResponse = (stream: ReadableStream, additionalHeaders?: Headers) => {
  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Prevent proxy buffering
  });

  // Add custom headers
  if (additionalHeaders) {
    additionalHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return new Response(stream, { headers });
};

// ✅ DO: Use toDataStreamResponse with custom headers
return result.toDataStreamResponse({
  headers: buildResponseHeaders(chatId, sources)
});

// ❌ DON'T: Return streams without proper headers
return new Response(result.textStream); // Missing headers
```

### 8. Non-Streaming Operations

**SHOULD** use `generateText` for specific use cases:

```typescript
// ✅ DO: Use generateText for tool-based operations and short responses
const searchResult = await generateText({
  model: openai.responses('gpt-4o-mini'), // Specialized model for tools
  prompt: `Search the web for: "${query}"`,
  tools: {
    web_search_preview: openai.tools.webSearchPreview(config),
  },
  toolChoice: { type: 'tool', toolName: 'web_search_preview' },
  temperature: 0.3, // Lower temperature for accuracy
  maxTokens: 2048,
});

// ✅ DO: Process results and handle sources
const processedSources = (searchResult.sources || [])
  .filter(source => source.sourceType === 'url')
  .filter(source => isValidUrl(source.url))
  .slice(0, 6);

return {
  searchResults: searchResult.text,
  sources: processedSources
};
```

### 9. Configuration Best Practices

**MUST** use appropriate model configurations:

```typescript
// ✅ DO: Context-appropriate configurations
const configurations = {
  // Creative text generation
  creative: {
    temperature: 0.8,
    maxTokens: 4096,
    experimental_transform: smoothStream()
  },
  
  // Factual/search responses
  factual: {
    temperature: 0.3,
    maxTokens: 2048,
    maxRetries: 3
  },
  
  // Tool-based operations
  structured: {
    temperature: 0.1,
    maxTokens: 8192,
    maxSteps: 1
  }
};

// ✅ DO: Environment-based provider selection
const getModelConfig = (modelId: string) => {
  const baseConfig = configurations[getConfigType(modelId)];
  
  return {
    ...baseConfig,
    model: getProvider(modelId),
  };
};
```

### 10. Security and Validation

**MUST** validate all inputs and URLs:

```typescript
// ✅ DO: Validate URLs for security (SSRF protection)
function validateUrl(url: string): void {
  const parsedUrl = new URL(url);
  
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('Only HTTPS URLs are allowed');
  }
  
  const allowedDomains = [
    /^[a-z0-9-]+\.supabase\.co$/,
    /^[a-z0-9-]+\.storage\.supabase\.com$/,
  ];
  
  const isAllowed = allowedDomains.some(pattern => 
    pattern.test(parsedUrl.hostname)
  );
  
  if (!isAllowed) {
    throw new Error(`Domain not allowed: ${parsedUrl.hostname}`);
  }
}

// ✅ DO: Validate file sizes and types
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/', 'application/pdf'];

function validateAttachment(attachment: Attachment): void {
  if (!ALLOWED_TYPES.some(type => attachment.contentType.startsWith(type))) {
    throw new Error(`File type not allowed: ${attachment.contentType}`);
  }
}
```

## Advanced Patterns

### Stream Processing with Parallel Operations

```typescript
// ✅ DO: Run parallel operations during streaming
const [streamForSaving, streamForResponse] = result.textStream.tee();

// Start parallel operations
const savePromise = handleStreamSaving(streamForSaving, chatId, modelId);
const titlePromise = generateTitle(chatId, firstMessage);

// Return response immediately
const response = buildStreamResponse(streamForResponse, headers);

// Let parallel operations complete in background
Promise.all([savePromise, titlePromise]).catch(console.error);

return response;
```

### Conditional Tool Usage

```typescript
// ✅ DO: Conditional tool selection based on context
const getTools = (context: ChatContext) => {
  const tools: Record<string, any> = {};
  
  if (context.hasImages) {
    tools.editImage = createImageEditTool();
  }
  
  if (context.searchMode) {
    tools.webSearch = createWebSearchTool();
  }
  
  return Object.keys(tools).length > 0 ? tools : undefined;
};

const result = await streamText({
  model: getProvider(modelId),
  messages,
  tools: getTools(context),
  ...config
});
```

## Performance Considerations

- **Stream Tee Early**: Split streams as close to generation as possible
- **Async Processing**: Use background processing for non-critical operations
- **Resource Limits**: Set appropriate `maxTokens` and `maxSteps` limits
- **Connection Management**: Use proper headers for proxy/CDN compatibility
- **Memory Management**: Dispose of large file buffers after processing

## Debugging and Logging

```typescript
// ✅ DO: Comprehensive development logging
if (process.env.NODE_ENV === 'development') {
  console.log('[AI Agent] Configuration:', {
    modelId,
    messagesCount: messages.length,
    hasAttachments: messages.some(m => Array.isArray(m.content)),
    temperature: config.temperature,
    maxTokens: config.maxTokens
  });
}
```

## Common Pitfalls

- **DON'T** consume the same stream multiple times without tee()
- **DON'T** forget to handle stream errors in production
- **DON'T** use `any` types for AI SDK content parts (use type assertions with comments)
- **DON'T** ignore provider-specific configurations (extraBody, plugins)
- **DON'T** skip input validation for security-sensitive operations
- **DON'T** use high temperature for factual/structured responses

## Related Rules

- `@error-handling.md`: Comprehensive error handling patterns
- `@security.md`: Security best practices for AI applications
- `@performance.md`: Performance optimization techniques