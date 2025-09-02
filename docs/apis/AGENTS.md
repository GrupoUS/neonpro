# API Docs Orchestrator (docs/apis)

Purpose: define how to create, name, review, and maintain API docs in this folder with consistency and quality.

## Scope & Sources

- Main guide: `docs/apis/apis.md` (structure, examples, tech context)
- AI SDK rules: `ai-sdk-v5.0.md` (current) and `ai-sdk-v4.0.md` (legacy/migration)
- This file (AGENTS.md): orchestration rules + checklists

## File organization

- Location: keep all API docs in `docs/apis/`
- One domain per file; multiple related endpoints allowed
- Max length per file: ≤ 250 lines
- Filename pattern: `<domain>-<scope>.md` (e.g., `patients-crud.md`, `appointments-scheduling.md`)
- Header must include a short purpose line and, if relevant, SDK version tags (e.g., “AI SDK v5.0”)

## Required endpoint section format

For each endpoint, document in this order:
1) Title: `### [METHOD] /api/path`
2) Purpose: what it does and when to use
3) Auth: requirements and roles
4) Parameters: path, query, headers
5) Request Body: JSON schema or example
6) Responses: status codes + JSON examples (success and common errors)
7) Source Path: code location (e.g., `apps/web/app/api/.../route.ts`)
8) Notes: pitfalls, limits, rate limits, side effects

## Minimal file template
```md
# <Domain> – <Scope>

Purpose: <1–2 sentences>

## Endpoints
### [METHOD] /api/... 
- Purpose: ...
- Auth: ...
- Params: path/query/headers ...
- Request: JSON ...
- Responses: 200/4xx/5xx examples ...
- Source Path: apps/web/app/api/.../route.ts
- Notes: ...
```

```yaml
role: "Comprehensive API Documentation & Implementation Guide"
scope: "NeonPro Advanced Aesthetic Clinics Platform v2.0"
triggers: ["api", "endpoint", "implementação", "estrutura", "padrões"]
capabilities:
  - Complete endpoint documentation structure and examples
  - Next.js 15 + React 19 + TypeScript implementation patterns
  - Supabase authentication and database integration
  - Patient management and appointment scheduling APIs
  - Healthcare compliance and data privacy patterns
  - Performance targets and monitoring guidelines
  - Error handling and validation schemas
  - Production deployment and troubleshooting guides
```

**Conteúdo Abrangente:**

- **Tech Stack**: Next.js 15, Bun, Supabase, Vercel AI SDK 5.0
- **Core Endpoints**: Patients, Appointments, AI Chat, ML Predictions
- **Authentication**: Supabase Auth with Bearer tokens
- **Performance**: <200ms AI response, <500ms patient access
- **Compliance**: LGPD, data privacy, consent management
- **Testing**: Vitest + Playwright with 90%+ coverage

### **🤖 AI INTEGRATION DOCUMENTATION** (Vercel AI SDK)

## Process (Archon-first)
- Create an Archon task for the doc change (todo → doing → review)
- Link PR/commit and add implementation notes in the task
- Keep docs in sync with code changes; update examples and paths
- Prefer AI SDK v5.0 patterns; mark v4 only for migration notes

## Quality checklist (gate)

- Accurate paths and methods match code

- Examples run against current schemas/contracts
- Security: auth, PII masking, rate limiting noted if applicable
- Size ≤ 250 lines; clear titles; consistent terminology
- Cross-reference: link back to `apis.md` and any related domain files

### **🤖 Implementação de IA Específica**

```yaml
workflow: "AI Feature Implementation"
sequence:
  1. ai-sdk-v5.0.md → "Design type-safe AI integration with streaming"
  2. apis.md → "Integrate with healthcare authentication and data models"
  3. ai-sdk-v5.0.md → "Implement tool calling and agentic workflows"
  4. apis.md → "Add performance monitoring and error handling"
output: "AI-powered healthcare feature with streaming and tool integration"
```

### **📋 Migração de SDK**

```yaml
workflow: "AI SDK Migration v4 → v5"
sequence:
  1. ai-sdk-v4.0.md → "Understand current v4.0 implementation patterns"
  2. ai-sdk-v5.0.md → "Learn v5.0 architecture and breaking changes"
  3. ai-sdk-v5.0.md → "Implement new message separation and type safety"
  4. apis.md → "Validate integration with platform authentication"
output: "Successfully migrated AI features to v5.0 with improved type safety"
```

## 🎯 COMANDOS DE NAVEGAÇÃO

### **Consulta de Documentação Específica**

```bash
# Documentação Principal da Plataforma
@apis "implementar endpoint de pacientes"
@apis "configurar autenticação Supabase"
@apis "padrões de validação e erro"

# IA e SDK Vercel
@ai-sdk-v5 "implementar chat streaming"
@ai-sdk-v5 "configurar tool calling"
@ai-sdk-v4 "migrar código legacy"

# Consultas Combinadas
@apis,ai-sdk-v5 "integrar IA com autenticação"
@ai-sdk-v4,ai-sdk-v5 "planejar migração de SDK"
```

### **Navegação por Contexto**

