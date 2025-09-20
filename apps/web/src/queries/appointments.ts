import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/lib/supabase/types/database";
import { queryOptions } from "@tanstack/react-query";

// Tipos para melhor type safety
// type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

// Query options para listar agendamentos com filtros
export const appointmentsQueryOptions: any = ({
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  status,
  professionalId,
  patientId,
}: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  professionalId?: string;
  patientId?: string;
} = {}) =>
  queryOptions({
    queryKey: [
      "appointments",
      "list",
      {
        page,
        pageSize,
        startDate,
        endDate,
        status,
        professionalId,
        patientId,
      },
    ],
    queryFn: async () => {
      let query = supabase.from("appointments").select(
        `
          *,
          patient:patients(*),
          professional:professionals(*),
          clinic:clinics(*),
          service:services(*)
        `,
        { count: "exact" },
      );

      // Aplicar filtros
      if (startDate) {
        query = query.gte("start_time", startDate);
      }

      if (endDate) {
        query = query.lte("start_time", endDate);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      // Ordenar por data/hora
      query = query.order("start_time", { ascending: true });

      // Aplicar paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        appointments: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (agendamentos mudam frequentemente)
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

// Query options para buscar um agendamento específico
export const appointmentQueryOptions: any = (id: string) =>
  queryOptions({
    queryKey: ["appointments", "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patient:patients(*),
          professional:professionals(*),
          clinic:clinics(*),
          service:services(*),
          consent_records:consent_records(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!id,
  });

// Query options para agendamentos do dia
export const todayAppointmentsQueryOptions: any = (professionalId?: string) =>
  queryOptions({
    queryKey: ["appointments", "today", professionalId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `,
        )
        .gte("start_time", `${today}T00:00:00`)
        .lte("start_time", `${today}T23:59:59`)
        .order("start_time", { ascending: true });

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos (atualizações em tempo real)
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
  });

// Query options para agenda semanal
export const weeklyAppointmentsQueryOptions: any = (professionalId?: string) =>
  queryOptions({
    queryKey: ["appointments", "weekly", professionalId],
    queryFn: async () => {
      const today = new Date();
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay()),
      );
      const endOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 6),
      );

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `,
        )
        .gte("start_time", startOfWeek.toISOString())
        .lte("start_time", endOfWeek.toISOString())
        .order("start_time", { ascending: true });

      if (professionalId) {
        query = query.eq("professional_id", professionalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

// Query options para estatísticas de agendamentos
export const appointmentStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["appointments", "stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1,
      ).toISOString();

      const [
        { count: totalAppointments },
        { count: todayAppointments },
        { count: monthAppointments },
        { count: completedAppointments },
        { count: cancelledAppointments },
        { count: upcomingAppointments },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("start_time", `${today}T00:00:00`)
          .lte("start_time", `${today}T23:59:59`),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("start_time", startOfMonth),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "cancelled"),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .gte("start_time", new Date().toISOString())
          .in("status", ["scheduled", "confirmed"]),
      ]);

      return {
        total: totalAppointments || 0,
        today: todayAppointments || 0,
        thisMonth: monthAppointments || 0,
        completed: completedAppointments || 0,
        cancelled: cancelledAppointments || 0,
        upcoming: upcomingAppointments || 0,
        completionRate: totalAppointments
          ? ((completedAppointments || 0) / totalAppointments) * 100
          : 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

// Mutation options para criar agendamento
export const createAppointmentMutationOptions = {
  mutationFn: async (appointment: AppointmentInsert) => {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require("@/lib/query-client");
    invalidateSupabaseQueries("appointments");
  },
  onError: (error: any) => {
    console.error("Error creating appointment:", error);
  },
};

// Mutation options para atualizar agendamento
export const updateAppointmentMutationOptions = {
  mutationFn: async ({
    id,
    ...appointment
  }: AppointmentUpdate & { id: string }) => {
    const { data, error } = await supabase
      .from("appointments")
      .update(appointment)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: (_: unknown, _variables: unknown) => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require("@/lib/query-client");
    invalidateSupabaseQueries("appointments");
  },
  onError: (error: any) => {
    console.error("Error updating appointment:", error);
  },
};

// Mutation options para deletar agendamento
export const deleteAppointmentMutationOptions = {
  mutationFn: async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) throw error;
    return id;
  },
  onSuccess: () => {
    // Invalidar queries relacionadas após sucesso
    const { invalidateSupabaseQueries } = require("@/lib/query-client");
    invalidateSupabaseQueries("appointments");
  },
  onError: (error: any) => {
    console.error("Error deleting appointment:", error);
  },
};

// Mutation options para confirmar agendamento
export const confirmAppointmentMutationOptions = {
  mutationFn: async (id: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: (_: unknown, _variables: unknown) => {
    const { invalidateSupabaseQueries } = require("@/lib/query-client");
    invalidateSupabaseQueries("appointments");
  },
  onError: (error: any) => {
    console.error("Error confirming appointment:", error);
  },
};
