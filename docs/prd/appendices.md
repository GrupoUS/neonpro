# Appendices

### API Specifications

#### Authentication Endpoints

```yaml
# OpenAPI 3.0 Specification
openapi: 3.0.0
info:
  title: NeonPro API
  version: 2.0.0
  description: Comprehensive aesthetic clinic management system

paths:
  /api/auth/login:
    post:
      summary: User authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                clinicId:
                  type: string
                  format: uuid
              required: [email, password]
      responses:
        '200':
          description: Successful authentication
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  refreshToken:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
                  clinic:
                    $ref: '#/components/schemas/Clinic'
        '401':
          description: Invalid credentials
        '429':
          description: Too many attempts
```

#### Patient Management Endpoints

```yaml
  /api/patients:
    get:
      summary: List patients
      parameters:
        - name: clinicId
          in: query
          required: true
          schema:
            type: string
            format: uuid
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Paginated list of patients
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Patient'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
    
    post:
      summary: Create new patient
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePatientRequest'
      responses:
        '201':
          description: Patient created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Patient'
        '400':
          description: Validation error
        '409':
          description: Patient already exists
```

#### AI Services Endpoints

```yaml
  /api/ai/chat:
    post:
      summary: Process AI chat message
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  maxLength: 1000
                sessionId:
                  type: string
                  format: uuid
                patientId:
                  type: string
                  format: uuid
                clinicId:
                  type: string
                  format: uuid
                context:
                  type: object
              required: [message, sessionId, clinicId]
      responses:
        '200':
          description: AI response generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  intent:
                    type: string
                    enum: [appointment, information, emergency, general]
                  confidence:
                    type: number
                    minimum: 0
                    maximum: 1
                  actions:
                    type: array
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                        parameters:
                          type: object
                  sessionId:
                    type: string
                    format: uuid

  /api/ai/predict-noshow:
    post:
      summary: Predict no-show probability
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                patientId:
                  type: string
                  format: uuid
                appointmentData:
                  type: object
                  properties:
                    scheduledAt:
                      type: string
                      format: date-time
                    serviceId:
                      type: string
                      format: uuid
                    professionalId:
                      type: string
                      format: uuid
              required: [patientId, appointmentData]
      responses:
        '200':
          description: No-show prediction generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  riskScore:
                    type: number
                    minimum: 0
                    maximum: 1
                  riskLevel:
                    type: string
                    enum: [low, medium, high, critical]
                  factors:
                    type: array
                    items:
                      type: object
                      properties:
                        factor:
                          type: string
                        impact:
                          type: number
                        description:
                          type: string
                  recommendations:
                    type: array
                    items:
                      type: object
                      properties:
                        action:
                          type: string
                        priority:
                          type: integer
                        description:
                          type: string
                  modelVersion:
                    type: string
                  confidence:
                    type: number
                    minimum: 0
                    maximum: 1
```

### Data Models

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [super_admin, clinic_admin, doctor, receptionist, user]
        clinicId:
          type: string
          format: uuid
        profile:
          type: object
        permissions:
          type: array
          items:
            type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, email, name, role]
    
    Clinic:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        cnpj:
          type: string
          pattern: '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$'
        address:
          type: object
          properties:
            street:
              type: string
            number:
              type: string
            complement:
              type: string
            neighborhood:
              type: string
            city:
              type: string
            state:
              type: string
            zipCode:
              type: string
        phone:
          type: string
        email:
          type: string
          format: email
        settings:
          type: object
        subscriptionPlan:
          type: string
          enum: [basic, professional, enterprise]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name, cnpj]
    
    Patient:
      type: object
      properties:
        id:
          type: string
          format: uuid
        clinicId:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        cpf:
          type: string
          pattern: '^\d{3}\.\d{3}\.\d{3}-\d{2}$'
        birthDate:
          type: string
          format: date
        gender:
          type: string
          enum: [male, female, other, prefer_not_to_say]
        address:
          $ref: '#/components/schemas/Address'
        medicalHistory:
          type: object
        preferences:
          type: object
        behaviorProfile:
          type: object
        emergencyContact:
          type: object
          properties:
            name:
              type: string
            phone:
              type: string
            relationship:
              type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, clinicId, name, phone]
    
    Appointment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        clinicId:
          type: string
          format: uuid
        patientId:
          type: string
          format: uuid
        professionalId:
          type: string
          format: uuid
        serviceId:
          type: string
          format: uuid
        scheduledAt:
          type: string
          format: date-time
        duration:
          type: integer
          minimum: 15
          maximum: 480
        status:
          type: string
          enum: [scheduled, confirmed, in_progress, completed, cancelled, no_show]
        notes:
          type: string
        metadata:
          type: object
        riskScore:
          type: number
          minimum: 0
          maximum: 1
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, clinicId, patientId, scheduledAt, duration, status]
```

## Appendix C: Compliance Documentation

### LGPD Compliance Checklist

#### Data Processing Lawful Basis
- ✅ **Consent**: Explicit consent for marketing communications
- ✅ **Contract**: Patient treatment and appointment management
- ✅ **Legal Obligation**: Medical record keeping requirements
- ✅ **Vital Interests**: Emergency medical situations
- ✅ **Public Interest**: Public health reporting when required
- ✅ **Legitimate Interest**: Fraud prevention and system security

#### Data Subject Rights Implementation

```typescript
// LGPD Rights Implementation
interface LGPDRights {
  // Right to Access (Art. 18, I)
  dataAccess: {
    endpoint: '/api/lgpd/data-access';
    method: 'GET';
    authentication: 'required';
    response: 'Complete personal data export';
    timeframe: '15 days';
  };
  
