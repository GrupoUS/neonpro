import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useRealtimeQuery } from '../useRealtimeQuery'

const listeners: Array<(payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void> = []
const removeChannel = vi.fn()
const subscribe = vi.fn(() => ({ unsubscribe: vi.fn() }))
const on = vi.fn((_, __, handler: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void) => {
  listeners.push(handler)
  return mockChannel
})

const mockChannel = {
  on,
  subscribe,
}

const channel = vi.fn(() => mockChannel)

vi.mock('../../lib/supabase', () => ({
  supabase: {
    channel,
    removeChannel,
  },
}))

const createWrapper = (client: QueryClient) => ({ children }: { children: React.ReactNode }) => (
  React.createElement(QueryClientProvider, { client: client }, children)
)

describe('useRealtimeQuery performance', () => {
  beforeEach(() => {
    listeners.length = 0
    channel.mockClear()
    on.mockClear()
    subscribe.mockClear()
    removeChannel.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates and patches within the realtime latency budget', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(['appointments'], [{ id: 'existing' }])

    const wrapper = createWrapper(queryClient)
    const start = performance.now()

    const { unmount } = renderHook(
      () =>
        useRealtimeQuery({
          queryKey: ['appointments'],
          queryFn: async () => queryClient.getQueryData(['appointments']) ?? [],
          table: 'appointments',
          enableOptimisticUpdates: true,
        }),
      { wrapper },
    )

    expect(channel).toHaveBeenCalledWith(expect.stringContaining('appointments'))
    expect(on).toHaveBeenCalled()
    expect(subscribe).toHaveBeenCalled()
    expect(listeners.length).toBeGreaterThan(0)

    const handler = listeners[listeners.length - 1]
    const payload: RealtimePostgresChangesPayload<{ id: string }> = {
      commit_timestamp: new Date().toISOString(),
      eventType: 'INSERT',
      errors: null,
      schema: 'public',
      table: 'appointments',
      new: { id: 'inserted' },
      old: null,
      type: 'postgres_changes',
      columns: [],
      record: null,
      schema_version: '1',
      status: 'ok',
      txid: 0,
    }

    await act(async () => {
      handler(payload)
      await Promise.resolve()
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(1500)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['appointments'] })

    await waitFor(() => {
      const data = queryClient.getQueryData(['appointments']) as Array<{ id: string }> | undefined
      expect(data?.[0]?.id).toBe('inserted')
    })

    unmount()
    expect(removeChannel).toHaveBeenCalled()
  })
})
