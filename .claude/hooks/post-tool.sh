#!/bin/bash

# Linux/Unix Post-Tool Hook for Claude Code
# This script executes after each tool call

# Initialize variables
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
TOOL_RESULT="${CLAUDE_TOOL_RESULT:-success}"

# Set environment variables
export CLAUDE_HOOK_PHASE="post_tool_use"
export CLAUDE_CURRENT_TOOL="$TOOL_NAME"
export CLAUDE_TOOL_RESULT="$TOOL_RESULT"

# Only log errors to reduce token consumption
if [ "$TOOL_RESULT" != "success" ] && [ "$TOOL_RESULT" != "" ]; then
    echo "Hook error: $TOOL_NAME failed ($TOOL_RESULT)"
fi

# Output suppressOutput directive for Claude
echo '{"suppressOutput": true}'
exit 0