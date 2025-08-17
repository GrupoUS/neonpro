#!/usr/bin/env python3
"""
Final fix script for remaining lint errors
"""
import os
import re

def fix_final_lint_errors():
    """Fix the final 4 any types and callback issues"""
    
    # Files with remaining any types
    files_to_fix = [
        "E:/neonpro/apps/web/lib/analytics/dashboard-builder.ts",
        "E:/neonpro/apps/web/lib/auth/middleware.ts",
        "E:/neonpro/apps/web/lib/auth/rbac/middleware.ts",
        "E:/neonpro/apps/web/lib/supabase/middleware.ts"
    ]
    
    for file_path in files_to_fix:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace any with unknown
                new_content = content.replace('data?: any', 'data?: unknown')
                
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed {file_path}")
            except Exception as e:
                print(f"Error fixing {file_path}: {e}")
    
    # Fix callback issues in JS files
    js_files = [
        "E:/neonpro/apps/web/examine_current_setup.js",
        "E:/neonpro/apps/web/public/portal/sw.js",
        "E:/neonpro/apps/web/public/sw.js"
    ]
    
    for file_path in js_files:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Fix forEach callback issues
                content = re.sub(
                    r'\.forEach\(\(dep\) => console\.log\(`  \${dep}: \${pkg\.dependencies\[dep\]}\`\)\)',
                    r'.forEach((dep) => { console.log(`  ${dep}: ${pkg.dependencies[dep]}`); })',
                    content
                )
                
                # Fix map callback return issues (add explicit return)
                content = re.sub(
                    r'cacheNames\.map\(\(cacheName\) => \{\s*if \(cacheName !== CACHE_NAME\) \{\s*return caches\.delete\(cacheName\);\s*\}\s*\}\)',
                    r'cacheNames.map((cacheName) => { if (cacheName !== CACHE_NAME) { return caches.delete(cacheName); } return Promise.resolve(); })',
                    content,
                    flags=re.DOTALL
                )
                
                content = re.sub(
                    r'cacheNames\.map\(\(cacheName\) => \{\s*if \(!cacheName\.includes\(CACHE_VERSION\)\) \{\s*return caches\.delete\(cacheName\);\s*\}\s*\}\)',
                    r'cacheNames.map((cacheName) => { if (!cacheName.includes(CACHE_VERSION)) { return caches.delete(cacheName); } return Promise.resolve(); })',
                    content,
                    flags=re.DOTALL
                )
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed callback issues in {file_path}")
                    
            except Exception as e:
                print(f"Error fixing {file_path}: {e}")

if __name__ == "__main__":
    fix_final_lint_errors()