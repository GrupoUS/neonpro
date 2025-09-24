# 👩‍💼 Manual da Equipe de Recepção - NeonPro Aesthetic Clinic

## 🎯 Visão Geral

Bem-vindo ao manual da equipe de recepção do NeonPro Aesthetic Clinic! Este guia completo foi projetado para profissionais que atuam na recepção, agendamento e atendimento ao cliente.

### 📋 Seu Perfil Profissional

Como membro da equipe de recepção, você é responsável por:

- **Atendimento ao Cliente**: Primeira impressão e acolhimento
- **Agendamento de Consultas**: Gestão eficiente da agenda
- **Gestão de Cadastros**: Registro e atualização de pacientes
- **Comunicação**: Contato com pacientes e profissionais
- **Financeiro Básico**: Pagamentos e faturamento inicial
- **Suporte Administrativo**: Apoio à operação da clínica

## 🚀 Primeiros Passos

### 🔑 Acesso e Configuração

#### Configuração Inicial

```bash
1. Acesse: https://app.neonpro.com.br/recepcao
2. Use suas credenciais corporativas
3. Configure sua estação de trabalho
4. Complete seu perfil no sistema
5. Revise os manuais de treinamento
6. Familiarize-se com a interface
7. Configure preferências de notificação
```

#### Permissões e Acessos

```typescript
interface ReceptionPermissions {
  // Agendamento
  scheduling: {
    viewAppointments: boolean;
    createAppointments: boolean;
    modifyAppointments: boolean;
    cancelAppointments: boolean;
  };
  
  // Pacientes
  patients: {
    viewPatients: boolean;
    registerPatients: boolean;
    updatePatients: boolean;
    viewMedicalInfo: boolean; // Limitado
  };
  
  // Financeiro
  financial: {
    processPayments: boolean;
    viewInvoices: boolean;
    issueReceipts: boolean;
    manageRefunds: boolean;
  };
  
  // Comunicação
  communication: {
    sendEmails: boolean;
    sendSMS: boolean;
    sendWhatsApp: boolean;
    makeCalls: boolean;
  };
}
```

### 🏢 Ambiente de Trabalho

#### Organização da Recepção

```bash
Áreas de responsabilidade:
1. Recepção principal: Acolhimento e direcionamento
2. Estação de agendamento: Telefonia e marcação
3. Área de espera: Conforto e organização
4. Arquivo físico: Documentação organizada
5. Estação de pagamento: Terminal e impressora
6. Copa: Água, café e amenidades
```

#### Equipamentos Necessários

```bash
Estação de trabalho padrão:
- Computador com monitor duplo
- Telefone multifuncional
- Impressora multifuncional
- Terminal de cartão
- Leitor de biometria
- Webcam para videochamadas
- Sistema de áudio e chamada
```

## 📞 Atendimento ao Cliente

### 🤝 Protocolo de Acolhimento

#### Boas-Vindas Padrão

```typescript
interface WelcomeProtocol {
  // Saudação inicial
  greeting: {
    standardGreeting: "Bem-vindo à NeonPro Aesthetic Clinic! Como posso ajudar?";
    smileAndEyeContact: true;
    warmTone: true;
    professionalAppearance: true;
  };
  
  // Identificação das necessidades
  needsIdentification: {
    activeListening: true;
    clarifyingQuestions: string[];
    patienceLevel: 'high';
    empathyLevel: 'high';
  };
  
  // Direcionamento adequado
  routing: {
    appointmentCheck: boolean;
    newPatientRegistration: boolean;
    informationRequest: boolean;
    emergencyHandling: boolean;
  };
}
```

#### Atendimento Telefônico

```bash
Script padrão de atendimento:
1. "NeonPro Aesthetic Clinic, [seu nome] falando! Como posso ajudar?"
2. Escuta ativa das necessidades do cliente
3. Identificação do paciente (se cadastrado)
4. Oferecimento de opções (agendamento, informações, etc.)
5. Confirmação de entendimento
6. Agendamento ou encaminhamento adequado
7. Confirmação das informações fornecidas
8. Agradecimento e despedida profissional

Média de atendimento: 2-3 minutos por chamada
```

### 📋 Cadastro de Novos Pacientes

#### Ficha de Cadastramento

