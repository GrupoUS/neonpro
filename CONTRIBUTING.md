# 🤝 Contributing Guide - NeonPro Healthcare Platform

## 📋 Índice

1. [Bem-vindo](#-bem-vindo)
2. [Código de Conduta](#-código-de-conduta)
3. [Como Contribuir](#-como-contribuir)
4. [Padrões de Desenvolvimento](#-padrões-de-desenvolvimento)
5. [Processo de Review](#-processo-de-review)
6. [Configuração do Ambiente](#-configuração-do-ambiente)
7. [Testes](#-testes)
8. [Documentação](#-documentação)
9. [Compliance](#-compliance)

## 🌟 Bem-vindo

Obrigado pelo interesse em contribuir com o **NeonPro Healthcare Platform**! Este projeto é um sistema crítico de saúde que deve manter os mais altos padrões de qualidade, segurança e compliance regulatório.

### Tipos de Contribuição
- 🐛 **Bug Reports** - Relatar problemas encontrados
- ✨ **Feature Requests** - Sugerir novas funcionalidades
- 💡 **Improvements** - Melhorias na performance ou UX
- 📚 **Documentation** - Melhorar a documentação
- 🔒 **Security** - Questões de segurança (processo especial)
- 🧪 **Testing** - Adicionar ou melhorar testes

### ⚠️ Considerações Especiais
Por se tratar de um sistema healthcare:
- **Compliance é obrigatório** (LGPD, ANVISA, CFM)
- **Testes rigorosos** são essenciais
- **Segurança** tem prioridade máxima
- **Dados sensíveis** nunca devem ser expostos

## 📜 Código de Conduta

### Nossos Compromissos
- Manter um ambiente profissional e respeitoso
- Focar na qualidade e segurança do software
- Respeitar a privacidade e confidencialidade dos dados
- Seguir todas as regulamentações aplicáveis
- Ser inclusivo e acolhedor a todos os contribuidores

### Comportamentos Esperados
- ✅ Comunicação clara e profissional
- ✅ Respeito a opiniões e experiências diferentes
- ✅ Aceitar críticas construtivas
- ✅ Focar no que é melhor para o projeto e usuários
- ✅ Manter confidencialidade sobre questões sensíveis

### Comportamentos Inaceitáveis
- ❌ Linguagem ou comportamento discriminatório
- ❌ Ataques pessoais ou políticos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas sem permissão
- ❌ Compartilhar dados de saúde ou informações confidenciais

## 🚀 Como Contribuir

### 1. Reportar Bugs

#### Template para Bug Reports
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Reproduzir o Bug**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots/Vídeos**
Se aplicável, adicione screenshots para explicar o problema.

**Ambiente**
- OS: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Versão: [ex: v1.2.3]
- User Role: [ex: DOCTOR, NURSE] (se aplicável)

**Dados Adicionais**
Qualquer contexto adicional sobre o problema.

**Compliance Impact**
- [ ] Pode afetar LGPD compliance
- [ ] Pode afetar ANVISA compliance  
- [ ] Pode afetar CFM compliance
- [ ] Sem impacto de compliance
```

#### Para Bugs de Segurança
```markdown
⚠️ ATENÇÃO: Para questões de segurança, NÃO crie issues públicas.
Envie email para: security@neonpro.com.br

Inclua:
- Descrição detalhada da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestões de correção (se houver)
```

### 2. Solicitar Features

#### Template para Feature Requests
```markdown
**É relacionado a um problema? Descreva.**
Descrição clara do problema. Ex: "Fico frustrado quando [...]"

**Solução Desejada**
Descrição clara da solução que você gostaria.

**Alternativas Consideradas**
Descrição de soluções ou features alternativas.

**Compliance Requirements**
- [ ] Deve atender LGPD
- [ ] Deve atender ANVISA
- [ ] Deve atender CFM
- [ ] Requer auditoria de segurança

**Contexto Adicional**
Screenshots, mockups, ou contexto adicional sobre a feature.

**Impacto**
- [ ] Crítico - Impacta patient safety
- [ ] Alto - Melhora significativa da UX
- [ ] Médio - Nice to have
- [ ] Baixo - Conveniência
```

### 3. Contribuir com Código

#### Fluxo de Contribuição
1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature
4. **Implemente** as mudanças
5. **Teste** rigorosamente
6. **Documente** as mudanças
7. **Submeta** um Pull Request

#### Exemplo de Workflow
```bash
# 1. Fork no GitHub e clone
git clone https://github.com/seu-usuario/neonpro.git
cd neonpro

# 2. Configurar upstream
git remote add upstream https://github.com/original/neonpro.git

# 3. Criar branch
git checkout -b feature/nova-funcionalidade

# 4. Fazer mudanças
# ... desenvolver ...

# 5. Commit
git add .
git commit -m "feat: adicionar nova funcionalidade de agendamento"

# 6. Push para seu fork
git push origin feature/nova-funcionalidade

# 7. Criar Pull Request no GitHub
```

## 💻 Padrões de Desenvolvimento

### Estrutura de Commit Messages

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos Permitidos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Mudanças de estilo (formatação, etc)
- `refactor`: Refatoração de código
- `test`: Adicionar ou modificar testes
- `chore`: Mudanças na configuração, build, etc
- `security`: Mudanças relacionadas à segurança
- `compliance`: Mudanças para atender regulamentações

#### Exemplos
```bash
feat(patient): adicionar validação de CPF no cadastro
fix(appointment): corrigir bug de timezone em agendamentos
docs(api): atualizar documentação da API de prontuários
security(auth): implementar rate limiting no login
compliance(lgpd): adicionar logs de auditoria para acesso a dados
```

### Naming Conventions

#### Branches
```bash
# Features
feature/patient-registration
feature/appointment-scheduling
feature/inventory-management

# Bug fixes
fix/appointment-timezone-bug
fix/patient-search-performance

# Hotfixes
hotfix/security-vulnerability
hotfix/critical-data-loss

# Compliance
compliance/lgpd-consent-management
compliance/anvisa-product-tracking
```

#### Files e Folders
```typescript
// Components - PascalCase
PatientRegistration.tsx
AppointmentCalendar.tsx
InventoryTable.tsx

// Hooks - camelCase starting with 'use'
usePatients.ts
useAppointments.ts
useInventory.ts

// Utils - camelCase
dateUtils.ts
validationUtils.ts
complianceUtils.ts

// Types - PascalCase
PatientTypes.ts
AppointmentTypes.ts
```

### Code Style

#### TypeScript/React
```typescript
// ✅ Bom
interface PatientData {
  id: string
  firstName: string
  lastName: string
  cpf: string
  birthDate: Date
  medicalRecordNumber: string
}

const PatientCard: React.FC<{ patient: PatientData }> = ({ patient }) => {
  const formatCPF = (cpf: string): string => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <Card>
      <CardHeader>
        <h3>{patient.firstName} {patient.lastName}</h3>
        <p>CPF: {formatCPF(patient.cpf)}</p>
      </CardHeader>
    </Card>
  )
}

// ❌ Ruim
const patient_card = (props: any) => {
  let cpf = props.patient.cpf
  cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') // Mutação direta
  
  return <div>{props.patient.firstName}</div> // Sem tipagem
}
```

#### Error Handling
```typescript
// ✅ Bom - Error handling completo
const createPatient = async (patientData: PatientData): Promise<Patient> => {
  try {
    // Validação de entrada
    if (!patientData.cpf || !isValidCPF(patientData.cpf)) {
      throw new ValidationError('CPF inválido')
    }

    // Verificar duplicatas
    const existingPatient = await findPatientByCPF(patientData.cpf)
    if (existingPatient) {
      throw new ConflictError('Paciente já existe com este CPF')
    }

    // Criar paciente
    const patient = await patientService.create(patientData)
    
    // Log de auditoria (LGPD compliance)
    await auditLog.create({
      action: 'CREATE_PATIENT',
      userId: getCurrentUser().id,
      resourceId: patient.id,
      legalBasis: 'MEDICAL_TREATMENT'
    })

    return patient
  } catch (error) {
    // Log erro para monitoramento
    logger.error('Failed to create patient', { 
      error: error.message, 
      patientCPF: patientData.cpf?.substring(0, 3) + '***' // Mascarar dados sensíveis
    })

    // Re-throw para tratamento na UI
    throw error
  }
}

// ❌ Ruim - Sem tratamento de erro
const createPatient = async (patientData: any) => {
  const patient = await patientService.create(patientData) // Pode falhar
  return patient
}
```

### Security Guidelines

#### Dados Sensíveis
```typescript
// ✅ Bom - Nunca logar dados completos
logger.info('Patient created', {
  patientId: patient.id,
  cpf: maskCPF(patient.cpf), // 123.***.**-**
  actionBy: user.id
})

// ❌ Ruim - Dados sensíveis no log
logger.info('Patient created', {
  patient: patient // Contém CPF, email, etc completos
})

// ✅ Bom - Validação de entrada
const validateCPF = (cpf: string): boolean => {
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  
  // Validações
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false // 111.111.111-11
  
  // Algoritmo de validação
  return isValidCPFChecksum(cleanCPF)
}

// ❌ Ruim - Sem validação
const saveCPF = (cpf: string) => {
  database.save({ cpf }) // Pode salvar CPF inválido
}
```

#### SQL Injection Prevention
```typescript
// ✅ Bom - Usando Prisma (SQL injection safe)
const findPatients = async (searchTerm: string) => {
  return await prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }
  })
}

// ❌ Ruim - SQL injection vulnerability
const findPatients = async (searchTerm: string) => {
  const query = `SELECT * FROM patients WHERE name LIKE '%${searchTerm}%'`
  return await database.raw(query) // VULNERÁVEL!
}
```

## 🧪 Testes

### Tipos de Teste Requeridos

#### 1. Unit Tests
```typescript
// __tests__/utils/cpfValidation.test.ts
import { validateCPF, maskCPF } from '@/lib/utils/cpfValidation'

describe('CPF Validation', () => {
  describe('validateCPF', () => {
    test('should validate correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true)
    })

    test('should reject invalid CPF', () => {
      expect(validateCPF('12345678900')).toBe(false)
    })

    test('should reject sequential numbers', () => {
      expect(validateCPF('11111111111')).toBe(false)
    })

    test('should handle formatted CPF', () => {
      expect(validateCPF('111.444.777-35')).toBe(true)
    })
  })

  describe('maskCPF', () => {
    test('should mask CPF for privacy', () => {
      expect(maskCPF('11144477735')).toBe('111.***.*77-**')
    })
  })
})
```

#### 2. Integration Tests
```typescript
// __tests__/api/patients.test.ts
import { createMocks } from 'node-mocks-http'
import patientsHandler from '@/pages/api/patients'
import { prisma } from '@/lib/prisma'

describe('/api/patients', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.patient.deleteMany()
  })

  test('POST should create patient with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '11144477735',
        email: 'joao@email.com',
        birthDate: '1990-01-01'
      }
    })

    await patientsHandler(req, res)

    expect(res._getStatusCode()).toBe(201)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData.success).toBe(true)
    expect(responseData.data.patient.firstName).toBe('João')
  })

  test('POST should reject invalid CPF', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '12345678900', // CPF inválido
        email: 'joao@email.com'
      }
    })

    await patientsHandler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData())
    expect(responseData.success).toBe(false)
    expect(responseData.error.message).toContain('CPF inválido')
  })
})
```

#### 3. E2E Tests
```typescript
// __tests__/e2e/patient-registration.test.ts
import { test, expect } from '@playwright/test'

