import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

describe('Quality Control Frontmatter Validation', () => {
  const filePath = resolve(__dirname, '../.github/prompts/quality-control.prompt.md')
  const fileContent = readFileSync(filePath, 'utf-8')

  // Extract frontmatter (between first and second ---)
  const frontmatterMatch = fileContent.match(/^---\n(.*?)\n---/s)
  // Ensure frontmatter is always a string and fail fast if not present
  const frontmatter = frontmatterMatch?.[1] ?? ''
  if (!frontmatter) {
    throw new Error(`Frontmatter not found in ${filePath}`)
  }

  it('should have valid YAML frontmatter with no parsing errors', () => {
    // This test will fail if frontmatter has syntax errors
    expect(() => {
      // Simple YAML parsing simulation
      const lines = frontmatter.split('\n')
      lines.forEach(line => {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) return

        // Check for basic key: value structure
        if (!line.includes(':')) {
          throw new Error(`Invalid YAML line: ${line}`)
        }

        // Check for proper quoting if needed
        const [_key, ...valueParts] = line.split(':') // changed 'key' -> '_key' to avoid unused-var warning
        const value = valueParts.join(':').trim()

        // Values with special characters should be quoted
        if (
          value && !value.startsWith('"') && !value.startsWith("'") &&
          (value.includes('{') || value.includes('[') || value.includes('#'))
        ) {
          throw new Error(`Unquoted complex value: ${line}`)
        }
      })
    }).not.toThrow()
  })

  it('should not have unknown frontmatter properties', () => {
    // This test will fail if there are properties that shouldn't be in frontmatter
    expect(() => {
      const lines = frontmatter.split('\n')
      lines.forEach(line => {
        if (line.trim().startsWith('title:')) {
          throw new Error(`Unknown property 'title' found in frontmatter`)
        }
        if (line.trim().startsWith('last_updated:')) {
          throw new Error(`Unknown property 'last_updated' found in frontmatter`)
        }
        if (line.trim().startsWith('form:')) {
          throw new Error(`Unknown property 'form' found in frontmatter`)
        }
        if (line.trim().startsWith('tags:')) {
          throw new Error(`Unknown property 'tags' found in frontmatter`)
        }
      })
    }).not.toThrow()
  })

  it('should not have unexpected tokens in frontmatter', () => {
    // This test will fail if there are parsing errors like "Unexpected token"
    expect(() => {
      // Check for common YAML syntax issues
      const lines = frontmatter.split('\n')
      lines.forEach((line, index) => {
        const trimmed = line.trim()

        // Check for lines that start with unexpected tokens
        if (
          trimmed && !trimmed.startsWith('#') &&
          !/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(trimmed)
        ) {
          throw new Error(`Unexpected token at line ${index + 1}: ${line}`)
        }
      })
    }).not.toThrow()
  })

  it('should not have file not found warnings', () => {
    // This test checks that referenced files exist
    expect(() => {
      // Extract file references from the content
      const fileReferences = [
        '../../docs/architecture/tech-stack.md',
        '../../docs/architecture/frontend-architecture.md',
        '../../docs/agents/apex-researcher.md',
        '../../.claude/commands/frontend-testing.md',
      ]

      fileReferences.forEach(ref => {
        const resolvedPath = resolve(__dirname, '../.github/prompts', ref)
        try {
          readFileSync(resolvedPath, 'utf-8')
        } catch (error) {
          // Include the original error message for better diagnostics and to avoid an unused variable
          throw new Error(
            `File not found: ${ref} — ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      })
    }).not.toThrow()
  })
})
