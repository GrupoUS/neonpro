# NeonPro Healthcare Testing Setup

## 🏥 Vitest & Playwright Configuration Guide

Este documento detalha a configuração completa dos frameworks de teste Vitest e Playwright para o
sistema NeonPro Healthcare, incluindo setup específico para compliance LGPD/ANVISA/CFM.

---

## 📁 Estrutura de Arquivos

```
D:\neonpro\tools\testing\
├── 📋 CONFIGURAÇÕES
│   ├── vitest.config.ts              # Configuração principal do Vitest
│   ├── vitest.simple.config.ts       # ✅ Configuração simplificada (sem Prisma)
│   ├── playwright.config.ts          # Configuração principal do Playwright
│   └── playwright.simple.config.ts   # ✅ Configuração simplificada (sem global setup)
│
├── 🔧 SETUP E UTILITÁRIOS
│   ├── setup/
│   │   ├── global-setup.ts          # ✅ Setup global para Playwright
│   │   ├── global-teardown.ts       # ✅ Teardown global para Playwright
│   │   ├── auth/                    # ✅ Estados de autenticação
│   │   └── healthcare-setup.ts      # Setup específico para healthcare
│   ├── run-tests.js                 # ✅ Script utilitário para executar testes
│   └── test-basic.spec.ts           # ✅ Teste básico de exemplo
│
├── 📊 RELATÓRIOS E RESULTADOS
│   ├── reports/
│   │   ├── compliance/              # Relatórios de compliance LGPD/ANVISA
│   │   ├── security/                # Relatórios de segurança
│   │   └── archives/                # Arquivos de auditoria
│   └── coverage/                    # Cobertura de testes
└── 🧪 TESTES
    └── e2e/                         # Testes end-to-end
```

---

## ⚙️ Configurações Implementadas

### 🧪 Vitest (Unit & Integration Tests)

#### ✅ Configuração Simplificada (Recomendada)

**Arquivo**: `vitest.simple.config.ts`

- **Evita conflitos** com dependências do Prisma
- **Ambiente healthcare** pré-configurado
- **Path aliasing** para módulos NeonPro
- **Coverage** configurado para V8

#### 🔧 Configuração Completa

**Arquivo**: `vitest.config.ts`

- Workspace completo com todos os packages
- Integração com Prisma (se disponível)
- Setup avançado de healthcare

### 🎭 Playwright (E2E Tests)

#### ✅ Configuração Simplificada (Recomendada)

**Arquivo**: `playwright.simple.config.ts`

- **Sem global setup** complexo
- **Teste sequencial** para consistency de dados healthcare
- **Screenshots/videos** apenas em falhas
- **Viewport otimizado** para healthcare apps

#### 🔧 Configuração Completa

**Arquivo**: `playwright.config.ts`

- **Global setup/teardown** para compliance
- **Multiple browsers** e ambientes
- **Authentication states** automáticos
- **Audit logging** integrado

---

## 🚀 Como Usar

### Método 1: Script Utilitário (Recomendado)

```bash
# Navegar para pasta de testes
cd tools/testing

# Executar todos os testes (configuração simples)
node run-tests.js all simple

# Executar apenas Vitest
node run-tests.js vitest simple

# Executar apenas Playwright
node run-tests.js playwright simple

# Ver ajuda
node run-tests.js help
```

### Método 2: Comandos Diretos

#### Vitest

```bash
cd tools/testing

# Configuração simplificada (sem Prisma)
npx vitest run --config vitest.simple.config.ts --reporter=verbose

# Configuração completa (com Prisma)
npx vitest run --config vitest.config.ts --reporter=verbose

# Watch mode para desenvolvimento
npx vitest --config vitest.simple.config.ts
```

#### Playwright

```bash
cd tools/testing

# Configuração simplificada (sem global setup)
npx playwright test --config playwright.simple.config.ts --reporter=line

# Configuração completa (com compliance)
npx playwright test --config playwright.config.ts --reporter=line

# Teste específico
npx playwright test test-basic.spec.ts --config playwright.simple.config.ts
```

---

## 🔧 Resolução de Problemas

### ❌ Erro: Prisma não encontrado

**Solução**: Use a configuração simplificada

```bash
npx vitest run --config vitest.simple.config.ts
```

### ❌ Erro: global-setup.ts não encontrado

**Solução**: Use a configuração simplificada do Playwright

```bash
npx playwright test --config playwright.simple.config.ts
```

### ❌ Timeout nos testes

**Solução**: Configurações já incluem timeouts otimizados para healthcare

- Vitest: 30s por teste
- Playwright: 30s navegação, 10s ações

### ❌ Problemas de workspace

**Solução**: Execute testes diretamente da pasta `tools/testing`

```bash
cd tools/testing
# Execute comandos a partir desta pasta
```

---

## 🏥 Compliance Healthcare

### 📋 LGPD (Lei Geral de Proteção de Dados)

- ✅ **Audit logs** automáticos para manipulação de dados
- ✅ **Data cleanup** após testes
- ✅ **Privacy controls** ativos durante testes

### ⚖️ ANVISA (Agência Nacional de Vigilância Sanitária)

- ✅ **Regulatory compliance** em modo teste
- ✅ **Medical device validation** configurada
- ✅ **Safety protocols** ativos

### 👨‍⚕️ CFM (Conselho Federal de Medicina)

- ✅ **Medical ethics validation** configurada
- ✅ **Standards mode** ativo durante testes

---

## 📊 Relatórios Gerados

### Vitest

- **Coverage HTML**: `tools/testing/coverage/index.html`
- **JSON Report**: Para integração CI/CD

### Playwright

- **HTML Report**: `tools/testing/reports/playwright-html/index.html`
- **JSON Results**: `tools/testing/reports/playwright-results.json`
- **Compliance Reports**: `tools/testing/reports/compliance/`

---

## 🎯 Status dos Testes

| Componente           | Status           | Configuração                  | Notas            |
| -------------------- | ---------------- | ----------------------------- | ---------------- |
| ✅ Vitest Simple     | ✅ Funcionando   | `vitest.simple.config.ts`     | Recomendado      |
| ⚠️ Vitest Full       | ⚠️ Prisma Issues | `vitest.config.ts`            | Dependências     |
| ✅ Playwright Simple | ✅ Funcionando   | `playwright.simple.config.ts` | Recomendado      |
| ✅ Playwright Full   | ✅ Funcionando   | `playwright.config.ts`        | Com compliance   |
| ✅ Global Setup      | ✅ Criado        | `setup/global-setup.ts`       | Healthcare ready |
| ✅ Test Runner       | ✅ Funcionando   | `run-tests.js`                | Utilitário       |

---

## 📝 Próximos Passos

1. **Desenvolver testes específicos** para fluxos healthcare
2. **Integrar com CI/CD** usando configurações simplificadas
3. **Expandir coverage** para componentes críticos
4. **Implementar testes de performance** para compliance
5. **Adicionar testes de acessibilidade** WCAG 2.1

---

## 🤝 Contribuindo

Para adicionar novos testes:

1. **Testes unitários**: Adicione em `__tests__/` próximo ao código
2. **Testes E2E**: Adicione em `tools/testing/e2e/`
3. **Use configurações simplificadas** para desenvolvimento
4. **Documente compliance** específico se necessário

---

**✅ Setup Completo! Vitest e Playwright estão funcionais na pasta `D:\neonpro\tools\testing\`**