test.describe('Patient Registration', () => {
  test('should register new patient successfully', async ({ page }) => {
    await page.goto('/patients/new')

    // Preencher formulário
    await page.fill('[name="firstName"]', 'Maria')
    await page.fill('[name="lastName"]', 'Santos')
    await page.fill('[name="cpf"]', '111.444.777-35')
    await page.fill('[name="email"]', 'maria@email.com')
    await page.fill('[name="birthDate"]', '1985-06-15')

    // Aceitar termos LGPD
    await page.check('[name="lgpdConsent"]')

    // Submeter formulário
    await page.click('button[type="submit"]')

    // Verificar sucesso
    await expect(page.locator('.success-message')).toBeVisible()
    await expect(page).toHaveURL(/\/patients\/\w+/)
  })

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/patients/new')

    // Preencher CPF inválido
    await page.fill('[name="cpf"]', '123.456.789-00')
    await page.click('button[type="submit"]')

    // Verificar erro
    await expect(page.locator('.error-message')).toContainText('CPF inválido')
  })
})
```

### Coverage Requirements
- **Minimum**: 80% line coverage
- **Recommended**: 90% line coverage
- **Critical paths**: 100% coverage (authentication, billing, compliance)

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📚 Documentação

### Documentar Mudanças

#### API Changes
- Atualizar [API.md](./API.md)
- Adicionar exemplos de uso
- Documentar breaking changes
- Incluir códigos de erro

#### Compliance Changes
- Atualizar [COMPLIANCE.md](./COMPLIANCE.md)
- Documentar impacto regulatório
- Adicionar novos controles
- Revisar checklist

#### Code Documentation
```typescript
/**
 * Cria um novo paciente no sistema
 * 
 * @param patientData - Dados do paciente a ser criado
 * @returns Promise que resolve para o paciente criado
 * 
 * @throws {ValidationError} Quando dados são inválidos
 * @throws {ConflictError} Quando paciente já existe
 * 
 * @compliance LGPD - Logs de auditoria são criados automaticamente
 * @compliance CFM - Dados obrigatórios são validados
 * 
 * @example
 * ```typescript
 * const patient = await createPatient({
 *   firstName: 'João',
 *   lastName: 'Silva',
 *   cpf: '11144477735',
 *   email: 'joao@email.com'
 * })
 * ```
 */
