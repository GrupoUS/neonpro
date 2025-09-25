import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

import { createLogger, LogLevel } from '@neonpro/tools-shared'
import { OrchestrationStep, TOOL_WORKFLOWS, ToolWorkflow } from './config'

const logContext = (
  operation: string,
  metadata: Record<string, unknown> = {},
) => ({
  component: 'ToolsOrchestrator',
  operation,
  metadata,
})

type RunMode = 'sequential' | 'parallel'

type OrchestratorOptions = {
  mode: RunMode
  concurrency: number
  dryRun: boolean
  packages?: string[]
}

type StepOutcome = {
  workflow: string
  step: string
  success: boolean
  duration: number
}

type WorkflowOutcome = {
  workflow: string
  success: boolean
  duration: number
  steps: StepOutcome[]
}

const logger = createLogger('ToolsOrchestrator', {
  level: LogLevel.INFO,
  enableConstitutional: true,
})

const DEFAULT_OPTIONS: OrchestratorOptions = {
  mode: 'sequential',
  concurrency: 2,
  dryRun: false,
}

const exitOnError = (error: unknown): never => {
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(
    'Orchestration failed',
    logContext('orchestration-failure', { message: err.message }),
    err,
  )
  process.exit(1)
}

const runCommand = (
  command: string[],
  cwd: string,
  dryRun: boolean,
): Promise<void> => {
  if (dryRun) {
    logger.debug(
      'Dry run command',
      logContext('dry-run', { command: command.join(' '), cwd }),
    )
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(
          new Error(`${command.join(' ')} exited with code ${code}`),
        )
      }
    })

    child.on('error', reject)
  })
}

const runStep = async (
  workflow: ToolWorkflow,
  step: OrchestrationStep,
  options: OrchestratorOptions,
): Promise<StepOutcome> => {
  logger.info(
    `▶️  ${workflow.displayName}: ${step.name}`,
    logContext('step-start', { workflow: workflow.id, step: step.name }),
  )
  const startedAt = performance.now()

  await runCommand(step.command, step.cwd ?? resolve('.'), options.dryRun)

  const duration = performance.now() - startedAt
  logger.success(
    `✅ ${workflow.displayName}: ${step.name} (${duration.toFixed(0)} ms)`,
    logContext('step-success', {
      workflow: workflow.id,
      step: step.name,
      duration,
    }),
  )

  return {
    workflow: workflow.displayName,
    step: step.name,
    success: true,
    duration,
  }
}

const runWorkflowSequential = async (
  workflow: ToolWorkflow,
  options: OrchestratorOptions,
): Promise<WorkflowOutcome> => {
  const workflowStart = performance.now()
  const steps: StepOutcome[] = []

  for (const step of workflow.steps) {
    const outcome = await runStep(workflow, step, options)
    steps.push(outcome)
  }

  const totalDuration = performance.now() - workflowStart
  logger.success(
    `🏁 ${workflow.displayName} completed (${totalDuration.toFixed(0)} ms)`,
    logContext('workflow-success', {
      workflow: workflow.id,
      duration: totalDuration,
      steps: steps.length,
    }),
  )

  return {
    workflow: workflow.displayName,
    success: true,
    duration: totalDuration,
    steps,
  }
}

const runWorkflowsSequential = async (
  workflows: ToolWorkflow[],
  options: OrchestratorOptions,
): Promise<WorkflowOutcome[]> => {
  const outcomes: WorkflowOutcome[] = []
  for (const workflow of workflows) {
    outcomes.push(await runWorkflowSequential(workflow, options))
  }
  return outcomes
}

const runWithConcurrency = async (
  workflows: ToolWorkflow[],
  options: OrchestratorOptions,
): Promise<WorkflowOutcome[]> => {
  const results: WorkflowOutcome[] = []
  let index = 0
  const workerCount = Math.min(
    Math.max(1, options.concurrency),
    workflows.length,
  )

  const worker = async () => {
    while (index < workflows.length) {
      const currentIndex = index
      index += 1
      const workflow = workflows[currentIndex]
      if (!workflow) {
        return
      }
      const result = await runWorkflowSequential(workflow, options)
      results.push(result)
    }
  }

  const workers = Array.from({ length: workerCount }, worker)
  await Promise.all(workers)
  return results
}

const filterWorkflows = (packages?: string[]): ToolWorkflow[] => {
  if (!packages || packages.length === 0) {
    return TOOL_WORKFLOWS
  }

  const normalized = new Set(packages.map(pkg => pkg.trim()))
  return TOOL_WORKFLOWS.filter((workflow: ToolWorkflow) => normalized.has(workflow.id))
}

const summarize = (outcomes: WorkflowOutcome[]): void => {
  const totalDuration = outcomes.reduce(
    (acc, outcome) => acc + outcome.duration,
    0,
  )
  const summary = outcomes.map(outcome => ({
    workflow: outcome.workflow,
    duration: `${outcome.duration.toFixed(0)} ms`,
    steps: outcome.steps.length,
  }))

  logger.info(
    'Summary',
    logContext('summary', {
      completed: outcomes.length,
      totalDuration,
      workflows: summary,
    }),
  )
}

const parseArgs = (): OrchestratorOptions => {
  const args = process.argv.slice(2)
  const options: OrchestratorOptions = { ...DEFAULT_OPTIONS }

  for (const arg of args) {
    if (arg === '--parallel') {
      options.mode = 'parallel'
    } else if (arg.startsWith('--parallel=')) {
      options.mode = 'parallel'
      const [, value] = arg.split('=')
      const parsed = Number.parseInt(value, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        options.concurrency = parsed
      }
    } else if (arg === '--sequential') {
      options.mode = 'sequential'
    } else if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg.startsWith('--packages=')) {
      const [, value] = arg.split('=')
      if (value) {
        options.packages = value.split(',')
      }
    }
  }

  return options
}

export const orchestrateTools = async (
  inputOptions: Partial<OrchestratorOptions> = {},
): Promise<void> => {
  const options: OrchestratorOptions = {
    ...DEFAULT_OPTIONS,
    ...inputOptions,
  }

  const workflows = filterWorkflows(options.packages)

  if (workflows.length === 0) {
    logger.warn(
      'No workflows match the provided filters',
      logContext('no-workflows'),
    )
    return
  }

  logger.info(
    'Starting orchestration',
    logContext('orchestration-start', {
      mode: options.mode,
      concurrency: options.mode === 'parallel' ? options.concurrency : 1,
      dryRun: options.dryRun,
      workflows: workflows.map(item => item.displayName),
    }),
  )

  const outcomes = options.mode === 'parallel'
    ? await runWithConcurrency(workflows, options)
    : await runWorkflowsSequential(workflows, options)

  summarize(outcomes)
}

const runFromCli = async (): Promise<void> => {
  const options = parseArgs()
  await orchestrateTools(options)
}

const isCliExecution = (): boolean => {
  const entryFile = process.argv[1]
  if (!entryFile) {
    return false
  }
  return fileURLToPath(import.meta.url) === resolve(entryFile)
}

if (isCliExecution()) {
  runFromCli().catch(async () => {
    process.exit(1);
  });
}
