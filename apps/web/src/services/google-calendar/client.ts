import { google } from 'googleapis';

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuth2Tokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  colorId?: string;
}

export class GoogleCalendarClient {
  private oauth2Client: any;
  private calendar: any;

  constructor(config: GoogleCalendarConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth2 consent URL
   */
  getAuthUrl(
    state: string,
    scopes: string[] = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  ): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<OAuth2Tokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as OAuth2Tokens;
  }

  /**
   * Set credentials for the client
   */
  setCredentials(tokens: OAuth2Tokens): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<OAuth2Tokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials as OAuth2Tokens;
  }

  /**
   * Check if token is expired and refresh if needed
   */
  async ensureValidTokens(tokens: OAuth2Tokens): Promise<OAuth2Tokens> {
    if (!tokens.expiry_date || tokens.expiry_date > Date.now()) {
      return tokens;
    }

    if (!tokens.refresh_token) {
      throw new Error('No refresh token available');
    }

    return await this.refreshToken(tokens.refresh_token);
  }

  /**
   * List calendars
   */
  async listCalendars(): Promise<any[]> {
    const response = await this.calendar.calendarList.list();
    return response.data.items || [];
  }

  /**
   * Get calendar by ID
   */
  async getCalendar(calendarId: string = 'primary'): Promise<any> {
    const response = await this.calendar.calendars.get({ calendarId });
    return response.data;
  }

  /**
   * Create event
   */
  async createEvent(calendarId: string, event: CalendarEvent): Promise<any> {
    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    return response.data;
  }

  /**
   * Update event
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: CalendarEvent,
  ): Promise<any> {
    const response = await this.calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
    return response.data;
  }

  /**
   * Delete event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  /**
   * Get event
   */
  async getEvent(calendarId: string, eventId: string): Promise<any> {
    const response = await this.calendar.events.get({
      calendarId,
      eventId,
    });
    return response.data;
  }

  /**
   * List events
   */
  async listEvents(
    calendarId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
      orderBy?: 'startTime' | 'updated';
    } = {},
  ): Promise<any[]> {
    const response = await this.calendar.events.list({
      calendarId,
      ...options,
    });
    return response.data.items || [];
  }

  /**
   * Sync events (incremental sync)
   */
  async syncEvents(
    calendarId: string,
    syncToken?: string,
  ): Promise<{
    nextSyncToken: string;
    items: any[];
  }> {
    const response = await this.calendar.events.list({
      calendarId,
      syncToken,
      singleEvents: true,
    });
    return {
      nextSyncToken: response.data.nextSyncToken,
      items: response.data.items || [],
    };
  }

  /**
   * Watch for changes to calendar
   */
  async watchCalendar(
    calendarId: string,
    webhookUrl: string,
  ): Promise<{
    id: string;
    resourceUri: string;
    expiration: number;
  }> {
    const response = await this.calendar.events.watch({
      calendarId,
      requestBody: {
        id: `neonpro-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
      },
    });
    return {
      id: response.data.id,
      resourceUri: response.data.resourceUri,
      expiration: response.data.expiration,
    };
  }

  /**
   * Stop watching calendar changes
   */
  async stopWatch(channelId: string, resourceId: string): Promise<void> {
    await this.calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId: resourceId,
      },
    });
  }
}
