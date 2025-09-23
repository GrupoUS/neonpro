#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Fix remaining test syntax errors with sed-like precision
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
    const originalContent = content;

    // Precise pattern fixes
    content = content.replace(/vi\.mock\(_'(.*?)'/g, "vi.mock('$1'");
    content = content.replace(/vi\.mock\(_"(.*?)"/g, 'vi.mock("$1"');
    content = content.replace(/describe\(_'(.*?)'/g, "describe('$1'");
    content = content.replace(/describe\(_"(.*?)"/g, 'describe("$1"');
    content = content.replace(/it\(_'(.*?)'/g, "it('$1'");
    content = content.replace(/it\(_"(.*?)"/g, 'it("$1"');
    content = content.replace(/test\(_'(.*?)'/g, "test('$1'");
    content = content.replace(/test\(_"(.*?)"/g, 'test("$1"');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      totalFixed++;
      console.log(`Fixed: ${filePath}`);
    }
  });
});

console.log(`Total files fixed: ${totalFixed}`);
