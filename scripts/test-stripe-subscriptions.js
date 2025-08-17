#!/usr/bin/env node

/**
 * Script de Teste Completo do Sistema de Assinaturas Stripe
 *
 * Este script testa todos os componentes do sistema de assinaturas:
 * - Conexão com APIs
 * - Endpoints Stripe
 * - Banco de dados
 * - Configuração de environment
 * - Fluxo completo de assinatura
 */

const https = require('node:https');
const http = require('node:http');
const { execSync } = require('node:child_process');

// Configurações
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

console.log('🧪 TESTE COMPLETO DO SISTEMA DE ASSINATURAS STRIPE');
console.log('='.repeat(60));
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`);
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestsList = [];

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestModule = url.startsWith('https://') ? https : http;

    const req = requestModule.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeonPro-Test-Agent/1.0',
          ...options.headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({
              status: res.statusCode,
              data: jsonData,
              headers: res.headers,
            });
          } catch (_e) {
            resolve({ status: res.statusCode, data, headers: res.headers });
          }
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Função para executar testes
async function runTest(name, testFn) {
  totalTests++;
  try {
    console.log(`\n🔄 Testando: ${name}`);
    await testFn();
    console.log(`✅ PASSOU: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FALHOU: ${name}`);
    console.log(`   Erro: ${error.message}`);
    failedTests++;
    failedTestsList.push({ name, error: error.message });
  }
}

// 1. Teste de Variáveis de Ambiente
async function testEnvironmentVariables() {
  const requiredVars = {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
  };

  for (const [varName, value] of Object.entries(requiredVars)) {
    if (!value) {
      throw new Error(`Variável ${varName} não configurada`);
    }
    if (
      varName.includes('STRIPE') &&
      !value.startsWith('pk_') &&
      !value.startsWith('sk_') &&
      !value.startsWith('whsec_')
    ) {
      throw new Error(`Variável ${varName} tem formato inválido`);
    }
  }

  console.log('   ✓ Todas as variáveis de ambiente Stripe estão configuradas');
}

// 2. Teste de Conectividade da API
async function testAPIConnectivity() {
  const response = await makeRequest(`${BASE_URL}/api/health`);

  if (response.status === 404) {
    // Health endpoint não existe, vamos testar uma rota que sabemos que existe
    const pingResponse = await makeRequest(
      `${BASE_URL}/api/subscription/current`
    );
    if (pingResponse.status >= 200 && pingResponse.status < 500) {
      console.log(
        '   ✓ API está respondendo (health endpoint não implementado)'
      );
      return;
    }
  }

  if (response.status !== 200) {
    throw new Error(`API não está respondendo. Status: ${response.status}`);
  }

  console.log('   ✓ API está respondendo corretamente');
}

// 3. Teste de Endpoints Stripe
async function testStripeEndpoints() {
  const endpoints = [
    '/api/stripe/create-checkout-session',
    '/api/stripe/create-billing-portal-session',
    '/api/webhooks/stripe',
    '/api/subscription/current',
  ];

  for (const endpoint of endpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      method: endpoint.includes('webhook') ? 'POST' : 'GET',
    });

    // Para endpoints que requerem autenticação, 401 é esperado
    if (response.status === 401 || response.status === 405) {
      console.log(
        `   ✓ Endpoint ${endpoint} está configurado (requer auth/método correto)`
      );
      continue;
    }

    if (response.status >= 500) {
      throw new Error(
        `Endpoint ${endpoint} retornou erro de servidor: ${response.status}`
      );
    }

    console.log(`   ✓ Endpoint ${endpoint} está funcionando`);
  }
}

// 4. Teste de Configuração Stripe
async function testStripeConfiguration() {
  try {
    // Simular criação de customer de teste
    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    const testCustomer = await stripe.customers.create({
      email: 'teste@neonpro.com',
      name: 'Teste NeonPro',
      metadata: { test: 'true' },
    });

    if (!testCustomer.id) {
      throw new Error('Falha ao criar customer de teste');
    }

    console.log('   ✓ Conexão com Stripe API funcionando');

    // Limpar customer de teste
    await stripe.customers.del(testCustomer.id);
    console.log('   ✓ Customer de teste removido');
  } catch (error) {
    throw new Error(`Erro na configuração Stripe: ${error.message}`);
  }
}

// 5. Teste de Planos de Assinatura
async function testSubscriptionPlans() {
  const stripe = require('stripe')(STRIPE_SECRET_KEY);

  const expectedPrices = [
    'price_starter_monthly',
    'price_professional_monthly',
    'price_enterprise_monthly',
  ];

  let foundPrices = 0;

  try {
    const prices = await stripe.prices.list({ limit: 100 });

    for (const priceId of expectedPrices) {
      const price = prices.data.find((p) => p.id === priceId);
      if (price) {
        foundPrices++;
        console.log(
          `   ✓ Plano ${priceId} encontrado: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`
        );
      } else {
        console.log(`   ⚠️  Plano ${priceId} não encontrado no Stripe`);
      }
    }

    if (foundPrices === 0) {
      throw new Error('Nenhum plano de assinatura encontrado no Stripe');
    }

    console.log(
      `   ✓ ${foundPrices}/${expectedPrices.length} planos encontrados`
    );
  } catch (error) {
    throw new Error(`Erro ao verificar planos: ${error.message}`);
  }
}

// 6. Teste de Schema do Banco de Dados (simulado)
async function testDatabaseSchema() {
  // Teste básico de endpoints que dependem do banco
  const response = await makeRequest(`${BASE_URL}/api/subscription/current`);

  if (response.status === 500) {
    throw new Error(
      'Possível erro de schema do banco - endpoint retornando 500'
    );
  }

  console.log('   ✓ Endpoints que dependem do banco estão respondendo');
  console.log('   ℹ️  Para teste completo do banco, execute: npm run test:db');
}

// 7. Teste de Webhook Stripe (simulado)
async function testStripeWebhook() {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
  }

  // Teste básico do endpoint webhook
  const response = await makeRequest(`${BASE_URL}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'stripe-signature': 'test-signature',
    },
    body: { type: 'test.event' },
  });

  // Esperamos 400 porque não temos assinatura válida, mas o endpoint deve estar ativo
  if (response.status >= 500) {
    throw new Error(
      `Webhook endpoint retornando erro de servidor: ${response.status}`
    );
  }

  console.log('   ✓ Webhook endpoint está configurado');
  console.log(
    '   ℹ️  Para testar webhooks reais, configure ngrok e teste no Stripe Dashboard'
  );
}

