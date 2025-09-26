/**
 * Simple Agent Helpers Test Suite
 * Tests that @.claude/agents/code-review/ can use for validation
 * Following KISS and YAGNI principles
 */

import { describe, expect, it } from "vitest"

describe("Agent Validation Helpers", () => {
  describe("Basic Code Quality Checks", () => {
    it("should detect console statements in production code", () => {
      const code = `
        function debugExample() {
          console.log('Debug info')
          console.warn('Warning message')
          console.error('Error occurred')
        }
      `

      const hasConsoleStatements = /console\.(log|warn|error|info|debug)/.test(code)
      expect(hasConsoleStatements).toBe(true)
    })

    it("should detect TODO comments", () => {
      const code = `
        function processData() {
          // TODO: Implement this function
          // FIXME: This is broken
          return null
        }
      `

      const hasTodoComments = /\/\/\s*(TODO|FIXME|HACK|XXX)/.test(code)
      expect(hasTodoComments).toBe(true)
    })

    it("should detect basic TypeScript types", () => {
      const code = `
        interface User {
          id: number
          name: string
          email: string
        }
        
        function processUser(user: User) {
          return user.name
        }
      `

      const hasInterface = /interface\s+\w+/.test(code)
      const hasTypeAnnotation = /:\s*\w+/.test(code)
      expect(hasInterface).toBe(true)
      expect(hasTypeAnnotation).toBe(true)
    })
  })

  describe("Security Pattern Detection", () => {
    it("should detect potential XSS vulnerabilities", () => {
      const code = `
        function setHtmlContent(element: HTMLElement, content: string) {
          element.innerHTML = content // Potential XSS
        }
      `

      const hasInnerHTML = /innerHTML\s*=/.test(code)
      expect(hasInnerHTML).toBe(true)
    })

    it("should detect eval usage", () => {
      const code = `
        function evaluateExpression(expression: string) {
          return eval(expression) // Dangerous
        }
      `

      const hasEval = /eval\s*\(/.test(code)
      expect(hasEval).toBe(true)
    })

    it("should detect hardcoded secrets pattern", () => {
      const code = `
        const API_KEY = '12345-secret-key'
        const DATABASE_URL = 'mysql://user:password@localhost/db'
      `

      const hasSecretPattern = /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"][^'"]+['"]/.test(code)
      expect(hasSecretPattern).toBe(true)
    })
  })

  describe("Code Structure Analysis", () => {
    it("should detect function complexity", () => {
      const code = `
        function complexFunction(a: number, b: number, c: number) {
          if (a > 0) {
            if (b > 0) {
              if (c > 0) {
                return a + b + c
              }
            }
          }
          return 0
        }
      `

      const lines = code.split("\n").length
      const hasNestedIfs = (code.match(/if\s*\(/g) || []).length
      expect(lines).toBeGreaterThan(5)
      expect(hasNestedIfs).toBeGreaterThan(2)
    })

    it("should detect large functions", () => {
      const code = `
        function largeFunction() {
          // This function does too many things
          let result = ''
          for (let i = 0; i < 100; i++) {
            result += i.toString()
          }
          return result
        }
      `

      const lines = code.split("\n")
      expect(lines.length).toBeGreaterThan(8)
    })
  })

  describe("Healthcare Domain Specific", () => {
    it("should detect patient data handling", () => {
      const code = `
        interface Patient {
          id: string
          name: string
          medicalRecord: string
          sensitiveData: string
        }
        
        function processPatientData(patient: Patient) {
          return patient.medicalRecord
        }
      `

      const hasPatientInterface = /interface\s+Patient/.test(code)
      const hasSensitiveData = /sensitiveData|medicalRecord/.test(code)
      expect(hasPatientInterface).toBe(true)
      expect(hasSensitiveData).toBe(true)
    })

    it("should detect authentication patterns", () => {
      const code = `
        function authenticateUser(username: string, password: string) {
          // Authentication logic
          return validateCredentials(username, password)
        }
      `

      const hasAuthFunction = /authenticate|login|signin/.test(code)
      const hasPasswordParam = /password/.test(code)
      expect(hasAuthFunction).toBe(true)
      expect(hasPasswordParam).toBe(true)
    })
  })

  describe("Basic Performance Patterns", () => {
    it("should detect potential memory leaks", () => {
      const code = `
        function addEventListeners() {
          const button = document.getElementById('button')
          button.addEventListener('click', () => {
            console.log('clicked')
          })
          // No cleanup - potential memory leak
        }
      `

      const hasAddEventListener = /addEventListener/.test(code)
      const hasCleanup = /removeEventListener/.test(code)
      expect(hasAddEventListener).toBe(true)
      expect(hasCleanup).toBe(false)
    })

    it("should detect inefficient loops", () => {
      const code = `
        function processItems(items: any[]) {
          const result = []
          for (let i = 0; i < items.length; i++) {
            result.push(items[i].toUpperCase())
          }
          return result
        }
      `

      const hasForLoop = /for\s*\(.*;.*;.*\)/.test(code)
      const hasPushInLoop = /\.push\(/.test(code)
      expect(hasForLoop).toBe(true)
      expect(hasPushInLoop).toBe(true)
    })
  })

  describe("File and Import Analysis", () => {
    it("should detect import patterns", () => {
      const code = `
        import React from 'react'
        import { useState } from 'react'
        import { Button } from './components/Button'
        import * as utils from './utils'
        
        export function MyComponent() {
          return <Button>Click me</Button>
        }
      `

      const hasReactImport = /import\s+.*\breact\b/i.test(code)
      const hasRelativeImport = /import\s+.*\.\//.test(code)
      expect(hasReactImport).toBe(true)
      expect(hasRelativeImport).toBe(true)
    })

    it("should detect export patterns", () => {
      const code = `
        export const utils = {
          format: (date: Date) => date.toISOString(),
          validate: (data: any) => !!data
        }
        
        export default function main() {
          return 'hello world'
        }
      `

      const hasNamedExport = /export\s+(const|function|class)/.test(code)
      const hasDefaultExport = /export\s+default/.test(code)
      expect(hasNamedExport).toBe(true)
      expect(hasDefaultExport).toBe(true)
    })
  })
})
