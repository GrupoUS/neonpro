# 🧪 NeonPro Testing Suite

## 📁 Estrutura de Testes Migrada

Esta é a nova estrutura centralizada de testes do projeto NeonPro, migrada da pasta `e:\neonpro\tests` para `e:\neonpro\tools\testing\tests`.

### 🗂️ Organização dos Testes

```
tools/testing/
├── tests/
│   ├── accessibility/          # Testes de acessibilidade
│   │   ├── accessibility-demo.spec.ts
│   │   └── healthcare-accessibility.spec.ts
│   ├── auth/                   # Testes de autenticação
│   │   ├── task-002-final-integration.test.ts
│   │   └── webauthn-verification.test.ts
│   ├── integration/            # Testes de integração
│   │   └── financial-integration.test.ts
│   ├── performance/            # Testes de performance
│   │   └── load-testing.test.ts
│   ├── security/               # Testes de segurança
│   │   └── security-audit.test.ts
│   ├── unit/                   # Testes unitários
│   │   └── monitoring.test.ts
│   └── simple-monitoring.test.ts
├── cypress/                    # Testes E2E com Cypress
├── playwright/                 # Testes E2E com Playwright
├── performance/                # Ferramentas de performance
├── __tests__/                  # Configurações de teste
├── jest.config.ts              # Configuração Jest
└── README.md                   # Este arquivo
```

### 🎯 Tipos de Teste

#### 🔧 Testes Unitários (`unit/`)
- **monitoring.test.ts**: Verificação da infraestrutura de monitoramento da TASK-001
- Testa componentes isolados e utilitários
- Cobertura de funções individuais

#### 🔗 Testes de Integração (`integration/`)
- **financial-integration.test.ts**: Integração do sistema financeiro
- Testa interações entre componentes
- Validação de fluxos de dados

#### 🚀 Testes de Performance (`performance/`)
- **load-testing.test.ts**: Testes de carga e desempenho
- Benchmarks de tempo de resposta
- Testes de estresse e concorrência

#### 🛡️ Testes de Segurança (`security/`)
- **security-audit.test.ts**: Auditoria de segurança abrangente
- Validação de autenticação e autorização
- Conformidade com LGPD e regulamentações de saúde

#### 🔐 Testes de Autenticação (`auth/`)
- **task-002-final-integration.test.ts**: Integração final da TASK-002
- **webauthn-verification.test.ts**: Verificação WebAuthn/FIDO2
- Gerenciamento avançado de sessões
- Framework de auditoria de segurança

#### ♿ Testes de Acessibilidade (`accessibility/`)
- **accessibility-demo.spec.ts**: Demo de formulário acessível
- **healthcare-accessibility.spec.ts**: Acessibilidade específica para saúde
- Conformidade WCAG 2.1 AA
- Compatibilidade com leitores de tela

### 🏃‍♂️ Executando os Testes

#### Todos os Testes
```bash
npm test
# ou
yarn test
```

#### Por Categoria
```bash
# Testes unitários
npm test -- --selectProjects="Unit Tests"

# Testes de integração
npm test -- --selectProjects="Integration Tests"

# Testes de performance
npm test -- --selectProjects="Performance Tests"

# Testes de segurança
npm test -- --selectProjects="Security Tests"

# Testes de autenticação
npm test -- --selectProjects="Authentication Tests"

# Testes de acessibilidade
npm test -- --selectProjects="Accessibility Tests"
```

#### Arquivo Específico
```bash
# Teste específico
npm test tools/testing/tests/auth/task-002-final-integration.test.ts

# Com watch mode
npm test -- --watch tools/testing/tests/unit/monitoring.test.ts
```

### 📊 Cobertura de Código

```bash
# Gerar relatório de cobertura
npm test -- --coverage

# Visualizar relatório HTML
open tools/testing/coverage/lcov-report/index.html
```

### 🔧 Configuração

- **jest.config.ts**: Configuração principal do Jest
- **__tests__/setup.ts**: Configurações globais de teste
- Mapeamento de módulos para aliases `@/`
- Timeout de 30 segundos para testes

### 📋 Padrões de Teste

#### Nomenclatura
- Testes unitários: `*.test.ts`
- Testes de acessibilidade: `*.spec.ts`
- Testes E2E: `*.e2e.ts`

#### Estrutura
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('Functionality Group', () => {
    test('should do something specific', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 🎯 Metas de Qualidade

- **Cobertura de Código**: ≥90%
- **Performance**: Testes devem executar em <30s
- **Segurança**: 100% dos testes de segurança devem passar
- **Acessibilidade**: Conformidade WCAG 2.1 AA

### 🚀 Integração Contínua

Os testes são executados automaticamente:
- Em cada push para branches principais
- Em pull requests
- Deploy para produção

### 📝 Contribuindo

1. Adicione testes para novas funcionalidades
2. Mantenha cobertura ≥90%
3. Siga os padrões de nomenclatura
4. Execute testes localmente antes do commit

### 🔍 Debugging

```bash
# Debug com Node.js
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose

# Apenas testes que falharam
npm test -- --onlyFailures
```

---

**Migração Completa**: Todos os arquivos de teste foram migrados com sucesso da estrutura antiga para a nova estrutura centralizada em `tools/testing/tests/`.