// 8. Teste de Interface de Usuário
async function testUserInterface() {
  const pages = [
    '/pricing',
    '/dashboard/subscription/success',
    '/dashboard/subscription/manage',
    '/dashboard/subscription/expired',
  ];

  for (const page of pages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);

      if (
        response.status === 200 ||
        response.status === 401 ||
        response.status === 302
      ) {
        console.log(`   ✓ Página ${page} está acessível`);
      } else if (response.status >= 500) {
        throw new Error(`Página ${page} retornando erro: ${response.status}`);
      }
    } catch (error) {
      console.log(
        `   ⚠️  Página ${page} pode estar inacessível: ${error.message}`
      );
    }
  }
}

// 9. Teste de Performance
async function testPerformance() {
  const start = Date.now();

  const _response = await makeRequest(`${BASE_URL}/api/subscription/current`);

  const duration = Date.now() - start;

  if (duration > 5000) {
    throw new Error(`Endpoint muito lento: ${duration}ms`);
  }

  console.log(`   ✓ Tempo de resposta aceitável: ${duration}ms`);
}

// 10. Teste de Segurança Básica
async function testBasicSecurity() {
  // Teste se endpoints protegidos estão realmente protegidos
  const protectedEndpoints = [
    '/api/stripe/create-checkout-session',
    '/api/stripe/create-billing-portal-session',
    '/api/subscription/current',
  ];

  for (const endpoint of protectedEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);

    if (response.status === 200) {
      throw new Error(`Endpoint ${endpoint} pode estar desprotegido`);
    }

    if (response.status === 401 || response.status === 403) {
      console.log(`   ✓ Endpoint ${endpoint} está protegido`);
    }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes...\n');

  // Lista de testes para executar
  const tests = [
    ['Variáveis de Ambiente', testEnvironmentVariables],
    ['Conectividade da API', testAPIConnectivity],
    ['Endpoints Stripe', testStripeEndpoints],
    ['Configuração Stripe', testStripeConfiguration],
    ['Planos de Assinatura', testSubscriptionPlans],
    ['Schema do Banco de Dados', testDatabaseSchema],
    ['Webhook Stripe', testStripeWebhook],
    ['Interface de Usuário', testUserInterface],
    ['Performance', testPerformance],
    ['Segurança Básica', testBasicSecurity],
  ];

  // Executar todos os testes
  for (const [name, testFn] of tests) {
    await runTest(name, testFn);
  }

  // Relatório final
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Testes Passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes Falharam: ${failedTests}/${totalTests}`);

  if (failedTests > 0) {
    console.log('\n❌ Testes que Falharam:');
    failedTestsList.forEach((test, i) => {
      console.log(`${i + 1}. ${test.name}: ${test.error}`);
    });
  }

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`\n📈 Taxa de Sucesso: ${successRate}%`);

  if (successRate >= 80) {
    console.log('🎉 Sistema de assinaturas está em boa condição!');
  } else if (successRate >= 60) {
    console.log('⚠️  Sistema precisa de algumas correções');
  } else {
    console.log('🚨 Sistema precisa de correções críticas');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📝 Próximos Passos Recomendados:');

  if (failedTestsList.some((t) => t.name.includes('Stripe'))) {
    console.log('1. Configurar produtos e preços no Stripe Dashboard');
    console.log('2. Verificar variáveis de ambiente Stripe');
  }

  if (failedTestsList.some((t) => t.name.includes('Banco'))) {
    console.log('3. Executar migration do banco: supabase db push');
  }

  if (failedTestsList.some((t) => t.name.includes('API'))) {
    console.log('4. Verificar se o servidor está rodando: pnpm run dev');
  }

  console.log('5. Executar testes específicos com: pnpm run test:[categoria]');
  console.log('6. Configurar webhook com ngrok para testes locais');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Erro crítico durante os testes:', error);
    process.exit(1);
  });
}

module.exports = {
  runTest,
  makeRequest,
  main,
};
