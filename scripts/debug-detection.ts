#!/usr/bin/env bun
/**
 * Debug Script for PII Detection Issues
 */

import {
  BrazilianPIIPatterns,
  PIIDetectionEngine,
  SecurityUtilities,
} from '../apps/api/src/lib/pii-redaction'

async function debugDetection() {
  console.error('🔍 Debugging PII Detection Issues')
  console.error('==================================\n')

  const engine = new PIIDetectionEngine()

  // Test 1: Basic CPF pattern
  console.error('TEST 1: Basic CPF Detection')
  const cpfText = '123.456.789-00'
  console.error(`Input: "${cpfText}"`)
  console.error(`CPF Pattern: ${BrazilianPIIPatterns.CPF_PATTERN}`)

  const cpfMatch = cpfText.match(BrazilianPIIPatterns.CPF_PATTERN)
  console.error(`Direct pattern match: ${cpfMatch ? 'FOUND' : 'NOT FOUND'}`)

  const cpfResults = engine.detectPII(cpfText)
  console.error(`Engine detection: ${cpfResults.length} items found`)
  cpfResults.forEach((r, i) => {
    console.error(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    )
  })

  // Test 2: CPF in context
  console.error('\nTEST 2: CPF in Context')
  const contextText = 'Patient João Silva (CPF: 123.456.789-00)'
  console.error(`Input: "${contextText}"`)

  const contextResults = engine.detectPII(contextText)
  console.error(`Engine detection: ${contextResults.length} items found`)
  contextResults.forEach((r, i) => {
    console.error(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    )
  })

  // Test 3: CPF context pattern
  console.error('\nTEST 3: Direct Context Pattern Test')
  console.error(
    `CPF Context Pattern: ${BrazilianPIIPatterns.CPF_CONTEXT_PATTERN}`,
  )
  const contextMatch = contextText.match(
    BrazilianPIIPatterns.CPF_CONTEXT_PATTERN,
  )
  console.error(
    `Direct context pattern match: ${contextMatch ? 'FOUND' : 'NOT FOUND'}`,
  )
  if (contextMatch) {
    console.error(`  Full match: "${contextMatch[0]}"`)
    console.error(`  CPF value: "${contextMatch[1]}"`)
  }

  // Test 4: Unicode normalization
  console.error('\nTEST 4: Unicode Normalization')
  const unicodeText = '１２３．４５６．７８９－００' // Fullwidth CPF
  console.error(`Input: "${unicodeText}"`)

  const normalizedText = SecurityUtilities.normalizeText(unicodeText)
  console.error(`Normalized: "${normalizedText}"`)
  console.error(`Changed: ${unicodeText !== normalizedText}`)

  const unicodeResults = engine.detectPII(unicodeText)
  console.error(
    `Engine detection on unicode: ${unicodeResults.length} items found`,
  )

  const normalizedResults = engine.detectPII(normalizedText)
  console.error(
    `Engine detection on normalized: ${normalizedResults.length} items found`,
  )

  // Test 5: Base64 detection
  console.error('\nTEST 5: Base64 Detection')
  const base64Text = 'Q1BGOiAxMjMuNDU2Ljc4OS0wMA==' // "CPF: 123.456.789-00" in base64
  console.error(`Input: "${base64Text}"`)

  const decodedStrings = SecurityUtilities.decodeBase64Safely(base64Text)
  console.error(`Decoded strings: ${decodedStrings.length}`)
  decodedStrings.forEach((str, i) => {
    console.error(`  ${i + 1}. "${str}"`)
  })

  const base64Results = engine.detectPII(base64Text, { scanBase64: true })
  console.error(
    `Engine detection with Base64 scanning: ${base64Results.length} items found`,
  )
  base64Results.forEach((r, i) => {
    console.error(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Base64: ${r.metadata?.detectedInBase64}`,
    )
  })

  // Test 6: Case sensitivity
  console.error('\nTEST 6: Case Sensitivity')
  const caseText = 'cpf: 123.456.789-00'
  console.error(`Input: "${caseText}"`)

  const caseResults = engine.detectPII(caseText)
  console.error(`Engine detection: ${caseResults.length} items found`)
  caseResults.forEach((r, i) => {
    console.error(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    )
  })
}

debugDetection().catch(console.error)