```typescript
interface PatientRegistration {
  // Informações pessoais
  personalInfo: {
    fullName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    cpf: string;
    rg: string;
    email: string;
    phone: string;
    address: Address;
  };
  
  // Informações de contato
  contactInfo: {
    preferredContactMethod: 'phone' | 'email' | 'whatsapp' | 'sms';
    emergencyContact: EmergencyContact;
    relationship: string;
    notificationPreferences: NotificationPreference[];
  };
  
  // Informações iniciais para tratamento
  treatmentInfo: {
    howDidYouFindUs: string;
    interestAreas: string[];
    budgetRange: string;
    availability: Availability;
    urgency: 'low' | 'medium' | 'high';
  };
  
  // Consentimentos iniciais
  consents: {
    lgpdConsent: boolean;
    communicationConsent: boolean;
    marketingConsent: boolean;
    photoConsent: boolean;
  };
}
```

#### Processo de Cadastramento

```bash
Etapas do cadastro:
1. Coleta de informações básicas (5-10 min)
2. Verificação de documentos (RG, CPF)
3. Explicação do sistema de funcionamento
4. Cadastro no sistema digital
5. Fotografia para o perfil (opcional)
6. Explicação sobre LGPD e consentimentos
7. Agendamento da primeira consulta (se desejado)
8. Entrega de materiais informativos
9. Tour rápido pela clínica (opcional)
```

### 🔄 Gestão de Espera

#### Gerenciamento da Sala de Espera

```typescript
interface WaitingRoomManagement {
  // Controle de espera
  waitTimeManagement: {
    averageWaitTime: number; // 15 minutos
    maximumWaitTime: number; // 30 minutos
    delayNotifications: boolean;
    waitTimeUpdates: boolean;
  };
  
  // Conforto do paciente
  patientComfort: {
    beverages: 'water' | 'coffee' | 'tea';
    readingMaterials: string[];
    wifiAccess: boolean;
    chargingStations: boolean;
    temperatureControl: boolean;
  };
  
  // Comunicação durante espera
  waitCommunication: {
    delayNotifications: boolean;
    waitTimeUpdates: boolean;
    professionalDelays: boolean;
    emergencySituations: boolean;
  };
}
```

#### Protocolos de Atrasos

```bash
Níveis de atraso:
- Leve (5-15 min): Informar paciente, oferecer água/café
- Moderado (15-30 min): Explicação detalhada, oferecer remarcação
- Severo (>30 min): Desculpa formal, remarcação com benefício
- Emergencial: Explicação completa, reembolso de transporte

Comunicação:
1. Informar o tempo estimado de espera
2. Explicar o motivo do atraso
3. Oferecer alternativas (remarcação, etc.)
4. Manter atualizações regulares
5. Demonstração de empatia e preocupação
```

## 📅 Gestão de Agendamentos

### 📞 Sistema de Agendamento

#### Tipos de Agendamentos

```typescript
interface AppointmentTypes {
  // Consulta inicial
  initialConsultation: {
    duration: 60; // minutos
    requiredProfessional: 'doctor' | 'aesthetician';
    preparationTime: 15;
    cost: 150;
    requiresPriorTests: boolean;
  };
  
  // Sessão de tratamento
  treatmentSession: {
    duration: 30; // varia por tratamento
    requiredProfessional: 'any' | 'specific';
    preparationTime: 10;
    cost: 'variable';
    requiresPriorSessions: boolean;
  };
  
  // Acompanhamento
  followUp: {
    duration: 30;
    requiredProfessional: 'same';
    preparationTime: 5;
    cost: 50;
    requiresPreviousTreatment: boolean;
  };
  
  // Emergência
  emergency: {
    duration: 15;
    requiredProfessional: 'available';
    preparationTime: 0;
    cost: 100;
    priority: 'high';
  };
}
```

#### Processo de Agendamento

```bash
Fluxo padrão de agendamento:
1. Identificar tipo de atendimento necessário
2. Verificar disponibilidade de profissionais
3. Consultar agenda de salas e equipamentos
4. Oferecer opções de horário ao paciente
5. Confirmar preferências e restrições
6. Registrar agendamento no sistema
7. Enviar confirmação imediata
8. Agendar lembretes automáticos
9. Documentar informações relevantes
10. Confirmar próximos passos com paciente
```

