# Epic 11: Estoque Simplificado

## Overview

Epic 11 implementa o sistema de controle de estoque simplificado para clínicas estéticas, focando no essencial: gestão de produtos/materiais, controle de entradas e saídas, alertas automáticos de reposição e relatórios básicos de movimentação. Este épico visa reduzir custos operacionais, evitar desperdícios e garantir disponibilidade de materiais para procedimentos.

## Business Value

### Objetivos de Negócio

- **Controle de Custos**: Redução de 15% nos gastos com materiais através de melhor gestão
- **Disponibilidade**: Zero faltas de materiais durante procedimentos
- **Eficiência Operacional**: Redução de 60% no tempo gasto com controle manual
- **Prevenção de Perdas**: Eliminação de vencimentos não identificados
- **Otimização de Compras**: Compras baseadas em dados reais de consumo

### Métricas de Sucesso

- **Redução de Custos**: 15% redução em gastos com materiais
- **Disponibilidade**: 100% de disponibilidade para procedimentos agendados
- **Tempo de Gestão**: 60% redução no tempo de controle de estoque
- **Alertas**: Notificações de reposição em ≤60 segundos
- **Precisão**: 95% de acuracidade no controle de estoque

### ROI Esperado

- **Economia de Materiais**: R$ 5K/mês através de melhor controle
- **Redução de Desperdício**: 20% redução em vencimentos
- **Eficiência Operacional**: 10h/semana economizadas em gestão manual
- **Melhoria no Atendimento**: Zero cancelamentos por falta de material

## Architecture Integration

### Foundation Dependencies

- **Epic 1-4**: Base de sistema, autenticação e gestão de usuários
- **Epic 6**: Agenda para integração com procedimentos agendados
- **Epic 7**: Financeiro para controle de custos e fornecedores
- **Epic 8**: BI para relatórios e analytics de estoque
- **Epic 9**: Cadastro para associação de materiais a procedimentos

### Technical Architecture

- **Next.js 15**: Server Actions para movimentações e Server Components para relatórios
- **Supabase**: Real-time subscriptions para alertas automáticos e RLS para controle multitenancy
- **Background Jobs**: Processamento de alertas de reposição e cálculos de consumo
- **File Storage**: Upload de notas fiscais e comprovantes de compra

### Inventory Architecture

- **Modelo ABC**: Classificação de produtos por importância e valor
- **FIFO**: Controle de validade e rotatividade de estoque
- **Pontos de Reposição**: Cálculo automático baseado em consumo médio
- **Integração Procedimental**: Baixa automática baseada em procedimentos realizados

## Stories Overview

### Story 11.1: Cadastro e Gestão de Produtos

Sistema completo de cadastro de produtos e materiais com categorização, informações de fornecedores, especificações técnicas e controle de validade.

**Key Features:**

- Cadastro de produtos com códigos, descrições e especificações
- Categorização por tipo (consumível, instrumental, medicamento)
- Gestão de fornecedores e preços por fornecedor
- Controle de validade e lotes
- Upload de fichas técnicas e certificados

### Story 11.2: Controle de Entradas e Compras

Sistema para registro de entradas de materiais, integração com notas fiscais, controle de custos e validação de recebimento.

**Key Features:**

- Registro de entradas manuais e por upload de NF
- Controle de lotes e validades
- Cálculo automático de custos médios
- Validação de recebimento vs. pedido
- Histórico completo de compras por produto

### Story 11.3: Controle de Saídas e Consumo

Sistema para baixa de estoque por consumo em procedimentos, controle manual de saídas e rastreabilidade de uso de materiais.

**Key Features:**

- Baixa automática por procedimento realizado
- Saídas manuais com justificativa
- Controle de consumo por procedimento/profissional
- Rastreabilidade de lotes utilizados
- Ajustes de estoque com auditoria

### Story 11.4: Alertas e Relatórios de Estoque

Sistema de alertas automáticos para reposição, relatórios de movimentação, analytics de consumo e dashboard de controle.

**Key Features:**

- Alertas automáticos de estoque baixo/mínimo
- Dashboard em tempo real de situação do estoque
- Relatórios de movimentação e consumo
- Analytics de curva ABC e giro de estoque
- Projeções de necessidade de compra

