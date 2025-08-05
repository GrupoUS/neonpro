#!/usr/bin/env node
/**
 * 🛡️ NEONPRO SECURITY SCANNER V2 - INTELLIGENT
 * Detecta API keys expostas com redução de falsos positivos
 */

const fs = require("node:fs");
const path = require("node:path");

// Patterns de API keys REALMENTE sensíveis
const SENSITIVE_PATTERNS = [
  // OpenAI
  { pattern: /sk-[a-zA-Z0-9]{40,}/g, name: "OpenAI API Key" },
  // Anthropic
  { pattern: /sk-ant-api03-[a-zA-Z0-9_-]+/g, name: "Anthropic API Key" },
  // OpenRouter
  { pattern: /sk-or-v1-[a-zA-Z0-9_-]+/g, name: "OpenRouter API Key" },
  // Google API
  { pattern: /AIzaSy[a-zA-Z0-9_-]{33}/g, name: "Google API Key" },
  // Supabase
  { pattern: /sbp_[a-zA-Z0-9]{40}/g, name: "Supabase Service Key" },
  // Tavily
  { pattern: /tvly-[a-zA-Z0-9_-]+/g, name: "Tavily API Key" },
  // Stripe REAL keys (não exemplos)
  { pattern: /sk_live_[a-zA-Z0-9]+/g, name: "Stripe LIVE Secret Key (CRÍTICO!)" },
  { pattern: /pk_live_[a-zA-Z0-9]+/g, name: "Stripe LIVE Publishable Key (CRÍTICO!)" },
];

// Pastas para ignorar (build folders, node_modules, etc.)
const IGNORED_PATTERNS = [
  /\.next\//,
  /node_modules\//,
  /\.git\//,
  /build\//,
  /dist\//,
  /coverage\//,
  /\.nyc_output\//,
  /vendor\//,
  /\.cache\//,
  /\.tsbuildinfo$/,
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
  "yarn.lock",
];

// Extensões de arquivo para verificar
const CHECK_EXTENSIONS = [
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
];

function isIgnored(filePath) {
  // Checar se o arquivo está nas pastas ignoradas
  for (const pattern of IGNORED_PATTERNS) {
    if (pattern.test(filePath)) {
      return true;
    }
  }

  // Checar se o arquivo está na lista de arquivos ignorados
  const _fileName = path.basename(filePath);
  return IGNORE_FILES.some((ignore) => filePath.includes(ignore));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const violations = [];

    SENSITIVE_PATTERNS.forEach(({ pattern, name }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        violations.push({
          file: filePath,
          pattern: name,
          match: `${match[0].substring(0, 20)}...`,
          line: content.substring(0, match.index).split("\n").length,
        });
      }
    });

    return violations;
  } catch (_error) {
    console.warn(`⚠️  Não foi possível ler: ${filePath}`);
    return [];
  }
}

function scanDirectory(dirPath) {
  const violations = [];

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (isIgnored(fullPath)) {
        continue;
      }

      if (item.isDirectory()) {
        violations.push(...scanDirectory(fullPath));
      } else if (item.isFile() && CHECK_EXTENSIONS.some((ext) => item.name.endsWith(ext))) {
        violations.push(...scanFile(fullPath));
      }
    }
  } catch (_error) {
    console.warn(`⚠️  Não foi possível ler diretório: ${dirPath}`);
  }

  return violations;
}

function main() {
  console.log("🛡️ INICIANDO SCAN DE SEGURANÇA INTELIGENTE NEONPRO...");

  const projectRoot = process.cwd();
  const violations = scanDirectory(projectRoot);

  if (violations.length === 0) {
    console.log("✅ SCAN LIMPO - Nenhuma chave sensível detectada!");
    console.log("🎯 Projeto seguro para commit.");
    process.exit(0);
  } else {
    console.log(`🚨 VULNERABILIDADES CRÍTICAS DETECTADAS: ${violations.length}`);
    violations.forEach((violation, index) => {
      console.log(`${index + 1}. 📁 ${violation.file}`);
      console.log(`   🔑 ${violation.pattern}`);
      console.log(`   ⚠️  Line ${violation.line}: ${violation.match}`);
      console.log("");
    });

    console.log("❌ COMMIT BLOQUEADO - API KEYS REAIS EXPOSTAS!");
    console.log("💡 AÇÃO: Mova as keys para .env.local ou use variáveis de ambiente");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile };
