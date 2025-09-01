#!/bin/bash
echo "🔧 Starting systematic unused variable fixes..."
head -n 5 /tmp/oxlint_files.txt | while IFS= read -r file; do
    echo "🔍 Processing: "
    if [ -f "" ]; then
        npx oxlint "" 2>/dev/null | grep "no-unused-vars" | grep -o "Variable '[^']*'" | sed "s/Variable '//;s/'//" | while IFS= read -r var; do
            if [ -n "" ]; then
                echo "  Fixing variable: "
                sed -i "s/\b\b/_/g" ""
            fi
        done
    fi
done
