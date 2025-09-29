export const healthcareTools = {
  scheduleAppointment: {
    description: 'Schedule a new appointment for a patient',
    parameters: {
      type: 'object',
      properties: {
        patientId: { 
          type: 'string', 
          description: 'Patient ID (UUID format)' 
        },
        professionalId: { 
          type: 'string', 
          description: 'Professional ID (UUID format)' 
        },
        startTime: { 
          type: 'string', 
          description: 'Start time (ISO 8601 format)' 
        },
        endTime: { 
          type: 'string', 
          description: 'End time (ISO 8601 format)' 
        },
        serviceType: { 
          type: 'string', 
          description: 'Type of aesthetic service (e.g., consultation, botox, filler)' 
        },
        notes: {
          type: 'string',
          description: 'Optional notes about the appointment',
        },
      },
      required: ['patientId', 'professionalId', 'startTime', 'endTime', 'serviceType'],
    },
  },
  
  sendPatientMessage: {
    description: 'Send a message to a patient (LGPD compliant)',
    parameters: {
      type: 'object',
      properties: {
        patientId: { 
          type: 'string', 
          description: 'Patient ID (UUID format)' 
        },
        message: { 
          type: 'string', 
          description: 'Message content (LGPD compliant, no sensitive data)' 
        },
        type: {
          type: 'string',
          enum: ['appointment_reminder', 'general', 'follow_up'],
          description: 'Type of message for proper categorization'
        },
      },
      required: ['patientId', 'message', 'type'],
    },
  },

  createLead: {
    description: 'Create a new lead for potential patient',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Lead full name'
        },
        email: {
          type: 'string',
          description: 'Lead email address (optional)'
        },
        phone: {
          type: 'string',
          description: 'Lead phone number (optional)'
        },
        source: {
          type: 'string',
          description: 'Lead source (e.g., website, referral, social media)'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the lead'
        },
      },
      required: ['name'],
    },
  },

  searchAvailableSlots: {
    description: 'Search for available appointment slots',
    parameters: {
      type: 'object',
      properties: {
        professionalId: {
          type: 'string',
          description: 'Professional ID to check availability'
        },
        startDate: {
          type: 'string',
          description: 'Start date for availability search (ISO 8601)'
        },
        endDate: {
          type: 'string',
          description: 'End date for availability search (ISO 8601)'
        },
        duration: {
          type: 'number',
          description: 'Appointment duration in minutes'
        },
      },
      required: ['professionalId', 'startDate', 'endDate', 'duration'],
    },
  },
};