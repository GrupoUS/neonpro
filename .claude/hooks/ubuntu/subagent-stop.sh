#!/bin/bash
# Compatibility wrapper for session-intelligence.sh - Ubuntu Version
# Redirects to the new consolidated hook

SCRIPT_DIR="$(dirname "$0")"
"$SCRIPT_DIR/session-intelligence.sh" "$@"
exit $?