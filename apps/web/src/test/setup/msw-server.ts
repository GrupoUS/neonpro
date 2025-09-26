import { beforeAll, afterAll, afterEach } from 'vitest'
import { server as mswServer } from '../configs/msw-config'

// MSW Server lifecycle management following tools/tests patterns
export const setupMSWServer = () => {
  beforeAll(() => {
    // Start MSW server with healthcare-specific configuration
    mswServer.listen({
      onUnhandledRequest: 'error',
      quiet: true,
    })

    console.warn('🧪 MSW Server started - Healthcare API mocking enabled')
  })

  afterAll(() => {
    // Clean up MSW server after all tests
    mswServer.close()
    console.warn('🧪 MSW Server stopped')
  })

  afterEach(() => {
    // Reset handlers after each test to ensure isolation
    mswServer.resetHandlers()
  })
}

// Export server for direct access in tests
export { mswServer as server }

// Export mock data for test usage
export * from '../configs/msw-config'