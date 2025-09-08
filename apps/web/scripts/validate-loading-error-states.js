/**
 * Script de Validação de Loading & Error States
 *
 * Este script testa todos os cenários críticos de loading e error handling
 * no sistema NeonPro para garantir uma UX consistente.
 */

const { execSync, } = require('node:child_process',)
const fs = require('node:fs',)
const path = require('node:path',)

// Cores para output
const log = {
  success: (_msg,) => {},
  error: (_msg,) => {},
  warning: (_msg,) => {},
  info: (_msg,) => {},
} // 1. VALIDAÇÃO DE HOOKS
function validateHooks() {
  const hooksDir = path.join(__dirname, '../hooks',)
  const hooks = new Set(
    fs.readdirSync(hooksDir,).filter((f,) => f.endsWith('.ts',)),
  )

  const requiredHooks = [
    'usePatients.ts',
    'useDashboardMetrics.ts',
    'useAppointments.ts',
    'useFinancialData.ts',
    'useServices.ts',
    'useStaffMembers.ts',
  ]

  requiredHooks.forEach((hook,) => {
    if (hooks.has(hook,)) {
      const content = fs.readFileSync(path.join(hooksDir, hook,), 'utf8',)

      // Verificar loading state
      const hasLoading = content.includes('loading',) && content.includes('boolean',)
      if (hasLoading) {
        log.success(`${hook} - Loading state implementado`,)
      } else {
        log.error(`${hook} - Loading state ausente`,)
      }

      // Verificar error state
      const hasError = content.includes('error',) && content.includes('Error | null',)
      if (hasError) {
        log.success(`${hook} - Error state implementado`,)
      } else {
        log.error(`${hook} - Error state ausente`,)
      }

      // Verificar try-catch
      const hasTryCatch = content.includes('try {',) && content.includes('catch',)
      if (hasTryCatch) {
        log.success(`${hook} - Try-catch implementado`,)
      } else {
        log.warning(`${hook} - Try-catch pode estar ausente`,)
      }
    } else {
      log.error(`${hook} - Hook não encontrado`,)
    }
  },)
} // 2. VALIDAÇÃO DE COMPONENTES UI
function validateUIComponents() {
  const uiComponents = [
    'components/ui/toast.tsx',
    'components/ui/toaster.tsx',
    'components/ui/use-toast.ts',
    'components/ui/skeleton.tsx',
    'components/ui/empty-state.tsx',
    'components/ui/loading-spinner.tsx',
  ]

  uiComponents.forEach((component,) => {
    const filePath = path.join(__dirname, '..', component,)
    if (fs.existsSync(filePath,)) {
      log.success(`${component} - Existe`,)
    } else {
      log.error(`${component} - Ausente`,)
    }
  },)
}

// 3. VALIDAÇÃO DE ERROR BOUNDARIES
function validateErrorBoundaries() {
  const errorBoundaries = [
    'components/error-boundary.tsx',
    'app/error.tsx',
    'app/global-error.tsx',
  ]

  errorBoundaries.forEach((boundary,) => {
    const filePath = path.join(__dirname, '..', boundary,)
    if (fs.existsSync(filePath,)) {
      log.success(`${boundary} - Implementado`,)
    } else {
      log.error(`${boundary} - Ausente`,)
    }
  },)
} // EXECUTAR VALIDAÇÕES
function runValidation() {
  try {
    validateHooks()
    validateUIComponents()
    validateErrorBoundaries()

    log.success(
      'VALIDAÇÃO CONCLUÍDA! Verificar logs acima para identificar problemas.',
    )
  } catch (error) {
    log.error(`Erro durante validação: ${error.message}`,)
    process.exit(1,)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runValidation()
}

module.exports = { runValidation, }
