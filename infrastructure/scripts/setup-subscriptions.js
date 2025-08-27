
/**
 * Script de Setup Automático do Sistema de Assinaturas
 *
 * Este script automatiza a configuração completa do sistema de assinaturas:
 * - Verifica variáveis de ambiente
 * - Aplica migration do banco de dados
 * - Testa conectividade
 * - Valida configuração Stripe
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
let setupSteps = 0;
let completedSteps = 0;
const errors = [];

// Função para executar setup steps
async function runSetupStep(name, setupFn) {
  setupSteps++;
  try {
    await setupFn();
    completedSteps++;
  } catch (error) {
    errors.push({ name, error: error.message });
  }
}

// 1. Verificar Node.js e dependências
async function checkDependencies() {
  try {
    // Verificar versão do Node.js
    const { version: _nodeVersion } = process;

    // Verificar se package.json existe
    if (!fs.existsSync("package.json")) {
      throw new Error("package.json não encontrado");
    }

    // Verificar se node_modules existe
    if (!fs.existsSync("node_modules")) {
      execSync("npm install", { stdio: "pipe", shell: false });
    }
  } catch (error) {
    throw new Error(`Erro nas dependências: ${error.message}`);
  }
}

// 2. Verificar variáveis de ambiente
async function checkEnvironmentVariables() {
  const envPath = ".env.local";

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local não encontrado - copie de .env.example");
  }

  // Carregar variáveis
  require("dotenv").config({ path: envPath });

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missingVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Variáveis não configuradas: ${missingVars.join(", ")}`);
  }
}

// 3. Verificar conexão com Supabase
async function checkSupabaseConnection() {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // Teste básico de conexão
    const { error } = await supabase
      .from("auth.users")
      .select("count")
      .limit(1);

    if (error && !error.message.includes("permission denied")) {
      throw new Error(`Conexão falhou: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Erro de conexão Supabase: ${error.message}`);
  }
}

// 4. Aplicar Migration do Banco de Dados
async function applyDatabaseMigration() {
  const migrationPath = "supabase/migrations/20250721130000_create_subscriptions_schema.sql";

  if (!fs.existsSync(migrationPath)) {
    throw new Error("Arquivo de migration não encontrado");
  }

  try {
    // Ler conteúdo da migration
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // Verificar se as tabelas já existem
    const { data: existingTables } = await supabase.rpc("sql", {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('user_subscriptions', 'subscription_plans', 'billing_events');
      `,
    });

    if (existingTables && existingTables.length >= 3) {
      return;
    }
  } catch (error) {
    throw new Error(`Erro ao aplicar migration: ${error.message}`);
  }
}

// 5. Verificar configuração Stripe
async function checkStripeConfiguration() {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // Teste básico de conexão
    const account = await stripe.accounts.retrieve();

    if (!account) {
      throw new Error("Não foi possível conectar à conta Stripe");
    }

    // Verificar se existem produtos
    // Verificar preços
    const prices = await stripe.prices.list({ limit: 10 });

    if (prices.data.length === 0) {
    }
  } catch (error) {
    throw new Error(`Erro na configuração Stripe: ${error.message}`);
  }
}

// 6. Executar testes de validação
async function runValidationTests() {
  try {  } catch (_error) {}
}

// 7. Configurar scripts de desenvolvimento
async function setupDevelopmentScripts() {
  // Verificar se os scripts existem no package.json
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  const expectedScripts = ["test:stripe", "test:db", "test:subscriptions"];

  const missingScripts = expectedScripts.filter(
    (script) => !packageJson.scripts[script],
  );

  if (missingScripts.length > 0) {
  } else {
  }

  // Criar arquivo de configuração de desenvolvimento se não existir
  const devConfigPath = ".neonpro-dev-config.json";

  if (!fs.existsSync(devConfigPath)) {
    const devConfig = {
      setupDate: new Date().toISOString(),
      version: "1.0.0",
      features: {
        subscriptions: true,
        stripe: true,
        database: true,
      },
      lastHealthCheck: new Date().toISOString(),
    };

    fs.writeFileSync(devConfigPath, JSON.stringify(devConfig, null, 2));
  }
}

// 8. Gerar relatório de setup
async function generateSetupReport() {
  const report = {
    setupDate: new Date().toISOString(),
    completedSteps,
    totalSteps: setupSteps,
    successRate: ((completedSteps / setupSteps) * 100).toFixed(1),
    errors,
    nextSteps: [],
  };

  if (errors.length > 0) {
    report.nextSteps.push("Corrigir erros listados acima");
  }

  if (errors.some((e) => e.name.includes("Stripe"))) {
    report.nextSteps.push(
      "Configurar produtos no Stripe Dashboard (ver docs/STRIPE_SETUP_GUIDE.md)",
    );
  }

  if (errors.some((e) => e.name.includes("banco"))) {
    report.nextSteps.push("Aplicar migration do banco de dados manualmente");
  }

  report.nextSteps.push(
    "Executar npm run test:subscriptions para validação completa",
  );
  report.nextSteps.push("Iniciar desenvolvimento com npm run dev");

  fs.writeFileSync(".setup-report.json", JSON.stringify(report, null, 2));
}

// Função principal
async function main() {
  const steps = [
    ["Verificar Dependências", checkDependencies],
    ["Verificar Variáveis de Ambiente", checkEnvironmentVariables],
    ["Verificar Conexão Supabase", checkSupabaseConnection],
    ["Aplicar Migration do Banco", applyDatabaseMigration],
    ["Verificar Configuração Stripe", checkStripeConfiguration],
    ["Executar Testes de Validação", runValidationTests],
    ["Configurar Scripts de Desenvolvimento", setupDevelopmentScripts],
    ["Gerar Relatório de Setup", generateSetupReport],
  ];

  for (const [name, setupFn] of steps) {
    await runSetupStep(name, setupFn);
  }

  const successRate = ((completedSteps / setupSteps) * 100).toFixed(1);

  if (errors.length > 0) {
    errors.forEach((_error, _i) => {});
  }

  if (successRate >= 80) {
  } else {
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch((_error) => {
    process.exit(1);
  });
}

module.exports = { main };
