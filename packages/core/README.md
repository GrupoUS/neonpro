# NeonPro Core Business Logic

Módulo core de negócio para clínicas de estética no Brasil, focado em gestão completa de pacientes e tratamentos estéticos avançados.

## 🎯 Foco de Negócio

**SaaS para Profissionais de Saúde Estética** (NÃO é patologia médica)
- Clínicas de estética avançada
- Profissionais especializados em tratamentos estéticos
- Gestão de pacientes e procedimentos cosméticos

## 📦 Estrutura de Domínios

### `/appointments` - Agendamentos
- Agendamento de sessões estéticas
- Gestão de disponibilidade de profissionais
- Confirmação e cancelamento automatizado

### `/pacientes` - Gestão de Clientes
- Cadastro completo com validação brasileira
- Histórico de tratamentos estéticos
- Preferências e VIP status

### `/financeiro` - Financeiro
- Faturamento de tratamentos estéticos
- Múltiplos métodos de pagamento (PIX, cartão, etc.)
- Comissionamento de profissionais

### `/profissionais` - Especialistas
- Gestão de profissionais de estética
- Validação de certificados e especializações
- Sistema de agendamento e disponibilidade

### `/tratamentos` - Catálogo de Procedimentos
- Catálogo de tratamentos estéticos
- Duração, preços e contraindicações
- Pacotes de tratamentos combinados

### `/common` - Utilitários Compartilhados
- Tipos base e validações brasileiras
- Utilitários de formatação (CPF, CNPJ, etc.)
- Serviços de API compartilhados

## 🚀 Features Principais

### ✅ Validação Brasileira
- CPF/CNPJ validação
- Formatação de telefone e CEP
- Compliance LGPD

### ✅ Gestão de Tratamentos Estéticos
- Catálogo completo de procedimentos
- Verificação de contraindicações
- Gestão de múltiplas sessões

### ✅ Agendamento Inteligente
- Disponibilidade por profissional
- Prevenção de conflitos
- Gestão de salas

### ✅ Financeiro Brasileiro
- Suporte a PIX, cartão, dinheiro
- Cálculo automático de taxas
- Gestão de comissões

## 💻 Uso

```typescript
import { 
  AppointmentService,
  PatientService,
  FinancialService,
  ProfessionalService,
  TreatmentService
} from '@neonpro/core'

// Criar novo paciente
const patientValidation = PatientService.validatePatient(patientData)

// Gerar agendamentos disponíveis
const slots = AppointmentService.generateAvailableSlots(
  professionalId,
  date,
  duration,
  existingAppointments,
  workSchedule
)

// Calcular comissão profissional
const commission = FinancialService.calculateProfessionalCommission(
  invoiceAmount,
  commissionRate,
  paymentMethod
)
```

## 📋 Validações

### Pacientes
- Nome completo obrigatório
- CPF válido (validação oficial)
- Telefone brasileiro
- Idade mínima 18 anos

### Profissionais
- CPF válido
- Registro profissional obrigatório
- Especialidade validada
- Taxa de comissão (0-100%)

### Tratamentos
- Duração máxima 8 horas
- Preço base positivo
- Número de sessões obrigatório
- Categoria válida

## 🏥 Contexto de Saúde Estética

Focado em:
- Tratamentos faciais e corporais
- Procedimentos injetáveis (botox, preenchimento)
- Tratamentos a laser
- Peelings químicos
- Limpeza de pele
- Massagens e bem-estar

**NÃO inclui:**
- Patologia médica
- Cirurgias plásticas reconstrutivas
- Tratamentos de doenças de pele
- Emergências médicas

## 📊 Métricas de Sucesso

- Redução de complexidade: 200+ → 80-100 componentes
- Eliminação de duplicação: ~60% → <10%
- Build time: <7s mantido
- Compliance LGPD/ANVISA preservado