# Data Model: AI Agent Database Integration

## Core Entities

### UserQuery

Represents a natural language query from the user

```typescript
interface UserQuery {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
  sessionId: string;
  context?: QueryContext;
}

interface QueryContext {
  previousQueries?: UserQuery[];
  currentUserData?: UserData;
  activeFilters?: Filter[];
}
```

### AgentResponse

Structured response from the AI agent

```typescript
interface AgentResponse {
  id: string;
  queryId: string;
  type: "text" | "list" | "table" | "chart" | "error";
  content: ResponseContent;
  actions?: Action[];
  timestamp: Date;
}

interface ResponseContent {
  title?: string;
  text?: string;
  data?: any[];
  columns?: TableColumn[];
  chartConfig?: ChartConfig;
}

interface Action {
  id: string;
  label: string;
  type: "button" | "link" | "filter";
  action: string;
  payload?: any;
}
```

### Data Access Entities

These entities represent the data that can be queried through the agent

#### ClientData

```typescript
interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from existing client schema
}
```

#### AppointmentData

```typescript
interface AppointmentData {
  id: string;
  clientId: string;
  clientName?: string;
  datetime: Date;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  type: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FinancialData

```typescript
interface FinancialData {
  id: string;
  type: "revenue" | "expense" | "invoice";
  amount: number;
  currency: string;
  date: Date;
  description: string;
  clientId?: string;
  status: "pending" | "paid" | "overdue";
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Query Intent Model

The agent will parse user queries to determine intent

```typescript
interface QueryIntent {
  primary: "clients" | "appointments" | "finances" | "general";
  action: "list" | "search" | "summary" | "create" | "update";
  filters: Filter[];
  timeRange?: TimeRange;
  sort?: SortOption;
}

interface Filter {
  field: string;
  operator: "equals" | "contains" | "greater" | "less" | "in";
  value: any;
}

interface TimeRange {
  start: Date;
  end: Date;
}
```

## State Management

```typescript
interface ConversationState {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  context: ConversationContext;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
}

interface ConversationContext {
  currentUser: UserData;
  activeFilters: Filter[];
  lastQueryType?: string;
  relevantDataIds?: string[];
}
```

## Database Schema Extensions

The agent will need access to existing tables:

- `clients` - Client information
- `appointments` - Appointment scheduling
- `financial_records` - Financial transactions
- `users` - User accounts and permissions
- `user_sessions` - Chat session management

## Security Model

```typescript
interface PermissionCheck {
  userId: string;
  resource: string;
  action: "read" | "write" | "delete";
  context?: any;
}

interface AccessResult {
  granted: boolean;
  reason?: string;
  filteredData?: any;
}
```

## API Contracts

See `/contracts/` directory for detailed API specifications.
