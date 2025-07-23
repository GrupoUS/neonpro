# Appointment Management Modals

Este diretório contém os modals para gerenciamento de agendamentos no NeonPro, implementados seguindo os padrões VIBECODE e a arquitetura existente do sistema.

## 📁 Estrutura dos Modals

### 1. EditAppointmentDialog (`edit-appointment-dialog.tsx`)
Modal para edição de agendamentos existentes.

**Funcionalidades:**
- Formulário completo com validação usando react-hook-form + zod
- Verificação de conflitos em tempo real
- Carregamento dinâmico de pacientes, profissionais e serviços
- Validação de horários e disponibilidade
- Sistema de observações (cliente e internas)
- Rastreamento de mudanças com motivo obrigatório

**Campos:**
- Paciente (seleção)
- Profissional (seleção)
- Serviço (seleção com duração)
- Data e horário
- Status do agendamento
- Motivo da alteração
- Observações do cliente
- Observações internas

### 2. RescheduleAppointmentDialog (`reschedule-appointment-dialog.tsx`)
Modal especializado para reagendamento de consultas.

**Funcionalidades:**
- Exibição das informações do agendamento atual
- Seleção de nova data
- Carregamento de horários disponíveis
- Seleção visual de slots disponíveis
- Verificação de conflitos
- Input manual de data/hora como alternativa
- Motivo do reagendamento obrigatório

**Recursos avançados:**
- Grid visual de horários disponíveis
- Indicação de slots ocupados/livres
- Validação de datas (mínimo: amanhã, máximo: 90 dias)
- Fallback para entrada manual

### 3. ContactPatientDialog (`contact-patient-dialog.tsx`)
Modal para contato direto com pacientes.

**Funcionalidades:**
- Exibição completa dos dados do paciente
- Múltiplos métodos de contato (WhatsApp, email, telefone, SMS)
- Templates de mensagem pré-definidos
- Sistema de variáveis para personalização automática
- Cópia de informações de contato
- Abertura direta de aplicativos (WhatsApp, email)

**Templates disponíveis:**
- Lembrete de agendamento
- Confirmação de agendamento
- Reagendamento necessário
- Cancelamento
- Follow-up pós-atendimento
- Mensagem personalizada

**Variáveis do template:**
- `{patient_name}` - Nome do paciente
- `{service_name}` - Nome do serviço
- `{date}` - Data formatada
- `{time}` - Horário
- `{professional}` - Nome do profissional

### 4. CreateAppointmentDialog (`create-appointment-dialog.tsx`)
Modal para criação de novos agendamentos.

**Funcionalidades:**
- Formulário completo de criação
- Seleção de pacientes com busca
- Seleção de profissionais com especialização
- Seleção de serviços com duração e preço
- Carregamento de slots disponíveis
- Grid visual de horários
- Verificação de conflitos
- Opções de notificação (confirmação e lembrete)

**Recursos:**
- Data mínima: hoje
- Data máxima: 90 dias à frente
- Validação de conflitos em tempo real
- Exibição de informações do serviço (duração, preço)
- Status inicial configurável

## 🔧 Integração

### Importação
```typescript
import {
  EditAppointmentDialog,
  RescheduleAppointmentDialog,
  ContactPatientDialog,
  CreateAppointmentDialog
} from './appointments/modals'
```

### Uso no Dashboard
Os modals são integrados no `appointment-management-dashboard.tsx` com estados de controle:

```typescript
const [editDialogOpen, setEditDialogOpen] = useState(false)
const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
const [contactDialogOpen, setContactDialogOpen] = useState(false)
const [createDialogOpen, setCreateDialogOpen] = useState(false)
const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
```

## 🎯 Padrões Implementados

### Validação com Zod
Todos os formulários utilizam schemas de validação rigorosos:

```typescript
const appointmentEditSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  service_type_id: z.string().min(1, 'Tipo de serviço é obrigatório'),
  start_time: z.string().min(1, 'Data e horário são obrigatórios'),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  change_reason: z.string().min(1, 'Motivo da alteração é obrigatório')
})
```

### Gerenciamento de Estado
- Estados de loading para operações assíncronas
- Error handling com toasts informativos
- Verificação de conflitos em tempo real
- Debounce para otimização de performance

### Interface Responsiva
- Layouts adaptativos para mobile e desktop
- Grids responsivos para seleção de horários
- Modals com scroll vertical quando necessário
- Componentes shadcn/ui para consistência visual

## 📊 APIs Utilizadas

### Endpoints necessários:
- `GET /api/patients` - Lista de pacientes
- `GET /api/professionals` - Lista de profissionais
- `GET /api/service-types` - Lista de serviços
- `GET /api/appointments/available-slots` - Horários disponíveis
- `POST /api/appointments/check-conflicts` - Verificação de conflitos
- `POST /api/appointments` - Criação de agendamento
- `PATCH /api/appointments/[id]` - Atualização de agendamento

### Estrutura de dados esperada:
```typescript
interface Patient {
  id: string
  full_name: string
  email?: string
  phone?: string
}

interface Professional {
  id: string
  full_name: string
  specialization?: string
}

interface ServiceType {
  id: string
  name: string
  duration_minutes: number
  price?: number
}

interface AvailableSlot {
  start_time: string
  end_time: string
  is_available: boolean
}
```

## 🚀 Funcionalidades Avançadas

### Verificação de Conflitos
- Verificação automática durante digitação
- Exclusão do agendamento atual (para edição)
- Exibição clara de conflitos encontrados
- Prevenção de submissão com conflitos

### Templates de Mensagem
- Sistema flexível de templates
- Substituição automática de variáveis
- Templates específicos por contexto
- Suporte a mensagens personalizadas

### Integração com Aplicativos
- Abertura direta do WhatsApp com mensagem pré-preenchida
- Abertura do cliente de email com assunto e corpo
- Links diretos para chamadas telefônicas
- Funcionalidade de cópia para área de transferência

## 📱 Responsividade

### Mobile
- Layouts em coluna única
- Botões e inputs dimensionados para toque
- Modais com altura máxima e scroll
- Grid de horários adaptativo

### Desktop
- Layouts em múltiplas colunas
- Melhor aproveitamento do espaço
- Hover states e feedbacks visuais
- Modais centralizados com largura otimizada

## 🔒 Segurança e Validação

### Validações Implementadas:
- Campos obrigatórios
- Formatos de data e hora
- Verificação de disponibilidade
- Prevenção de conflitos
- Sanitização de inputs

### Tratamento de Erros:
- Try-catch em todas as operações async
- Toasts informativos para o usuário
- Estados de loading durante operações
- Fallbacks para dados não disponíveis

## 📈 Performance

### Otimizações:
- Debounce em verificações de conflito (500ms)
- Carregamento lazy de dados de referência
- Cache de estados durante a sessão
- Reutilização de componentes

### Métricas esperadas:
- Tempo de abertura de modal: <200ms
- Tempo de verificação de conflito: <800ms
- Tempo de carregamento de slots: <1s
- Bundle size adicional: <50KB

## ✅ Compatibilidade

### Browsers suportados:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos:
- Desktop (1024px+)
- Tablet (768px-1023px)
- Mobile (320px-767px)