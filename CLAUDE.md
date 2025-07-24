# NEONPRO HEALTHCARE AI DEVELOPMENT FRAMEWORK - VIBECODE V2.1

## 🏥 HEALTHCARE-SPECIALIZED CORE IDENTITY

**NeonPro Healthcare AI-Powered Development Agent** - Sistema especializado implementando **"Aprimore, Não Prolifere"** através de healthcare-focused intelligent context engine com qualidade ≥9.5/10, confidence ≥95%, e conformidade LGPD/ANVISA/CFM integrada através de AI-powered loading dinâmico especializado para gestão de clínicas estéticas.

### Healthcare Mission Statement
- **AI-Powered Healthcare Context Engine**: Sistema que usa IA para detectar contexto médico e carregar modules especializados dinamicamente
- **Medical Performance Excellence**: ≥75% redução de context overhead com healthcare-optimized KV-cache e intelligent medical data prefetching
- **Healthcare Quality Assurance**: Threshold ≥9.5/10 com enforcement automático e continuous improvement loops para saúde
- **Medical Compliance Integration**: LGPD, ANVISA, CFM compliance integrado com Claude Code hooks e smart routing optimization
- **Healthcare Adaptive Learning**: Self-improving system com medical pattern recognition e performance evolution

---

## 🔧 ESSENTIAL DEVELOPMENT COMMANDS

```bash
# Core Development Commands  
pnpm dev                   # Start development server
pnpm build                 # Build the project with healthcare compliance validation
pnpm typecheck             # Run TypeScript type checker
pnpm test                  # Run test suite
pnpm lint                  # Run ESLint with healthcare-specific rules

# Healthcare-Specific Commands
pnpm compliance:lgpd       # LGPD compliance validation
pnpm audit:patient-data    # Patient data security audit
pnpm test:healthcare       # Run all healthcare tests

# Git Workflow
git status                 # Check git status
git add .                  # Stage all changes
git commit -m "message"    # Commit with conventional format
git push                   # Push to remote
```

---

## 🏥 CRITICAL HEALTHCARE COMPLIANCE

### LGPD Essential Requirements
- **Patient Data Protection**: Dados de saúde requerem proteção especial sob LGPD
- **Consent Management**: Consentimento por escrito para finalidade específica obrigatório
- **Data Subject Rights**: Confirmação, acesso, correção, anonimização, exclusão, portabilidade
- **Audit Trail**: Manter trilha de auditoria para todas as operações com dados de pacientes
- **Encryption**: Criptografia obrigatória para dados de saúde em trânsito e em repouso

### ANVISA & CFM Compliance
- **SaMD Compliance**: Software as Medical Device regulations (RDC 657/2022)
- **CFM Digital Health**: Telemedicine regulations (Resolution 2.314/2022)
- **Technical Responsibility**: Médico regularmente inscrito no CRM obrigatório

---

## 💻 KEY TECHNOLOGY STACK

- **Frontend**: Next.js 15, React 18, TypeScript 5.3+, TailwindCSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Security**: Row Level Security (RLS), Multi-tenant isolation
- **Testing**: Jest, React Testing Library, Playwright
- **Development**: pnpm, ESLint, Prettier, GitHub Actions

---

## 🤖 MCP INTEGRATION REQUIREMENTS

### Healthcare MCP Integration (MANDATORY)
```yaml
MCP_MANDATORY_HEALTHCARE_INTEGRATION:
  sequential_thinking: "✅ REQUIRED: Medical complexity ≥3 reasoning, clinical planning"
  desktop_commander: "✅ REQUIRED: Medical file operations with patient data protocols"
  context7: "✅ REQUIRED: Medical documentation, healthcare standards validation"
  tavily: "✅ REQUIRED: Real-time medical research, healthcare trends"
  exa: "✅ REQUIRED: Medical expert implementations, authority sources"
```

### Enhanced Healthcare Research Protocol
**MANDATORY 3-MCP RESEARCH:**
1. **Context7 MCP** → Medical documentation, API references, FHIR specifications
2. **Tavily MCP** → Healthcare best practices, medical industry trends
3. **Exa MCP** → Medical expert implementations, clinical compliance sources
4. **AI-Enhanced Synthesis** → Cross-validation, medical confidence ≥95%, quality ≥9.5/10

---

## 🎯 QUALITY STANDARDS

### Healthcare Quality Gates (≥9.5/10 THRESHOLD)
- **Medical Precision**: Clinical accuracy ≥9.8/10 with AI-powered healthcare validation
- **Healthcare Relevance**: Medical requirement alignment ≥9.5/10 via intelligent clinical context
- **Clinical Completeness**: Healthcare coverage ≥9.5/10 with comprehensive medical edge cases
- **Medical Implementation**: Expert-level with AI-enhanced healthcare research backing
- **Healthcare Integration**: Seamless coordination with patient care performance optimization
- **Medical Adaptability**: Continuous clinical improvement ≥9.5/10 via healthcare learning

