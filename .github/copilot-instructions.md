````instructions
---
applyTo: "**/*.{ts,tsx,js,jsx,json,jsonc,css,scss,md}"
---

# NeonPro - Healthcare Management Platform

## Project Context
NeonPro is a comprehensive healthcare management platform specifically designed for Brazilian aesthetic and beauty clinics. The system enforces strict healthcare-grade quality standards, LGPD/ANVISA/CFM compliance, and maintains the highest levels of type safety and accessibility for medical applications.

## Core Technology Stack
- **Framework**: Next.js 15 with App Router (mandatory)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript (strict mode) 
- **State Management**: Zustand (client) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel with Edge Functions
- **Code Quality**: Biome formatter/linter

## Healthcare-Grade Principles
- **Quality Standard**: ≥9.8/10 for all medical data handling
- **Security First**: LGPD compliance, data encryption, audit trails
- **Type Safety**: Strict TypeScript for patient data integrity
- **Accessibility**: WCAG 2.1 AA compliance for healthcare accessibility
- **Compliance**: Brazilian healthcare regulations (LGPD, ANVISA, CFM)

## Monorepo Structure
```
neonpro/
├── apps/web/           # Main Next.js application
├── packages/ui/        # Shared UI components (@neonpro/ui)
├── packages/utils/     # Shared utilities (@neonpro/utils)
├── packages/types/     # TypeScript definitions (@neonpro/types)
└── docs/              # Project documentation
```

## Before Writing Code
1. **Analyze Healthcare Context**: Consider medical workflow implications
2. **Review Compliance Requirements**: Ensure LGPD/ANVISA/CFM compliance
3. **Validate Type Safety**: Use strict TypeScript for medical data
4. **Check Security Implications**: Audit trail, encryption, access control
5. **Ensure Accessibility**: WCAG 2.1 AA for healthcare users

## Rules

### Healthcare Data & Medical Compliance
- **Patient Data Security**: Always encrypt sensitive medical data (CPF, medical records)
- **LGPD Compliance**: Implement consent management, data subject rights, audit trails
- **ANVISA Standards**: Follow medical device and procedure tracking requirements
- **CFM Requirements**: Ensure medical professional verification and digital signatures
- **Audit Logging**: Log all patient data access and modifications
- **Row Level Security**: Use Supabase RLS for multi-tenant data isolation
- **Data Retention**: Implement automated retention and deletion policies
- **Medical Validation**: Use Zod schemas for all medical data validation
- **Error Handling**: Comprehensive error handling with healthcare-appropriate messages
- **Backup Requirements**: Encrypted backups with separate key management

### Next.js 15 + App Router Patterns
- **App Router Only**: Use app/ directory structure, never pages/ router
- **Server Components**: Prefer Server Components for data fetching when possible
- **Server Actions**: Use Server Actions for form submissions and mutations
- **Route Groups**: Organize routes with (auth), (dashboard), (patient) groups
- **Loading/Error UI**: Always provide loading.tsx and error.tsx for route segments
- **Metadata API**: Use generateMetadata for dynamic SEO and accessibility
- **Edge Functions**: Use edge runtime for authentication and real-time features
- **Middleware**: Implement auth and routing logic in middleware.ts
- **Static Generation**: Use ISR (Incremental Static Regeneration) for marketing pages
- **Dynamic Routes**: Use proper TypeScript interfaces for route parameters

### Supabase Integration Patterns
- **Database Access**: Use Supabase client with proper error handling
- **Authentication**: Leverage Supabase Auth with custom RBAC roles
- **Real-time**: Implement real-time subscriptions for appointment updates
- **Storage**: Use Supabase Storage for patient files and medical images
- **RLS Policies**: Implement comprehensive Row Level Security policies
- **Edge Functions**: Use Supabase Edge Functions for database operations
- **Type Generation**: Generate TypeScript types from database schema
- **Connection Pooling**: Use proper connection management for performance
- **Migration Management**: Use Supabase migrations for schema changes
- **Backup Strategy**: Implement automated backup and recovery procedures

### TypeScript Excellence (Healthcare-Grade)
- **Strict Mode**: Always use strict TypeScript configuration
- **Medical Types**: Define comprehensive interfaces for medical data structures
- **Branded Types**: Use branded types for medical IDs (PatientId, AppointmentId)
- **Zod Integration**: Use Zod for runtime validation and type inference
- **Generic Constraints**: Use proper generic constraints for medical workflows
- **Union Types**: Use discriminated unions for medical state management
- **Type Guards**: Implement type guards for medical data validation
- **API Contracts**: Define strict TypeScript contracts for all API endpoints
- **Error Types**: Use typed error handling for medical operations
- **Utility Types**: Create utility types for medical data transformations

### React + Healthcare UX Patterns
- **Form Validation**: Use React Hook Form + Zod for medical forms
- **State Management**: Use Zustand for client state, TanStack Query for server state
- **Error Boundaries**: Implement error boundaries for medical workflow protection
- **Loading States**: Always provide loading states for medical data operations
- **Optimistic Updates**: Use optimistic updates for non-critical operations only
- **Accessibility**: Ensure WCAG 2.1 AA compliance for all interactive elements
- **Medical Workflows**: Design components for medical professional workflows
- **Patient Privacy**: Implement privacy-conscious UI patterns
- **Responsive Design**: Ensure mobile-first design for clinic staff workflows
- **Performance**: Optimize for medical data-heavy operations

### Component Architecture (shadcn/ui + Healthcare)
- **shadcn/ui Base**: Build upon shadcn/ui components for consistency
- **Medical Components**: Create specialized components for medical workflows
- **Form Components**: Use healthcare-appropriate form components with validation
- **Data Display**: Implement medical data display components (charts, timelines)
- **Accessibility**: Ensure all components meet healthcare accessibility standards
- **Theming**: Use consistent theming appropriate for medical environments
- **Icon Usage**: Use medical-appropriate icons and imagery
- **Layout Components**: Create layouts optimized for healthcare workflows
- **Navigation**: Implement healthcare-specific navigation patterns
- **Error Handling**: Display medical-appropriate error messages and recovery options
### Security & Privacy (LGPD/ANVISA/CFM)
- **Encryption**: Use AES-256 for data at rest, TLS 1.3 for data in transit
- **Authentication**: Implement multi-factor authentication for healthcare staff
- **Authorization**: Use role-based access control with granular permissions
- **Session Management**: Secure session handling with appropriate timeouts
- **Data Minimization**: Collect only necessary patient data per LGPD requirements
- **Consent Management**: Implement granular consent tracking and withdrawal
- **Audit Trails**: Comprehensive logging of all patient data access
- **Key Management**: Use hardware security modules for encryption keys
- **Vulnerability Management**: Regular security scans and dependency updates
- **Incident Response**: Automated incident response with compliance reporting

### Performance Optimization (Healthcare Applications)
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1 for patient experience
- **Medical Forms**: Form submissions <2s with proper validation feedback
- **Search Performance**: Patient lookup <500ms with proper indexing
- **Real-time Updates**: <100ms for appointment status changes
- **Bundle Optimization**: Code splitting for medical workflow modules
- **Database Queries**: Optimized queries with proper indexing for medical data
- **Caching Strategy**: Intelligent caching for frequently accessed patient data
- **Image Optimization**: Optimized medical images and patient photos
- **Progressive Loading**: Lazy loading for large patient datasets
- **Memory Management**: Efficient memory usage for medical data processing

### Testing Standards (Healthcare-Grade)
- **Test Coverage**: ≥90% coverage for medical data handling functions using Vitest
- **Unit Testing**: Comprehensive testing of medical business logic with Vitest
- **Integration Testing**: Test all API endpoints and database operations with Vitest
- **E2E Testing**: Test critical medical workflows and compliance features with Playwright
- **Security Testing**: Test authentication, authorization, and data protection with Vitest
- **Compliance Testing**: Validate LGPD, ANVISA, CFM requirement adherence with Vitest
- **Accessibility Testing**: Ensure WCAG 2.1 AA compliance testing with Playwright
- **Performance Testing**: Load testing for medical data operations with Playwright
- **Medical Workflow Testing**: Test complete patient journey workflows with Playwright
- **Error Scenario Testing**: Test medical error handling and recovery scenarios with Vitest

### Code Quality & Standards
- **Healthcare Maintainability**: ≥85 maintainability index for medical code
- **Complexity Control**: ≤10 cyclomatic complexity for medical functions
- **Technical Debt**: ≤5% technical debt ratio for regulatory compliance
- **Documentation**: Comprehensive JSDoc for all medical-related functions
- **Error Handling**: Medical-appropriate error messages and recovery procedures
- **Code Reviews**: Minimum 2 reviewers for medical data handling changes
- **Linting Rules**: Biome linter with Ultracite config for healthcare-specific standards
- **Formatting**: Consistent Biome formatting across the entire codebase
- **Type Safety**: Zero tolerance for any types in medical data structures
- **Security Reviews**: Security review for all authentication/authorization changes

### Development Workflow (Healthcare)
- **Branch Strategy**: Feature branches with compliance impact assessment
- **Commit Standards**: Conventional commits with [LGPD], [ANVISA], [CFM] tags
- **Pull Requests**: Compliance officer review for regulatory changes
- **CI/CD Pipeline**: Healthcare-grade pipeline with Biome linting and compliance checks
- **Deployment**: Blue-green deployment with automatic rollback for health check failures
- **Monitoring**: Comprehensive monitoring for medical applications with alerting
- **Backup Strategy**: Encrypted backups with separate key management
- **Disaster Recovery**: Comprehensive disaster recovery procedures for patient data
- **Compliance Auditing**: Regular compliance audits and documentation updates
- **Staff Training**: Regular training on healthcare development standards

### Accessibility (a11y) - Healthcare Focus
- Don't set `aria-hidden="true"` on focusable elements.
- Don't add ARIA roles, states, and properties to elements that don't support them.
- Don't use distracting elements like `<marquee>` or `<blink>`.
- Only use the `scope` prop on `<th>` elements.
- Don't assign non-interactive ARIA roles to interactive HTML elements.
- Make sure label elements have text content and are associated with an input.
- Don't assign interactive ARIA roles to non-interactive HTML elements.
- Don't assign `tabIndex` to non-interactive HTML elements.
- Don't use positive integers for `tabIndex` property.
- Don't include "image", "picture", or "photo" in img alt prop.
- Don't use explicit role property that's the same as the implicit/default role.
- Make static elements with click handlers use a valid role attribute.
- Always include a `title` element for SVG elements.
- Give all elements requiring alt text meaningful information for screen readers.
- Make sure anchors have content that's accessible to screen readers.
- Assign `tabIndex` to non-interactive HTML elements with `aria-activedescendant`.
- Include all required ARIA attributes for elements with ARIA roles.
- Make sure ARIA properties are valid for the element's supported roles.
- Always include a `type` attribute for button elements.
- Make elements with interactive roles and handlers focusable.
- Give heading elements content that's accessible to screen readers (not hidden with `aria-hidden`).
- Always include a `lang` attribute on the html element.
- Always include a `title` attribute for iframe elements.
- Accompany `onClick` with at least one of: `onKeyUp`, `onKeyDown`, or `onKeyPress`.
- Accompany `onMouseOver`/`onMouseOut` with `onFocus`/`onBlur`.
- Include caption tracks for audio and video elements.
- Use semantic elements instead of role attributes in JSX.
- Make sure all anchors are valid and navigable.
- Ensure all ARIA properties (`aria-*`) are valid.
- Use valid, non-abstract ARIA roles for elements with ARIA roles.
- Use valid ARIA state and property values.
- Use valid values for the `autocomplete` attribute on input elements.
- Use correct ISO language/country codes for the `lang` attribute.

### Code Complexity and Quality
- Don't use consecutive spaces in regular expression literals.
- Don't use the `arguments` object.
- Don't use primitive type aliases or misleading types.
- Don't use the comma operator.
- Don't use empty type parameters in type aliases and interfaces.
- Don't write functions that exceed a given Cognitive Complexity score.
- Don't nest describe() blocks too deeply in test files.
- Don't use unnecessary boolean casts.
- Don't use unnecessary callbacks with flatMap.
- Use for...of statements instead of Array.forEach.
- Don't create classes that only have static members (like a static namespace).
- Don't use this and super in static contexts.
- Don't use unnecessary catch clauses.
- Don't use unnecessary constructors.
- Don't use unnecessary continue statements.
- Don't export empty modules that don't change anything.
- Don't use unnecessary escape sequences in regular expression literals.
- Don't use unnecessary fragments.
- Don't use unnecessary labels.
- Don't use unnecessary nested block statements.
- Don't rename imports, exports, and destructured assignments to the same name.
- Don't use unnecessary string or template literal concatenation.
- Don't use String.raw in template literals when there are no escape sequences.
- Don't use useless case statements in switch statements.
- Don't use ternary operators when simpler alternatives exist.
- Don't use useless `this` aliasing.
- Don't use any or unknown as type constraints.
- Don't initialize variables to undefined.
- Don't use the void operators (they're not familiar).
- Use arrow functions instead of function expressions.
- Use Date.now() to get milliseconds since the Unix Epoch.
- Use .flatMap() instead of map().flat() when possible.
- Use literal property access instead of computed property access.
- Don't use parseInt() or Number.parseInt() when binary, octal, or hexadecimal literals work.
- Use concise optional chaining instead of chained logical expressions.
- Use regular expression literals instead of the RegExp constructor when possible.
- Don't use number literal object member names that aren't base 10 or use underscore separators.
- Remove redundant terms from logical expressions.
- Use while loops instead of for loops when you don't need initializer and update expressions.
- Don't pass children as props.
- Don't reassign const variables.
- Don't use constant expressions in conditions.
- Don't use `Math.min` and `Math.max` to clamp values when the result is constant.
- Don't return a value from a constructor.
- Don't use empty character classes in regular expression literals.
- Don't use empty destructuring patterns.
- Don't call global object properties as functions.
- Don't declare functions and vars that are accessible outside their block.
- Make sure builtins are correctly instantiated.
- Don't use super() incorrectly inside classes. Also check that super() is called in classes that extend other constructors.
- Don't use variables and function parameters before they're declared.
- Don't use 8 and 9 escape sequences in string literals.
- Don't use literal numbers that lose precision.

### React and JSX Best Practices
- Don't use the return value of React.render.
- Make sure all dependencies are correctly specified in React hooks.
- Make sure all React hooks are called from the top level of component functions.
- Don't forget key props in iterators and collection literals.
- Don't destructure props inside JSX components in Solid projects.
- Don't define React components inside other components.
- Don't use event handlers on non-interactive elements.
- Don't assign to React component props.
- Don't use both `children` and `dangerouslySetInnerHTML` props on the same element.
- Don't use dangerous JSX props.
- Don't use Array index in keys.
- Don't insert comments as text nodes.
- Don't assign JSX properties multiple times.
- Don't add extra closing tags for components without children.
- Use `<>...</>` instead of `<Fragment>...</Fragment>`.
- Watch out for possible "wrong" semicolons inside JSX elements.

### Correctness and Safety
- Don't assign a value to itself.
- Don't return a value from a setter.
- Don't compare expressions that modify string case with non-compliant values.
- Don't use lexical declarations in switch clauses.
- Don't use variables that haven't been declared in the document.
- Don't write unreachable code.
- Make sure super() is called exactly once on every code path in a class constructor before this is accessed if the class has a superclass.
- Don't use control flow statements in finally blocks.
- Don't use optional chaining where undefined values aren't allowed.
- Don't have unused function parameters.
- Don't have unused imports.
- Don't have unused labels.
- Don't have unused private class members.
- Don't have unused variables.
- Make sure void (self-closing) elements don't have children.
- Don't return a value from a function with the return type 'void'
- Use isNaN() when checking for NaN.
- Make sure "for" loop update clauses move the counter in the right direction.
- Make sure typeof expressions are compared to valid values.
- Make sure generator functions contain yield.
- Don't use await inside loops.
- Don't use bitwise operators.
- Don't use expressions where the operation doesn't change the value.
- Make sure Promise-like statements are handled appropriately.
- Don't use __dirname and __filename in the global scope.
- Prevent import cycles.
- Don't use configured elements.
- Don't hardcode sensitive data like API keys and tokens.
- Don't let variable declarations shadow variables from outer scopes.
- Don't use the TypeScript directive @ts-ignore.
- Prevent duplicate polyfills from Polyfill.io.
- Don't use useless backreferences in regular expressions that always match empty strings.
- Don't use unnecessary escapes in string literals.
- Don't use useless undefined.
- Make sure getters and setters for the same property are next to each other in class and object definitions.
- Make sure object literals are declared consistently (defaults to explicit definitions).
- Use static Response methods instead of new Response() constructor when possible.
- Make sure switch-case statements are exhaustive.
- Make sure the `preconnect` attribute is used when using Google Fonts.
- Use `Array#{indexOf,lastIndexOf}()` instead of `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
- Make sure iterable callbacks return consistent values.
- Use `with { type: "json" }` for JSON module imports.
- Use numeric separators in numeric literals.
- Use object spread instead of `Object.assign()` when constructing new objects.
- Always use the radix argument when using `parseInt()`.
- Make sure JSDoc comment lines start with a single asterisk, except for the first one.
- Include a description parameter for `Symbol()`.
- Don't use spread (`...`) syntax on accumulators.
- Don't use the `delete` operator.
- Don't access namespace imports dynamically.
- Don't use namespace imports.
- Declare regex literals at the top level.
- Don't use `target="_blank"` without `rel="noopener"`.

### TypeScript Best Practices
- Don't use TypeScript enums.
- Don't export imported variables.
- Don't add type annotations to variables, parameters, and class properties that are initialized with literal expressions.
- Don't use TypeScript namespaces.
- Don't use non-null assertions with the `!` postfix operator.
- Don't use parameter properties in class constructors.
- Don't use user-defined types.
- Use `as const` instead of literal types and type annotations.
- Use either `T[]` or `Array<T>` consistently.
- Initialize each enum member value explicitly.
- Use `export type` for types.
- Use `import type` for types.
- Make sure all enum members are literal values.
- Don't use TypeScript const enum.
- Don't declare empty interfaces.
- Don't let variables evolve into any type through reassignments.
- Don't use the any type.
- Don't misuse the non-null assertion operator (!) in TypeScript files.
- Don't use implicit any type on variable declarations.
- Don't merge interfaces and classes unsafely.
- Don't use overload signatures that aren't next to each other.
- Use the namespace keyword instead of the module keyword to declare TypeScript namespaces.

### Style and Consistency
- Don't use global `eval()`.
- Don't use callbacks in asynchronous tests and hooks.
- Don't use negation in `if` statements that have `else` clauses.
- Don't use nested ternary expressions.
- Don't reassign function parameters.
- This rule lets you specify global variable names you don't want to use in your application.
- Don't use specified modules when loaded by import or require.
- Don't use constants whose value is the upper-case version of their name.
- Use `String.slice()` instead of `String.substr()` and `String.substring()`.
- Don't use template literals if you don't need interpolation or special-character handling.
- Don't use `else` blocks when the `if` block breaks early.
- Don't use yoda expressions.
- Don't use Array constructors.
- Use `at()` instead of integer index access.
- Follow curly brace conventions.
- Use `else if` instead of nested `if` statements in `else` clauses.
- Use single `if` statements instead of nested `if` clauses.
- Use `new` for all builtins except `String`, `Number`, and `Boolean`.
- Use consistent accessibility modifiers on class properties and methods.
- Use `const` declarations for variables that are only assigned once.
- Put default function parameters and optional function parameters last.
- Include a `default` clause in switch statements.
- Use the `**` operator instead of `Math.pow`.
- Use `for-of` loops when you need the index to extract an item from the iterated array.
- Use `node:assert/strict` over `node:assert`.
- Use the `node:` protocol for Node.js builtin modules.
- Use Number properties instead of global ones.
- Use assignment operator shorthand where possible.
- Use function types instead of object types with call signatures.
- Use template literals over string concatenation.
- Use `new` when throwing an error.
- Don't throw non-Error values.
- Use `String.trimStart()` and `String.trimEnd()` over `String.trimLeft()` and `String.trimRight()`.
- Use standard constants instead of approximated literals.
- Don't assign values in expressions.
- Don't use async functions as Promise executors.
- Don't reassign exceptions in catch clauses.
- Don't reassign class members.
- Don't compare against -0.
- Don't use labeled statements that aren't loops.
- Don't use void type outside of generic or return types.
- Don't use console.
- Don't use control characters and escape sequences that match control characters in regular expression literals.
- Don't use debugger.
- Don't assign directly to document.cookie.
- Use `===` and `!==`.
- Don't use duplicate case labels.
- Don't use duplicate class members.
- Don't use duplicate conditions in if-else-if chains.
- Don't use two keys with the same name inside objects.
- Don't use duplicate function parameter names.
- Don't have duplicate hooks in describe blocks.
- Don't use empty block statements and static blocks.
- Don't let switch clauses fall through.
- Don't reassign function declarations.
- Don't allow assignments to native objects and read-only global variables.
- Use Number.isFinite instead of global isFinite.
- Use Number.isNaN instead of global isNaN.
- Don't assign to imported bindings.
- Don't use irregular whitespace characters.
- Don't use labels that share a name with a variable.
- Don't use characters made with multiple code points in character class syntax.
- Make sure to use new and constructor properly.
- Don't use shorthand assign when the variable appears on both sides.
- Don't use octal escape sequences in string literals.
- Don't use Object.prototype builtins directly.
- Don't redeclare variables, functions, classes, and types in the same scope.
- Don't have redundant "use strict".
- Don't compare things where both sides are exactly the same.
- Don't let identifiers shadow restricted names.
- Don't use sparse arrays (arrays with holes).
- Don't use template literal placeholder syntax in regular strings.
- Don't use the then property.
- Don't use unsafe negation.
- Don't use var.
- Don't use with statements in non-strict contexts.
- Make sure async functions actually use await.
- Make sure default clauses in switch statements come last.
- Make sure to pass a message value when creating a built-in error.
- Make sure get methods always return a value.
- Use a recommended display strategy with Google Fonts.
- Make sure for-in loops include an if statement.
- Use Array.isArray() instead of instanceof Array.
- Make sure to use the digits argument with Number#toFixed().
- Make sure to use the "use strict" directive in script files.

### Next.js Specific Rules
- Don't use `<img>` elements in Next.js projects.
- Don't use `<head>` elements in Next.js projects.
- Don't import next/document outside of pages/_document.jsx in Next.js projects.
- Don't use the next/head module in pages/_document.js on Next.js projects.

### Testing Best Practices
- Don't use export or module.exports in test files.
- Don't use focused tests.
- Make sure the assertion function, like expect, is placed inside an it() function call.
- Don't use disabled tests.

### Common Healthcare Tasks
- `pnpm test:healthcare` - Run healthcare-specific tests (LGPD/ANVISA/CFM) with Vitest
- `pnpm test:compliance` - Run complete compliance validation with Vitest
- `pnpm test:security` - Run security-focused tests for patient data with Vitest
- `pnpm test:patient` - Run patient workflow and data tests with Vitest
- `pnpm test:e2e` - Run end-to-end healthcare workflow tests with Playwright
- `pnpm validate:healthcare` - Complete healthcare validation pipeline
- `pnpm audit:healthcare` - Healthcare compliance and security audit
- `pnpm format` - Format code using Biome with Ultracite config
- `pnpm check:fix` - Auto-fix code issues using Biome linter
- `pnpm db:migration:new` - Create new database migration
- `pnpm db:generate-types` - Generate TypeScript types from Supabase schema

## Healthcare Development Examples

### Example: Patient Data Handling
```typescript
// ✅ Good: Healthcare-grade patient data with encryption and validation
import { z } from 'zod';
import { encryptSensitiveData, auditLog } from '@/lib/security';

const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  cpf: z.string().regex(/^\d{11}$/),
  dateOfBirth: z.date(),
  medicalHistory: z.string().optional(),
});

export async function createPatient(data: z.infer<typeof PatientSchema>) {
  try {
    const validatedData = PatientSchema.parse(data);
    
    // Encrypt sensitive data before storage
    const encryptedData = {
      ...validatedData,
      cpf: await encryptSensitiveData(validatedData.cpf),
      medicalHistory: validatedData.medicalHistory 
        ? await encryptSensitiveData(validatedData.medicalHistory)
        : null,
    };
    
    const patient = await supabase
      .from('patients')
      .insert(encryptedData)
      .select()
      .single();
    
    // Audit log for compliance
    await auditLog({
      action: 'PATIENT_CREATED',
      patientId: patient.data?.id,
      userId: getCurrentUserId(),
      timestamp: new Date(),
    });
    
    return { success: true, data: patient.data };
  } catch (error) {
    await auditLog({
      action: 'PATIENT_CREATION_FAILED',
      error: error.message,
      userId: getCurrentUserId(),
      timestamp: new Date(),
    });
    
    return { 
      success: false, 
      error: 'Erro ao criar paciente. Tente novamente.' 
    };
  }
}

// ❌ Bad: Unencrypted patient data without validation
export async function createPatientBad(data: any) {
  return await supabase.from('patients').insert(data);
}
```

### Example: Medical Form Validation
```typescript
// ✅ Good: Medical form with comprehensive validation and accessibility
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ConsentFormSchema = z.object({
  patientId: z.string().uuid(),
  procedureType: z.enum(['botox', 'filler', 'laser', 'chemical_peel']),
  risksUnderstood: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os riscos para prosseguir',
  }),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  consentDate: z.date(),
});

export function ConsentForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ConsentFormSchema),
  });

  const onSubmit = async (data: z.infer<typeof ConsentFormSchema>) => {
    // Process with audit trail and encryption
    await processConsentForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset>
        <legend className="text-lg font-semibold mb-4">
          Termo de Consentimento - Procedimento Estético
        </legend>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="procedureType" className="block text-sm font-medium">
              Tipo de Procedimento
            </label>
            <select
              id="procedureType"
              {...register('procedureType')}
              className="mt-1 block w-full rounded border-gray-300"
              aria-describedby={errors.procedureType ? 'procedure-error' : undefined}
            >
              <option value="">Selecione um procedimento</option>
              <option value="botox">Botox</option>
              <option value="filler">Preenchimento</option>
              <option value="laser">Laser</option>
              <option value="chemical_peel">Peeling Químico</option>
            </select>
            {errors.procedureType && (
              <p id="procedure-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.procedureType.message}
              </p>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="risksUnderstood"
              {...register('risksUnderstood')}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              aria-describedby={errors.risksUnderstood ? 'risks-error' : 'risks-description'}
            />
            <label htmlFor="risksUnderstood" className="ml-3 text-sm">
              <span className="font-medium">
                Declaro que compreendo os riscos do procedimento
              </span>
              <p id="risks-description" className="text-gray-600 text-xs mt-1">
                Li e compreendi todas as informações sobre riscos, benefícios e alternativas
              </p>
            </label>
          </div>
          {errors.risksUnderstood && (
            <p id="risks-error" className="text-sm text-red-600" role="alert">
              {errors.risksUnderstood.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirmar Consentimento
        </button>
      </fieldset>
    </form>
  );
}
```

### Example: Supabase RLS Policy
```sql
-- ✅ Good: Comprehensive RLS policy for patient data protection
CREATE POLICY "patients_select_policy" ON patients
  FOR SELECT USING (
    -- Patients can only see their own data
    auth.uid() = user_id
    OR
    -- Healthcare staff can see patients assigned to their clinic
    EXISTS (
      SELECT 1 FROM staff_permissions sp
      JOIN clinic_patients cp ON cp.clinic_id = sp.clinic_id
      WHERE sp.user_id = auth.uid()
      AND cp.patient_id = patients.id
      AND sp.role IN ('doctor', 'nurse', 'admin')
    )
  );

-- Enable audit logging for all patient data changes
CREATE OR REPLACE FUNCTION log_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    operation,
    old_data,
    new_data,
    user_id,
    timestamp
  ) VALUES (
    'patients',
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_patient_changes();
```