### 🤖 Agendamento Inteligente

#### Sistema de Otimização

```typescript
interface SmartScheduling {
  // Fatores de otimização
  optimizationFactors: {
    professionalAvailability: boolean;
    roomAvailability: boolean;
    equipmentAvailability: boolean;
    patientPreferences: boolean;
    treatmentCompatibility: boolean;
    travelTime: boolean;
    breakScheduling: boolean;
  };
  
  // Prevenção de não comparecimento
  noShowPrevention: {
    riskAssessment: boolean;
    reminderTiming: number[];
    confirmationProtocol: boolean;
    backupScheduling: boolean;
  };
  
  // Balanceamento de carga
  loadBalancing: {
    professionalUtilization: boolean;
    roomUtilization: boolean;
    equipmentUtilization: boolean;
    peakTimeManagement: boolean;
  };
}
```

#### Confirmações e Lembretes

```bash
Protocolo de comunicação:
- Confirmação imediata: Email/SMS após agendamento
- Lembrete 24h antes: SMS/WhatsApp
- Lembrete 2h antes: WhatsApp apenas
- Confirmação de comparecimento: 1h antes
- Notificação de atraso: Em tempo real

Métodos preferenciais:
1. WhatsApp (principal)
2. SMS (backup)
3. Email (detalhado)
4. Ligação (urgências/idosos)
```

### 🔄 Gestão de Alterações

#### Cancelamentos e Remarcações

```typescript
interface AppointmentChanges {
  // Política de cancelamento
  cancellationPolicy: {
    freeCancellationHours: 24;
    lateCancellationFee: 50;
    noShowFee: 100;
    emergencyException: boolean;
  };
  
  // Processo de remarcação
  reschedulingProcess: {
    availabilityCheck: boolean;
    patientPreferences: boolean;
    professionalApproval: boolean;
    confirmationRequired: boolean;
  };
  
  // Gestão de cancelamentos
  cancellationManagement: {
    reasonCollection: boolean;
    feedbackCollection: boolean;
    retentionEffort: boolean;
    followUpScheduling: boolean;
  };
}
```

#### Protocolos Especiais

```bash
Situações especiais:
1. Paciente muito adiantado (>30 min)
   - Oferecer café/água
   - Verificar disponibilidade antecipada
   - Informar sobre possível espera
   
2. Paciente muito atrasado (>15 min)
   - Contactar profissional
   - Avaliar possibilidade de atendimento
   - Oferecer remarcação com benefício
   
3. Emergências
   - Priorizar atendimento imediato
   - Informar outros pacientes sobre atrasos
   - Oferecer alternativas
```

## 💳 Gestão Financeira Básica

### 💰 Pagamentos e Faturamento

#### Métodos de Pagamento

```typescript
interface PaymentMethods {
  // Cartão de crédito
  creditCard: {
    enabled: true;
    installments: 12;
    minimumAmount: 10;
    fees: 2.5;
  };
  
  // Cartão de débito
  debitCard: {
    enabled: true;
    instantConfirmation: true;
    fees: 1.5;
  };
  
  // PIX
  pix: {
    enabled: true;
    instantConfirmation: true;
    fees: 0;
    qrCode: true;
  };
  
  // Boleto
  boleto: {
    enabled: true;
    clearingDays: 3;
    fees: 2.0;
    minimumAmount: 50;
  };
  
  // Dinheiro
  cash: {
    enabled: true;
    changeRequired: boolean;
    receiptRequired: true;
  };
}
```

#### Processo de Pagamento

```bash
Fluxo de pagamento:
1. Confirmar serviços a serem pagos
2. Verificar método de pagamento preferido
3. Processar pagamento no terminal/sistema
4. Emitir recibo/demonstrativo
5. Confirmar pagamento no prontuário
6. Agendar próximos pagamentos (parcelamentos)
7. Oferecer opções de faturamento
8. Agradecer e confirmar próximos passos
```

### 📋 Gestão de Inadimplência

#### Controle de Contas a Pagar

