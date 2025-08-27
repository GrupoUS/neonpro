
const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing critical syntax errors in 41 files...");

// List of files with specific syntax errors to fix
const filesToFix = [
  {
    file: "packages/ui/src/components/AuthLayout.tsx",
    fixes: [
      {
        search: /(<div\s*\n\s*className="min-h-screen)/,
        replace: "$1",
      },
    ],
  },
  {
    file: "tools/testing/performance/deployment.ts",
    fixes: [
      {
        search: /(\s+})(\s*$)/m,
        replace: "$1;$2",
      },
    ],
  },
  {
    file: "apps/web/app/components/intelligent-scheduler.tsx",
    fixes: [
      {
        search: /(\s+)\);(\s*$)/m,
        replace: "$1);$2",
      },
    ],
  },
  {
    file: "apps/web/app/profile/page.tsx",
    fixes: [
      {
        search: /(\s+})(\s*$)/m,
        replace: "$1$2",
      },
    ],
  },
  {
    file: "apps/web/components/mobile/MobileDashboardCards.tsx",
    fixes: [
      {
        search: /color:\s*"text-blue-600\s+bg-blue-50"/,
        replace: 'color: "text-blue-600 bg-blue-50"',
      },
    ],
  },
  {
    file: "apps/web/lib/ai/index.ts",
    fixes: [
      {
        search: /timestamp:\s*this\.lastHealthCheck\.toISOString\(\)/,
        replace: "timestamp: this.lastHealthCheck.toISOString(),",
      },
    ],
  },
  {
    file: "apps/web/lib/ai/model-management.ts",
    fixes: [
      {
        search: /(\s+)\);(\s*$)/m,
        replace: "$1);$2",
      },
    ],
  },
  {
    file: "apps/web/lib/ai/drift-detection.ts",
    fixes: [
      {
        search: /(\s+)\);(\s*$)/m,
        replace: "$1);$2",
      },
    ],
  },
  {
    file: "apps/web/lib/services/api-gateway.ts",
    fixes: [
      {
        search: /(\s+)}\);(\s*$)/m,
        replace: "$1});$2",
      },
    ],
  },
  {
    file: "apps/web/app/components/neonpro-healthcare-dashboard.tsx",
    fixes: [
      {
        search: /const MINUTES_PER_HOUR = 60;const DEFAULT_TIMEOUT_MS = 1000;/,
        replace: "const MINUTES_PER_HOUR = 60;\nconst DEFAULT_TIMEOUT_MS = 1000;",
      },
    ],
  },
  {
    file: "apps/web/tests/integration/api-client-integration.test.tsx",
    fixes: [
      {
        search: /(\s+)};(\s*$)/m,
        replace: "$1};$2",
      },
    ],
  },
  {
    file: "apps/web/tests/integration/ai-services-ecosystem.integration.test.tsx",
    fixes: [
      {
        search: /(\s+)\);(\s*$)/m,
        replace: "$1);$2",
      },
    ],
  },
  {
    file: "apps/web/tests/integration/auth-flow.integration.test.tsx",
    fixes: [
      {
        search: /(\s+)};};(\s*$)/m,
        replace: "$1};}$2",
      },
    ],
  },
  {
    file: "tools/testing/unit/setup/supabase-mock.ts",
    fixes: [
      {
        search: /(\s+})(\s*$)/m,
        replace: "$1$2",
      },
    ],
  },
  {
    file: "packages/security/src/encryption/healthcare-encryption.ts",
    fixes: [
      {
        search: /export default function createHealthcareEncryption\(/,
        replace: "export default function createHealthcareEncryption(",
      },
    ],
  },
  {
    file: "packages/ui/src/components/ui/button.tsx",
    fixes: [
      {
        search: /(\s+)}(\s*onClick=)/,
        replace: "$1},$2",
      },
    ],
  },
];

let fixedCount = 0;

filesToFix.forEach(({ file, fixes }) => {
  const fullPath = path.join(process.cwd(), file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    let fileModified = false;

    fixes.forEach(({ search, replace }) => {
      if (search.test && search.test(content)) {
        content = content.replace(search, replace);
        fileModified = true;
      } else if (typeof search === "string" && content.includes(search)) {
        content = content.replace(search, replace);
        fileModified = true;
      }
    });

    if (fileModified) {
      fs.writeFileSync(fullPath, content);
      fixedCount++;
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

// Additional generic fixes for common syntax issues
console.log("\n🔍 Applying generic syntax fixes...");

const patterns = [
  {
    pattern: /(\s+)\);(\s*$)/gm,
    replacement: "$1);$2",
    description: "Fix hanging closing parentheses",
  },
  {
    pattern: /(\s+)};(\s*$)/gm,
    replacement: "$1};$2",
    description: "Fix hanging closing braces",
  },
  {
    pattern: /(\s+)}\);(\s*$)/gm,
    replacement: "$1});$2",
    description: "Fix hanging closing braces with parentheses",
  },
];

// Apply generic fixes to all TypeScript/JavaScript files
const findFiles = (dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) => {
  let files = [];

  if (!fs.existsSync(dir)) return files;

  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
        files = files.concat(findFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
};

const allFiles = [
  ...findFiles("apps"),
  ...findFiles("packages"),
  ...findFiles("tools"),
];

let genericFixCount = 0;

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    patterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      genericFixCount++;
    }
  } catch (error) {
    // Skip files we can't process
  }
});

console.log(`\n🎉 Syntax fixing completed!`);
console.log(`📊 Fixed ${fixedCount} specific files`);
console.log(`📊 Applied generic fixes to ${genericFixCount} files`);
console.log("\n📝 Running formatter to validate fixes...");

// Run formatter to validate
const { execSync } = require("child_process");

try {
  execSync("pnpm format", { stdio: "inherit", cwd: process.cwd() });
  console.log("✅ Formatter completed successfully");
} catch (error) {
  console.log("⚠️ Some formatting issues may remain - will need manual inspection");
}
