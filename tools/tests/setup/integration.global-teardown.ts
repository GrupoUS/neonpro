type GlobalTeardownContext = {
  testFiles?: string[]
  config?: { projects?: Array<{ name: string }> }
}

export default async function globalTeardown(_context?: GlobalTeardownContext) {
  const globalsToClear = [
    "testState",
    "aiTestState",
    "browser",
    "context",
    "testConfig",
  ]

  for (const key of globalsToClear) {
    if (key in global) {
      // @ts-expect-error - dynamic cleanup is expected in the test harness
      delete global[key]
    }
  }
}
