#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Fix remaining test syntax errors
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

    // Fix describe() patterns: _('text')_ -> 'text'
    content = content.replace(/describe\(_'(.*?)'_,/g, "describe('$1',");
    content = content.replace(/describe\(_"(.*?)"_,/g, 'describe("$1",');

    // Fix it() patterns: _('text')_ -> 'text'
    content = content.replace(/it\(_'(.*?)'_,/g, "it('$1',");
    content = content.replace(/it\(_"(.*?)"_,/g, 'it("$1",');

    // Fix test() patterns: _('text')_ -> 'text'
    content = content.replace(/test\(_'(.*?)'_,/g, "test('$1',");
    content = content.replace(/test\(_"(.*?)"_,/g, 'test("$1",');

    // Fix vi.mock() patterns: _('path')_ -> 'path'
    content = content.replace(/vi\.mock\(_'(.*?)'_,/g, "vi.mock('$1',");
    content = content.replace(/vi\.mock\(_"(.*?)"_,/g, 'vi.mock("$1",');

    // Fix async patterns: _async () -> async ()
    content = content.replace(/,_async \(\) => {/g, ", async () => {");

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      totalFixed++;
      console.log(`Fixed: ${filePath}`);
    }
  });
});

console.log(`Total files fixed: ${totalFixed}`);
