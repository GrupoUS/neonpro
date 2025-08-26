#!/usr/bin/env node

/**
 * Script para testar configurações de produção
 * Verifica conectividade com Supabase e URLs de callback
 */

const https = require('node:https');
const fs = require('node:fs');

// Ler variáveis de ambiente
const envFile = '.env.local';
let supabaseUrl = '';
let _supabaseKey = '';

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

  if (urlMatch) {
    supabaseUrl = urlMatch[1].trim();
  }
  if (keyMatch) {
    _supabaseKey = keyMatch[1].trim();
  }
}

// Função para testar URL
function testUrl(url, _description) {
  return new Promise((resolve) => {
    const request = https.get(url, (_response) => {
      resolve(true);
    });

    request.on('error', (_error) => {
      resolve(false);
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

// Função principal de teste
async function runTests() {
  if (supabaseUrl) {
    await testUrl(supabaseUrl, 'Supabase Base URL');
    await testUrl(`${supabaseUrl}/auth/v1/settings`, 'Supabase Auth Settings');
  }
  await testUrl('https://neonpro.vercel.app', 'Site Principal');
  await testUrl('https://neonpro.vercel.app/login', 'Página de Login');
  if (supabaseUrl) {
  }
}

runTests().catch(console.error);
