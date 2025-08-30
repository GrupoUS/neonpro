#!/usr/bin/env python3
"""
File Validator Hook for Claude Code
Protects sensitive files from being modified by Desktop Commander operations
Runs before write_file and edit_block operations
"""

import json
import sys
import os
from pathlib import Path

def log_message(message, level="INFO"):
    """Log messages with consistent formatting"""
    print(f"🛡️ [{level}] {message}", file=sys.stderr)

def is_sensitive_file(file_path):
    """Check if file should be protected from modification"""
    file_path = Path(file_path).as_posix()
    
    # Sensitive file patterns (based on project structure and security best practices)
    sensitive_patterns = [
        # Environment and secrets
        '.env',
        '.env.',
        '/secrets/',
        '/credentials.json',
        'config/credentials',
        'auth.json',
        'private-key',
        'service-account',
        
        # Package management (critical dependencies)
        'package-lock.json',
        'pnpm-lock.yaml', 
        'yarn.lock',
        'bun.lock',
        
        # Git and version control
        '.git/',
        '.gitignore',
        '.gitattributes',
        
        # Build and deployment configuration (critical)
        'vercel.json',
        'next.config',
        'turbo.json',
        'tsconfig.json',
        'tailwind.config',
        'vite.config',
        'webpack.config',
        'rollup.config',
        'babel.config',
        
        # Infrastructure and deployment
        'infrastructure/',
        'deployment/',
        'docker-compose',
        'Dockerfile.prod',
        'k8s/',
        'kubernetes/',
        
        # Database migrations (critical healthcare data)
        'supabase/migrations/',
        'prisma/migrations/',
        'database/migrations/',
        
        # Healthcare/medical compliance files
        'compliance/',
        'hipaa/',
        'lgpd/',
        'gdpr/',
        'phi/',
        'pii/',
        
        # Generated files (should not be manually edited)
        '.generated.',
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        '.turbo/',
        'coverage/',
        
        # System and cache files
        '.DS_Store',
        'Thumbs.db',
        '.tmp/',
        '.cache/',
        'logs/',
        
        # Security and monitoring
        'sentry.',
        'instrumentation.',
        '.tsbuildinfo',
        
        # Critical project files
        'README.md',  # Prevent accidental modification of main README
        'CLAUDE.md',  # Prevent modification of Claude instructions
        'LICENSE',
        'CHANGELOG',
        
        # Tool configurations
        '.prettierrc',
        '.eslintrc',
        '.oxlintrc.json',
        'dprint.json',
        '.editorconfig',
        
        # CI/CD (critical for deployment pipeline)
        '.github/',
        'workflows/',
        '.travis.yml',
        '.circleci/',
        'jenkins',
        'buildspec',
        
        # Database and backup files
        '*.sql',
        '*.db',
        '*.sqlite',
        'backup/',
        'archives/',
        
        # Certificates and keys
        '*.pem',
        '*.key',
        '*.crt',
        '*.cert',
        '*.p12',
        '*.jks'
    ]
    
    # Check if file matches any sensitive pattern
    for pattern in sensitive_patterns:
        if pattern in file_path.lower():
            return True, pattern
            
    return False, None

def is_allowed_exception(file_path, tool_name):
    """Check if file modification should be allowed despite being sensitive"""
    file_path = Path(file_path).as_posix()
    
    # Allow certain operations on specific files
    exceptions = {
        # Allow reading sensitive files for analysis (not modification)
        'read': ['.env.example', 'package.json', 'tsconfig.json'],
        
        # Allow modification of development configs in specific contexts
        'write': [],
        
        # Allow specific development files
        'development': ['.env.local', '.env.development']
    }
    
    # Check if it's a development environment file
    if any(dev_pattern in file_path for dev_pattern in exceptions['development']):
        return True
        
    return False

def main():
    """Main validation logic"""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        # Extract file path and tool information
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        
        # Handle different Desktop Commander tools
        file_path = None
        if 'file_path' in tool_input:
            file_path = tool_input['file_path']
        elif 'path' in tool_input:
            file_path = tool_input['path']
        
        if not file_path:
            log_message("No file path found in tool input - allowing operation")
            sys.exit(0)
        
        # Normalize file path
        file_path = os.path.normpath(file_path)
        
        log_message(f"Validating file access: {file_path}")
        log_message(f"Tool: {tool_name}")
        
        # Check if file is sensitive
        is_sensitive, matched_pattern = is_sensitive_file(file_path)
        
        if is_sensitive:
            # Check for allowed exceptions
            if is_allowed_exception(file_path, tool_name):
                log_message(f"File {file_path} is sensitive but allowed as exception")
                sys.exit(0)
            
            # Block the operation
            error_message = f"""
🚨 BLOCKED: Attempted to modify sensitive file
File: {file_path}
Pattern: {matched_pattern}
Reason: This file is protected to maintain system security and compliance.

If you need to modify this file, please:
1. Review the security implications
2. Use appropriate tools outside Claude Code
3. Ensure compliance with healthcare regulations
4. Consider if this change requires review/approval
"""
            
            print(error_message, file=sys.stderr)
            log_message(f"Blocked access to sensitive file: {file_path} (pattern: {matched_pattern})", "BLOCKED")
            
            # Exit with code 2 to block the tool call and show stderr to Claude
            sys.exit(2)
        
        # Allow the operation
        log_message(f"File validation passed for: {file_path}")
        sys.exit(0)
        
    except json.JSONDecodeError as e:
        log_message(f"Invalid JSON input: {e}", "ERROR")
        sys.exit(1)
    except Exception as e:
        log_message(f"Validation error: {e}", "ERROR")
        # In case of errors, allow the operation to proceed (fail-open)
        sys.exit(0)

if __name__ == "__main__":
    main()