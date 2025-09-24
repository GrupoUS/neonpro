#!/usr/bin/env bun
/**
 * Debug Script for PII Validation Issues
 */

import { BrazilianPIIPatterns } from '../apps/api/src/lib/pii-redaction';

async function debugValidation() {
  console.log('🔍 Debugging PII Validation Issues');
  console.log('==================================\n');

  // Test CPF validation
  console.log('TEST 1: CPF Validation');
  const testCPF = '123.456.789-00';
  console.log(`Testing CPF: "${testCPF}"`);

  try {
    const isValid = BrazilianPIIPatterns.validateCPF(testCPF);
    console.log(`Validation result: ${isValid}`);

    // Test step by step
    const digits = testCPF.replace(/\D/g, '');
    console.log(`Digits: "${digits}" (length: ${digits.length})`);

    // Check for invalid sequences
    const sameDigits = /^(\d)\1{10}$/.test(digits);
    console.log(`All same digits: ${sameDigits}`);

    // Test check digit calculation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;
    console.log(
      `First check digit calculated: ${checkDigit1}, actual: ${digits[9]}`,
    );

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;
    console.log(
      `Second check digit calculated: ${checkDigit2}, actual: ${digits[10]}`,
    );
  } catch (error) {
    console.log(`Validation error: ${error}`);
  }

  // Test context pattern
  console.log('\nTEST 2: Context Pattern Debugging');
  const contextText = 'Patient João Silva (CPF: 123.456.789-00)';
  const contextPattern =
    /(?:cpf|cadastro\s+de\s+pessoas?\s+físicas?)\s*[:=]\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi;

  console.log(`Text: "${contextText}"`);
  console.log(`Pattern: ${contextPattern}`);

  const match = contextPattern.exec(contextText);
  if (match) {
    console.log(`Full match: "${match[0]}"`);
    console.log(
      `Groups: [${
        match
          .slice(1)
          .map(g => `"${g}"`)
          .join(', ')
      }]`,
    );
    console.log(`Group 1 (should be CPF): "${match[1]}"`);
  } else {
    console.log('No match found');
  }

  // Test different context patterns
  console.log('\nTEST 3: Alternative Context Patterns');
  const patterns = [
    /CPF:\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi,
    /\(CPF:\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\)/gi,
    /(?:cpf)\s*[:]\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/gi,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    pattern.lastIndex = 0; // Reset
    const match = pattern.exec(contextText);
    console.log(
      `Pattern ${i + 1}: ${match ? `FOUND "${match[1]}"` : 'NOT FOUND'}`,
    );
  }

  // Test confidence calculation
  console.log('\nTEST 4: Confidence Calculation');
  const minConfidence = 0.7;
  const isValid = true;
  const confidence = isValid ? 0.9 : 0.5;
  console.log(`Base confidence (valid=${isValid}): ${confidence}`);
  console.log(`Min confidence threshold: ${minConfidence}`);
  console.log(`Passes threshold: ${confidence >= minConfidence}`);
}

debugValidation().catch(console.error);
