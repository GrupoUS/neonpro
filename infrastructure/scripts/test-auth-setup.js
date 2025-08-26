#!/usr/bin/env node

/**
 * Script para testar a configuração de autenticação
 * Verifica se todas as rotas e arquivos necessários estão criados
 */

const fs = require("node:fs");
const path = require("node:path");

const requiredFiles = [
  "app/auth/callback/route.ts",
  "app/auth/popup-callback/route.ts",
  "app/auth/auth-code-error/page.tsx",
  "app/dashboard/page.tsx",
  "middleware.ts",
  ".env.local",
  "docs/oauth-setup-checklist.md",
];

const projectRoot = path.join(__dirname, "..");
let allFilesExist = true;

requiredFiles.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  const exists = fs.existsSync(filePath);

  if (exists) {
  } else {
    allFilesExist = false;
  }
});

if (allFilesExist) {
} else {
}

// Verificar se .env.local tem placeholders
if (fs.existsSync(path.join(projectRoot, ".env.local"))) {
  const envContent = fs.readFileSync(
    path.join(projectRoot, ".env.local"),
    "utf8",
  );
  if (envContent.includes("your_supabase_anon_key_here")) {
  }
}
