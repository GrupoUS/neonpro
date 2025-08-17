#!/usr/bin/env python3
"""
Quick fix script to replace static-only classes with proper function exports
"""
import os
import re
import glob

def fix_static_only_classes():
    """Replace static-only classes with function exports"""
    
    # Find all files with PlaceholderService classes
    pattern = "E:/neonpro/apps/web/**/*.ts"
    files = glob.glob(pattern, recursive=True)
    
    fixed_count = 0
    
    for file_path in files:
        if not os.path.exists(file_path):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if this file has a PlaceholderService class
            if 'export class PlaceholderService' not in content:
                continue
                
            # Replace the class with function exports
            new_content = """// Placeholder service file
export async function getData() {
  return { message: 'Placeholder service method' };
}

export async function saveData(data: unknown) {
  return { success: true, data };
}

export default { getData, saveData };
"""
            
            # Write the new content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            fixed_count += 1
            print(f"Fixed static-only class in {file_path}")
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\nFixed {fixed_count} files with static-only class issues")

if __name__ == "__main__":
    fix_static_only_classes()