export const createPatient = async (patientData: PatientData): Promise<Patient> => {
  // Implementation...
}
```

## 🔒 Compliance

### LGPD Requirements
- [ ] Dados pessoais são minimizados
- [ ] Base legal é identificada
- [ ] Consentimento é obtido quando necessário
- [ ] Logs de auditoria são criados
- [ ] Dados sensíveis são mascarados em logs

### ANVISA Requirements
- [ ] Produtos são rastreáveis por lote
- [ ] Datas de validade são controladas
- [ ] Medicamentos controlados têm processo específico
- [ ] Relatórios regulatórios são gerados

### CFM Requirements
- [ ] Prontuários seguem estrutura CFM
- [ ] Assinatura digital é implementada
- [ ] Acesso é auditado
- [ ] Sigilo médico é mantido

### Security Checklist
- [ ] Input validation implementada
- [ ] Output encoding aplicado
- [ ] Authentication/Authorization testada
- [ ] Rate limiting configurado
- [ ] Error handling não vaza informações
- [ ] Logs não contêm dados sensíveis

## 🔍 Processo de Review

### Pull Request Template
```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação
- [ ] Compliance/Segurança

## Como Testar
Passos para testar as mudanças:
1. Vá para '...'
2. Clique em '...'
3. Veja que '...'

