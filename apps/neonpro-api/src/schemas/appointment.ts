import { type Static, Type } from "@sinclair/typebox";

// Appointment status enum
export const AppointmentStatus = Type.Union([
  Type.Literal("scheduled"),
  Type.Literal("confirmed"),
  Type.Literal("in_progress"),
  Type.Literal("completed"),
  Type.Literal("cancelled"),
  Type.Literal("no_show"),
  Type.Literal("rescheduled"),
]);

// Appointment type enum
export const AppointmentType = Type.Union([
  Type.Literal("consultation"),
  Type.Literal("follow_up"),
  Type.Literal("procedure"),
  Type.Literal("surgery"),
  Type.Literal("emergency"),
  Type.Literal("telemedicine"),
  Type.Literal("aesthetic_treatment"),
  Type.Literal("laser_therapy"),
  Type.Literal("injection"),
  Type.Literal("evaluation"),
]);

// Priority level for appointments
export const AppointmentPriority = Type.Union([
  Type.Literal("low"),
  Type.Literal("normal"),
  Type.Literal("high"),
  Type.Literal("urgent"),
  Type.Literal("emergency"),
]);

// Base appointment schema
export const AppointmentBaseSchema = Type.Object({
  patientId: Type.String({
    format: "uuid",
    description: "Patient ID",
  }),
  providerId: Type.String({
    format: "uuid",
    description: "Healthcare provider ID",
  }),
  appointmentDate: Type.String({
    format: "date-time",
    description: "Appointment date and time in ISO format",
  }),
  duration: Type.Integer({
    minimum: 15,
    maximum: 480,
    default: 30,
    description: "Duration in minutes",
  }),
  appointmentType: AppointmentType,
  priority: Type.Optional(AppointmentPriority),
  title: Type.String({
    minLength: 3,
    maxLength: 200,
    description: "Appointment title/subject",
  }),
  description: Type.Optional(
    Type.String({
      maxLength: 1000,
      description: "Appointment notes or description",
    }),
  ),
  location: Type.Optional(
    Type.String({
      maxLength: 200,
      description: "Physical location or room number",
    }),
  ),
  isTelemedicine: Type.Boolean({
    default: false,
    description: "Whether this is a telemedicine appointment",
  }),
});

// Telemedicine configuration
export const TelemedicineConfigSchema = Type.Object({
  platform: Type.Union([
    Type.Literal("zoom"),
    Type.Literal("google_meet"),
    Type.Literal("microsoft_teams"),
    Type.Literal("custom"),
  ]),
  meetingUrl: Type.Optional(Type.String({ format: "uri" })),
  meetingId: Type.Optional(Type.String()),
  password: Type.Optional(Type.String()),
  instructions: Type.Optional(Type.String({ maxLength: 500 })),
});

// Reminder configuration
export const ReminderConfigSchema = Type.Object({
  enabled: Type.Boolean({ default: true }),
  methods: Type.Array(
    Type.Union([
      Type.Literal("email"),
      Type.Literal("sms"),
      Type.Literal("push"),
      Type.Literal("whatsapp"),
    ]),
  ),
  timeBeforeAppointment: Type.Array(
    Type.Integer({
      minimum: 5,
      description: "Minutes before appointment to send reminder",
    }),
    {
      default: [1440, 60], // 24 hours and 1 hour before
      maxItems: 5,
    },
  ),
});

// Insurance information for appointment
export const AppointmentInsuranceSchema = Type.Object({
  insuranceProvider: Type.Optional(Type.String()),
  policyNumber: Type.Optional(Type.String()),
  authorizationNumber: Type.Optional(Type.String()),
  copayAmount: Type.Optional(Type.Number({ minimum: 0 })),
  coveragePercentage: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
});

