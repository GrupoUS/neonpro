// Test utilities for consistent mock management across the test suite

/**
 * Get the global Supabase mock that's configured in vitest.setup.ts
 */
export function getGlobalSupabaseMock() {
  return global.mockSupabaseClient
}

/**
 * Reset all global mocks to their initial state
 */
export function resetAllGlobalMocks() {
  if (global.mockSupabaseClient) {
    // Reset all auth methods
    Object.values(global.mockSupabaseClient.auth,).forEach((method: unknown,) => {
      if (typeof method === 'function' && method.mockReset) {
        method.mockReset()
      }
    },)

    // Reset the from method
    if (global.mockSupabaseClient.from?.mockReset) {
      global.mockSupabaseClient.from.mockReset()
    }

    // Restore default implementations
    global.mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-123', }, session: { access_token: 'token', }, },
      error: undefined,
    },)

    global.mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: undefined,
    },)

    global.mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'token', }, },
      error: undefined,
    },)

    global.mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', }, },
      error: undefined,
    },)
  }

  if (global.mockReactHooks) {
    // Reset React hooks
    Object.values(global.mockReactHooks,).forEach((hook: unknown,) => {
      if (typeof hook === 'function' && hook.mockReset) {
        hook.mockReset()
      }
    },)
  }
}

/**
 * Create a test wrapper with common providers
 */
export function createTestWrapper(
  options: { queryClient?: unknown; router?: unknown } = {},
) {
  const { queryClient, router, } = options

  return ({ children, }: { children: React.ReactNode },) => {
    let wrapper = children

    if (queryClient) {
      wrapper = React.createElement(
        queryClient.Provider || queryClient,
        { client: queryClient, },
        wrapper,
      )
    }

    if (router) {
      wrapper = React.createElement(router, {}, wrapper,)
    }

    return wrapper
  }
}
