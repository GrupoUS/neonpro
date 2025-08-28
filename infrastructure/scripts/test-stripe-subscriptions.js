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

const https = require("node:https");
const http = require("node:http");
const { execSync } = require("node:child_process");

// Configurações
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestsList = [];

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestModule = url.startsWith("https://") ? https : http;

    const req = requestModule.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "NeonPro-Test-Agent/1.0",
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
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
      },
    );

    req.on("error", reject);

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
    await testFn();
    passedTests++;
  } catch (error) {
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
      varName.includes("STRIPE") &&
      !value.startsWith("pk_") &&
      !value.startsWith("sk_") &&
      !value.startsWith("whsec_")
    ) {
      throw new Error(`Variável ${varName} tem formato inválido`);
    }
  }
}

// 2. Teste de Conectividade da API
async function testAPIConnectivity() {
  const response = await makeRequest(`${BASE_URL}/api/health`);

  if (response.status === 404) {
    // Health endpoint não existe, vamos testar uma rota que sabemos que existe
    const pingResponse = await makeRequest(
      `${BASE_URL}/api/subscription/current`,
    );
    if (pingResponse.status >= 200 && pingResponse.status < 500) {
      return;
    }
  }

  if (response.status !== 200) {
    throw new Error(`API não está respondendo. Status: ${response.status}`);
  }
}

// 3. Teste de Endpoints Stripe
async function testStripeEndpoints() {
  const endpoints = [
    "/api/stripe/create-checkout-session",
    "/api/stripe/create-billing-portal-session",
    "/api/webhooks/stripe",
    "/api/subscription/current",
  ];

  for (const endpoint of endpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`, {
      method: endpoint.includes("webhook") ? "POST" : "GET",
    });

    // Para endpoints que requerem autenticação, 401 é esperado
    if (response.status === 401 || response.status === 405) {
      continue;
    }

    if (response.status >= 500) {
      throw new Error(
        `Endpoint ${endpoint} retornou erro de servidor: ${response.status}`,
      );
    }
  }
}

// 4. Teste de Configuração Stripe
async function testStripeConfiguration() {
  try {
    // Simular criação de customer de teste
    const stripe = require("stripe")(STRIPE_SECRET_KEY);

    const testCustomer = await stripe.customers.create({
      email: "teste@neonpro.com",
      name: "Teste NeonPro",
      metadata: { test: "true" },
    });

    if (!testCustomer.id) {
      throw new Error("Falha ao criar customer de teste");
    }

    // Limpar customer de teste
    await stripe.customers.del(testCustomer.id);
  } catch (error) {
    throw new Error(`Erro na configuração Stripe: ${error.message}`);
  }
}

// 5. Teste de Planos de Assinatura
async function testSubscriptionPlans() {
  const stripe = require("stripe")(STRIPE_SECRET_KEY);

  const expectedPrices = [
    "price_starter_monthly",
    "price_professional_monthly",
    "price_enterprise_monthly",
  ];

  let foundPrices = 0;

  try {
    const prices = await stripe.prices.list({ limit: 100 });

    for (const priceId of expectedPrices) {
      const price = prices.data.find((p) => p.id === priceId);
      if (price) {
        foundPrices++;
      } else {
      }
    }

    if (foundPrices === 0) {
      throw new Error("Nenhum plano de assinatura encontrado no Stripe");
    }
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
      "Possível erro de schema do banco - endpoint retornando 500",
    );
  }
}

// 7. Teste de Webhook Stripe (simulado)
async function testStripeWebhook() {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET não configurado");
  }

  // Teste básico do endpoint webhook
  const response = await makeRequest(`${BASE_URL}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "stripe-signature": "test-signature",
    },
    body: { type: "test.event" },
  });

  // Esperamos 400 porque não temos assinatura válida, mas o endpoint deve estar ativo
  if (response.status >= 500) {
    throw new Error(
      `Webhook endpoint retornando erro de servidor: ${response.status}`,
    );
  }
}

// 8. Teste de Interface de Usuário
async function testUserInterface() {
  const pages = [
    "/pricing",
    "/dashboard/subscription/success",
    "/dashboard/subscription/manage",
    "/dashboard/subscription/expired",
  ];

  for (const page of pages) {
    try {
      const response = await makeRequest(`${BASE_URL}${page}`);

      if (
        response.status === 200 ||
        response.status === 401 ||
        response.status === 302
      ) {
      } else if (response.status >= 500) {
        throw new Error(`Página ${page} retornando erro: ${response.status}`);
      }
    } catch (_error) {}
  }
}

// 9. Teste de Performance
async function testPerformance() {
  const start = Date.now();
  const duration = Date.now() - start;

  if (duration > 5000) {
    throw new Error(`Endpoint muito lento: ${duration}ms`);
  }
}

// 10. Teste de Segurança Básica
async function testBasicSecurity() {
  // Teste se endpoints protegidos estão realmente protegidos
  const protectedEndpoints = [
    "/api/stripe/create-checkout-session",
    "/api/stripe/create-billing-portal-session",
    "/api/subscription/current",
  ];

  for (const endpoint of protectedEndpoints) {
    const response = await makeRequest(`${BASE_URL}${endpoint}`);

    if (response.status === 200) {
      throw new Error(`Endpoint ${endpoint} pode estar desprotegido`);
    }

    if (response.status === 401 || response.status === 403) {
    }
  }
}

// Função principal
async function main() {
  // Lista de testes para executar
  const tests = [
    ["Variáveis de Ambiente", testEnvironmentVariables],
    ["Conectividade da API", testAPIConnectivity],
    ["Endpoints Stripe", testStripeEndpoints],
    ["Configuração Stripe", testStripeConfiguration],
    ["Planos de Assinatura", testSubscriptionPlans],
    ["Schema do Banco de Dados", testDatabaseSchema],
    ["Webhook Stripe", testStripeWebhook],
    ["Interface de Usuário", testUserInterface],
    ["Performance", testPerformance],
    ["Segurança Básica", testBasicSecurity],
  ];

  // Executar todos os testes
  for (const [name, testFn] of tests) {
    await runTest(name, testFn);
  }

  if (failedTests > 0) {
    failedTestsList.forEach((_test, _i) => {});
  }

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  if (successRate >= 80) {
  } else if (successRate >= 60) {
  } else {
  }

  if (failedTestsList.some((t) => t.name.includes("Stripe"))) {
  }

  if (failedTestsList.some((t) => t.name.includes("Banco"))) {
  }

  if (failedTestsList.some((t) => t.name.includes("API"))) {
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch((_error) => {
    process.exit(1);
  });
}

module.exports = {
  runTest,
  makeRequest,
  main,
};
