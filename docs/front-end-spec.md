# NeonPro UI/UX Specification

## Introdução

Este documento define as metas de experiência do usuário, a arquitetura da informação, os fluxos de usuário e as especificações de design visual para a interface do NeonPro. Ele serve como a fundação para o design visual e o desenvolvimento front-end, garantindo uma experiência coesa and centrada no usuário.

### Metas e Princípios Gerais de UX

#### Personas de Usuário Alvo

Para garantir que nosso design seja profundamente empático, focaremos nestas três personas principais identificadas no PRD:

- **Dr. Marina Silva (Proprietária/Gestora)**: Focada em eficiência, resultados de tratamento e crescimento do negócio. Ela precisa de poder e clareza.
- **Carla Santos (Recepcionista/Coordenadora)**: A "power user" do dia a dia. Ela precisa de velocidade, organização e automação para gerenciar o caos.
- **Ana Costa (Paciente Digital)**: Busca confiança, transparência e uma experiência acolhedora e holística para diminuir sua ansiedade.

#### Metas de Usabilidade

Nosso design será bem-sucedido se alcançarmos estas metas, extraídas diretamente dos seus KPIs:

- **Eficiência Operacional**: Permitir que a Dr. Marina e a Carla realizem tarefas de agendamento em menos de 3 cliques e que o fechamento financeiro leve menos de 2 horas.
- **Facilidade de Aprendizagem**: Um novo membro da equipe deve ser capaz de realizar tarefas essenciais, como cadastrar um paciente, em menos de 30 segundos.
- **Confiança e Engajamento do Paciente**: Reduzir a ansiedade pré-tratamento da Ana em 50%, fornecendo informações claras, acompanhamento transparente do progresso e uma sensação de controle.
- **Redução de Erros**: Prevenir ativamente conflitos de agendamento, com o objetivo de reduzir os erros em 80%.

#### Princípios de Design

Estes 4 princípios guiarão todas as nossas decisões de design:

1.  **Eficiência Orientada por IA**: Cada interação deve ser otimizada. Usaremos a IA para antecipar necessidades, prever ações (como no-shows) e apresentar os dados mais relevantes sem que o usuário precise procurar.
2.  **Clareza que Gera Confiança**: Em um ambiente médico-estético, a clareza é fundamental. A interface deve ser limpa, direta e usar uma linguagem acessível para eliminar a ambiguidade e a ansiedade, especialmente para a paciente Ana.
3.  **Empoderamento através de Dados**: A plataforma deve transformar dados complexos em insights acionáveis e preditivos. Os dashboards não devem apenas mostrar o que aconteceu, mas também o que _provavelmente_ acontecerá, dando à Dr. Marina o controle estratégico.
4.  **Design Holístico e Acolhedor**: A jornada do NeonPro vai além da clínica. O design deve refletir a abordagem de "Wellness Intelligence", integrando o bem-estar físico e mental de forma sensível e acolhedora em toda a experiência da paciente.

### Log de Alterações

| Data       | Versão | Descrição                    | Autor            |
| :--------- | :----- | :--------------------------- | :--------------- |
| 2025-07-25 | 1.0    | Criação inicial do documento | Sally, UX Expert |

### Arquitetura da Informação (AI)

##### Mapa do Site / Inventário de Telas (com Módulo de Estoque)

```mermaid
graph TD
    subgraph "Jornada da Clínica"
        A[Login] --> B[Dashboard Principal];
        B --> C[🗓️ Agenda Inteligente];
        B --> D[👥 Pacientes];
        B --> E[💰 Financeiro];
        B --> F[📊 BI & Dashboards];
        B --> new_G[📦 Estoque];
        B --> H[⚙️ Configurações];

        D --> D1[Lista de Pacientes];
        D1 --> D2[Detalhe do Paciente / Prontuário];
        E --> E1[Contas a Pagar/Receber];
        E1 --> E2[Fluxo de Caixa Diário];

        new_G --> new_G1[Visão Geral do Estoque (com alertas)];
        new_G1 --> new_G2[Registrar Entrada/Saída];
        new_G1 --> new_G3[Histórico de Movimentações];

        H --> H1[Permissões de Usuário];
        H --> H2[Integrações];
    end

    subgraph "Jornada da Paciente"
        I[Login da Paciente] --> J[🏠 Portal da Paciente];
        J --> K[Agendar/Reagendar Consulta];
        J --> L[Meu Histórico de Tratamentos];
        J --> M[Acompanhar Progresso (Wellness)];
    end
```
