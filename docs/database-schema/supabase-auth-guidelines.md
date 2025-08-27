# Supabase Authentication Guidelines - Version: 1.0.0

## Purpose & Scope

This rule defines the standard practices for implementing user authentication checks and session management using Supabase within the application. It covers both client-side and server-side patterns.

## Implementation Guidelines

### OAuth Providers

- **SHOULD** primarily focus on implementing **Google** as the OAuth provider when provider-based login is added. Other providers are currently out of scope.

### Client-Side Session Management (Client Components)

- **MUST** use the following pattern in Client Components (`'use client'`) to check and react to user authentication state:
  - Import `useState`, `useEffect` from `react`.
  - Import `createClient` from `@/lib/supabase/client`.
  - Import `Session` type from `@supabase/supabase-js`.
  - Initialize state for the session: `const [session, setSession] = useState<Session | null>(null);`
  - Create a Supabase client instance: `const supabase = createClient();`
  - Use `useEffect` to:
    - Fetch the initial session using `supabase.auth.getSession()`.
    - Subscribe to auth state changes using `supabase.auth.onAuthStateChange()`.
    - Update the local `session` state within the callbacks.
    - Return a cleanup function to unsubscribe from `onAuthStateChange`.
- **MUST** use the `session` state variable to conditionally render UI elements based on whether the user is logged in or out.

```typescript
// ✅ DO: Example Client Component Auth Check
"use client";

import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
// ... other imports

export function MyClientComponent() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  return (
    <div>
      {session ? <p>Welcome, User!</p> : <p>Please log in.</p>}
      {/* Rest of component */}
    </div>
  );
}

// ❌ DON'T: Directly call auth methods in render or without useEffect for state management.
```

### Server-Side Authentication Checks (Server Components & API Routes)

- **MUST** use the server-side Supabase client from `@supabase/ssr` to check authentication in Server Components and API Routes.
- **MUST** create the client instance within the component or route handler using the appropriate factory function (e.g., one that reads cookies correctly, like the one potentially defined in `@/lib/supabase/server` or similar, following SSR patterns).
- **MUST** call `supabase.auth.getUser()` to retrieve the current user session based on cookies/headers.
- **MUST** handle cases where the user is not authenticated (e.g., redirecting to login, returning an error).

```typescript
// ✅ DO: Example Server Component Auth Check
import { createClient } from "@/lib/supabase/server"; // Assuming server client factory
import { redirect } from "next/navigation";
// ... other imports

export default async function ProtectedPage() {
  const supabase = await createClient(); // Use appropriate server-side factory

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login"); // Or your login page path
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {data.user.email}</p>
      {/* Rest of page */}
    </div>
  );
}

// ❌ DON'T: Use the client-side createClient() in Server Components/API routes.
// ❌ DON'T: Forget to handle the case where the user is not authenticated.
```

## Related Rules

- `@supabase-best-practices.md`: General Supabase interaction guidelines (client creation, RLS, etc.).
- `@/lib/supabase/client.ts`: Contains the factory for the client-side Supabase client.
- `@/lib/supabase/server.ts` (or similar): Should contain the factory for the server-side Supabase client compatible with SSR/Server Components.