## Integration Points

### Epic 6 Integration (Agenda Inteligente)

- **Baixa Automática**: Consumo automático baseado em procedimentos realizados
- **Previsão de Uso**: Estimativa de consumo baseada em agenda futura
- **Bloqueio de Agendamento**: Impedimento de agendar sem material disponível
- **Notificações**: Alertas de falta de material para procedimentos agendados

### Epic 7 Integration (Financeiro Essencial)

- **Controle de Custos**: Integração com contas a pagar para compras
- **Fornecedores**: Gestão unificada de fornecedores
- **Controle de NF**: Registro de notas fiscais e impostos
- **Analytics Financeiro**: Impacto do estoque no fluxo de caixa

### Epic 8 Integration (BI & Dashboards)

- **KPIs de Estoque**: Métricas de giro, dias de estoque, custos
- **Relatórios Gerenciais**: Análises de consumo e compras
- **Tendências**: Identificação de padrões de consumo
- **Dashboards**: Visualizações em tempo real do estoque

### Epic 9 Integration (Cadastro & Prontuário)

- **Materiais por Procedimento**: Associação de materiais a tipos de procedimento
- **Protocolos de Uso**: Definição de consumo padrão por procedimento
- **Rastreabilidade Médica**: Histórico de materiais utilizados por paciente
- **Compliance**: Controle de materiais médicos e regulamentações

### External Integrations

- **Fornecedores**: APIs para consulta de preços e disponibilidade
- **NFe**: Integração com SEFAZ para validação de notas fiscais
- **ERP**: Conectores para sistemas de gestão existentes
- **Marketplace**: Integração com plataformas de compra B2B

## Technical Requirements

### Performance

- **Real-time Alerts**: Notificações de estoque baixo em ≤60 segundos
- **Dashboard Load**: Carregamento de dashboard ≤3 segundos
- **Report Generation**: Relatórios de movimentação ≤5 segundos
- **Product Search**: Busca de produtos ≤1 segundo

### Scalability

- **Product Volume**: Suporte a 10K+ produtos por clínica
- **Transaction Volume**: 1K+ movimentações/dia
- **Concurrent Users**: 50+ usuários simultâneos
- **Data Retention**: 5 anos de histórico de movimentações

### Compliance & Accuracy

- **Inventory Accuracy**: 95% de acuracidade no controle
- **Audit Trail**: Rastro completo de todas as movimentações
- **FIFO Compliance**: Controle rigoroso de validades
- **Regulatory**: Compliance com regulamentações de materiais médicos

## Definition of Done

### Epic 11 Completion Criteria

- [ ] Todas as 4 stories implementadas e testadas
- [ ] Sistema de alertas funcionando em ≤60s
- [ ] Controle de entradas e saídas 100% funcional
- [ ] Dashboard de estoque em tempo real
- [ ] Integração completa com Epic 6-9
- [ ] Acuracidade de estoque ≥95%
- [ ] Documentação técnica e de usuário completa
- [ ] Testes de performance aprovados

### Quality Gates

- [ ] Coverage de testes ≥85% (transações críticas)
- [ ] Performance conforme especificações
- [ ] Acuracidade de estoque validada
- [ ] Integração com agenda testada
- [ ] User acceptance testing ≥4.0/5.0
- [ ] Training da equipe completado

### Business Validation

- [ ] Cadastro de produto ≤2 minutos
- [ ] Entrada/saída ≤3 cliques
- [ ] Alertas funcionando automaticamente
- [ ] Relatórios gerados em ≤5 segundos
- [ ] 15% redução de custos em 90 dias
- [ ] Zero faltas de material em procedimentos

## Dependencies & Risks

### Internal Dependencies

- **Epic 1-4**: Base de sistema e autenticação (Done)
- **Epic 6**: Agenda para baixa automática (Done)
- **Epic 7**: Financeiro para custos e fornecedores (Done)
- **Epic 8**: BI para relatórios de estoque (Done)
- **Epic 9**: Cadastro para materiais por procedimento (Done)

### External Dependencies

