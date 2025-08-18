#!/usr/bin/env node

/**
 * Script de Validação de Loading & Error States
 *
 * Este script testa todos os cenários críticos de loading e error handling
 * no sistema NeonPro para garantir uma UX consistente.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDAÇÃO DE LOADING & ERROR STATES - NEONPRO\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
}; // 1. VALIDAÇÃO DE HOOKS
function validateHooks() {
  console.log('📁 VALIDANDO HOOKS...\n');

  const hooksDir = path.join(__dirname, '../hooks');
  const hooks = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.ts'));

  const requiredHooks = [
    'usePatients.ts',
    'useDashboardMetrics.ts',
    'useAppointments.ts',
    'useFinancialData.ts',
    'useServices.ts',
    'useStaffMembers.ts',
  ];

  requiredHooks.forEach((hook) => {
    if (hooks.includes(hook)) {
      const content = fs.readFileSync(path.join(hooksDir, hook), 'utf8');

      // Verificar loading state
      const hasLoading =
        content.includes('loading') && content.includes('boolean');
      if (hasLoading) {
        log.success(`${hook} - Loading state implementado`);
      } else {
        log.error(`${hook} - Loading state ausente`);
      }

      // Verificar error state
      const hasError =
        content.includes('error') && content.includes('Error | null');
      if (hasError) {
        log.success(`${hook} - Error state implementado`);
      } else {
        log.error(`${hook} - Error state ausente`);
      }

      // Verificar try-catch
      const hasTryCatch =
        content.includes('try {') && content.includes('catch');
      if (hasTryCatch) {
        log.success(`${hook} - Try-catch implementado`);
      } else {
        log.warning(`${hook} - Try-catch pode estar ausente`);
      }
    } else {
      log.error(`${hook} - Hook não encontrado`);
    }
  });

  console.log('');
} // 2. VALIDAÇÃO DE COMPONENTES UI
function validateUIComponents() {
  console.log('🎨 VALIDANDO COMPONENTES UI...\n');

  const uiComponents = [
    'components/ui/toast.tsx',
    'components/ui/toaster.tsx',
    'components/ui/use-toast.ts',
    'components/ui/skeleton.tsx',
    'components/ui/empty-state.tsx',
    'components/ui/loading-spinner.tsx',
  ];

  uiComponents.forEach((component) => {
    const filePath = path.join(__dirname, '..', component);
    if (fs.existsSync(filePath)) {
      log.success(`${component} - Existe`);
    } else {
      log.error(`${component} - Ausente`);
    }
  });

  console.log('');
}

// 3. VALIDAÇÃO DE ERROR BOUNDARIES
function validateErrorBoundaries() {
  console.log('🛡️  VALIDANDO ERROR BOUNDARIES...\n');

  const errorBoundaries = [
    'components/error-boundary.tsx',
    'app/error.tsx',
    'app/global-error.tsx',
  ];

  errorBoundaries.forEach((boundary) => {
    const filePath = path.join(__dirname, '..', boundary);
    if (fs.existsSync(filePath)) {
      log.success(`${boundary} - Implementado`);
    } else {
      log.error(`${boundary} - Ausente`);
    }
  });

  console.log('');
} // EXECUTAR VALIDAÇÕES
function runValidation() {
  try {
    validateHooks();
    validateUIComponents();
    validateErrorBoundaries();

    log.success(
      'VALIDAÇÃO CONCLUÍDA! Verificar logs acima para identificar problemas.'
    );
  } catch (error) {
    log.error(`Erro durante validação: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };
