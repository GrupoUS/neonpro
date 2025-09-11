---
description: "Complete Vercel deployment workflow with intelligent error resolution"
tools: ['sequential-thinking', 'archon', 'serena', 'desktop-commander', 'context7', 'tavily']
---

# NeonPro Deploy - Complete Vercel Deployment Lifecycle

## 🎯 **Core Philosophy**
**Systematic Deploy → Detect → Research → Fix → Redeploy cycle until production success**

---

## 🚀 **Core Actions**

### `deploy` - Intelligent Vercel Deployment
**Purpose**: Complete deployment with automated error detection and resolution

**Execution Flow:**
1. **Pre-deployment Validation**
   - `sequential-thinking` - Analyze current state and deployment requirements
   - `serena` - Codebase analysis for potential issues
   - `bun run type-check` - TypeScript validation
   - `bun run lint:fix` - Code quality fixes
   - `bun run build` - Local build verification

2. **Deployment Execution**
   - `vercel --prod` - Production deployment
   - Real-time error monitoring
   - Health check validation
   - Performance metrics collection

3. **Error Detection & Response**
   - Build error categorization
   - Runtime error identification  
   - Environment variable validation
   - Dependency conflict detection

4. **Intelligent Error Resolution**
   - `context7` - Search official docs (Vercel, React, TypeScript, etc.)
   - `tavily` - Research best practices and solutions
   - `archon` - Document errors and solutions for future reference
   - Systematic fix implementation

5. **Validation & Retry**
   - Verify fixes resolve issues
   - Redeploy if needed
   - Continue cycle until success

### `fix-errors` - Systematic Error Resolution
**Purpose**: Intelligent error fixing with research-backed solutions

**Proven Methodology:**
1. **Error Analysis** 
   - Categorize errors by type and severity
   - Identify root causes vs symptoms
   - Group related errors for batch fixing

2. **Research Phase**
   - `context7` - Get official documentation for error patterns
   - `tavily` - Search for proven solutions and best practices
   - Cross-reference multiple sources for accuracy

3. **Solution Implementation**
   - Apply fixes in logical order
   - Test each fix incrementally
   - Document successful approaches

4. **Validation**
   - `bun run type-check` after each batch
   - Ensure no regressions introduced
   - Update documentation with learnings

**Error Categories:**
- **Critical Deploy Blockers**: Build failures, missing dependencies
- **TypeScript Errors**: Type mismatches, import issues, compatibility
- **Runtime Errors**: Server errors, API failures, environment issues
- **Performance Issues**: Bundle size, loading times, optimization

### `research` - Official Docs & Best Practices Lookup
**Purpose**: Research solutions using official sources

**Research Sources:**
- **Vercel**: Deployment, configuration, troubleshooting
- **React/Next.js**: Component patterns, hooks, performance  
- **TypeScript**: Type definitions, compatibility, migration
- **TanStack Router**: Routing patterns and best practices
- **Supabase**: Database, auth, realtime features
- **Hono.dev**: API patterns and deployment

**Research Process:**
1. `context7` - Query specific technology documentation
2. `tavily` - Search for recent solutions and community fixes  
3. `archon` - Store successful solutions for reuse
4. Cross-validate information from multiple sources

### `test-deploy` - Complete Testing Pipeline
**Purpose**: Comprehensive validation before and after deployment

**Testing Stages:**
1. **Local Testing**
   - `bun test` - Unit tests
   - `bun run type-check` - TypeScript validation
   - `bun run lint` - Code quality
   - `bun run build` - Build verification

2. **Pre-deploy Validation**
   - Environment variable check
   - Dependency audit
   - Bundle size analysis
   - Performance baseline

3. **Post-deploy Testing**
   - Health endpoint verification
   - API functionality testing
   - Frontend loading validation
   - Error monitoring setup

4. **Performance Validation**
   - Core Web Vitals measurement
   - Bundle analysis
   - Loading time verification
   - Mobile performance check

---

## 📋 **Complete Workflow Examples**

### Full Production Deploy
```bash
# Complete deployment with error resolution
/dev-lifecycle deploy --production --auto-research --fix-errors --retry-until-success

# Step-by-step process:
# 1. Pre-deploy validation
# 2. Deploy to Vercel
# 3. If errors: research solutions → apply fixes → redeploy
# 4. Continue until successful
# 5. Validate production health
```

### Error-First Approach
```bash
# Fix existing errors before attempting deploy
/dev-lifecycle fix-errors --research-first --batch-size=5 --document-solutions
/dev-lifecycle test-deploy --comprehensive
/dev-lifecycle deploy --production
```

### Research & Document Solutions
```bash
# Research specific error patterns
/dev-lifecycle research vercel-build-errors --context7 --tavily --store-archon

# Document successful deployment patterns
/dev-lifecycle research react-19-compatibility --official-docs --best-practices
```

---

## 🔧 **Technology Stack Integration**

**NeonPro Stack Support:**
- **TanStack Router + Vite**: Build optimization and routing patterns
- **React 19**: Latest compatibility patterns and migration guides  
- **TypeScript 5.7.2**: Advanced type safety and error resolution
- **Hono.dev**: API deployment patterns for Vercel
- **Supabase**: Database and auth integration
- **Vercel AI SDK v5.0**: AI integration deployment patterns

**Common Error Patterns & Solutions:**
- **Build Errors**: Missing dependencies, configuration issues
- **TypeScript**: JSX namespace, import/export patterns
- **Runtime**: Environment variables, API integration
- **Performance**: Bundle splitting, loading optimization

---

## 🎯 **Success Criteria & Validation**

### Deployment Success Metrics
- ✅ **Zero Build Errors**: Complete TypeScript and build validation
- ✅ **Successful Vercel Deploy**: Production deployment without failures
- ✅ **All Tests Passing**: Unit, integration, and e2e test success
- ✅ **Performance Validated**: Core Web Vitals within targets
- ✅ **Health Checks Green**: API endpoints responding correctly
- ✅ **Error Monitoring Active**: Real-time error tracking functional

### Continuous Improvement
- **Solution Documentation**: All fixes documented in Archon for reuse
- **Pattern Recognition**: Common error patterns identified and automated
- **Best Practice Integration**: Official recommendations implemented
- **Performance Optimization**: Continuous monitoring and improvement

---

## 🤖 **MCP Tool Integration**

**Research & Resolution Chain:**
1. `sequential-thinking` → Problem analysis and strategy
2. `context7` → Official documentation lookup  
3. `tavily` → Best practices and community solutions
4. `serena` → Codebase analysis and implementation
5. `archon` → Solution documentation and knowledge management
6. `desktop-commander` → File operations and testing execution

**Intelligent Automation:**
- Auto-research common error patterns
- Batch similar errors for efficient resolution
- Learn from successful fixes for future deployments
- Maintain knowledge base of proven solutions

---

**Status**: 🟢 **VERCEL DEPLOY COMPLETE** | **Workflow**: Deploy → Detect → Research → Fix → Redeploy | **Until**: Production Success ✅