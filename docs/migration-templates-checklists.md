# 📋 Templates e Checklists - Migração NeonPro

## Ferramentas Práticas para Execução do Projeto

---

## 🎯 Templates de Tarefas

### 📝 Template: Task Definition

```markdown
## Task: [TASK_ID] - [TASK_NAME]

### 📋 Informações Básicas

- **Responsável**: [Nome]
- **Sprint**: [Sprint Number]
- **Estimativa**: [Horas]
- **Prioridade**: [Alta/Média/Baixa]
- **Status**: [Not Started/In Progress/Review/Done]

### 🎯 Objetivo

[Descrição clara do que deve ser alcançado]

### 📋 Critérios de Aceitação

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### 🔗 Dependências

- **Depende de**: [Task IDs]
- **Bloqueia**: [Task IDs]

### 📚 Recursos Necessários

- [Recurso 1]
- [Recurso 2]

### ✅ Definition of Done

- [ ] Código implementado
- [ ] Testes unitários criados
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Deploy em staging realizado

### 📝 Notas

[Observações adicionais]
```

### 🐛 Template: Bug Report

```markdown
## Bug: [BUG_ID] - [BUG_TITLE]

### 🔍 Descrição

[Descrição detalhada do bug]

### 🔄 Passos para Reproduzir

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

### ✅ Comportamento Esperado

[O que deveria acontecer]

### ❌ Comportamento Atual

[O que está acontecendo]

### 🌐 Ambiente

- **Browser**: [Chrome/Firefox/Safari]
- **Versão**: [Versão do sistema]
- **OS**: [Windows/Mac/Linux]

### 📸 Screenshots/Logs

[Anexar evidências]

### 🎯 Prioridade

- [ ] Critical (Sistema inoperante)
- [ ] High (Funcionalidade principal afetada)
- [ ] Medium (Funcionalidade secundária afetada)
- [ ] Low (Cosmético/Melhoria)
```

---

## ✅ Checklists por Fase

### 🔧 FASE 1: Preparação e Setup

#### Sprint 1.1: Configuração de Ambiente

```markdown
### ✅ Checklist: Configuração de Ambiente

#### 🔧 Setup Inicial

- [ ] Branch `migration/fsd-ddd` criado
- [ ] Proteções de branch configuradas
- [ ] Permissões de acesso definidas
- [ ] Ambiente local configurado para todos os devs

#### 📦 pnpm/Turborepo

- [ ] `pnpm-workspace.yaml` otimizado
- [ ] `turbo.json` configurado para nova estrutura
- [ ] Scripts de build otimizados
- [ ] Cache de build configurado
- [ ] Tempo de build reduzido em 20%

#### 🔍 Linting e Formatação

- [ ] ESLint configurado para FSD
- [ ] Prettier configurado
- [ ] Regras de import/export definidas
- [ ] Pre-commit hooks configurados
- [ ] Todos os arquivos passando no lint

#### 🧪 Testes

- [ ] Jest configurado
- [ ] Testing Library configurado
- [ ] Cypress configurado para E2E
- [ ] Coverage reports configurados
- [ ] Pipeline de testes funcionando

#### 📚 Storybook

- [ ] Storybook configurado
- [ ] Componentes existentes documentados
- [ ] Addons essenciais instalados
- [ ] Build de Storybook funcionando
```

#### Sprint 1.2: Documentação e Planejamento

```markdown
### ✅ Checklist: Documentação e Planejamento

#### 📖 Documentação

- [ ] Guia de migração FSD criado
- [ ] Guia de migração DDD criado
- [ ] Convenções de código documentadas
- [ ] Estrutura de pastas documentada
- [ ] Exemplos práticos criados

#### 🏗️ Arquitetura

- [ ] Bounded contexts identificados
- [ ] Diagrama de dependências criado
- [ ] Interfaces entre contextos definidas
- [ ] Estratégia de migração definida

#### 🛠️ Templates

- [ ] Template de Entity criado
- [ ] Template de Service criado
- [ ] Template de Repository criado
- [ ] Template de Feature criado
- [ ] Template de Widget criado

#### 📊 Monitoramento

- [ ] Dashboard de progresso configurado
- [ ] Métricas de qualidade definidas
- [ ] Alertas configurados
- [ ] Relatórios automatizados
```

### 🏛️ FASE 2: Migração Backend - DDD

#### Sprint 2.1: Estrutura Base DDD

