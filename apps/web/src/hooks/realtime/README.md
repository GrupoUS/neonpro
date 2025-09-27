# Supabase Realtime + TanStack Query + tRPC Integration

## Overview

This integration provides seamless real-time data synchronization between Supabase, TanStack Query, and tRPC for the NeonPro healthcare platform. It enables automatic query invalidation, optimistic updates, and real-time UI updates when data changes in the database.

## Features

- 🔄 **Automatic Query Invalidation**: Queries are automatically refetched when related data changes
- ⚡ **Optimistic Updates**: UI updates immediately before server confirmation
- 🏥 **Healthcare Compliance**: Built-in audit logging for LGPD/ANVISA compliance
- 🔌 **Easy Integration**: Drop-in hooks that work with existing tRPC procedures
- 📊 **Connection Monitoring**: Real-time connection status and health monitoring

## Quick Start

### 1. Setup Provider

Wrap your app with the `RealtimeQueryProvider`:

```typescript
// src/App.tsx
import { RealtimeQueryProvider } from './providers/RealtimeQueryProvider'

function App() {
  return (
    <RealtimeQueryProvider>
      {/* Your app content */}
    </RealtimeQueryProvider>
  )
}
```

### 2. Use Realtime Hooks

Replace your existing `useQuery` calls with `useRealtimeQuery`:

```typescript
// Before: Standard TanStack Query
const { data } = useQuery({
  queryKey: ['appointments'],
  queryFn: () => trpc.appointments.list.query()
})

// After: Real-time enabled query
const { data } = useRealtimeAppointments({
  status: 'scheduled',
  limit: 50
})
```

### 3. Use Realtime Mutations

Replace your existing mutations with realtime-enabled ones:

```typescript
// Before: Standard mutation
const createMutation = useMutation({
  mutationFn: (data) => trpc.appointments.create.mutate(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['appointments'])
  }
})

// After: Realtime mutation with automatic invalidation
const createAppointment = useCreateAppointment()

// Usage is the same
await createAppointment.mutateAsync(appointmentData)
```

## Available Hooks

### Query Hooks

- `useRealtimeAppointments(params)` - Real-time appointments with filters
- `useRealtimePatients(params)` - Real-time patient/client data
- `useRealtimeTelemedicineSessions(params)` - Real-time telemedicine sessions

### Mutation Hooks

- `useCreateAppointment()` - Create appointment with real-time broadcast
- `useUpdateAppointment()` - Update appointment with real-time broadcast
- `useCreatePatient()` - Create patient with real-time broadcast
- `useUpdatePatient()` - Update patient with real-time broadcast

### Utility Hooks

- `useRealtimeProvider()` - Access connection status and health
- `useRealtimeQuery(options)` - Generic real-time query hook
- `useRealtimeMutation(options)` - Generic real-time mutation hook

## Configuration

### Database Tables

Ensure your Supabase tables have Real-time enabled:

```sql
-- Enable realtime for appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Enable realtime for patients table  
ALTER PUBLICATION supabase_realtime ADD TABLE patients;

-- Enable realtime for telemedicine_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE telemedicine_sessions;
```

### Row Level Security (RLS)

Ensure proper RLS policies are in place:

```sql
-- Example RLS policy for appointments
CREATE POLICY "Users can view their clinic's appointments" ON appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM user_clinic_access 
      WHERE user_id = auth.uid()
    )
  );
```

## Advanced Usage

### Custom Real-time Query

```typescript
const { data } = useRealtimeQuery({
  queryKey: ['custom-data'],
  queryFn: () => fetchCustomData(),
  table: 'custom_table',
  schema: 'public',
  invalidateOn: ['INSERT', 'UPDATE'],
  enableOptimisticUpdates: true,
  onRealtimeEvent: (payload) => {
    console.log('Real-time event:', payload)
  },
})
```

### Custom Real-time Mutation

```typescript
const mutation = useRealtimeMutation({
  mutationFn: (data) => updateCustomData(data),
  invalidateQueries: [['custom-data'], ['dashboard']],
  broadcastUpdate: true,
  broadcastChannel: 'custom-updates',
  broadcastEvent: 'data-updated',
})
```

### Connection Status Monitoring

```typescript
function ConnectionStatus() {
  const { isConnected, connectionStatus } = useRealtimeProvider()

  return (
    <div>
      Status: {connectionStatus}
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  )
}
```

## Healthcare Compliance Features

### Audit Logging

All real-time events are automatically logged for compliance:

```typescript
// Automatic audit logging for healthcare compliance
console.log('[AUDIT] Real-time appointment update received:', payload)
console.log('[AUDIT] Real-time patient update received:', payload)
console.log('[AUDIT] Real-time telemedicine session update received:', payload)
```

### LGPD Compliance

- Patient data updates are logged for LGPD audit requirements
- Sensitive data is automatically filtered in real-time events
- Data access is tracked and logged

### Professional Council Compliance

- Telemedicine session updates include CFM compliance logging
- Professional actions are tracked in real-time
- Session data is handled according to medical regulations

## Performance Considerations

### Query Configuration

The integration includes healthcare-optimized defaults:

```typescript
// Healthcare-optimized query settings
{
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true, // Critical for healthcare data
  refetchOnMount: true,
  refetchOnReconnect: true,
}
```

### Connection Management

- Automatic reconnection on network issues
- Connection pooling for efficiency
- Rate limiting to comply with healthcare regulations (10 events/second)

## Troubleshooting

### Common Issues

1. **Real-time not working**: Check that tables have Real-time enabled in Supabase
2. **Permission errors**: Verify RLS policies allow the current user to access data
3. **Connection issues**: Check network connectivity and Supabase project status

### Debug Mode

Enable debug logging in development:

```typescript
// Add to your provider setup
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

## Migration from Standard Hooks

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js @tanstack/react-query
```

### Step 2: Replace Hooks Gradually

Start with high-traffic components:

```typescript
// Replace one hook at a time
- const { data } = useQuery(...)
+ const { data } = useRealtimeAppointments(...)
```

### Step 3: Test Real-time Functionality

1. Open multiple browser tabs
2. Make changes in one tab
3. Verify updates appear in other tabs automatically

## API Reference

See the individual hook files for detailed TypeScript interfaces and options:

- [`useRealtimeQuery.ts`](./hooks/realtime/useRealtimeQuery.ts)
- [`useRealtimeMutation.ts`](./hooks/realtime/useRealtimeMutation.ts)
- [`useTrpcRealtime.ts`](./hooks/realtime/useTrpcRealtime.ts)