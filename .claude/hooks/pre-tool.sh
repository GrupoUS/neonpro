#!/bin/bash

# Linux/Unix Pre-Tool Hook for Claude Code
# This script executes before each tool call

# Get script directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${HOOK_DIR}/claude-hooks.log"
CACHE_DIR="${HOOK_DIR}/../../.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Initialize variables
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"

# Set environment variables
export CLAUDE_HOOK_PHASE="pre_tool_use"
export CLAUDE_CURRENT_TOOL="$TOOL_NAME"

# Log execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] Pre-tool hook: $TOOL_NAME" >> "$LOG_FILE" 2>/dev/null

# Exit successfully
exit 0