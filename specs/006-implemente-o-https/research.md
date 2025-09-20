# Research Findings: AI Agent Database Integration

## Technical Decisions

### CopilotKit

**Decision**: Use CopilotKit for the conversational AI interface  
**Rationale**:

- Provides complete chat UI and agent infrastructure
- Supports React/Next.js integration (matches NeonPro stack)
- Enables generative UI capabilities for rich responses
- Open-source with active community support

**Alternatives considered**:

- Custom chat implementation: Would require significant development effort
- Other chat frameworks: Less integration with agent ecosystems

### AG-UI Protocol

**Decision**: Implement AG-UI Protocol for real-time communication  
**Rationale**:

- Event-driven architecture supports real-time updates
- Standardized protocol for agent/user communication
- Compatible with multiple agent frameworks
- Supports bi-directional communication

**Alternatives considered**:

- WebSockets directly: Would need custom protocol implementation
- gRPC: Overkill for this use case, more complex setup

### Ottomator Agents (ag-ui-rag-agent)

**Decision**: Use as base for backend agent logic  
**Rationale**:

- Provides RAG (Retrieval-Augmented Generation) capabilities
- Pre-built integration with AG-UI protocol
- Python-based, easy to extend with custom data access
- Open-source and well-documented

**Alternatives considered**:

- Custom agent implementation: Would require building from scratch
- Other agent frameworks: Less integration with specified requirements

### Database Integration

**Decision**: Use Supabase service role with RLS enforcement  
**Rationale**:

- NeonPro already uses Supabase as primary database
- Row Level Security ensures proper data access controls
- Service role allows agent to access data while respecting permissions
- Existing schemas for clients, appointments, and finances

**Architecture Pattern**:

- Backend agent acts as intermediary between UI and database
- All database queries go through centralized data service
- Agent uses natural language processing to understand user intent
- Responses formatted for interactive display in chat interface

### Technology Stack Confirmation

- **Frontend**: React/Next.js with TypeScript (existing stack)
- **Backend**: Node.js/Hono.js for agent endpoint (existing patterns)
- **Agent**: Python-based ottomator-agents with custom extensions
- **Database**: Supabase/PostgreSQL with RLS (existing)
- **Communication**: AG-UI Protocol over WebSockets

### Security Considerations

- Never expose Supabase service keys in frontend code
- All data access must respect RLS policies
- User permissions validated before each query
- Audit logging for all data access attempts

### Performance Requirements

- Response time < 2 seconds for simple queries
- Support for concurrent user conversations
- Efficient data retrieval with proper indexing
- Caching strategies for frequently accessed data

## Integration Points

1. **Frontend Integration**: CopilotKit components in React app
2. **Backend Integration**: Hono.js endpoint serving AG-UI protocol
3. **Database Integration**: Service layer with Supabase client
4. **Agent Integration**: Custom data retrieval functions in ottomator agent

## Unknowns Resolved

- [x] How to integrate CopilotKit with existing Next.js app
- [x] How to secure database access from agent
- [x] How to handle real-time communication
- [x] How to format responses for interactive display
