/**
 * Queries SQL otimizadas para o Supabase
 *
 * @description Centraliza todas as queries SQL complexas usadas pelos hooks
 * para facilitar manutenção e otimização de performance.
 */

import type { Database } from "@/types/supabase";

type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>;

/**
 * Dashboard Metrics Queries
 */

/**
 * Busca métricas principais do dashboard para o mês atual
 */
export const getDashboardMetricsCurrent = async (supabase: SupabaseClient) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase.rpc("get_dashboard_metrics", {
    start_date: startOfMonth.toISOString(),
  });

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Busca métricas do mês anterior para cálculo de crescimento
 */
export const getDashboardMetricsPrevious = async (supabase: SupabaseClient) => {
  const startOfPreviousMonth = new Date();
  startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
  startOfPreviousMonth.setDate(1);
  startOfPreviousMonth.setHours(0, 0, 0, 0);

  const endOfPreviousMonth = new Date(startOfPreviousMonth);
  endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() + 1);
  endOfPreviousMonth.setDate(0);
  endOfPreviousMonth.setHours(23, 59, 59, 999);

  const { data, error } = await supabase.rpc("get_dashboard_metrics", {
    start_date: startOfPreviousMonth.toISOString(),
    end_date: endOfPreviousMonth.toISOString(),
  });

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Patient Queries
 */

/**
 * Busca pacientes com filtros e paginação otimizada
 */
export const getPatientsWithFilters = async (
  supabase: SupabaseClient,
  filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  },
) => {
  const { page = 1, limit = 10, search, status } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("patients")
    .select(
      `
      id,
      name,
      email,
      phone,
      date_of_birth,
      status,
      created_at,
      updated_at
    `,
      { count: "exact" },
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  return query;
};

/**
 * Appointment Queries
 */

/**
 * Busca agendamentos com relacionamentos completos
 */
export const getAppointmentsWithDetails = async (
  supabase: SupabaseClient,
  filters: {
    dateRange?: { start: string; end: string; };
    status?: string;
    staffMemberId?: string;
    patientId?: string;
    limit?: number;
  },
) => {
  const { limit = 50, dateRange, status, staffMemberId, patientId } = filters;

  let query = supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      status,
      notes,
      created_at,
      updated_at,
      patient:patients!inner(
        id,
        name,
        email,
        phone
      ),
      service:services!inner(
        id,
        name,
        price,
        duration
      ),
      staff_member:staff_members!inner(
        id,
        name,
        specialization
      )
    `,
    )
    .order("appointment_date", { ascending: true })
    .limit(limit);

  if (dateRange) {
    query = query
      .gte("appointment_date", dateRange.start)
      .lte("appointment_date", dateRange.end);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (staffMemberId) {
    query = query.eq("staff_member_id", staffMemberId);
  }

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  return query;
};

/**
 * Financial Queries
 */

/**
 * Busca receita mensal dos últimos N meses
 */
export const getMonthlyRevenue = async (
  supabase: SupabaseClient,
  monthsBack = 12,
) => {
  const { data, error } = await supabase.rpc("get_monthly_revenue_stats", {
    months_back: monthsBack,
  });

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Busca estatísticas de métodos de pagamento
 */
export const getPaymentMethodStats = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("financial_transactions")
    .select("payment_method, amount")
    .eq("status", "completed");

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Busca receita por serviço
 */
export const getRevenueByService = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("financial_transactions")
    .select(
      `
      amount,
      appointment:appointments!inner(
        service:services!inner(
          id,
          name
        )
      )
    `,
    )
    .eq("status", "completed")
    .not("appointment", "is", undefined);

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Staff Queries
 */

/**
 * Busca funcionários com estatísticas de agendamentos
 */
export const getStaffWithAppointmentStats = async (
  supabase: SupabaseClient,
  staffId: string,
) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total de agendamentos
  const { count: totalAppointments, error: totalError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("staff_member_id", staffId)
    .eq("status", "completed");

  if (totalError) {
    throw totalError;
  }

  // Agendamentos mensais
  const { count: monthlyAppointments, error: monthlyError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("staff_member_id", staffId)
    .eq("status", "completed")
    .gte("appointment_date", startOfMonth.toISOString());

  if (monthlyError) {
    throw monthlyError;
  }

  // Receita do funcionário
  const { data: revenueData, error: revenueError } = await supabase
    .from("financial_transactions")
    .select(
      `
      amount,
      appointment:appointments!inner(staff_member_id)
    `,
    )
    .eq("appointment.staff_member_id", staffId)
    .eq("status", "completed");

  if (revenueError) {
    throw revenueError;
  }

  const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    totalAppointments: totalAppointments || 0,
    monthlyAppointments: monthlyAppointments || 0,
    totalRevenue,
  };
};

/**
 * Busca disponibilidade de funcionário
 */
export const getStaffAvailability = async (
  supabase: SupabaseClient,
  staffId: string,
  date: string,
) => {
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_date")
    .eq("staff_member_id", staffId)
    .gte("appointment_date", startDate.toISOString())
    .lt("appointment_date", endDate.toISOString())
    .in("status", ["scheduled", "in_progress"]);

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Service Queries
 */

/**
 * Busca serviços com estatísticas de uso
 */
export const getServiceUsageStats = async (
  supabase: SupabaseClient,
  serviceId: string,
) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total de agendamentos do serviço
  const { count: totalAppointments, error: totalError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("service_id", serviceId)
    .in("status", ["completed", "scheduled"]);

  if (totalError) {
    throw totalError;
  }

  // Agendamentos mensais
  const { count: monthlyAppointments, error: monthlyError } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("service_id", serviceId)
    .in("status", ["completed", "scheduled"])
    .gte("appointment_date", startOfMonth.toISOString());

  if (monthlyError) {
    throw monthlyError;
  }

  // Receita do serviço
  const { data: revenueData, error: revenueError } = await supabase
    .from("financial_transactions")
    .select(
      `
      amount,
      appointment:appointments!inner(service_id)
    `,
    )
    .eq("appointment.service_id", serviceId)
    .eq("status", "completed");

  if (revenueError) {
    throw revenueError;
  }

  const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    totalAppointments: totalAppointments || 0,
    monthlyAppointments: monthlyAppointments || 0,
    totalRevenue,
  };
};

/**
 * Helper Functions
 */

/**
 * Executa query com retry automático
 */
export const executeWithRetry = async <T>(
  queryFunction: () => Promise<{ data: T; error: unknown; }>,
  maxRetries = 3,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await queryFunction();

      if (error) {
        lastError = error;
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
          continue;
        }
        throw error;
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

/**
 * Cache simples para queries
 */
const queryCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number; }
>();

export const getCachedQuery = async <T>(
  cacheKey: string,
  queryFunction: () => Promise<T>,
  ttlMinutes = 5,
): Promise<T> => {
  const now = Date.now();
  const cached = queryCache.get(cacheKey);

  if (cached && now - cached.timestamp < cached.ttl * 60 * 1000) {
    return cached.data;
  }

  const data = await queryFunction();
  queryCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: ttlMinutes,
  });

  return data;
};

/**
 * Limpa cache expirado
 */
export const clearExpiredCache = () => {
  const now = Date.now();

  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp >= value.ttl * 60 * 1000) {
      queryCache.delete(key);
    }
  }
};
