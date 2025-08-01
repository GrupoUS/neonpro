# Módulo de Automação LGPD - Componentes React

## Visão Geral

Este módulo contém os componentes React para o sistema de automação LGPD do NeonPro, fornecendo uma interface completa para gerenciar a conformidade com a Lei Geral de Proteção de Dados.

## Componentes

### 1. AutomationDashboard

**Arquivo**: `AutomationDashboard.tsx`

**Descrição**: Dashboard principal para monitoramento da automação LGPD.

**Funcionalidades**:
- Exibição do score de conformidade em tempo real
- Métricas principais (consentimentos, solicitações, alertas)
- Status da automação (última execução, próxima execução)
- Lista de alertas de conformidade
- Ações rápidas para execução manual
- Métricas detalhadas por categoria

**Props**: Nenhuma (componente autônomo)

**Uso**:
```tsx
import { AutomationDashboard } from '@/components/compliance/automation/AutomationDashboard';

function CompliancePage() {
  return (
    <div>
      <AutomationDashboard />
    </div>
  );
}
```

**APIs Utilizadas**:
- `GET /api/compliance/automation/monitoring` - Dados de monitoramento
- `GET /api/compliance/automation/status` - Status da automação
- `GET /api/compliance/automation/alerts` - Alertas ativos
- `POST /api/compliance/automation/execute` - Execução manual

### 2. AutomationConfig

**Arquivo**: `AutomationConfig.tsx`

**Descrição**: Interface para configuração da automação LGPD.

**Funcionalidades**:
- Configuração geral (habilitar/desabilitar automação)
- Agendamentos com expressões Cron
- Configuração de recursos da automação
- Configuração de notificações (email e webhook)
- Configuração de limites e performance
- Validação de configurações
- Indicador de alterações não salvas

**Props**: Nenhuma (componente autônomo)

**Uso**:
```tsx
import { AutomationConfig } from '@/components/compliance/automation/AutomationConfig';

function ConfigPage() {
  return (
    <div>
      <AutomationConfig />
    </div>
  );
}
```

**APIs Utilizadas**:
- `GET /api/compliance/automation/config` - Carregar configuração
- `PUT /api/compliance/automation/config` - Salvar configuração

## Estrutura de Estados

### AutomationDashboard

```typescript
interface DashboardState {
  monitoringData: MonitoringData | null;
  automationStatus: AutomationStatus | null;
  alerts: ComplianceAlert[];
  loading: boolean;
  error: string | null;
  activeTab: 'overview' | 'alerts' | 'actions' | 'metrics';
}
```

### AutomationConfig

```typescript
interface ConfigState {
  config: AutomationConfig;
  loading: boolean;
  saving: boolean;
  hasUnsavedChanges: boolean;
  activeTab: 'general' | 'schedules' | 'features' | 'notifications' | 'limits';
}
```

## Tipos TypeScript

Todos os tipos estão definidos em `@/types/compliance/automation`:

- `AutomationConfig` - Configuração da automação
- `AutomationStatus` - Status atual da automação
- `MonitoringData` - Dados de monitoramento
- `ComplianceAlert` - Alertas de conformidade
- `AutomationMetrics` - Métricas detalhadas

## Funcionalidades Principais

### Dashboard de Monitoramento

1. **Score de Conformidade**
   - Cálculo em tempo real
   - Indicador visual com cores
   - Meta: ≥85% (verde), 70-84% (amarelo), <70% (vermelho)

2. **Métricas Principais**
   - Consentimentos ativos
   - Solicitações pendentes
   - Alertas ativos
   - Atualização automática a cada 30 segundos

3. **Status da Automação**
   - Última execução
   - Próxima execução agendada
   - Jobs ativos
   - Status dos recursos

4. **Alertas de Conformidade**
   - Lista filtrada por severidade
   - Ações para resolver alertas
   - Indicadores visuais por tipo

5. **Ações Rápidas**
   - Execução manual de automações
   - Atualização de dados
   - Processamento específico

### Configuração da Automação

1. **Agendamentos**
   - Automação completa (diária)
   - Gestão de consentimentos (6h)
   - Direitos dos titulares (4h)
   - Expressões Cron personalizadas
   - Configuração de fuso horário

2. **Recursos**
   - Gestão de consentimentos
   - Processamento de direitos
   - Relatórios de auditoria
   - Anonimização de dados
   - Monitoramento em tempo real
   - Alertas inteligentes

3. **Notificações**
   - Email para administradores
   - Webhooks para integrações
   - Configuração de destinatários
   - Templates personalizados

4. **Limites e Performance**
   - Jobs simultâneos
   - Timeout de execução
   - Tentativas de retry
   - Tamanho do lote

## Validações

### Configuração