```markdown
### ✅ Checklist: Estrutura Base DDD

#### 📁 Estrutura de Pastas

- [ ] `/packages/domain` criado
- [ ] `/packages/domain/shared` criado
- [ ] `/packages/domain/patient` criado
- [ ] `/packages/domain/appointment` criado
- [ ] `/packages/domain/professional` criado

#### 🏗️ Value Objects

- [ ] CPF Value Object implementado
- [ ] Email Value Object implementado
- [ ] Phone Value Object implementado
- [ ] Address Value Object implementado
- [ ] Testes unitários para VOs

#### 🎯 Entities Base

- [ ] Base Entity class criada
- [ ] Patient Entity implementada
- [ ] Professional Entity implementada
- [ ] Appointment Entity implementada
- [ ] Testes unitários para Entities

#### 🔄 Repository Interfaces

- [ ] IPatientRepository definida
- [ ] IProfessionalRepository definida
- [ ] IAppointmentRepository definida
- [ ] Base repository interface criada

#### 📡 Domain Events

- [ ] Event base class criada
- [ ] Event dispatcher implementado
- [ ] Patient events definidos
- [ ] Appointment events definidos
- [ ] Testes de eventos
```

#### Sprint 2.2: Bounded Context - Patient Management

```markdown
### ✅ Checklist: Patient Management Context

#### 🏥 Domain Layer

- [ ] Patient aggregate implementado
- [ ] Patient domain services criados
- [ ] Patient business rules implementadas
- [ ] Patient domain events definidos

#### 🔧 Application Layer

- [ ] Patient use cases implementados
- [ ] Patient DTOs criados
- [ ] Patient command handlers criados
- [ ] Patient query handlers criados

#### 💾 Infrastructure Layer

- [ ] Patient repository implementado
- [ ] Patient data mappers criados
- [ ] Database migrations criadas
- [ ] External service adapters

#### 🔒 LGPD Compliance

- [ ] Consent management implementado
- [ ] Data anonymization implementada
- [ ] Audit trail configurado
- [ ] Right to be forgotten implementado
- [ ] Data export functionality

#### 🧪 Testes

- [ ] Unit tests (≥90% coverage)
- [ ] Integration tests
- [ ] Domain tests
- [ ] Repository tests
```

### 🎨 FASE 3: Migração Frontend - FSD

#### Sprint 3.1: Estrutura Base FSD

```markdown
### ✅ Checklist: Estrutura Base FSD

#### 📁 Layers Structure

- [ ] `/src/app` layer criado
- [ ] `/src/pages` layer criado
- [ ] `/src/widgets` layer criado
- [ ] `/src/features` layer criado
- [ ] `/src/entities` layer criado
- [ ] `/src/shared` layer criado

#### 🔄 Shared Layer

- [ ] UI components migrados
- [ ] Utils functions migradas
- [ ] Constants migradas
- [ ] Types migrados
- [ ] API clients migrados

#### 🎯 Entities Layer

- [ ] Patient entity migrada
- [ ] Appointment entity migrada
- [ ] Professional entity migrada
- [ ] Treatment entity migrada

#### 📦 Barrel Exports

- [ ] Index files criados
- [ ] Public API definida
- [ ] Import/export otimizados
- [ ] Circular dependencies verificadas

#### 🛣️ Path Mapping

- [ ] TypeScript paths configurados
- [ ] Webpack aliases configurados
- [ ] Import absolutos funcionando
- [ ] IDE autocomplete funcionando
```

---

## 🧪 Checklists de Qualidade

### ✅ Code Review Checklist

```markdown
### 🔍 Code Review Checklist

#### 📋 Geral

- [ ] Código segue as convenções do projeto
- [ ] Nomes de variáveis/funções são descritivos
- [ ] Código está bem documentado
- [ ] Não há código comentado desnecessário
- [ ] Não há console.logs esquecidos

#### 🏗️ Arquitetura

- [ ] Segue os princípios FSD/DDD
- [ ] Responsabilidades bem definidas
- [ ] Baixo acoplamento
- [ ] Alta coesão
- [ ] Não viola regras de dependência

#### 🔒 Segurança

- [ ] Não expõe dados sensíveis
- [ ] Validação de entrada implementada
- [ ] Sanitização de dados
- [ ] Autenticação/autorização verificada
- [ ] Não há vulnerabilidades conhecidas

#### 🧪 Testes

- [ ] Testes unitários criados
- [ ] Casos de teste cobrem cenários principais
- [ ] Mocks apropriados utilizados
- [ ] Testes são determinísticos
- [ ] Coverage adequado

#### 🚀 Performance

- [ ] Não há vazamentos de memória
- [ ] Operações custosas otimizadas
- [ ] Lazy loading implementado onde apropriado
- [ ] Bundle size considerado
```

