# NeonPro Healthcare Platform

## 🏥 Plataforma SaaS de Gestão Hospitalar Modernizada

### 📋 Stack Tecnológica

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase + tRPC
- **Database**: PostgreSQL (Supabase)
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Quality Tools**: Biome + Ultracite + TypeScript Strict

## 🛡️ **PIPELINE DE QUALIDADE ZERO-ERROR**

### **Automação de Qualidade Integrada**

Este projeto implementa um pipeline de qualidade **zero-tolerance** que garante:
- ✅ **0 erros TypeScript** em todos os commits
- ✅ **Formatação automática** com Biome + Ultracite
- ✅ **Validação de código** em tempo real
- ✅ **Conventional Commits** obrigatório
- ✅ **CI/CD automático** com GitHub Actions

### **🔧 Git Hooks Configurados**

#### **Pre-commit Hook (.husky/pre-commit)**
Executa **automaticamente** antes de cada commit:

```bash
# 1. Biome check --write (formatação + linting)
# 2. Ultracite format (análise avançada)
# 3. TypeScript --noEmit (validação de tipos)
# 4. lint-staged (apenas arquivos modificados)
```

#### **Commit-msg Hook (.husky/commit-msg)**
Valida **mensagens de commit** usando Conventional Commits:

```bash
# Formatos aceitos:
feat: adiciona nova funcionalidade
fix: corrige bug crítico
docs: atualiza documentação
style: ajustes de formatação
refactor: refatora componente
test: adiciona testes unitários
```

### **⚡ GitHub Actions Pipeline**

**Workflow**: `.github/workflows/quality-validation.yml`

#### **Triggers Automáticos:**
- ✅ Push para `main` ou `develop`
- ✅ Pull Requests
- ✅ Execução manual (workflow_dispatch)

#### **Pipeline Steps:**
1. **Setup Environment** - Node.js 20 + pnpm caching
2. **Install Dependencies** - pnpm install com cache otimizado
3. **Biome Quality Check** - Formatação + linting
4. **Ultracite Analysis** - Análise avançada de código
5. **TypeScript Validation** - Zero errors obrigatório
6. **Build Verification** - Build completo sem erros
7. **Quality Report** - Relatório detalhado de qualidade

### **🚀 Comandos de Qualidade**

```bash
# Validação completa manual
pnpm lint              # Biome check --write
npx ultracite format   # Ultracite formatting
pnpm tsc              # TypeScript validation

# Pipeline completo (simula CI)
pnpm run quality:full  # Executa pipeline completo

# Verificação rápida
pnpm run quality:check # Check sem modificações
```

### **📊 Métricas de Qualidade**

**Status Atual:**
- ✅ **0 erros TypeScript** (de 1918 → 0)
- ✅ **100% compliance** Biome + Ultracite
- ✅ **Automatização completa** Git hooks + CI
- ✅ **Pipeline <2min** execução total

**Monitoramento:**
- GitHub Actions badges
- Quality gates em PRs
- Relatórios automáticos
- Métricas de performance

### **🔍 Troubleshooting de Qualidade**

#### **Erro: Pre-commit falhou**
```bash
# 1. Verificar erros específicos
git commit -m "feat: exemplo" --no-verify  # Bypass temporário

# 2. Executar pipeline manual
pnpm lint
npx ultracite format  
pnpm tsc

# 3. Adicionar arquivos corrigidos
git add .
git commit -m "feat: exemplo"
```

#### **Erro: Commit message inválida**
```bash
# ❌ Inválido
git commit -m "fix something"

# ✅ Válido  
git commit -m "fix: corrige validação de formulário"
```

#### **Erro: TypeScript no CI**
- Verificar se todas as dependências estão instaladas
- Confirmar que `pnpm tsc` roda localmente sem erros
- Verificar configuração `tsconfig.json`

### **🎯 Configuração de Desenvolvimento**

#### **Setup Inicial:**
```bash
# 1. Clone e instale
git clone <repo-url>
cd neonpro
pnpm install

# 2. Ativar hooks (automático com Husky)
# Os hooks são ativados automaticamente após pnpm install

# 3. Validar setup
pnpm lint
pnpm tsc
```

#### **Workflow de Desenvolvimento:**
```bash
# 1. Criar branch
git checkout -b feat/nova-funcionalidade

# 2. Desenvolver (qualidade automática via hooks)
code .
# Editar arquivos...

# 3. Commit (pipeline automático)
git add .
git commit -m "feat: implementa nova funcionalidade"
# ✅ Pre-commit hook executa automaticamente
# ✅ Formatação automática
# ✅ Validação TypeScript
# ✅ Commit message validada

# 4. Push (CI automático)
git push origin feat/nova-funcionalidade
# ✅ GitHub Actions pipeline executa
# ✅ Quality gates verificados
# ✅ Ready para merge
```

---

### 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone <repo-url>
cd neonpro

# 2. Instale as dependências (Husky setup automático)
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute em desenvolvimento
pnpm dev

# 5. Execute o build
pnpm build
```