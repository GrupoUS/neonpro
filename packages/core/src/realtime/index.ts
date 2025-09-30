/**
 * Minimal RealtimeService stub for tests
 *
 * Provides:
 * - subscribeToAppointments(clinicId, callback)
 * - subscribeToChannel(options)
 * - unsubscribe(channelName)
 *
 * This stub is synchronous and deterministic for unit tests (no network).
 */

export type RealtimeChannel = {
  name: string
  unsubscribe: () => void
  send?: (payload: unknown) => void
}

export type SubscribeOptions = {
  channelName?: string
  tableName?: string
  filter?: string
  event?: string
  callback?: (payload: unknown) => void
  onSubscriptionError?: (err: unknown) => void
}

export class RealtimeService {
  private subscriptions: Map<string, RealtimeChannel> = new Map()

  subscribeToAppointments(clinicId: string, callback: (payload: unknown) => void) {
    const name = `appointments-${clinicId}`
    const channel: RealtimeChannel = {
      name,
      unsubscribe: () => {
        this.subscriptions.delete(name)
      },
      send: (payload: unknown) => {
        // Relay payload to callback synchronously for tests
        try {
          if (typeof callback === 'function') {
            callback(payload)
          }
        } catch (_err: unknown) {
          // swallow errors to keep tests deterministic
        }
      },
    }

    this.subscriptions.set(name, channel)
    return channel
  }

  subscribeToChannel(opts: SubscribeOptions) {
    const name = opts.channelName ?? `channel-${Math.random().toString(36).slice(2,8)}`
    const channel: RealtimeChannel = {
      name,
      unsubscribe: () => {
        this.subscriptions.delete(name)
      },
      send: (payload: unknown) => {
        if (typeof opts.callback === 'function') {
          try {
            opts.callback(payload)
          } catch (err: unknown) {
            if (typeof opts.onSubscriptionError === 'function') {
              opts.onSubscriptionError(err)
            }
          }
        }
      },
    }

    this.subscriptions.set(name, channel)
    return channel
  }

  unsubscribe(channelName: string) {
    const ch = this.subscriptions.get(channelName)
    if (ch && typeof ch.unsubscribe === 'function') {
      ch.unsubscribe()
    }
  }
}

export default RealtimeService
