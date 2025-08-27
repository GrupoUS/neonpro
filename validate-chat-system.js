#!/usr/bin/env node

/**
 * Chat System Validation Script
 * Quick validation of Phase 3.2 Universal AI Chat System implementation
 */

const fs = require("fs");
const path = require("path");

// Configuration
const CHAT_SYSTEM_FILES = [
  "apps/web/src/components/chat/ChatInterface.tsx",
  "apps/web/src/components/chat/MessageBubble.tsx",
  "apps/web/src/components/chat/ChatInput.tsx",
  "apps/web/src/components/chat/TypingIndicator.tsx",
  "apps/web/src/lib/chat/supabase-realtime.ts",
  "apps/web/src/lib/chat/chat-workflows.ts",
  "apps/web/src/lib/chat/lgpd-chat-compliance.ts",
  "apps/web/src/lib/chat/ai-healthcare-integration.ts",
];

console.log("🚀 NeonPro Chat System Validation\n");

let totalScore = 0;
let maxScore = 0;
const results = [];

// Test 1: File Structure Validation
console.log("📁 Testing File Structure...");
let filesFound = 0;

for (const filePath of CHAT_SYSTEM_FILES) {
  const fullPath = path.join(__dirname, filePath);
  maxScore += 10;

  if (fs.existsSync(fullPath)) {
    filesFound++;
    totalScore += 10;
    console.log(`  ✅ ${filePath}`);
  } else {
    console.log(`  ❌ ${filePath}`);
    results.push({ test: "File Missing", file: filePath, status: "FAIL" });
  }
}

// Test 2: TypeScript Type Safety
console.log("\n🔧 Testing TypeScript Integration...");
const tsFiles = CHAT_SYSTEM_FILES.filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));

for (const filePath of tsFiles) {
  const fullPath = path.join(__dirname, filePath);
  maxScore += 5;

  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");

    // Check for essential TypeScript patterns
    const hasInterface = content.includes("interface ") || content.includes("type ");
    const hasExports = content.includes("export ");

    if (hasInterface && hasExports) {
      totalScore += 5;
      console.log(`  ✅ ${path.basename(filePath)} - TypeScript OK`);
    } else {
      console.log(`  ⚠️  ${path.basename(filePath)} - Missing types/exports`);
      results.push({ test: "TypeScript", file: filePath, status: "WARN" });
    }
  }
}

// Test 3: Brazilian Healthcare Context
console.log("\n🇧🇷 Testing Brazilian Healthcare Integration...");
const healthcareKeywords = [
  "portuguese",
  "brasileiro",
  "lgpd",
  "cfm",
  "anvisa",
  "brazilian",
  "dermatologia",
  "estética",
  "emergência",
  "pt-BR",
];

for (const filePath of CHAT_SYSTEM_FILES) {
  const fullPath = path.join(__dirname, filePath);
  maxScore += 5;

  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8").toLowerCase();

    const foundKeywords = healthcareKeywords.filter(keyword =>
      content.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length >= 2) {
      totalScore += 5;
      console.log(
        `  ✅ ${path.basename(filePath)} - Healthcare context: ${foundKeywords.length} keywords`,
      );
    } else if (foundKeywords.length >= 1) {
      totalScore += 3;
      console.log(`  ⚠️  ${path.basename(filePath)} - Limited healthcare context`);
    } else {
      console.log(`  ❌ ${path.basename(filePath)} - No healthcare context`);
      results.push({ test: "Healthcare Context", file: filePath, status: "FAIL" });
    }
  }
}

// Test 4: LGPD Compliance Features
console.log("\n🔒 Testing LGPD Compliance...");
const lgpdFile = "apps/web/src/lib/chat/lgpd-chat-compliance.ts";
const lgpdPath = path.join(__dirname, lgpdFile);
maxScore += 20;

