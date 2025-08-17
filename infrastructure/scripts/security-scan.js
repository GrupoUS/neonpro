#!/usr/bin/env node
/**
 * 🛡️ NEONPRO SECURITY SCANNER
 * Detecta API keys expostas antes de commits
 */

const fs = require('node:fs');
const path = require('node:path');

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
  '.env.local',
  '.env',
  '.env.example',
  'node_modules',
  '.git',
  'package-lock.json',
  'pnpm-lock.yaml',
];

// Extensões de arquivo para verificar
const CHECK_EXTENSIONS = [
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.ps1',
  '.sh',
  '.md',
  '.json',
  '.yml',
  '.yaml',
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];

    SENSITIVE_PATTERNS.forEach((pattern, _index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // Ignorar placeholders óbvios
          if (
            match.includes('your_') ||
            match.includes('INSERT_') ||
            match.includes('REPLACE_') ||
            match.includes('example') ||
            match.length < 8
          ) {
            return;
          }

          violations.push({
            file: filePath,
            pattern: pattern.toString(),
            match: `${match.substring(0, 10)}...`, // Ocultar a key real
          });
        });
      }
    });

    return violations;
  } catch (_error) {
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
        if (CHECK_EXTENSIONS.includes(ext)) {
          const violations = scanFile(fullPath);
          allViolations = allViolations.concat(violations);
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao escanear ${dirPath}:`, error.message);
  }

  return allViolations;
}

// Executar scan
console.log('🛡️ INICIANDO SCAN DE SEGURANÇA NEONPRO...\n');

const projectRoot = process.cwd();
const violations = scanDirectory(projectRoot);

if (violations.length > 0) {
  console.log('🚨 VULNERABILIDADES DETECTADAS:\n');

  violations.forEach((violation, index) => {
    console.log(`${index + 1}. 📁 ${violation.file}`);
    console.log(`   🔑 Pattern: ${violation.pattern}`);
    console.log(`   ⚠️  Match: ${violation.match}`);
    console.log('');
  });

  console.log('❌ SCAN FALHOU - API KEYS EXPOSTAS DETECTADAS!');
  console.log('💡 AÇÃO: Mova as keys para .env.local ou use variáveis de ambiente');
  process.exit(1);
} else {
  console.log('✅ SCAN COMPLETO - NENHUMA VULNERABILIDADE DETECTADA');
  console.log('🛡️ Projeto seguro para commit');
  process.exit(0);
}
