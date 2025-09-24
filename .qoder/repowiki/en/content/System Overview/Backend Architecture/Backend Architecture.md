# Backend Architecture

<cite>
**Referenced Files in This Document**   
- [app.ts](file://apps/api/src/app.ts)
- [index.ts](file://apps/api/src/index.ts)
- [error-sanitization.ts](file://apps/api/src/middleware/error-sanitization.ts)
- [http-error-handling.ts](file://apps/api/src/middleware/http-error-handling.ts)
- [error-handler.ts](file://apps/api/src/middleware/error-handler.ts)
- [security-headers.ts](file://apps/api/src/middleware/security-headers.ts)
- [rate-limiting.ts](file://apps/api/src/middleware/rate-limiting.ts)
- [query-timeout-middleware.ts](file://apps/api/src/middleware/query-timeout-middleware.ts)
- [compression-middleware.ts](file://apps/api/src/middleware/compression-middleware.ts)
- [sensitive-field-analyzer.ts](file://apps/api/src/services/sensitive-field-analyzer.ts)
- [router.ts](file://apps/api/src/trpc/router.ts)
- [appointments.ts](file://apps/api/src/trpc/routers/appointments.ts)
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
The NeonPro backend API service is a healthcare-compliant system built on the Hono framework with tRPC for type-safe API design. The architecture implements a layered approach with comprehensive middleware pipeline for request processing, security enforcement, and observability. The system handles critical healthcare workflows including patient management, appointment scheduling, AI clinical support, and financial operations while maintaining strict compliance with Brazilian regulations (LGPD, CFM, ANVISA). The backend integrates advanced features such as AI-powered no-show prediction, real-time availability checking, and multi-channel communication systems.

## Project Structure
The backend API service follows a modular structure organized by functional domains and architectural layers. The core application resides in the `apps/api/src` directory with components separated into logical directories for routes, middleware, services, and configuration.

```mermaid
graph TD
A[API Root] --> B[middleware]
A --> C[routes]
A --> D[services]
A --> E[trpc]
A --> F[config]
A --> G[security]
A --> H[clients]
B --> I[Security Middleware]
B --> J[Error Handling]
B --> K[Performance]
B --> L[Monitoring]
C --> M[AI Routes]
C --> N[Appointments]
C --> O[Billing]
C --> P[Patients]
D --> Q[Business Logic]
D --> R[Data Access]
D --> S[Integrations]
E --> T[tRPC Routers]
E --> U[tRPC Context]
```

**Diagram sources**
- [app.ts](file://apps/api/src/app.ts)
- [middleware](file://apps/api/src/middleware)
- [routes](file://apps/api/src/routes)
- [services](file://apps/api/src/services)
- [trpc](file://apps/api/src/trpc)

**Section sources**
- [app.ts](file://apps/api/src/app.ts)
- [index.ts](file://apps/api/src/index.ts)

## Core Components
The backend architecture centers around several key components that work together to provide a robust, secure, and compliant API service. The Hono framework serves as the foundation, providing a lightweight and performant HTTP server implementation. tRPC enables end-to-end type safety between client and server, ensuring API contracts are strictly enforced. The middleware pipeline implements a comprehensive security and monitoring stack, while the routing system organizes functionality into domain-specific modules. Business logic is encapsulated in services that interact with data sources through Prisma and Supabase clients.

**Section sources**
- [app.ts](file://apps/api/src/app.ts#L1-L572)
- [index.ts](file://apps/api/src/index.ts#L1-L96)

## Architecture Overview
The NeonPro backend implements a layered architecture with a sophisticated middleware pipeline that processes requests through multiple stages of validation, security checks, and monitoring before reaching business logic handlers. The system follows a clear separation of concerns with distinct layers for presentation (routes), application logic (services), and data access (repositories).

```mermaid
sequenceDiagram
participant Client as "Client Application"
participant Hono as "Hono Framework"
participant Middleware as "Middleware Pipeline"
participant TRPC as "tRPC Router"
participant Service as "Business Logic Service"
participant Database as "Database Layer"
Client->>Hono : HTTP Request
Hono->>Middleware : CORS Validation
Middleware->>Middleware : Security Headers
Middleware->>Middleware : Rate Limiting
Middleware->>Middleware : Authentication
Middleware->>Middleware : Query Timeout
Middleware->>Middleware : Compression
Middleware->>TRPC : Request Processing
TRPC->>Service : Type-Safe Method Call
Service->>Database : Data Operations
Database-->>Service : Data Response
Service-->>TRPC : Business Result
TRPC-->>Middleware : JSON Response
Middleware->>Middleware : Error Sanitization
Middleware->>Middleware : Performance Monitoring
Middleware-->>Client : HTTP Response
```

**Diagram sources**
- [app.ts](file://apps/api/src/app.ts#L1-L572)
- [trpc/router.ts](file://apps/api/src/trpc/router.ts)
- [services](file://apps/api/src/services)

## Detailed Component Analysis

### Middleware Pipeline Analysis
The middleware pipeline is the backbone of the NeonPro backend, implementing a comprehensive chain of processing steps that ensure security, performance, and reliability. Each request passes through multiple middleware layers that handle cross-cutting concerns before reaching the business logic.

#### Security and Compliance Middleware
```mermaid
classDiagram
class SecurityHeadersMiddleware {
+enableHSTS : boolean
+hstsMaxAge : number
+contentSecurityPolicy : string
+permissionsPolicy : string
+middleware() : Function
}
class RateLimitingMiddleware {
+windowMs : number
+maxRequests : number
+keyGenerator() : string
+middleware() : Function
}
class QueryTimeoutMiddleware {
+defaultTimeout : number
+maxTimeout : number
+timeoutHeader : string
+middleware() : Function
}
class CompressionMiddleware {
+enableBrotli : boolean
+enableGzip : boolean
+compressionLevel : number
+minSize : number
+threshold : number
+middleware() : Function
+getCompressionStats() : Object
}
class CSPViolationHandler {
+handleViolation() : Function
+logViolation() : Function
+notifySecurityTeam() : Function
}
SecurityHeadersMiddleware -->|applies| HTTPResponse
RateLimitingMiddleware -->|controls| RequestFlow
QueryTimeoutMiddleware -->|enforces| HealthcareCompliance
CompressionMiddleware -->|optimizes| HTTPSResponses
CSPViolationHandler -->|processes| CSPReports
```

**Diagram sources**
- [security-headers.ts](file://apps/api/src/middleware/security-headers.ts)
- [rate-limiting.ts](file://apps/api/src/middleware/rate-limiting.ts)
- [query-timeout-middleware.ts](file://apps/api/src/middleware/query-timeout-middleware.ts)
- [compression-middleware.ts](file://apps/api/src/middleware/compression-middleware.ts)

#### Error Handling and Observability Middleware
```mermaid
flowchart TD
Start([Request Entry]) --> ErrorHandler["Global Error Handler"]
ErrorHandler --> ErrorSanitization["Error Sanitization"]
ErrorSanitization --> HTTPErrorHandler["HTTP Error Handling"]
HTTPErrorHandler --> SentryIntegration["Sentry Integration"]
SentryIntegration --> HealthcareErrorTracking["Healthcare Error Tracking"]
HealthcareErrorTracking --> Logging["Structured Logging"]
Logging --> AuditLog["Audit Trail Creation"]
AuditLog --> Response["Error Response Generation"]
Response --> End([Request Exit])
subgraph "Error Classification"
HTTPException{"HTTP Exception?"}
ValidationError{"Validation Error?"}
DatabaseError{"Database Error?"}
AuthError{"Auth/Authorization Error?"}
NetworkError{"Network/Timeout Error?"}
end
HTTPErrorHandler --> HTTPException
HTTPException --> |Yes| HandleHTTPException["Handle HTTP Exception"]
ValidationError --> |Yes| HandleValidationError["Handle Validation Error"]
DatabaseError --> |Yes| HandleDatabaseError["Handle Database Error"]
AuthError --> |Yes| HandleAuthError["Handle Auth Error"]
NetworkError --> |Yes| HandleNetworkError["Handle Network Error"]
HTTPException --> |No| ValidationError
ValidationError --> |No| DatabaseError
DatabaseError --> |No| AuthError
AuthError --> |No| NetworkError
NetworkError --> |No| HandleGenericError["Handle Generic Error"]
```

**Diagram sources**
- [error-handler.ts](file://apps/api/src/middleware/error-handler.ts)
- [error-sanitization.ts](file://apps/api/src/middleware/error-sanitization.ts)
- [http-error-handling.ts](file://apps/api/src/middleware/http-error-handling.ts)

### tRPC API Design Analysis
The tRPC integration provides type-safe API endpoints that ensure contract consistency between frontend and backend. The router structure exposes domain-specific functionality while maintaining backward compatibility with legacy endpoints.

```mermaid
classDiagram
class AppRouter {
+patients : Router
+appointments : Router
+ai : Router
+agents : Router
+crud : Router
+financialAgent : Router
+healthcareServices : Router
+realtimeTelemedicine : Router
+telemedicine : Router
+aestheticScheduling : Router
+aestheticClinic : Router
+aiClinicalSupport : Router
+api : Router
}
class AppointmentsRouter {
+create() : Mutation
+checkAvailability() : Query
+predictNoShowRisk() : Query
+sendReminder() : Mutation
+get() : Query
+list() : Query
+updateStatus() : Mutation
+cancel() : Mutation
+schedule() : Mutation
+getAvailability() : Query
}
class Context {
+userId : string
+clinicId : string
+auditMeta : AuditMetadata
}
class AuditMetadata {
+ipAddress : string
+userAgent : string
+sessionId : string
}
AppRouter --> AppointmentsRouter : "contains"
AppointmentsRouter --> Context : "requires"
Context --> AuditMetadata : "contains"
```

**Diagram sources**
- [trpc/router.ts](file://apps/api/src/trpc/router.ts)
- [trpc/routers/appointments.ts](file://apps/api/src/trpc/routers/appointments.ts)
- [app.ts](file://apps/api/src/app.ts#L1-L572)

### Business Logic Service Analysis
The appointments service demonstrates the sophisticated business logic implemented in the NeonPro backend, combining regulatory compliance, AI prediction, and real-time data processing.

```mermaid
flowchart TD
A[Create Appointment] --> B[Validate CFM License]
B --> C[Check Real-Time Availability]
C --> D[Get Weather Data]
D --> E[Predict No-Show Risk]
E --> F[Create Appointment Record]
F --> G[Schedule Adaptive Reminders]
G --> H[Create Audit Trail]
H --> I[Return Response]
subgraph "No-Show Risk Prediction"
E --> J[Patient History Analysis]
J --> K[Appointment Pattern Recognition]
K --> L[Weather Impact Assessment]
L --> M[Risk Score Calculation]
M --> N[Risk Level Determination]
N --> O[Prevention Recommendations]
end
subgraph "Adaptive Reminders"
G --> P[High Risk: Multiple Channels]
G --> Q[Medium Risk: Primary Channel]
G --> R[Low Risk: Standard Reminder]
end
style A fill:#4CAF50,stroke:#388E3C
style I fill:#4CAF50,stroke:#388E3C
```

**Diagram sources**
- [trpc/routers/appointments.ts](file://apps/api/src/trpc/routers/appointments.ts)
- [services](file://apps/api/src/services)

**Section sources**
- [trpc/routers/appointments.ts](file://apps/api/src/trpc/routers/appointments.ts#L637-L1530)
- [trpc/router.ts](file://apps/api/src/trpc/router.ts#L78-L102)

## Dependency Analysis
The backend service has well-defined dependencies that support its functionality while maintaining separation of concerns. The architecture leverages both internal packages and external libraries to implement its features.

```mermaid
graph LR
A[Hono Framework] --> B[Backend API]
C[tRPC] --> B
D[Prisma] --> B
E[Supabase] --> B
F[Sentry] --> B
G[OpenTelemetry] --> B
H[Valibot] --> B
I[Zod] --> B
J[Crypto Libraries] --> B
B --> K[NeonPro Packages]
K --> L[Shared Models]
K --> M[Security Utilities]
K --> N[Analytics]
K --> O[Configuration]
K --> P[Database]
K --> Q[Monitoring]
B --> R[External Services]
R --> S[OpenAI]
R --> T[Stripe]
R --> U[WhatsApp API]
R --> V[Email Service]
R --> W[Weather Service]
```

**Diagram sources**
- [package.json](file://apps/api/package.json)
- [tsconfig.json](file://apps/api/tsconfig.json)
- [app.ts](file://apps/api/src/app.ts)

**Section sources**
- [app.ts](file://apps/api/src/app.ts#L1-L572)
- [index.ts](file://apps/api/src/index.ts#L1-L96)

## Performance Considerations
The NeonPro backend implements several performance optimization strategies to ensure responsive operation under load while maintaining healthcare compliance requirements. The system is designed to meet strict response time targets (<2 seconds) for all endpoints.

### Key Performance Features:
- **Query Timeout Middleware**: Enforces 2-second timeout for all database queries to comply with healthcare regulations
- **Response Compression**: Implements Brotli and Gzip compression to reduce payload sizes
- **Rate Limiting**: Prevents abuse and ensures fair resource allocation across users
- **Caching Strategy**: Uses ETag and Cache-Control headers for conditional requests
- **Connection Pooling**: Efficient database connection management
- **Asynchronous Processing**: Non-blocking I/O operations throughout the stack

The compression middleware analyzes each response to determine if compression will be beneficial, applying it only when the size reduction justifies the CPU cost. The rate limiting middleware applies different thresholds based on endpoint sensitivity, with stricter limits for patient data access and authentication endpoints.

**Section sources**
- [query-timeout-middleware.ts](file://apps/api/src/middleware/query-timeout-middleware.ts#L488-L496)
- [compression-middleware.ts](file://apps/api/src/middleware/compression-middleware.ts)
- [rate-limiting.ts](file://apps/api/src/middleware/rate-limiting.ts)

## Troubleshooting Guide
When diagnosing issues with the NeonPro backend, consider the following common scenarios and their solutions:

### Common Issues and Solutions:
- **500 Internal Server Errors**: Check error tracking in Sentry and structured logs for detailed exception information
- **429 Too Many Requests**: Verify rate limiting configuration and client behavior; check if legitimate traffic is being blocked
- **Slow Response Times**: Examine query timeout logs and database performance metrics; optimize slow queries
- **Authentication Failures**: Validate JWT tokens and session management; check security headers configuration
- **CORS Errors**: Verify origin whitelist in development and production environments
- **Data Inconsistencies**: Review audit trail entries for changes; validate transaction boundaries in business logic

The system provides several diagnostic endpoints for troubleshooting:
- `/health`: Basic health check
- `/v1/health`: Detailed health status with monitoring data
- `/v1/info`: System information and configuration
- `/v1/monitoring/https`: HTTPS performance and compliance status
- `/v1/security/status`: Security configuration and status

**Section sources**
- [app.ts](file://apps/api/src/app.ts#L1-L572)
- [error-handler.ts](file://apps/api/src/middleware/error-handler.ts)
- [http-error-handling.ts](file://apps/api/src/middleware/http-error-handling.ts)

## Conclusion
The NeonPro backend API service demonstrates a sophisticated architecture that balances performance, security, and regulatory compliance requirements for healthcare applications. By leveraging the Hono framework and tRPC, the system achieves high performance with type-safe APIs. The comprehensive middleware pipeline enforces security policies, rate limiting, and observability across all requests. The layered architecture separates concerns effectively, with business logic encapsulated in services that interact with data sources through well-defined interfaces. The implementation of advanced features like AI-powered no-show prediction and adaptive reminders showcases the platform's capability to deliver innovative healthcare solutions while maintaining strict compliance with Brazilian regulations. Future enhancements could include more granular rate limiting policies, enhanced caching strategies, and additional AI-driven features for clinical decision support.