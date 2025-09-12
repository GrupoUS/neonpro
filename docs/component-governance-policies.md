# 🏛️ NeonPro Component Governance Policies

**Version:** 1.0  
**Effective Date:** 2025-01-12  
**Status:** ✅ **ACTIVE**

---

## 📋 **Overview**

This document establishes governance policies for component development, maintenance, and architecture decisions within the NeonPro monorepo to prevent conflicts and ensure consistent, maintainable code.

---

## 🎯 **Core Principles**

### **1. Single Source of Truth**
- Each component should have **one primary implementation**
- Avoid duplicate components with identical functionality
- Prioritize shared components over local implementations

### **2. Clear Ownership Hierarchy**
```
@neonpro/ui (Highest Priority)
    ↓
@/components/molecules (Enhanced composed components)
    ↓
@/components/atoms (Basic building blocks)
    ↓
@/components/ui (Specialized/utility components)
    ↓
@/components/organisms (Complex features)
```

### **3. Atomic Design Compliance**
- **Atoms**: Basic UI elements (buttons, inputs, labels)
- **Molecules**: Simple combinations of atoms (cards, alerts, tables)
- **Organisms**: Complex UI sections (dashboards, forms, navigation)
- **Templates**: Page-level layouts
- **Pages**: Specific instances of templates

---

## 📏 **Component Standards**

### **Naming Conventions**
- **PascalCase** for component names: `Button`, `MagicCard`, `UniversalButton`
- **kebab-case** for file names: `button.tsx`, `magic-card.tsx`, `universal-button.tsx`
- **Descriptive names** that indicate purpose: `PatientForm`, `AppointmentTable`

### **File Structure**
```
components/
├── atoms/
│   ├── button.tsx
│   ├── badge.tsx
│   └── index.ts
├── molecules/
│   ├── alert.tsx
│   ├── card.tsx
│   └── index.ts
├── organisms/
│   ├── dashboard.tsx
│   └── index.ts
└── ui/
    ├── magic-card.tsx
    ├── universal-button.tsx
    └── index.ts
```

### **Export Standards**
- **Named exports** preferred: `export { Button }`
- **Barrel exports** in index.ts files
- **Type exports** alongside component exports
- **Consistent export patterns** across similar components

---

## 🚫 **Prohibited Practices**

### **Component Conflicts**
- ❌ **No duplicate components** with same functionality
- ❌ **No conflicting import paths** for same component
- ❌ **No circular dependencies** between components
- ❌ **No direct file imports** when barrel exports exist

### **Architecture Violations**
- ❌ **Atoms cannot import molecules/organisms**
- ❌ **Molecules cannot import organisms**
- ❌ **No business logic in atoms/molecules**
- ❌ **No direct DOM manipulation** (use refs appropriately)

### **Import Anti-Patterns**
```typescript
// ❌ DON'T - Mixing sources
import { Button } from '@/components/ui/button';
import { ButtonProps } from '@neonpro/ui';

// ❌ DON'T - Direct file imports when barrel exists
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';

// ✅ DO - Consistent sources
import { Button } from '@neonpro/ui';
import { Badge } from '@/components/atoms/badge';

// ✅ DO - Use barrel exports
import { Button, Badge } from '@/components/atoms';
```

---

## ✅ **Required Practices**

### **Component Development**
1. **Research existing components** before creating new ones
2. **Follow atomic design principles** for component placement
3. **Use TypeScript interfaces** for all props
4. **Include JSDoc comments** for complex components
5. **Implement proper error boundaries** for organisms

### **Testing Requirements**
- **Unit tests** for all atoms and molecules
- **Integration tests** for organisms
- **Visual regression tests** for UI components
- **Accessibility tests** for all interactive components

### **Documentation Requirements**
- **Component props documentation** in TypeScript interfaces
- **Usage examples** in component files or Storybook
- **Migration guides** for breaking changes
- **Architecture decision records** for major changes

---

## 🔄 **Change Management Process**

### **Adding New Components**
1. **Check for existing alternatives** in all component directories
2. **Propose component location** following atomic design
3. **Create RFC** for complex components or new patterns
4. **Implement with tests** and documentation
5. **Update component usage guide**

### **Modifying Existing Components**
1. **Assess breaking change impact** on existing usage
2. **Create deprecation plan** for removed features
3. **Implement backward compatibility** when possible
4. **Update all affected imports** and usage
5. **Document migration path** for breaking changes

### **Removing Components**
1. **Add deprecation warnings** (TypeScript + runtime)
2. **Update documentation** with migration instructions
3. **Provide migration period** (minimum 2 releases)
4. **Remove component** and update imports
5. **Clean up related files** and exports

---

## 🛡️ **Quality Gates**

### **Pre-commit Checks**
- ✅ **TypeScript compilation** passes
- ✅ **ESLint rules** pass with no errors
- ✅ **Unit tests** pass
- ✅ **No duplicate component names** detected

### **Pre-merge Checks**
- ✅ **Build process** completes successfully
- ✅ **Integration tests** pass
- ✅ **Visual regression tests** pass
- ✅ **Bundle size** within acceptable limits
- ✅ **Component conflicts** resolved

### **Release Checks**
- ✅ **All tests** pass in CI/CD
- ✅ **Documentation** updated
- ✅ **Migration guides** provided for breaking changes
- ✅ **Deprecation warnings** implemented where needed

---

## 🔧 **Automated Enforcement**

### **ESLint Rules**
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/components/ui/button", "@/components/ui/badge", "@/components/ui/alert"],
            "message": "These components have been removed. Use correct import paths."
          }
        ]
      }
    ]
  }
}
```

### **TypeScript Strict Mode**
- **Strict null checks** enabled
- **No implicit any** enforced
- **Unused locals** detection enabled
- **Consistent type imports** enforced

### **Build-time Validation**
- **Duplicate component detection** script
- **Import path validation** checks
- **Circular dependency detection**
- **Bundle size monitoring**

---

## 📊 **Monitoring & Metrics**

### **Component Health Metrics**
- **Usage frequency** across codebase
- **Import path consistency** percentage
- **Test coverage** per component
- **Bundle size impact** per component

### **Architecture Compliance**
- **Atomic design violations** count
- **Circular dependencies** detected
- **Duplicate components** identified
- **Deprecated component usage** tracking

---

## 🚨 **Violation Response**

### **Severity Levels**
- **🔴 Critical**: Duplicate components, circular dependencies
- **🟡 Warning**: Deprecated usage, missing tests
- **🔵 Info**: Style guide violations, documentation gaps

### **Response Actions**
- **Critical**: Block merge, require immediate fix
- **Warning**: Create issue, schedule fix in next sprint
- **Info**: Add to backlog, address in maintenance cycle

---

## 📚 **Resources**

### **Documentation**
- **Component Usage Guide**: `docs/component-usage-guide.md`
- **Architecture Analysis**: `docs/neonpro-component-architecture-analysis.md`
- **Migration Guides**: `docs/migrations/`

### **Tools**
- **Component Analyzer**: `scripts/analyze-components.js`
- **Duplicate Detector**: `scripts/detect-duplicates.js`
- **Import Validator**: `scripts/validate-imports.js`

---

## 🔄 **Review Schedule**

- **Monthly**: Component usage metrics review
- **Quarterly**: Architecture compliance audit
- **Bi-annually**: Governance policy updates
- **As needed**: Emergency policy changes for critical issues

---

**Policy Owner**: Development Team  
**Next Review**: 2025-04-12  
**Version History**: v1.0 (2025-01-12) - Initial policy establishment