  // Right to Rectification (Art. 18, III)
  dataRectification: {
    endpoint: '/api/lgpd/data-rectification';
    method: 'PUT';
    authentication: 'required';
    validation: 'Identity verification required';
    timeframe: '15 days';
  };
  
  // Right to Erasure (Art. 18, VI)
  dataErasure: {
    endpoint: '/api/lgpd/data-erasure';
    method: 'DELETE';
    authentication: 'required';
    exceptions: 'Legal retention requirements';
    timeframe: '15 days';
  };
  
  // Right to Portability (Art. 18, V)
  dataPortability: {
    endpoint: '/api/lgpd/data-export';
    method: 'GET';
    format: 'JSON | CSV | XML';
    authentication: 'required';
    timeframe: '15 days';
  };
}
```

#### Data Protection Impact Assessment (DPIA)

```yaml
DPIA_Assessment:
  processing_purpose: "Aesthetic clinic management and patient care"
  data_categories:
    - personal_identification: "Name, CPF, email, phone"
    - health_data: "Medical history, treatment records"
    - biometric_data: "Photos for AR simulation (with explicit consent)"
    - behavioral_data: "Appointment patterns, communication preferences"
  
  risk_assessment:
    high_risk_factors:
      - health_data_processing: "Special category data under LGPD"
      - automated_decision_making: "AI-based no-show predictions"
      - biometric_processing: "Facial recognition for AR features"
    
    mitigation_measures:
      - encryption: "AES-256 for data at rest and in transit"
      - access_controls: "Role-based permissions with audit logs"
      - anonymization: "Statistical analysis on anonymized datasets"
      - consent_management: "Granular consent with easy withdrawal"
  
  legal_basis_mapping:
    treatment_data: "Contract performance (Art. 7, V)"
    marketing_data: "Consent (Art. 7, I)"
    security_logs: "Legitimate interest (Art. 7, IX)"
    financial_data: "Legal obligation (Art. 7, II)"
```

### ANVISA Compliance Framework

#### Medical Device Classification
- **Classification**: Class I Medical Device Software
- **Risk Level**: Low risk (non-invasive, administrative)
- **Registration**: Required under RDC 185/2001
- **Quality System**: ISO 13485 implementation

#### Clinical Evidence Requirements

```yaml
Clinical_Evidence:
  ai_features:
    no_show_prediction:
      study_type: "Retrospective analysis"
      sample_size: "1000+ appointments"
      primary_endpoint: "Prediction accuracy >85%"
      secondary_endpoints:
        - "False positive rate <10%"
        - "Clinical utility demonstration"
      duration: "6 months post-deployment"
    
    ar_simulator:
      study_type: "Usability study"
      sample_size: "100+ patients"
      primary_endpoint: "User satisfaction >4.0/5"
      secondary_endpoints:
        - "Accuracy of simulation vs. actual results"
        - "Impact on informed consent process"
      duration: "3 months"
  
  post_market_surveillance:
    adverse_events: "Systematic collection and reporting"
    performance_monitoring: "Continuous accuracy tracking"
    user_feedback: "Structured feedback collection"
    corrective_actions: "Rapid response protocol"
```

#### Quality Management System

```typescript
// ISO 13485 Implementation
interface QualityManagement {
  documentControl: {
    procedures: 'Documented and version controlled';
    training: 'Staff training on quality procedures';
    audits: 'Internal audits every 6 months';
    management_review: 'Quarterly management reviews';
  };
  
  riskManagement: {
    standard: 'ISO 14971 - Medical devices risk management';
    riskAnalysis: 'Systematic hazard identification';
    riskControl: 'Risk mitigation measures implementation';
    postMarketSurveillance: 'Continuous risk monitoring';
  };
  
