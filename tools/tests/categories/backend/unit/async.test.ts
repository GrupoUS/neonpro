/**
 * Async operation tests
 */

import { describe, expect, it } from "vitest"

describe("Async Operations", () => {
  it("should handle promises", async () => {
    const promise = Promise.resolve("test")
    const result = await promise
    expect(result).toBe("test")
  })

  it("should handle promise rejection", async () => {
    const promise = Promise.reject(new Error("test error"))
    await expect(promise).rejects.toThrow("test error")
  })

  it("should handle setTimeout", async () => {
    const start = Date.now()
    await new Promise(resolve => setTimeout(resolve, 10))
    const duration = Date.now() - start
    expect(duration).toBeGreaterThanOrEqual(10)
  })
})
