# Simple Test Suite for Agents

Testes simples e funcionais que os agentes @.claude/agents/code-review/ podem utilizar.

## 🚀 Como Usar

### 1. Importar as utilidades

```typescript
import { validateFile, validateCodeQuality, validateSecurity } from './agent-utils'
```

### 2. Validar um arquivo de código

```typescript
const code = `
  function example() {
    console.log('Hello World')
    return true
  }
`

const result = validateFile(code, 'example.ts')
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
- `agent-helpers.test.ts` - Testes de helpers para agents
- `basic-functionality.test.ts` - Testes de funcionalidade básica
- `security-validation.test.ts` - Testes de segurança essencial
- `agent-utils.ts` - Utilitários para agents

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
# Todos os testes
pnpm test

# Testes específicos
pnpm test agent-helpers.test.ts

# Com coverage
pnpm test:coverage
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