/**
 * TypeScript Cleanup Configuration
 * 
 * Configuration for cleaning up remaining TypeScript errors
 * Part of PRÓXIMAS AÇÕES RECOMENDADAS implementation
 */

export const typeScriptCleanupConfig = {
  // High-priority fixes (build-breaking)
  buildBreaking: [
    'formAction compatibility with framer-motion',
    'Font loading return value paths',
    'Function arguments and unused variables'
  ],
  
  // Medium-priority fixes (warnings)
  warnings: [
    'Unused variable declarations',
    'Missing null checks',
    'Type assertion improvements'
  ],
  
  // Low-priority fixes (code quality)
  codeQuality: [
    'Improve type safety',
    'Add stricter null checks',
    'Enhanced interface definitions'
  ],
  
  // Cleanup strategy
  strategy: {
    phase1: 'Fix critical build errors first',
    phase2: 'Address warnings that impact functionality',
    phase3: 'Enhance type safety and code quality'
  },
  
  // Target metrics
  targets: {
    buildErrors: 0,
    warnings: '<10',
    typeStrict: true,
    coverage: '95%+'
  }
} as const;

export default typeScriptCleanupConfig;