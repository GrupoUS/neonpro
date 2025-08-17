# 🏥 NeonPro Medical History & Records System

## 📋 Visão Geral

O Sistema de Histórico Médico e Registros do NeonPro é uma solução completa e segura para gerenciamento de informações médicas, projetada especificamente para clínicas estéticas. O sistema oferece funcionalidades avançadas de armazenamento, versionamento, assinatura digital e conformidade com a LGPD.

## ✨ Funcionalidades Principais

### 📝 Registros Médicos

- **Criação e Edição**: Interface intuitiva para criar e editar registros médicos
- **Versionamento**: Controle completo de versões com histórico de alterações
- **Categorização**: Sistema de tags e categorias para organização
- **Busca Avançada**: Pesquisa por conteúdo, tags, datas e categorias
- **Anexos**: Suporte para documentos, imagens e vídeos

### 📚 Histórico Médico

- **Condições Médicas**: Registro de alergias, medicamentos, cirurgias
- **Linha do Tempo**: Visualização cronológica do histórico
- **Severidade**: Classificação por níveis de severidade
- **Status**: Controle de condições ativas/inativas
- **Relacionamentos**: Vinculação entre condições e tratamentos

### 📎 Gerenciamento de Documentos

- **Upload Seguro**: Armazenamento criptografado no Supabase Storage
- **Fotos Antes/Depois**: Sistema especializado para procedimentos estéticos
- **Versionamento**: Controle de versões de documentos
- **Miniaturas**: Geração automática de thumbnails
- **Controle de Acesso**: Permissões granulares por documento

### ✍️ Assinatura Digital

- **Múltiplos Tipos**: Certificado digital, eletrônica, biométrica, PIN
- **Validação**: Verificação de integridade e autenticidade
- **Solicitações**: Sistema de workflow para múltiplos signatários
- **Auditoria**: Log completo de todas as assinaturas
- **Conformidade**: Atende aos padrões legais brasileiros

### 📋 Formulários de Consentimento

- **Construtor Visual**: Interface drag-and-drop para criar formulários
- **Templates**: Modelos pré-configurados para diferentes procedimentos
- **LGPD**: Integração completa com requisitos de proteção de dados
- **Versionamento**: Controle de versões de formulários
- **Análises**: Dashboard com métricas de consentimentos

## 🏗️ Arquitetura

### 📁 Estrutura de Arquivos

```
lib/medical/
├── medical-records.ts          # Gerenciador principal de registros
├── document-manager.ts         # Gerenciamento de documentos
├── digital-signature.ts        # Sistema de assinatura digital
├── consent-forms.ts           # Formulários de consentimento
├── database/
│   └── medical-schema.sql     # Schema do banco de dados
└── __tests__/
    └── medical-records.test.ts # Testes unitários

components/medical/
├── medical-records-form.tsx    # Formulário de registros
├── medical-history-manager.tsx # Gerenciador de histórico
├── document-upload.tsx         # Upload de documentos
├── digital-signature.tsx       # Interface de assinatura
└── consent-form.tsx           # Formulários de consentimento
```

### 🗄️ Banco de Dados

#### Tabelas Principais

- `medical_records` - Registros médicos principais
- `medical_history` - Histórico médico do paciente
- `medical_documents` - Documentos e anexos
- `digital_signatures` - Assinaturas digitais
- `consent_forms` - Formulários de consentimento
- `consent_responses` - Respostas dos formulários

#### Recursos Avançados

- **RLS (Row Level Security)**: Segurança a nível de linha
- **Triggers**: Automação de versionamento e auditoria
- **Índices**: Otimização para buscas complexas
- **Funções**: Lógica de negócio no banco
- **Cron Jobs**: Tarefas automatizadas

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

```bash
# Node.js 18+
# Supabase CLI
# PostgreSQL 14+
```

### 2. Configuração do Banco

```bash
# Execute o schema SQL
psql -d your_database -f lib/medical/database/medical-schema.sql
```

### 3. Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Storage
MEDICAL_STORAGE_BUCKET=medical-documents
MAX_FILE_SIZE=10485760  # 10MB

# Assinatura Digital
DIGITAL_SIGNATURE_PROVIDER=your_provider
SIGNATURE_CERTIFICATE_PATH=path_to_certificate

