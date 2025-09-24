# 🧪 Testes Consolidados NeonPro

> **Estrutura simplificada seguindo princípios KISS e YAGNI**

## 📁 Estrutura

```
tools/tests-consolidated/
├── unit/                    # Testes unitários
├── integration/             # Testes de integração  
├── e2e/                     # Testes end-to-end (Playwright)
├── fixtures/                # Setup e mocks compartilhados
├── configs/                 # Configurações consolidadas
│   ├── vitest.config.ts     # Configuração Vitest
│   ├── playwright.config.ts # Configuração Playwright
│   ├── dprint.json          # Formatação
│   └── oxlint.json          # Linting
└── package.json             # Scripts e dependências
```

## 🎯 Princípios

### KISS (Keep It Simple, Stupid)

- Uma configuração por ferramenta
- Estrutura de pastas simples
- Scripts claros e diretos

### YAGNI (You Aren't Gonna Need It)

- Apenas configurações essenciais
- Sem over-engineering
- Funcionalidades básicas funcionais

## 🚀 Comandos

### Testes Unitários

```bash
bun run test:unit              # Executar testes unitários
bun run test:unit --watch      # Watch mode
```

### Testes de Integração

```bash
bun run test:integration       # Executar testes de integração
```

### Testes E2E

```bash
bun run test:e2e              # Executar testes E2E
bun run test:e2e:ui           # Interface do Playwright
```

### Qualidade

```bash
bun run lint                  # Verificar código
bun run format                # Formatar código
bun run test:coverage         # Cobertura de testes
```

### Pipelines

```bash
bun run validate              # Validação rápida
bun run ci                    # Pipeline completa CI
```

## 🔧 Configuração

### Vitest

- Configuração global em `configs/vitest.config.ts`
- Setup em `fixtures/setup.ts`
- Aliases para imports facilitados

### Playwright

- Configuração em `configs/playwright.config.ts`
- Browsers essenciais (Chrome, Firefox, Safari, Mobile)
- Relatórios em `../../reports/playwright`

### Qualidade

- **dprint**: Formatação consistente
- **oxlint**: Linting rápido e eficiente

## 🏥 Healthcare Specific

### Matchers Customizados

```typescript
expect(data).toBeValidHealthcareData()
```

### Mock Factories

```typescript
createMockUser({ role: 'patient' })
createMockAppointment({ date: new Date() })
createMockClinic({ cnpj: '12345678000123' })
```

### Compliance

- Testes LGPD automáticos
- Validações ANVISA
- Padrões CFM para telemedicina

## 📊 Relatórios

- **Coverage**: `../../coverage/`
- **Playwright**: `../../reports/playwright/`
- **Logs**: Console durante desenvolvimento

## 🔄 Migração

Para migrar testes existentes:

1. Copiar arquivos de teste para as pastas apropriadas
2. Ajustar imports usando os aliases
3. Usar os mock factories quando possível
4. Executar `bun run validate` para verificar

## 🎯 Objetivos

- ✅ Reduzir duplicação de configurações
- ✅ Centralizar utilitários de teste
- ✅ Simplificar execução de testes
- ✅ Melhorar performance dos testes
- ✅ Facilitar manutenção

---

> **Menos é mais**: Uma estrutura simples e eficiente para testes de qualidade.
