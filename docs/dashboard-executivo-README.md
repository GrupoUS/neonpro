# Dashboard Executivo - Sistema de Business Intelligence

## 📊 Visão Geral

O Dashboard Executivo é um sistema completo de Business Intelligence desenvolvido para clínicas médicas, oferecendo visualização de KPIs, alertas em tempo real, relatórios automatizados e widgets personalizáveis.

## 🚀 Funcionalidades Principais

### 📈 KPIs e Métricas
- **Indicadores Financeiros**: Receita, custos, margem de lucro, inadimplência
- **Métricas Operacionais**: Taxa de ocupação, tempo médio de atendimento, produtividade
- **Indicadores de Pacientes**: Satisfação, retenção, novos pacientes, retorno
- **Métricas de Equipe**: Performance, utilização, satisfação dos funcionários

### 🎨 Widgets Personalizáveis
- **Tipos de Widget**: Gráficos, tabelas, métricas, gauges, listas, calendários
- **Categorias**: KPI, financeiro, operacional, pacientes, equipe, qualidade
- **Configuração**: Filtros personalizados, formatação, interações
- **Cache Inteligente**: Otimização de performance com cache configurável

### 🚨 Sistema de Alertas
- **Tipos de Alerta**: Threshold, anomalia, tendência, qualidade de dados
- **Severidades**: Info, Warning, Critical
- **Notificações**: Email, SMS, webhook, in-app
- **Throttling**: Controle de frequência de alertas

### 📋 Relatórios Automatizados
- **Templates**: Executivo, financeiro, operacional, clínico, compliance
- **Formatos**: PDF, Excel, CSV, HTML, JSON
- **Agendamento**: Diário, semanal, mensal, trimestral, anual
- **Distribuição**: Email, FTP, SFTP, S3, webhook

## 🏗️ Arquitetura do Sistema

### 📁 Estrutura de Arquivos

```
neonpro/
├── components/dashboard/
│   └── executive-dashboard.tsx          # Componente principal do dashboard
├── app/dashboard/executive/
│   ├── page.tsx                        # Página principal do dashboard
│   └── layout.tsx                      # Layout da seção de dashboard
├── app/api/dashboard/executive/
│   ├── layouts/
│   │   ├── route.ts                    # API para layouts de dashboard
│   │   └── [id]/route.ts              # API para layout específico
│   ├── kpis/route.ts                  # API para KPIs
│   ├── widgets/route.ts               # API para widgets
│   ├── alerts/route.ts                # API para alertas
│   └── reports/route.ts               # API para relatórios
├── lib/services/dashboard/
│   ├── dashboard-layout-engine.ts      # Engine de layout
│   ├── kpi-calculation-service.ts     # Serviço de cálculo de KPIs
│   ├── widget-service.ts              # Serviço de widgets
│   ├── alert-system.ts                # Sistema de alertas
│   └── report-system.ts               # Sistema de relatórios
├── lib/database/migrations/
│   └── 20241220_executive_dashboard_schema.sql  # Schema do banco
└── types/dashboard.ts                  # Definições TypeScript
```

### 🗄️ Schema do Banco de Dados

#### Tabelas Principais
- **dashboard_layouts**: Layouts de dashboard personalizáveis
- **dashboard_widgets**: Configuração de widgets
- **kpi_definitions**: Definições de KPIs
- **kpi_values**: Valores calculados de KPIs
- **alert_rules**: Regras de alertas
- **alert_instances**: Instâncias de alertas disparados
- **report_templates**: Templates de relatórios
- **report_schedules**: Agendamentos de relatórios
- **report_instances**: Instâncias de relatórios gerados

#### Recursos de Segurança
- **Row Level Security (RLS)**: Isolamento por clínica
- **Políticas de Acesso**: Controle granular de permissões
- **Auditoria**: Log completo de operações

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos

```bash
# Node.js 18+ e npm/yarn
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# PostgreSQL 14+ (via Supabase)
# Supabase CLI (opcional, para desenvolvimento local)
```

### 2. Instalação das Dependências

```bash
# Instalar dependências do projeto
cd neonpro
npm install

# Dependências específicas do dashboard (se não estiverem no package.json)
npm install @tanstack/react-query recharts date-fns
npm install -D @types/node
```

### 3. Configuração do Banco de Dados

```bash
# Executar migração do schema
psql -h [SUPABASE_HOST] -U [USER] -d [DATABASE] -f lib/database/migrations/20241220_executive_dashboard_schema.sql

# Ou via Supabase CLI
supabase db push
```

### 4. Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Configurações do Dashboard
DASHBOARD_CACHE_TTL=300
DASHBOARD_MAX_WIDGETS=50
DASHBOARD_REFRESH_INTERVAL=30

# Configurações de Alertas
ALERT_EMAIL_FROM=noreply@suaclinica.com
ALERT_WEBHOOK_SECRET=your_webhook_secret

# Configurações de Relatórios
REPORT_STORAGE_BUCKET=reports
REPORT_EXPIRY_DAYS=30
```

### 5. Configuração do pg_cron (Opcional)

```sql
-- Habilitar extensão pg_cron no Supabase
-- (Disponível apenas em planos Pro+)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Jobs de limpeza já configurados na migração
-- Verificar status dos jobs
SELECT * FROM cron.job;
```

## 🚀 Como Usar

### 1. Acessar o Dashboard

```
# URL do dashboard executivo
https://seudominio.com/dashboard/executive
```

### 2. Configurar Layouts

1. **Criar Layout Personalizado**:
   - Acesse as configurações do dashboard
   - Clique em "Novo Layout"
   - Configure grid, widgets e tema
   - Salve as configurações

2. **Adicionar Widgets**:
   - Selecione o tipo de widget (gráfico, tabela, métrica)
   - Configure fonte de dados e filtros
   - Defina posição e tamanho
   - Configure refresh automático

### 3. Configurar KPIs

```typescript
// Exemplo de definição de KPI
const kpiDefinition = {
  name: "Taxa de Ocupação",
  category: "operational",
  formula: "(consultas_realizadas / consultas_agendadas) * 100",
  format: "percentage",
  target: 85,
  thresholds: [
    { name: "Crítico", operator: "less_than", value: 70, color: "red" },
    { name: "Atenção", operator: "less_than", value: 80, color: "yellow" },
    { name: "Bom", operator: "greater_equal", value: 80, color: "green" }
  ]
};
```

### 4. Configurar Alertas

```typescript
// Exemplo de regra de alerta
const alertRule = {
  name: "Taxa de Ocupação Baixa",
  type: "threshold",
  condition: {
    kpiId: "taxa-ocupacao-id",
    operator: "less_than",
    value: 70
  },
  severity: "warning",
  recipients: [
    { type: "email", address: "gerente@clinica.com" },
    { type: "in_app", address: "user-id" }
  ]
};
```

### 5. Configurar Relatórios

```typescript
// Exemplo de agendamento de relatório
const reportSchedule = {
  templateId: "executive-summary-template",
  name: "Relatório Executivo Semanal",
  schedule: {
    frequency: "weekly",
    dayOfWeek: 1, // Segunda-feira
    time: "08:00",
    timezone: "America/Sao_Paulo"
  },
  format: "pdf",
  recipients: [
    { type: "email", address: "diretoria@clinica.com" }
  ]
};
```

## 📊 APIs Disponíveis

### Layouts
```
GET    /api/dashboard/executive/layouts
POST   /api/dashboard/executive/layouts
GET    /api/dashboard/executive/layouts/[id]
PUT    /api/dashboard/executive/layouts/[id]
DELETE /api/dashboard/executive/layouts/[id]
```

### KPIs
```
GET    /api/dashboard/executive/kpis
POST   /api/dashboard/executive/kpis
```

### Widgets
```
GET    /api/dashboard/executive/widgets
POST   /api/dashboard/executive/widgets
```

### Alertas
```
GET    /api/dashboard/executive/alerts
POST   /api/dashboard/executive/alerts
```

### Relatórios
```
GET    /api/dashboard/executive/reports
POST   /api/dashboard/executive/reports
```

## 🔧 Personalização

### 1. Criar Widget Customizado

```typescript
// components/dashboard/widgets/custom-widget.tsx
import { Widget, WidgetData } from '@/types/dashboard';

