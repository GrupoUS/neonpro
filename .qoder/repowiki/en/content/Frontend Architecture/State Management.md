# State Management

<cite>
**Referenced Files in This Document **   
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts)
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx)
- [context.ts](file://apps/api/src/trpc/context.ts)
- [router.ts](file://apps/api/src/trpc/router.ts)
- [patients.ts](file://apps/api/src/trpc/routers/patients.ts)
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
This document provides a comprehensive analysis of the state management system in the neonpro frontend application. It details how TanStack Query and React hooks are used to manage server state, with a focus on the integration between frontend data fetching and backend tRPC services. The documentation explains custom hooks like `usePatients`, cache management strategies, error handling, and real-time data synchronization patterns.

## Project Structure
The state management system is organized across multiple directories within the web application. Key components are located in dedicated folders for hooks, providers, and API integrations. The architecture follows a modular pattern that separates concerns between data fetching, state management, and UI presentation layers.

```mermaid
graph TD
A[Frontend] --> B[State Management]
B --> C[TanStack Query Provider]
B --> D[tRPC Provider]
B --> E[Custom Hooks]
E --> F[usePatients]
E --> G[Other Entity Hooks]
C --> H[QueryClient]
D --> I[tRPC Client]
H --> J[Cache Storage]
I --> K[Backend API]
```

**Diagram sources **
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts)

**Section sources**
- [apps/web/src](file://apps/web/src)
- [apps/web/src/hooks](file://apps/web/src/hooks)
- [apps/web/src/components/providers](file://apps/web/src/components/providers)

## Core Components
The core components of the state management system include the TanStack Query provider, tRPC integration layer, and custom React hooks that abstract data fetching logic. These components work together to provide a seamless experience for managing server state while maintaining compliance with healthcare regulations like LGPD.

**Section sources**
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L35-L45)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L8-L15)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L39-L65)

## Architecture Overview
The architecture implements a layered approach to state management, with clear separation between the UI layer, data fetching layer, and backend services. TanStack Query serves as the central caching mechanism, while tRPC provides type-safe communication with the backend. Custom hooks encapsulate business logic and provide a clean API for components to interact with data.

```mermaid
graph LR
UI[React Components] --> Hooks[Custom Hooks]
Hooks --> TQ[TanStack Query]
TQ --> TRPC[tRPC Client]
TRPC --> API[Backend Services]
API --> DB[(Database)]
TQ --> Cache[(In-Memory Cache)]
subgraph "Frontend"
UI
Hooks
TQ
TRPC
end
subgraph "Backend"
API
DB
end
```

**Diagram sources **
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts)

## Detailed Component Analysis
This section provides an in-depth analysis of the key components that make up the state management system, including their implementation details, configuration options, and interaction patterns.

### usePatients Hook Analysis
The `usePatients` hook demonstrates how data fetching logic is abstracted using TanStack Query. It handles patient data retrieval with support for filtering, caching, and error handling. The hook uses query keys for consistent cache invalidation and includes proper error propagation mechanisms.

#### For Object-Oriented Components:
```mermaid
classDiagram
class usePatients {
+filters : Record<string, any>
+queryKey : string[]
+queryFn() : Promise<Patient[]>
+staleTime : number
+gcTime : number
}
class usePatient {
+id : string
+queryKey : string[]
+queryFn() : Promise<Patient>
+enabled : boolean
}
class useCreatePatient {
+mutationFn(data : CreatePatientData) : Promise<Patient>
+onSuccess(patient : Patient) : void
+onError(error : Error) : void
}
class useUpdatePatient {
+mutationFn(data : UpdatePatientData) : Promise<Patient>
+onSuccess(patient : Patient) : void
}
class useDeletePatient {
+mutationFn(id : string) : Promise<string>
+onSuccess(id : string) : void
}
usePatients --> useQuery : "extends"
usePatient --> useQuery : "extends"
useCreatePatient --> useMutation : "extends"
useUpdatePatient --> useMutation : "extends"
useDeletePatient --> useMutation : "extends"
```

**Diagram sources **
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L39-L65)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L70-L85)

#### For API/Service Components:
```mermaid
sequenceDiagram
participant Component as "React Component"
participant Hook as "usePatients Hook"
participant Query as "TanStack Query"
participant Supabase as "Supabase Client"
Component->>Hook : Call usePatients(filters)
Hook->>Query : useQuery(queryKey, queryFn)
Query->>Query : Check cache for queryKey
alt Data in cache & not stale
Query-->>Hook : Return cached data
Hook-->>Component : Return patient data
else Stale or not in cache
Query->>Supabase : Execute queryFn
Supabase->>Supabase : Apply filters (search, status)
Supabase->>Supabase : SELECT * FROM patients
Supabase-->>Query : Return data/error
alt Success
Query->>Query : Store in cache
Query-->>Hook : Return data
Hook-->>Component : Return patient data
else Error
Query-->>Hook : Throw error
Hook-->>Component : Propagate error
end
end
```

