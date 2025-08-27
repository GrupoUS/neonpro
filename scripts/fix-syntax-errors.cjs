const fs = require("fs").promises;

async function fixSyntaxErrors() {
  console.log("Fixing critical syntax errors...");

  const fixes = [
    // Fix missing semicolons and syntax issues
    {
      file: "tools/testing/unit/setup/supabase-mock.ts",
      search: /function setupAuditTrailMocks\(_mock: unknown\) \{$/m,
      replace: "function setupAuditTrailMocks(_mock: unknown) {\n  // Implementation here\n}",
    },
    {
      file: "tools/testing/__tests__/api/hono-performance.test.ts",
      search: /\}\);?\s*$/,
      replace: "});",
    },
    {
      file: "packages/security/src/encryption/healthcare-encryption.ts",
      search: /export function createHealthcareEncryption\(/,
      replace: "export default function createHealthcareEncryption(",
    },
    {
      file: "packages/ui/src/components/ui/button.tsx",
      search: /\s*\}\;\s*$/m,
      replace: "\n      }\n    };",
    },
  ];

  for (const fix of fixes) {
    try {
      const content = await fs.readFile(fix.file, "utf8");
      const newContent = content.replace(fix.search, fix.replace);
      if (content !== newContent) {
        await fs.writeFile(fix.file, newContent, "utf8");
        console.log(`Fixed: ${fix.file}`);
      }
    } catch (error) {
      console.log(`Could not fix ${fix.file}: ${error.message}`);
    }
  }

  console.log("Syntax error fixes completed.");
}

fixSyntaxErrors().catch(console.error);
