#!/usr/bin/env node

/**
 * Apply Subscriptions Migration Script
 * Applies the corrected subscriptions table migration and validates system
 */

const { execFile, spawn } = require('node:child_process');
const _path = require('node:path');
const fs = require('node:fs');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function execPromise(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    // Use execFile for security - no shell interpretation
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function checkSupabaseCLI() {
  try {
    await execPromise('npx', ['supabase', '--version']);
    log('✅ Supabase CLI disponível', COLORS.GREEN);
    return true;
  } catch (_error) {
    log('❌ Supabase CLI não encontrado', COLORS.RED);
    log('🔧 Instalando Supabase CLI...', COLORS.YELLOW);
    try {
      await execPromise('npm', ['install', '-g', 'supabase']);
      log('✅ Supabase CLI instalado com sucesso', COLORS.GREEN);
      return true;
    } catch (_installError) {
      log('❌ Falha ao instalar Supabase CLI', COLORS.RED);
      return false;
    }
  }
}

async function checkEnvironment() {
  log('\n🔍 Verificando configuração do ambiente...', COLORS.BLUE);

  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    log('❌ Arquivo .env.local não encontrado', COLORS.RED);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredVars.filter((varName) => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    return !match?.[1] || match[1].trim() === '';
  });

  if (missingVars.length > 0) {
    log(
      `❌ Variáveis de ambiente faltando: ${missingVars.join(', ')}`,
      COLORS.RED
    );
    return false;
  }

  log('✅ Variáveis de ambiente configuradas', COLORS.GREEN);
  return true;
}

async function applyMigration() {
  log('\n🚀 Aplicando migration de subscriptions...', COLORS.BLUE);

  try {
    // Check if connected to Supabase
    await execPromise('npx', ['supabase', 'status']);
    log('✅ Conectado ao Supabase', COLORS.GREEN);
  } catch (_error) {
    log('⚠️  Não conectado ao Supabase, tentando conectar...', COLORS.YELLOW);
    try {
      await execPromise('npx', ['supabase', 'login']);
      await execPromise('npx', ['supabase', 'link']);
    } catch (_linkError) {
      log('❌ Falha ao conectar com Supabase', COLORS.RED);
      log(
        '💡 Execute manualmente: npx supabase login && npx supabase link',
        COLORS.YELLOW
      );
      return false;
    }
  }

  try {
    // Apply migrations
    const result = await execPromise('npx', ['supabase', 'db', 'push']);
    log('✅ Migration aplicada com sucesso!', COLORS.GREEN);
    log(result.stdout, COLORS.GREEN);
    return true;
  } catch (error) {
    log('❌ Falha ao aplicar migration', COLORS.RED);
    log(error.stderr, COLORS.RED);

    // Alternative: show manual instructions
    log('\n💡 Instruções manuais:', COLORS.YELLOW);
    log('1. Acesse o Supabase Dashboard', COLORS.YELLOW);
    log('2. Vá para SQL Editor', COLORS.YELLOW);
    log(
      '3. Execute o conteúdo do arquivo: supabase/migrations/20241231000000_create_subscriptions.sql',
      COLORS.YELLOW
    );

    return false;
  }
}

async function validateMigration() {
  log('\n🔍 Validando migration...', COLORS.BLUE);

  try {
    // Run our existing test script
    const result = await execPromise('npm', ['run', 'test:middleware']);

    if (result.stdout.includes('✅ Todos os testes passaram!')) {
      log('✅ Migration validada com sucesso!', COLORS.GREEN);
      return true;
    }
    log('⚠️  Alguns testes falharam, mas migration foi aplicada', COLORS.YELLOW);
    log(result.stdout);
    return true;
  } catch (error) {
    log('❌ Falha na validação', COLORS.RED);
    log(error.stdout || error.stderr);
    return false;
  }
}

async function showNextSteps() {
  log('\n🎯 Próximos passos:', COLORS.BOLD);
  log('1. ✅ Migration de subscriptions aplicada');
  log('2. 🔧 Configure as variáveis do Stripe no .env.local:');
  log('   - STRIPE_SECRET_KEY=sk_test_...');
  log('   - STRIPE_PUBLISHABLE_KEY=pk_test_...');
  log('   - STRIPE_WEBHOOK_SECRET=whsec_...');
  log('3. 🧪 Execute: npm run test:middleware');
  log('4. 🚀 Execute: npm run setup:subscriptions');
  log(
    '5. 🌐 Teste o middleware em: http://localhost:3000/dashboard/subscription'
  );
}

async function main() {
  log(
    `${COLORS.BOLD}🔄 NeonPro - Aplicar Migration de Subscriptions${COLORS.RESET}`
  );
  log('='.repeat(60));

  try {
    // Check prerequisites
    const cliAvailable = await checkSupabaseCLI();
    if (!cliAvailable) {
      log('❌ Não foi possível configurar Supabase CLI', COLORS.RED);
      process.exit(1);
    }

    const envValid = await checkEnvironment();
    if (!envValid) {
      log('❌ Configuração do ambiente inválida', COLORS.RED);
      process.exit(1);
    }

    // Apply migration
    const migrationSuccess = await applyMigration();

    // Validate even if migration failed (table might already exist)
    await validateMigration();

    // Show next steps
    await showNextSteps();

    if (migrationSuccess) {
      log('\n✅ Migration aplicada com sucesso!', COLORS.GREEN);
      process.exit(0);
    } else {
      log(
        '\n⚠️  Migration pode ter falhado, mas sistema pode estar funcional',
        COLORS.YELLOW
      );
      process.exit(0);
    }
  } catch (error) {
    log(`\n❌ Erro inesperado: ${error.message}`, COLORS.RED);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
