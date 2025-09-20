#!/usr/bin/env python3
"""
Fix syntax errors in database_service.py by replacing backticks with triple quotes.
"""

def fix_backticks():
    """Replace backticks with triple quotes in database_service.py."""
    with open('services/database_service.py', 'r') as f:
        content = f.read()
    
    # Replace all backticks with triple quotes
    fixed_content = content.replace('`', "'''")
    
    with open('services/database_service.py', 'w') as f:
        f.write(fixed_content)
    
    print("✅ Fixed backticks in database_service.py")

if __name__ == "__main__":
    fix_backticks()