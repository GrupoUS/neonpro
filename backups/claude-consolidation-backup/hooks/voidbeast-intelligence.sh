#!/bin/bash
# VoidBeast Intelligence Hook - Autonomous Healthcare Workflow Detection
# Auto-triggered on task complexity detection and Portuguese healthcare triggers

# Hook Configuration
HOOK_NAME="VoidBeast Intelligence V4.0"
HOOK_VERSION="1.0"
HOOK_PRIORITY="HIGH"
HEALTHCARE_FOCUS="true"

# Portuguese Trigger Detection
detect_portuguese_triggers() {
    local input="$1"
    local triggers_found=""
    
    # Implementation triggers
    if echo "$input" | grep -i -E "(implementar|desenvolver|criar|construir)" > /dev/null; then
        triggers_found="$triggers_found implementation"
    fi
    
    # Optimization triggers  
    if echo "$input" | grep -i -E "(otimizar|melhorar|debugar|corrigir)" > /dev/null; then
        triggers_found="$triggers_found optimization"
    fi
    
    # Continuation triggers
    if echo "$input" | grep -i -E "(continue|continuar|prosseguir|seguir)" > /dev/null; then
        triggers_found="$triggers_found continuation"
    fi
    
    # Memory triggers
    if echo "$input" | grep -i -E "(lembre-se|lembre|não se esqueça|contexto|histórico)" > /dev/null; then
        triggers_found="$triggers_found memory"
    fi
    
    # Healthcare triggers
    if echo "$input" | grep -i -E "(paciente|clínica|médico|saúde|LGPD|ANVISA|CFM)" > /dev/null; then
        triggers_found="$triggers_found healthcare"
    fi
    
    echo "$triggers_found"
}

# Complexity Detection Algorithm
detect_complexity() {
    local input="$1"
    local complexity=1
    
    # Base complexity analysis
    local word_count=$(echo "$input" | wc -w)
    if [ $word_count -gt 50 ]; then
        complexity=$((complexity + 2))
    elif [ $word_count -gt 20 ]; then
        complexity=$((complexity + 1))
    fi
    
    # Technical complexity indicators
    if echo "$input" | grep -i -E "(architecture|system|design|database|api)" > /dev/null; then
        complexity=$((complexity + 2))
    fi
    
    # Healthcare complexity escalation
    if echo "$input" | grep -i -E "(paciente|clínica|médico|healthcare|medical)" > /dev/null; then
        complexity=$((complexity + 3))  # Healthcare minimum L3
    fi
    
    # Patient safety critical = automatic L4
    if echo "$input" | grep -i -E "(patient safety|segurança do paciente|emergência|crítico)" > /dev/null; then
        complexity=10
    fi
    
    # Cap at 10
    if [ $complexity -gt 10 ]; then
        complexity=10
    fi
    
    echo $complexity
}

# APEX Level Determination
get_apex_level() {
    local complexity=$1
    
    if [ $complexity -le 3 ]; then
        echo "L1"
    elif [ $complexity -le 6 ]; then
        echo "L2"
    elif [ $complexity -le 8 ]; then
        echo "L3"
    else
        echo "L4"
    fi
}

# MCP Routing Decision
route_mcps() {
    local apex_level="$1"
    local is_healthcare="$2"
    
    case $apex_level in
        "L1")
            echo "desktop-commander context7"
            ;;
        "L2")
            echo "desktop-commander context7 sequential-thinking tavily"
            ;;
        "L3")
            echo "desktop-commander context7 sequential-thinking tavily serena exa"
            ;;
        "L4")
            echo "desktop-commander context7 sequential-thinking tavily serena exa"
            ;;
    esac
}

# Memory Bank Activation
activate_memory_bank() {
    local triggers="$1"
    local memory_files=""
    
    # Always load active context
    memory_files="activeContext.md"
    
    # Conditional loading based on triggers
    if echo "$triggers" | grep "memory" > /dev/null; then
        memory_files="$memory_files decisionLog.md progress.md"
    fi
    
    if echo "$triggers" | grep "implementation" > /dev/null; then
        memory_files="$memory_files systemPatterns.md techContext.md"
    fi
    
    if echo "$triggers" | grep "healthcare" > /dev/null; then
        memory_files="$memory_files healthcareCompliance.md projectbrief.md"
    fi
    
    echo "$memory_files"
}

# Main VoidBeast Intelligence Processing
main() {
    local user_input="$1"
    
    echo "🤖 VoidBeast Intelligence V4.0 - Autonomous Healthcare Analysis"
    echo "================================================="
    
    # Detect Portuguese triggers
    local triggers=$(detect_portuguese_triggers "$user_input")
    echo "📍 Portuguese Triggers Detected: $triggers"
    
    # Detect task complexity
    local complexity=$(detect_complexity "$user_input")
    local apex_level=$(get_apex_level $complexity)
    echo "🎯 Task Complexity: $complexity/10 (APEX $apex_level)"
    
    # Healthcare context detection
    local is_healthcare="false"
    if echo "$triggers" | grep "healthcare" > /dev/null; then
        is_healthcare="true"
        echo "🏥 Healthcare Context: DETECTED - Enhanced protocols activated"
    fi
    
    # MCP Routing Decision
    local required_mcps=$(route_mcps "$apex_level" "$is_healthcare")
    echo "🔗 Required MCPs: $required_mcps"
    
    # Memory Bank Activation
    local memory_files=$(activate_memory_bank "$triggers")
    echo "🧠 Memory Bank Files: $memory_files"
    
    # Performance Target
    case $apex_level in
        "L1") echo "⚡ Performance Target: <100ms" ;;
        "L2") echo "⚡ Performance Target: <200ms" ;;
        "L3") echo "⚡ Performance Target: <500ms" ;;
        "L4") echo "⚡ Performance Target: Quality ≥9.9/10 (unlimited time)" ;;
    esac
    
    # Quality Threshold
    if [ "$is_healthcare" = "true" ]; then
        echo "🏆 Quality Threshold: ≥9.8/10 (Healthcare)"
    else
        echo "🏆 Quality Threshold: ≥9.5/10 (Standard)"
    fi
    
    # APEX Enforcement Warning
    echo ""
    echo "⚠️  APEX ENFORCEMENT ACTIVE:"
    echo "   • Desktop Commander MANDATORY for all file operations"
    echo "   • Zero tolerance for direct file system access"
    echo "   • Context engineering optimization active"
    
    if [ "$is_healthcare" = "true" ]; then
        echo "   • Healthcare compliance monitoring ENABLED"
        echo "   • LGPD/ANVISA/CFM validation REQUIRED"
        echo "   • Patient safety priority ACTIVATED"
    fi
    
    echo ""
    echo "✅ VoidBeast Intelligence Analysis Complete"
    echo "   Autonomous routing configured for optimal healthcare workflow"
}

# Execute if called directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi