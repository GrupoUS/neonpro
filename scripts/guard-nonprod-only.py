#!/usr/bin/env python3
"""
Guard script for non-production operations.

This script validates that potentially dangerous operations are only performed
in non-production environments and that git commands don't use dangerous flags.

Exit codes:
- 0: Operation allowed
- 1: Operation blocked (production environment or dangerous flags)
- 2: Invalid arguments or configuration error
"""

import os
import sys
import re
from typing import List, Optional


def is_production_environment() -> bool:
    """Check if we're running in a production environment."""
    env = os.environ.get('CLAUDE_ENV', '').lower()
    return env == 'production'


def get_dangerous_git_flags() -> List[str]:
    """Get list of dangerous git flags that should be blocked."""
    return [
        '-p', '--patch',
        '-S', '--pickaxe-regex',
        '-G', '--pickaxe-all',
        '--stat',
        '--numstat',
        '--shortstat',
        '--name-status',
        '--summary',
        '--patch-with-stat',
        '--patch-with-raw',
        '--show-signature'
    ]


def get_safe_git_flags() -> List[str]:
    """Get list of safe git flags that are allowed."""
    return [
        '--name-only',
        '--oneline',
        '--format',
        '--pretty',
        '--abbrev-commit',
        '--graph',
        '--decorate',
        '--all',
        '--branches',
        '--tags',
        '--remotes',
        '-n', '--max-count',
        '--since',
        '--after',
        '--until',
        '--before',
        '--author',
        '--committer',
        '--grep',
        '--no-merges',
        '--merges',
        '--first-parent'
    ]


def validate_git_command(command_args: List[str]) -> tuple[bool, str]:
    """
    Validate git command arguments to block dangerous operations.
    
    Args:
        command_args: List of command arguments including 'git'
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not command_args or command_args[0] != 'git':
        return False, "Invalid git command format"
    
    if len(command_args) < 2:
        return False, "Git command requires subcommand"
    
    subcommand = command_args[1]
    remaining_args = command_args[2:] if len(command_args) > 2 else []
    
    # Only allow specific git subcommands
    allowed_subcommands = ['log', 'ls-tree', 'show', 'diff', 'status']
    if subcommand not in allowed_subcommands:
        return False, f"Git subcommand '{subcommand}' is not allowed"
    
    # Check for dangerous flags
    dangerous_flags = get_dangerous_git_flags()
    for arg in remaining_args:
        # Skip non-flag arguments (files, refs, etc.)
        if not arg.startswith('-'):
            continue
            
        # Check if this flag or any part of it is dangerous
        for dangerous_flag in dangerous_flags:
            if arg == dangerous_flag or arg.startswith(f"{dangerous_flag}="):
                return False, f"Dangerous git flag '{dangerous_flag}' is not allowed"
    
    # Additional validation for specific subcommands
    if subcommand in ['log', 'show', 'diff']:
        # These commands can potentially expose sensitive information
        # so we're extra careful about flags
        safe_flags = get_safe_git_flags()
        for arg in remaining_args:
            if not arg.startswith('-'):
                continue
            # Extract flag name (remove value part if present)
            flag_name = arg.split('=')[0]
            if flag_name not in safe_flags:
                # Check if it's a short flag combination like -n10
                if re.match(r'^-[a-zA-Z]\d+$', arg):
                    base_flag = arg[:2]  # Extract -n from -n10
                    if base_flag not in safe_flags:
                        return False, f"Git flag '{flag_name}' is not in the safe list for {subcommand}"
                else:
                    return False, f"Git flag '{flag_name}' is not in the safe list for {subcommand}"
    
    return True, ""


def main() -> int:
    """Main guard script logic."""
    # Check if we're in production
    if is_production_environment():
        print("ERROR: This operation is not allowed in production environment", file=sys.stderr)
        print(f"CLAUDE_ENV={os.environ.get('CLAUDE_ENV', 'unset')}", file=sys.stderr)
        return 1
    
    # If no arguments provided, just check environment (success)
    if len(sys.argv) < 2:
        print("Environment check passed (non-production)", file=sys.stderr)
        return 0
    
    # Parse the command being guarded
    command_args = sys.argv[1:]
    
    # Special handling for git commands
    if command_args and command_args[0] == 'git':
        is_valid, error_msg = validate_git_command(command_args)
        if not is_valid:
            print(f"ERROR: Git command blocked: {error_msg}", file=sys.stderr)
            print(f"Command: {' '.join(command_args)}", file=sys.stderr)
            return 1
        else:
            print(f"Git command validated and allowed: {' '.join(command_args)}", file=sys.stderr)
            return 0
    
    # For non-git commands, just check environment (already passed above)
    print(f"Command allowed in non-production environment: {' '.join(command_args)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())