// Create appointment schema
export const CreateAppointmentSchema = Type.Object({
  ...AppointmentBaseSchema.properties,
  telemedicineConfig: Type.Optional(TelemedicineConfigSchema),
  reminderConfig: Type.Optional(ReminderConfigSchema),
  insuranceInfo: Type.Optional(AppointmentInsuranceSchema),
  notes: Type.Optional(
    Type.String({
      maxLength: 2000,
      description: "Internal notes for healthcare providers",
    }),
  ),
});

// Update appointment schema
export const UpdateAppointmentSchema = Type.Partial(CreateAppointmentSchema);

// Appointment response schema
export const AppointmentResponseSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  ...CreateAppointmentSchema.properties,
  status: AppointmentStatus,
  tenantId: Type.String({ format: "uuid" }),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  createdBy: Type.String({ format: "uuid" }),
  confirmedAt: Type.Optional(Type.String({ format: "date-time" })),
  confirmedBy: Type.Optional(Type.String({ format: "uuid" })),
  cancelledAt: Type.Optional(Type.String({ format: "date-time" })),
  cancelledBy: Type.Optional(Type.String({ format: "uuid" })),
  cancellationReason: Type.Optional(Type.String()),

  // Related data (populated from joins)
  patient: Type.Optional(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      name: Type.String(),
      email: Type.Optional(Type.String()),
      phone: Type.Optional(Type.String()),
      medicalRecordNumber: Type.String(),
    }),
  ),

  provider: Type.Optional(
    Type.Object({
      id: Type.String({ format: "uuid" }),
      name: Type.String(),
      specialization: Type.Optional(Type.String()),
      licenseNumber: Type.Optional(Type.String()),
    }),
  ),
}); // Appointment query parameters
export const AppointmentQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  patientId: Type.Optional(Type.String({ format: "uuid" })),
  providerId: Type.Optional(Type.String({ format: "uuid" })),
  status: Type.Optional(AppointmentStatus),
  appointmentType: Type.Optional(AppointmentType),
  priority: Type.Optional(AppointmentPriority),
  startDate: Type.Optional(
    Type.String({
      format: "date",
      description: "Filter appointments from this date (YYYY-MM-DD)",
    }),
  ),
  endDate: Type.Optional(
    Type.String({
      format: "date",
      description: "Filter appointments until this date (YYYY-MM-DD)",
    }),
  ),
  isTelemedicine: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(
    Type.Union(
      [
        Type.Literal("appointmentDate"),
        Type.Literal("createdAt"),
        Type.Literal("patientName"),
        Type.Literal("providerName"),
        Type.Literal("status"),
      ],
      { default: "appointmentDate" },
    ),
  ),
  sortOrder: Type.Optional(
    Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "asc" }),
  ),
});

// Appointment list response schema
export const AppointmentListResponseSchema = Type.Object({
  appointments: Type.Array(AppointmentResponseSchema),
  pagination: Type.Object({
    page: Type.Integer(),
    limit: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean(),
  }),
  summary: Type.Object({
    totalScheduled: Type.Integer(),
    totalConfirmed: Type.Integer(),
    totalCompleted: Type.Integer(),
    totalCancelled: Type.Integer(),
    upcomingToday: Type.Integer(),
    overdue: Type.Integer(),
  }),
});

// Available time slots schema
export const TimeSlotSchema = Type.Object({
  startTime: Type.String({ format: "time" }),
  endTime: Type.String({ format: "time" }),
  duration: Type.Integer({ minimum: 15 }),
  isAvailable: Type.Boolean(),
  isBlocked: Type.Boolean({ default: false }),
  blockReason: Type.Optional(Type.String()),
});

// Provider availability schema
export const ProviderAvailabilitySchema = Type.Object({
  providerId: Type.String({ format: "uuid" }),
  date: Type.String({ format: "date" }),
  timeSlots: Type.Array(TimeSlotSchema),
  workingHours: Type.Object({
    start: Type.String({ format: "time" }),
    end: Type.String({ format: "time" }),
    breakTime: Type.Optional(
      Type.Object({
        start: Type.String({ format: "time" }),
        end: Type.String({ format: "time" }),
      }),
    ),
  }),
  isWorkingDay: Type.Boolean({ default: true }),
  specialNotes: Type.Optional(Type.String()),
});

