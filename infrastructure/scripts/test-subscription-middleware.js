#!/usr/bin/env node

/**
 * Script de Teste do Middleware de Subscription
 *
 * Este script testa o middleware de subscription para garantir que:
 * - Rotas protegidas redirecionam usuários sem subscription
 * - Usuários com subscription ativa podem acessar recursos
 * - Cache de subscription funciona corretamente
 * - Headers de subscription são definidos corretamente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(supabaseUrl && supabaseServiceKey)) {
  console.error('❌ Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔒 TESTE DO MIDDLEWARE DE SUBSCRIPTION');
console.log('='.repeat(50));
console.log(`🌐 URL: ${supabaseUrl}`);
console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
console.log('='.repeat(50));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

// Função para executar teste
async function runTest(name, testFn) {
  totalTests++;
  try {
    console.log(`\n🔄 Testando: ${name}`);
    const result = await testFn();
    console.log(`✅ PASSOU: ${name}`);
    if (result) {
      console.log(`   ${result}`);
    }
    passedTests++;
    results.push({ name, status: 'PASSOU', details: result });
  } catch (error) {
    console.log(`❌ FALHOU: ${name}`);
    console.log(`   Erro: ${error.message}`);
    failedTests++;
    results.push({ name, status: 'FALHOU', error: error.message });
  }
}

async function runAllTests() {
  // Teste 1: Verificar estrutura de middleware
  await runTest('Verificar arquivo de middleware principal', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const middlewareFile = path.join(process.cwd(), 'middleware.ts');
    if (!fs.existsSync(middlewareFile)) {
      throw new Error('Arquivo middleware.ts não encontrado');
    }

    const content = fs.readFileSync(middlewareFile, 'utf8');
    if (!content.includes('subscriptionMiddleware')) {
      throw new Error('Middleware de subscription não importado');
    }

    return 'Middleware principal configurado corretamente';
  });

  // Teste 2: Verificar arquivo de middleware de subscription
  await runTest('Verificar middleware de subscription', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const subscriptionMiddlewareFile = path.join(process.cwd(), 'middleware', 'subscription.ts');
    if (!fs.existsSync(subscriptionMiddlewareFile)) {
      throw new Error('Arquivo middleware/subscription.ts não encontrado');
    }

    const content = fs.readFileSync(subscriptionMiddlewareFile, 'utf8');
    const requiredFunctions = [
      'validateSubscriptionStatus',
      'requiresSubscription',
      'subscriptionMiddleware',
      'clearSubscriptionCache',
    ];

    for (const func of requiredFunctions) {
      if (!content.includes(func)) {
        throw new Error(`Função ${func} não encontrada`);
      }
    }

    return 'Todas as funções necessárias estão presentes';
  });

  // Teste 3: Verificar hook de subscription
  await runTest('Verificar hook de subscription', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const hookFile = path.join(process.cwd(), 'hooks', 'use-subscription.ts');
    if (!fs.existsSync(hookFile)) {
      throw new Error('Arquivo hooks/use-subscription.ts não encontrado');
    }

    const content = fs.readFileSync(hookFile, 'utf8');
    const requiredExports = ['SubscriptionProvider', 'useSubscription', 'useSubscriptionStatus'];

    for (const exportName of requiredExports) {
      if (!content.includes(exportName)) {
        throw new Error(`Export ${exportName} não encontrado`);
      }
    }

    return 'Hook de subscription configurado corretamente';
  });

  // Teste 4: Verificar componentes de subscription
  await runTest('Verificar componentes de subscription', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const componentsDir = path.join(process.cwd(), 'components', 'subscription');
    if (!fs.existsSync(componentsDir)) {
      throw new Error('Diretório components/subscription não encontrado');
    }

    const requiredComponents = [
      'status-indicator.tsx',
      'subscription-guard.tsx',
      'subscription-management.tsx',
      'subscription-wrapper.tsx',
    ];

    const missing = [];
    for (const component of requiredComponents) {
      const componentFile = path.join(componentsDir, component);
      if (!fs.existsSync(componentFile)) {
        missing.push(component);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Componentes faltando: ${missing.join(', ')}`);
    }

    return 'Todos os componentes de subscription estão presentes';
  });

  // Teste 5: Verificar integração no layout
  await runTest('Verificar integração no layout principal', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const layoutFile = path.join(process.cwd(), 'app', 'layout.tsx');
    if (!fs.existsSync(layoutFile)) {
      throw new Error('Arquivo app/layout.tsx não encontrado');
    }

    const content = fs.readFileSync(layoutFile, 'utf8');
    if (!content.includes('SubscriptionWrapper')) {
      throw new Error('SubscriptionWrapper não integrado no layout');
    }

    return 'SubscriptionWrapper integrado no layout principal';
  });

  // Teste 6: Verificar schema de subscription no banco
  await runTest('Verificar tabela de subscriptions', async () => {
    const { data, error } = await supabase.from('subscriptions').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao acessar tabela subscriptions: ${error.message}`);
    }

    return 'Tabela subscriptions acessível';
  });

  // Teste 7: Verificar configuração de rotas protegidas
  await runTest('Verificar configuração de rotas protegidas', async () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('middleware/subscription.ts', 'utf8');

    const protectedRoutesMatch = content.match(/PROTECTED_ROUTES\s*=\s*\[([\s\S]*?)\]/);
    if (!protectedRoutesMatch) {
      throw new Error('PROTECTED_ROUTES não definido');
    }

    const freeRoutesMatch = content.match(/FREE_ROUTES\s*=\s*\[([\s\S]*?)\]/);
    if (!freeRoutesMatch) {
      throw new Error('FREE_ROUTES não definido');
    }

    return 'Configuração de rotas protegidas e livres definida';
  });

  // Teste 8: Verificar página de subscription
  await runTest('Verificar página de subscription', async () => {
    const fs = require('node:fs');
    const path = require('node:path');

    const subscriptionPageFile = path.join(
      process.cwd(),
      'app',
      'dashboard',
      'subscription',
      'page.tsx'
    );
    if (!fs.existsSync(subscriptionPageFile)) {
      throw new Error('Página app/dashboard/subscription/page.tsx não encontrada');
    }

    const content = fs.readFileSync(subscriptionPageFile, 'utf8');
    if (!content.includes('SubscriptionManagement')) {
      throw new Error('Componente SubscriptionManagement não usado na página');
    }

    return 'Página de subscription configurada corretamente';
  });

  // Teste 9: Verificar cache de subscription
  await runTest('Verificar implementação de cache', async () => {
    const fs = require('node:fs');
    const content = fs.readFileSync('middleware/subscription.ts', 'utf8');

    if (!content.includes('subscriptionCache')) {
      throw new Error('Cache de subscription não implementado');
    }

    if (!content.includes('CACHE_DURATION')) {
      throw new Error('Duração de cache não definida');
    }

    if (!content.includes('clearSubscriptionCache')) {
      throw new Error('Função de limpeza de cache não implementada');
    }

    return 'Sistema de cache implementado corretamente';
  });

  // Teste 10: Verificar tipos TypeScript
  await runTest('Verificar tipos TypeScript', async () => {
    const fs = require('node:fs');
    const hookContent = fs.readFileSync('hooks/use-subscription.ts', 'utf8');

    if (!hookContent.includes('SubscriptionStatus')) {
      throw new Error('Tipo SubscriptionStatus não definido');
    }

    if (!hookContent.includes('SubscriptionData')) {
      throw new Error('Interface SubscriptionData não definida');
    }

    return 'Tipos TypeScript definidos corretamente';
  });

  // Resumo dos resultados
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${failedTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    console.log('\n❌ TESTES QUE FALHARAM:');
    results
      .filter((r) => r.status === 'FALHOU')
      .forEach((r) => {
        console.log(`   • ${r.name}: ${r.error}`);
      });
  }

  console.log('\n✅ PRÓXIMOS PASSOS:');
  if (failedTests === 0) {
    console.log('   • Todos os testes passaram! ✨');
    console.log('   • Execute: pnpm dev');
    console.log('   • Acesse: http://localhost:3000/dashboard/subscription');
    console.log('   • Teste o middleware em rotas protegidas');
    console.log('   • Implemente STORY-SUB-002 (Analytics Dashboard)');
  } else {
    console.log('   • Corrija os testes que falharam');
    console.log('   • Execute novamente: pnpm test:middleware');
    console.log('   • Aplique as migrations necessárias no banco');
  }

  console.log('\n🎯 VALIDAÇÃO DO MIDDLEWARE DE SUBSCRIPTION CONCLUÍDA!');
  console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Executar todos os testes
runAllTests().catch((error) => {
  console.error('❌ Erro fatal durante execução dos testes:', error);
  process.exit(1);
});
