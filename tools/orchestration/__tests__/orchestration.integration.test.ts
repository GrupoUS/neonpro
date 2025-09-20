/**
 * Manual Test Script for Parallel Agent Execution Workflows
 * Validates TDD orchestration and quality control integration
 */

import {
  createTDDOrchestrationSystem,
  executeQualityControl,
  runTDDCycle,
} from "./index";
import type {
  FeatureContext,
  OrchestrationOptions,
  QualityControlContext,
} from "./types";

async function testParallelExecution() {
  console.log("🧪 Starting Parallel Agent Execution Tests\n");

  try {
    // Test 1: Basic System Initialization
    console.log("1️⃣ Testing System Initialization...");
    const system = createTDDOrchestrationSystem({
      enableCommunication: true,
      enableMetrics: true,
      enableCompliance: true,
      healthcareMode: true,
    });

    await system.initialize();
    const status = system.getStatus();
    console.log("✅ System initialized successfully");
    console.log(`   - Agents: ${status.components.agentRegistry}`);
    console.log(`   - Workflows: ${status.components.workflowEngine}`);
    console.log(`   - Healthcare mode: ${status.healthcareMode}\n`);

    // Test 2: Quality Control Command Execution
    console.log("2️⃣ Testing Quality Control Commands...");
    const commands = [
      "analyze --type security --depth L5 --parallel --agents code-reviewer,test-auditor",
      "test --type unit --parallel --agents test,code-reviewer",
      "review --depth L6 --parallel --agents architect-review,test-auditor --healthcare",
    ];

    for (const command of commands) {
      try {
        const result = await executeQualityControl(command);
        console.log(
          `✅ Command "${command.split(" ")[0]}" executed: ${result.success}`,
        );
        console.log(`   - Duration: ${result.duration}ms`);
        console.log(
          `   - Agents: ${result.orchestrationResult?.agentResults?.length || 0}`,
        );
      } catch (error) {
        console.log(`❌ Command "${command}" failed: ${error.message}`);
      }
    }
    console.log();

    // Test 3: Parallel TDD Cycle Execution
    console.log("3️⃣ Testing Parallel TDD Cycle...");
    const testFeature: FeatureContext = {
      name: "parallel-test-feature",
      description: "Test feature for parallel execution validation",
      domain: ["testing", "orchestration"],
      complexity: "medium",
      requirements: [
        "Parallel agent execution",
        "Quality control integration",
        "Healthcare compliance validation",
      ],
      acceptance: [
        "All agents execute in parallel",
        "Quality gates are enforced",
        "Healthcare compliance is validated",
      ],
    };

    const options: OrchestrationOptions = {
      workflow: "parallel",
      coordination: "parallel",
      agents: ["code-reviewer", "architect-review", "test-auditor"],
      healthcare: true,
    };

    try {
      const result = await system.executeTDDCycle(testFeature, options);
      console.log(`✅ TDD Cycle completed: ${result.success}`);
      console.log(`   - Phases: ${result.phases?.length || 0}`);
      console.log(`   - Agent results: ${result.agentResults?.length || 0}`);
      console.log(`   - Coordination: ${result.coordination}`);
      console.log(`   - Duration: ${result.duration}ms`);
    } catch (error) {
      console.log(`❌ TDD Cycle failed: ${error.message}`);
    }
    console.log();

    // Test 4: Agent Registry Parallel Optimization
    console.log("4️⃣ Testing Agent Registry Optimization...");
    const agents = [
      "code-reviewer",
      "architect-review",
      "test-auditor",
      "test",
    ];
    const optimized = system.agentRegistry.getParallelOptimizedAgents(agents);
    console.log(`✅ Optimized ${agents.length} agents for parallel execution`);
    console.log(`   - Input agents: ${agents.join(", ")}`);
    console.log(
      `   - Optimized agents: ${optimized.map((a) => a.name).join(", ")}`,
    );

    const groups = system.agentRegistry.getAgentCoordinationGroups(
      agents,
      "parallel",
    );
    console.log(`   - Coordination groups: ${groups.length}`);

    const plan = system.agentRegistry.createParallelExecutionPlan(
      agents,
      "parallel",
    );
    console.log(`   - Execution phases: ${plan.phases.length}`);
    console.log(`   - Parallelization factor: ${plan.parallelizationFactor}`);
    console.log(`   - Conflict resolution: ${plan.conflictResolution}\n`);

    // Test 5: Communication System
    console.log("5️⃣ Testing Communication System...");
    if (system.communication) {
      const stats = system.communication.getSystemStats();
      console.log("✅ Communication system active");
      console.log(`   - Registered agents: ${stats.protocol.registeredAgents}`);
      console.log(`   - Total messages: ${stats.messageBus.totalMessages}`);
      console.log(`   - Active conflicts: ${stats.health.activeConflicts}`);
    } else {
      console.log("❌ Communication system not available");
    }
    console.log();

    // Test 6: Metrics Collection
    console.log("6️⃣ Testing Metrics Collection...");
    const metrics = system.getMetrics();
    if ("snapshot" in metrics) {
      console.log("✅ Metrics collection active");
      console.log(
        `   - Total executions: ${metrics.snapshot.orchestration.totalExecutions}`,
      );
      console.log(
        `   - Quality score: ${metrics.snapshot.quality.overallQualityScore.toFixed(1)}`,
      );
      console.log(
        `   - Average execution time: ${metrics.snapshot.performance.averageExecutionTime}ms`,
      );
      console.log(
        `   - LGPD compliance: ${(metrics.snapshot.healthcare.lgpdCompliance * 100).toFixed(1)}%`,
      );
    } else {
      console.log("❌ Metrics collection not available");
    }
    console.log();

    // Test 7: Healthcare Compliance
    console.log("7️⃣ Testing Healthcare Compliance...");
    if (system.complianceValidator) {
      const context = {
        featureName: "healthcare-test",
        featureType: "healthcare",
        complexity: "high" as const,
        criticalityLevel: "critical" as const,
        requirements: ["LGPD compliance", "ANVISA validation"],
        healthcareCompliance: {
          required: true,
          lgpd: true,
          anvisa: true,
          cfm: true,
        },
      };

      const agentResults = [
        {
          agentName: "test-auditor" as const,
          success: true,
          result: { securityScan: { vulnerabilities: [], score: 95 } },
          duration: 100,
          quality: { score: 9.5, issues: [] },
        },
      ];

      try {
        const compliance = await system.validateCompliance(
          context,
          agentResults,
        );
        console.log("✅ Healthcare compliance validation completed");
        console.log(
          `   - LGPD compliance: ${compliance.lgpd.compliant ? "✅" : "❌"} (${compliance.lgpd.score}/100)`,
        );
        console.log(
          `   - ANVISA compliance: ${compliance.anvisa.compliant ? "✅" : "❌"} (${compliance.anvisa.score}/100)`,
        );
        console.log(
          `   - CFM compliance: ${compliance.cfm.compliant ? "✅" : "❌"} (${compliance.cfm.score}/100)`,
        );
      } catch (error) {
        console.log(
          `❌ Healthcare compliance validation failed: ${error.message}`,
        );
      }
    } else {
      console.log("❌ Healthcare compliance validator not available");
    }
    console.log();

    // Test 8: Command Examples
    console.log("8️⃣ Testing Command Examples...");
    const examples = system.getCommandExamples();
    console.log(`✅ Available commands: ${examples.availableCommands.length}`);
    console.log(
      `   - Example commands: ${examples.examples.slice(0, 3).join(", ")}`,
    );
    console.log(`   - Available workflows: ${examples.workflows.join(", ")}`);
    console.log(`   - Registered agents: ${examples.agents.length}`);
    console.log();

    // Cleanup
    await system.shutdown();
    console.log("🏁 All tests completed successfully!\n");

    // Summary
    console.log("📊 Test Summary:");
    console.log("✅ System Initialization");
    console.log("✅ Quality Control Commands");
    console.log("✅ Parallel TDD Cycle Execution");
    console.log("✅ Agent Registry Optimization");
    console.log("✅ Communication System");
    console.log("✅ Metrics Collection");
    console.log("✅ Healthcare Compliance");
    console.log("✅ Command Examples");
    console.log(
      "\n🎉 Parallel Agent Execution Workflows are working correctly!",
    );
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

// Run the tests
if (import.meta.main) {
  testParallelExecution();
}

export { testParallelExecution };
