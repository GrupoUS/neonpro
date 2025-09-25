import { resolve } from 'node:path'

export type OrchestrationStep = {
  name: string
  command: string[]
  cwd?: string
}

export type ToolWorkflow = {
  id: string
  displayName: string
  steps: OrchestrationStep[]
}

const REPO_ROOT = resolve(process.cwd(), '../../..')

const makeStep = (
  label: string,
  pkg: string,
  script: string,
  extraArgs: string[] = [],
): OrchestrationStep => ({
  name: label,
  command: ['pnpm', '--filter', pkg, script, ...extraArgs],
  cwd: REPO_ROOT,
})

export const TOOL_WORKFLOWS: ToolWorkflow[] = [
  {
    id: '@neonpro/audit-tool',
    displayName: 'Audit Consolidated',
    steps: [
      makeStep('Type Check', '@neonpro/healthcare-core', 'type-check'),
      makeStep('Lint', '@neonpro/healthcare-core', 'lint'),
      makeStep('Tests', '@neonpro/healthcare-core', 'test'),
    ],
  },
  {
    id: '@neonpro/testing-toolkit',
    displayName: 'Unified Testing Toolkit',
    steps: [
      makeStep('Type Check', '@neonpro/healthcare-core', 'type-check'),
      makeStep('Lint', '@neonpro/healthcare-core', 'lint'),
      makeStep('Build', '@neonpro/healthcare-core', 'build'),
      makeStep('Tests', '@neonpro/healthcare-core', 'test'),
      makeStep('Coverage', '@neonpro/healthcare-core', 'test:coverage'),
    ],
  },
  {
    id: '@neonpro/tools-backend-tests',
    displayName: 'Backend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/database', 'type-check'),
      makeStep('Lint', '@neonpro/database', 'lint'),
      makeStep('Tests', '@neonpro/database', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-database-tests',
    displayName: 'Database Tools',
    steps: [
      makeStep('Type Check', '@neonpro/database', 'type-check'),
      makeStep('Lint', '@neonpro/database', 'lint'),
      makeStep('Tests', '@neonpro/database', 'test:integration'),
    ],
  },
  {
    id: '@neonpro/tools-frontend-tests',
    displayName: 'Frontend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/ui', 'type-check'),
      makeStep('Lint', '@neonpro/ui', 'lint'),
      makeStep('Build', '@neonpro/ui', 'build'),
      makeStep('Tests', '@neonpro/ui', 'test'),
      makeStep('E2E Tests', '@neonpro/ui', 'test:e2e'),
    ],
  },
  {
    id: '@neonpro/tools-quality-tests',
    displayName: 'Quality Tools',
    steps: [
      makeStep('Type Check', '@neonpro/security', 'type-check'),
      makeStep('Lint', '@neonpro/security', 'lint'),
      makeStep('Tests', '@neonpro/security', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-orchestration',
    displayName: 'Orchestration Framework',
    steps: [
      makeStep('Type Check', '@neonpro/utils', 'type-check'),
      makeStep('Lint', '@neonpro/utils', 'lint'),
      makeStep('Build', '@neonpro/utils', 'build'),
      makeStep('Tests', '@neonpro/utils', 'test'),
    ],
  },
]
