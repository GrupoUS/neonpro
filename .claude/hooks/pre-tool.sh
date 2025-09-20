#!/bin/bash
# Minimal pre-tool hook - essential env vars only
export CLAUDE_HOOK_PHASE="pre_tool_use"
export CLAUDE_CURRENT_TOOL="${CLAUDE_TOOL_NAME:-unknown}"

# Output suppressOutput directive for Claude
echo '{"suppressOutput": true}'
exit 0
