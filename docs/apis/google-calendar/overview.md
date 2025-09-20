# Google Calendar API Documentation

## Overview

This document describes the API endpoints and data structures for the Google Calendar integration in NeonPro.

## Base URL

```
/api/google-calendar
```

## Authentication

All endpoints require Supabase authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <supabase-jwt-token>
```

## Endpoints

### 1. Initiate OAuth Flow

**POST** `/auth/initiate`

Initiates the Google OAuth 2.0 flow.

**Request Body:**

```json
{
  "clinicId": "string",
  "redirectUri": "string" // Optional, defaults to configured URI
}
```

**Response:**

```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "unique-state-string"
}
```

### 2. OAuth Callback

**GET** `/auth/callback`

Handles the OAuth callback from Google.

**Query Parameters:**

- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection
- `error`: Error message (if authorization failed)

**Response:**

```json
{
  "success": true,
  "integrationId": "integration-123"
}
```

### 3. Get User Integration

**GET** `/integration`

Retrieves the user's Google Calendar integration status.

**Response:**

```json
{
  "id": "integration-123",
  "userId": "user-123",
  "clinicId": "clinic-123",
  "calendarId": "primary",
  "calendarName": "Dr. Smith Calendar",
  "syncEnabled": true,
  "autoSync": true,
  "lastSyncAt": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4. List Calendars

**GET** `/calendars`

Lists the user's available Google Calendars.

**Response:**

```json
{
  "calendars": [
    {
      "id": "primary",
      "summary": "Dr. Smith - Consultas",
      "description": "Calendar principal",
      "primary": true,
      "selected": true
    },
    {
      "id": "work",
      "summary": "Work",
      "description": "Calendar de trabalho",
      "primary": false,
      "selected": false
    }
  ]
}
```

### 5. Create Integration

**POST** `/integration`

Creates a new Google Calendar integration.

**Request Body:**

```json
{
  "calendarId": "primary",
  "syncEnabled": true,
  "autoSync": true
}
```

**Response:**

```json
{
  "id": "integration-123",
  "calendarId": "primary",
  "syncEnabled": true,
  "autoSync": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 6. Update Integration

**PUT** `/integration/{integrationId}`

Updates integration settings.

**Request Body:**

```json
{
  "syncEnabled": false,
  "autoSync": false,
  "calendarId": "work"
}
```

### 7. Delete Integration

**DELETE** `/integration/{integrationId}`

Deletes a Google Calendar integration.

**Response:**

```json
{
  "success": true,
  "message": "Integration deleted successfully"
}
```

### 8. Sync Appointment

**POST** `/sync/appointment`

Syncs a specific appointment to Google Calendar.

**Request Body:**

```json
{
  "appointmentId": "appt-123"
}
```

**Response:**

```json
{
  "success": true,
  "googleEventId": "google-event-123",
  "action": "created|updated|cancelled"
}
```

### 9. Batch Sync Appointments

**POST** `/sync/batch`

Syncs multiple appointments to Google Calendar.

**Request Body:**

```json
{
  "appointmentIds": ["appt-123", "appt-124", "appt-125"]
}
```

**Response:**

```json
{
  "results": [
    {
      "appointmentId": "appt-123",
      "success": true,
      "googleEventId": "google-event-123"
    },
    {
      "appointmentId": "appt-124",
      "success": false,
      "error": "Conflict detected"
    }
  ]
}
```

### 10. Sync from Google

**POST** `/sync/from-google`

Manually triggers sync from Google Calendar to NeonPro.

**Request Body:**

```json
{
  "calendarId": "primary",
  "timeMin": "2024-01-01T00:00:00Z",
  "timeMax": "2024-01-31T23:59:59Z"
}
```

**Response:**

```json
{
  "syncedEvents": 5,
  "created": 3,
  "updated": 2,
  "errors": 0
}
```

### 11. Check Conflicts

**POST** `/conflicts/check`

Checks for scheduling conflicts in Google Calendar.

**Request Body:**

```json
{
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z",
  "calendarId": "primary"
}
```

**Response:**

```json
{
  "hasConflicts": true,
  "conflicts": [
    {
      "id": "event-123",
      "summary": "Existing Appointment",
      "start": "2024-01-15T10:30:00Z",
      "end": "2024-01-15T11:30:00Z"
    }
  ]
}
```

### 12. Get Sync Logs

**GET** `/sync/logs`

Retrieves synchronization activity logs.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `action`: Filter by action (optional)
- `status`: Filter by status (optional)

**Response:**

```json
{
  "logs": [
    {
      "id": "log-123",
      "action": "SYNC_APPOINTMENT",
      "status": "SUCCESS",
      "appointmentId": "appt-123",
      "googleEventId": "google-event-123",
      "createdAt": "2024-01-15T10:00:00Z",
      "duration": 1250
    },
    {
      "id": "log-124",
      "action": "SYNC_FROM_GOOGLE",
      "status": "ERROR",
      "errorMessage": "Rate limit exceeded",
      "createdAt": "2024-01-15T09:00:00Z",
      "duration": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 13. Get Integration Stats

**GET** `/stats`

Retrieves integration statistics.

**Response:**

```json
{
  "totalEventsSynced": 150,
  "lastSyncAt": "2024-01-15T10:00:00Z",
  "syncSuccessRate": 0.98,
  "averageSyncTime": 1200,
  "monthlyStats": [
    {
      "month": "2024-01",
      "eventsCreated": 45,
      "eventsUpdated": 23,
      "eventsCancelled": 5,
      "syncErrors": 2
    }
  ]
}
```

### 14. Webhook Handler

**POST** `/webhook`

Handles webhook notifications from Google Calendar.

**Request Headers:**

- `X-Goog-Channel-ID`: Channel identifier
- `X-Goog-Channel-Token`: Channel token
- `X-Goog-Resource-State`: Resource state (sync, exists, not_exists)

**Response:**

```json
{
  "success": true
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Authentication required",
    "details": "Invalid or expired JWT token"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Codes

| Code              | HTTP Status | Description               |
| ----------------- | ----------- | ------------------------- |
| AUTH_ERROR        | 401         | Authentication failed     |
| FORBIDDEN         | 403         | Access denied             |
| NOT_FOUND         | 404         | Resource not found        |
| VALIDATION_ERROR  | 422         | Invalid request data      |
| RATE_LIMITED      | 429         | Too many requests         |
| INTEGRATION_ERROR | 500         | Google Calendar API error |
| SYNC_ERROR        | 500         | Synchronization failed    |

## Rate Limiting

- Individual sync operations: 10 per minute per user
- Batch sync operations: 3 per minute per user
- Stats/log retrieval: 60 per minute per user

## Data Structures

### Integration

```typescript
interface GoogleCalendarIntegration {
  id: string;
  userId: string;
  clinicId: string;
  calendarId: string;
  calendarName?: string;
  syncEnabled: boolean;
  autoSync: boolean;
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sync Log

```typescript
interface GoogleCalendarSyncLog {
  id: string;
  integrationId: string;
  action: SyncAction;
  status: SyncStatus;
  appointmentId?: string;
  googleEventId?: string;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
}
```

### Event Mapping

```typescript
interface GoogleCalendarEvent {
  id: string;
  integrationId: string;
  appointmentId: string;
  googleEventId: string;
  calendarId: string;
  syncStatus: SyncStatus;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Webhooks

The integration supports webhooks for real-time updates:

1. **Channel Creation**: Create a notification channel for changes
2. **Event Notifications**: Receive notifications when events change
3. **Channel Expiration**: Handle channel expiration and renewal

### Webhook Events

- `sync`: Initial sync notification
- `exists`: Event created or updated
- `not_exists`: Event deleted

## Security Considerations

1. **Token Encryption**: All OAuth tokens are encrypted at rest
2. **HTTPS Only**: All communications use HTTPS
3. **Input Validation**: All inputs are validated and sanitized
4. **Access Control**: Users can only access their own data
5. **Audit Logging**: All API access is logged

## Testing

Use the following curl commands to test endpoints:

```bash
# Get user integration
curl -H "Authorization: Bearer $JWT_TOKEN" \
     https://api.neonpro.com/api/google-calendar/integration

# Sync appointment
curl -X POST \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"appointmentId": "appt-123"}' \
     https://api.neonpro.com/api/google-calendar/sync/appointment
```

## Version History

### v1.0.0

- Initial API release
- Basic CRUD operations
- Sync functionality
- Webhook support

---

Last updated: January 15, 2024
