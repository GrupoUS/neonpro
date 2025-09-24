import type { AgentCoordinationPattern } from './types'

type Agent = {
  name: string
  type: string
  capabilities: string[]
}

type CoordinationGroup = {
  agents: Agent[]
  coordination: AgentCoordinationPattern
}

type ExecutionPlan = {
  phases: Array<{
    name: string
    agents: Agent[]
    parallel: boolean
    coordination: AgentCoordinationPattern
  }>
  totalEstimatedTime: number
  parallelizationFactor: number
  conflictResolution: string
}

export class TDDAgentRegistry {
  private agents: Agent[] = [
    {
      name: 'code-reviewer',
      type: 'quality',
      capabilities: ['code-review', 'static-analysis', 'linting'],
    },
    {
      name: 'architect-review',
      type: 'quality',
      capabilities: ['architecture-review', 'design-patterns', 'scalability'],
    },
    {
      name: 'test-auditor',
      type: 'testing',
      capabilities: ['unit-testing', 'integration-testing', 'test-coverage'],
    },
    {
      name: 'test',
      type: 'testing',
      capabilities: ['unit-testing', 'test-execution'],
    },
  ]

  getParallelOptimizedAgents(agentNames: string[]): Agent[] {
    return agentNames.map((name) => {
      const agent = this.agents.find((a) => a.name === name)
      return agent || { name, type: 'unknown', capabilities: [] }
    })
  }

  getAgentCoordinationGroups(
    agentNames: string[],
    coordination: AgentCoordinationPattern,
  ): CoordinationGroup[] {
    const agents = this.getParallelOptimizedAgents(agentNames)

    return [
      {
        agents,
        coordination,
      },
    ]
  }

  createParallelExecutionPlan(
    agentNames: string[],
    coordination: AgentCoordinationPattern,
  ): ExecutionPlan {
    const agents = this.getParallelOptimizedAgents(agentNames)

    return {
      phases: [
        {
          name: 'execution',
          agents,
          parallel: true,
          coordination,
        },
      ],
      totalEstimatedTime: 300,
      parallelizationFactor: 0.6,
      conflictResolution: 'priority-based',
    }
  }
}
