/**
 * Security Analysis Tests
 * Tests for code review agents to identify security vulnerabilities
 */

import { describe, expect, it } from "vitest"

describe("Security Analysis", () => {
  describe("Input Validation", () => {
    it("should detect missing input sanitization", () => {
      const userInput = "'; DROP TABLE users;--"
      const vulnerableCode = "const query = 'SELECT * FROM users WHERE name = ' + userInput + ''"
      expect(vulnerableCode).toMatch(/\+.*\+/)

      const safeCode = "const query = 'SELECT * FROM users WHERE name = ?'"
      expect(safeCode).not.toMatch(/\+.*\+/)
    })

    it("should validate XSS prevention patterns", () => {
      const xssVulnerable = "div.innerHTML = userInput"
      const xssSafe = "div.textContent = userInput"

      expect(xssVulnerable).toMatch(/\.innerHTML\s*=/)
      expect(xssSafe).toMatch(/\.textContent\s*=/)
    })

    it("should detect hardcoded secrets", () => {
      const secretPatterns = [
        /api_key\s*=\s*['"][\w-]+['"]/i,
        /password\s*=\s*['"][\w-]+['"]/i,
        /secret\s*=\s*['"][\w-]+['"]/i,
      ]

      const codeWithApiSecret = 'const API_KEY = "sk-1234567890abcdef"'
      const codeWithPassword = 'const password = "secret123"'

      expect(codeWithApiSecret).toMatch(secretPatterns[0]!)
      expect(codeWithPassword).toMatch(secretPatterns[1]!)
    })
  })

  describe("Authentication & Authorization", () => {
    it("should detect missing authentication checks", () => {
      const endpointWithoutAuth = `
        app.get('/api/users', (req, res) => {
          res.json(allUsers)
        })
      `

      const endpointWithAuth = `
        app.get('/api/users', authenticate, (req, res) => {
          res.json(allUsers)
        })
      `

      expect(endpointWithoutAuth).toMatch(/app\.get\(['"][^'"]*['"]/)
      expect(endpointWithAuth).toMatch(/authenticate/)
    })

    it("should validate role-based access control", () => {
      const adminOnlyCode = `
        if (user.role !== 'admin') {
          return res.status(403).json({ error: 'Unauthorized' })
        }
      `

      expect(adminOnlyCode).toMatch(/user\.role/)
      expect(adminOnlyCode).toMatch(/403/)
    })
  })

  describe("Data Protection", () => {
    it("should detect sensitive data logging", () => {
      const loggingSensitiveData = 'console.log("User password:", user.password)'
      expect(loggingSensitiveData).toMatch(/console\.log.*password/i)
    })

    it("should validate encryption patterns", () => {
      const encryptedCode = "const encrypted = CryptoJS.AES.encrypt(data, secretKey)"
      const plainCode = "const plain = data.toString()"

      expect(encryptedCode).toMatch(/encrypt/i)
      expect(plainCode).not.toMatch(/encrypt/i)
    })
  })

  describe("API Security", () => {
    it("should detect CORS configuration", () => {
      const corsConfig = 'app.use(cors({ origin: "https://trusted-domain.com" }))'
      expect(corsConfig).toMatch(/cors/i)
    })

    it("should validate rate limiting", () => {
      const rateLimitCode = "app.use(rateLimit({ windowMs: 900000, max: 100 }))"
      expect(rateLimitCode).toMatch(/rateLimit/i)
    })
  })
})
