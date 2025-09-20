#!/usr/bin/env bun
/**
 * Debug Script for PII Detection Issues
 */

import {
  PIIDetectionEngine,
  BrazilianPIIPatterns,
  SecurityUtilities,
} from "../apps/api/src/lib/pii-redaction";

async function debugDetection() {
  console.log("🔍 Debugging PII Detection Issues");
  console.log("==================================\n");

  const engine = new PIIDetectionEngine();

  // Test 1: Basic CPF pattern
  console.log("TEST 1: Basic CPF Detection");
  const cpfText = "123.456.789-00";
  console.log(`Input: "${cpfText}"`);
  console.log(`CPF Pattern: ${BrazilianPIIPatterns.CPF_PATTERN}`);

  const cpfMatch = cpfText.match(BrazilianPIIPatterns.CPF_PATTERN);
  console.log(`Direct pattern match: ${cpfMatch ? "FOUND" : "NOT FOUND"}`);

  const cpfResults = engine.detectPII(cpfText);
  console.log(`Engine detection: ${cpfResults.length} items found`);
  cpfResults.forEach((r, i) => {
    console.log(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    );
  });

  // Test 2: CPF in context
  console.log("\nTEST 2: CPF in Context");
  const contextText = "Patient João Silva (CPF: 123.456.789-00)";
  console.log(`Input: "${contextText}"`);

  const contextResults = engine.detectPII(contextText);
  console.log(`Engine detection: ${contextResults.length} items found`);
  contextResults.forEach((r, i) => {
    console.log(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    );
  });

  // Test 3: CPF context pattern
  console.log("\nTEST 3: Direct Context Pattern Test");
  console.log(
    `CPF Context Pattern: ${BrazilianPIIPatterns.CPF_CONTEXT_PATTERN}`,
  );
  const contextMatch = contextText.match(
    BrazilianPIIPatterns.CPF_CONTEXT_PATTERN,
  );
  console.log(
    `Direct context pattern match: ${contextMatch ? "FOUND" : "NOT FOUND"}`,
  );
  if (contextMatch) {
    console.log(`  Full match: "${contextMatch[0]}"`);
    console.log(`  CPF value: "${contextMatch[1]}"`);
  }

  // Test 4: Unicode normalization
  console.log("\nTEST 4: Unicode Normalization");
  const unicodeText = "１２３．４５６．７８９－００"; // Fullwidth CPF
  console.log(`Input: "${unicodeText}"`);

  const normalizedText = SecurityUtilities.normalizeText(unicodeText);
  console.log(`Normalized: "${normalizedText}"`);
  console.log(`Changed: ${unicodeText !== normalizedText}`);

  const unicodeResults = engine.detectPII(unicodeText);
  console.log(
    `Engine detection on unicode: ${unicodeResults.length} items found`,
  );

  const normalizedResults = engine.detectPII(normalizedText);
  console.log(
    `Engine detection on normalized: ${normalizedResults.length} items found`,
  );

  // Test 5: Base64 detection
  console.log("\nTEST 5: Base64 Detection");
  const base64Text = "Q1BGOiAxMjMuNDU2Ljc4OS0wMA=="; // "CPF: 123.456.789-00" in base64
  console.log(`Input: "${base64Text}"`);

  const decodedStrings = SecurityUtilities.decodeBase64Safely(base64Text);
  console.log(`Decoded strings: ${decodedStrings.length}`);
  decodedStrings.forEach((str, i) => {
    console.log(`  ${i + 1}. "${str}"`);
  });

  const base64Results = engine.detectPII(base64Text, { scanBase64: true });
  console.log(
    `Engine detection with Base64 scanning: ${base64Results.length} items found`,
  );
  base64Results.forEach((r, i) => {
    console.log(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Base64: ${r.metadata?.detectedInBase64}`,
    );
  });

  // Test 6: Case sensitivity
  console.log("\nTEST 6: Case Sensitivity");
  const caseText = "cpf: 123.456.789-00";
  console.log(`Input: "${caseText}"`);

  const caseResults = engine.detectPII(caseText);
  console.log(`Engine detection: ${caseResults.length} items found`);
  caseResults.forEach((r, i) => {
    console.log(
      `  ${i + 1}. Type: ${r.type}, Value: "${r.value}", Confidence: ${r.confidence}`,
    );
  });
}

debugDetection().catch(console.error);