# LGPD
LGPD_ENABLED=true
DATA_RETENTION_YEARS=20
```

### 4. Instalação de Dependências

```bash
npm install @supabase/supabase-js
npm install lucide-react
npm install date-fns
npm install crypto-js
```

## 💻 Uso da API

### Registros Médicos

```typescript
import { MedicalRecordsManager } from '@/lib/medical/medical-records';

const manager = new MedicalRecordsManager();

// Criar registro
const result = await manager.createMedicalRecord(
  {
    patientId: 'patient-123',
    clinicId: 'clinic-456',
    type: 'consultation',
    title: 'Consulta de Avaliação',
    content: 'Paciente interessado em procedimento de harmonização facial',
    priority: 'normal',
    tags: ['avaliacao', 'harmonizacao'],
    metadata: {
      procedureType: 'facial_harmonization',
      estimatedCost: 2500,
    },
  },
  'user-789'
);

if (result.success) {
  console.log('Registro criado:', result.data);
}
```

### Upload de Documentos

```typescript
import { MedicalDocumentManager } from '@/lib/medical/document-manager';

const docManager = new MedicalDocumentManager();

// Upload de documento
const file = new File([blob], 'exame.pdf', { type: 'application/pdf' });

const result = await docManager.uploadDocument(
  {
    patientId: 'patient-123',
    clinicId: 'clinic-456',
    file,
    category: 'exam',
    subcategory: 'blood_test',
    description: 'Exames pré-operatórios',
    tags: ['pre-op', 'blood'],
    accessLevel: 'restricted',
  },
  'user-789'
);
```

### Assinatura Digital

```typescript
import { DigitalSignatureManager } from '@/lib/medical/digital-signature';

const sigManager = new DigitalSignatureManager();

// Assinar documento
const result = await sigManager.signDocument({
  documentId: 'doc-123',
  signerId: 'user-456',
  signerRole: 'patient',
  signatureType: 'digital_certificate',
  certificateData: certificateBlob,
  reason: 'Consentimento para procedimento',
  location: 'Clínica NeonPro',
});
```

### Formulários de Consentimento

```typescript
import { ConsentFormsManager } from '@/lib/medical/consent-forms';

const consentManager = new ConsentFormsManager();

// Criar formulário
const form = await consentManager.createForm(
  {
    title: 'Termo de Consentimento - Botox',
    description: 'Autorização para aplicação de toxina botulínica',
    type: 'treatment_consent',
    category: 'aesthetic',
    content: {
      sections: [
        {
          id: 'patient_info',
          title: 'Informações do Paciente',
          fields: ['name', 'cpf', 'birth_date'],
        },
        {
          id: 'consent',
          title: 'Consentimento',
          fields: ['treatment_consent', 'risks_understood'],
        },
      ],
      fields: [
        {
          id: 'name',
          name: 'patient_name',
          label: 'Nome Completo',
          type: 'text',
          isRequired: true,
        },
        {
          id: 'treatment_consent',
          name: 'treatment_consent',
          label: 'Autorizo o procedimento',
          type: 'consent',
          isRequired: true,
        },
      ],
    },
    legalBasis: [
      {
        type: 'consent',
        description: 'Consentimento do titular',
        article: 'Art. 7º, I da LGPD',
        isRequired: true,
      },
    ],
    dataCategories: ['personal_data', 'health_data'],
    retentionPeriod: 20,
  },
  'user-789'
);
```

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test lib/medical/__tests__/

# Testes com coverage
npm run test:coverage lib/medical/

# Testes específicos
npm run test medical-records.test.ts
```

### Estrutura de Testes

```typescript
// Exemplo de teste
describe('MedicalRecordsManager', () => {
  describe('createMedicalRecord', () => {
    it('should create a medical record successfully', async () => {
      const result = await manager.createMedicalRecord(validData, userId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });
  });
});
```

## 🔒 Segurança e Conformidade

### LGPD (Lei Geral de Proteção de Dados)

- **Consentimento**: Sistema completo de gestão de consentimentos
- **Minimização**: Coleta apenas dados necessários
- **Transparência**: Informações claras sobre uso dos dados
- **Portabilidade**: Exportação de dados em formato estruturado
- **Exclusão**: Direito ao esquecimento implementado
- **Auditoria**: Log completo de todas as operações

### Segurança

