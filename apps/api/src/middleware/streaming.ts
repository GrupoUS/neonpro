import { Context, Next } from 'hono'
import { logger } from '../lib/logger'

/**
 * Server-Sent Events (SSE) middleware and utilities
 */

/**
 * Standard SSE headers for streaming responses
 */
export const sseHeaders = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Accel-Buffering': 'no', // Disable nginx buffering
}

/**
 * Formats data for SSE transmission
 */
export function formatSSEData(data: any, event?: string, id?: string): string {
  let result = ''

  if (id) {
    result += `id: ${id}\n`
  }

  if (event) {
    result += `event: ${event}\n`
  }

  const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
  const lines = dataStr.split('\n')

  for (const line of lines) {
    result += `data: ${line}\n`
  }

  result += '\n'
  return result
}

/**
 * Creates an SSE stream from async chunks
 */
export function sseStreamFromChunks(
  chunks: AsyncIterable<any>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chunks) {
          const sseData = formatSSEData(chunk)
          controller.enqueue(new TextEncoder().encode(sseData))
        }

        // Send final event to indicate completion
        const finalEvent = formatSSEData('[DONE]', 'complete')
        controller.enqueue(new TextEncoder().encode(finalEvent))

        controller.close()
      } catch {
        // Error caught but not used - handled by surrounding logic
        logger.error('SSE streaming error', {
          error: error instanceof Error ? error.message : String(error),
        })

        // Send error event
        const errorEvent = formatSSEData({ error: 'Stream failed' }, 'error')
        controller.enqueue(new TextEncoder().encode(errorEvent))
        controller.close()
      }
    },
  })
}

/**
 * Creates an SSE stream from a simple async generator
 */
export function createSSEStream(
  generator: () => AsyncGenerator<string, void, unknown>,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        const gen = generator()

        for await (const chunk of gen) {
          const sseData = formatSSEData(chunk)
          controller.enqueue(new TextEncoder().encode(sseData))
        }

        // Send completion event
        const doneEvent = formatSSEData('[DONE]', 'complete')
        controller.enqueue(new TextEncoder().encode(doneEvent))

        controller.close()
      } catch {
        // Error caught but not used - handled by surrounding logic
        logger.error('SSE generator error', {
          error: error instanceof Error ? error.message : String(error),
        })

        const errorEvent = formatSSEData(
          { error: 'Stream generation failed' },
          'error',
        )
        controller.enqueue(new TextEncoder().encode(errorEvent))
        controller.close()
      }
    },
  })
}

/**
 * Streaming middleware that sets up SSE headers and error handling
 */
export function streamingMiddleware() {
  return async (c: Context, next: Next) => {
    try {
      // Set SSE headers for streaming responses
      Object.entries(sseHeaders).forEach(([key, _value]) => {
        c.header(key, value)
      })

      // Add streaming context
      c.set('isStreaming', true)
      c.set('streamStartTime', Date.now())

      await next()

      // Return the response after next() completes
      return
    } catch {
      // Log streaming error context
      logger.error('Streaming middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
        method: c.req.method,
      })

      // Send error as SSE event
      const errorEvent = formatSSEData(
        {
          error: 'Streaming failed',
          message: error instanceof Error ? error.message : String(error),
        },
        'error',
      )

      return c.body(errorEvent, 500, sseHeaders)
    }
  }
}

/**
 * Creates a heartbeat stream to keep SSE connections alive
 */
export function createHeartbeatStream(
  intervalMs: number = 30000,
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        try {
          const heartbeat = formatSSEData('heartbeat', 'ping')
          controller.enqueue(new TextEncoder().encode(heartbeat))
        } catch {
          // Stop heartbeat on error
          clearInterval(interval)
          controller.close()
        }
      }, intervalMs)

      // Clean up on close
      return () => {
        clearInterval(interval)
      }
    },
  })
}

/**
 * Utility to merge multiple SSE streams
 */
export function mergeSSEStreams(
  ...streams: ReadableStream<Uint8Array>[]
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        const readers = streams.map((stream) => stream.getReader())

        const readPromises = readers.map(async (reader, index) => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
          } catch {
            // Log individual stream errors
            logger.error(`Stream ${index} error`, {
              error: error instanceof Error ? error.message : String(error),
            })
          } finally {
            reader.releaseLock()
          }
        })

        await Promise.all(readPromises)
        controller.close()
      } catch {
        // Log merge error details
        logger.error('Stream merge error', {
          error: error instanceof Error ? error.message : String(error),
        })
        controller.close()
      }
    },
  })
}

/**
 * Helper to create streaming response with proper headers
 */
export function createStreamingResponse(
  stream: ReadableStream<Uint8Array>,
  status: number = 200,
): Response {
  return new Response(stream, {
    status,
    headers: sseHeaders,
  })
}