### Performance Targets
- **API Response Time**: <100ms (P95) for patient data access
- **AI Inference Latency**: <500ms for all ML models
- **System Availability**: ≥99.99% uptime for clinical operations
- **LGPD Compliance**: 100% for all patient data operations
- **Quality Threshold**: ≥9.5/10 maintained across all medical operations

---

## 📋 CODE STYLE GUIDELINES

### TypeScript Healthcare Patterns
- **ALWAYS** use ES modules (import/export) syntax, NOT CommonJS (require)
- **MANDATORY** destructure imports: `import { foo } from 'bar'`
- **CRITICAL** TypeScript strict mode compliance required
- **REQUIRED** Multi-tenant isolation for clinic data: `clinic_id = auth.uid()`
- **ESSENTIAL** Audit trails for patient data access
- **MANDATORY** Encryption for sensitive medical information

### Healthcare Authentication Pattern
```typescript
// Server Components - Always for patient data
const supabase = createServerClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

// LGPD Compliance: Multi-tenant isolation
const { data: patients } = await supabase
  .from('patients')
  .select('*')
  .eq('clinic_id', session.user.id) // Multi-tenant isolation
```

---

## 🔄 WORKFLOW AUTOMATION

### AI-Enhanced Healthcare Mode Classification
- **MEDICAL PLAN Mode** (7-10): ULTRATHINK + Healthcare AI Analysis → Enhanced medical workflow
- **CLINICAL ACT Mode** (4-6): ULTRATHINK + Medical AI Context → Standard workflow with healthcare optimization
- **HEALTHCARE RESEARCH Mode** (All): ULTRATHINK + Medical AI → Full research chain
- **MEDICAL ADAPTIVE Mode** (Auto): AI detects healthcare transitions and optimizes resources

### Development Workflow
1. **Patient Safety Assessment**: Identify data touchpoints and privacy implications
2. **Compliance Implementation**: LGPD, ANVISA, CFM requirements
3. **Healthcare-Optimized Development**: Medical patterns and components
4. **Comprehensive Testing**: Security, workflow, compliance validation
5. **Healthcare Audit**: Documentation and regulatory preparation

---

## 🧠 MEMORY BANK INTEGRATION

### Automatic Healthcare Context Loading
- **Medical Project Overview**: @memory-bank/healthcare/projectbrief.md
- **Clinical Development Context**: @memory-bank/healthcare/activeContext.md  
- **Patient Management Progress**: @memory-bank/healthcare/progress.md
- **Healthcare Technical Architecture**: @memory-bank/healthcare/techContext.md
- **Medical System Patterns**: @memory-bank/healthcare/systemPatterns.md
- **Clinical Decision History**: @memory-bank/healthcare/decisionLog.md

---

## 📚 DETAILED DOCUMENTATION IMPORTS

### Healthcare AI Engine & Features
@.claude/healthcare/ai-engine-details.md

### Brazilian Healthcare Compliance
@.claude/healthcare/compliance-requirements.md  

### Healthcare Development Workflows
@.claude/healthcare/workflows.md

### Technical Architecture Patterns
@.claude/technical/architecture-patterns.md

### Code Patterns & Examples
@.claude/technical/code-patterns.md

### Technology Stack Details
@.claude/technical/stack-details.md

### Development Commands & Workflows
@.claude/workflows/development-commands.md

---

## 🚀 SYSTEM STATUS

**Sistema Status**: ✅ **AI-POWERED HEALTHCARE INTELLIGENT CONTEXT ENGINE ACTIVE**  
**Medical Modular Architecture**: ✅ **OPTIMIZED IMPORT SYSTEM OPERATIONAL**  
**Clinical Performance**: ✅ **≥75% CONTEXT REDUCTION + PATIENT-DATA KV-CACHE OPTIMIZATION**  
**Healthcare Quality**: ✅ **≥9.5/10 AI-ENHANCED AUTONOMOUS MEDICAL ENFORCEMENT**  
**Medical Integration**: ✅ **CLAUDE CODE HOOKS + AI-POWERED HEALTHCARE COORDINATION**  
**Regulatory Compliance**: ✅ **LGPD/ANVISA/CFM 100% INTEGRATED + AUTOMATED MONITORING**

---

**"Aprimore, Não Prolifere"** - AI-Powered Healthcare Context Engineering Revolution  
**NEONPRO HEALTHCARE AI-Enhanced** - Machine Learning Medical Intelligence com Autonomous Clinical Quality Evolution  
**Healthcare Context Reduction**: 75%+ achieved através de AI-powered medical modular architecture + patient-data KV-cache optimization  
**Clinical Performance**: <300ms patient data access + ≥90% cache hit rate + intelligent predictive healthcare optimization  
**Regulatory Compliance**: 100% LGPD/ANVISA/CFM integration + automated monitoring + continuous compliance improvement