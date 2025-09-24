import { Counter, Registry } from 'prom-client'
import type { MetricLabels } from '../types'

// Chat-specific counters
let chatMessagesTotal: Counter<string> | null = null
let chatSessionsTotal: Counter<string> | null = null
let chatErrorsTotal: Counter<string> | null = null
let aiRequestsTotal: Counter<string> | null = null
let piiRedactionTotal: Counter<string> | null = null

export function initializeCounters(registry: Registry): void {
  // Total chat messages sent
  chatMessagesTotal = new Counter({
    name: 'chat_messages_total',
    help: 'Total number of chat messages processed',
    labelNames: ['user_type', 'session_id'],
    registers: [registry],
  })

  // Total chat sessions created
  chatSessionsTotal = new Counter({
    name: 'chat_sessions_total',
    help: 'Total number of chat sessions created',
    labelNames: ['user_type', 'source'],
    registers: [registry],
  })

  // Total chat errors
  chatErrorsTotal = new Counter({
    name: 'chat_errors_total',
    help: 'Total number of chat errors',
    labelNames: ['error_type', 'component'],
    registers: [registry],
  })

  // Total AI provider requests
  aiRequestsTotal = new Counter({
    name: 'ai_requests_total',
    help: 'Total number of AI provider requests',
    labelNames: ['provider', 'model', 'status'],
    registers: [registry],
  })

  // Total PII redactions
  piiRedactionTotal = new Counter({
    name: 'pii_redaction_total',
    help: 'Total number of PII redactions performed',
    labelNames: ['pii_type', 'context'],
    registers: [registry],
  })
}

export function incrementChatMessages(labels: MetricLabels = {}): void {
  chatMessagesTotal?.inc(labels)
}

export function incrementChatSessions(labels: MetricLabels = {}): void {
  chatSessionsTotal?.inc(labels)
}

export function incrementChatErrors(labels: MetricLabels = {}): void {
  chatErrorsTotal?.inc(labels)
}

export function incrementAIRequests(labels: MetricLabels = {}): void {
  aiRequestsTotal?.inc(labels)
}

export function incrementPIIRedaction(labels: MetricLabels = {}): void {
  piiRedactionTotal?.inc(labels)
}
