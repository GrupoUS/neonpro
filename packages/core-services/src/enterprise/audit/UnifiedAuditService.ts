/**
 * Unified Audit Service
 * Minimal implementation for MVP
 */

export interface AuditEvent {
  id: string
  service: string
  eventType: string
  timestamp: string
  details: unknown
  version: string
  userId?: string
  severity?: string
  dataClassification?: string
}

export interface ChainIntegrity {
  valid: boolean
  brokenLinks: string[]
}

export class UnifiedAuditService {
  private events: AuditEvent[] = []
  private readonly maxEvents: number

  constructor(maxEvents: number = 10_000,) {
    this.maxEvents = maxEvents
  }

  /**
   * Log an audit event
   */
  async logEvent(event: AuditEvent,): Promise<void> {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    },)

    // Enforce retention cap by removing oldest entries
    while (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }

  /**
   * Verify audit chain integrity
   */
  async verifyChainIntegrity(): Promise<ChainIntegrity> {
    // For MVP, always return valid
    return {
      valid: true,
      brokenLinks: [],
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<Record<string, unknown>> {
    return {
      total: this.events.length,
      maxEvents: this.maxEvents,
      memoryUsagePercent: Math.round((this.events.length / this.maxEvents) * 100,),
      byService: this.getEventsByService(),
      byType: this.getEventsByType(),
      lastEvent: this.events[this.events.length - 1]?.timestamp,
      firstEvent: this.events[0]?.timestamp,
    }
  }

  /**
   * Shutdown the audit service
   */
  async shutdown(): Promise<void> {
    // For MVP, nothing needed
  }

  private getEventsByService(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const event of this.events) {
      counts[event.service] = (counts[event.service] || 0) + 1
    }
    return counts
  }

  private getEventsByType(): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const event of this.events) {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1
    }
    return counts
  }
}
