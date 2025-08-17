import os
import re
import glob

def fix_file_syntax(file_path):
    """Fix common syntax errors in a TypeScript file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix metadata object syntax - remove trailing semicolon after opening brace
        content = re.sub(r'export const metadata: Metadata = \{;', 'export const metadata: Metadata = {', content)
        
        # Fix incomplete metadata objects
        content = re.sub(r'export const metadata: Metadata = \{\s*title:\s*description:\s*\};', 
                        'export const metadata: Metadata = {\n  title: "Page Title",\n  description: "Page description"\n};', content)
        
        # Fix incomplete descriptions
        content = re.sub(r'title:\s*"[^"]*",\s*description:\s*\};', 
                        'title: "Title",\n  description: "Description"\n};', content)
        
        # Fix property signatures with double semicolons
        content = re.sub(r'(\w+:\s*[^;]+);;', r'\1;', content)
        
        # Fix interface properties with missing types
        content = re.sub(r'(\w+):\s*;', r'\1: any;', content)
        
        # Fix JSX unclosed tags - convert self-closing tags
        jsx_tags = ['h2', 'h3', 'h4', 'p', 'span', 'div', 'button', 'TabsTrigger', 'TabsContent', 
                   'AlertDescription', 'Suspense', 'CosmicGlowButton', 'Badge', 'Card', 'Button']
        
        for tag in jsx_tags:
            # Fix unclosed tags by making them self-closing or adding closing tags
            pattern = f'<{tag}([^>]*)>([^<]*)</'
            if re.search(pattern, content):
                # If there's a closing tag but it's wrong, fix it
                content = re.sub(f'<{tag}([^>]*)>([^<]*)</div>', f'<{tag}\\1>\\2</{tag}>', content)
                content = re.sub(f'<{tag}([^>]*)>([^<]*)</button>', f'<{tag}\\1>\\2</{tag}>', content)
            else:
                # Convert to self-closing if no content
                content = re.sub(f'<{tag}([^>]*)>\s*', f'<{tag}\\1 />', content)
        
        # Fix function parameter syntax issues
        content = re.sub(r'\}\):\s*any\)\s*=>\s*\{', '}: any) => {', content)
        content = re.sub(r'onClick:\s*=>\s*void;', 'onClick?: () => void;', content)
        
        # Fix export/import issues
        content = re.sub(r'export default function (\w+)\{', r'export default function \1() {', content)
        
        # Fix array/object literal issues
        content = re.sub(r'(\w+):\s*\'([^\']*)\',\s*(\w+):\s*\'([^\']*)\',', r'\1: "\2",\n    \3: "\4",', content)
        
        # Fix enum-like objects
        content = re.sub(r'(\w+):\s*\'([^\']*)\',\s*\}\s*as\s*const;', r'\1: "\2"\n} as const;', content)
        
        # Fix type union syntax
        content = re.sub(r'\|\s*\'([^\']*)\'\s*\|\s*\'([^\']*)\'\s*\|\s*\'([^\']*)\'\s*;', r'| "\1" | "\2" | "\3";', content)
        
        # Fix incomplete function signatures
        content = re.sub(r'function\s+(\w+)\s*\{\s*$', r'function \1() {\n  return null;\n}', content, flags=re.MULTILINE)
        
        # Fix trailing commas and syntax
        content = re.sub(r',\s*\}\s*as\s*const;', '\n} as const;', content)
        
        # Fix incomplete JSX elements
        content = re.sub(r'>\s*$', ' />', content, flags=re.MULTILINE)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    # Get all TypeScript and TSX files
    patterns = [
        'app/**/*.tsx',
        'app/**/*.ts', 
        'types/**/*.ts',
        'utils/**/*.ts',
        'lib/**/*.ts',
        'components/**/*.tsx',
        'components/**/*.ts'
    ]
    
    files_to_fix = []
    for pattern in patterns:
        files_to_fix.extend(glob.glob(pattern, recursive=True))
    
    print(f"Found {len(files_to_fix)} files to process")
    
    modified_files = 0
    for i, file_path in enumerate(files_to_fix):
        if i % 50 == 0:
            print(f"Processing file {i+1}/{len(files_to_fix)}: {file_path}")
        
        if fix_file_syntax(file_path):
            modified_files += 1
    
    print(f"Completed: Processed {len(files_to_fix)} files, modified {modified_files}")
    print("Run type-check again to verify fixes")

if __name__ == "__main__":
    main()