```typescript
// Validação de expressão Cron
const cronRegex = /^\s*($|#|\w+\s*=|(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[01]?\d|2[0-3])(?:(?:-|\/|\,)(?:[01]?\d|2[0-3]))?(?:,(?:[01]?\d|2[0-3])(?:(?:-|\/|\,)(?:[01]?\d|2[0-3]))?)*)\s+(\?|\*|(?:0?[1-9]|[12]\d|3[01])(?:(?:-|\/|\,)(?:0?[1-9]|[12]\d|3[01]))?(?:,(?:0?[1-9]|[12]\d|3[01])(?:(?:-|\/|\,)(?:0?[1-9]|[12]\d|3[01]))?)*)\s+(\?|\*|(?:[1-9]|1[012])(?:(?:-|\/|\,)(?:[1-9]|1[012]))?(?:,(?:[1-9]|1[012])(?:(?:-|\/|\,)(?:[1-9]|1[012]))?)*)\s+(\?|\*|(?:[0-6])(?:(?:-|\/|\,)(?:[0-6]))?(?:,(?:[0-6])(?:(?:-|\/|\,)(?:[0-6]))?)*))$/;

// Validação de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação de URL
const urlRegex = /^https?:\/\/.+/;
```

### Limites

```typescript
const limits = {
  maxConcurrentJobs: { min: 1, max: 10 },
  jobTimeoutMinutes: { min: 5, max: 120 },
  maxRetryAttempts: { min: 1, max: 5 },
  batchSize: { min: 10, max: 1000 }
};
```

## Estilos e UI

### Componentes UI Utilizados

- `Card` - Containers principais
- `Button` - Ações e navegação
- `Badge` - Indicadores de status
- `Progress` - Barras de progresso
- `Tabs` - Navegação entre seções
- `Switch` - Toggles de configuração
- `Input` - Campos de entrada
- `Select` - Seleção de opções
- `Alert` - Mensagens de feedback

### Classes CSS Personalizadas

```css
.compliance-score-high { @apply text-green-600 bg-green-50; }
.compliance-score-medium { @apply text-yellow-600 bg-yellow-50; }
.compliance-score-low { @apply text-red-600 bg-red-50; }

.alert-severity-low { @apply border-blue-200 bg-blue-50; }
.alert-severity-medium { @apply border-yellow-200 bg-yellow-50; }
.alert-severity-high { @apply border-orange-200 bg-orange-50; }
.alert-severity-critical { @apply border-red-200 bg-red-50; }
```

## Performance

### Otimizações Implementadas

1. **Memoização**
   - `useMemo` para cálculos complexos
   - `useCallback` para funções de evento

2. **Debouncing**
   - Campos de entrada com delay
   - Validações com throttling

3. **Lazy Loading**
   - Carregamento sob demanda
   - Paginação de alertas

4. **Cache**
   - Cache de configurações
   - Invalidação inteligente

### Monitoramento

```typescript
// Auto-refresh do dashboard
useEffect(() => {
  const interval = setInterval(() => {
    if (!loading) {
      loadMonitoringData();
    }
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}, [loading]);
```

## Testes

### Testes Unitários

```typescript
// Exemplo de teste para AutomationDashboard
describe('AutomationDashboard', () => {
  it('should display compliance score correctly', () => {
    render(<AutomationDashboard />);
    expect(screen.getByText(/Score de Conformidade/)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<AutomationDashboard />);
    expect(screen.getByText(/Carregando/)).toBeInTheDocument();
  });
});
```

### Testes de Integração

```typescript
// Teste de fluxo completo
it('should save configuration successfully', async () => {
  render(<AutomationConfig />);
  
  // Modificar configuração
  fireEvent.click(screen.getByLabelText(/Habilitar Automação/));
  
  // Salvar
  fireEvent.click(screen.getByText(/Salvar Configurações/));
  
  // Verificar sucesso
  await waitFor(() => {
    expect(screen.getByText(/Configurações salvas/)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Problemas Comuns

1. **Dados não carregam**
   - Verificar autenticação
   - Verificar permissões da clínica
   - Verificar conectividade com API

2. **Configurações não salvam**
   - Verificar validações
   - Verificar formato dos dados
   - Verificar logs do console

3. **Performance lenta**
   - Verificar tamanho dos dados
   - Otimizar queries
   - Implementar paginação

### Debug

```typescript
// Habilitar logs de debug
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Dashboard data:', monitoringData);
  console.log('Config state:', config);
}
```

## Roadmap

### Próximas Funcionalidades

- [ ] Gráficos de tendências
- [ ] Exportação de relatórios
- [ ] Configuração de templates
- [ ] Integração com IA
- [ ] Modo offline
- [ ] Notificações push

---

**Versão**: 1.0.0  
**Compatibilidade**: React 18+, TypeScript 5+  
**Dependências**: shadcn/ui, Tailwind CSS