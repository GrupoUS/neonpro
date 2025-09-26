# Simple Test Suite for Agents

Testes simples e funcionais que os agentes @.claude/agents/code-review/ podem utilizar.

> Nota de Consolidação (2025-09-26)
>
> - As pastas antigas `tools/tests-consolidated` e `tools/shared` foram removidas.
> - Todo o conteúdo útil foi consolidado aqui em `tools/tests` seguindo KISS/YAGNI.
> - Utilidades compartilhadas agora vivem em `agent-utils.ts`.
> - Testes RED-phase (arquivos `*.red-phase.test.ts`) permanecem no diretório `scripts/` e são EXCLUÍDOS por padrão pela configuração do Vitest.
> - Atualize quaisquer referências antigas para apontar para `tools/tests`.

## 🚀 Como Usar

### 1. Importar as utilidades

```typescript
import {
  validateCodeQuality,
  validateFile,
  validatePerformance,
  validateSecurity,
} from "./agent-utils"
```

### 2. Validar um arquivo de código

```typescript
const code = `
  function example() {
    console.log('Hello World')
    return true
  }
`

const result = validateFile(code, "example.ts")
console.log(result.qualityScore) // Score de 0-100
console.log(result.recommendations) // Lista de melhorias
```

### 3. Validações específicas

```typescript
// Verificar qualidade do código
const hasConsoleStatements = validateCodeQuality.hasConsoleStatements(code)

// Verificar segurança
const hasSecurityIssues = validateSecurity.hasXssVulnerability(code)

// Verificar performance
const hasPerformanceIssues = validatePerformance.hasMemoryLeaks(code)
```

## 📋 Estrutura dos Testes

### Arquivos

- `agent-helpers.test.ts` - Helpers para agentes
- `basic-functionality.test.ts` - Funcionalidades básicas da plataforma
- `security-validation.test.ts` - Guardrails de segurança e compliance
- `categories/backend/unit` - Suíte rápida de verificações unitárias
- `lgpd-compliance` - Testes de conformidade LGPD

### Categorias de Validação

#### Qualidade de Código

- Detecção de console statements
- Identificação de TODO/FIXME comments
- Verificação de interfaces e tipos
- Análise de complexidade de funções

#### Segurança

- Detecção de vulnerabilidades XSS
- Identificação de eval() usage
- Verificação de segredos hardcoded
- Análise de SQL injection patterns

#### Performance

- Detecção de memory leaks
- Identificação de loops ineficientes
- Análise de funções muito grandes

#### Domínio Healthcare

- Detecção de dados de pacientes
- Identificação de padrões de autenticação
- Verificação de dados sensíveis

## 🔧 Executar Testes

```bash
# Todos os testes (exclui arquivos *.red-phase.* automaticamente)
pnpm run test:run

# Cobertura
pnpm run test:coverage

# Lint e validação completa
pnpm run lint
pnpm run validate   # format:check + lint + test:run

# Rodar arquivo específico
pnpm vitest run basic-functionality.test.ts
```

## 📊 Exemplo de Saída

```typescript
{
  filename: 'example.ts',
  stats: {
    lineCount: 25,
    wordCount: 150,
    functionCount: 1,
    classCount: 0,
    interfaceCount: 0,
    complexity: 1
  },
  qualityScore: 75,
  recommendations: [
    'Remove console.log statements from production code'
  ],
  summary: {
    totalIssues: 1,
    criticalIssues: 0,
    warningIssues: 1
  }
}
```

## 🎯 Princípios

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Ain't Gonna Need It
- **Funcional**: Testes que realmente funcionam
- **Útil**: Ajuda os agents a fazerem seu trabalho
- **Simples**: Fácil de entender e usar
