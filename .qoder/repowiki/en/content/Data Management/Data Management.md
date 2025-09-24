# Data Management

<cite>
**Referenced Files in This Document**
- [schema.prisma](file://packages/database/prisma/schema.prisma)
- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)
- [patient-service.ts](file://packages/database/src/application/patient-service.ts)
- [audit-service.ts](file://packages/database/src/services/audit-service.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction

The NeonPro data management system is a domain-driven, healthcare-compliant architecture built on Prisma ORM with PostgreSQL hosted on Supabase. It implements robust data governance, privacy controls, and audit capabilities tailored for Brazilian healthcare regulations including LGPD, CFM, ANVISA, and ICP-Brasil standards. The system follows clean architectural patterns with clear separation between data access, business logic, and domain layers.

## Project Structure

The data management system is organized within the monorepo under `packages/database`, containing all database-related components including schema definitions, clients, repositories, services, and utilities. The structure follows domain-driven design principles with distinct layers for application services, infrastructure implementations, and domain models.

```mermaid
graph TD
A[Database Package] --> B[Prisma Schema]
A --> C[Client Configuration]
A --> D[Application Services]
A --> E[Repositories]
A --> F[Services]
A --> G[Containers]
A --> H[Types]
B --> I[PostgreSQL Database]
C --> J[Supabase Client]
D --> K[PatientService]
E --> L[PatientRepository]
F --> M[AuditService]
G --> N[RepositoryContainer]
```

**Diagram sources**

- [schema.prisma](file://packages/database/prisma/schema.prisma)
- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)

**Section sources**

- [schema.prisma](file://packages/database/prisma/schema.prisma)
- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)

## Core Components

The core components of the data management system include the Prisma-generated client, Supabase integration, repository implementations, application services, and dependency injection container. These components work together to provide type-safe, secure, and compliant data access across the NeonPro application.

**Section sources**

- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)

## Architecture Overview

The data management architecture follows a layered approach with Prisma ORM as the primary data access layer, Supabase for real-time capabilities and authentication, and a repository pattern implementation that abstracts database operations. The system implements domain-driven design with clear boundaries between infrastructure, application, and domain layers.

```mermaid
graph TB
subgraph "Domain Layer"
A[Entities]
B[Value Objects]
C[Domain Services]
end
subgraph "Application Layer"
D[Application Services]
E[DTOs]
end
subgraph "Infrastructure Layer"
F[Repositories]
G[Prisma Client]
H[Supabase Client]
I[Database]
end
subgraph "External Systems"
J[Realtime]
K[Storage]
L[Auth]
end
A --> D
B --> D
C --> D
D --> F
F --> G
F --> H
G --> I
H --> J
H --> K
H --> L
```

**Diagram sources**

- [schema.prisma](file://packages/database/prisma/schema.prisma)
- [client.ts](file://packages/database/src/client.ts)
- [patient-service.ts](file://packages/database/src/application/patient-service.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)

## Detailed Component Analysis

### Patient Management System Analysis

The patient management system implements a comprehensive solution for handling patient data with full compliance to Brazilian healthcare regulations. It includes specialized fields for CPF, CNS, RG, insurance information, and LGPD consent tracking.

#### For Object-Oriented Components:

```mermaid
classDiagram
class PatientService {
+createPatient(request)
+updatePatient(id, request)
+getPatient(id)
+getPatientsByClinic(clinicId)
+searchPatients(query)
+deletePatient(id)
-validateCreateRequest(request)
-validateCPF(cpf)
-validateBrazilianPhone(phone)
-validateEmail(email)
-adaptApiRequestToDomain(request)
}
class PatientRepository {
+findById(id)
+findByMedicalRecordNumber(number)
+findByCPF(cpf)
+findByClinicId(clinicId)
+findWithFilter(filter)
+create(patientData)
+update(id, patientData)
+delete(id)
+search(query)
+count(filter)
-mapDatabasePatientToDomain(dbPatient)
-mapCreateRequestToDatabase(request)
-mapUpdateRequestToDatabase(request)
}
class RepositoryContainer {
+initialize(supabase)
+getInstance()
+getPatientRepository()
+getConsentRepository()
+getAppointmentRepository()
+getAuditService()
+getConsentService()
+reset()
}
PatientService --> PatientRepository : "uses"
RepositoryContainer --> PatientRepository : "creates"
RepositoryContainer --> PatientService : "provides"
PatientRepository --> SupabaseClient : "depends on"
```

**Diagram sources**

- [patient-service.ts](file://packages/database/src/application/patient-service.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)

#### For API/Service Components:

```mermaid
sequenceDiagram
participant Client
participant Service as PatientService
participant Repository as PatientRepository
participant DB as SupabaseClient
Client->>Service : createPatient(request)
Service->>Service : validateCreateRequest()
Service->>Service : validateCPF()
Service->>Service : adaptApiRequestToDomain()
Service->>Repository : create(domainPatient)
Repository->>DB : insert(patientData)
DB-->>Repository : data, error
Repository-->>Service : patient or throw error
Service-->>Client : created patient
```

**Diagram sources**

- [patient-service.ts](file://packages/database/src/application/patient-service.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)
- [client.ts](file://packages/database/src/client.ts)

### Audit and Compliance System Analysis

The audit and compliance system provides comprehensive tracking of all data access and system events, with specialized support for WebRTC sessions, LGPD compliance, and security monitoring.

#### For Complex Logic Components:

```mermaid
flowchart TD
Start([Create Audit Log]) --> ValidateInput["Validate Request Data"]
ValidateInput --> InputValid{"Input Valid?"}
InputValid --> |No| ReturnError["Return Validation Error"]
InputValid --> |Yes| DetermineAction["Determine Action Type"]
DetermineAction --> SessionStart{"Action: Session Start?"}
SessionStart --> |Yes| InsertSessionStart["Insert session-start record"]
DetermineAction --> SessionEnd{"Action: Session End?"}
SessionEnd --> |Yes| InsertSessionEnd["Insert session-end record"]
DetermineAction --> DataAccess{"Action: Data Access?"}
DataAccess --> |Yes| InsertDataAccess["Insert data-access record"]
DetermineAction --> ConsentVerify{"Action: Consent Verify?"}
ConsentVerify --> |Yes| InsertConsentVerify["Insert consent-verification record"]
DetermineAction --> SecurityEvent{"Action: Security Event?"}
SecurityEvent --> |Yes| InsertSecurityEvent["Insert security-event record"]
InsertSessionStart --> MapToEntry["Map to RTCAuditLogEntry"]
InsertSessionEnd --> MapToEntry
InsertDataAccess --> MapToEntry
InsertConsentVerify --> MapToEntry
InsertSecurityEvent --> MapToEntry
MapToEntry --> ReturnSuccess["Return Entry ID"]
ReturnError --> End([Function Exit])
ReturnSuccess --> End
```

**Diagram sources**

- [audit-service.ts](file://packages/database/src/services/audit-service.ts)
- [types/audit.types.ts](file://packages/database/src/types/audit.types.ts)

**Section sources**

- [patient-service.ts](file://packages/database/src/application/patient-service.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)
- [audit-service.ts](file://packages/database/src/services/audit-service.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)

## Dependency Analysis

The data management system has well-defined dependencies between components, following inversion of control principles through the RepositoryContainer. The system depends on Prisma ORM for type-safe database access, Supabase for real-time capabilities and authentication, and implements proper error handling and logging throughout.

```mermaid
graph LR
A[PatientService] --> B[PatientRepository]
B --> C[SupabaseClient]
D[AuditService] --> C
E[ConsentService] --> C
F[RepositoryContainer] --> B
F --> G[ConsentRepository]
F --> H[AppointmentRepository]
F --> D
F --> E
I[PrismaClient] --> J[PostgreSQL]
C --> J
K[Application] --> F
K --> I
```

**Diagram sources**

- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)

**Section sources**

- [client.ts](file://packages/database/src/client.ts)
- [index.ts](file://packages/database/src/index.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)

## Performance Considerations

The data management system includes several performance optimizations including connection pooling, query optimization through indexed fields, and efficient data retrieval patterns. The Prisma schema includes numerous database indexes on frequently queried fields such as clinicId, cpf, cns, and timestamps. The system also implements proper pagination and filtering to prevent excessive data loading.

## Troubleshooting Guide

Common issues in the data management system typically relate to environment configuration, database connectivity, or schema synchronization. The system provides health check endpoints and proper error logging to assist with diagnosis. Connection issues should be verified by checking environment variables for Supabase URL and service role keys. Schema mismatches can be resolved by running Prisma migrations and ensuring the generated client is up to date.

**Section sources**

- [client.ts](file://packages/database/src/client.ts)
- [patient-service.ts](file://packages/database/src/application/patient-service.ts)

## Conclusion

The NeonPro data management system provides a robust, compliant foundation for healthcare applications with its domain-driven design, comprehensive privacy controls, and well-structured architecture. By leveraging Prisma ORM with Supabase, the system achieves both type safety and real-time capabilities while maintaining strict adherence to Brazilian healthcare regulations. The repository pattern implementation ensures separation of concerns and testability, while the dependency injection container facilitates proper component composition.