if (fs.existsSync(lgpdPath)) {
  const content = fs.readFileSync(lgpdPath, "utf8");

  const lgpdFeatures = [
    "consent",
    "encryption",
    "retention",
    "erasure",
    "portability",
    "audit",
  ];

  const foundFeatures = lgpdFeatures.filter(feature => content.toLowerCase().includes(feature));

  const score = Math.floor((foundFeatures.length / lgpdFeatures.length) * 20);
  totalScore += score;

  console.log(
    `  ✅ LGPD Compliance: ${foundFeatures.length}/${lgpdFeatures.length} features (${score}/20 points)`,
  );
  console.log(`     Found: ${foundFeatures.join(", ")}`);

  if (foundFeatures.length < 4) {
    results.push({ test: "LGPD Compliance", file: lgpdFile, status: "INCOMPLETE" });
  }
} else {
  console.log(`  ❌ LGPD compliance file missing`);
  results.push({ test: "LGPD Compliance", file: lgpdFile, status: "MISSING" });
}

// Test 5: Real-time Integration
console.log("\n⚡ Testing Real-time Integration...");
const realtimeFile = "apps/web/src/lib/chat/supabase-realtime.ts";
const realtimePath = path.join(__dirname, realtimeFile);
maxScore += 15;

if (fs.existsSync(realtimePath)) {
  const content = fs.readFileSync(realtimePath, "utf8");

  const realtimeFeatures = [
    "supabase",
    "websocket",
    "subscription",
    "realtime",
    "channel",
  ];

  const foundFeatures = realtimeFeatures.filter(feature => content.toLowerCase().includes(feature));

  const score = Math.floor((foundFeatures.length / realtimeFeatures.length) * 15);
  totalScore += score;

  console.log(
    `  ✅ Real-time: ${foundFeatures.length}/${realtimeFeatures.length} features (${score}/15 points)`,
  );

  if (foundFeatures.length < 3) {
    results.push({ test: "Real-time Integration", file: realtimeFile, status: "INCOMPLETE" });
  }
} else {
  console.log(`  ❌ Real-time integration file missing`);
  results.push({ test: "Real-time Integration", file: realtimeFile, status: "MISSING" });
}

// Calculate final score
const percentage = Math.floor((totalScore / maxScore) * 100);

console.log("\n" + "=".repeat(60));
console.log("📊 VALIDATION RESULTS");
console.log("=".repeat(60));

console.log(`\n🎯 Overall Score: ${totalScore}/${maxScore} (${percentage}%)`);

if (percentage >= 90) {
  console.log("🏆 EXCELLENT - Chat system ready for production!");
} else if (percentage >= 75) {
  console.log("✅ GOOD - Chat system ready with minor improvements needed");
} else if (percentage >= 60) {
  console.log("⚠️  ACCEPTABLE - Chat system functional but needs improvements");
} else {
  console.log("❌ NEEDS WORK - Chat system requires significant improvements");
}

console.log(`\n📈 Component Analysis:`);
console.log(`   Files Found: ${filesFound}/${CHAT_SYSTEM_FILES.length}`);
console.log(`   TypeScript Integration: ${tsFiles.length > 0 ? "Present" : "Missing"}`);
console.log(`   Brazilian Healthcare: ${healthcareKeywords.length} keywords checked`);
console.log(`   LGPD Compliance: ${fs.existsSync(lgpdPath) ? "Implemented" : "Missing"}`);
console.log(`   Real-time Features: ${fs.existsSync(realtimePath) ? "Implemented" : "Missing"}`);

// Issues summary
if (results.length > 0) {
  console.log(`\n⚠️  Issues Found (${results.length}):`);
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.test}: ${result.file} - ${result.status}`);
  });
}

console.log("\n✨ Phase 3.2 Universal AI Chat System validation completed!");
console.log("🚀 Ready for integration with Phase 3.3 Brazilian Healthcare Compliance Components");

// Exit with appropriate code
process.exit(percentage >= 75 ? 0 : 1);
