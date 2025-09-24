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
      makeStep('Type Check', '@neonpro/audit-tool', 'type-check'),
      makeStep('Lint', '@neonpro/audit-tool', 'lint'),
      makeStep('Tests', '@neonpro/audit-tool', 'test'),
    ],
  },
  {
    id: '@neonpro/testing-toolkit',
    displayName: 'Unified Testing Toolkit',
    steps: [
      makeStep('Type Check', '@neonpro/testing-toolkit', 'type-check'),
      makeStep('Lint', '@neonpro/testing-toolkit', 'lint'),
      makeStep('Build', '@neonpro/testing-toolkit', 'build'),
      makeStep('Tests', '@neonpro/testing-toolkit', 'test'),
      makeStep('Coverage', '@neonpro/testing-toolkit', 'test:coverage'),
    ],
  },
  {
    id: '@neonpro/tools-backend-tests',
    displayName: 'Backend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/tools-backend-tests', 'type-check'),
      makeStep('Lint', '@neonpro/tools-backend-tests', 'lint'),
      makeStep('Tests', '@neonpro/tools-backend-tests', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-database-tests',
    displayName: 'Database Tools',
    steps: [
      makeStep('Type Check', '@neonpro/tools-database-tests', 'type-check'),
      makeStep('Lint', '@neonpro/tools-database-tests', 'lint'),
      makeStep('Tests', '@neonpro/tools-database-tests', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-frontend-tests',
    displayName: 'Frontend Tools',
    steps: [
      makeStep('Type Check', '@neonpro/tools-frontend-tests', 'type-check'),
      makeStep('Lint', '@neonpro/tools-frontend-tests', 'lint'),
      makeStep('Tests', '@neonpro/tools-frontend-tests', 'test'),
      makeStep('E2E Tests', '@neonpro/tools-frontend-tests', 'test:e2e'),
    ],
  },
  {
    id: '@neonpro/tools-quality-tests',
    displayName: 'Quality Tools',
    steps: [
      makeStep('Type Check', '@neonpro/tools-quality-tests', 'type-check'),
      makeStep('Lint', '@neonpro/tools-quality-tests', 'lint'),
      makeStep('Tests', '@neonpro/tools-quality-tests', 'test'),
    ],
  },
  {
    id: '@neonpro/tools-orchestration',
    displayName: 'Orchestration Framework',
    steps: [
      makeStep('Type Check', '@neonpro/tools-orchestration', 'type-check'),
      makeStep('Lint', '@neonpro/tools-orchestration', 'lint'),
      makeStep('Build', '@neonpro/tools-orchestration', 'build'),
      makeStep('Tests', '@neonpro/tools-orchestration', 'test'),
    ],
  },
]