**Diagram sources **
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L39-L65)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L8-L19)

#### For Complex Logic Components:
```mermaid
flowchart TD
Start([Hook Initialization]) --> ValidateFilters["Validate Filters Object"]
ValidateFilters --> BuildQuery["Build Supabase Query"]
BuildQuery --> ApplySearch{"Has Search Filter?"}
ApplySearch --> |Yes| AddSearchFilter["Add ilike filter on full_name"]
ApplySearch --> |No| Continue
AddSearchFilter --> Continue
Continue --> ApplyStatus{"Has Status Filter?"}
ApplyStatus --> |Yes| AddStatusFilter["Add eq filter on status"]
ApplyStatus --> |No| FetchData
AddStatusFilter --> FetchData
FetchData --> ExecuteQuery["Execute Supabase Query"]
ExecuteQuery --> CheckError{"Query Successful?"}
CheckError --> |No| ThrowError["Throw Error with Message"]
CheckError --> |Yes| ReturnData["Return Data as Patient[]"]
ThrowError --> End([Error Propagated])
ReturnData --> End
```

**Diagram sources **
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L45-L60)

**Section sources**
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L1-L197)

### TanStack Query Provider Analysis
The TanStack Query provider configures the global query client with optimized settings for the healthcare application. It includes development tools and establishes default behaviors for queries and mutations.

```mermaid
classDiagram
class TanStackQueryProvider {
+children : ReactNode
+queryClient : QueryClient
}
class QueryClient {
+defaultOptions : DefaultOptions
+cache : QueryCache
}
class DefaultOptions {
+queries : QueryDefaults
+mutations : MutationDefaults
}
class QueryDefaults {
+staleTime : number
+retry : function
+gcTime : number
+refetchOnWindowFocus : boolean
+refetchOnReconnect : boolean
}
class MutationDefaults {
+retry : number
+gcTime : number
}
TanStackQueryProvider --> QueryClientProvider : "wraps"
QueryClient --> DefaultOptions
DefaultOptions --> QueryDefaults
DefaultOptions --> MutationDefaults
TanStackQueryProvider --> ReactQueryDevtools : "includes in dev"
```

**Diagram sources **
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L35-L45)

**Section sources**
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L1-L57)

### tRPC Integration Analysis
The tRPC provider establishes the connection between the frontend and backend services, enabling type-safe API calls with automatic serialization and deserialization. It integrates with TanStack Query to provide seamless data fetching capabilities.

```mermaid
classDiagram
class TRPCProvider {
+children : ReactNode
}
class trpc {
+Provider : ReactComponent
+createReactQueryHooks : function
}
class trpcClient {
+patients : PatientRouter
+appointments : AppointmentRouter
+ai : AIRouter
}
class queryClient {
+getQueryData : function
+setQueryData : function
+invalidateQueries : function
}
TRPCProvider --> trpc.Provider : "uses"
trpc.Provider --> trpcClient : "client prop"
trpc.Provider --> queryClient : "queryClient prop"
TRPCProvider --> TanStackQueryProvider : "depends on"
```

**Diagram sources **
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L8-L15)

**Section sources**
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L1-L16)

## Dependency Analysis
The state management system has well-defined dependencies between components, ensuring loose coupling and high cohesion. The architecture leverages dependency injection through React context to provide necessary clients and configuration to consuming components.

```mermaid
graph TD
A[TanStackQueryProvider] --> B[QueryClient]
C[TRPCProvider] --> D[tRPC Client]
C --> B
E[Custom Hooks] --> B
E --> D
F[React Components] --> E
style A fill:#f9f,stroke:#333
style C fill:#f9f,stroke:#333
style E fill:#bbf,stroke:#333
```

**Diagram sources **
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts)

**Section sources**
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L1-L57)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L1-L16)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L1-L197)

## Performance Considerations
The state management system incorporates several performance optimizations, including configurable stale times, garbage collection intervals, and intelligent refetching strategies. The default configuration balances freshness of data with network efficiency, particularly important in healthcare applications where data accuracy is critical.

**Section sources**
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L10-L30)

## Troubleshooting Guide
Common issues in the state management system typically involve cache invalidation, authentication errors, or type mismatches between frontend and backend. The React Query Devtools provide valuable insights into query states and can help diagnose problems with data fetching and caching behavior.

**Section sources**
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L40-L45)
- [usePatients.ts](file://apps/web/src/hooks/usePatients.ts#L55-L60)

## Conclusion
The state management system in neonpro effectively combines TanStack Query and tRPC to create a robust, type-safe solution for managing server state in a healthcare application. The architecture prioritizes data consistency, regulatory compliance, and developer experience through well-abstracted custom hooks and comprehensive error handling. By leveraging these patterns, the application maintains optimal performance while ensuring sensitive patient data is handled according to strict privacy requirements.