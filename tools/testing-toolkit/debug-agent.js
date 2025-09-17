// Debug script to check AgentCoordinator export
import { AgentCoordinator } from './dist/agents/index.js';

console.log('AgentCoordinator:', AgentCoordinator);
console.log('typeof AgentCoordinator:', typeof AgentCoordinator);
console.log('AgentCoordinator.prototype:', AgentCoordinator.prototype);

try {
  const coordinator = new AgentCoordinator({
    pattern: 'sequential',
    agents: ['architect-review'],
    qualityGates: ['test'],
  });
  console.log('✅ AgentCoordinator instantiated successfully');
  console.log('coordinator:', coordinator);
} catch (error) {
  console.error('❌ Failed to instantiate AgentCoordinator:', error);
}