  softwareLifecycle: {
    standard: 'IEC 62304 - Medical device software lifecycle';
    planning: 'Software development planning';
    requirements: 'Software requirements analysis';
    architecture: 'Software architectural design';
    implementation: 'Software detailed design and implementation';
    integration: 'Software integration and integration testing';
    testing: 'Software system testing';
    release: 'Software release';
  };
}
```

## Appendix D: Glossary

### Technical Terms

**API (Application Programming Interface)**: Interface que permite comunicação entre diferentes sistemas de software.

**CI/CD (Continuous Integration/Continuous Deployment)**: Práticas de desenvolvimento que automatizam integração e deploy de código.

**CRUD (Create, Read, Update, Delete)**: Operações básicas de manipulação de dados.

**JWT (JSON Web Token)**: Padrão para transmissão segura de informações entre partes.

**ML (Machine Learning)**: Aprendizado de Máquina - subcampo da IA que permite sistemas aprenderem automaticamente.

**ORM (Object-Relational Mapping)**: Técnica que mapeia dados entre sistemas incompatíveis usando linguagens orientadas a objetos.

**PWA (Progressive Web App)**: Aplicação web que usa tecnologias modernas para oferecer experiência similar a apps nativos.

**REST (Representational State Transfer)**: Estilo arquitetural para design de APIs web.

**SLA (Service Level Agreement)**: Acordo de nível de serviço que define métricas de performance esperadas.

**SSR (Server-Side Rendering)**: Renderização do lado do servidor para melhor performance e SEO.

**tRPC**: Framework TypeScript para criação de APIs type-safe end-to-end.

**WebSocket**: Protocolo de comunicação que permite conexão bidirecional em tempo real.

### Business Terms

**ARR (Annual Recurring Revenue)**: Receita recorrente anual.

**CAC (Customer Acquisition Cost)**: Custo de aquisição de cliente.

**Churn Rate**: Taxa de cancelamento ou perda de clientes.

**LTV (Lifetime Value)**: Valor total que um cliente gera durante seu relacionamento com a empresa.

**MRR (Monthly Recurring Revenue)**: Receita recorrente mensal.

**No-Show**: Falta do paciente ao agendamento sem cancelamento prévio.

**ROI (Return on Investment)**: Retorno sobre investimento.

**SaaS (Software as a Service)**: Modelo de distribuição de software como serviço.

**TAM (Total Addressable Market)**: Mercado total endereçável.

**SAM (Serviceable Addressable Market)**: Mercado endereçável disponível.

### Healthcare Terms

**ANVISA**: Agência Nacional de Vigilância Sanitária - órgão regulador brasileiro.

**LGPD**: Lei Geral de Proteção de Dados - legislação brasileira de privacidade.

**Prontuário Eletrônico**: Registro digital das informações de saúde do paciente.

**Telemedicina**: Prática médica à distância usando tecnologias de comunicação.

## Appendix E: References

### Technical Documentation

1. **Next.js Documentation**: https://nextjs.org/docs
2. **React Documentation**: https://react.dev/
3. **Supabase Documentation**: https://supabase.com/docs
4. **OpenAI API Documentation**: https://platform.openai.com/docs
5. **PostgreSQL Documentation**: https://www.postgresql.org/docs/
6. **TypeScript Documentation**: https://www.typescriptlang.org/docs/
7. **Tailwind CSS Documentation**: https://tailwindcss.com/docs
8. **Prisma Documentation**: https://www.prisma.io/docs
9. **tRPC Documentation**: https://trpc.io/docs
10. **Vercel Documentation**: https://vercel.com/docs

### Regulatory References

1. **LGPD - Lei 13.709/2018**: Lei Geral de Proteção de Dados Pessoais
2. **ANVISA RDC 185/2001**: Registro de produtos médicos
3. **CFM Resolução 1.643/2002**: Prontuário médico
4. **CFM Resolução 2.314/2022**: Telemedicina
5. **ISO 13485:2016**: Quality management systems for medical devices
6. **ISO 14971:2019**: Medical devices - Risk management
7. **IEC 62304:2006**: Medical device software lifecycle processes
8. **ISO 27001:2013**: Information security management systems

### Industry Standards

1. **HL7 FHIR**: Healthcare interoperability standard
2. **DICOM**: Digital imaging and communications in medicine
3. **SNOMED CT**: Systematized nomenclature of medicine clinical terms
4. **ICD-10**: International classification of diseases
5. **WCAG 2.1**: Web content accessibility guidelines
6. **OWASP**: Open web application security project
7. **NIST Cybersecurity Framework**: National institute of standards and technology
8. **SOC 2**: Service organization control 2

### Research Papers

1. "Machine Learning for Healthcare: A Comprehensive Survey" - Nature Medicine, 2023
2. "No-Show Prediction in Healthcare: A Systematic Review" - Journal of Medical Internet Research, 2022
3. "Augmented Reality in Aesthetic Medicine: Current Applications and Future Prospects" - Aesthetic Surgery Journal, 2023
4. "AI-Powered Chatbots in Healthcare: A Systematic Review" - JMIR Medical Informatics, 2022
5. "Privacy-Preserving Machine Learning in Healthcare" - IEEE Transactions on Biomedical Engineering, 2023

### Market Research

1. **Grand View Research**: Aesthetic Medicine Market Report 2023
2. **McKinsey & Company**: Digital Health in Brazil - Market Analysis 2023
3. **Deloitte**: Healthcare Technology Trends 2023
4. **PwC**: AI in Healthcare - Global Survey 2023
5. **Frost & Sullivan**: Brazilian Healthcare IT Market Analysis 2023

---

**Document Version**: 2.0
**Last Updated**: January 2024
**Next Review**: April 2024
**Document Owner**: Product Management Team
**Approval**: CTO, CPO, Legal Team