```typescript
interface AccountsReceivable {
  // Status de pagamento
  paymentStatus: {
    pending: 'waiting_payment';
    partial: 'partial_payment';
    paid: 'fully_paid';
    overdue: 'payment_overdue';
    cancelled: 'payment_cancelled';
  };
  
  // Gestão de inadimplência
  overdueManagement: {
    gracePeriodDays: 7;
    reminderFrequency: 'weekly';
    penaltyRate: 2.0;
    suspensionThreshold: 3;
  };
  
  // Acordos de pagamento
  paymentAgreements: {
    installmentPlans: boolean;
    negotiationOptions: string[];
    discountOptions: boolean;
    documentationRequired: boolean;
  };
}
```

#### Protocolo de Cobrança

```bash
Etapas de cobrança:
1. Vencimento: Notificação automática
2. 7 dias: Primeiro lembrete (SMS/WhatsApp)
3. 14 dias: Segundo lembrete + ligação
4. 21 dias: Notificação formal + taxa
5. 30 dias: Suspensão de agendamentos
6. 60 dias: Encaminhamento para cobrança
7. 90 dias: Negativação (após notificação)

Comunicação sempre respeitosa e profissional
```

## 📱 Comunicação com Pacientes

### 📧 Canais de Comunicação

#### Sistema Multicanal

```typescript
interface CommunicationChannels {
  // Email
  email: {
    confirmations: boolean;
    reminders: boolean;
    newsletters: boolean;
    promotional: boolean;
    templates: EmailTemplate[];
  };
  
  // SMS
  sms: {
    reminders: boolean;
    confirmations: boolean;
    emergencies: boolean;
    characterLimit: 160;
  };
  
  // WhatsApp
  whatsapp: {
    confirmations: boolean;
    reminders: boolean;
    support: boolean;
    mediaSupport: boolean;
    templates: WhatsAppTemplate[];
  };
  
  // Telefone
  phone: {
    confirmations: boolean;
    reminders: boolean;
    emergencies: boolean;
    callRecording: boolean;
  };
}
```

#### Templates de Comunicação

```bash
Templates padrão:
1. Confirmação de agendamento
   "Olá [nome]! Seu agendamento para [serviço] está confirmado para [data] às [hora]. Endereço: [endereço]"

2. Lembrete 24h antes
   "Lembrete: Sua consulta amanhã às [hora]. Confirme presença: [link]"

3. Cancelamento profissional
   "Prezado [nome], o Dr. [profissional] precisa remarcar sua consulta. Entre em contato para nova data."

4. Promoções especiais
   "Oferta especial: [descrição] para clientes fidelizados. Válido até [data]."
```

### 🚨 Gestão de Emergências

#### Protocolo de Emergências

```typescript
interface EmergencyProtocol {
  // Tipos de emergência
  emergencyTypes: {
    medicalEmergency: 'immediate_doctor_attention';
    severeReaction: 'immediate_medical_response';
    allergicReaction: 'immediate_treatment';
    emotionalDistress: 'psychological_support';
    securityIncident: 'security_team_call';
  };
  
  // Fluxo de ação
  actionFlow: {
    immediateAction: string[];
    professionalAlert: boolean;
    emergencyServices: boolean;
    familyNotification: boolean;
    documentationRequired: boolean;
  };
  
  // Comunicação de emergência
  emergencyCommunication: {
    internalAlert: boolean;
    externalServices: boolean;
    familyContact: boolean;
    documentationProtocol: boolean;
  };
}
```

#### Situações de Crise

```bash
Procedimentos emergenciais:
1. Reação adversa durante tratamento
   - Chamar profissional imediatamente
   - Acionar equipe de emergência
   - Preparar medicamentos de emergência
   - Contatar serviços médicos se necessário
   - Documentar completamente o ocorrido

2. Desmaio ou mal-estar
   - Posicionar paciente adequadamente
   - Verificar sinais vitais
   - Oferecer água e tranquilizar
   - Chamar profissional para avaliação
   - Chamar ambulância se necessário

3. Comportamento agressivo
   - Manter calma profissional
   - Tentar acalmar o paciente
   - Chamar segurança se necessário
   - Evitar confrontação física
   - Documentar o incidente
```

## 📊 Organização Administrativa

### 📋 Gestão de Documentos

#### Sistema de Arquivamento

