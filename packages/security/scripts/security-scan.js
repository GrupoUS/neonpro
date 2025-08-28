/**
 * 🛡️ NEONPRO SECURITY SCANNER
 * Detecta API keys expostas antes de commits
 */

const fs = require("node:fs");
const path = require("node:path");

// Patterns de API keys sensíveis
const SENSITIVE_PATTERNS = [
  // OpenAI
  /sk-[a-zA-Z0-9]{40,}/g,
  // Anthropic
  /sk-ant-api03-[a-zA-Z0-9_-]+/g,
  // OpenRouter
  /sk-or-v1-[a-zA-Z0-9_-]+/g,
  // Google API
  /AIzaSy[a-zA-Z0-9_-]{33}/g,
  // Supabase
  /sbp_[a-zA-Z0-9]{40}/g,
  // Tavily
  /tvly-[a-zA-Z0-9_-]+/g,
  // Stripe
  /sk_test_[a-zA-Z0-9]+/g,
  /pk_test_[a-zA-Z0-9]+/g,
  // Generic patterns
  /[a-zA-Z0-9]{32,}/g,
];

// Arquivos a ignorar
const IGNORE_FILES = [
  ".env.local",
  ".env",
  ".env.example",
  "node_modules",
  ".git",
  "package-lock.json",
  "pnpm-lock.yaml",
];

// Extensões de arquivo para verificar
const CHECK_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".ps1",
  ".sh",
  ".md",
  ".json",
  ".yml",
  ".yaml",
]);

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const violations = [];

    SENSITIVE_PATTERNS.forEach((pattern, _index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // Ignorar placeholders óbvios
          if (
            match.includes("your_") ||
            match.includes("INSERT_") ||
            match.includes("REPLACE_") ||
            match.includes("example") ||
            match.length < 8
          ) {
            return;
          }

          violations.push({
            file: filePath,
            pattern: pattern.toString(),
            match: `${match.slice(0, 10)}...`, // Ocultar a key real
          });
        });
      }
    });

    return violations;
  } catch {
    return [];
  }
}

function scanDirectory(dirPath) {
  let allViolations = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);

      // Ignorar arquivos/diretórios específicos
      if (IGNORE_FILES.some((ignore) => item.includes(ignore))) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        allViolations = allViolations.concat(scanDirectory(fullPath));
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (CHECK_EXTENSIONS.has(ext)) {
          const violations = scanFile(fullPath);
          allViolations = allViolations.concat(violations);
        }
      }
    }
  } catch {}

  return allViolations;
}

const projectRoot = process.cwd();
const violations = scanDirectory(projectRoot);

if (violations.length > 0) {
  violations.forEach((_violation, _index) => {});
  process.exit(1);
} else {
  process.exit(0);
}
