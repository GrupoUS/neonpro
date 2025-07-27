#!/bin/bash
# VoidBeast V4.0 Pre-Task Validation Hook
# Validates healthcare context and ensures proper agent routing

echo "🛡️ VoidBeast V4.0 Pre-Task Validation Started"

# Check if healthcare context is detected
if [[ "$TASK_DESCRIPTION" =~ (patient|medical|health|lgpd|anvisa|cfm|clinic) ]]; then
    echo "🏥 Healthcare context detected - activating medical compliance protocols"
    export HEALTHCARE_MODE=true
    export QUALITY_THRESHOLD=9.5
    export COMPLIANCE_REQUIRED=true
fi

# Complexity assessment for MCP routing
COMPLEXITY_SCORE=0

# Simple keywords (+1 each)
if [[ "$TASK_DESCRIPTION" =~ (format|add|fix|basic|simple) ]]; then
    COMPLEXITY_SCORE=$((COMPLEXITY_SCORE + 1))
fi

# Medium keywords (+2 each)
if [[ "$TASK_DESCRIPTION" =~ (refactor|implement|debug|optimize|integrate) ]]; then
    COMPLEXITY_SCORE=$((COMPLEXITY_SCORE + 2))
fi

# Complex keywords (+3 each)
if [[ "$TASK_DESCRIPTION" =~ (design|architecture|distributed|security|performance) ]]; then
    COMPLEXITY_SCORE=$((COMPLEXITY_SCORE + 3))
fi

# Healthcare adds complexity
if [[ "$HEALTHCARE_MODE" == "true" ]]; then
    COMPLEXITY_SCORE=$((COMPLEXITY_SCORE + 2))
fi

export COMPLEXITY_SCORE

# Determine required agent
if [[ "$COMPLEXITY_SCORE" -ge 3 ]] || [[ "$HEALTHCARE_MODE" == "true" ]]; then
    echo "🤖 VoidBeast V4.0 enforcing NeonPro Code Guardian activation"
    export REQUIRED_AGENT="neonpro-code-guardian"
    export MCP_COORDINATION="enhanced"
else
    echo "⚡ Standard processing with basic MCP coordination"
    export MCP_COORDINATION="basic"
fi

# Quality gate setup
export QUALITY_GATE_ENABLED=true
export MIN_QUALITY_SCORE=9.5

echo "✅ Pre-task validation complete"
echo "   - Healthcare Mode: ${HEALTHCARE_MODE:-false}"
echo "   - Complexity Score: $COMPLEXITY_SCORE"
echo "   - Required Agent: ${REQUIRED_AGENT:-default}"
echo "   - MCP Coordination: $MCP_COORDINATION"

exit 0