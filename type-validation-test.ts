// Type validation test file
import type { User, Patient, Appointment, ButtonProps, CardProps } from "./types";

// Test type assignments
const testUser: User = {
  id: "123",
  email: "test@example.com",
  role: "patient",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

const testPatient: Patient = {
  id: "456",
  personal_info: {
    first_name: "João",
    last_name: "Silva",
    date_of_birth: "1980-01-01",
    gender: "male",
    document_number: "12345678901",
    document_type: "cpf",
    nationality: "BR",
    marital_status: "single",
  },
  medical_info: {
    allergies: [],
    chronic_conditions: [],
    medications: [],
    immunizations: [],
  },
  contact_info: {
    phone: "11999999999",
    email: "joao@example.com",
  },
  emergency_contact: {
    name: "Maria Silva",
    relationship: "spouse",
    phone: "11888888888",
  },
  healthcare_provider_id: "789",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

const testAppointment: Appointment = {
  id: "999",
  patient_id: "456",
  healthcare_provider_id: "789",
  appointment_type: "consultation",
  status: "scheduled",
  scheduled_date: "2024-12-25T10:00:00Z",
  duration: 30,
  reason: "Consulta de rotina",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
};

// Test UI component props
const testButtonProps: ButtonProps = {
  variant: "default",
  size: "lg",
  disabled: false,
  onClick: () => console.log("clicked"),
};

const testCardProps: CardProps = {
  variant: "outline",
  padding: "md",
  className: "test-card",
};

// Export for validation
export { testUser, testPatient, testAppointment, testButtonProps, testCardProps };
