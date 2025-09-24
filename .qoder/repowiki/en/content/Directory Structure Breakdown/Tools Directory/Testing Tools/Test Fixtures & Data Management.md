# Test Fixtures & Data Management

<cite>
**Referenced Files in This Document**
- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts)
- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts)
- [index.ts](file://tools/testing-toolkit/src/fixtures/index.ts)
- [appointment.contract.test.ts](file://apps/api/src/__tests__/contracts/appointment.contract.test.ts)
- [ai-appointment-scheduling-service.test.ts](file://apps/api/src/services/ai-scheduling/ai-appointment-scheduling-service.test.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Healthcare Test Data Generation](#healthcare-test-data-generation)
3. [Mock Service Implementation](#mock-service-implementation)
4. [Fixture Usage in E2E Testing](#fixture-usage-in-e2e-testing)
5. [API Handler and External Service Integration](#api-handler-and-external-service-integration)
6. [Test Data Isolation and Cleanup](#test-data-isolation-and-cleanup)
7. [Creating Custom Fixture Types](#creating-custom-fixture-types)
8. [Conclusion](#conclusion)

## Introduction

This document provides comprehensive guidance on the test fixtures and data management system for healthcare applications, focusing on realistic test data generation and mock service setup. The system ensures consistent testing environments while maintaining compliance with Brazilian healthcare regulations such as LGPD (Lei Geral de Proteção de Dados). The documentation covers fixture factories for patient records, appointments, and consent forms, along with practical examples of their usage in end-to-end testing scenarios.

## Healthcare Test Data Generation

The healthcare test data generation system creates realistic patient records, clinics, professionals, and consent forms that comply with Brazilian healthcare regulations. The system uses fixture factories to generate valid test data with proper formatting for CPF (Cadastro de Pessoas Físicas), CNPJ (Cadastro Nacional da Pessoa Jurídica), and CRM (Conselho Regional de Medicina) identifiers.

```mermaid
classDiagram
class MockPatient {
+string id
+string name
+string email
+string cpf
+Date birthDate
+string clinicId
+boolean consentGiven
+string dataProcessingPurpose
+AuditTrailEntry[] auditTrail
+Date createdAt
+Date updatedAt
}
class MockClinic {
+string id
+string name
+string cnpj
+string address
+string city
+string state
+string phone
+string email
+Date createdAt
}
class MockProfessional {
+string id
+string name
+string email
+string crm
+string specialty
+string clinicId
+boolean licenseValid
+Date createdAt
}
class ConsentRecord {
+string id
+string dataSubjectId
+string purpose
+boolean consentGiven
+Date consentDate
+Date expiryDate
+string legalBasis
}
MockPatient --> ConsentRecord : "has"
MockPatient --> MockClinic : "belongs to"
MockProfessional --> MockClinic : "works at"
```

**Diagram sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L10-L100)

**Section sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L50-L100)

### Patient Record Creation

The `createMockPatient` function generates valid patient records with realistic Brazilian names, email addresses, and CPF numbers formatted according to Brazilian standards. The function includes audit trail entries that comply with LGPD requirements for data processing transparency.

```mermaid
flowchart TD
Start([Create Mock Patient]) --> SetDefaults["Set default values<br/>Name: João Silva Santos<br/>Email: joao.silva@email.com<br/>CPF: 123.456.789-00"]
SetDefaults --> AddAuditTrail["Add audit trail entry<br/>Action: patient_created<br/>Resource: patient"]
AddAuditTrail --> ApplyOverrides["Apply override parameters"]
ApplyOverrides --> ReturnPatient["Return MockPatient object"]
ReturnPatient --> End([Patient Created])
```

**Diagram sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L50-L79)

**Section sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L50-L79)

### Consent Management

The system implements comprehensive consent management that aligns with LGPD Article 7, which requires explicit consent for personal data processing. The `createMockConsentRecord` function generates consent records with valid legal basis references and expiration dates set two years from creation, following Brazilian healthcare data retention guidelines.

```mermaid
stateDiagram-v2
[*] --> NoConsent
NoConsent --> ValidConsent : "consentGiven = true"
ValidConsent --> ExpiredConsent : "expiryDate < current date"
ValidConsent --> WithdrawnConsent : "consentGiven = false"
ExpiredConsent --> ValidConsent : "renewal"
WithdrawnConsent --> ValidConsent : "re-granting"
note right of ValidConsent
Purpose : Prestação de serviços de saúde
Legal Basis : Art. 7º, I - consentimento do titular
Expiry : 2 years from consentDate
end note
note right of ExpiredConsent
Automatic expiration after 2 years
Requires renewal for continued processing
end note
```

**Diagram sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L123-L141)

**Section sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L123-L141)

## Mock Service Implementation

The mock service implementation provides isolated testing environments by simulating real service behavior without external dependencies. These mocks enable consistent test execution across different environments while maintaining healthcare compliance requirements.

```mermaid
classDiagram
class MockAuthService {
+Map<string, MockUser> users
+Map<string, MockSession> sessions
+addUser(user) void
+login(email, password) Promise~{user, token}~
+validateToken(token) Promise~MockUser~
+logout(token) Promise~boolean~
+reset() void
}
class MockPatientService {
+Map<string, MockPatient> patients
+addPatient(patient) void
+getPatient(id) Promise~MockPatient~
+getPatientsByClinic(clinicId) Promise~MockPatient[]~
+createPatient(patientData) Promise~MockPatient~
+updatePatient(id, updates) Promise~MockPatient~
+deletePatient(id) Promise~boolean~
+reset() void
}
class MockClinicService {
+Map<string, MockClinic> clinics
+addClinic(clinic) void
+getClinic(id) Promise~MockClinic~
+getAllClinics() Promise~MockClinic[]~
+reset() void
}
MockAuthService --> MockPatientService : "authenticates"
MockPatientService --> MockClinicService : "associates with"
```

**Diagram sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L9-L133)

**Section sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L9-L133)

### Authentication Flow

The mock authentication service simulates JWT-based authentication flows commonly used in healthcare applications. It validates credentials against predefined test patterns and generates time-limited tokens that expire after 24 hours, reflecting real-world security practices.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant AuthService as "MockAuthService"
participant SessionStore as "Session Storage"
Client->>AuthService : login("joao.silva@email.com", "password")
AuthService->>AuthService : Validate credentials
alt Valid credentials
AuthService->>AuthService : Generate token<br/>"mock-token-{timestamp}"
AuthService->>SessionStore : Store session<br/>expires in 24 hours
SessionStore-->>AuthService : Success
AuthService-->>Client : {user, token}
else Invalid credentials
AuthService-->>Client : null
end
Client->>AuthService : validateToken("mock-token-123")
AuthService->>SessionStore : Check token validity
alt Token valid
SessionStore-->>AuthService : Return user
AuthService-->>Client : MockUser
else Token expired or invalid
SessionStore-->>AuthService : null
AuthService-->>Client : null
end
```

**Diagram sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L9-L67)

**Section sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L9-L67)

## Fixture Usage in E2E Testing

The test fixtures are extensively used in end-to-end testing scenarios for appointment scheduling workflows. These tests validate the complete integration between frontend components, API handlers, and backend services while ensuring healthcare compliance.

```mermaid
flowchart TD
A([Start E2E Test]) --> B[Setup Test Environment]
B --> C[Create Healthcare Test Data Set]
C --> D[Authenticate as Clinic Admin]
D --> E[Schedule New Appointment]
E --> F[Validate Appointment Creation]
F --> G[Verify Audit Trail Entries]
G --> H[Check LGPD Compliance]
H --> I{Test Passed?}
I --> |Yes| J[Cleanup Test Data]
I --> |No| K[Log Failure Details]
J --> L([Test Complete])
K --> L
```

**Section sources**

- [appointment.contract.test.ts](file://apps/api/src/__tests__/contracts/appointment.contract.test.ts#L55-L100)
- [ai-appointment-scheduling-service.test.ts](file://apps/api/src/services/ai-scheduling/ai-appointment-scheduling-service.test.ts#L1-L50)

### Appointment Scheduling Scenario

The following example demonstrates how healthcare test fixtures are used in an end-to-end appointment scheduling scenario:

```mermaid
sequenceDiagram
participant Frontend as "Frontend Application"
participant API as "Appointment API"
participant Scheduling as "AI Scheduling Service"
participant Database as "Database"
Frontend->>API : POST /api/appointments
API->>API : Validate input schema
API->>Scheduling : detectConflicts(scheduledFor, professionalId)
Scheduling-->>API : [] (no conflicts)
API->>Database : create appointment record
Database-->>API : Created appointment
API->>API : Log audit trail entry
API-->>Frontend : 201 Created {appointment}
Note over API,Database : All operations include<br/>LGPD-compliant audit logging
```

**Section sources**

- [appointment.contract.test.ts](file://apps/api/src/__tests__/contracts/appointment.contract.test.ts#L55-L100)

## API Handler and External Service Integration

The system integrates API handlers with mocked external services to simulate interactions with payment gateways, AI providers, and other third-party systems. This integration ensures that healthcare applications can be tested comprehensively without relying on external dependencies.

```mermaid
graph TB
subgraph "Frontend"
UI[User Interface]
Form[Appointment Form]
end
subgraph "Backend"
API[Appointment API Handler]
Auth[Authentication Middleware]
Validation[Input Validation]
Scheduling[AI Scheduling Service]
Audit[Audit Logging]
end
subgraph "External Services (Mocked)"
Payment[Payment Gateway]
AI[AI Provider]
SMS[SMS Service]
Email[Email Service]
end
UI --> Form
Form --> API
API --> Auth
Auth --> Validation
Validation --> Scheduling
Scheduling --> Audit
Audit --> Payment
Audit --> AI
Scheduling --> SMS
Scheduling --> Email
```

**Section sources**

- [ai-appointment-scheduling-service.test.ts](file://apps/api/src/services/ai-scheduling/ai-appointment-scheduling-service.test.ts#L1-L50)

### AI Provider Integration

The mock AI provider service simulates intelligent appointment scheduling capabilities while maintaining healthcare compliance. The service responds to medical-related queries and appointment requests with appropriate responses that reflect Brazilian healthcare practices.

```mermaid
sequenceDiagram
participant Client as "Healthcare Application"
participant Router as "AI Provider Router"
participant Factory as "AI Provider Factory"
participant MockAI as "Mock AI Provider"
Client->>Router : generateResponse("Agende uma consulta cardiológica")
Router->>Factory : getProvider("mock")
Factory->>Factory : getCachedProvider("mock")
Factory-->>Router : MockProvider instance
Router->>MockAI : generateAnswer()
MockAI->>MockAI : Match trigger pattern<br/>/appointment|schedule/i
MockAI-->>Router : Structured response with<br/>available time slots
Router-->>Client : Appointment options
```

**Section sources**

- [ai-appointment-scheduling-service.test.ts](file://apps/api/src/services/ai-scheduling/ai-appointment-scheduling-service.test.ts#L1-L50)

## Test Data Isolation and Cleanup

The system implements robust mechanisms for test data isolation and cleanup to prevent data pollution across test suites. These mechanisms ensure that each test runs in a clean environment with predictable initial conditions.

```mermaid
flowchart TD
A([Test Execution]) --> B{Isolation Required?}
B --> |Yes| C[Create Isolated Transaction]
C --> D[Execute Test Operations]
D --> E{Test Complete?}
E --> |Yes| F[Rollback Transaction]
F --> G([Environment Clean])
B --> |No| H[Use Shared Fixture]
H --> I[Execute Test]
I --> J[Reset Mock Services]
J --> K([Cleanup Complete])
```

**Section sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L135-L159)
- [index.ts](file://tools/testing-toolkit/src/fixtures/index.ts#L1-L35)

### Automated Cleanup Process

The automated cleanup process ensures that all test data is properly removed after test execution, preventing data pollution and maintaining database integrity. Each mock service provides a reset method that clears its internal state.

```mermaid
sequenceDiagram
participant TestRunner as "Test Runner"
participant PatientService as "MockPatientService"
participant ClinicService as "MockClinicService"
participant AuthService as "MockAuthService"
TestRunner->>TestRunner : beforeEach()
TestRunner->>PatientService : reset()
PatientService->>PatientService : Clear patients Map
PatientService-->>TestRunner : Done
TestRunner->>ClinicService : reset()
ClinicService->>ClinicService : Clear clinics Map
ClinicService-->>TestRunner : Done
TestRunner->>AuthService : reset()
AuthService->>AuthService : Clear users and sessions
AuthService-->>TestRunner : Done
TestRunner->>TestRunner : Run test case
TestRunner->>TestRunner : afterEach()
TestRunner->>PatientService : reset()
TestRunner->>ClinicService : reset()
TestRunner->>AuthService : reset()
```

**Section sources**

- [mock-services.ts](file://tools/testing-toolkit/src/fixtures/mock-services.ts#L135-L159)

## Creating Custom Fixture Types

Developers can extend the fixture system to create custom fixture types for specialized clinical workflows. The system provides a flexible foundation that can be adapted to various healthcare domains including aesthetic clinics, telemedicine services, and diagnostic centers.

```mermaid
classDiagram
class MockAestheticTreatment {
+string id
+string name
+string description
+number duration
+number price
+string[] contraindications
+string[] requiredEquipment
+Date createdAt
}
class MockTelemedicineSession {
+string id
+string patientId
+string professionalId
+Date scheduledFor
+number duration
+boolean recordingConsent
+string platform
+string meetingUrl
+Date createdAt
+Date updatedAt
}
class MockDiagnosticOrder {
+string id
+string patientId
+string orderingPhysicianId
+string diagnosticType
+string clinicalIndication
+Date orderedAt
+Date dueDate
+string status
+string facilityId
+Date createdAt
}
MockPatient --> MockAestheticTreatment : "receives"
MockProfessional --> MockAestheticTreatment : "performs"
MockPatient --> MockTelemedicineSession : "participates in"
MockProfessional --> MockTelemedicineSession : "conducts"
MockProfessional --> MockDiagnosticOrder : "orders"
MockPatient --> MockDiagnosticOrder : "subject of"
```

**Section sources**

- [healthcare-data.ts](file://tools/testing-toolkit/src/fixtures/healthcare-data.ts#L146-L176)

### Extending the Fixture System

To create new fixture types for specialized clinical workflows, developers should follow these steps:

1. Define the interface for the new entity
2. Implement a factory function that generates instances with realistic data
3. Ensure compliance with relevant healthcare regulations
4. Integrate with existing mock services
5. Add validation rules for data integrity

The `createHealthcareTestDataSet` function serves as a template for creating comprehensive test data sets that include multiple related entities and their relationships.

## Conclusion

The test fixtures and data management system provides a robust foundation for testing healthcare applications while ensuring compliance with Brazilian regulations. By using realistic test data generation and comprehensive mock services, the system enables thorough testing of appointment scheduling scenarios and other clinical workflows. The automated cleanup processes prevent test data pollution, while the extensible fixture architecture allows developers to create custom test data for specialized healthcare domains. This approach ensures that healthcare applications are thoroughly tested in isolated environments that accurately reflect production conditions.
