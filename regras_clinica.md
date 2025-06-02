# NeonPro - Regras e Especificações do Projeto

## 1. Visão Geral do Projeto

**NeonPro** é uma plataforma SaaS abrangente para gestão de clínicas de estética, desenvolvida para resolver os principais pain points identificados no setor. A plataforma deve ser uma solução "All-in-One" que centraliza informações, automatiza processos e fornece insights estratégicos para gestores de clínicas de estética.

### Tecnologias Obrigatórias
- **Backend/Database**: Supabase (obrigatório para todas as operações de dados)
- **Frontend**: React + TypeScript + Vite
- **UI Kit**: Horizon UI (fonte da verdade para design)
- **Styling**: Tailwind CSS + daisyUI
- **Idioma**: Português Brasileiro

## 2. Pain Points Identificados

### 2.1 Gestão Ineficiente e Desorganização
- Rotina caótica com pacientes insatisfeitos
- Informações desorganizadas e gastos desnecessários
- Processos manuais levando a falhas e retrabalho
- Acúmulo de tarefas e esquecimento de detalhes importantes

### 2.2 Problemas Financeiros e de Controle
- Deficiência no controle financeiro (principal causa de falência)
- Falta de controle de fluxo de caixa
- Dificuldade em identificar clientes inadimplentes
- Problemas com obrigações fiscais
- Gestão complexa de comissões

### 2.3 Desafios na Captação e Retenção de Clientes
- Dificuldade em conquistar novos pacientes
- Perda de clientes por falta de atendimento personalizado
- Falta de controle da agenda
- Altas taxas de no-shows
- Dificuldade em vender pacotes de serviços

### 2.4 Gestão de Processos e Equipe
- Processos internos mal definidos
- Problemas no controle de estoque
- Falta de treinamento da equipe
- Dificuldade na gestão de documentação

### 2.5 Desafios Tecnológicos
- Dependência de múltiplos sistemas
- Falta de integração entre ferramentas
- Dificuldade em encontrar software escalável

## 3. Funcionalidades Core do MVP

### 3.1 Plataforma All-in-One
- Centralização de todas as operações em uma única plataforma
- Interface unificada para diferentes módulos
- Dados sincronizados em tempo real

### 3.2 Agendamento Online
- Sistema de agendamento 24/7 para pacientes
- Controle de disponibilidade em tempo real
- Notificações automáticas e lembretes
- Gestão de no-shows

### 3.3 Prontuário Eletrônico
- Digitalização de fichas de anamnese
- Histórico completo do paciente
- Segurança e conformidade com LGPD
- Integração com IA para otimização

### 3.4 Controle Financeiro
- Fluxo de caixa em tempo real
- Controle de recebíveis e inadimplência
- Gestão de comissões
- Relatórios financeiros detalhados
- Integração fiscal

### 3.5 CRM e Marketing
- Cadastro centralizado de clientes
- Histórico de atendimentos e preferências
- Automação de comunicação
- Campanhas de marketing direcionadas
- Análise de comportamento do cliente

### 3.6 Gestão de Estoque
- Controle de materiais e produtos
- Alertas de validade e reposição
- Integração com fornecedores
- Relatórios de consumo

### 3.7 Relatórios e Business Intelligence
- Dashboards em tempo real
- Análise de performance
- Relatórios customizáveis
- Insights para tomada de decisão

## 4. Design System e UX

### 4.1 Paleta de Cores
- **Base**: Tons neutros (brancos, cinzas claros, ou tema escuro profissional)
- **Acento**: Neon Gold (#FFD700) - usado APENAS para:
  - Botões primários
  - Links de navegação ativos
  - Ícones importantes
  - Destaques críticos
- **Objetivo**: Foco sem sobrecarga visual

### 4.2 Princípios de UX
- **Fluidez**: Transições suaves e carregamento rápido
- **Responsividade**: Interface não-jarring
- **Profissionalismo**: Design limpo e confiável
- **Acessibilidade**: Conformidade com padrões de acessibilidade

### 4.3 Horizon UI
- **Fonte da Verdade**: Figma do Horizon UI Dashboard PRO
- **Componentes**: Usar preferencialmente componentes existentes
- **Consistência**: Manter padrões visuais do design system

## 5. Módulos de Desenvolvimento

### 5.1 Módulo 1: Gestão Operacional e de Pacientes (PRIORIDADE)
**Funcionalidades:**
- Cadastro e gestão de pacientes
- Agendamento e calendário
- Prontuário eletrônico básico
- Dashboard operacional

**Componentes Principais:**
- Sidebar de navegação
- Header com informações do usuário
- Área principal de conteúdo
- Formulários de cadastro
- Calendário de agendamentos
- Lista de pacientes

### 5.2 Módulos Futuros
- Módulo 2: Gestão Financeira
- Módulo 3: Marketing e CRM
- Módulo 4: Relatórios e Analytics
- Módulo 5: Gestão de Estoque
- Módulo 6: Configurações e Administração

## 6. Integração com Supabase

### 6.1 Estrutura de Dados
- **Autenticação**: Sistema de usuários e permissões
- **Pacientes**: Dados pessoais, histórico, preferências
- **Agendamentos**: Calendário, disponibilidade, status
- **Prontuários**: Documentos, anamneses, evoluções
- **Financeiro**: Transações, recebíveis, comissões

### 6.2 Segurança
- Row Level Security (RLS) obrigatório
- Políticas de acesso por perfil de usuário
- Criptografia de dados sensíveis
- Conformidade com LGPD

## 7. Arquitetura Técnica

### 7.1 Estrutura do Frontend
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── services/           # Integração com Supabase
├── utils/              # Utilitários
├── types/              # Definições TypeScript
├── styles/             # Estilos globais
└── assets/             # Recursos estáticos
```

### 7.2 Padrões de Desenvolvimento
- Componentes funcionais com hooks
- TypeScript para type safety
- Custom hooks para lógica reutilizável
- Context API para estado global
- React Query para cache e sincronização

## 8. Critérios de Sucesso

### 8.1 Performance
- Carregamento inicial < 3 segundos
- Transições fluidas < 300ms
- Responsividade em todos os dispositivos

### 8.2 Usabilidade
- Interface intuitiva para usuários não-técnicos
- Fluxos de trabalho otimizados
- Feedback visual claro para todas as ações

### 8.3 Escalabilidade
- Suporte a múltiplas clínicas
- Performance mantida com crescimento de dados
- Arquitetura preparada para novos módulos

## 9. Próximos Passos

1. **Setup Inicial**: Configurar estrutura base do projeto
2. **Layout Principal**: Implementar sidebar, header e área de conteúdo
3. **Autenticação**: Integrar sistema de login com Supabase
4. **Módulo 1**: Desenvolver gestão de pacientes e agendamentos
5. **Testes**: Implementar testes unitários e de integração
6. **Deploy**: Configurar pipeline de deployment

---

**Nota**: Este documento serve como fonte única da verdade para o desenvolvimento do NeonPro. Todas as decisões de desenvolvimento devem estar alinhadas com estas especificações.
