#!/bin/bash

# Linux/Unix Post-Tool Hook for Claude Code
# This script executes after each tool call

# Get script directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${HOOK_DIR}/claude-hooks.log"
CACHE_DIR="${HOOK_DIR}/../../.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Initialize variables
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
TOOL_RESULT="${CLAUDE_TOOL_RESULT:-success}"

# Set environment variables
export CLAUDE_HOOK_PHASE="post_tool_use"
export CLAUDE_CURRENT_TOOL="$TOOL_NAME"
export CLAUDE_TOOL_RESULT="$TOOL_RESULT"

# Log execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Post-tool hook: $TOOL_NAME ($TOOL_RESULT)" >> "$LOG_FILE" 2>/dev/null

# Exit successfully
exit 0