### ✅ Testing Checklist

```markdown
### 🧪 Testing Checklist

#### 🔬 Unit Tests

- [ ] Todas as funções públicas testadas
- [ ] Edge cases cobertos
- [ ] Error handling testado
- [ ] Mocks apropriados
- [ ] Coverage ≥ 90%

#### 🔗 Integration Tests

- [ ] APIs testadas
- [ ] Database interactions testadas
- [ ] External services mockados
- [ ] Error scenarios testados

#### 🎭 E2E Tests

- [ ] User journeys principais testados
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Performance testing

#### 🔒 Security Tests

- [ ] Authentication flows testados
- [ ] Authorization verificada
- [ ] Input validation testada
- [ ] XSS/CSRF protection verificada
```

---

## 📊 Templates de Relatórios

### 📈 Template: Relatório Semanal

```markdown
# Relatório Semanal - Migração NeonPro

**Semana**: [Número] | **Período**: [Data início] - [Data fim]

## 📊 Resumo Executivo

- **Progresso Geral**: [X]% completo
- **Status**: [On Track/At Risk/Delayed]
- **Próximo Marco**: [Marco] em [Data]

## ✅ Conquistas da Semana

- [Conquista 1]
- [Conquista 2]
- [Conquista 3]

## 🎯 Metas para Próxima Semana

- [Meta 1]
- [Meta 2]
- [Meta 3]

## ⚠️ Riscos e Bloqueadores

| Risco     | Impacto            | Probabilidade      | Ação   |
| --------- | ------------------ | ------------------ | ------ |
| [Risco 1] | [Alto/Médio/Baixo] | [Alta/Média/Baixa] | [Ação] |

## 📈 Métricas

- **Velocity**: [Story Points]
- **Bug Rate**: [Bugs/Sprint]
- **Test Coverage**: [%]
- **Build Time**: [Minutos]

## 👥 Equipe

- **Disponibilidade**: [%]
- **Moral**: [Alto/Médio/Baixo]
- **Necessidades**: [Lista]

## 💰 Orçamento

- **Gasto Acumulado**: R$ [Valor]
- **Orçamento Restante**: R$ [Valor]
- **Projeção**: [On Budget/Over Budget]
```

### 🔧 Template: Relatório Técnico

```markdown
# Relatório Técnico Diário

**Data**: [Data] | **Sprint**: [Sprint]

## ✅ Tasks Completadas

- [Task ID] - [Descrição] - [Responsável]
- [Task ID] - [Descrição] - [Responsável]

## 🚧 Em Progresso

- [Task ID] - [Descrição] - [Responsável] - [% Completo]

## 🚫 Bloqueadores

- [Bloqueador] - [Impacto] - [Ação Necessária]

## 📊 Métricas do Dia

- **Commits**: [Número]
- **PRs Merged**: [Número]
- **Tests Added**: [Número]
- **Bugs Fixed**: [Número]

## 🔍 Code Review Status

- **PRs Pending Review**: [Número]
- **PRs Approved**: [Número]
- **Average Review Time**: [Horas]

## 🧪 Test Results

- **Unit Tests**: [Passed/Total]
- **Integration Tests**: [Passed/Total]
- **E2E Tests**: [Passed/Total]
- **Coverage**: [%]

## 🚀 Deployment Status

- **Staging**: [Status]
- **Production**: [Status]
- **Issues**: [Lista]
```

---

## 🎯 Checklists de Deploy

### ✅ Pre-Deploy Checklist

```markdown
### 🚀 Pre-Deploy Checklist

#### 🧪 Testes

- [ ] Todos os testes unitários passando
- [ ] Todos os testes de integração passando
- [ ] Testes E2E executados com sucesso
- [ ] Performance tests aprovados
- [ ] Security scan aprovado

#### 📋 Code Quality

- [ ] Code review aprovado
- [ ] Lint checks passando
- [ ] Coverage ≥ 90%
- [ ] No critical/high severity issues

#### 🔒 Segurança

- [ ] Dependency scan aprovado
- [ ] No secrets expostos
- [ ] HTTPS configurado
- [ ] Security headers configurados

#### 📚 Documentação

- [ ] README atualizado
- [ ] API docs atualizadas
- [ ] Changelog atualizado
- [ ] Migration guides criados

#### 🔧 Configuração

- [ ] Environment variables configuradas
- [ ] Database migrations testadas
- [ ] Feature flags configuradas
- [ ] Monitoring configurado

#### 📦 Build

- [ ] Build de produção funcionando
- [ ] Assets otimizados
- [ ] Bundle size verificado
- [ ] Source maps configurados
```

