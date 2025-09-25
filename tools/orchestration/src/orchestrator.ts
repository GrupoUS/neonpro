#!/usr/bin/env node

import { TOOL_WORKFLOWS } from './config'
import { spawn, type ChildProcess } from 'node:child_process'
import type { ToolWorkflow } from '../types'

export async function orchestrateTools(options: {
  workflowIds?: string[]
  parallel?: boolean
  dryRun?: boolean
  verbose?: boolean
} = {}): Promise<void> {
  const {
    workflowIds,
    parallel = false,
    dryRun = false,
    verbose = false
  } = options

  const workflows = workflowIds 
    ? TOOL_WORKFLOWS.filter(w => workflowIds.includes(w.id))
    : TOOL_WORKFLOWS

  if (workflows.length === 0) {
    console.log('No workflows found to execute')
    return
  }

  console.log(`🚀 Executing ${workflows.length} workflow${workflows.length > 1 ? 's' : ''}...`)
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No commands will be executed')
  }

  if (parallel) {
    console.log('⚡ Running workflows in parallel...')
    await Promise.all(workflows.map(workflow => runWorkflow(workflow, dryRun, verbose)))
  } else {
    console.log('📋 Running workflows sequentially...')
    for (const workflow of workflows) {
      await runWorkflow(workflow, dryRun, verbose)
    }
  }
}

async function runWorkflow(workflow: ToolWorkflow, dryRun = false, verbose = false): Promise<void> {
  console.log(`\n🎯 ${workflow.displayName} (${workflow.id})`)
  
  for (const step of workflow.steps) {
    console.log(`  📍 ${step.name}`)
    
    if (dryRun) {
      console.log(`     Command: ${step.command.join(' ')}`)
      if (step.cwd) {
        console.log(`     CWD: ${step.cwd}`)
      }
      continue
    }

    if (verbose) {
      console.log(`     Executing: ${step.command.join(' ')}`)
    }

    try {
      await executeCommand(step.command, step.cwd)
      console.log(`     ✅ Completed`)
    } catch (error) {
      console.log(`     ❌ Failed: ${(error as Error).message}`)
      throw error
    }
  }
}

function executeCommand(command: string[], cwd?: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (command.length === 0) {
      reject(new Error('Command array cannot be empty'))
      return
    }
    
    const workingDir = cwd ?? process.cwd()
    const [cmd, ...args] = command
    
    if (!cmd) {
      reject(new Error('Command cannot be undefined'))
      return
    }
    
    const child: ChildProcess = spawn(cmd, args, {
      cwd: workingDir,
      stdio: 'inherit'
    })

    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (error: Error) => {
      reject(error)
    })
  })
}