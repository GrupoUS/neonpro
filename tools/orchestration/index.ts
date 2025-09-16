#!/usr/bin/env tsx

/**
 * TDD Orchestration Framework - Main Entry Point
 * 
 * Coordinates test-driven development cycles using specialized code review agents.
 * Implements red-green-refactor discipline with intelligent agent delegation.
 * 
 * Usage:
 *   tsx tools/orchestration/index.ts --workflow=standard --feature=user-auth
 *   tsx tools/orchestration/index.ts --workflow=security-critical --all-agents
 *   tsx tools/orchestration/index.ts --phase=red --agents=test,architect-review
 */

import { TDDOrchestrator } from './tdd-orchestrator';
import { AgentRegistry } from './agent-registry';
import { WorkflowEngine } from './workflows/workflow-engine';
import { OrchestrationType, FeatureContext, OrchestrationOptions } from './types';
import { logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const options = parseCommandLineArgs(args);
  
  try {
    logger.info('🎯 Starting TDD Orchestration Framework', { options });
    
    // Initialize orchestration components
    const agentRegistry = new AgentRegistry();
    const workflowEngine = new WorkflowEngine(agentRegistry);
    const orchestrator = new TDDOrchestrator(agentRegistry, workflowEngine);
    
    // Execute orchestration based on options
    let result;
    
    switch (options.type) {
      case 'full-cycle':
        result = await orchestrator.executeFullTDDCycle(options.feature, options);
        break;
        
      case 'phase-specific':
        result = await orchestrator.executePhase(options.phase!, options.feature, options);
        break;
        
      case 'agent-specific':
        result = await orchestrator.executeAgentTasks(options.agents!, options.feature, options);
        break;
        
      case 'workflow-specific':
        result = await orchestrator.executeWorkflow(options.workflow!, options.feature, options);
        break;
        
      default:
        throw new Error(`Unknown orchestration type: ${options.type}`);
    }
    
    // Generate comprehensive report
    await orchestrator.generateReport(result);
    
    logger.success('✅ TDD Orchestration completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ TDD Orchestration failed', error);
    process.exit(1);
  }
}

function parseCommandLineArgs(args: string[]): OrchestrationOptions {
  const options: OrchestrationOptions = {
    type: 'full-cycle',
    feature: {
      name: 'default-feature',
      complexity: 'medium',
      domain: ['general'],
      requirements: []
    }
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--workflow=')) {
      options.type = 'workflow-specific';
      options.workflow = arg.split('=')[1] as any;
    }
    
    else if (arg.startsWith('--phase=')) {
      options.type = 'phase-specific';
      options.phase = arg.split('=')[1] as any;
    }
    
    else if (arg.startsWith('--agents=')) {
      options.type = 'agent-specific';
      options.agents = arg.split('=')[1].split(',') as any[];
    }
    
    else if (arg.startsWith('--feature=')) {
      const featureName = arg.split('=')[1];
      options.feature = inferFeatureContext(featureName);
    }
    
    else if (arg === '--all-agents') {
      options.allAgents = true;
    }
    
    else if (arg === '--parallel') {
      options.parallel = true;
    }
    
    else if (arg === '--healthcare') {
      options.healthcare = true;
      options.feature.domain.push('healthcare');
    }
    
    else if (arg === '--security-critical') {
      options.securityCritical = true;
      options.feature.domain.push('security');
    }
    
    else if (arg === '--verbose') {
      options.verbose = true;
    }
    
    else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }
  
  return options;
}

function inferFeatureContext(featureName: string): FeatureContext {
  const context: FeatureContext = {
    name: featureName,
    complexity: 'medium',
    domain: ['general'],
    requirements: []
  };
  
  // Infer complexity based on feature name
  if (featureName.includes('auth') || featureName.includes('payment') || featureName.includes('security')) {
    context.complexity = 'high';
    context.domain.push('security');
  }
  
  if (featureName.includes('microservice') || featureName.includes('distributed') || featureName.includes('integration')) {
    context.complexity = 'high';
    context.domain.push('architecture');
  }
  
  if (featureName.includes('patient') || featureName.includes('healthcare') || featureName.includes('medical')) {
    context.domain.push('healthcare');
    context.requirements.push('LGPD compliance', 'ANVISA compliance');
  }
  
  if (featureName.includes('simple') || featureName.includes('basic') || featureName.includes('util')) {
    context.complexity = 'low';
  }
  
  return context;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TDDOrchestrator, AgentRegistry, WorkflowEngine };
export * from './types';