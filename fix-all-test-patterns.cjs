#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Comprehensive fix for all test syntax patterns
const testDirs = [
  "/home/vibecode/neonpro/apps/api/src/__tests__",
  "/home/vibecode/neonpro/apps/api/tests",
];

let totalFixed = 0;

testDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (!file.endsWith(".test.ts") && !file.endsWith(".test.js")) return;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Fix the specific patterns still causing errors
    const originalContent = content;

    // Fix ALL vi.mock patterns: vi.mock_'path') -> vi.mock('path')
    content = content.replace(/vi\.mock\(_'(.*?)'_,/g, "vi.mock('$1',");
    content = content.replace(/vi\.mock\(_"(.*?)"_,/g, 'vi.mock("$1",');
    content = content.replace(/vi\.mock\(_'(.*?)'\)/g, "vi.mock('$1')");
    content = content.replace(/vi\.mock\(_"(.*?)"\)/g, 'vi.mock("$1")');

    // Fix ALL describe patterns: describe_'desc') -> describe('desc')
    content = content.replace(
      /describe\(_'(.*?)'_,\s*\(\) => {/g,
      "describe('$1', () => {",
    );
    content = content.replace(
      /describe\(_"(.*?)"_,\s*\(\) => {/g,
      'describe("$1", () => {',
    );

    // Fix ALL it patterns: it_'desc') -> it('desc')
    content = content.replace(
      /it\(_'(.*?)'_,\s*async \(\) => {/g,
      "it('$1', async () => {",
    );
    content = content.replace(
      /it\(_'(.*?)'_,\s*\(\) => {/g,
      "it('$1', () => {",
    );
    content = content.replace(
      /it\(_"(.*?)"_,\s*async \(\) => {/g,
      'it("$1", async () => {',
    );
    content = content.replace(
      /it\(_"(.*?)"_,\s*\(\) => {/g,
      'it("$1", () => {',
    );

    // Fix ALL test patterns: test_'desc') -> test('desc')
    content = content.replace(
      /test\(_'(.*?)'_,\s*\(\) => {/g,
      "test('$1', () => {",
    );
    content = content.replace(
      /test\(_"(.*?)"_,\s*\(\) => {/g,
      'test("$1", () => {',
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      totalFixed++;
      console.log(`Fixed: ${filePath}`);
    }
  });
});

console.log(`Total files fixed: ${totalFixed}`);