### ✅ Post-Deploy Checklist

```markdown
### 📊 Post-Deploy Checklist

#### 🔍 Verificação Imediata (0-15 min)

- [ ] Application está respondendo
- [ ] Health checks passando
- [ ] Login funcionando
- [ ] Funcionalidades críticas testadas
- [ ] No errors nos logs

#### 📈 Monitoramento (15-60 min)

- [ ] Métricas de performance normais
- [ ] Error rate dentro do esperado
- [ ] Response time aceitável
- [ ] Database performance normal
- [ ] Memory usage estável

#### 👥 Validação de Usuário (1-24h)

- [ ] Feedback de usuários coletado
- [ ] Support tickets monitorados
- [ ] User analytics verificadas
- [ ] A/B tests configurados (se aplicável)

#### 📋 Documentação

- [ ] Deploy notes documentadas
- [ ] Issues conhecidas documentadas
- [ ] Rollback plan atualizado
- [ ] Team notificado
```

---

## 🛠️ Scripts e Automações

### 🔧 Script: Verificação de Estrutura FSD

```bash
#!/bin/bash
# check-fsd-structure.sh

echo "🔍 Verificando estrutura FSD..."

# Verificar layers obrigatórias
LAYERS=("app" "pages" "widgets" "features" "entities" "shared")

for layer in "${LAYERS[@]}"; do
    if [ -d "src/$layer" ]; then
        echo "✅ Layer $layer encontrada"
    else
        echo "❌ Layer $layer não encontrada"
        exit 1
    fi
done

# Verificar barrel exports
echo "🔍 Verificando barrel exports..."
find src -name "index.ts" -o -name "index.js" | while read file; do
    if [ -s "$file" ]; then
        echo "✅ $file tem exports"
    else
        echo "⚠️  $file está vazio"
    fi
done

echo "✅ Verificação de estrutura FSD concluída"
```

### 🧪 Script: Verificação de Testes

```bash
#!/bin/bash
# check-tests.sh

echo "🧪 Verificando cobertura de testes..."

# Executar testes com coverage
npm run test:coverage

# Verificar threshold
COVERAGE=$(npm run test:coverage --silent | grep "All files" | awk '{print $10}' | sed 's/%//')

if [ "$COVERAGE" -ge 90 ]; then
    echo "✅ Cobertura de testes: $COVERAGE% (≥90%)"
else
    echo "❌ Cobertura de testes: $COVERAGE% (<90%)"
    exit 1
fi

echo "✅ Verificação de testes concluída"
```

---

## 📋 Checklists de Compliance

### ✅ LGPD Compliance Checklist

```markdown
### 🔒 LGPD Compliance Checklist

#### 📋 Consentimento

- [ ] Formulário de consentimento implementado
- [ ] Opt-in explícito para coleta de dados
- [ ] Granularidade de consentimento
- [ ] Histórico de consentimentos armazenado
- [ ] Revogação de consentimento implementada

#### 🔍 Transparência

- [ ] Política de privacidade atualizada
- [ ] Finalidade da coleta explicada
- [ ] Tempo de retenção informado
- [ ] Direitos do titular informados
- [ ] Contato do DPO disponível

#### 🛡️ Segurança

- [ ] Dados pessoais criptografados
- [ ] Acesso baseado em roles
- [ ] Logs de acesso implementados
- [ ] Backup seguro configurado
- [ ] Incident response plan criado

#### 📊 Direitos do Titular

- [ ] Acesso aos dados implementado
- [ ] Portabilidade de dados implementada
- [ ] Correção de dados implementada
- [ ] Exclusão de dados implementada
- [ ] Oposição ao tratamento implementada

#### 📝 Documentação

- [ ] Registro de atividades de tratamento
- [ ] Relatório de impacto (RIPD) se necessário
- [ ] Contratos com fornecedores atualizados
- [ ] Procedimentos internos documentados
```

### ✅ ANVISA Compliance Checklist

```markdown
### 🏥 ANVISA Compliance Checklist

#### 📋 Registro de Procedimentos

- [ ] Procedimentos estéticos catalogados
- [ ] Profissionais habilitados verificados
- [ ] Equipamentos registrados na ANVISA
- [ ] Produtos utilizados registrados
- [ ] Protocolos de segurança implementados

#### 📊 Rastreabilidade

- [ ] Histórico completo de procedimentos
- [ ] Lote de produtos rastreável
- [ ] Cadeia de custódia documentada
- [ ] Eventos adversos reportáveis
- [ ] Recall de produtos implementado

#### 🔒 Segurança do Paciente

- [ ] Consentimento informado obrigatório
- [ ] Contraindicações verificadas
- [ ] Protocolos de emergência definidos
- [ ] Qualificação profissional validada
- [ ] Ambiente adequado verificado

#### 📝 Documentação Regulatória

- [ ] Licenças atualizadas
- [ ] Certificações válidas
- [ ] Relatórios de farmacovigilância
- [ ] Auditorias internas realizadas
- [ ] Não conformidades tratadas
```

