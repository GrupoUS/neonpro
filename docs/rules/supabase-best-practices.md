# Supabase Best Practices - Version: 1.0.0

## Purpose & Scope

This rule defines the standard practices for interacting with the Supabase platform, covering client creation, data access patterns, security, and performance. It aims to ensure consistent, secure, and maintainable Supabase usage across the application.

## Core Principles

1. **Environment Variables:** **ALWAYS** store Supabase URL and API Keys (Anon, Service Role) in environment variables (`.env`). Never hardcode credentials. Use `NEXT_PUBLIC_` prefix only for keys needed client-side (URL, Anon Key). The `SERVICE_ROLE_KEY` **MUST NEVER** be exposed client-side.
2. **Client Factory Functions:** **ALWAYS** use reusable factory functions (e.g., in `lib/supabase/`) to create Supabase client instances. Avoid creating clients directly within components, API routes, or service methods.
3. **Row-Level Security (RLS):** **ALWAYS** enable and utilize RLS for data access control, especially for client-facing operations or server-side operations acting on behalf of a user. Use the Anon Key when relying on RLS. Refer to specific RLS rules for implementation details based on the auth provider.
4. **Service Role Key Usage:** Use the `SERVICE_ROLE_KEY` **ONLY** in secure server-side environments (e.g., specific API routes, background jobs, webhooks) where bypassing RLS is explicitly required and safe. Document the justification for its use clearly.
5. **Schema Management:** Use Supabase Migrations (`supabase/migrations/`) to manage all database schema changes. Keep the schema definition (`schema.sql` or individual migration files) as the source of truth.

## Implementation Guidelines

### Client Creation

- Follow the patterns established in `@supabase-auth-guidelines.md` for creating clients compatible with Supabase Auth (client-side, server-side with RLS, service role).
- Ensure session/token information is correctly passed between client and server-side implementations.

```typescript
// Example structure for client factories (using Supabase Auth)
// lib/supabase/client.ts (Client-side, uses browser session)
// lib/supabase/server.ts (Server-side, respects user RLS via cookies)
// lib/supabase/service-role.ts (Server-side, bypasses RLS - use with caution)
```

### Service Layer Structure

- **Strongly Recommended:** Encapsulate database interaction logic within dedicated service or repository classes/modules (e.g., under `src/services/` or `src/repositories/`).
- Services should accept necessary parameters (like user ID, data objects) and use the appropriate Supabase client factory.
- This promotes separation of concerns and makes data logic reusable and testable.

```
src/
└── services/ | repositories/
    ├── user.service.ts
    ├── event.service.ts
    └── organization.repository.ts
```

### Data Access Patterns

- **Efficient Queries:** Use `.select()` to specify only the columns needed, reducing data transfer.

  ```typescript
  // ✅ DO: Select specific columns
  const { data, error } = await supabase
    .from("events")
    .select("id, name, start_date");

  // ❌ DON'T: Select everything if not needed
  const { data, error } = await supabase.from("events").select("*");
  ```

- **Pagination:** Implement pagination using `.range(from, to)` for large datasets.

  ```typescript
  const PAGE_SIZE = 20;
  // page comes from query params; ensure it's >= 1
  const pageParam = Number(
    new URLSearchParams(location.search).get("page") ?? 1,
  );
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const from = (page - 1) * PAGE_SIZE;
  const to = page * PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("attendees")
    .select("id, name, email", { count: "exact" }) // Get total count
    .range(from, to);
  ```

- **Filtering:** Use Supabase filter methods (`eq`, `neq`, `gt`, `lt`, `in`, `like`, etc.) server-side whenever possible.

### Error Handling

- **ALWAYS** check for and handle errors returned from Supabase calls (`error` object).
- Use `try...catch` blocks for operations within services or API routes.
- Check the specific `error.code` or `error.message` for known issues (e.g., unique constraints `23505`).
- Provide meaningful logs server-side and user-friendly error messages client-side.

```typescript
// Recommended error handling pattern in a service
import { PostgrestError } from "@supabase/supabase-js";

async function createEvent(eventData: any) {
  const supabase = await createServerSupabaseClient(); // Or appropriate client
  if (!supabase)
    throw new Error("Unauthorized or Supabase client unavailable.");

  try {
    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single(); // Use single() if expecting one row

    if (error) {
      console.error(
        "Supabase Error Code:",
        error.code,
        "Message:",
        error.message,
      );
      // Handle specific errors, e.g., unique violation
      if (error.code === "23505") {
        throw new Error("An event with this name already exists.");
      }
      throw new Error("Failed to create event."); // Generic error
    }
    return data;
  } catch (err) {
    console.error("Error creating event:", err);
    // Rethrow or handle as appropriate for the calling context
    throw err;
  }
}
```

### Performance Considerations

- **Indexing:** Ensure appropriate database indexes are created (via migrations) for columns used in `WHERE` clauses (`eq`, `in`, etc.) and `ORDER BY` clauses.
- **Joins:** Use Supabase's syntax for joining tables efficiently when needed.
- **Limit Data:** Fetch only the necessary data using `.select()` and apply `.limit()` when applicable.
- **Caching:** Consider application-level caching for frequently accessed, rarely changing data if performance becomes an issue.

### Security Guidelines

- **Input Validation:** **ALWAYS** validate and sanitize data (e.g., using Zod) _before_ passing it to Supabase insert/update operations. Do not trust client-side input.
- **RLS:** Reiterate: Use RLS as the primary mechanism for data access control based on user roles/permissions.
- **Function Security:** If using Supabase Database Functions (`CREATE FUNCTION`), ensure they are defined with `SECURITY DEFINER` or `SECURITY INVOKER` appropriately and permissions are correctly set.
- **Audit Trails:** Consider implementing audit trails (e.g., using database triggers or application logic) for sensitive operations if required.

## Related Rules

- `@supabase-auth-guidelines.md`: Specifics of implementing Supabase Auth with client and server-side patterns.