```typescript
interface DocumentManagement {
  // Documentos físicos
  physicalDocuments: {
    patientFiles: boolean;
    consentForms: boolean;
    financialRecords: boolean;
    regulatoryDocuments: boolean;
  };
  
  // Documentos digitais
  digitalDocuments: {
    scans: boolean;
    electronicSignatures: boolean;
    cloudStorage: boolean;
    backupSystem: boolean;
  };
  
  // Retenção e descarte
  retentionPolicy: {
    medicalRecords: 20; // anos
    financialRecords: 10; // anos
    consentForms: 5; // anos
    correspondence: 3; // anos
  };
}
```

#### Checklist Diário de Abertura/Fechamento

```bash
Abertura da clínica (manhã):
1. Ligar computadores e sistemas
2. Verificar linhas telefônicas
3. Organizar sala de espera
4. Conferir agenda do dia
5. Preparar materiais de recepção
6. Verificar estoque de água/café
7. Testar equipamentos (terminal, impressora)
8. Revisar mensagens urgentes

Fechamento da clínica (noite):
1. Organizar documentos do dia
2. Arquivar prontuários
3. Conferir caixa e pagamentos
4. Fechar sistemas adequadamente
5. Desligar equipamentos
6. Travar portas e janelas
7. Ativar sistema de alarme
8. Preparar relatório diário
```

### 📈 Relatórios Diários

#### Relatório de Operações

```typescript
interface DailyOperationsReport {
  // Métricas do dia
  dailyMetrics: {
    totalAppointments: number;
    newPatients: number;
    noShows: number;
    cancellations: number;
    revenue: number;
    paymentMethods: PaymentMethodStats[];
  };
  
  // Ocorrências especiais
  specialOccurrences: {
    emergencies: Emergency[];
    complaints: Complaint[];
    compliments: Compliment[];
    systemIssues: SystemIssue[];
  };
  
  // Observações e recomendações
  notes: {
    staffPerformance: string;
    systemPerformance: string;
    patientFeedback: string;
    recommendations: string[];
  };
}
```

#### Análise de Desempenho

```bash
Métricas de acompanhamento:
- Taxa de ocupação: Meta >75%
- Pontualidade de profissionais: Meta >90%
- Satisfação inicial: Meta >4.0/5.0
- Novos pacientes: Meta 3-5 por dia
- Não comparecimento: Meta <10%
- Tempo médio de espera: Meta <15 min
- Conversão de leads: Meta >60%
```

## 🛡️ Conformidade e Segurança

### 🔒 LGPD na Recepção

#### Gestão de Dados

```typescript
interface ReceptionLGPD {
  // Coleta de dados
  dataCollection: {
    purposeSpecification: boolean;
    dataMinimization: boolean;
    consentManagement: boolean;
    transparency: boolean;
  };
  
  // Armazenamento seguro
  secureStorage: {
    accessControl: boolean;
    encryption: boolean;
    backupProcedures: boolean;
    retentionPolicy: boolean;
  };
  
  // Direitos do paciente
  patientRights: {
    accessRequests: boolean;
    rectificationRequests: boolean;
    deletionRequests: boolean;
    portabilityRequests: boolean;
  };
}
```

#### Protocolos de Privacidade

```bash
Regras de LGPD na recepção:
1. Nunca compartilhar informações de pacientes
2. Armazenar documentos em locais seguros
3. Utilizar apenas sistemas autorizados
4. Fazer logout ao terminar expediente
5. Não acessar informações desnecessárias
6. Reportar imediatamente violações
7. Manter treinamento atualizado
8. Respeitar direitos dos titulares
```

### 🏥 Procedimentos Clínicos Básicos

#### Triagem Inicial

```typescript
interface InitialScreening {
  // Avaliação básica
  basicAssessment: {
    vitalSigns: boolean;
    visibleSymptoms: boolean;
    painAssessment: boolean;
    emergencyIndicators: boolean;
  };
  
  // Histórico rápido
  quickHistory: {
    currentMedications: boolean;
    knownAllergies: boolean;
    recentProcedures: boolean;
    relevantConditions: boolean;
  };
  
  // Decisão de triagem
  triageDecision: {
    urgentCare: boolean;
    standardCare: boolean;
    emergencyCare: boolean;
    specialistReferral: boolean;
  };
}
```

#### Emergências Médicas