---

## 🎓 Materiais de Treinamento

### 📚 Guia Rápido: FSD

```markdown
# 🎯 Guia Rápido: Feature-Sliced Design

## 🏗️ Estrutura de Layers

### 📱 App Layer

- **Propósito**: Configuração global da aplicação
- **Contém**: Providers, routing, configurações
- **Exemplo**: `src/app/providers/StoreProvider.tsx`

### 📄 Pages Layer

- **Propósito**: Páginas da aplicação
- **Contém**: Componentes de página, routing
- **Exemplo**: `src/pages/PatientListPage/index.tsx`

### 🧩 Widgets Layer

- **Propósito**: Componentes complexos e independentes
- **Contém**: Widgets reutilizáveis
- **Exemplo**: `src/widgets/PatientCard/index.tsx`

### ⚡ Features Layer

- **Propósito**: Funcionalidades de negócio
- **Contém**: Use cases, business logic
- **Exemplo**: `src/features/CreatePatient/index.tsx`

### 🎯 Entities Layer

- **Propósito**: Entidades de negócio
- **Contém**: Models, types, stores
- **Exemplo**: `src/entities/Patient/model/types.ts`

### 🔧 Shared Layer

- **Propósito**: Código compartilhado
- **Contém**: UI, utils, configs, APIs
- **Exemplo**: `src/shared/ui/Button/index.tsx`

## 📏 Regras de Dependência
```

app → pages → widgets → features → entities → shared

```

- ✅ Layers superiores podem importar de inferiores
- ❌ Layers inferiores NÃO podem importar de superiores
- ❌ Imports entre slices do mesmo layer são proibidos
```

### 📚 Guia Rápido: DDD

```markdown
# 🏛️ Guia Rápido: Domain-Driven Design

## 🎯 Bounded Contexts

### 🏥 Patient Management

- **Responsabilidade**: Gestão de pacientes
- **Entities**: Patient, MedicalHistory
- **Services**: PatientService, HistoryService

### 📅 Appointment Management

- **Responsabilidade**: Agendamentos
- **Entities**: Appointment, Schedule
- **Services**: SchedulingService, NotificationService

### 👨‍⚕️ Professional Management

- **Responsabilidade**: Gestão de profissionais
- **Entities**: Professional, Specialization
- **Services**: ProfessionalService, CertificationService

## 🏗️ Estrutura de Camadas

### 🎯 Domain Layer

- **Entities**: Objetos com identidade
- **Value Objects**: Objetos sem identidade
- **Domain Services**: Lógica que não pertence a entidades
- **Domain Events**: Eventos de domínio

### ⚡ Application Layer

- **Use Cases**: Casos de uso da aplicação
- **DTOs**: Data Transfer Objects
- **Interfaces**: Contratos para infraestrutura

### 🔧 Infrastructure Layer

- **Repositories**: Implementação de persistência
- **External Services**: Integrações externas
- **Adapters**: Adaptadores para frameworks

## 📏 Regras de Dependência
```

Infrastructure → Application → Domain

```

- ✅ Domain não depende de nada
- ✅ Application depende apenas de Domain
- ✅ Infrastructure pode depender de tudo
```

---

## 📞 Contatos de Suporte

### 🆘 Escalação de Problemas

| Tipo de Problema | Primeiro Contato | Escalação       |
| ---------------- | ---------------- | --------------- |
| **Técnico**      | Tech Lead        | Architect       |
| **Processo**     | Scrum Master     | Project Manager |
| **Qualidade**    | QA Lead          | QA Manager      |
| **Deploy**       | DevOps           | SRE Lead        |
| **Negócio**      | Product Owner    | Product Manager |

### 📱 Canais de Comunicação

- **Slack**: #neonpro-migration
- **Email**: migration-team@neonpro.com
- **Jira**: [Project Link]
- **Confluence**: [Documentation Link]

---

**Documento criado em**: [Data]  
**Versão**: 1.0  
**Última atualização**: [Data]

_Este documento complementa o Plano de Projeto principal e deve ser usado como referência prática durante a execução._
