/**
 * Simple utility tests
 */

import { describe, expect, it } from "vitest"

describe("Utilities", () => {
  describe("Array operations", () => {
    it("should filter arrays correctly", () => {
      const numbers = [1, 2, 3, 4, 5]
      const evens = numbers.filter(n => n % 2 === 0)
      expect(evens).toEqual([2, 4])
    })

    it("should map arrays correctly", () => {
      const numbers = [1, 2, 3]
      const doubled = numbers.map(n => n * 2)
      expect(doubled).toEqual([2, 4, 6])
    })
  })

  describe("Object operations", () => {
    it("should handle object properties", () => {
      const user = { name: "John", age: 30 }
      expect(user.name).toBe("John")
      expect(user.age).toBe(30)
    })
  })
})
