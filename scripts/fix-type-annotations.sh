#!/bin/bash

# Fix incorrect type annotations that were changed to regex patterns
cd apps/web

echo "Fixing type annotations in web package..."

# Find files with the regex pattern and fix them
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: \[a-zA-Z\]\[a-zA-Z\]\*/: any/g'

# Fix specific patterns
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/'mock-button'/ \"mock-button\"/g"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/'event-calendar'/\"event-calendar\"/g"

echo "Type annotation fixes complete!"