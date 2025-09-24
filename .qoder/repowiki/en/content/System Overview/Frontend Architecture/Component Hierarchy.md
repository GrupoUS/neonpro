# Component Hierarchy

<cite>
**Referenced Files in This Document**
- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx)
- [NeonProChatProvider.tsx](file://apps/web/src/components/chat/NeonProChatProvider.tsx)
- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx)
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx)
- [button.tsx](file://apps/web/src/components/ui/button.tsx)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Core UI Components](#core-ui-components)
3. [Component Composition Patterns](#component-composition-patterns)
4. [Provider Wrappers and State Management](#provider-wrappers-and-state-management)
5. [Event Calendar Implementation](#event-calendar-implementation)
6. [Patient Scheduling Example](#patient-scheduling-example)
7. [Dashboard Integration](#dashboard-integration)
8. [Prop Drilling Solutions](#prop-drilling-solutions)
9. [Conclusion](#conclusion)

## Introduction

This document provides a comprehensive analysis of the component hierarchy in the neonpro frontend application, focusing on key UI components including buttons, calendars, and provider wrappers. The documentation explains how these components are structured, composed, and integrated within patient scheduling and dashboard views. Special attention is given to implementation details, props/attributes, event handling patterns, and solutions to common issues like prop drilling through context and state management systems.

## Core UI Components

The neonpro frontend implements a robust set of reusable UI components that follow modern React patterns and accessibility standards. These components serve as the building blocks for higher-level interfaces across the application.

### Button Component

The Button component is implemented as a polymorphic component that can render as either a native button or any other element via the `asChild` prop. It uses the `class-variance-authority` (cva) pattern to manage variant styles and supports multiple predefined variants including default, destructive, outline, secondary, ghost, and link.

```mermaid
classDiagram
class Button {
+className : string
+variant : 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
+size : 'default' | 'sm' | 'lg' | 'icon'
+asChild : boolean
+children : ReactNode
+ref : Ref<HTMLButtonElement>
}
Button --> Slot : "uses when asChild"
Button --> buttonVariants : "applies styling"
```

**Diagram sources**

- [button.tsx](file://apps/web/src/components/ui/button.tsx#L41-L52)

**Section sources**

- [button.tsx](file://apps/web/src/components/ui/button.tsx#L41-L52)

## Component Composition Patterns

The application follows composition over inheritance principles, allowing components to be flexibly combined to create complex interfaces. This section examines how presentational and container components work together.

### Presentational vs Container Components

Presentational components focus on how things look and are typically pure functions of their props. Container components manage state and behavior, providing data and callbacks to presentational components. The EventCalendar serves as a prime example of this pattern, where it manages calendar state while delegating rendering to view components (DayView, WeekView, MonthView).

```mermaid
flowchart TD
A[Container Component] --> B[State Management]
A --> C[Business Logic]
A --> D[Data Fetching]
A --> E[Event Handlers]
B --> F[Presentational Component]
C --> F
D --> F
E --> F
F --> G[UI Rendering]
```

**Diagram sources**

- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx#L21-L239)

**Section sources**

- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx#L21-L239)

## Provider Wrappers and State Management

The application utilizes several provider components to manage global state and dependencies, avoiding prop drilling through context-based solutions.

### TRPC and TanStack Query Providers

The TRPCProvider and TanStackQueryProvider components establish the data fetching layer for the application. They provide shared clients and query caches to all child components, enabling efficient data synchronization and caching.

```mermaid
sequenceDiagram
participant App as "App Component"
participant TRPC as "TRPCProvider"
participant TanStack as "TanStackQueryProvider"
participant QueryClient as "QueryClient Instance"
App->>TRPC : Wrap children
App->>TanStack : Wrap children
TanStack->>QueryClient : Create instance with optimized config
TRPC->>trpc.Provider : Initialize with trpcClient and queryClient
trpc.Provider-->>App : Provide tRPC procedures
QueryClient-->>App : Enable data fetching/caching
```

**Diagram sources**

- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L8-L15)
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L35-L45)

**Section sources**

- [TRPCProvider.tsx](file://apps/web/src/components/providers/TRPCProvider.tsx#L8-L15)
- [TanStackQueryProvider.tsx](file://apps/web/src/components/providers/TanStackQueryProvider.tsx#L35-L45)

## Event Calendar Implementation

The EventCalendar component represents a sophisticated calendar system designed for healthcare scheduling with multiple view modes and filtering capabilities.

### Calendar Component Props

The EventCalendar accepts several props that control its behavior and appearance:

| Prop Name       | Type                         | Description                                   | Required |
| --------------- | ---------------------------- | --------------------------------------------- | -------- |
| events          | CalendarEvent[]              | Array of calendar events to display           | Yes      |
| view            | CalendarView                 | Initial view configuration (day, week, month) | No       |
| filters         | CalendarFilters              | Filter criteria for events                    | No       |
| onEventClick    | Function                     | Callback when an event is clicked             | No       |
| onDateChange    | Function                     | Callback when current date changes            | No       |
| onViewChange    | Function                     | Callback when view type changes               | No       |
| onEventCreate   | Function                     | Callback to create new events                 | No       |
| onEventUpdate   | Function                     | Callback to update existing events            | No       |
| onEventDelete   | Function                     | Callback to delete events                     | No       |
| isLoading       | boolean                      | Loading state indicator                       | No       |
| workingHours    | {start: number, end: number} | Business hours for day/week views             | No       |
| intervalMinutes | number                       | Time slot interval in minutes                 | No       |

### State Management

The component maintains internal state using React's useState hook, managing:

- Current date navigation
- Active view mode
- Selected event
- Event creation state
- Filter settings
- Loading status

The state transitions are handled through useCallback memoized functions to prevent unnecessary re-renders.

**Section sources**

- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx#L21-L239)

## Patient Scheduling Example

The EventCalendar component is used extensively in patient scheduling interfaces, demonstrating practical implementation of the component hierarchy.

### Scheduling Workflow

When a user clicks on a time slot in the calendar, the following sequence occurs:

```mermaid
sequenceDiagram
participant User as "User"
participant Calendar as "EventCalendar"
participant Form as "EventForm"
participant API as "Backend API"
User->>Calendar : Click time slot
Calendar->>Calendar : Call handleDateClick()
Calendar->>Calendar : Set isCreatingEvent state
Calendar->>Form : Display event creation form
User->>Form : Fill appointment details
User->>Form : Submit form
Form->>Calendar : Call handleEventSave()
Calendar->>API : Call onEventCreate() callback
API-->>Calendar : Return created event
Calendar->>Calendar : Update state and close form
Calendar-->>User : Display new appointment
```

The component handles both creation and editing of appointments through the same form interface, with the presence of an event ID determining whether it's creating a new appointment or updating an existing one.

**Section sources**

- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx#L21-L239)

## Dashboard Integration

The NeonProChatProvider demonstrates how provider wrappers integrate with dashboard views to deliver AI-powered assistance.

### Chat Provider Implementation

The NeonProChatProvider establishes a multi-agent chat system specifically designed for healthcare applications with LGPD compliance features.

```mermaid
classDiagram
class NeonProChatProvider {
+config : ChatConfig
+agents : ChatAgentState[]
+activeAgentId : string | null
+initializeConfig() : void
+setActiveAgent() : void
+sendMessage() : Promise<void>
+clearChat() : void
+exportChat() : Promise<string>
}
class ChatAgentState {
+id : string
+type : 'client' | 'financial' | 'appointment'
+name : string
+status : 'idle' | 'thinking' | 'responding' | 'error'
+context : Object
+messages : Message[]
}
class ChatConfig {
+clinicId : string
+userId : string
+userRole : string
+language : 'pt-BR' | 'en-US'
+compliance : ComplianceSettings
}
NeonProChatProvider --> ChatAgentState : "manages"
NeonProChatProvider --> ChatConfig : "uses"
NeonProChatProvider --> CopilotKit : "wraps"
```

**Diagram sources**

- [NeonProChatProvider.tsx](file://apps/web/src/components/chat/NeonProChatProvider.tsx#L65-L279)

**Section sources**

- [NeonProChatProvider.tsx](file://apps/web/src/components/chat/NeonProChatProvider.tsx#L65-L279)

## Prop Drilling Solutions

The application addresses prop drilling through strategic use of React Context and provider patterns, ensuring clean component interfaces.

### Context-Based State Management

Instead of passing props through multiple component layers, the application uses context providers at appropriate levels of the component tree:

```mermaid
flowchart TD
A[App] --> B[TRPCProvider]
A --> C[TanStackQueryProvider]
A --> D[NeonProChatProvider]
B --> E[Feature Modules]
C --> E
D --> E
E --> F[Page Components]
F --> G[Presentational Components]
style A fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333,color:#fff
style C fill:#bbf,stroke:#333,color:#fff
style D fill:#bbf,stroke:#333,color:#fff
style E fill:#9f9,stroke:#333
style F fill:#ff9,stroke:#333
style G fill:#fff,stroke:#333
click B "/path/to/trpc-provider" "TRPC Provider"
click C "/path/to/tanstack-provider" "TanStack Query Provider"
click D "/path/to/chat-provider" "Chat Provider"
```

The EventCalendar component exemplifies this approach by accepting callback props for data operations rather than the data itself, allowing parent components to manage data fetching concerns through the established provider context.

**Section sources**

- [EventCalendar.tsx](file://apps/web/src/components/event-calendar/EventCalendar.tsx#L21-L239)
- [NeonProChatProvider.tsx](file://apps/web/src/components/chat/NeonProChatProvider.tsx#L65-L279)

## Conclusion

The neonpro frontend demonstrates a well-structured component hierarchy that effectively separates concerns between presentational and container components. Key UI elements like buttons and calendars are implemented with flexibility and accessibility in mind, while provider wrappers solve prop drilling issues through context-based state management. The EventCalendar component showcases sophisticated state management and composition patterns, serving as a central interface for patient scheduling. Meanwhile, the NeonProChatProvider illustrates how specialized provider components can deliver domain-specific functionality with compliance considerations. These patterns enable the creation of maintainable, scalable interfaces that support both simple interactions and complex workflows in healthcare applications.
