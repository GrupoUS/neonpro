# [NOME_PROJETO] API Documentation Guide - Version 1.0.0

This file contains instructions and examples for documenting APIs in the [NOME_PROJETO] project. Complete endpoint documentation is organized in individual files within the `docs/apis/` folder.

## API Documentation Instructions

### File Organization

- **Location**: All API documentation files must be in the `docs/apis/` folder
- **Naming**: Use descriptive names that reflect functionality (e.g., `events-crud.md`, `auth.md`)
- **Multiple Endpoints**: A single file can document multiple related endpoints
- **Size Limit**: Each file must not exceed **250 lines** to maintain readability
- **Grouping**: Group endpoints by functionality or domain (e.g., events, authentication, participants)

### Required Structure for Each Endpoint

Each documented endpoint must contain:

1. **Title**: `### [METHOD] /api/path`
2. **Purpose**: Clear description of what the endpoint does
3. **Authentication**: Authentication requirements (if applicable)
4. **Parameters**: Query parameters, path parameters, headers
5. **Request Body**: Expected JSON structure (if applicable)
6. **Responses**: Status codes and response structures
7. **Notes**: Additional important information
8. **File Path**: Location of the route file in the codebase

## Endpoint Documentation Example

### [GET] /api/events

**Purpose:** Lists all events from the authenticated organizer with support for filters and pagination.

**Authentication:** Requires Supabase authentication (Bearer token)

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by event name or description
- `category` (string, optional): Filter by category
- `status` (string, optional): Filter by status (`draft`, `published`, `cancelled`)
- `date_from` (string, optional): Start date (ISO 8601 format)
- `date_to` (string, optional): End date (ISO 8601 format)

**Success Response (200):**

```json
{
  "events": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "date": "2024-01-15T10:00:00Z",
      "location": "string",
      "category": "string",
      "status": "published",
      "max_participants": 100,
      "current_participants": 25,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have permission to access events
- `422 Unprocessable Entity`: Invalid query parameters
- `500 Internal Server Error`: Internal server error

**Route File Path:** `src/app/api/events/route.ts`