// Appointment scheduling request
export const ScheduleAppointmentSchema = Type.Object({
  ...CreateAppointmentSchema.properties,
  preferredTimeSlots: Type.Optional(
    Type.Array(
      Type.Object({
        date: Type.String({ format: "date" }),
        startTime: Type.String({ format: "time" }),
        endTime: Type.String({ format: "time" }),
      }),
      { maxItems: 3 },
    ),
  ),
  allowAlternativeProvider: Type.Boolean({ default: false }),
  urgencyLevel: Type.Optional(AppointmentPriority),
  reason: Type.String({
    minLength: 10,
    maxLength: 500,
    description: "Reason for the appointment",
  }),
});

// Appointment confirmation schema
export const ConfirmAppointmentSchema = Type.Object({
  confirmationMethod: Type.Union([
    Type.Literal("phone"),
    Type.Literal("email"),
    Type.Literal("sms"),
    Type.Literal("in_person"),
    Type.Literal("patient_portal"),
  ]),
  confirmedBy: Type.String({ format: "uuid" }),
  confirmationNotes: Type.Optional(Type.String({ maxLength: 500 })),
  reminderPreferences: Type.Optional(ReminderConfigSchema),
});

// Appointment cancellation schema
export const CancelAppointmentSchema = Type.Object({
  reason: Type.Union([
    Type.Literal("patient_request"),
    Type.Literal("provider_unavailable"),
    Type.Literal("emergency"),
    Type.Literal("weather"),
    Type.Literal("illness"),
    Type.Literal("scheduling_conflict"),
    Type.Literal("other"),
  ]),
  notes: Type.Optional(Type.String({ maxLength: 500 })),
  refundRequested: Type.Boolean({ default: false }),
  rescheduleRequested: Type.Boolean({ default: false }),
  alternativeOptions: Type.Optional(
    Type.Array(
      Type.Object({
        date: Type.String({ format: "date" }),
        startTime: Type.String({ format: "time" }),
        providerId: Type.Optional(Type.String({ format: "uuid" })),
      }),
      { maxItems: 3 },
    ),
  ),
});

// Reschedule appointment schema
export const RescheduleAppointmentSchema = Type.Object({
  newAppointmentDate: Type.String({ format: "date-time" }),
  newProviderId: Type.Optional(Type.String({ format: "uuid" })),
  reason: Type.String({ maxLength: 500 }),
  notifyPatient: Type.Boolean({ default: true }),
  notificationMethod: Type.Optional(
    Type.Array(
      Type.Union([
        Type.Literal("email"),
        Type.Literal("sms"),
        Type.Literal("phone"),
        Type.Literal("push"),
      ]),
    ),
  ),
});

// Type exports for use in route handlers
export type CreateAppointment = Static<typeof CreateAppointmentSchema>;
export type UpdateAppointment = Static<typeof UpdateAppointmentSchema>;
export type AppointmentResponse = Static<typeof AppointmentResponseSchema>;
export type AppointmentQuery = Static<typeof AppointmentQuerySchema>;
export type AppointmentListResponse = Static<typeof AppointmentListResponseSchema>;
export type ScheduleAppointment = Static<typeof ScheduleAppointmentSchema>;
export type ConfirmAppointment = Static<typeof ConfirmAppointmentSchema>;
export type CancelAppointment = Static<typeof CancelAppointmentSchema>;
export type RescheduleAppointment = Static<typeof RescheduleAppointmentSchema>;
export type ProviderAvailability = Static<typeof ProviderAvailabilitySchema>;
export type TimeSlot = Static<typeof TimeSlotSchema>;
