# Data Model: AI Agent Database Integration

## Core Entities

### User Query
**Purpose**: Represents natural language input from users requesting data or actions
**Fields**:
- `id`: Unique identifier (UUID)
- `sessionId`: Session identifier for conversation context
- `userId`: User who submitted the query
- `query`: Natural language text input
- `intent`: Parsed intent classification (client_data, appointments, financial, general)
- `parameters`: Extracted parameters from the query (client names, dates, etc.)
- `timestamp`: When the query was submitted
- `status`: Query processing status (pending, processing, completed, failed)

**Relationships**:
- Belongs to User (userId)
- Belongs to Session (sessionId)
- Has one AI Agent Response

**Validation Rules**:
- Query text must not be empty
- Session ID must be valid and active
- User must have appropriate permissions for the intent
- Parameters must match expected format for intent type

### AI Agent Response
**Purpose**: Structured response containing data, visualizations, and interactive elements
**Fields**:
- `id`: Unique identifier (UUID)
- `queryId`: Reference to the original query
- `type`: Response type (text, list, table, chart, error)
- `content`: Response content object
- `actions`: Available interactive actions
- `metadata`: Response metadata (confidence, sources, etc.)
- `timestamp`: When the response was generated
- `processingTime`: Time taken to generate response (ms)

**Relationships**:
- Belongs to User Query (queryId)
- May reference Client Data, Appointment Data, or Financial Data

**Validation Rules**:
- Response type must be valid enum value
- Content must match expected structure for response type
- Processing time must be ≤2000ms for simple queries
- Actions must be valid and permitted for user role

### Client Data
**Purpose**: Personal and contact information of patients/clients (existing entity)
**Fields** (referenced from existing schema):
- `id`: Unique identifier
- `name`: Full name
- `email`: Contact email
- `phone`: Contact phone
- `address`: Physical address
- `birthDate`: Date of birth
- `documents`: Identity documents
- `medicalHistory`: Medical history references
- `createdAt`: Record creation timestamp
- `updatedAt`: Last modification timestamp
- `domain`: Organization/clinic domain (for RLS)

**Relationships**:
- Has many Appointments
- Has many Financial Records
- Belongs to Domain (for RLS enforcement)

**Security Rules (RLS)**:
- Users can only access clients within their domain
- Role-based access: doctors see full records, receptionists see basic info
- Audit logging required for all access

### Appointment Data
**Purpose**: Scheduling information including dates, times, participants, and status (existing entity)
**Fields** (referenced from existing schema):
- `id`: Unique identifier
- `clientId`: Reference to client
- `providerId`: Healthcare provider
- `datetime`: Scheduled date and time
- `duration`: Appointment duration (minutes)
- `status`: Appointment status (scheduled, confirmed, completed, cancelled, no_show)
- `type`: Appointment type (consultation, procedure, follow_up)
- `notes`: Appointment notes
- `createdAt`: Record creation timestamp
- `domain`: Organization/clinic domain (for RLS)

**Relationships**:
- Belongs to Client Data (clientId)
- Belongs to Provider (providerId)
- Belongs to Domain (for RLS enforcement)

**Security Rules (RLS)**:
- Users can only access appointments within their domain
- Time-based access: only future and recent past appointments
- Role-based visibility of notes and sensitive information

### Financial Data
**Purpose**: Revenue, billing, and payment information (existing entity)
**Fields** (referenced from existing schema):
- `id`: Unique identifier
- `clientId`: Reference to client (if applicable)
- `appointmentId`: Reference to appointment (if applicable)
- `amount`: Financial amount
- `currency`: Currency code (BRL)
- `type`: Transaction type (payment, refund, invoice, expense)
- `status`: Transaction status (pending, completed, failed, cancelled)
- `description`: Transaction description
- `paymentMethod`: Payment method used
- `timestamp`: Transaction timestamp
- `domain`: Organization/clinic domain (for RLS)

**Relationships**:
- May belong to Client Data (clientId)
- May belong to Appointment Data (appointmentId)
- Belongs to Domain (for RLS enforcement)

**Security Rules (RLS)**:
- Users can only access financial data within their domain
- Role-based access: admin sees all, others see limited information
- Audit logging mandatory for all financial data access

### Permission Context
**Purpose**: User's access rights and data scope based on role and domain
**Fields**:
- `userId`: User identifier
- `domain`: Organization/clinic domain
- `role`: User role (admin, doctor, nurse, receptionist)
- `permissions`: Specific permissions array
- `dataScope`: Data access scope (own_clients, all_clients, financial_read, etc.)
- `lastAccess`: Last access timestamp
- `sessionExpiry`: When current session expires

**Relationships**:
- Belongs to User
- Defines access to Client Data, Appointment Data, Financial Data

**Validation Rules**:
- Role must be valid enum value
- Permissions must be valid for the assigned role
- Session must not be expired
- Domain must be valid and active

## Session Management

### Chat Session
**Purpose**: Manages conversation context and history
**Fields**:
- `id`: Session identifier (UUID)
- `userId`: User identifier
- `status`: Session status (active, expired, terminated)
- `createdAt`: Session start time
- `lastActivity`: Last interaction timestamp
- `context`: Conversation context object
- `messageCount`: Number of messages in session

**Relationships**:
- Belongs to User
- Has many User Queries
- Has many AI Agent Responses

**State Transitions**:
- `active` → `expired` (after 30 minutes of inactivity)
- `active` → `terminated` (explicit logout)
- Cannot transition back to `active` once `expired` or `terminated`

## Data Flow Architecture

### Query Processing Flow
1. **Input**: User submits natural language query
2. **Authentication**: Validate user session and permissions
3. **Intent Parsing**: Extract intent and parameters from query
4. **Authorization**: Verify user has permission for requested data
5. **Data Retrieval**: Query database with RLS enforcement
6. **Response Formatting**: Format data for chat interface
7. **Response Delivery**: Send formatted response to user

### Security Enforcement Points
1. **Session Validation**: Every request validates active session
2. **RLS Enforcement**: Database-level row security on all queries
3. **Intent Authorization**: Check permissions before data access
4. **Data Sanitization**: Remove sensitive data based on user role
5. **Audit Logging**: Log all data access attempts and results

## Database Constraints

### Performance Constraints
- Query responses must complete within 2 seconds
- Database connections must use connection pooling
- Frequently accessed data should be cached
- Indexes required on domain, userId, timestamp fields

### Security Constraints
- All tables must implement RLS policies
- Audit trails required for sensitive data access
- Data encryption at rest for PII and PHI
- No direct database access from frontend

### Scalability Constraints
- Support for multiple concurrent sessions
- Horizontal scaling capability for read operations
- Efficient query patterns for large datasets
- Real-time updates via Supabase subscriptions