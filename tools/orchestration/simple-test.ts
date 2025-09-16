#!/usr/bin/env bun

import { TDDAgentRegistry } from './agent-registry';
import { TDDOrchestrator } from './tdd-orchestrator';

console.log('Testing imports...');

try {
  const registry = new TDDAgentRegistry();
  console.log('✅ TDDAgentRegistry imported and instantiated successfully');
  console.log(`   - Available agents: ${registry.getAllAgents().length}`);
} catch (error) {
  console.error('❌ TDDAgentRegistry import failed:', error);
}

try {
  const registry = new TDDAgentRegistry();
  const orchestrator = new TDDOrchestrator(registry);
  console.log('✅ TDDOrchestrator imported and instantiated successfully');
} catch (error) {
  console.error('❌ TDDOrchestrator import failed:', error);
}

console.log('✅ Import test completed');