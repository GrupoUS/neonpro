"use strict";
/**
 * NeonPro - Google Calendar Connector
 * Integration with Google Calendar API for appointment synchronization
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarUtils = exports.GoogleCalendarConnector = void 0;
/**
 * Google Calendar Connector
 */
var GoogleCalendarConnector = /** @class */ (function () {
    function GoogleCalendarConnector(config) {
        this.baseUrl = 'https://www.googleapis.com/calendar/v3';
        this.tokenUrl = 'https://oauth2.googleapis.com/token';
        this.config = config;
    }
    /**
     * Test connection to Google Calendar API
     */
    GoogleCalendarConnector.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'GET',
                                endpoint: "/calendars/".concat(this.config.calendarId)
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.success && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id) === this.config.calendarId];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Google Calendar connection test failed:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create calendar event
     */
    GoogleCalendarConnector.prototype.createEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'POST',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events"),
                                data: event
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, {
                                success: response.success,
                                data: response.data,
                                error: response.error,
                                metadata: {
                                    eventId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                                    htmlLink: (_b = response.data) === null || _b === void 0 ? void 0 : _b.htmlLink,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 3:
                        error_2 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_2 instanceof Error ? error_2.message : 'Failed to create event',
                                metadata: {
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update calendar event
     */
    GoogleCalendarConnector.prototype.updateEvent = function (eventId, event) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'PUT',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events/").concat(eventId),
                                data: event
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, {
                                success: response.success,
                                data: response.data,
                                error: response.error,
                                metadata: {
                                    eventId: (_a = response.data) === null || _a === void 0 ? void 0 : _a.id,
                                    updated: (_b = response.data) === null || _b === void 0 ? void 0 : _b.updated,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 3:
                        error_3 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Failed to update event',
                                metadata: {
                                    eventId: eventId,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete calendar event
     */
    GoogleCalendarConnector.prototype.deleteEvent = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'DELETE',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events/").concat(eventId)
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, {
                                success: response.success,
                                data: { deleted: true },
                                error: response.error,
                                metadata: {
                                    eventId: eventId,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_4 instanceof Error ? error_4.message : 'Failed to delete event',
                                metadata: {
                                    eventId: eventId,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get calendar event
     */
    GoogleCalendarConnector.prototype.getEvent = function (eventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'GET',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events/").concat(eventId)
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Failed to get event',
                                metadata: {
                                    eventId: eventId,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List calendar events
     */
    GoogleCalendarConnector.prototype.listEvents = function (timeMin_1, timeMax_1) {
        return __awaiter(this, arguments, void 0, function (timeMin, timeMax, maxResults) {
            var params, response, error_6;
            var _a, _b, _c, _d, _e;
            if (maxResults === void 0) { maxResults = 250; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _f.sent();
                        params = {
                            maxResults: maxResults,
                            singleEvents: true,
                            orderBy: 'startTime'
                        };
                        if (timeMin) {
                            params.timeMin = timeMin.toISOString();
                        }
                        if (timeMax) {
                            params.timeMax = timeMax.toISOString();
                        }
                        return [4 /*yield*/, this.makeRequest({
                                method: 'GET',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events"),
                                params: params
                            })];
                    case 2:
                        response = _f.sent();
                        return [2 /*return*/, {
                                success: response.success,
                                data: {
                                    events: ((_a = response.data) === null || _a === void 0 ? void 0 : _a.items) || [],
                                    nextPageToken: (_b = response.data) === null || _b === void 0 ? void 0 : _b.nextPageToken,
                                    summary: (_c = response.data) === null || _c === void 0 ? void 0 : _c.summary
                                },
                                error: response.error,
                                metadata: {
                                    count: ((_e = (_d = response.data) === null || _d === void 0 ? void 0 : _d.items) === null || _e === void 0 ? void 0 : _e.length) || 0,
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 3:
                        error_6 = _f.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_6 instanceof Error ? error_6.message : 'Failed to list events',
                                metadata: {
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check availability for time slot
     */
    GoogleCalendarConnector.prototype.checkAvailability = function (startTime, endTime, excludeEventId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, events, conflictingEvents, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.listEvents(startTime, endTime)];
                    case 1:
                        response = _b.sent();
                        if (!response.success) {
                            return [2 /*return*/, response];
                        }
                        events = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.events) || [];
                        conflictingEvents = events.filter(function (event) {
                            if (excludeEventId && event.id === excludeEventId) {
                                return false;
                            }
                            var eventStart = new Date(event.start.dateTime || event.start.date);
                            var eventEnd = new Date(event.end.dateTime || event.end.date);
                            return ((startTime >= eventStart && startTime < eventEnd) ||
                                (endTime > eventStart && endTime <= eventEnd) ||
                                (startTime <= eventStart && endTime >= eventEnd));
                        });
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    available: conflictingEvents.length === 0,
                                    conflicts: conflictingEvents
                                },
                                metadata: {
                                    startTime: startTime.toISOString(),
                                    endTime: endTime.toISOString(),
                                    conflictCount: conflictingEvents.length
                                }
                            }];
                    case 2:
                        error_7 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_7 instanceof Error ? error_7.message : 'Failed to check availability'
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create appointment from NeonPro data
     */
    GoogleCalendarConnector.prototype.createAppointment = function (patientName, patientEmail, doctorName, startTime, endTime, appointmentType, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                event = {
                    summary: "".concat(appointmentType, " - ").concat(patientName),
                    description: [
                        "Paciente: ".concat(patientName),
                        "M\u00E9dico: ".concat(doctorName),
                        "Tipo: ".concat(appointmentType),
                        notes ? "Observa\u00E7\u00F5es: ".concat(notes) : ''
                    ].filter(Boolean).join('\n'),
                    start: {
                        dateTime: startTime.toISOString(),
                        timeZone: this.config.timeZone
                    },
                    end: {
                        dateTime: endTime.toISOString(),
                        timeZone: this.config.timeZone
                    },
                    attendees: [
                        {
                            email: patientEmail,
                            displayName: patientName
                        }
                    ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 }, // 1 day before
                            { method: 'popup', minutes: 60 } // 1 hour before
                        ]
                    },
                    extendedProperties: {
                        private: {
                            source: 'neonpro',
                            patientName: patientName,
                            doctorName: doctorName,
                            appointmentType: appointmentType
                        }
                    }
                };
                return [2 /*return*/, this.createEvent(event)];
            });
        });
    };
    /**
     * Setup webhook for calendar changes
     */
    GoogleCalendarConnector.prototype.setupWebhook = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channelId, response, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!this.config.webhookUrl) {
                            throw new Error('Webhook URL not configured');
                        }
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _b.sent();
                        channelId = this.config.channelId || "neonpro-".concat(Date.now());
                        return [4 /*yield*/, this.makeRequest({
                                method: 'POST',
                                endpoint: "/calendars/".concat(this.config.calendarId, "/events/watch"),
                                data: {
                                    id: channelId,
                                    type: 'web_hook',
                                    address: this.config.webhookUrl,
                                    params: {
                                        ttl: '3600' // 1 hour
                                    }
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        if (response.success) {
                            // Store channel info for later cleanup
                            this.config.channelId = channelId;
                            this.config.resourceId = (_a = response.data) === null || _a === void 0 ? void 0 : _a.resourceId;
                        }
                        return [2 /*return*/, response];
                    case 3:
                        error_8 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_8 instanceof Error ? error_8.message : 'Failed to setup webhook'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop webhook
     */
    GoogleCalendarConnector.prototype.stopWebhook = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.config.channelId || !this.config.resourceId) {
                            throw new Error('No active webhook to stop');
                        }
                        return [4 /*yield*/, this.ensureValidToken()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.makeRequest({
                                method: 'POST',
                                endpoint: '/channels/stop',
                                data: {
                                    id: this.config.channelId,
                                    resourceId: this.config.resourceId
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_9 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_9 instanceof Error ? error_9.message : 'Failed to stop webhook'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process webhook notification
     */
    GoogleCalendarConnector.prototype.processWebhook = function (headers) {
        return __awaiter(this, void 0, void 0, function () {
            var channelId, resourceState, resourceId, resourceUri;
            return __generator(this, function (_a) {
                channelId = headers['x-goog-channel-id'];
                resourceState = headers['x-goog-resource-state'];
                resourceId = headers['x-goog-resource-id'];
                resourceUri = headers['x-goog-resource-uri'];
                if (channelId !== this.config.channelId) {
                    throw new Error('Invalid channel ID');
                }
                return [2 /*return*/, {
                        type: 'calendar_change',
                        data: {
                            channelId: channelId,
                            resourceState: resourceState,
                            resourceId: resourceId,
                            resourceUri: resourceUri,
                            timestamp: new Date().toISOString()
                        }
                    }];
            });
        });
    };
    /**
     * Get webhook configuration
     */
    GoogleCalendarConnector.prototype.getWebhookConfig = function () {
        return {
            id: "google-calendar-".concat(this.config.calendarId),
            url: this.config.webhookUrl || '',
            events: ['calendar_changes'],
            active: true,
            retryPolicy: {
                maxRetries: 3,
                initialDelay: 1000,
                maxDelay: 30000,
                backoffStrategy: 'exponential'
            }
        };
    };
    // Private helper methods
    /**
     * Ensure we have a valid access token
     */
    GoogleCalendarConnector.prototype.ensureValidToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.config.accessToken) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.refreshAccessToken()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh access token using refresh token
     */
    GoogleCalendarConnector.prototype.refreshAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(this.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                body: new URLSearchParams({
                                    client_id: this.config.clientId,
                                    client_secret: this.config.clientSecret,
                                    refresh_token: this.config.refreshToken,
                                    grant_type: 'refresh_token'
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (!response.ok) {
                            throw new Error(data.error_description || 'Failed to refresh token');
                        }
                        this.config.accessToken = data.access_token;
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Failed to refresh access token:', error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make API request to Google Calendar
     */
    GoogleCalendarConnector.prototype.makeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var url_1, options, response, data, contentType, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        url_1 = new URL("".concat(this.baseUrl).concat(request.endpoint));
                        // Add query parameters
                        if (request.params) {
                            Object.entries(request.params).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                url_1.searchParams.append(key, String(value));
                            });
                        }
                        options = {
                            method: request.method,
                            headers: __assign({ 'Authorization': "Bearer ".concat(this.config.accessToken), 'Content-Type': 'application/json' }, request.headers)
                        };
                        if (request.data) {
                            options.body = JSON.stringify(request.data);
                        }
                        return [4 /*yield*/, fetch(url_1.toString(), options)];
                    case 1:
                        response = _b.sent();
                        data = void 0;
                        contentType = response.headers.get('content-type');
                        if (!(contentType && contentType.includes('application/json'))) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, response.text()];
                    case 4:
                        data = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!response.ok) {
                            throw new Error(((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || "HTTP ".concat(response.status));
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: data,
                                metadata: {
                                    statusCode: response.status,
                                    headers: Object.fromEntries(response.headers.entries())
                                }
                            }];
                    case 6:
                        error_11 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_11 instanceof Error ? error_11.message : 'Request failed',
                                metadata: {
                                    timestamp: new Date().toISOString()
                                }
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return GoogleCalendarConnector;
}());
exports.GoogleCalendarConnector = GoogleCalendarConnector;
/**
 * Google Calendar Utility Functions
 */
var GoogleCalendarUtils = /** @class */ (function () {
    function GoogleCalendarUtils() {
    }
    /**
     * Convert NeonPro appointment to Google Calendar event
     */
    GoogleCalendarUtils.appointmentToEvent = function (appointment, timeZone) {
        if (timeZone === void 0) { timeZone = 'America/Sao_Paulo'; }
        return {
            summary: "".concat(appointment.type, " - ").concat(appointment.patient.name),
            description: [
                "Paciente: ".concat(appointment.patient.name),
                "M\u00E9dico: ".concat(appointment.doctor.name),
                "Tipo: ".concat(appointment.type),
                appointment.notes ? "Observa\u00E7\u00F5es: ".concat(appointment.notes) : ''
            ].filter(Boolean).join('\n'),
            start: {
                dateTime: new Date(appointment.startTime).toISOString(),
                timeZone: timeZone
            },
            end: {
                dateTime: new Date(appointment.endTime).toISOString(),
                timeZone: timeZone
            },
            attendees: [
                {
                    email: appointment.patient.email,
                    displayName: appointment.patient.name
                }
            ],
            location: appointment.location,
            status: appointment.status === 'cancelled' ? 'cancelled' : 'confirmed',
            extendedProperties: {
                private: {
                    source: 'neonpro',
                    appointmentId: appointment.id,
                    patientId: appointment.patient.id,
                    doctorId: appointment.doctor.id
                }
            }
        };
    };
    /**
     * Convert Google Calendar event to NeonPro appointment format
     */
    GoogleCalendarUtils.eventToAppointment = function (event) {
        var _a, _b;
        var extendedProps = ((_a = event.extendedProperties) === null || _a === void 0 ? void 0 : _a.private) || {};
        return {
            id: extendedProps.appointmentId,
            externalId: event.id,
            summary: event.summary,
            description: event.description,
            startTime: new Date(event.start.dateTime || event.start.date),
            endTime: new Date(event.end.dateTime || event.end.date),
            status: event.status === 'cancelled' ? 'cancelled' : 'confirmed',
            location: event.location,
            attendees: ((_b = event.attendees) === null || _b === void 0 ? void 0 : _b.map(function (attendee) { return ({
                email: attendee.email,
                name: attendee.displayName,
                status: attendee.responseStatus
            }); })) || [],
            source: 'google-calendar',
            lastModified: new Date(event.updated)
        };
    };
    /**
     * Generate recurring event rule
     */
    GoogleCalendarUtils.generateRecurrenceRule = function (frequency, interval, count, until) {
        if (interval === void 0) { interval = 1; }
        var rule = "RRULE:FREQ=".concat(frequency.toUpperCase());
        if (interval > 1) {
            rule += ";INTERVAL=".concat(interval);
        }
        if (count) {
            rule += ";COUNT=".concat(count);
        }
        else if (until) {
            rule += ";UNTIL=".concat(until.toISOString().replace(/[-:]/g, '').split('.')[0], "Z");
        }
        return [rule];
    };
    /**
     * Calculate business hours availability
     */
    GoogleCalendarUtils.getBusinessHoursSlots = function (date, startHour, endHour, slotDuration) {
        if (startHour === void 0) { startHour = 8; }
        if (endHour === void 0) { endHour = 18; }
        if (slotDuration === void 0) { slotDuration = 30; }
        var slots = [];
        var currentDate = new Date(date);
        // Skip weekends
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            return slots;
        }
        for (var hour = startHour; hour < endHour; hour++) {
            for (var minute = 0; minute < 60; minute += slotDuration) {
                var start = new Date(currentDate);
                start.setHours(hour, minute, 0, 0);
                var end = new Date(start);
                end.setMinutes(end.getMinutes() + slotDuration);
                if (end.getHours() <= endHour) {
                    slots.push({ start: start, end: end });
                }
            }
        }
        return slots;
    };
    return GoogleCalendarUtils;
}());
exports.GoogleCalendarUtils = GoogleCalendarUtils;
