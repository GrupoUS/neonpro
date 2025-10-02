/**
 * Minimal stub for RealTimeService used by tests.
 * Provides async methods that return predictable mock results.
 * Intended only to satisfy Vitest mocks during test runs.
 */

export type RTResult = {
  success: boolean
  connectionId?: string
  error?: string
  clientsNotified?: number
  totalClients?: number
  [key: string]: any
}

export const RealTimeService = {
  async connect(url?: string): Promise<RTResult> {
    // Minimal behavior: resolve quickly with a mock connection id
    return {
      success: true,
      connectionId: 'mock-conn-1',
      url: url || 'ws://mock',
    }
  },

  async disconnect(): Promise<RTResult> {
    return { success: true }
  },

  async subscribe(channel: string, handler?: (...args: any[]) => void): Promise<RTResult> {
    return { success: true, channel }
  },

  async unsubscribe(channel: string): Promise<RTResult> {
    return { success: true, channel }
  },

  async emit(event: string, payload?: any): Promise<RTResult> {
    // Return a generic mock response that tests can assert against
    return {
      success: true,
      event,
      payload,
      clientsNotified: 1,
      totalClients: 1,
    }
  },
}
