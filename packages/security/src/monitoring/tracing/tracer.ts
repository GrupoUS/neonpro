import { Span, trace, Tracer } from '@opentelemetry/api'
import type { TraceAttributes } from '../types'

export function createTracer(name: string): Tracer {
  return trace.getTracer(name)
}

export class TraceManager {
  private tracer: Tracer
  private activeSpans: Map<string, Span> = new Map()

  constructor(serviceName: string) {
    this.tracer = createTracer(serviceName)
  }

  startSpan(operationName: string, attributes?: TraceAttributes): Span {
    const span = this.tracer.startSpan(operationName, {
      attributes,
    })

    this.activeSpans.set(operationName, span)
    return span
  }

  endSpan(operationName: string, attributes?: TraceAttributes): void {
    const span = this.activeSpans.get(operationName)
    if (span) {
      if (attributes) {
        span.setAttributes(attributes)
      }
      span.end()
      this.activeSpans.delete(operationName)
    }
  }

  addEvent(
    operationName: string,
    eventName: string,
    attributes?: TraceAttributes,
  ): void {
    const span = this.activeSpans.get(operationName)
    if (span) {
      span.addEvent(eventName, attributes)
    }
  }

  setStatus(
    operationName: string,
    status: 'ok' | 'error',
    message?: string,
  ): void {
    const span = this.activeSpans.get(operationName)
    if (span) {
      span.setStatus({
        code: status === 'ok' ? 1 : 2, // OK = 1, ERROR = 2
        message,
      })
    }
  }

  async traceAsync<T>(
    operationName: string,
    fn: (span: Span) => Promise<T>,
    attributes?: TraceAttributes,
  ): Promise<T> {
    const span = this.startSpan(operationName, attributes)

    try {
      const result = await fn(span)
      this.setStatus(operationName, 'ok')
      return result
    } catch (error) {
      this.setStatus(
        operationName,
        'error',
        error instanceof Error ? error.message : 'Unknown error',
      )
      throw error
    } finally {
      this.endSpan(operationName)
    }
  }

  traceSync<T>(
    operationName: string,
    fn: (span: Span) => T,
    attributes?: TraceAttributes,
  ): T {
    const span = this.startSpan(operationName, attributes)

    try {
      const result = fn(span)
      this.setStatus(operationName, 'ok')
      return result
    } catch (error) {
      this.setStatus(
        operationName,
        'error',
        error instanceof Error ? error.message : 'Unknown error',
      )
      throw error
    } finally {
      this.endSpan(operationName)
    }
  }
}

// Global trace manager instance
export const globalTraceManager = new TraceManager('neonpro-chat')
