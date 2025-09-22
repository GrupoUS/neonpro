#!/bin/bash

# Script to fix workspace dependencies for cross-package manager compatibility
# Only processes actual project package.json files, not node_modules

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Fixing workspace dependencies for cross-package manager compatibility...${NC}"

# Function to fix workspace dependencies in a package.json
fix_package_json() {
    local file=$1
    if [ ! -f "$file" ]; then
        echo -e "${RED}File not found: $file${NC}"
        return 1
    fi
    
    # Skip node_modules directories
    if [[ "$file" == *"/node_modules/"* ]]; then
        return 0
    fi
    
    echo -e "${YELLOW}Processing: $file${NC}"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix workspace:1.0.0 format - map to relative paths
    sed -i 's|"@neonpro/domain": "workspace:1.0.0"|"@neonpro/domain": "file:../domain"|g' "$file"
    sed -i 's|"@neonpro/validators": "workspace:1.0.0"|"@neonpro/validators": "file:../validators"|g' "$file" 
    
    # Fix workspace:* format for all internal packages in packages directory
    sed -i 's|"@neonpro/\([^"]*\)": "workspace:\*"|"@neonpro/\1": "file:../\1"|g' "$file"
    
    # Fix packages in tools directory (different relative path)
    sed -i 's|"@neonpro/tools-shared": "workspace:\*"|"@neonpro/tools-shared": "file:../shared"|g' "$file"
    
    echo -e "${GREEN}Fixed: $file${NC}"
}

# Process only the main package.json files
if [ -f "package.json" ]; then
    fix_package_json "package.json"
fi

# Process packages directory (excluding node_modules)
find packages -maxdepth 2 -name "package.json" -type f ! -path "*/node_modules/*" | while read -r file; do
    fix_package_json "$file"
done

# Process tools directory (excluding node_modules)
find tools -maxdepth 2 -name "package.json" -type f ! -path "*/node_modules/*" | while read -r file; do
    fix_package_json "$file"
done

# Process apps directory (excluding node_modules)
find apps -maxdepth 2 -name "package.json" -type f ! -path "*/node_modules/*" | while read -r file; do
    fix_package_json "$file"
done

echo -e "${YELLOW}Workspace dependencies have been converted to use file: paths for NPM compatibility${NC}"
echo -e "${YELLOW}This allows all three package managers (Bun, PNPM, NPM) to work together${NC}"
echo -e "${GREEN}Done!${NC}"