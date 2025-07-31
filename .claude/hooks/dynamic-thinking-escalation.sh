#!/bin/bash
# Dynamic Thinking Escalation Hook V4.0 - Intelligent Complexity Detection
# Auto-escalation based on semantic analysis and healthcare priority

# Hook Configuration
HOOK_NAME="Dynamic Thinking Escalation V4.0"
HOOK_VERSION="1.0"
HOOK_PRIORITY="CRITICAL"
HEALTHCARE_PRIORITY="true"

# Complexity Detection Keywords
declare -A COMPLEXITY_KEYWORDS
COMPLEXITY_KEYWORDS[simple]="fix add remove update change modify implement\\ basic"
COMPLEXITY_KEYWORDS[medium]="refactor optimize analyze design enhance improve debug"
COMPLEXITY_KEYWORDS[complex]="architect strategy system\\ design compliance security\\ audit"

# Healthcare Context Keywords
HEALTHCARE_KEYWORDS="patient medical health clinical diagnosis LGPD ANVISA CFM compliance audit regulation"

# Detect Task Complexity
detect_complexity() {
    local input="$1"
    local complexity_score=1
    
    # Simple task detection (1-3)
    for keyword in ${COMPLEXITY_KEYWORDS[simple]}; do
        if echo "$input" | grep -i "$keyword" > /dev/null; then
            complexity_score=2
            break
        fi
    done
    
    # Medium task detection (4-6)  
    for keyword in ${COMPLEXITY_KEYWORDS[medium]}; do
        if echo "$input" | grep -i "$keyword" > /dev/null; then
            complexity_score=5
            break
        fi
    done
    
    # Complex task detection (7-10)
    for keyword in ${COMPLEXITY_KEYWORDS[complex]}; do
        if echo "$input" | grep -i "$keyword" > /dev/null; then
            complexity_score=8
            break
        fi
    done
    
    echo $complexity_score
}

# Detect Healthcare Context
detect_healthcare_context() {
    local input="$1"
    
    for keyword in $HEALTHCARE_KEYWORDS; do
        if echo "$input" | grep -i "$keyword" > /dev/null; then
            echo "true"
            return
        fi
    done
    
    echo "false"
}

# Determine Thinking Level
determine_thinking_level() {
    local complexity=$1
    local is_healthcare=$2
    
    # Healthcare amplification rules
    if [ "$is_healthcare" = "true" ]; then
        if [ $complexity -le 3 ]; then
            complexity=5  # Healthcare minimum: Think_Harder
        elif [ $complexity -le 6 ]; then
            complexity=8  # Healthcare enhanced: UltraThink
        else
            complexity=10 # Healthcare critical: Maximum UltraThink
        fi
    fi
    
    # Determine thinking level based on final complexity
    if [ $complexity -le 3 ]; then
        echo "Think (1K tokens)"
    elif [ $complexity -le 6 ]; then
        echo "Think_Harder (4K tokens)"
    else
        echo "UltraThink (16K tokens)"
    fi
}

# Generate Escalation Reasoning
generate_escalation_reasoning() {
    local complexity=$1
    local is_healthcare=$2
    local thinking_level="$3"
    
    echo "🧠 Dynamic Thinking Escalation Reasoning:"
    echo "   Base Complexity Score: $complexity/10"
    echo "   Healthcare Context: $is_healthcare"
    echo "   Recommended Thinking Level: $thinking_level"
    
    if [ "$is_healthcare" = "true" ]; then
        echo "   Healthcare Amplification: +3-5 complexity boost applied"
        echo "   Minimum Standard: Think_Harder for patient data safety"
        echo "   Compliance Critical: UltraThink for LGPD/ANVISA/CFM tasks"
    fi
}

# Main Dynamic Thinking Analysis
main() {
    local user_input="$1"
    
    echo "🧠 Dynamic Thinking Escalation V4.0 - Complexity Analysis"
    echo "=================================================="
    
    # Detect task complexity
    local complexity=$(detect_complexity "$user_input")
    echo "📊 Base Complexity Detected: $complexity/10"
    
    # Detect healthcare context  
    local is_healthcare=$(detect_healthcare_context "$user_input")
    if [ "$is_healthcare" = "true" ]; then
        echo "🏥 Healthcare Context: DETECTED - Applying healthcare amplification"
    else
        echo "📝 General Task Context: Standard complexity rules apply"
    fi
    
    # Determine final thinking level
    local thinking_level=$(determine_thinking_level $complexity "$is_healthcare")
    echo "🎯 Recommended Thinking Level: $thinking_level"
    
    echo ""
    
    # Generate detailed reasoning
    generate_escalation_reasoning $complexity "$is_healthcare" "$thinking_level"
    
    echo ""
    echo "⚡ Dynamic Thinking Integration:"
    echo "   • VoidBeast Intelligence: Coordinated complexity detection"
    echo "   • APEX MCP Enforcement: Optimized for determined complexity"  
    echo "   • Memory Bank Activation: Context loaded based on thinking level"
    echo "   • Healthcare Compliance: $([ "$is_healthcare" = "true" ] && echo "ACTIVE" || echo "STANDBY")"
    
    echo ""
    echo "✅ Dynamic Thinking Escalation Complete"
    echo "   Intelligent thinking level recommendation: $thinking_level"
}

# Execute if called directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi