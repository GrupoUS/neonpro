# AI Services

<cite>
**Referenced Files in This Document **   
- [main.py](file://apps/ai-agent/main.py)
- [config.py](file://apps/ai-agent/config.py)
- [agent_service.py](file://apps/ai-agent/services/agent_service.py)
- [database_service.py](file://apps/ai-agent/services/database_service.py)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py)
- [requirements.txt](file://apps/ai-agent/requirements.txt)
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
The NeonPro AI Agent Service is a healthcare-focused artificial intelligence system built with FastAPI and Python, designed to provide real-time assistance through WebSocket communication. The service enables natural language interaction for querying patient data, appointment information, and financial records while maintaining compliance with Brazilian healthcare regulations such as LGPD (Lei Geral de Proteção de Dados). The architecture integrates multiple AI providers including OpenAI and Anthropic, implements RAG (Retrieval-Augmented Generation) capabilities, and follows the AG-UI protocol for structured communication between frontend and backend systems.

## Project Structure
The AI agent service is organized within the `apps/ai-agent` directory and follows a modular structure with clear separation of concerns. The core functionality is divided into services for agent logic, database operations, and WebSocket management. Configuration is handled through Pydantic settings with environment variable support, and the application uses standard Python packaging conventions with requirements files for dependencies.

```mermaid
graph TD
A[AI Agent Service] --> B[Main Application]
A --> C[Configuration]
A --> D[Services]
A --> E[Tests]
A --> F[Docker Configuration]
D --> G[Agent Service]
D --> H[Database Service]
D --> I[WebSocket Manager]
F --> J[Dockerfile]
F --> K[docker-compose.yml]
E --> L[Unit Tests]
E --> M[Integration Tests]
```

**Diagram sources **
- [main.py](file://apps/ai-agent/main.py)
- [services/agent_service.py](file://apps/ai-agent/services/agent_service.py)
- [services/database_service.py](file://apps/ai-agent/services/database_service.py)
- [services/websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py)

**Section sources**
- [main.py](file://apps/ai-agent/main.py)
- [config.py](file://apps/ai-agent/config.py)
- [services/agent_service.py](file://apps/ai-agent/services/agent_service.py)
- [services/database_service.py](file://apps/ai-agent/services/database_service.py)
- [services/websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py)

## Core Components
The AI Agent Service consists of three primary components: the AgentService handles natural language processing and business logic, the DatabaseService manages interactions with Supabase for healthcare data retrieval, and the WebSocketManager orchestrates real-time bidirectional communication with clients. These components work together to process user queries, extract relevant entities, determine intent, and return structured responses while maintaining conversation context through memory buffers.

**Section sources**
- [agent_service.py](file://apps/ai-agent/services/agent_service.py)
- [database_service.py](file://apps/ai-agent/services/database_service.py)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py)

## Architecture Overview
The AI services architecture follows a microservices pattern with FastAPI as the web framework, enabling both REST API endpoints and WebSocket connections for real-time communication. The system integrates with external AI providers (OpenAI, Anthropic) through LangChain, connects to Supabase for persistent storage of healthcare data, and implements the AG-UI protocol for standardized message exchange. The architecture supports both synchronous REST queries and asynchronous WebSocket interactions, with proper error handling, logging, and health checks.

```mermaid
graph TB
subgraph "Frontend"
UI[User Interface]
WS[WebSocket Client]
end
subgraph "AI Agent Service"
API[FastAPI Server]
AGENT[Agent Service]
DB[Database Service]
WS_MANAGER[WebSocket Manager]
CACHE[(In-Memory Cache)]
end
subgraph "External Services"
OPENAI[OpenAI API]
ANTHROPIC[Anthropic API]
SUPABASE[Supabase Database]
end
UI --> WS
WS --> API
API --> AGENT
AGENT --> DB
DB --> SUPABASE
AGENT --> OPENAI
AGENT --> ANTHROPIC
WS_MANAGER --> WS
DB --> CACHE
CACHE --> DB
style API fill:#4CAF50,stroke:#388E3C
style AGENT fill:#2196F3,stroke:#1976D2
style DB fill:#FF9800,stroke:#F57C00
style WS_MANAGER fill:#9C27B0,stroke:#7B1FA2
```

**Diagram sources **
- [main.py](file://apps/ai-agent/main.py)
- [agent_service.py](file://apps/ai-agent/services/agent_service.py)
- [database_service.py](file://apps/ai-agent/services/database_service.py)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py)

## Detailed Component Analysis

### Agent Service Analysis
The AgentService class is the core component responsible for processing natural language queries, determining user intent, extracting entities, and coordinating responses from various data sources. It uses LangChain's ConversationChain with memory to maintain context across interactions and implements intent detection based on keyword patterns in Portuguese.

#### For Object-Oriented Components:
```mermaid
classDiagram
class AgentService {
+db_service : DatabaseService
+ws_manager : WebSocketManager
+openai_llm : ChatOpenAI
+anthropic_llm : ChatAnthropic
+memory : ConversationBufferMemory
+conversation : ConversationChain
+name_pattern : Pattern
+cpf_pattern : Pattern
+date_pattern : Pattern
+process_message(message : Dict) Dict
+process_query(query : Dict) Dict
+_detect_intent(text : str) QueryIntent
+_extract_entities(text : str, intent : QueryIntent) Dict
+_handle_client_search(entities : Dict, context : Dict) Dict
+_handle_appointment_query(entities : Dict, context : Dict) Dict
+_handle_financial_query(entities : Dict, context : Dict) Dict
+_handle_schedule_management(entities : Dict, context : Dict) Dict
+_handle_report_generation(entities : Dict, context : Dict) Dict
+_handle_unknown_query(query : str) Dict
+_process_action(message : Dict) Dict
+_process_feedback(message : Dict) Dict
}
class QueryIntent {
<<enumeration>>
CLIENT_SEARCH
APPOINTMENT_QUERY
FINANCIAL_QUERY
SCHEDULE_MANAGEMENT
REPORT_GENERATION
UNKNOWN
}
class DatabaseService {
+supabase_url : str
+supabase_key : str
+client : Client
+_cache : Dict
+_cache_ttl : int
+health_check() bool
+search_patients(name : str, limit : int, context : Optional[Dict]) List[Dict]
+get_patient_appointments(patient_id : str, start_date : Optional[datetime], end_date : Optional[datetime]) List[Dict]
+get_financial_transactions(patient_id : Optional[str], clinic_id : Optional[str], start_date : Optional[datetime], end_date : Optional[datetime]) List[Dict]
+get_professional_info(professional_id : str) Optional[Dict]
+get_service_info(service_id : str) Optional[Dict]
+create_audit_log(user_id : str, action : str, resource_type : str, resource_id : str, details : Dict, ip_address : Optional[str]) bool
+check_lgpd_consent(patient_id : str) bool
+clear_cache()
+get_patient_statistics(patient_id : str) Dict
}
class WebSocketManager {
+active_connections : Dict[str, WebSocket]
+connection_metadata : Dict[str, Dict]
+max_connections : int
+ping_task : Task
+ping_interval : int
+connect(websocket : WebSocket, client_id : str)
+disconnect(websocket : WebSocket)
+send_personal_message(message : dict, websocket : WebSocket)
+broadcast(message : dict)
+send_to_client(client_id : str, message : dict)
+start_ping_task(interval : int)
+close_all_connections()
+get_connection_count() int
+get_connection_stats() Dict
+handle_message(websocket : WebSocket, data : dict)
+_ping_clients()
+_handle_subscription(client_id : str, data : dict)
+_handle_unsubscription(client_id : str, data : dict)
}
AgentService --> DatabaseService : "uses"
AgentService --> WebSocketManager : "uses"
AgentService --> QueryIntent : "references"
```

**Diagram sources **
- [agent_service.py](file://apps/ai-agent/services/agent_service.py#L35-L480)
- [database_service.py](file://apps/ai-agent/services/database_service.py#L14-L284)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L14-L230)

#### For API/Service Components:
```mermaid
sequenceDiagram
participant Client
participant WebSocketManager
participant AgentService
participant DatabaseService
participant ExternalAI
Client->>WebSocketManager : Connect to /ws/agent
WebSocketManager->>Client : Send connection_established
Client->>WebSocketManager : Send query message
WebSocketManager->>AgentService : process_message()
AgentService->>AgentService : _detect_intent()
AgentService->>AgentService : _extract_entities()
alt Client Search Intent
AgentService->>DatabaseService : search_patients()
DatabaseService-->>AgentService : Return patient data
AgentService->>AgentService : Format response
else Appointment Query Intent
AgentService->>DatabaseService : search_patients()
DatabaseService-->>AgentService : Patient found
AgentService->>DatabaseService : get_patient_appointments()
DatabaseService-->>AgentService : Appointment data
AgentService->>DatabaseService : get_professional_info()
DatabaseService-->>AgentService : Professional data
AgentService->>DatabaseService : get_service_info()
DatabaseService-->>AgentService : Service data
AgentService->>AgentService : Format appointment response
else Financial Query Intent
AgentService->>DatabaseService : search_patients()
DatabaseService-->>AgentService : Patient found
AgentService->>DatabaseService : get_financial_transactions()
DatabaseService-->>AgentService : Transaction data
AgentService->>DatabaseService : get_patient_statistics()
DatabaseService-->>AgentService : Statistics data
AgentService->>AgentService : Format financial response
else Unknown Intent
AgentService->>ExternalAI : conversation.arun()
ExternalAI-->>AgentService : AI-generated response
end
AgentService->>AgentService : Save to conversation memory
AgentService->>WebSocketManager : Return response
WebSocketManager->>Client : Send response via WebSocket
```

**Diagram sources **
- [main.py](file://apps/ai-agent/main.py#L100-L127)
- [agent_service.py](file://apps/ai-agent/services/agent_service.py#L100-L480)
- [database_service.py](file://apps/ai-agent/services/database_service.py#L50-L284)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L50-L230)

**Section sources**
- [agent_service.py](file://apps/ai-agent/services/agent_service.py#L35-L480)
- [database_service.py](file://apps/ai-agent/services/database_service.py#L14-L284)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L14-L230)

### Communication Protocol Analysis
The AI agent system implements real-time communication through WebSockets using the AG-UI protocol, which defines standardized message types for queries, actions, and feedback. The WebSocketManager handles connection lifecycle management, including ping/pong keep-alive messages, connection metadata tracking, and broadcast capabilities. The protocol supports both request-response patterns and event-driven subscriptions, enabling rich interactive experiences between the frontend and AI agent.

```mermaid
flowchart TD
A[Client Connects] --> B{Connection Limit?}
B --> |Yes| C[Reject Connection]
B --> |No| D[Accept Connection]
D --> E[Generate Client ID]
E --> F[Store Connection]
F --> G[Send Welcome Message]
G --> H[Start Listening]
H --> I{Receive Message?}
I --> |Yes| J[Parse Message Type]
J --> K{Message Type}
K --> |query| L[Process Query]
K --> |action| M[Process Action]
K --> |feedback| N[Process Feedback]
K --> |pong| O[Update Last Activity]
K --> |subscribe| P[Handle Subscription]
K --> |unsubscribe| Q[Handle Unsubscription]
L --> R[Send Response]
M --> R
N --> R
P --> R
Q --> R
R --> H
I --> |No| S[Check Disconnect]
S --> |Disconnected| T[Remove Connection]
T --> U[Log Disconnection]
U --> V[End]
S --> |Timeout| W[Ping Clients]
W --> X{Active Connections?}
X --> |Yes| Y[Send Ping Message]
Y --> Z[Wait for Pong]
Z --> H
X --> |No| AA[Stop Ping Task]
AA --> AB[End]
```

**Diagram sources **
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L14-L230)
- [main.py](file://apps/ai-agent/main.py#L100-L127)

**Section sources**
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L14-L230)

## Dependency Analysis
The AI agent service has well-defined dependencies managed through pip requirements files. The system relies on FastAPI for web server functionality, LangChain for AI integration, Supabase for database access, and various utility libraries for configuration, logging, and security. The dependency graph shows clear separation between core application logic, external integrations, and development/test utilities.

```mermaid
graph TD
A[AI Agent Service] --> B[FastAPI]
A --> C[LangChain]
A --> D[Supabase]
A --> E[Pydantic]
A --> F[OpenAI SDK]
A --> G[Anthropic SDK]
A --> H[Uvicorn]
A --> I[Websockets]
C --> J[OpenAI Integration]
C --> K[Anthropic Integration]
C --> L[Conversation Memory]
D --> M[PostgreSQL]
A --> N[Python-dotenv]
A --> O[Cryptography]
A --> P[Structlog]
style A fill:#FFD700,stroke:#FFA500
style B fill:#4CAF50,stroke:#388E3C
style C fill:#2196F3,stroke:#1976D2
style D fill:#FF9800,stroke:#F57C00
```

**Diagram sources **
- [requirements.txt](file://apps/ai-agent/requirements.txt)
- [main.py](file://apps/ai-agent/main.py)
- [agent_service.py](file://apps/ai-agent/services/agent_service.py)

**Section sources**
- [requirements.txt](file://apps/ai-agent/requirements.txt)

## Performance Considerations
The AI agent system incorporates several performance optimizations including in-memory caching of database queries, connection pooling through Supabase, and efficient WebSocket connection management. The system limits concurrent connections and implements ping/pong mechanisms to detect and clean up inactive connections. Database queries are optimized with appropriate indexing and filtering, and the agent service uses conversation memory to reduce redundant processing of similar queries.

**Section sources**
- [database_service.py](file://apps/ai-agent/services/database_service.py#L14-L284)
- [websocket_manager.py](file://apps/ai-agent/services/websocket_manager.py#L14-L230)

## Troubleshooting Guide
Common issues with the AI agent service typically involve configuration errors, connectivity problems with external services, or malformed requests. The system provides comprehensive logging through structlog, health check endpoints for monitoring, and detailed error handling with appropriate HTTP status codes. When troubleshooting, verify that environment variables are properly set, check the connectivity to Supabase and AI provider APIs, and review the logs for specific error messages.

**Section sources**
- [main.py](file://apps/ai-agent/main.py#L70-L85)
- [config.py](file://apps/ai-agent/config.py)
- [agent_service.py](file://apps/ai-agent/services/agent_service.py)

## Conclusion
The NeonPro AI Agent Service provides a robust foundation for AI-powered healthcare applications with real-time WebSocket communication, multi-provider AI integration, and strong compliance with Brazilian regulations. The modular architecture separates concerns effectively between agent logic, data access, and communication layers, making the system maintainable and extensible. By following the AG-UI protocol and implementing proper security measures, the service enables safe and effective natural language interaction with sensitive healthcare data.