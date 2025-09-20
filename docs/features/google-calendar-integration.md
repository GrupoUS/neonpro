# Google Calendar Integration

## Overview

The Google Calendar Integration allows healthcare providers to seamlessly sync their appointments between NeonPro and Google Calendar. This integration ensures that healthcare professionals can manage their schedules efficiently while maintaining compliance with Brazilian healthcare regulations (LGPD).

## Features

- **Bidirectional Synchronization**: Sync appointments from NeonPro to Google Calendar and vice versa
- **Healthcare Compliance**: Full LGPD compliance with data encryption, consent management, and audit logging
- **Real-time Updates**: Instant synchronization when appointments are created, updated, or cancelled
- **Conflict Detection**: Automatically detect and resolve scheduling conflicts
- **Multi-Calendar Support**: Support for multiple Google Calendars per user
- **Batch Operations**: Efficiently sync multiple appointments in a single operation
- **Rate Limit Handling**: Graceful handling of Google API rate limits
- **Error Recovery**: Automatic retry mechanisms and comprehensive error handling

## Architecture

### Components

1. **Google Calendar Client** (`/services/google-calendar/client.ts`)
   - Handles all Google Calendar API interactions
   - Manages OAuth 2.0 authentication flow
   - Implements token refresh mechanisms
   - Provides methods for calendar operations

2. **Google Calendar Service** (`/services/google-calendar/service.ts`)
   - Business logic layer for integration
   - Manages database operations
   - Handles appointment synchronization
   - Implements conflict resolution

3. **Compliance Service** (`/services/google-calendar/compliance.ts`)
   - Ensures LGPD compliance
   - Manages data encryption
   - Handles consent validation
   - Maintains audit logs

4. **UI Components** (`/components/google-calendar/`)
   - Connect button for OAuth initiation
   - Sync settings panel
   - Integration management interface
   - Activity monitoring dashboard

### Database Schema

The integration uses the following database models:

- **GoogleCalendarIntegration**: Stores user's Google Calendar connection details
- **GoogleCalendarEvent**: Maps NeonPro appointments to Google Calendar events
- **GoogleCalendarSyncLog**: Tracks all synchronization activities for audit purposes

## Installation

1. Install required dependencies:

```bash
pnpm add googleapis
```

2. Generate Prisma client:

```bash
pnpm db:generate
```

3. Run database migrations:

```bash
pnpm db:migrate
```

## Configuration

### Environment Variables

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Google Cloud Console Setup

1. Create a new project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Configure consent screen with healthcare-specific scopes

## Usage

### Connecting Google Calendar

1. Navigate to Settings > Integrations > Google Calendar
2. Click "Conectar Google Calendar"
3. Review and accept the LGPD compliance notice
4. Sign in with your Google account
5. Grant calendar access permissions
6. Select the calendar to sync with

### Syncing Appointments

Appointments are automatically synced when:
- A new appointment is created
- An appointment is updated
- An appointment is cancelled

You can also manually trigger a sync from the integration panel.

### Managing Integration

The integration panel provides:
- Connection status overview
- Sync activity logs
- Configuration options
- Disconnection capability

## Healthcare Compliance

### LGPD Requirements

The integration adheres to all LGPD requirements:

1. **Data Processing Basis**: All processing is based on legitimate interest for healthcare service delivery
2. **Data Minimization**: Only necessary data is synced with Google Calendar
3. **Purpose Limitation**: Data is used only for scheduling purposes
4. **Retention Period**: Data is retained according to healthcare regulations (10 years)
5. **Security Measures**: All sensitive data is encrypted at rest and in transit
6. **Access Control**: Only authorized users can access the integration
7. **Audit Trail**: All data access is logged for compliance purposes

### Consent Management

- Explicit consent is required before enabling sync
- Patients can request data deletion at any time
- Consent records are maintained for compliance
- Right to be forgotten is fully supported

### Data Encryption

- Access tokens and refresh tokens are encrypted using AES-256
- Patient identifiers are hashed before storage
- All API communications use HTTPS
- Sensitive data in logs is automatically redacted

## API Reference

### GoogleCalendarClient

#### Methods

- `getAuthUrl(): string` - Returns OAuth authorization URL
- `exchangeCodeForTokens(code: string): Promise<void>` - Exchanges auth code for tokens
- `listCalendars(): Promise<Calendar[]>` - Lists user's calendars
- `createEvent(calendarId: string, eventData: EventData): Promise<Event>` - Creates calendar event
- `updateEvent(calendarId: string, eventId: string, updates: EventData): Promise<Event>` - Updates event
- `deleteEvent(calendarId: string, eventId: string): Promise<void>` - Deletes event
- `listEvents(calendarId: string, start: Date, end: Date): Promise<Event[]>` - Lists events in range

### GoogleCalendarService

#### Methods

- `createIntegration(params: CreateIntegrationParams): Promise<Integration>` - Creates new integration
- `getUserIntegration(userId: string): Promise<Integration | null>` - Gets user's integration
- `syncAppointmentToCalendar(appointment: Appointment): Promise<SyncResult>` - Syncs appointment
- `syncFromGoogle(calendarId: string): Promise<SyncedEvent[]>` - Syncs from Google to NeonPro
- `checkForConflicts(start: Date, end: Date, calendarId: string): Promise<Conflict[]>` - Checks conflicts

## Error Handling

The integration handles various error scenarios:

1. **Authentication Errors**: Automatic token refresh
2. **Rate Limiting**: Exponential backoff retry
3. **Network Errors**: Automatic retry with timeout
4. **Validation Errors**: Detailed error messages
5. **Compliance Violations**: Operation blocking with notification

## Monitoring and Logging

### Sync Logs

All synchronization activities are logged with:
- Timestamp
- User ID
- Action performed
- Success/failure status
- Error details (if applicable)
- Data access records

### Metrics Tracked

- Sync success rate
- Average sync duration
- API call count
- Error rates by type
- User engagement metrics

## Testing

Run the test suite:

```bash
# Unit tests
pnpm test:unit google-calendar

# Integration tests
pnpm test:integration google-calendar

# E2E tests
pnpm test:e2e google-calendar
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify OAuth credentials are correct
   - Check redirect URI configuration
   - Ensure user has proper permissions

2. **Sync Not Working**
   - Check if integration is enabled
   - Verify calendar permissions
   - Review sync logs for errors

3. **Rate Limit Errors**
   - Implement batch operations
   - Add delays between syncs
   - Use exponential backoff

4. **Data Not Syncing**
   - Check appointment status
   - Verify time zone settings
   - Review conflict detection

### Debug Mode

Enable debug logging:

```typescript
const service = new GoogleCalendarService({
  debug: true
});
```

## Security Considerations

1. **Token Storage**: All tokens are encrypted at rest
2. **API Keys**: Never exposed to client-side code
3. **Data Transmission**: Always uses HTTPS
4. **Input Validation**: All inputs are validated and sanitized
5. **Access Control**: Implements proper authorization checks

## Future Enhancements

- Support for multiple calendar providers
- Advanced conflict resolution options
- Customizable sync filters
- Real-time webhook integration
- Enhanced reporting dashboard
- Mobile app synchronization

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Review the troubleshooting guide

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Basic sync functionality
- LGPD compliance implementation
- Healthcare-specific features

---

Last updated: January 15, 2024