#!/usr/bin/env python3
"""
Quick fix script to replace 'any' types in placeholder files with proper types
"""
import os
import re
import glob

def fix_placeholder_any():
    """Fix any types in placeholder service files"""
    
    # Find all placeholder service files
    pattern = "E:/neonpro/apps/web/**/PlaceholderService*"
    files = glob.glob(pattern, recursive=True)
    
    # Also check API route files with any types
    api_pattern = "E:/neonpro/apps/web/app/api/**/*.ts"
    api_files = glob.glob(api_pattern, recursive=True)
    
    all_files = files + api_files
    
    replacements = [
        # Fix any types in service methods
        (r'static async saveData\(data: any\)', 'static async saveData(data: unknown)'),
        (r'data\?: any', 'data?: unknown'),
        # Fix explicit any in interfaces
        (r': any(?=[;\}])', ': unknown'),
        (r'Record<string, any>', 'Record<string, unknown>'),
    ]
    
    fixed_count = 0
    
    for file_path in all_files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Apply replacements
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
            
            # Write back if changed
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"Fixed {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nFixed {fixed_count} files with any type issues")

if __name__ == "__main__":
    fix_placeholder_any()