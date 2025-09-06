#!/usr/bin/env python3
"""
Workflow Coordinator Hook for Claude Code
Coordinates plan mode (research.md) and execute mode (workflow-management.md)
Provides intelligent command suggestions based on session context
"""

import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime

def log_message(message, level="INFO"):
    """Log messages with consistent formatting"""
    print(f"🎯 [{level}] {message}", file=sys.stderr)

def detect_mode_from_prompt(prompt):
    """Detect current mode based on user prompt patterns"""
    prompt_lower = prompt.lower()
    
    # Plan mode indicators
    plan_indicators = [
        # Portuguese
        'planejar', 'pesquisar', 'estudar', 'analisar', 'avaliar', 'investigar',
        'comparar', 'validar', 'entender', 'descobrir', 'como funciona',
        'qual é o melhor', 'quais são as opções', 'preciso saber',
        # English  
        'plan', 'research', 'study', 'analyze', 'evaluate', 'investigate',
        'compare', 'validate', 'understand', 'discover', 'how does', 'how to',
        'what is the best', 'what are the options', 'i need to know',
        # Technical research patterns
        'documentação', 'documentation', 'best practices', 'melhores práticas',
        'framework comparison', 'comparação de framework', 'compliance',
        'conformidade', 'requirements', 'requisitos', 'specification'
    ]
    
    # Execute mode indicators  
    execute_indicators = [
        # Portuguese
        'implementar', 'desenvolver', 'criar', 'construir', 'codar', 'programar',
        'fazer', 'executar', 'realizar', 'configurar', 'instalar', 'deploy',
        'corrigir', 'fix', 'resolver', 'solucionar', 'otimizar',
        # English
        'implement', 'develop', 'create', 'build', 'code', 'program',
        'make', 'execute', 'perform', 'configure', 'install', 'deploy',
        'fix', 'solve', 'optimize', 'refactor', 'update',
        # Action patterns
        'write code', 'escrever código', 'add feature', 'adicionar funcionalidade',
        'create component', 'criar componente', 'setup', 'configurar'
    ]
    
    # Count indicators
    plan_count = sum(1 for indicator in plan_indicators if indicator in prompt_lower)
    execute_count = sum(1 for indicator in execute_indicators if indicator in prompt_lower)
    
    # Determine mode based on stronger indicators
    if plan_count > execute_count and plan_count > 0:
        return "plan", plan_count
    elif execute_count > plan_count and execute_count > 0:
        return "execute", execute_count
    else:
        return "unknown", 0

def should_suggest_research(prompt):
    """Determine if research command should be suggested"""
    research_triggers = [
        # Technology questions
        r'\b(como|how)\s+(funciona|works?)\b',
        r'\b(qual|what)\s+.*(melhor|best|better)\b',
        r'\b(comparar|compare)\s+.*(framework|tecnologia|technology)\b',
        r'\b(documentação|documentation)\s+.*(oficial|official)\b',
        
        # Healthcare/compliance specific
        r'\b(lgpd|anvisa|cfm)\b',
        r'\b(compliance|conformidade)\b',
        r'\b(regulamentação|regulation)\b',
        r'\b(audit|auditoria)\b',
        
        # Research patterns
        r'\b(pesquisar|research)\s+',
        r'\b(estudar|study)\s+',
        r'\b(analisar|analyze)\s+',
        r'\b(investigar|investigate)\s+',
        
        # Decision making
        r'\b(devo usar|should\s+i\s+use)\b',
        r'\b(vale a pena|is\s+it\s+worth)\b',
        r'\b(prós e contras|pros\s+and\s+cons)\b',
    ]
    
    prompt_lower = prompt.lower()
    return any(re.search(pattern, prompt_lower) for pattern in research_triggers)

def should_suggest_workflow(prompt):
    """Determine if workflow command should be suggested"""
    workflow_triggers = [
        # Implementation indicators
        r'\b(implementar|implement)\s+',
        r'\b(desenvolver|develop)\s+',
        r'\b(criar|create)\s+.*(projeto|project|aplicação|application)\b',
        r'\b(começar|start)\s+.*(desenvolvimento|development)\b',
        
        # Workflow management
        r'\b(gerenciar|manage)\s+.*(projeto|project|tarefa|task)\b',
        r'\b(workflow|fluxo)\s+',
        r'\b(processo|process)\s+.*(desenvolvimento|development)\b',
        r'\b(archon|task)\s+',
        
        # Action-oriented
        r'\bvamos\s+(fazer|criar|implementar)\b',
        r'\blet\'s\s+(build|create|implement|develop)\b',
        r'\b(iniciar|start)\s+.*(projeto|project)\b',
        
        # Exit plan mode indicators
        r'\b(sair do|exit)\s+.*(plan|plano)\b',
        r'\b(executar|execute)\s+.*(plano|plan)\b',
        r'\b(implementar|implement)\s+.*(plano|plan)\b',
    ]
    
    prompt_lower = prompt.lower()
    return any(re.search(pattern, prompt_lower) for pattern in workflow_triggers)

def get_session_context():
    """Get current session context and history"""
    try:
        # Try to read recent session activity
        home = Path.home()
        claude_dir = home / '.claude'
        
        # Look for recent activity patterns
        context = {
            'recent_research': False,
            'recent_implementation': False,
            'session_start': True  # Assume this is early in session for this demo
        }
        
        return context
    except:
        return {'session_start': True, 'recent_research': False, 'recent_implementation': False}

