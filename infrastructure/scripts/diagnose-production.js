#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de produção no Vercel
 * Verifica configurações, variáveis de ambiente e rotas
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE PRODUÇÃO - NEONPRO');
console.log('='.repeat(50));

// 1. Verificar estrutura de arquivos
console.log('\n📁 1. VERIFICANDO ESTRUTURA DE ARQUIVOS');
const requiredFiles = [
  'app/auth/popup-callback/route.ts',
  'app/auth/callback/route.ts',
  'app/dashboard/page.tsx',
  'contexts/auth-context.tsx',
  'middleware.ts',
  'vercel.json'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - AUSENTE`);
    missingFiles.push(file);
  }
});

// 2. Verificar variáveis de ambiente locais
console.log('\n🔧 2. VERIFICANDO VARIÁVEIS DE AMBIENTE LOCAIS');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} - Presente`);
    } else {
      console.log(`❌ ${varName} - AUSENTE`);
    }
  });
} else {
  console.log('❌ .env.local não encontrado');
}

// 3. Verificar configuração do Next.js
console.log('\n⚙️ 3. VERIFICANDO CONFIGURAÇÃO NEXT.JS');
if (fs.existsSync('next.config.mjs')) {
  console.log('✅ next.config.mjs encontrado');
  const config = fs.readFileSync('next.config.mjs', 'utf8');
  if (config.includes('ignoreBuildErrors: true')) {
    console.log('⚠️  Build errors estão sendo ignorados');
  }
} else {
  console.log('❌ next.config.mjs não encontrado');
}

// 4. Verificar configuração do Vercel
console.log('\n🚀 4. VERIFICANDO CONFIGURAÇÃO VERCEL');
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json encontrado');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('✅ vercel.json é válido');
    
    if (vercelConfig.functions) {
      console.log('✅ Configurações de função definidas');
    }
    
    if (vercelConfig.rewrites) {
      console.log('✅ Rewrites configurados');
    }
  } catch (error) {
    console.log('❌ vercel.json inválido:', error.message);
  }
} else {
  console.log('⚠️  vercel.json não encontrado (criado automaticamente)');
}

// 5. Verificar rotas de autenticação
console.log('\n🔐 5. VERIFICANDO ROTAS DE AUTENTICAÇÃO');
const authRoutes = [
  'app/auth/popup-callback/route.ts',
  'app/auth/callback/route.ts'
];

authRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    const content = fs.readFileSync(route, 'utf8');
    console.log(`✅ ${route}`);
    
    // Verificar se exporta GET
    if (content.includes('export async function GET')) {
      console.log(`  ✅ Exporta função GET`);
    } else {
      console.log(`  ❌ Não exporta função GET`);
    }
    
    // Verificar se usa createClient
    if (content.includes('createClient')) {
      console.log(`  ✅ Usa createClient`);
    } else {
      console.log(`  ❌ Não usa createClient`);
    }
  }
});

// 6. Resumo e recomendações
console.log('\n📋 6. RESUMO E RECOMENDAÇÕES');
if (missingFiles.length > 0) {
  console.log('❌ PROBLEMAS ENCONTRADOS:');
  missingFiles.forEach(file => {
    console.log(`   - ${file} está ausente`);
  });
}

console.log('\n🔧 PRÓXIMOS PASSOS PARA PRODUÇÃO:');
console.log('1. Verificar variáveis de ambiente no Vercel Dashboard');
console.log('2. Confirmar URLs no Supabase Dashboard:');
console.log('   - https://neonpro.vercel.app/auth/popup-callback');
console.log('   - https://neonpro.vercel.app/auth/callback');
console.log('3. Atualizar Google Console OAuth URLs');
console.log('4. Fazer redeploy no Vercel');
console.log('5. Testar fluxo OAuth em produção');

console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