- **Criptografia**: Dados sensíveis criptografados em repouso
- **RLS**: Row Level Security no PostgreSQL
- **Autenticação**: Integração com sistema de auth do Supabase
- **Autorização**: Controle granular de permissões
- **Backup**: Sistema automatizado de backup
- **Monitoramento**: Logs de segurança e alertas

### Assinatura Digital

- **ICP-Brasil**: Suporte a certificados digitais brasileiros
- **Timestamping**: Carimbo de tempo para validade legal
- **Hash**: Verificação de integridade com SHA-256
- **Não-repúdio**: Garantia de autoria das assinaturas
- **Arquivamento**: Armazenamento seguro de longo prazo

## 📊 Monitoramento e Analytics

### Métricas Disponíveis

- **Registros**: Total, por tipo, por período
- **Documentos**: Uploads, downloads, tipos de arquivo
- **Assinaturas**: Por método, status, tempo de resposta
- **Consentimentos**: Taxa de aceitação, retiradas
- **Performance**: Tempo de resposta, erros
- **Uso**: Usuários ativos, funcionalidades mais usadas

### Dashboard

```typescript
// Exemplo de métricas
const analytics = await manager.getAnalytics({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  clinicId: 'clinic-123',
});

console.log(analytics.data);
// {
//   totalRecords: 1250,
//   totalDocuments: 3400,
//   totalSignatures: 890,
//   activeConsents: 1100,
//   storageUsed: '2.5 GB',
//   averageResponseTime: '150ms'
// }
```

## 🔧 Configurações Avançadas

### Personalização de Formulários

```typescript
// Configurar validações customizadas
const customValidation: ValidationRule = {
  type: 'custom',
  value: {
    function: 'validateCPF',
    params: { strict: true },
  },
  message: 'CPF inválido',
  isActive: true,
};

// Adicionar campos personalizados
const customField: FormField = {
  id: 'custom_field',
  name: 'procedure_area',
  label: 'Área do Procedimento',
  type: 'select',
  options: [
    { value: 'face', label: 'Facial' },
    { value: 'body', label: 'Corporal' },
    { value: 'hair', label: 'Capilar' },
  ],
  isRequired: true,
  validation: [customValidation],
};
```

### Integração com Sistemas Externos

```typescript
// Webhook para notificações
const webhookConfig = {
  url: 'https://api.clinic.com/webhooks/medical',
  events: ['record.created', 'document.uploaded', 'consent.signed'],
  secret: 'webhook-secret-key',
};

// API externa para validação
const externalValidation = {
  endpoint: 'https://api.cfm.org.br/validate',
  apiKey: 'cfm-api-key',
  timeout: 5000,
};
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Upload de Arquivo

```
Erro: "File size exceeds limit"
Solução: Verificar MAX_FILE_SIZE nas variáveis de ambiente
```

#### 2. Falha na Assinatura Digital

```
Erro: "Certificate validation failed"
Solução: Verificar configuração do certificado e validade
```

#### 3. Erro de Permissão

```
Erro: "Access denied"
Solução: Verificar RLS policies e permissões do usuário
```

### Logs e Debug

```typescript
// Habilitar logs detalhados
process.env.DEBUG_MEDICAL = 'true';

// Verificar logs de auditoria
const auditLogs = await AuditLogger.getLogs({
  entityType: 'medical_record',
  entityId: 'record-123',
  startDate: new Date('2024-01-01'),
});
```

## 📚 Recursos Adicionais

### Documentação

- [API Reference](./docs/api-reference.md)
- [Database Schema](./docs/database-schema.md)
- [Security Guide](./docs/security-guide.md)
- [LGPD Compliance](./docs/lgpd-compliance.md)

### Exemplos

- [Basic Usage](./examples/basic-usage.ts)
- [Advanced Features](./examples/advanced-features.ts)
- [Custom Forms](./examples/custom-forms.ts)
- [Integration Examples](./examples/integrations.ts)

### Suporte

- **Email**: suporte@neonpro.com.br
- **Documentação**: https://docs.neonpro.com.br
- **GitHub Issues**: https://github.com/neonpro/issues
- **Discord**: https://discord.gg/neonpro

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de pull requests.

---

**NeonPro Medical System** - Transformando o cuidado estético com tecnologia de ponta 🚀
