#!/usr/bin/env bun
/**
 * Debug Script for PII Validation Issues
 */

import { BrazilianPIIPatterns } from '../apps/api/src/lib/pii-redaction'

async function debugValidation() {
  console.error('🔍 Debugging PII Validation Issues')
  console.error('==================================\n')

  // Test CPF validation
  console.error('TEST 1: CPF Validation')
  const testCPF = '123.456.789-00'
  console.error(`Testing CPF: "${testCPF}"`)

  try {
    const isValid = BrazilianPIIPatterns.validateCPF(testCPF)
    console.error(`Validation result: ${isValid}`)

    // Test step by step
    const digits = testCPF.replace(/\D/g, '')
    console.error(`Digits: "${digits}" (length: ${digits.length})`)

    // Check for invalid sequences
    const sameDigits = /^(\d)\1{10}$/.test(digits)
    console.error(`All same digits: ${sameDigits}`)

    // Test check digit calculation
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i)
    }
    let checkDigit1 = 11 - (sum % 11)
    if (checkDigit1 >= 10) checkDigit1 = 0
    console.error(
      `First check digit calculated: ${checkDigit1}, actual: ${digits[9]}`,
    )

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i)
    }
    let checkDigit2 = 11 - (sum % 11)
    if (checkDigit2 >= 10) checkDigit2 = 0
    console.error(
      `Second check digit calculated: ${checkDigit2}, actual: ${digits[10]}`,
    )
  } catch (error) {
    console.error(`Validation error: ${error}`)
  }

  // Test context pattern
  console.error('\nTEST 2: Context Pattern Debugging')
  const contextText = 'Patient João Silva (CPF: 123.456.789-00)'
  const contextPattern =
    /(?:cpf|cadastro\s+de\s+pessoas?\s+físicas?)\s*[:=]\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi

  console.error(`Text: "${contextText}"`)
  console.error(`Pattern: ${contextPattern}`)

  const match = contextPattern.exec(contextText)
  if (match) {
    console.error(`Full match: "${match[0]}"`)
    console.error(
      `Groups: [${
        match
          .slice(1)
          .map(g => `"${g}"`)
          .join(', ')
      }]`,
    )
    console.error(`Group 1 (should be CPF): "${match[1]}"`)
  } else {
    console.error('No match found')
  }

  // Test different context patterns
  console.error('\nTEST 3: Alternative Context Patterns')
  const patterns = [
    /CPF:\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi,
    /\(CPF:\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\)/gi,
    /(?:cpf)\s*[:]\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi,
  ]

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    pattern.lastIndex = 0 // Reset
    const match = pattern.exec(contextText)
    console.error(
      `Pattern ${i + 1}: ${match ? `FOUND "${match[1]}"` : 'NOT FOUND'}`,
    )
  }

  // Test confidence calculation
  console.error('\nTEST 4: Confidence Calculation')
  const minConfidence = 0.7
  const isValid = true
  const confidence = isValid ? 0.9 : 0.5
  console.error(`Base confidence (valid=${isValid}): ${confidence}`)
  console.error(`Min confidence threshold: ${minConfidence}`)
  console.error(`Passes threshold: ${confidence >= minConfidence}`)
}

;(async () => {
  try {
    await debugValidation()
  } catch (error) {
    console.error(error)
  }
})()
