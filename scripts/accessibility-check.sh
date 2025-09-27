#!/usr/bin/env bash
# NeonPro Accessibility Compliance Check Script
# WCAG 2.1 AA+ compliance validation for healthcare UI components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}♿ Running NeonPro Accessibility Compliance Check...${NC}"

ERRORS=0
WARNINGS=0

# Find React component files
UI_DIRS=("packages/ui/src" "apps/web/src" "apps/admin/src")
UI_FILES=()

for dir in "${UI_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        while IFS= read -r file; do
            if [ ! -z "$file" ]; then
                UI_FILES+=("$file")
            fi
        done < <(find "$dir" -name "*.tsx" -o -name "*.jsx" 2>/dev/null)
    fi
done

if [ ${#UI_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠️ No UI files found to check${NC}"
    exit 0
fi

echo -e "${BLUE}📋 Found ${#UI_FILES[@]} UI files to check${NC}"

for file in "${UI_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        continue
    fi
    
    echo -e "${BLUE}🔍 Checking: $file${NC}"
    
    # 1. Check for missing alt text on images
    if grep -q "<img" "$file"; then
        if ! grep -q "alt=" "$file"; then
            echo -e "${RED}❌ WCAG 1.1.1 Error: Missing alt text in $file${NC}"
            echo -e "${BLUE}   Fix: Add alt=\"description\" to all <img> tags${NC}"
            ((ERRORS++))
        fi
    fi
    
    # 2. Check for unlabeled form inputs
    if grep -q "<input" "$file"; then
        if ! grep -q -E "(aria-label|aria-labelledby|<label)" "$file"; then
            echo -e "${YELLOW}⚠️ WCAG 3.3.2 Warning: Consider adding labels to inputs in $file${NC}"
            echo -e "${BLUE}   Suggestion: Add aria-label, aria-labelledby, or <label> elements${NC}"
            ((WARNINGS++))
        fi
    fi
    
    # 3. Check for non-semantic role usage
    if grep -q 'role="banner"' "$file"; then
        echo -e "${RED}❌ WCAG 1.3.1 Error: Use semantic <header> instead of role='banner' in $file${NC}"
        echo -e "${BLUE}   Fix: Replace <div role=\"banner\"> with <header>${NC}"
        ((ERRORS++))
    fi
    
    if grep -q 'role="main"' "$file"; then
        echo -e "${RED}❌ WCAG 1.3.1 Error: Use semantic <main> instead of role='main' in $file${NC}"
        echo -e "${BLUE}   Fix: Replace <div role=\"main\"> with <main>${NC}"
        ((ERRORS++))
    fi
    
    if grep -q 'role="navigation"' "$file"; then
        echo -e "${YELLOW}⚠️ WCAG 1.3.1 Warning: Consider using semantic <nav> instead of role='navigation' in $file${NC}"
        echo -e "${BLUE}   Suggestion: Replace <div role=\"navigation\"> with <nav>${NC}"
        ((WARNINGS++))
    fi
    
    # 4. Check for missing button text or aria-label
    if grep -q "<button" "$file"; then
        # Simple check for buttons that might be icon-only
        if grep -q -E "<button[^>]*>\\s*<.*icon|<svg" "$file"; then
            if ! grep -q -E "aria-label|title=" "$file"; then
                echo -e "${YELLOW}⚠️ WCAG 4.1.2 Warning: Icon buttons should have aria-label in $file${NC}"
                echo -e "${BLUE}   Suggestion: Add aria-label to buttons containing only icons${NC}"
                ((WARNINGS++))
            fi
        fi
    fi
    
    # 5. Check for hardcoded focus styles (should use CSS)
    if grep -q "tabindex=" "$file"; then
        tabindex_values=$(grep -o 'tabindex="[^"]*"' "$file" | sed 's/tabindex="\([^"]*\)"/\1/' | sort -u)
        for value in $tabindex_values; do
            if [[ "$value" =~ ^[0-9]+$ ]] && [ "$value" -gt 0 ]; then
                echo -e "${YELLOW}⚠️ WCAG 2.4.3 Warning: Positive tabindex found in $file (tabindex=\"$value\")${NC}"
                echo -e "${BLUE}   Suggestion: Use tabindex=\"0\" or \"-1\", avoid positive values${NC}"
                ((WARNINGS++))
            fi
        done
    fi
    
    # 6. Check for missing heading hierarchy
    if grep -q "<h[1-6]" "$file"; then
        headings=$(grep -o "<h[1-6]" "$file" | sed 's/<h//' | sort -n)
        first_heading=$(echo "$headings" | head -n1)
        if [ "$first_heading" -gt 1 ]; then
            echo -e "${YELLOW}⚠️ WCAG 1.3.1 Warning: Heading hierarchy starts with h$first_heading instead of h1 in $file${NC}"
            echo -e "${BLUE}   Suggestion: Start heading hierarchy with <h1>${NC}"
            ((WARNINGS++))
        fi
    fi
    
    # 7. Healthcare-specific checks
    if grep -q -E "(patient|medical|health)" "$file"; then
        # Check for plain text display of sensitive data
        if grep -q -E "\\b(cpf|rg|phone)\\b.*{.*}" "$file"; then
            echo -e "${YELLOW}⚠️ Healthcare Privacy Warning: Sensitive data display detected in $file${NC}"
            echo -e "${BLUE}   Suggestion: Ensure sensitive data is properly masked or secured${NC}"
            ((WARNINGS++))
        fi
    fi
done

echo -e "\n${BLUE}📊 Accessibility Check Summary:${NC}"
echo -e "${GREEN}✅ Files checked: ${#UI_FILES[@]}${NC}"
echo -e "${RED}❌ Errors found: $ERRORS${NC}"
echo -e "${YELLOW}⚠️ Warnings found: $WARNINGS${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "\n${RED}🚫 Accessibility check failed with $ERRORS error(s)${NC}"
    echo -e "${BLUE}💡 Please fix the WCAG compliance errors above before proceeding${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "\n${GREEN}✅ Accessibility check passed with $WARNINGS warning(s)${NC}"
    echo -e "${BLUE}💡 Consider addressing the warnings to improve accessibility${NC}"
    exit 0
else
    echo -e "\n${GREEN}🎉 All accessibility checks passed! WCAG 2.1 AA+ compliant${NC}"
    exit 0
fi