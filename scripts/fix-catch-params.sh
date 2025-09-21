#!/bin/bash
# Fix catch parameter issues - either remove unused catch params or fix references

echo "🔧 Fixing catch parameter lint warnings..."

cd apps/web

# Pattern 1: catch (_error) with console.error('...', error) - fix the reference
echo "Fixing catch parameters with incorrect error references..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/} catch (_error) {/} catch (error) {/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/} catch (_err) {/} catch (error) {/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/} catch (_e) {/} catch (error) {/g'

echo "Fixed catch parameter names to 'error' for consistency."

# Alternative approach: For truly unused catch parameters, we can omit the parameter name
echo "Looking for catch blocks with no error usage..."