## Checklist
- [ ] Código segue style guide do projeto
- [ ] Self-review realizada
- [ ] Código comentado em partes difíceis
- [ ] Documentação atualizada
- [ ] Testes passando
- [ ] Coverage mantido/aumentado
- [ ] Compliance checklist verificado

## Compliance Impact
- [ ] LGPD - Não afeta/Conforme/Requer revisão
- [ ] ANVISA - Não afeta/Conforme/Requer revisão
- [ ] CFM - Não afeta/Conforme/Requer revisão
- [ ] Security - Não afeta/Conforme/Requer revisão

## Breaking Changes
Listar breaking changes e guia de migração (se aplicável).

## Screenshots/Videos
Adicionar screenshots ou vídeos das mudanças (se aplicável).
```

### Review Process

#### 1. Automated Checks
- ✅ **Linting** - BiomeJS/ESLint pass
- ✅ **Type Check** - TypeScript compilation
- ✅ **Tests** - Unit/Integration tests pass
- ✅ **Build** - Application builds successfully
- ✅ **Security** - Security scan passes

#### 2. Manual Review
- 📝 **Code Quality** - Clean, maintainable code
- 🔒 **Security** - No security vulnerabilities
- 📋 **Compliance** - Regulatory requirements met
- 📚 **Documentation** - Adequate documentation
- 🧪 **Testing** - Appropriate test coverage

#### 3. Approval Requirements
- **1 Approval** - For documentation/small fixes
- **2 Approvals** - For features/refactoring
- **3 Approvals** - For breaking changes/security

### Review Guidelines for Reviewers

#### Security Review
```typescript
// ✅ Check for input validation
const validateInput = (input: string) => {
  if (!input || input.trim() === '') {
    throw new ValidationError('Input required')
  }
  // More validation...
}

// ✅ Check for proper error handling
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', { error: error.message }) // Don't log sensitive data
  throw new ServiceError('Operation failed')
}

// ✅ Check for SQL injection prevention
const patients = await prisma.patient.findMany({
  where: { name: { contains: searchTerm } } // Parameterized query
})
```

#### Compliance Review
```typescript
// ✅ Check for audit logging
await auditLog.create({
  action: 'ACCESS_PATIENT_DATA',
  userId: user.id,
  resourceId: patient.id,
  legalBasis: 'MEDICAL_TREATMENT'
})

// ✅ Check for data minimization
const publicPatientData = {
  id: patient.id,
  firstName: patient.firstName,
  lastName: patient.lastName
  // Don't expose CPF, medical data unless necessary
}
```

## ⚙️ Configuração do Ambiente

### Local Development Setup
```bash
# 1. Fork e clone
git clone https://github.com/seu-usuario/neonpro.git
cd neonpro

# 2. Instalar dependências
npm install

# 3. Setup ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Iniciar desenvolvimento
npm run dev
```

### IDE Configuration

#### VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

#### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true
}
```

## 🚀 Release Process

### Versioning
Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0) - Breaking changes
- **MINOR** (x.Y.0) - New features (backward compatible)
- **PATCH** (x.y.Z) - Bug fixes (backward compatible)

### Release Checklist
- [ ] Todos os testes passando
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Security review completo
- [ ] Compliance validation
- [ ] Performance testing
- [ ] Database migrations testadas
- [ ] Rollback plan definido

---

## 🤝 Suporte

### Para Contribuidores
- **Issues**: [GitHub Issues](https://github.com/org/neonpro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/org/neonpro/discussions)
- **Email**: contributors@neonpro.com.br

### Para Questões de Segurança
- **Email**: security@neonpro.com.br
- **PGP Key**: [security-key.asc](./security-key.asc)

### Para Compliance
- **DPO**: dpo@neonpro.com.br
- **Compliance Officer**: compliance@neonpro.com.br

---

**Obrigado por contribuir com o NeonPro! Juntos construímos uma plataforma healthcare mais segura e eficiente. 🏥💙**