```bash
# Desenvolvimento de Endpoints
@apis "estrutura de endpoint" → Padrões de implementação
@apis "autenticação" → Middleware e validação
@apis "performance" → Targets e monitoramento

# Integração de IA
@ai-sdk-v5 "streaming" → Implementação de chat em tempo real
@ai-sdk-v5 "tools" → Function calling e workflows
@ai-sdk-v5 "types" → Type safety e custom messages

# Troubleshooting
@apis "troubleshooting" → Problemas comuns e soluções
@ai-sdk-v5 "error handling" → Tratamento de erros de IA
```

## 📚 REFERÊNCIAS COMPLETAS

### **🌟 DOCUMENTAÇÃO PRINCIPAL**

- **📚 Core Platform**: [`docs/apis/apis.md`](./apis.md)
- **🚀 AI SDK v5.0**: [`docs/apis/ai-sdk-v5.0.md`](./ai-sdk-v5.0.md)
- **🤖 AI SDK v4.0**: [`docs/apis/ai-sdk-v4.0.md`](./ai-sdk-v4.0.md)

### **🔗 Links Diretos por Categoria**

```markdown
# Formato de Referência para APIs

## Core Platform APIs

- **Platform Documentation**: [`docs/apis/apis.md`](./apis.md)
  - Complete endpoint documentation and implementation patterns
  - Healthcare compliance and authentication patterns
  - Performance targets and monitoring guidelines

## AI Integration APIs

- **AI SDK v5.0 (Current)**: [`docs/apis/ai-sdk-v5.0.md`](./ai-sdk-v5.0.md)
  - Type-safe streaming and tool calling patterns
  - Agentic workflows and custom message types
  - Production-ready AI integration guidelines

- **AI SDK v4.0 (Legacy)**: [`docs/apis/ai-sdk-v4.0.md`](./ai-sdk-v4.0.md)
  - Legacy implementation patterns for migration reference
  - Stream management and provider abstraction
  - Compatibility patterns for existing projects
```

## 🎯 BENEFÍCIOS DO SISTEMA

### **🧠 Navegação Inteligente**

- **Roteamento Contextual**: Documentação específica ativada por triggers de contexto
- **Workflows Predefinidos**: Sequências otimizadas para diferentes tipos de implementação
- **Hierarquia Clara**: Organização modular facilita descoberta e compreensão

### **🚀 Eficiência de Desenvolvimento**

- **Documentação Focada**: Cada arquivo cobre um domínio específico com profundidade
- **Padrões Consistentes**: Estruturas padronizadas aceleram implementação
- **Exemplos Práticos**: Código real e padrões testados em produção

### **🔒 Excelência Healthcare**

- **Compliance Integrado**: LGPD e padrões de privacidade em toda documentação
- **Performance Garantida**: Targets específicos para aplicações médicas críticas
- **Segurança por Design**: Autenticação e validação em todos os padrões

## 💡 INTELLIGENT CONTEXT ENGINEERING

### **Estratégia de Contexto Modular**

```yaml
CONTEXT_LOADING_STRATEGY:
  primary_context: "Always load apis.md for platform understanding"
  ai_context: "Load ai-sdk-v5.0.md for AI-related implementations"
  migration_context: "Load ai-sdk-v4.0.md only for legacy migration tasks"

INTELLIGENT_ROUTING:
  endpoint_development: "apis.md → Complete implementation patterns"
  ai_integration: "ai-sdk-v5.0.md → Modern AI patterns"
  performance_optimization: "apis.md → Healthcare-specific targets"
  troubleshooting: "apis.md → Production issue resolution"
```

### **Context Engineering Guidelines**

- **Minimal Context Loading**: Carregue apenas a documentação necessária para a tarefa
- **Hierarchical Understanding**: Comece com apis.md para contexto geral da plataforma
- **Specialized Deep Dive**: Use documentação específica para implementações detalhadas
- **Cross-Reference Validation**: Valide padrões entre diferentes documentos quando necessário

## 📋 USAGE GUIDELINES

### **Para Desenvolvedores**

1. **Início de Projeto**: Sempre consulte `apis.md` para entender a arquitetura geral
2. **Implementação de IA**: Use `ai-sdk-v5.0.md` para padrões modernos de integração
3. **Migração**: Consulte `ai-sdk-v4.0.md` apenas para referência de código legacy
4. **Troubleshooting**: Retorne a `apis.md` para soluções de problemas de produção

### **Para Agentes IA**

1. **Context Loading**: Carregue documentação baseada em triggers específicos
2. **Workflow Following**: Siga sequências predefinidas para implementações complexas
3. **Pattern Matching**: Use exemplos específicos da documentação para implementações
4. **Validation**: Sempre valide implementações contra padrões de compliance healthcare

---

**🎯 ORCHESTRAÇÃO INTELIGENTE**: Este sistema de documentação API fornece navegação contextual e hierárquica para desenvolvimento eficiente de APIs healthcare com integração de IA de última geração.

**🔄 CONTEXT ENGINEERING**: Documentação modular permite carregamento inteligente de contexto baseado em necessidades específicas de implementação.

**📋 HEALTHCARE EXCELLENCE**: Todos os padrões incluem compliance LGPD, performance médica e segurança por design para aplicações críticas de saúde.
