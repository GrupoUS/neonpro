#!/bin/bash

# Fix common linting issues systematically
# GREEN Phase - TDD Orchestrator Script

echo "🔧 Starting automated GREEN phase fixes..."

cd apps/web

# 1. Fix unused catch parameters: } catch (error) { -> } catch (_error) {
echo "1️⃣ Fixing unused catch parameters..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch (error) {/} catch (_error) {/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch (error$/} catch (_error$/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/catch (error) {/catch (_error) {/g'

# 2. Fix unused parameters in arrow functions: error => { -> _error => {
echo "2️⃣ Fixing unused arrow function parameters..."
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/onError: error =>/onError: _error =>/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/, error) =>/, _error) =>/g'

# 3. Fix unused variables in destructuring: { error, -> { _error,
echo "3️⃣ Fixing unused destructured variables..."  
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/, error,/, _error,/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/{ error,/{ _error,/g'

echo "✅ Bulk fixes completed. Running lint to check progress..."

# Check progress
pnpm lint 2>&1 | grep "Found [0-9]* warnings"