```bash
Reconhecimento de emergências:
- Dificuldade respiratória: Imediata
- Dor no peito: Imediata
- Sangramento severo: Imediata
- Perda de consciência: Imediata
- Reação alérgica grave: Imediata
- Dor intensa súbita: Urgente
- Queda com trauma: Urgente
```

## 📱 Aplicativo da Recepção

### 📱 Funcionalidades Móveis

#### App de Recepção

```typescript
interface ReceptionMobileApp {
  // Agendamento móvel
  mobileScheduling: {
    quickAppointment: boolean;
    calendarView: boolean;
    patientSearch: boolean;
    availabilityCheck: boolean;
  };
  
  // Comunicação
  mobileCommunication: {
    quickMessages: boolean;
    callHistory: boolean;
    whatsappIntegration: boolean;
    emailTemplates: boolean;
  };
  
  // Pagamentos
  mobilePayments: {
    cardProcessing: boolean;
    pixGeneration: boolean;
    receiptGeneration: boolean;
    paymentHistory: boolean;
  };
  
  // Gestão de pacientes
  patientManagement: {
    quickRegistration: boolean;
    photoCapture: boolean;
    documentScan: boolean;
    signatureCapture: boolean;
  };
}
```

#### Segurança Móvel

```bash
Medidas de segurança:
- PIN de acesso: 6 dígitos
- Biometria: Impressão digital
- Sessão expira: 5 minutos inativo
- Bloqueio remoto: Disponível
- Criptografia: Dados sensíveis
- VPN: Para acesso externo
- Atualizações: Automáticas e obrigatórias
```

## 🎯 Desenvolvimento Profissional

### 📚 Treinamento Contínuo

#### Programa de Capacitação

```bash
Treinamentos obrigatórios:
1. Onboarding inicial (40h)
2. Sistema NeonPro (16h)
3. Atendimento ao cliente (12h)
4. LGPD e privacidade (8h)
5. Procedimentos clínicos básicos (8h)
6. Gestão de emergências (4h)
7. Excelência no serviço (8h)

Atualizações trimestrais:
- Novas funcionalidades do sistema
- Atualizações regulatórias
- Melhores práticas de atendimento
- Feedback e melhoria contínua
```

#### Avaliação de Desempenho

```typescript
interface PerformanceEvaluation {
  // Métricas de atendimento
  serviceMetrics: {
    patientSatisfaction: number;
    callQuality: number;
    schedulingEfficiency: number;
    problemResolution: number;
  };
  
  // Métricas operacionais
  operationalMetrics: {
    appointmentAccuracy: number;
    paymentProcessing: number;
    documentationQuality: number;
    teamwork: number;
  };
  
  // Desenvolvimento profissional
  professionalDevelopment: {
    trainingCompletion: number;
    skillsImprovement: string[];
    initiativeLevel: number;
    adaptability: number;
  };
}
```

## 📞 Suporte e Recursos

### 🆘 Canais de Ajuda

#### Suporte Interno

- **Supervisor imediato**: Disponível no local
- **Coordenador de recepção**: (11) 3456-7892
- **RH e treinamento**: hr@neonpro.com.br
- **Suporte técnico**: (11) 3456-7890

#### Emergências

- **Emergência médica**: (11) 9999-8889
- **Segurança**: (11) 9999-8890
- **TI Crítico**: (11) 9999-8891

### 📚 Recursos Adicionais

#### Manuais de Referência

- [Guia Rápido do Sistema](../quick-reference/system-quick-guide.md)
- [Scripts de Atendimento](../scripts/call-scripts.md)
- [Manual LGPD](../compliance/lgpd-reception-guide.md)
- [Procedimentos de Emergência](../procedures/emergency-procedures.md)

#### Ferramentas Úteis

- Calculadora de horários
- Gerador de confirmações
- Sistema de pesquisa rápida
- Templates de comunicação
- Checklists diários

---

## 🎯 Próximos Passos

1. **Complete seu treinamento** inicial de onboarding
2. **Configure sua estação de trabalho** adequadamente
3. **Memorize os scripts padrão** de atendimento
4. **Pratique o sistema de agendamento**
5. **Familiarize-se com os procedimentos** de emergência
6. **Participe das atualizações** contínuas
7. **Mantenha excelente atendimento** ao cliente

**Bem-vindo à equipe de recepção NeonPro!** 🚀
