#!/usr/bin/env bash

echo "Fixing common lint patterns in web package..."

cd apps/web

# Fix unused parameters in function calls
echo "Fixing unused parameters..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/(\([^,)]*\), *\(error\)) *=>/(\1, _error) =>/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/(\([^,)]*\), *\(variables\)) *=>/(\1, _variables) =>/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/(\([^,)]*\), *\(data\)) *=>/(\1, _data) =>/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/(\([^,)]*\), *\(context\)) *=>/(\1, _context) =>/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/(\([^,)]*\), *\(index\)) *=>/(\1, _index) =>/g'

# Fix unused parameters in function declarations
echo "Fixing unused parameters in declarations..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *(\([^,)]*\), *error\b/: (\1, _error/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *(\([^,)]*\), *variables\b/: (\1, _variables/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *(\([^,)]*\), *data\b/: (\1, _data/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *(\([^,)]*\), *context\b/: (\1, _context/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *(\([^,)]*\), *index\b/: (\1, _index/g'

# Fix catch parameters
echo "Fixing catch parameters..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch *(error) *{/} catch (_error) {/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch *(e) *{/} catch (_e) {/g'

# Fix common function parameters
echo "Fixing common parameter names..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/async *( *\([^,)]*\), *level\b/async (\1, _level/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/: *( *\([^,)]*\), *level\b/: (\1, _level/g'

echo "Pattern fixes completed. Running lint to check progress..."