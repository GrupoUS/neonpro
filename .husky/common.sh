#!/bin/sh

# Common utilities for Husky hooks - Windows compatibility layer
# Source this file in your hooks with: . "$(dirname -- "$0")/common.sh"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Windows Git Bash compatibility fix for "stdin is not a tty" error
# This is needed when using Yarn on Windows with Git Bash
windows_tty_fix() {
    if command_exists winpty && test -t 1; then
        exec < /dev/tty
    fi
}

# Enhanced environment setup for Windows
setup_windows_environment() {
    # Add Node.js to PATH
    export PATH="/c/Program Files/nodejs:$PATH"
    export PATH="C:/Program Files/nodejs:$PATH"
    
    # Add npm global directory
    export PATH="/c/Users/Mauri/AppData/Roaming/npm:$PATH"
    export PATH="C:/Users/Mauri/AppData/Roaming/npm:$PATH"
    
    # Set PNPM_HOME if not set
    if [ -z "$PNPM_HOME" ]; then
        export PNPM_HOME="C:/Users/Mauri/AppData/Roaming/npm"
        export PATH="$PNPM_HOME:$PATH"
    fi
    
    # Add local node_modules/.bin
    if [ -d "./node_modules/.bin" ]; then
        export PATH="./node_modules/.bin:$PATH"
    fi
    
    # Ensure npx is available (it comes with npm)
    if command_exists npm && ! command_exists npx; then
        # Create npx alias if it doesn't exist
        alias npx="npm exec --"
    fi
}

# Function to detect the current environment
detect_environment() {
    if [ -n "$VSCODE_GIT_ASKPASS_NODE" ] || [ -n "$VSCODE_GIT_ASKPASS_EXTRA_ARGS" ]; then
        echo "vscode"
    elif [ -n "$MSYSTEM" ]; then
        echo "git-bash"
    elif [ -n "$PSModulePath" ]; then
        echo "powershell"
    else
        echo "terminal"
    fi
}

# Function to check and setup package manager
setup_package_manager() {
    local env_type="$(detect_environment)"
    
    echo "Detected environment: $env_type" >&2
    
    # Apply Windows compatibility fixes
    if [ "$env_type" = "git-bash" ] || [ "$env_type" = "vscode" ]; then
        windows_tty_fix
        setup_windows_environment
    fi
    
    # Check for pnpm availability
    if command_exists pnpm; then
        echo "Package manager: pnpm" >&2
        return 0
    elif command_exists npm; then
        echo "Package manager: npm (fallback)" >&2
        return 0
    else
        echo "No package manager found!" >&2
        return 1
    fi
}

# Function to run package manager commands with fallbacks
run_package_command() {
    local cmd="$1"
    
    if command_exists pnpm; then
        pnpm $cmd
    elif command_exists npm; then
        npm run $cmd
    else
        echo "❌ No package manager available to run: $cmd" >&2
        return 1
    fi
}

# Function to run npx commands with fallbacks  
run_npx_command() {
    local cmd="$1"
    shift  # Remove first argument, rest are parameters
    
    if command_exists pnpm; then
        echo "Using pnpm exec for: $cmd" >&2
        pnpm exec $cmd "$@"
    elif command_exists npx; then
        echo "Using npx for: $cmd" >&2
        npx $cmd "$@"
    elif command_exists npm; then
        echo "Using npm exec for: $cmd" >&2
        npm exec $cmd "$@"
    else
        echo "❌ No package executor available to run: $cmd" >&2
        return 1
    fi
}

# Function to print environment debug information
debug_environment() {
    echo "=== Environment Debug Information ===" >&2
    echo "Environment: $(detect_environment)" >&2
    echo "PATH: $PATH" >&2
    echo "PNPM_HOME: ${PNPM_HOME:-'not set'}" >&2
    echo "PWD: $PWD" >&2
    echo "Node.js: $(command -v node || echo 'not found')" >&2
    echo "npm: $(command -v npm || echo 'not found')" >&2
    echo "npx: $(command -v npx || echo 'not found')" >&2
    echo "pnpm: $(command -v pnpm || echo 'not found')" >&2
    echo "Git Bash: ${MSYSTEM:-'not detected'}" >&2
    echo "===================================" >&2
}

# Auto-setup when sourced
if [ "${HUSKY_DEBUG:-0}" = "1" ]; then
    debug_environment
fi

# Always run setup when this file is sourced
setup_package_manager