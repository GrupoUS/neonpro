# 🚀 Guia de Tasks e Debug do VS Code (Sem Extensões)

## 📋 Como usar as Tasks

### Executar Tasks
1. **Ctrl+Shift+P** → "Tasks: Run Task"
2. Selecione a task desejada
3. Ou use **Ctrl+Shift+P** → "Terminal: Run Active File" para algumas tasks específicas

### Tasks disponíveis por categoria:

#### 🎯 BIOME (Formatação e Linting)
- **🎯 NEONPRO: Format Code** - Formatar todo o código
- **🎯 NEONPRO: Check Code** - Verificar linting/formatação
- **🎯 NEONPRO: Fix Code** - Corrigir automaticamente
- **🎯 NEONPRO: Check Current File** - Verificar arquivo atual

#### 🧪 VITEST (Testes Unitários)
- **🧪 NEONPRO: Run All Tests** - Todos os testes
- **🧪 NEONPRO: Watch Tests** - Modo watch
- **🧪 NEONPRO: Run Current Test File** - Arquivo atual
- **🧪 NEONPRO: Test Coverage** - Com coverage
- **🧪 NEONPRO: Run Unit Tests** - Só testes unitários
- **🧪 NEONPRO: Run Integration Tests** - Só testes de integração

#### 🎭 PLAYWRIGHT (Testes E2E)
- **🎭 NEONPRO: Run All E2E Tests** - Todos os E2E
- **🎭 NEONPRO: Run E2E Tests (Headed)** - Com browser visível
- **🎭 NEONPRO: Run E2E Tests (Debug Mode)** - Modo debug
- **🎭 NEONPRO: Run Current E2E Test File** - Arquivo atual
- **🎭 NEONPRO: Run E2E Tests (UI Mode)** - Interface gráfica
- **🎭 NEONPRO: Show Last Test Report** - Relatório HTML
- **🎭 NEONPRO: Install Playwright Browsers** - Instalar browsers

## 🐛 Como usar o Debug

### Iniciar Debug
1. **F5** (inicia o debug padrão)
2. **Ctrl+Shift+D** → Selecionar configuração → **F5**
3. **Ctrl+Shift+P** → "Debug: Start Debugging"

### Configurações de Debug disponíveis:

#### 🐛 NODE.JS
- **🐛 Debug API Server** - API do Hono
- **🐛 Debug Next.js App** - Aplicação web
- **🐛 Attach to API Server** - Anexar a processo rodando

#### 🧪 VITEST
- **🧪 Debug All Vitest Tests** - Todos os testes
- **🧪 Debug Current Test File** - Arquivo atual
- **🧪 Debug Vitest (Watch Mode)** - Modo watch
- **🧪 Debug Unit Tests Only** - Só unitários
- **🧪 Debug Integration Tests Only** - Só integração

#### 🎭 PLAYWRIGHT
- **🎭 Debug All Playwright Tests** - Todos os E2E
- **🎭 Debug Current Playwright Test** - Arquivo atual
- **🎭 Debug Playwright (Headed)** - Com browser visível

#### 🎯 BIOME
- **🎯 Debug Biome Check** - Debug do linting
- **🎯 Debug Biome Format** - Debug da formatação
- **🎯 Debug Biome Current File** - Debug arquivo atual

## 🔧 Atalhos Úteis

### Tasks
- **Ctrl+Shift+P** → "Tasks: Run Task"
- **Ctrl+Shift+P** → "Tasks: Rerun Last Task"
- **Ctrl+Shift+P** → "Tasks: Terminate Task"

### Debug
- **F5** - Iniciar/continuar debug
- **Shift+F5** - Parar debug
- **Ctrl+Shift+F5** - Reiniciar debug
- **F9** - Toggle breakpoint
- **F10** - Step over
- **F11** - Step into
- **Shift+F11** - Step out

### Terminal
- **Ctrl+Shift+`** - Novo terminal
- **Ctrl+`** - Toggle terminal

## 💡 Dicas

### Para Testes
1. **Arquivo específico**: Abra o arquivo e use "Run Current Test File"
2. **Debug específico**: Use "Debug Current Test File" com breakpoints
3. **Watch mode**: Use para desenvolvimento contínuo
4. **Coverage**: Use para verificar cobertura de testes

### Para Desenvolvimento
1. **Format on save**: Já configurado no settings.json
2. **Debug API**: Use "Debug API Server" para desenvolvimento backend
3. **Debug Web**: Use "Debug Next.js App" para desenvolvimento frontend

### Para E2E
1. **Headed mode**: Para ver o que está acontecendo
2. **UI mode**: Para interface gráfica completa
3. **Debug mode**: Para investigar falhas

## 🚨 Sem Extensões Necessárias!

Todas as funcionalidades funcionam apenas com:
- ✅ VS Code (editor base)
- ✅ Tasks configuradas
- ✅ Launch configurations
- ✅ CLI tools via npx

**Não precisa de:**
- ❌ Extensão Vitest
- ❌ Extensão Playwright
- ❌ Extensão Biome (além do formatador já configurado)