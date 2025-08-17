#!/usr/bin/env node

/**
 * Script para testar a configuração de autenticação
 * Verifica se todas as rotas e arquivos necessários estão criados
 */

const fs = require('node:fs');
const path = require('node:path');

console.log('🧪 Testando configuração de autenticação NeonPro');
console.log('='.repeat(50));

const requiredFiles = [
  'app/auth/callback/route.ts',
  'app/auth/popup-callback/route.ts',
  'app/auth/auth-code-error/page.tsx',
  'app/dashboard/page.tsx',
  'middleware.ts',
  '.env.local',
  'docs/oauth-setup-checklist.md',
];

const projectRoot = path.join(__dirname, '..');
let allFilesExist = true;

console.log('\n📁 Verificando arquivos necessários:\n');

requiredFiles.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO NÃO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log(`\n${'='.repeat(50)}`);

if (allFilesExist) {
  console.log('\n✅ Todos os arquivos foram criados com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log(
    '1. Configure as variáveis em .env.local com suas chaves do Supabase'
  );
  console.log('2. Siga o checklist em docs/oauth-setup-checklist.md');
  console.log(
    '3. Configure o Supabase e Google Cloud Console conforme documentado'
  );
  console.log(
    '4. Execute pnpm run dev e teste o login em http://localhost:3000/login'
  );
} else {
  console.log('\n❌ Alguns arquivos estão faltando!');
  console.log('Execute novamente o processo de configuração.');
}

// Verificar se .env.local tem placeholders
if (fs.existsSync(path.join(projectRoot, '.env.local'))) {
  const envContent = fs.readFileSync(
    path.join(projectRoot, '.env.local'),
    'utf8'
  );
  if (envContent.includes('your_supabase_anon_key_here')) {
    console.log(
      '\n⚠️  ATENÇÃO: Não esqueça de atualizar as chaves em .env.local!'
    );
  }
}

console.log('\n');
