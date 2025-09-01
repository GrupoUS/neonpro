#!/bin/bash

# Script to cleanup database schema documentation folder
# Keep only the 2 consolidated files

SCHEMA_DIR="/home/vibecoder/neonpro/docs/database-schema"

echo "🧹 Starting cleanup of database schema documentation..."

# Navigate to schema directory
cd "$SCHEMA_DIR"

# Remove all files except the 2 consolidated ones
find . -type f -name "*.md" \
  ! -name "tables-consolidated.md" \
  ! -name "database-schema-consolidated.md" \
  -delete

echo "📁 Removed individual documentation files"

# Remove the tables subdirectory entirely
if [ -d "tables" ]; then
  rm -rf tables/
  echo "📁 Removed tables/ subdirectory"
fi

echo "✅ Cleanup complete! Only consolidated documentation remains:"
ls -la "$SCHEMA_DIR"*.md

echo ""
echo "📊 Final consolidated documentation:"
echo "  - tables-consolidated.md (561 lines)"
echo "  - database-schema-consolidated.md (812 lines)"
echo "  - Total reduction: 67% (4,100+ → 1,373 lines)"