def generate_command_suggestion(mode, prompt, session_context):
    """Generate appropriate command suggestion based on context"""
    
    if mode == "plan":
        # Suggest research command
        research_suggestions = [
            {
                'command': '/research',
                'description': 'Sistema completo de pesquisa multi-fonte (Context7 → Tavily → Exa)',
                'usage': '/research "[tópico]" --depth=deep',
                'when': 'Para investigação tecnológica e tomada de decisão'
            },
            {
                'command': '/pesquisar',
                'description': 'Versão em português do sistema de pesquisa',
                'usage': '/pesquisar "[tecnologia/padrão]" --profundidade=deep',
                'when': 'Para pesquisa técnica e validação de soluções'
            }
        ]
        
        # Determine specific research type
        if should_suggest_research(prompt):
            if any(term in prompt.lower() for term in ['lgpd', 'anvisa', 'cfm', 'compliance']):
                suggestion = research_suggestions[0].copy()
                suggestion['specific'] = 'Healthcare compliance research detected'
                suggestion['usage'] = '/research "LGPD compliance" --healthcare --depth=comprehensive'
            elif any(term in prompt.lower() for term in ['framework', 'technology', 'biblioteca']):
                suggestion = research_suggestions[0].copy()
                suggestion['specific'] = 'Technology research detected'
                suggestion['usage'] = '/research "framework comparison" --sources=technical'
            else:
                suggestion = research_suggestions[0]
            
            return suggestion
    
    elif mode == "execute":
        # Suggest workflow command
        workflow_suggestions = [
            {
                'command': '/workflow',
                'description': 'Sistema completo de workflow com 7 fases + Archon + 3 níveis cognitivos',
                'usage': '/workflow discover',
                'when': 'Para gerenciar projetos com metodologia estruturada'
            },
            {
                'command': '/fluxo',
                'description': 'Versão em português do sistema de workflow',
                'usage': '/fluxo descobrir',
                'when': 'Para desenvolvimento sistemático com Archon-first'
            }
        ]
        
        # Determine workflow phase
        if any(term in prompt.lower() for term in ['começar', 'start', 'iniciar', 'novo projeto']):
            suggestion = workflow_suggestions[0].copy()
            suggestion['specific'] = 'New project initialization detected'
            suggestion['usage'] = '/workflow discover'
        elif any(term in prompt.lower() for term in ['implementar', 'implement', 'desenvolver']):
            suggestion = workflow_suggestions[0].copy()
            suggestion['specific'] = 'Implementation phase detected'
            suggestion['usage'] = '/workflow execute'
        else:
            suggestion = workflow_suggestions[0]
        
        return suggestion
    
    return None

def main():
    """Main hook execution for workflow coordination"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Get hook event and prompt
        hook_event = input_data.get('hook_event_name', '')
        prompt = input_data.get('prompt', '')
        
        if not prompt:
            log_message("No prompt found - skipping workflow coordination")
            sys.exit(0)
        
        # Get session context
        session_context = get_session_context()
        
        log_message(f"Analyzing prompt for workflow coordination: {prompt[:100]}...")
        
        # Detect mode and generate suggestions
        mode, confidence = detect_mode_from_prompt(prompt)
        
        if mode != "unknown" and confidence > 0:
            log_message(f"Detected mode: {mode} (confidence: {confidence})")
            
            suggestion = generate_command_suggestion(mode, prompt, session_context)
            
            if suggestion:
                # Create helpful context message
                context_message = f"""
🎯 WORKFLOW COORDINATION SUGGESTION

Detected Mode: **{mode.upper()} MODE**
Confidence: {confidence} indicators

📋 Recommended Command: **{suggestion['command']}**
📝 Description: {suggestion['description']}
💡 Usage: `{suggestion['usage']}`
⏰ When: {suggestion['when']}
"""
                
                if suggestion.get('specific'):
                    context_message += f"\n🔍 Context: {suggestion['specific']}"
                
                context_message += f"""

🚀 Quick Start Options:
• For RESEARCH: `/research "[your topic]"` or `/pesquisar "[seu tópico]"`  
• For WORKFLOW: `/workflow discover` or `/fluxo descobrir`
• For HELP: Type `/help workflow` or `/help research`

💡 Tip: Use the appropriate command to activate specialized MCP workflows
"""
                
                # Output suggestion as additional context
                output = {
                    "hookSpecificOutput": {
                        "hookEventName": hook_event,
                        "additionalContext": context_message
                    }
                }
                
                print(json.dumps(output))
                log_message(f"Provided {mode} mode coordination suggestion")
            else:
                log_message(f"No specific suggestion for {mode} mode")
        else:
            log_message("No clear mode detected - general context only")
            
            # Provide general workflow context for ambiguous cases
            if session_context.get('session_start'):
                general_context = """
🎯 WORKFLOW CONTEXT AVAILABLE

📋 Available Command Systems:
• **RESEARCH MODE**: `/research` or `/pesquisar` - Multi-source intelligence (Context7 → Tavily → Exa)
• **EXECUTE MODE**: `/workflow` or `/fluxo` - 7-phase workflow with Archon + 3-tier cognitive system

💡 Quick Decision Guide:
• Need to **research/analyze/compare**? → Use `/research [topic]`
• Need to **implement/develop/build**? → Use `/workflow discover`
• Healthcare/compliance work? → Use `/research [topic] --healthcare`
• Complex project? → Use `/workflow` with Archon integration

Type `/help research` or `/help workflow` for detailed guidance.
"""
                
                output = {
                    "hookSpecificOutput": {
                        "hookEventName": hook_event,
                        "additionalContext": general_context
                    }
                }
                
                print(json.dumps(output))
                log_message("Provided general workflow context")
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        log_message(f"Invalid JSON input: {e}", "ERROR")
        sys.exit(1)
    except Exception as e:
        log_message(f"Workflow coordination error: {e}", "ERROR")
        # Fail silently to not interrupt workflow
        sys.exit(0)

if __name__ == "__main__":
    main()