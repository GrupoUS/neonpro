import { createTDDOrchestrationSystem } from './orchestration-system';
import type {
  FeatureContext,
  OrchestrationOptions,
  OrchestrationResult,
  QualityControlResult,
} from './types';

export async function executeQualityControl(
  command: string,
): Promise<QualityControlResult> {
  const startTime = Date.now();

  // Create a temporary orchestration system for quality control
  const system = createTDDOrchestrationSystem({
    enableCommunication: true,
    enableMetrics: true,
    enableCompliance: true,
    healthcareMode: command.includes('--healthcare'),
  });

  await system.initialize();

  try {
    // Parse command to extract context
    const context = parseQualityControlCommand(command);

    // Execute quality control through the bridge
    const result = await system.qualityControlBridge.executeQualityControl(
      command,
      context,
    );

    const duration = Date.now() - startTime;

    return {
      success: result.success,
      command,
      orchestrationResult: result.orchestrationResult,
      duration,
    };
  } finally {
    await system.shutdown();
  }
}

export async function runTDDCycle(
  feature: FeatureContext,
  options: OrchestrationOptions,
): Promise<OrchestrationResult> {
  const startTime = Date.now();

  // Create orchestration system
  const system = createTDDOrchestrationSystem({
    enableCommunication: options.enableMetrics,
    enableMetrics: options.enableMetrics,
    enableCompliance: options.enableCompliance,
    healthcareMode: options.healthcare,
  });

  await system.initialize();

  try {
    // Execute full TDD cycle
    const result = await system.orchestrator.executeFullTDDCycle(
      feature,
      options,
    );

    // Preserve the duration from the orchestrator result
    return {
      ...result,
      duration: result.duration || Date.now() - startTime,
    };
  } finally {
    await system.shutdown();
  }
}

function parseQualityControlCommand(command: string): any {
  const parts = command.split(' ');
  const context: any = {
    action: 'analyze',
    type: 'general',
    parallel: false,
    agents: [],
    coordination: 'sequential',
    healthcare: false,
  };

  for (const part of parts) {
    if (part === '--parallel') {
      context.parallel = true;
      context.coordination = 'parallel';
    } else if (part === '--healthcare') {
      context.healthcare = true;
    } else if (part.startsWith('--type=')) {
      context.type = part.split('=')[1];
    } else if (part.startsWith('--agents=')) {
      context.agents = part.split('=')[1].split(',');
    } else if (part.startsWith('--depth=')) {
      context.depth = part.split('=')[1];
    }
  }

  return context;
}
