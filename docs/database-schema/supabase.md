# Supabase Guidelines

## Configuration

*   **Client Setup:** Centralize Supabase client configuration in `lib/supabase/` (client, server-rls, admin)
*   **Project Details:**
    *   **Name:** `{project-name}`
    *   **ID:** `{project-id}`

## Security & Access

*   **Admin Client:** Use `adminClient` (Service Role) carefully in public APIs, implementing all necessary validations and checks in the API itself
*   **RLS:** Use Row Level Security for protected API routes and server operations done on behalf of a logged-in user
*   **Authentication:** Middleware with Supabase for route protection

## Data Operations

*   **Validation:** Implement proper data validation (Zod) before insert/update operations
*   **MCP Interaction:** Use Supabase MCP tools (`mcp_supabase_*`) for database interactions, especially for listing tables, executing SQL, and applying migrations

## API Routes

*   **Organization:** Route Handlers in `app/api/` following RESTful principles
*   **Error Handling:** Implement consistent error handling with appropriate JSON responses
*   **Middleware:** Use for authentication, Rate Limiting (Upstash), and public route definition
*   **Public Routes:** Explicitly mark as public in middleware
*   **Documentation:** Document API endpoints with usage examples
