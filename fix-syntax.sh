#!/bin/bash

# Fix all the malformed syntax patterns in the UI package
find src/ -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix function parameter patterns
  sed -i 's/className,_/className, /g' "$file"
  sed -i 's/children,_/children, /g' "$file"
  sed -i 's/props,_/props, /g' "$file"
  sed -i 's/_key,/key,/g' "$file"
  sed -i 's/_ref,/ref,/g' "$file"
  sed -i 's/_\.\.\./.../g' "$file"
  sed -i 's/},_ref/}, ref/g' "$file"
  sed -i 's/_(/(/g' "$file"
  sed -i 's/_</</g' "$file"
  sed -i 's/_value,/value,/g' "$file"
  sed -i 's/_index,/index,/g' "$file"
  sed -i 's/_item,/item,/g' "$file"
  sed -i 's/_acc,/acc,/g' "$file"
  sed -i 's/_id,/id,/g' "$file"
  sed -i 's/_prev,/prev,/g' "$file"
  sed -i 's/_next,/next,/g' "$file"
  sed -i 's/_resolve,/resolve,/g' "$file"
  sed -i 's/_reject,/reject,/g' "$file"
  sed -i 's/_error,/error,/g' "$file"
  sed -i 's/_data,/data,/g' "$file"
  sed -i 's/_result,/result,/g' "$file"
  sed -i 's/_state,/state,/g' "$file"
  sed -i 's/_setState,/setState,/g' "$file"
  sed -i 's/_setTheme,/setTheme,/g' "$file"
  sed -i 's/_setPositions,/setPositions,/g' "$file"
  sed -i 's/_setErrors,/setErrors,/g' "$file"
  sed -i 's/_setHoverDirection,/setHoverDirection,/g' "$file"
  sed -i 's/_setConsentStatus,/setConsentStatus,/g' "$file"
  sed -i 's/_setFocusedIndex,/setFocusedIndex,/g' "$file"
  sed -i 's/_setCurrentFPS,/setCurrentFPS,/g' "$file"
done

echo "Syntax fixes completed"
