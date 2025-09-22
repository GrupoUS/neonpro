#!/bin/bash

# Script to fix workspace dependencies for cross-package manager compatibility
# Changes workspace:1.0.0 and workspace:* to file:../package-name format

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Fixing workspace dependencies for cross-package manager compatibility...${NC}"

# Function to fix workspace dependencies in a package.json
fix_package_json() {
    local file=$1
    if [ ! -f "$file" ]; then
        echo "File not found: $file"
        return 1
    fi
    
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix workspace:1.0.0 format - map to relative paths
    sed -i 's|"@neonpro/domain": "workspace:1.0.0"|"@neonpro/domain": "file:../domain"|g' "$file"
    sed -i 's|"@neonpro/validators": "workspace:1.0.0"|"@neonpro/validators": "file:../validators"|g' "$file"
    sed -i 's|"@neonpro/tools-shared": "workspace:1.0.0"|"@neonpro/tools-shared": "file:../shared"|g' "$file"
    
    # Fix workspace:* format for all internal packages
    sed -i 's|"@neonpro/\([^"]*\)": "workspace:\*"|"@neonpro/\1": "file:../\1"|g' "$file"
    
    # Fix packages in tools directory
    sed -i 's|"@neonpro/\([^"]*\)": "workspace:\*"|"@neonpro/\1": "file:../../\1"|g' "$file"
    
    # Special case for tools-shared
    sed -i 's|"@neonpro/tools-shared": "workspace:\*"|"@neonpro/tools-shared": "file:../shared"|g' "$file"
    
    echo -e "${GREEN}Fixed: $file${NC}"
}

# Process all package.json files in packages and tools directories
find packages -name "package.json" -type f | while read -r file; do
    fix_package_json "$file"
done

find tools -name "package.json" -type f | while read -r file; do
    fix_package_json "$file"
done

echo -e "${YELLOW}Workspace dependencies have been converted to use file: paths for NPM compatibility${NC}"
echo -e "${YELLOW}This allows all three package managers (Bun, PNPM, NPM) to work together${NC}"
echo -e "${GREEN}Done!${NC}"