import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import Ajv from 'ajv'

const ROOT = path.resolve(__dirname, '../../..')
const SCHEMA_PATH = path.join(
  ROOT,
  'specs/001-turborepo-architecture-validation/contracts/validation-report.schema.yaml',
)
const REPORT_PATH = path.join(
  ROOT,
  'specs/001-turborepo-architecture-validation/validation.report.yaml',
)

describe('ValidationReport schema compliance', () => {
  it('validation.report.yaml matches contracts/validation-report.schema.yaml', () => {
    const schemaYaml = fs.readFileSync(SCHEMA_PATH, 'utf8')
    const reportYaml = fs.readFileSync(REPORT_PATH, 'utf8')

    const schema = YAML.parse(schemaYaml)
    const report = YAML.parse(reportYaml)

    const ajv = new Ajv({ allErrors: true, strict: false })
    const validate = ajv.compile(schema)
    const valid = validate(report)

    if (!valid) {
      // Helpful failure output
      const errors = JSON.stringify(validate.errors, null, 2)
      console.error('Schema validation errors:', errors)
    }

    expect(valid).toBe(true)
  })
})
