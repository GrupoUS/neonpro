#!/usr/bin/env python3
"""
Guard script to prevent dangerous operations in production environments.
Exits with non-zero status if CLAUDE_ENV=production, preventing migration execution.

Usage:
    python scripts/guard-nonprod-only.py

Environment Variables:
    CLAUDE_ENV: Environment identifier (development, staging, production)
    NODE_ENV: Node.js environment (fallback if CLAUDE_ENV not set)

Exit Codes:
    0: Safe to proceed (non-production environment)
    1: Production environment detected - operation blocked
    2: Invalid or missing environment configuration
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_environment():
    """Get the current environment identifier."""
    # Primary check: CLAUDE_ENV
    claude_env = os.environ.get('CLAUDE_ENV', '').lower().strip()
    if claude_env:
        return claude_env
    
    # Fallback: NODE_ENV
    node_env = os.environ.get('NODE_ENV', '').lower().strip()
    if node_env:
        return node_env
    
    return None

def is_production_environment(env):
    """Check if the environment is considered production."""
    production_indicators = [
        'production',
        'prod', 
        'live',
        'master',
        'main'
    ]
    return env in production_indicators

def main():
    """Main guard logic."""
    try:
        env = get_environment()
        
        if not env:
            logger.error("No environment identifier found. Set CLAUDE_ENV or NODE_ENV.")
            logger.error("Blocking operation for safety.")
            return 2
        
        logger.info(f"Environment detected: {env}")
        
        if is_production_environment(env):
            logger.error("🚨 PRODUCTION ENVIRONMENT DETECTED 🚨")
            logger.error("Database migrations and dangerous operations are blocked in production.")
            logger.error("Use staging environment for testing or manual production deployment process.")
            return 1
        
        logger.info(f"✅ Safe environment ({env}) - operation allowed.")
        return 0
        
    except Exception as e:
        logger.error(f"Guard script error: {e}")
        logger.error("Blocking operation for safety.")
        return 2

if __name__ == '__main__':
    sys.exit(main())