interface CustomWidgetProps {
  widget: Widget;
  data: WidgetData;
}

export function CustomWidget({ widget, data }: CustomWidgetProps) {
  // Implementação do widget customizado
  return (
    <div className="custom-widget">
      {/* Conteúdo do widget */}
    </div>
  );
}
```

### 2. Adicionar Novo Tipo de KPI

```typescript
// lib/services/dashboard/kpi-calculators/custom-kpi.ts
import { KPICalculator } from '../kpi-calculation-service';

export class CustomKPICalculator implements KPICalculator {
  async calculate(definition: KPIDefinition, period: DateRange): Promise<number> {
    // Implementação do cálculo customizado
    return calculatedValue;
  }
}
```

### 3. Criar Template de Relatório

```typescript
// lib/services/dashboard/report-templates/custom-template.ts
import { ReportTemplate, ReportData } from '@/types/dashboard';

export class CustomReportTemplate {
  async generate(data: ReportData, parameters: any): Promise<Buffer> {
    // Implementação da geração do relatório
    return reportBuffer;
  }
}
```

## 🔍 Monitoramento e Debugging

### 1. Logs do Sistema

```typescript
// Verificar logs de KPIs
const kpiLogs = await supabase
  .from('kpi_calculation_logs')
  .select('*')
  .order('created_at', { ascending: false });

// Verificar logs de alertas
const alertLogs = await supabase
  .from('alert_execution_logs')
  .select('*')
  .order('created_at', { ascending: false });
```

### 2. Métricas de Performance

```sql
-- Verificar performance de widgets
SELECT 
  widget_id,
  AVG(execution_time) as avg_execution_time,
  COUNT(*) as total_executions
FROM widget_cache 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY widget_id
ORDER BY avg_execution_time DESC;

-- Verificar cache hit ratio
SELECT 
  (COUNT(*) FILTER (WHERE cache_hit = true))::float / COUNT(*) * 100 as cache_hit_ratio
FROM widget_execution_logs
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

### 3. Health Checks

```typescript
// Verificar saúde do sistema
const healthCheck = {
  database: await checkDatabaseConnection(),
  cache: await checkCacheStatus(),
  alerts: await checkAlertSystem(),
  reports: await checkReportSystem()
};
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **KPIs não calculando**:
   - Verificar se os dados fonte estão disponíveis
   - Validar fórmula do KPI
   - Verificar logs de erro

2. **Widgets não carregando**:
   - Verificar cache do widget
   - Validar configuração de data source
   - Verificar permissões RLS

3. **Alertas não disparando**:
   - Verificar se a regra está ativa
   - Validar condições do alerta
   - Verificar configuração de throttling

4. **Relatórios falhando**:
   - Verificar template do relatório
   - Validar parâmetros de entrada
   - Verificar espaço de armazenamento

### Comandos de Diagnóstico

```sql
-- Verificar status dos jobs de limpeza
SELECT * FROM cron.job WHERE jobname LIKE 'dashboard_%';

-- Verificar alertas ativos
SELECT COUNT(*) FROM alert_instances WHERE status = 'active';

-- Verificar relatórios pendentes
SELECT COUNT(*) FROM report_instances WHERE status = 'pending';

-- Verificar uso de cache
SELECT 
  COUNT(*) as total_widgets,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as cached_widgets
FROM widget_cache;
```

## 📚 Recursos Adicionais

- **Documentação da API**: `/docs/api/dashboard-api.md`
- **Guia de Desenvolvimento**: `/docs/development/dashboard-development.md`
- **Exemplos de Uso**: `/docs/examples/dashboard-examples.md`
- **Roadmap**: `/docs/NEONPRO_DETAILED_ROADMAP_2025.md`

## 🤝 Contribuição

Para contribuir com o desenvolvimento do Dashboard Executivo:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças seguindo os padrões do projeto
4. Adicione testes para novas funcionalidades
5. Submeta um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Dashboard Executivo NeonPro** - Sistema de Business Intelligence para Clínicas Médicas

*Desenvolvido com ❤️ para otimizar a gestão de clínicas médicas*