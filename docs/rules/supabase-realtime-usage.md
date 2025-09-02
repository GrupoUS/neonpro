# Supabase Realtime Usage Guidelines - Version: 1.0.0

## Purpose & Scope

This rule outlines the best practices for subscribing to and handling Supabase Realtime events within the application. It focuses on the correct usage of the `subscribeToChannel` function from `src/lib/supabase/realtime.ts` and how to integrate realtime updates effectively into UI components. The goal is to ensure stable, efficient, and maintainable realtime features.

## Implementation Guidelines

### Subscribing to Channels

- **MUST**: Use the `subscribeToChannel` function from `src/lib/supabase/realtime.ts` for all Realtime subscriptions. Do not attempt to use `supabase.channel()` directly in components.
- **MUST**: Provide a unique `channelName` for each subscription. If the channel is user-specific, append the `userId` to the `channelName` (e.g., `chats-user-${userId}`).
- **MUST**: Specify the `tableName` and the `callback` function to handle incoming payloads.
- **SHOULD**: Provide a `filter` if you only need a subset of changes from a table (e.g., `user_id=eq.${userId}`).
- **MUST**: Manage the subscription lifecycle within a `useEffect` hook in your React component.
- **MUST**: Call the `unsubscribe` method returned by `subscribeToChannel` in the `useEffect` cleanup function to prevent memory leaks and orphaned subscriptions.

### Handling Realtime Data in Components

- **SHOULD**: Use a stable callback function (e.g., memoized with `useCallback`) for the `callback` prop of `subscribeToChannel`, especially if it depends on component state or props. This helps prevent unnecessary re-subscriptions.
- **MUST**: When updating SWR caches or local state based on realtime payloads, ensure the logic correctly merges or replaces data (e.g., handling INSERT, UPDATE, DELETE events appropriately). Refer to the `Sidebar.tsx` component for an example of SWR mutation.
- **SHOULD**: Be mindful of the dependencies of your `useEffect` hook that manages the subscription. Include all variables that, if changed, should trigger a re-subscription (e.g., `userId`, `filter` parameters).
- **AVOID**: Performing heavy computations or complex side effects directly within the realtime callback. If necessary, delegate to other functions or manage state updates efficiently.
- **CONSIDER**: Displaying loading states or visual feedback when a component is waiting for initial realtime data or if a connection issue is detected (though `realtime.ts` handles most reconnections transparently).

### Leveraging Built-in Features of `realtime.ts`

- The `subscribeToChannel` function and the underlying `realtime.ts` service automatically handle:
    - Intelligent reconnection with exponential backoff.
    - Token refresh for expired JWTs.
    - Pausing/resuming connections based on page visibility and user activity (via `activity-detector.ts`).
- **DO NOT** implement custom reconnection logic or activity detection when using `subscribeToChannel`, as this is already handled.

### Examples

```typescript
// src/components/MyRealtimeComponent.tsx
'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { subscribeToChannel } from '@/lib/supabase/realtime';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface MyDataItem {
  id: string;
  content: string;
  user_id?: string;
}

interface MyRealtimeComponentProps {
  userId: string | undefined;
}

export function MyRealtimeComponent({ userId }: MyRealtimeComponentProps) {
  const [items, setItems] = useState<MyDataItem[]>([]);

  const handleRealtimeUpdate = useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    console.log('Realtime Payload:', payload);
    const newRecord = payload.new as MyDataItem;
    const oldRecordId = (payload.old as { id: string })?.id;

    setItems(currentItems => {
      switch (payload.eventType) {
        case 'INSERT':
          return newRecord ? [...currentItems, newRecord] : currentItems;
        case 'UPDATE':
          return newRecord ? currentItems.map(item => item.id === newRecord.id ? newRecord : item) : currentItems;
        case 'DELETE':
          return oldRecordId ? currentItems.filter(item => item.id !== oldRecordId) : currentItems;
        default:
          return currentItems;
      }
    });
  }, []); // Empty dependency array if setItems is stable and no other dependencies

  useEffect(() => {
    if (!userId) {
      // Clear items or handle logged-out state if necessary
      setItems([]);
      return;
    }

    // console.log(`Setting up realtime subscription for MyRealtimeComponent, user: ${userId}`);
    const channelName = `my-data-items-${userId}`;
    
    const subscription = subscribeToChannel({
      channelName: channelName,
      tableName: 'my_table', // Replace with your actual table name
      filter: `user_id=eq.${userId}`, // Example filter
      event: '*', // Or 'INSERT', 'UPDATE', 'DELETE'
      callback: handleRealtimeUpdate,
      onSubscriptionError: (error) => {
        console.error(`Subscription error for ${channelName}:`, error);
        // Optionally, show a toast or update UI
      }
    });

    return () => {
      // console.log(`Cleaning up realtime subscription for MyRealtimeComponent, user: ${userId}`);
      subscription.unsubscribe();
    };
  }, [userId, handleRealtimeUpdate]); // Ensure all dependencies are listed

  return (
    <div>
      <h2>Realtime Items for User: {userId}</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
      {items.length === 0 && <p>No items yet, or waiting for realtime updates...</p>}
    </div>
  );
}

// ✅ DO: Manage subscription in useEffect and cleanup.
// ✅ DO: Use useCallback for the callback if it has dependencies or is complex.
// ✅ DO: Include relevant dependencies in useEffect (e.g., userId).

// ❌ DON'T: Forget to unsubscribe in the cleanup function.
// ❌ DON'T: Create subscriptions outside of useEffect without proper lifecycle management.
// ❌ DON'T: Re-implement reconnection or visibility logic.
```

### Restrictions
- **MUST NOT** directly call `supabase.channel()` in components for Realtime features. Always use the `subscribeToChannel` wrapper.
- **AVOID** creating multiple subscriptions to the exact same channel (same name, table, filter) within the same component or closely related components without a clear need.

## Conventions
- Channel names should be descriptive and typically include the table name and any key identifiers (e.g., `chats-user-${userId}`, `document-updates-${documentId}`).

## Related Rules
- `@supabase-best-practices.md`: General guidelines for Supabase interactions.
- `docs/realtime-connection-improvements.md`: Detailed documentation of the realtime service enhancements.