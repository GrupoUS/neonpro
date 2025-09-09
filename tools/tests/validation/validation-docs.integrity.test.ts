import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '../../..')

const PLAN_MD = path.join(
  ROOT,
  'specs/001-turborepo-architecture-validation/plan.md',
)
const QUICKSTART_MD = path.join(
  ROOT,
  'specs/001-turborepo-architecture-validation/quickstart.md',
)
const REPORT_YAML = path.join(
  ROOT,
  'specs/001-turborepo-architecture-validation/validation.report.yaml',
)

describe('Validation docs integrity', () => {
  it('plan.md contains Quality Gates section', () => {
    const text = fs.readFileSync(PLAN_MD, 'utf8')
    expect(text).toMatch(/##\s+Quality Gates/i)
    expect(text).toMatch(/PASS/i)
  })

  it('quickstart.md contains Validate Setup steps', () => {
    const text = fs.readFileSync(QUICKSTART_MD, 'utf8')
    expect(text).toMatch(/##\s+Validate Setup/i)
    expect(text).toMatch(/Full Code Check/i)
  })

  it('validation.report.yaml has required top-level keys', () => {
    const text = fs.readFileSync(REPORT_YAML, 'utf8')
    // quick heuristic checks without parsing
    expect(text).toMatch(/\bcontext:\s*$/m)
    expect(text).toMatch(/\bchecks:\s*$/m)
    expect(text).toMatch(/\bsummary:\s*$/m)
  })
})