- **Fornecedores**: APIs de consulta de preços e estoque
- **NFe/SEFAZ**: Integração para validação fiscal
- **Regulamentações**: Compliance com ANVISA para materiais médicos
- **Hardware**: Leitores de código de barras (opcional)

### Technical Risks

- **Accuracy**: Divergências entre estoque físico e sistema
- **Integration**: Complexidade de baixa automática por procedimento
- **Performance**: Queries lentas em histórico extenso
- **Regulatory**: Complexidade das regulamentações médicas

### Mitigation Strategies

- **Accuracy**: Inventários periódicos e ajustes auditados
- **Integration**: Testes extensivos de baixa automática
- **Performance**: Indexação otimizada e arquivamento de dados antigos
- **Regulatory**: Consultoria especializada em regulamentações médicas

## Success Metrics

### Operational Performance

- **Alert Speed**: Notificações de reposição ≤60 segundos
- **Dashboard Load**: Interface de estoque ≤3 segundos
- **Transaction Speed**: Entrada/saída ≤5 segundos
- **Search Performance**: Busca de produtos ≤1 segundo

### Business Impact

- **Cost Reduction**: 15% redução em gastos com materiais
- **Stock Accuracy**: 95% acuracidade no controle
- **Zero Stockouts**: Nenhuma falta para procedimentos agendados
- **Time Savings**: 60% redução em tempo de gestão manual

### Technical Performance

- **System Availability**: 99.9% uptime para transações
- **Data Accuracy**: ≤1% divergência em inventários
- **Integration Success**: 95% sucesso em baixas automáticas
- **Report Generation**: Relatórios em ≤5 segundos

## Timeline & Priorities

### Development Sequence

1. **Story 11.1**: Cadastro e Gestão de Produtos (Foundation)
2. **Story 11.2**: Controle de Entradas e Compras (Input Control)
3. **Story 11.3**: Controle de Saídas e Consumo (Output Control)
4. **Story 11.4**: Alertas e Relatórios (Analytics & Monitoring)

### Critical Path

- Story 11.1 é prerequisito para todas as outras
- Story 11.2 e 11.3 podem ser desenvolvidas em paralelo após 11.1
- Story 11.4 depende da implementação de entradas e saídas

### Go-Live Strategy

- **Phase 1**: Cadastro de produtos e entradas manuais
- **Phase 2**: Controle de saídas e baixa manual
- **Phase 3**: Integração com agenda para baixa automática
- **Phase 4**: Alertas automáticos e relatórios avançados

## Inventory Management Considerations

### Product Categories

- **Consumíveis**: Materiais de uso único (seringas, gases, cremes)
- **Instrumentais**: Equipamentos reutilizáveis (pinças, bisturis)
- **Medicamentos**: Produtos farmacêuticos com controle especial
- **Cosméticos**: Produtos para venda e uso em procedimentos

### Stock Control Methods

- **ABC Analysis**: Classificação por valor e importância
- **FIFO**: Primeiro que vence, primeiro que sai
- **Min/Max**: Pontos de reposição automáticos
- **Safety Stock**: Estoque de segurança para itens críticos

### Compliance Framework

- **ANVISA**: Regulamentações para materiais médicos
- **Vigilância Sanitária**: Controle de medicamentos e materiais
- **Audit Trail**: Rastreabilidade completa para inspeções
- **Lot Tracking**: Controle de lotes para recalls

## Status

APPROVED - ENHANCED

## Enhancement Package 2025
- 🤖 **AI Inventory Management**: Gestão inteligente de estoque
- 📊 **Predictive Restocking**: Reposição preditiva automática
- 🔍 **Smart Alerts**: Alertas inteligentes de baixo estoque
- 📈 **Cost Optimization**: Otimização de custos por IA

---

## Next Steps

Epic 11 complementa o NeonPro com controle de estoque essencial para operação eficiente de clínicas estéticas. Construindo sobre a foundation sólida dos Epic 1-10, adiciona controle de custos e gestão de materiais para completar a suite operacional.

**Ready for Story Creation**: Epic 11 está pronto para desenvolvimento das stories 11.1-11.4 seguindo os padrões BMad e foco em eficiência operacional e controle de custos.
