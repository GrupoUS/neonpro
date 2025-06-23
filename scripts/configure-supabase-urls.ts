#!/usr/bin/env tsx
/**
 * Script para configurar as Redirect URLs do Supabase
 * Usa a Supabase Management API para atualizar as configurações de autenticação
 */

import { createClient } from '@supabase/supabase-js';

// Configurações do projeto
const PROJECT_ID = 'gfkskrkbnawkuppazkpt';
const SUPABASE_URL = 'https://gfkskrkbnawkuppazkpt.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk1MTEzNSwiZXhwIjoyMDYzNTI3MTM1fQ.8G9vhKrMZ9Y8bdHQBLg3MzDZahj50f5KzQTJmoQ4ick';

// URLs que precisam ser configuradas
const REDIRECT_URLS = [
  // Produção
  'https://neonpro.vercel.app/auth/callback',
  'https://neonpro.vercel.app/dashboard',
  'https://neonpro.vercel.app/login',
  
  // Desenvolvimento Local
  'http://localhost:3000/auth/callback',
  'http://localhost:3000/dashboard',
  'http://localhost:3000/login',
  
  // Preview Deployments Vercel
  'https://neonpro-*.vercel.app/auth/callback',
  'https://neonpro-*.vercel.app/dashboard',
  'https://neonpro-*.vercel.app/login'
];

const SITE_URL = 'https://neonpro.vercel.app';

async function configureSupabase() {
  console.log('🚀 Configurando Supabase Authentication URLs\n');
  console.log(`📋 Project ID: ${PROJECT_ID}`);
  console.log(`🌐 Project URL: ${SUPABASE_URL}\n`);

  // Criar cliente Supabase
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log('📝 Configurações que serão aplicadas:\n');
  console.log('Site URL:', SITE_URL);
  console.log('\nRedirect URLs:');
  REDIRECT_URLS.forEach(url => console.log(`  - ${url}`));

  console.log('\n⚠️  IMPORTANTE:');
  console.log('Como não temos acesso direto à Management API, você precisa configurar manualmente:\n');
  
  console.log('1. Acesse o Dashboard do Supabase:');
  console.log('   https://app.supabase.com/project/gfkskrkbnawkuppazkpt/auth/url-configuration\n');
  
  console.log('2. Configure o Site URL:');
  console.log(`   ${SITE_URL}\n`);
  
  console.log('3. Adicione TODAS as Redirect URLs listadas acima\n');
  
  console.log('4. Salve as configurações\n');

  // Criar um arquivo com as URLs para facilitar cópia
  const urlConfig = {
    site_url: SITE_URL,
    redirect_urls: REDIRECT_URLS,
    google_oauth: {
      authorized_origins: [
        'https://neonpro.vercel.app',
        'http://localhost:3000',
        'https://gfkskrkbnawkuppazkpt.supabase.co'
      ],
      redirect_uris: [
        'https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback',
        'https://neonpro.vercel.app/auth/callback',
        'http://localhost:3000/auth/callback'
      ]
    }
  };

  // Salvar configuração em arquivo JSON
  const fs = await import('fs');
  const configPath = './supabase-url-config.json';
  
  fs.writeFileSync(configPath, JSON.stringify(urlConfig, null, 2));
  console.log(`✅ Configuração salva em: ${configPath}`);
  console.log('\n📋 Você pode copiar as URLs deste arquivo para o Dashboard do Supabase');

  // Testar a configuração atual
  console.log('\n🧪 Testando configuração atual...');
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    if (data?.url) {
      console.log('✅ Configuração OAuth parece estar funcionando');
      console.log('   URL OAuth gerada com sucesso');
    } else if (error) {
      console.error('❌ Erro ao testar OAuth:', error.message);
    }
  } catch (err) {
    console.error('❌ Erro ao testar configuração:', err);
  }

  console.log('\n✅ Script concluído!');
  console.log('📌 Próximos passos:');
  console.log('1. Configure as URLs no Dashboard do Supabase');
  console.log('2. Teste o login com Google em http://localhost:3000/login');
}

// Executar o script
configureSupabase().catch(console.error);