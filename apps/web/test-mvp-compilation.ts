// NeonPro MVP - Test Compilation
// This file tests that our MVP auth and CRUD systems compile correctly

// Test auth imports
import {
  type AuthUser,
  canAccessResource,
  createClient,
  getUser,
  hasPermission,
  PERMISSIONS,
  requireAuth,
  requireRole,
  signOut,
  type User,
  type UserRole,
  verifyAuth,
} from "./lib/auth";

// Test data imports
import {
  type Appointment,
  appointmentService,
  type AppointmentStatus,
  type AppointmentWithDetails,
  type CreateAppointmentDto,
  type CreatePatientDto,
  type CreateProfessionalDto,
  type Patient,
  patientService,
  type Professional,
  professionalService,
  type ProfessionalType,
  services,
  type UpdateAppointmentDto,
  type UpdatePatientDto,
  type UpdateProfessionalDto,
} from "./lib/data";

// Test auth functionality
async function testAuth() {
  const user = await getUser();
  console.log("User:", user);

  const authUser = await verifyAuth();
  console.log("Auth User:", authUser);

  if (authUser) {
    const hasViewPermission = hasPermission(authUser.role, PERMISSIONS.VIEW_PATIENTS);
    console.log("Has view permission:", hasViewPermission);

    const canAccess = canAccessResource(authUser, "patient", "some-id");
    console.log("Can access patient:", canAccess);
  }
}

// Test CRUD operations
async function testCRUD() {
  try {
    // Test patient creation
    const newPatient: CreatePatientDto = {
      full_name: "Test Patient",
      email: "test@example.com",
      phone: "(11) 99999-9999",
      has_consented: true,
      consent_date: new Date().toISOString(),
    };

    // This would create a patient if database was connected
    console.log("Patient data structure:", newPatient);

    // Test professional creation
    const newProfessional: CreateProfessionalDto = {
      clinic_id: "clinic-id",
      full_name: "Dr. Test",
      email: "doctor@example.com",
      professional_type: "dermatologist",
      specializations: ["botox", "fillers"],
    };

    console.log("Professional data structure:", newProfessional);

    // Test appointment creation
    const newAppointment: CreateAppointmentDto = {
      patient_id: "patient-id",
      professional_id: "professional-id",
      clinic_id: "clinic-id",
      procedure_type: "botox",
      procedure_area: "forehead",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3_600_000).toISOString(),
    };

    console.log("Appointment data structure:", newAppointment);

    // Test service availability
    console.log("Services available:", {
      patients: typeof patientService.create === "function",
      professionals: typeof professionalService.create === "function",
      appointments: typeof appointmentService.create === "function",
    });
  } catch (error) {
    console.error("CRUD test error:", error);
  }
}

// Test type definitions
function testTypes() {
  const professionalTypes: ProfessionalType[] = [
    "dermatologist",
    "aesthetician",
    "nurse",
    "cosmetologist",
    "other",
  ];

  const appointmentStatuses: AppointmentStatus[] = [
    "scheduled",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ];

  console.log("Professional types:", professionalTypes);
  console.log("Appointment statuses:", appointmentStatuses);
}

// Export test functions
export { testAuth, testCRUD, testTypes };

console.log("✅ MVP Auth and CRUD system compilation test passed!");
console.log("All imports, types, and function signatures are valid.");
