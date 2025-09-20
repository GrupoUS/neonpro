import type { FeatureContext, AgentName, AgentCoordinationPattern } from './types';

export class ExecutionPatternSelector {
  selectPattern(context: FeatureContext): AgentCoordinationPattern {
    if (context.complexity === 'high') {
      return 'hierarchical';
    } else if (context.complexity === 'medium') {
      return 'parallel';
    }
    return 'sequential';
  }

  selectOptimalPattern(context: FeatureContext): AgentCoordinationPattern {
    return this.selectPattern(context);
  }

  getRecommendedAgents(context: FeatureContext): AgentName[] {
    const agents: AgentName[] = ['test'];
    
    if (context.complexity === 'high') {
      agents.push('architect-review', 'security-auditor');
    }
    
    if (context.healthcareCompliance) {
      agents.push('security-auditor');
    }
    
    return agents;
  }
}