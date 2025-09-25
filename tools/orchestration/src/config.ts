import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '../../..')

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
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
    ],
  },
  {
    id: '@neonpro/testing-toolkit',
    displayName: 'Unified Testing Toolkit',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Build', '@neonpro/type-check', 'build'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
      makeStep('Coverage', '@neonpro/type-check', 'test:coverage'),
    ],
  },
  {
    id: '@neonpro/tools-backend-tests',
    displayName: 'Backend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-database-tests',
    displayName: 'Database Tools',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-frontend-tests',
    displayName: 'Frontend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
      makeStep('E2E Tests', '@neonpro/type-check', 'test:e2e'),
    ],
  },
  {
    id: '@neonpro/tools-quality-tests',
    displayName: 'Quality Tools',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-orchestration',
    displayName: 'Orchestration Framework',
    steps: [
      makeStep('Type Check', '@neonpro/type-check', 'lint'),
      makeStep('Lint', '@neonpro/type-check', 'test'),
      makeStep('Build', '@neonpro/type-check', 'build'),
      makeStep('Tests', '@neonpro/type-check', 'test'),
    ],
  },
]
