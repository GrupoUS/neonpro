// Test script to verify patient stats hook
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ownkoxryswokcdanrdgj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MTEwNDQsImV4cCI6MjA0MDE4NzA0NH0.2kD9rN4tOFgJQWbOhYHDxMkVqJ_3-0EfP5gK2vKC0-0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientStats() {
  console.log("Testing patient stats...");

  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [
      patientsResult,
      newPatientsResult,
      appointmentsResult,
      revenueResult,
    ] = await Promise.all([
      supabase.from("patients").select("id, is_active"),
      supabase
        .from("patients")
        .select("id")
        .gte("created_at", firstDayOfMonth.toISOString()),
      supabase
        .from("appointments")
        .select("id")
        .gte("start_time", tomorrow.toISOString().split("T")[0] + "T00:00:00Z"),
      supabase
        .from("financial_transactions")
        .select("amount")
        .gte(
          "transaction_date",
          today.toISOString().split("T")[0] + "T00:00:00Z",
        )
        .lt(
          "transaction_date",
          tomorrow.toISOString().split("T")[0] + "T00:00:00Z",
        ),
    ]);

    console.log(
      "Patients result:",
      patientsResult.error || patientsResult.data?.length,
    );
    console.log(
      "New patients result:",
      newPatientsResult.error || newPatientsResult.data?.length,
    );
    console.log(
      "Appointments result:",
      appointmentsResult.error || appointmentsResult.data?.length,
    );
    console.log(
      "Revenue result:",
      revenueResult.error || revenueResult.data?.length,
    );

    if (patientsResult.error) {
      console.error("Patients error:", patientsResult.error);
      return;
    }
    if (newPatientsResult.error) {
      console.error("New patients error:", newPatientsResult.error);
      return;
    }
    if (appointmentsResult.error) {
      console.error("Appointments error:", appointmentsResult.error);
      return;
    }
    if (revenueResult.error) {
      console.error("Revenue error:", revenueResult.error);
      return;
    }

    const totalPatients = patientsResult.data?.length || 0;
    const activePatients =
      patientsResult.data?.filter((p) => p.is_active)?.length || 0;
    const newThisMonth = newPatientsResult.data?.length || 0;
    const upcomingAppointments = appointmentsResult.data?.length || 0;
    const revenueToday =
      revenueResult.data?.reduce(
        (sum, t) => sum + (Number(t.amount) || 0),
        0,
      ) || 0;

    const stats = {
      totalPatients,
      activePatients,
      newThisMonth,
      upcomingAppointments,
      appointmentsToday: 0,
      revenueToday,
    };

    console.log("Final stats:", stats);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPatientStats();
