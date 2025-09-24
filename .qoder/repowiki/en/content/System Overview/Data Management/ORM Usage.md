# ORM Usage

<cite>
**Referenced Files in This Document**
- [prisma.ts](file://apps/api/src/clients/prisma.ts)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts)
- [appointment-repository.ts](file://packages/database/src/repositories/appointment-repository.ts)
- [repository-container.ts](file://packages/database/src/containers/repository-container.ts)
- [base.service.ts](file://packages/database/src/services/base.service.ts)
- [README-PRISMA-HEALTHCARE.md](file://apps/api/src/README-PRISMA-HEALTHCARE.md)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Prisma Client Configuration](#prisma-client-configuration)
3. [Type-Safe Database Queries](#type-safe-database-queries)
4. [Transaction Management](#transaction-management)
5. [Connection Pooling and Performance](#connection-pooling-and-performance)
6. [Repository Pattern Implementation](#repository-pattern-implementation)
7. [CRUD Operations with PatientRepository](#crud-operations-with-patientrepository)
8. [Complex Queries with AppointmentRepository](#complex-queries-with-appointmentrepository)
9. [Integration with Business Logic Services](#integration-with-business-logic-services)
10. [Error Handling Patterns](#error-handling-patterns)
11. [Query Optimization Techniques](#query-optimization-techniques)
12. [Best Practices for Data Access Code](#best-practices-for-data-access-code)

## Introduction

The NeonPro platform utilizes Prisma Client as its primary Object-Relational Mapping (ORM) solution for database interactions, specifically tailored for healthcare applications with Brazilian regulatory compliance (LGPD). The implementation provides type-safe database queries, robust transaction management, and optimized connection pooling to ensure high performance and data integrity.

The ORM layer is designed with a repository pattern that abstracts database operations behind domain-specific interfaces, enabling clean separation between business logic and data access concerns. This documentation details the implementation of Prisma Client within the NeonPro ecosystem, focusing on key aspects such as type safety, transaction handling, connection management, and integration patterns.

The system incorporates healthcare-specific features including audit logging, multi-tenant Row Level Security (RLS), and LGPD-compliant data operations, making it suitable for sensitive medical data processing while maintaining high performance standards.

**Section sources**

- [README-PRISMA-HEALTHCARE.md](file://apps/api/src/README-PRISMA-HEALTHCARE.md#L0-L28)

## Prisma Client Configuration

The Prisma Client in NeonPro is configured as a singleton instance with healthcare-specific optimizations through the `getHealthcarePrismaClient()` function. This ensures resource efficiency by reusing a single client instance across the application lifecycle.

Configuration parameters are environment-driven, allowing adaptation to different deployment environments:

```typescript
const healthcareConfig: HealthcareConnectionConfig = {
  maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
  connectionTimeout: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '30000',
  ),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '600000'),
  healthCheckInterval: parseInt(
    process.env.DATABASE_HEALTH_CHECK_INTERVAL || '30000',
  ),
};
```

The client is extended with healthcare-specific methods beyond standard Prisma functionality, including:

- `exportPatientData()` for LGPD-mandated data portability
- `deletePatientData()` for right-to-erasure compliance
- `findPatientsInClinic()` with automatic RLS enforcement
- `createAuditLog()` for comprehensive operation tracking

Health checks are implemented via `validateConnection()` and `getHealthMetrics()`, providing real-time monitoring of database connectivity and performance metrics. The client also includes automatic audit logging middleware that captures all create, update, and delete operations.

**Section sources**

- [prisma.ts](file://apps/api/src/clients/prisma.ts#L136-L180)
- [README-PRISMA-HEALTHCARE.md](file://apps/api/src/README-PRISMA-HEALTHCARE.md#L230-L295)

## Type-Safe Database Queries

NeonPro leverages Prisma's type generation capabilities to provide fully type-safe database queries throughout the application. The schema-defined models generate TypeScript types that are enforced at compile time, preventing runtime errors from invalid field access or incorrect query structures.

The implementation uses explicit typing for all repository interfaces, ensuring contract adherence between implementations and consumers:

```typescript
export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByClinicId(clinicId: string): Promise<Patient[]>;
  create(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient>;
  update(id: string, updates: Partial<Patient>): Promise<Patient>;
}
```

Queries are constructed using Prisma's fluent API with strong typing for where clauses, select/include specifications, and result types. The system enforces proper filtering through parameterized queries that prevent SQL injection while maintaining type safety.

For complex queries requiring specific projections, the implementation uses precise select configurations rather than indiscriminate includes, optimizing both performance and type accuracy:

```typescript
await this.prisma.patient.findMany({
  where: { clinicId },
  select: {
    id: true,
    fullName: true,
    email: true,
    phonePrimary: true,
    birthDate: true,
    gender: true,
  },
});
```

This approach ensures developers receive immediate feedback on invalid operations during development rather than encountering errors at runtime.

**Section sources**

- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)
- [appointment-repository.ts](file://packages/database/src/repositories/appointment-repository.ts#L17-L571)

## Transaction Management

Transaction management in NeonPro follows a structured approach using Prisma's `$transaction` API for atomic operations across multiple models. The implementation ensures data consistency, particularly for LGPD compliance operations that require coordinated changes across related entities.

The `deletePatientData` method demonstrates a comprehensive transaction pattern that handles cascading deletions while respecting audit requirements:

```typescript
await this.$transaction(async tx => {
  await this.createAuditLog('DELETE', 'PATIENT_RECORD', patientId, {
    cascadeDelete,
    retainAuditTrail,
    reason,
    deletedBy: this.currentContext?.userId,
  });

  if (cascadeDelete) {
    await tx.appointment.deleteMany({ where: { patientId } });
    await tx.consentRecord.deleteMany({ where: { patientId } });
    
    if (!retainAuditTrail) {
      await tx.auditTrail.deleteMany({ where: { patientId } });
    }
  }

  await tx.patient.delete({ where: { id: patientId } });
});
```

Transactions are used strategically for operations that modify multiple related records, ensuring either complete success or full rollback. The system combines transactions with proper error handling and audit logging to maintain both data integrity and compliance requirements.

For performance-critical paths, the implementation avoids unnecessary transactions on single-model operations, reserving them for multi-entity workflows where atomicity is essential.

**Section sources**

- [prisma.ts](file://apps/api/src/clients/prisma.ts#L570-L620)

## Connection Pooling and Performance

NeonPro implements sophisticated connection pooling strategies to optimize database performance under varying workloads. The connection pool is configured with healthcare-specific parameters that balance resource utilization with responsiveness requirements.

Key configuration settings include:

- Maximum connections capped at 20 by default, configurable via `DATABASE_MAX_CONNECTIONS`
- Connection timeout of 30 seconds to prevent hanging requests
- Idle timeout of 10 minutes to efficiently recycle unused connections
- Health check interval of 30 seconds for proactive connection validation

The system monitors connection pool metrics including active, idle, and waiting connections, providing visibility into pool utilization. Under load testing, the implementation demonstrates graceful handling of connection saturation without catastrophic failure.

Performance optimization extends beyond basic pooling with features like:

- Query caching with healthcare-specific TTL values
- Batch operations for efficient bulk processing
- Predictive scaling based on historical usage patterns
- Real-time performance monitoring and alerting

The connection pool integrates with edge runtime environments to minimize latency for Brazilian healthcare regions, with regional optimization ensuring response times remain below 30ms for local deployments.

**Section sources**

- [prisma.ts](file://apps/api/src/clients/prisma.ts#L136-L180)
- [edge-runtime.test.ts](file://apps/api/tests/performance/edge-runtime.test.ts#L211-L282)

## Repository Pattern Implementation

The NeonPro platform implements a robust repository pattern using dependency injection through the `RepositoryContainer` class. This pattern provides a clean abstraction layer between business logic and data access concerns while enabling testability and maintainability.

The container acts as a service locator for repository instances, ensuring singleton behavior and proper dependency management:

```typescript
export class RepositoryContainer {
  private static instance: RepositoryContainer;
  private patientRepository: IPatientRepository | null = null;
  private appointmentRepository: IAppointmentRepository | null = null;

  static initialize(supabase: SupabaseClient): RepositoryContainer { /* ... */ }
  static getInstance(): RepositoryContainer { /* ... */ }
  
  getPatientRepository(): IPatientRepository { /* ... */ }
  getAppointmentRepository(): IAppointmentRepository { /* ... */ }
}
```

Repositories implement domain-defined interfaces (`IPatientRepository`, `IAppointmentRepository`) that specify contracts independent of implementation details. This allows for easy mocking in tests and potential replacement of data sources without affecting business logic.

The pattern enables centralized management of database clients and shared utilities while providing type-safe access to data operations. Each repository encapsulates query logic specific to its entity type, promoting code reuse and consistent error handling across the application.

**Section sources**

- [repository-container.ts](file://packages/database/src/containers/repository-container.ts#L19-L169)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)

## CRUD Operations with PatientRepository

The `PatientRepository` implementation provides comprehensive CRUD operations for patient data with built-in error handling, audit logging, and compliance checks. Each operation follows a consistent pattern of validation, execution, and error management.

Create operations transform domain objects to database format before insertion:

```typescript
async create(patientData: CreatePatientRequest): Promise<Patient> {
  const dbPatient = this.mapCreateRequestToDatabase(patientData);
  const { data, error } = await this.supabase
    .from("patients")
    .insert(dbPatient)
    .select()
    .single();
  
  if (error) throw new Error(`Failed to create patient: ${error.message}`);
  return this.mapDatabasePatientToDomain(data);
}
```

Read operations support various filtering criteria including clinic ID, status, and search terms, with proper pagination and sorting:

```typescript
async findByClinicId(
  clinicId: string,
  options?: PatientQueryOptions,
): Promise<PatientSearchResult> {
  let query = this.supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("clinic_id", clinicId);

  if (options?.status) query = query.eq("status", options.status);
  if (options?.search) query = query.or(/* search conditions */);
  // Additional filters, pagination, sorting...
}
```

Update and delete operations include appropriate error handling and return meaningful success indicators. All operations incorporate healthcare logger integration for monitoring and troubleshooting.

**Section sources**

- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)

## Complex Queries with AppointmentRepository

The `AppointmentRepository` handles complex scheduling queries with support for date ranges, professional availability, and conflict detection. These operations are critical for the healthcare scheduling functionality and require careful optimization.

Finding appointments by date range with optional clinic scoping:

```typescript
async findByDateRange(
  startDate: Date,
  endDate: Date,
  clinicId?: string,
): Promise<Appointment[]> {
  let query = this.supabase
    .from("appointments")
    .select("*")
    .gte("start_time", startDate.toISOString())
    .lte("end_time", endDate.toISOString());

  if (clinicId) query = query.eq("clinic_id", clinicId);
  query = query.order("start_time", { ascending: true });
}
```

The repository supports advanced filtering through the `findWithFilter` method that combines multiple criteria:

```typescript
async findWithFilter(
  filter: AppointmentFilter,
  options?: AppointmentQueryOptions,
): Promise<AppointmentSearchResult> {
  let query = this.supabase.from("appointments").select("*", { count: "exact" });

  if (filter.clinicId) query = query.eq("clinic_id", filter.clinicId);
  if (filter.professionalId) query = query.eq("professional_id", filter.professionalId);
  if (filter.dateRange) query = query.gte("start_time", /* ... */).lte("end_time", /* ... */);
  // Additional filters...
}
```

All queries include proper error handling and transformation between database and domain representations, ensuring consistent data formats throughout the application.

**Section sources**

- [appointment-repository.ts](file://packages/database/src/repositories/appointment-repository.ts#L17-L571)

## Integration with Business Logic Services

The ORM layer integrates seamlessly with business logic services through well-defined interfaces and dependency injection. Services consume repository instances rather than directly accessing the Prisma client, maintaining separation of concerns.

The integration follows these patterns:

- Services receive repository instances through constructor injection
- Business logic orchestrates multiple repository calls when needed
- Transactions are managed at the service level for multi-step operations
- Error handling is coordinated between repositories and services

For example, a patient service might coordinate operations across multiple repositories:

```typescript
class PatientService {
  constructor(
    private patientRepository: IPatientRepository,
    private appointmentRepository: IAppointmentRepository,
    private consentRepository: IConsentRepository
  ) {}

  async transferPatient(
    patientId: string, 
    newClinicId: string
  ): Promise<void> {
    // Coordinate transfer across multiple repositories
    // Manage transaction boundary
    // Handle audit logging
  }
}
```

This approach allows business services to focus on workflow orchestration while delegating data access details to specialized repositories, resulting in more maintainable and testable code.

**Section sources**

- [repository-container.ts](file://packages/database/src/containers/repository-container.ts#L19-L169)

## Error Handling Patterns

NeonPro implements comprehensive error handling patterns that distinguish between different types of failures and provide appropriate responses. The system categorizes errors into operational, validation, and compliance types.

Domain-level error classes extend base error types with healthcare-specific context:

```typescript
export class RepositoryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Repository error: ${message}`, "REPOSITORY_ERROR", 500);
    this.cause = originalError;
  }
}

export class QueryTimeoutError extends RepositoryError {
  constructor(query: string, timeoutMs: number) {
    super(`Query timeout after ${timeoutMs}ms: ${query}`);
  }
}
```

All repository operations include try-catch blocks with standardized error logging using the healthcare logger:

```typescript
async findById(id: string): Promise<Patient | null> {
  try {
    const { data, error } = await this.supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logHealthcareError('database', error, { method: 'findById', patientId: id });
      return null;
    }

    return this.mapDatabasePatientToDomain(data);
  } catch (error) {
    logHealthcareError('database', error, { method: 'findById', patientId: id });
    return null;
  }
}
```

Errors are sanitized before exposure to clients, with generic messages returned for security while detailed information is preserved in logs for debugging purposes.

**Section sources**

- [domain-errors.ts](file://packages/domain/src/errors/domain-errors.ts#L164-L220)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)

## Query Optimization Techniques

The NeonPro platform employs several query optimization techniques to ensure efficient database operations and optimal performance. These techniques address common issues like N+1 queries, excessive data loading, and inefficient filtering.

Key optimization strategies include:

**Selective Field Projection**: Using precise select statements instead of retrieving entire records:

```typescript
.select({
  id: true,
  fullName: true,
  email: true,
  phonePrimary: true,
})
```

**Proper Pagination**: Implementing both offset-based and cursor-based pagination to handle large datasets efficiently:

```typescript
if (options?.limit) query = query.limit(options.limit);
if (options?.offset) query = query.range(/* ... */);
```

**Index-Aware Filtering**: Structuring queries to leverage database indexes, particularly on commonly filtered fields like clinicId, status, and date ranges.

**Batch Operations**: Processing multiple records in single operations when possible to reduce round trips:

```typescript
await tx.appointment.deleteMany({ where: { patientId } });
```

**Caching Strategy**: Implementing query result caching for frequently accessed, relatively static data to reduce database load.

The system also includes tools for identifying suboptimal queries, such as detecting potential N+1 patterns and recommending JOIN usage or batch queries. Performance monitoring tracks slow queries and provides metrics for ongoing optimization efforts.

**Section sources**

- [query-optimizer.ts](file://apps/api/src/utils/query-optimizer.ts#L170-L209)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)

## Best Practices for Data Access Code

The NeonPro platform follows several best practices for writing efficient, maintainable data access code:

**Use Specific Select Clauses**: Always specify exactly which fields are needed rather than using `select: true` or no select clause, reducing network payload and memory usage.

**Implement Proper Pagination**: Use limit/offset or cursor-based pagination for list operations to prevent memory issues with large result sets.

**Avoid N+1 Queries**: When retrieving related data, use appropriate join strategies or batch loading rather than individual queries in loops.

**Handle Errors Gracefully**: Implement comprehensive error handling with proper logging and user-friendly error messages.

**Maintain Small, Focused Repositories**: Keep repository methods focused on specific operations rather than creating monolithic classes.

**Use Transactions Judiciously**: Apply transactions only when necessary for data consistency, avoiding them for single-record operations.

**Implement Caching Strategically**: Cache expensive queries with appropriate TTL values, considering data freshness requirements.

**Monitor Performance**: Regularly review query performance and optimize slow operations using execution plans and profiling tools.

**Follow Naming Conventions**: Use consistent naming for methods and parameters across all repositories to improve code readability.

These practices ensure that the data access layer remains performant, maintainable, and aligned with the overall architecture of the healthcare platform.

**Section sources**

- [README-PRISMA-HEALTHCARE.md](file://apps/api/src/README-PRISMA-HEALTHCARE.md#L0-L341)
- [patient-repository.ts](file://packages/database/src/repositories/patient-repository.ts#L15-L568)
- [appointment-repository.ts](file://packages/database/src/repositories/appointment-repository.ts#L17-L571)
