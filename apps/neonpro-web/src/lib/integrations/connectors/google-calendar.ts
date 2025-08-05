/**
 * NeonPro - Google Calendar Connector
 * Integration with Google Calendar API for appointment synchronization
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type {
  IntegrationConfig,
  IntegrationConnector,
  IntegrationRequest,
  IntegrationResponse,
  WebhookConfig,
} from "../types";

/**
 * Google Calendar Configuration
 */
export interface GoogleCalendarConfig extends IntegrationConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  calendarId: string;
  timeZone: string;
  webhookUrl?: string;
  channelId?: string;
  resourceId?: string;
}

/**
 * Google Calendar Event
 */
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }[];
  location?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  visibility?: "default" | "public" | "private" | "confidential";
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: "email" | "popup";
      minutes: number;
    }[];
  };
  colorId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
}

/**
 * Google Calendar Connector
 */
export class GoogleCalendarConnector implements IntegrationConnector {
  private config: GoogleCalendarConfig;
  private baseUrl = "https://www.googleapis.com/calendar/v3";
  private tokenUrl = "https://oauth2.googleapis.com/token";

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  /**
   * Test connection to Google Calendar API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "GET",
        endpoint: `/calendars/${this.config.calendarId}`,
      });

      return response.success && response.data?.id === this.config.calendarId;
    } catch (error) {
      console.error("Google Calendar connection test failed:", error);
      return false;
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(event: GoogleCalendarEvent): Promise<IntegrationResponse> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "POST",
        endpoint: `/calendars/${this.config.calendarId}/events`,
        data: event,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          eventId: response.data?.id,
          htmlLink: response.data?.htmlLink,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create event",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
  ): Promise<IntegrationResponse> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "PUT",
        endpoint: `/calendars/${this.config.calendarId}/events/${eventId}`,
        data: event,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          eventId: response.data?.id,
          updated: response.data?.updated,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update event",
        metadata: {
          eventId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string): Promise<IntegrationResponse> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "DELETE",
        endpoint: `/calendars/${this.config.calendarId}/events/${eventId}`,
      });

      return {
        success: response.success,
        data: { deleted: true },
        error: response.error,
        metadata: {
          eventId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete event",
        metadata: {
          eventId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get calendar event
   */
  async getEvent(eventId: string): Promise<IntegrationResponse> {
    try {
      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "GET",
        endpoint: `/calendars/${this.config.calendarId}/events/${eventId}`,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get event",
        metadata: {
          eventId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * List calendar events
   */
  async listEvents(
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 250,
  ): Promise<IntegrationResponse> {
    try {
      await this.ensureValidToken();

      const params: any = {
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      };

      if (timeMin) {
        params.timeMin = timeMin.toISOString();
      }

      if (timeMax) {
        params.timeMax = timeMax.toISOString();
      }

      const response = await this.makeRequest({
        method: "GET",
        endpoint: `/calendars/${this.config.calendarId}/events`,
        params,
      });

      return {
        success: response.success,
        data: {
          events: response.data?.items || [],
          nextPageToken: response.data?.nextPageToken,
          summary: response.data?.summary,
        },
        error: response.error,
        metadata: {
          count: response.data?.items?.length || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list events",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Check availability for time slot
   */
  async checkAvailability(
    startTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ): Promise<IntegrationResponse> {
    try {
      const response = await this.listEvents(startTime, endTime);

      if (!response.success) {
        return response;
      }

      const events = response.data?.events || [];
      const conflictingEvents = events.filter((event: any) => {
        if (excludeEventId && event.id === excludeEventId) {
          return false;
        }

        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);

        return (
          (startTime >= eventStart && startTime < eventEnd) ||
          (endTime > eventStart && endTime <= eventEnd) ||
          (startTime <= eventStart && endTime >= eventEnd)
        );
      });

      return {
        success: true,
        data: {
          available: conflictingEvents.length === 0,
          conflicts: conflictingEvents,
        },
        metadata: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          conflictCount: conflictingEvents.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check availability",
      };
    }
  }

  /**
   * Create appointment from NeonPro data
   */
  async createAppointment(
    patientName: string,
    patientEmail: string,
    doctorName: string,
    startTime: Date,
    endTime: Date,
    appointmentType: string,
    notes?: string,
  ): Promise<IntegrationResponse> {
    const event: GoogleCalendarEvent = {
      summary: `${appointmentType} - ${patientName}`,
      description: [
        `Paciente: ${patientName}`,
        `Médico: ${doctorName}`,
        `Tipo: ${appointmentType}`,
        notes ? `Observações: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: this.config.timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: this.config.timeZone,
      },
      attendees: [
        {
          email: patientEmail,
          displayName: patientName,
        },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 60 }, // 1 hour before
        ],
      },
      extendedProperties: {
        private: {
          source: "neonpro",
          patientName,
          doctorName,
          appointmentType,
        },
      },
    };

    return this.createEvent(event);
  }

  /**
   * Setup webhook for calendar changes
   */
  async setupWebhook(): Promise<IntegrationResponse> {
    try {
      if (!this.config.webhookUrl) {
        throw new Error("Webhook URL not configured");
      }

      await this.ensureValidToken();

      const channelId = this.config.channelId || `neonpro-${Date.now()}`;

      const response = await this.makeRequest({
        method: "POST",
        endpoint: `/calendars/${this.config.calendarId}/events/watch`,
        data: {
          id: channelId,
          type: "web_hook",
          address: this.config.webhookUrl,
          params: {
            ttl: "3600", // 1 hour
          },
        },
      });

      if (response.success) {
        // Store channel info for later cleanup
        this.config.channelId = channelId;
        this.config.resourceId = response.data?.resourceId;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to setup webhook",
      };
    }
  }

  /**
   * Stop webhook
   */
  async stopWebhook(): Promise<IntegrationResponse> {
    try {
      if (!this.config.channelId || !this.config.resourceId) {
        throw new Error("No active webhook to stop");
      }

      await this.ensureValidToken();

      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/channels/stop",
        data: {
          id: this.config.channelId,
          resourceId: this.config.resourceId,
        },
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to stop webhook",
      };
    }
  }

  /**
   * Process webhook notification
   */
  async processWebhook(headers: Record<string, string>): Promise<any> {
    const channelId = headers["x-goog-channel-id"];
    const resourceState = headers["x-goog-resource-state"];
    const resourceId = headers["x-goog-resource-id"];
    const resourceUri = headers["x-goog-resource-uri"];

    if (channelId !== this.config.channelId) {
      throw new Error("Invalid channel ID");
    }

    return {
      type: "calendar_change",
      data: {
        channelId,
        resourceState,
        resourceId,
        resourceUri,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Get webhook configuration
   */
  getWebhookConfig(): WebhookConfig {
    return {
      id: `google-calendar-${this.config.calendarId}`,
      url: this.config.webhookUrl || "",
      events: ["calendar_changes"],
      active: true,
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffStrategy: "exponential",
      },
    };
  }

  // Private helper methods

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.config.accessToken) {
      await this.refreshAccessToken();
    }

    // TODO: Add token expiration check
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || "Failed to refresh token");
      }

      this.config.accessToken = data.access_token;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw error;
    }
  }

  /**
   * Make API request to Google Calendar
   */
  private async makeRequest(request: IntegrationRequest): Promise<IntegrationResponse> {
    try {
      const url = new URL(`${this.baseUrl}${request.endpoint}`);

      // Add query parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const options: RequestInit = {
        method: request.method,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
          ...request.headers,
        },
      };

      if (request.data) {
        options.body = JSON.stringify(request.data);
      }

      const response = await fetch(url.toString(), options);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
        metadata: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}

/**
 * Google Calendar Utility Functions
 */
export class GoogleCalendarUtils {
  /**
   * Convert NeonPro appointment to Google Calendar event
   */
  static appointmentToEvent(
    appointment: any,
    timeZone: string = "America/Sao_Paulo",
  ): GoogleCalendarEvent {
    return {
      summary: `${appointment.type} - ${appointment.patient.name}`,
      description: [
        `Paciente: ${appointment.patient.name}`,
        `Médico: ${appointment.doctor.name}`,
        `Tipo: ${appointment.type}`,
        appointment.notes ? `Observações: ${appointment.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: new Date(appointment.startTime).toISOString(),
        timeZone,
      },
      end: {
        dateTime: new Date(appointment.endTime).toISOString(),
        timeZone,
      },
      attendees: [
        {
          email: appointment.patient.email,
          displayName: appointment.patient.name,
        },
      ],
      location: appointment.location,
      status: appointment.status === "cancelled" ? "cancelled" : "confirmed",
      extendedProperties: {
        private: {
          source: "neonpro",
          appointmentId: appointment.id,
          patientId: appointment.patient.id,
          doctorId: appointment.doctor.id,
        },
      },
    };
  }

  /**
   * Convert Google Calendar event to NeonPro appointment format
   */
  static eventToAppointment(event: any): any {
    const extendedProps = event.extendedProperties?.private || {};

    return {
      id: extendedProps.appointmentId,
      externalId: event.id,
      summary: event.summary,
      description: event.description,
      startTime: new Date(event.start.dateTime || event.start.date),
      endTime: new Date(event.end.dateTime || event.end.date),
      status: event.status === "cancelled" ? "cancelled" : "confirmed",
      location: event.location,
      attendees:
        event.attendees?.map((attendee: any) => ({
          email: attendee.email,
          name: attendee.displayName,
          status: attendee.responseStatus,
        })) || [],
      source: "google-calendar",
      lastModified: new Date(event.updated),
    };
  }

  /**
   * Generate recurring event rule
   */
  static generateRecurrenceRule(
    frequency: "daily" | "weekly" | "monthly",
    interval: number = 1,
    count?: number,
    until?: Date,
  ): string[] {
    let rule = `RRULE:FREQ=${frequency.toUpperCase()}`;

    if (interval > 1) {
      rule += `;INTERVAL=${interval}`;
    }

    if (count) {
      rule += `;COUNT=${count}`;
    } else if (until) {
      rule += `;UNTIL=${until.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
    }

    return [rule];
  }

  /**
   * Calculate business hours availability
   */
  static getBusinessHoursSlots(
    date: Date,
    startHour: number = 8,
    endHour: number = 18,
    slotDuration: number = 30,
  ): { start: Date; end: Date }[] {
    const slots: { start: Date; end: Date }[] = [];
    const currentDate = new Date(date);

    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      return slots;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const start = new Date(currentDate);
        start.setHours(hour, minute, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + slotDuration);

        if (end.getHours() <= endHour) {
          slots.push({ start, end });
        }
      }
    }

    return slots;
  }
}
