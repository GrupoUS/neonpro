#!/usr/bin/env python3
"""
Session Context Hook for Claude Code
Provides initial context about available workflow commands
Runs on SessionStart to set up command coordination
"""

import json
import sys
import os
from datetime import datetime

def main():
    """Provide initial session context about workflow commands"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        hook_event = input_data.get('hook_event_name', '')
        
        if hook_event == 'SessionStart':
            # Provide comprehensive workflow context
            context_message = """
🚀 NEONPRO WORKFLOW COMMANDS ACTIVATED

📋 **INTELLIGENT COMMAND COORDINATION**:

🔬 **RESEARCH MODE** (Plan Phase):
• `/research [topic]` - Multi-source intelligence (Context7 → Tavily → Exa)
• `/pesquisar [tópico]` - Versão em português
• **Use when**: Planning, analyzing, comparing technologies, compliance research
• **Healthcare**: Auto-activates LGPD/ANVISA/CFM compliance research

⚙️ **EXECUTE MODE** (Implementation Phase):  
• `/workflow discover` - 7-phase systematic development with Archon integration
• `/fluxo descobrir` - Versão em português
• **Use when**: Building, implementing, managing projects systematically
• **Features**: Archon-first task management + 3-tier cognitive system

🎯 **SMART ACTIVATION**:
• Hooks will automatically suggest appropriate commands based on your prompts
• Healthcare projects auto-activate compliance and ultrathink cognitive level
• Complex projects auto-scale cognitive levels (think → megathink → ultrathink)

💡 **QUICK START**:
• Research/Planning: `/research "[your question]"`
• Development/Building: `/workflow discover`
• Healthcare/Compliance: `/research "[topic]" --healthcare`

The system will intelligently coordinate between research and workflow commands based on your needs.
"""
            
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": context_message
                }
            }
            
            print(json.dumps(output))
        
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        print(f"🎯 [ERROR] Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"🎯 [ERROR] Session context error: {e}", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()