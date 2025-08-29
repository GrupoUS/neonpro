/**
 * ðŸ“Š Analytics Routes - NeonPro API
 * ==================================
 *
 * Rotas para dashboard de mÃ©tricas e analytics
 * com inteligÃªncia financeira e compliance tracking.
 */

import { zValidator } from "@hono/zod-validator";
import type { ApiResponse } from "@neonpro/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../lib/constants.js";
import { supabase } from "../lib/supabase.js";

// Zod schemas for analytics
const DateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data invÃ¡lido (YYYY-MM-DD)"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data invÃ¡lido (YYYY-MM-DD)"),
});

const AnalyticsQuerySchema = z.object({
  period: z
    .enum(["today", "week", "month", "quarter", "year", "custom"])
    .default("month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

const RevenueQuerySchema = z.object({
  period: z
    .enum(["today", "week", "month", "quarter", "year", "custom"])
    .default("month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceCategory: z
    .enum([
      "facial_treatments",
      "body_treatments",
      "hair_removal",
      "cosmetic_procedures",
      "wellness",
      "consultations",
    ])
    .optional(),
  professionalId: z.string().optional(),
});

// Create analytics router
export const analyticsRoutes = new Hono()
  // Authentication middleware
  .use("*", async (context, next) => {
    const auth = context.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return context.json(
        { error: "UNAUTHORIZED", message: "Token de acesso obrigatÃ³rio" },
        401,
      );
    }
    await next();
  })
  // ðŸ“Š Dashboard overview
  .get(
    "/dashboard",
    zValidator("query", AnalyticsQuerySchema),
    async (context) => {
      const { period, startDate, endDate } = context.req.valid("query");

      try {
        // Calculate date range based on period
        let dateFrom: string;
        let dateTo: string = new Date().toISOString().split("T")[0];

        if (period === "custom" && startDate && endDate) {
          dateFrom = startDate;
          dateTo = endDate;
        } else {
          const now = new Date();
          switch (period) {
            case "today":
              dateFrom = dateTo;
              break;
            case "week":
              dateFrom =
                new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
              break;
            case "month":
              dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
              break;
            case "quarter":
              const quarterStart = new Date(
                now.getFullYear(),
                Math.floor(now.getMonth() / 3) * 3,
                1,
              );
              dateFrom = quarterStart.toISOString().split("T")[0];
              break;
            case "year":
              dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
              break;
            default:
              dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          }
        }

        // Get appointments data for the period
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_time,
            status,
            total_amount,
            patient_id,
            professional_id,
            service_id,
            patients(full_name),
            professionals(full_name),
            services(name, category)
          `)
          .gte("appointment_time", `${dateFrom}T00:00:00`)
          .lte("appointment_time", `${dateTo}T23:59:59`);

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          throw new Error("Failed to fetch appointments data");
        }

        // Calculate summary metrics
        const completedAppointments = appointments?.filter(apt => apt.status === "completed") || [];
        const totalRevenue = completedAppointments.reduce(
          (sum, apt) => sum + (apt.total_amount || 0),
          0,
        );
        const totalAppointments = appointments?.length || 0;
        const uniquePatients = new Set(appointments?.map(apt => apt.patient_id)).size;
        const averageTicket = totalAppointments > 0
          ? totalRevenue / completedAppointments.length
          : 0;

        // Get previous period data for growth calculation
        const prevPeriodStart = new Date(dateFrom);
        const prevPeriodEnd = new Date(dateTo);
        const periodDiff = prevPeriodEnd.getTime() - prevPeriodStart.getTime();
        prevPeriodStart.setTime(prevPeriodStart.getTime() - periodDiff);
        prevPeriodEnd.setTime(prevPeriodEnd.getTime() - periodDiff);

        const { data: prevAppointments } = await supabase
          .from("appointments")
          .select("id, status, total_amount, patient_id")
          .gte("appointment_time", prevPeriodStart.toISOString())
          .lte("appointment_time", prevPeriodEnd.toISOString());

        const prevCompletedAppointments = prevAppointments?.filter(apt =>
          apt.status === "completed"
        ) || [];
        const prevTotalRevenue = prevCompletedAppointments.reduce(
          (sum, apt) => sum + (apt.total_amount || 0),
          0,
        );
        const prevTotalAppointments = prevAppointments?.length || 0;
        const prevUniquePatients = new Set(prevAppointments?.map(apt => apt.patient_id)).size;
        const prevAverageTicket = prevTotalAppointments > 0
          ? prevTotalRevenue / prevCompletedAppointments.length
          : 0;

        // Calculate growth percentages
        const revenueGrowth = prevTotalRevenue > 0
          ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
          : 0;
        const appointmentsGrowth = prevTotalAppointments > 0
          ? ((totalAppointments - prevTotalAppointments) / prevTotalAppointments) * 100
          : 0;
        const patientsGrowth = prevUniquePatients > 0
          ? ((uniquePatients - prevUniquePatients) / prevUniquePatients) * 100
          : 0;
        const ticketGrowth = prevAverageTicket > 0
          ? ((averageTicket - prevAverageTicket) / prevAverageTicket) * 100
          : 0;

        // Get recent activity (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentAppointments } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_time,
            status,
            total_amount,
            patients(full_name),
            services(name)
          `)
          .gte("appointment_time", yesterday)
          .order("appointment_time", { ascending: false })
          .limit(10);

        const recentActivity = recentAppointments?.map((apt, index) => ({
          id: `act_${index + 1}`,
          type: apt.status === "completed"
            ? "appointment_completed"
            : apt.status === "scheduled"
            ? "appointment_booked"
            : "appointment_updated",
          description: `${apt.services?.name} - ${apt.patients?.full_name}`,
          value: apt.status === "completed" ? apt.total_amount : undefined,
          timestamp: apt.appointment_time,
        })) || [];

        // Get top services
        const serviceStats = appointments?.reduce((acc, apt) => {
          if (apt.services?.name && apt.status === "completed") {
            const serviceName = apt.services.name;
            if (!acc[serviceName]) {
              acc[serviceName] = { bookings: 0, revenue: 0 };
            }
            acc[serviceName].bookings += 1;
            acc[serviceName].revenue += apt.total_amount || 0;
          }
          return acc;
        }, {} as Record<string, { bookings: number; revenue: number; }>);

        const topServices = Object.entries(serviceStats || {})
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4);

        // Get professional performance
        const professionalStats = appointments?.reduce((acc, apt) => {
          if (apt.professionals?.full_name && apt.status === "completed") {
            const profName = apt.professionals.full_name;
            if (!acc[apt.professional_id]) {
              acc[apt.professional_id] = {
                id: apt.professional_id,
                name: profName,
                appointments: 0,
                revenue: 0,
                rating: 4.8, // Mock rating for now
              };
            }
            acc[apt.professional_id].appointments += 1;
            acc[apt.professional_id].revenue += apt.total_amount || 0;
          }
          return acc;
        }, {} as Record<string, any>);

        const professionalPerformance = Object.values(professionalStats || {})
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5);

        const mockDashboard = {
          summary: {
            totalRevenue,
            revenueGrowth: Number(revenueGrowth.toFixed(1)),
            totalAppointments,
            appointmentsGrowth: Number(appointmentsGrowth.toFixed(1)),
            totalPatients: uniquePatients,
            patientsGrowth: Number(patientsGrowth.toFixed(1)),
            averageTicket: Number(averageTicket.toFixed(2)),
            ticketGrowth: Number(ticketGrowth.toFixed(1)),
          },
          recentActivity,
          topServices,
          professionalPerformance,
        };

        const response: ApiResponse<typeof mockDashboard> = {
          data: mockDashboard,
          message: "Dashboard carregado com sucesso",
          success: true,
        };

        return context.json(response, HTTP_STATUS.OK);
      } catch {
        return context.json(
          {
            error: "INTERNAL_ERROR",
            message: "Erro ao carregar dashboard",
            success: false,
          },
          500,
        );
      }
    },
  )
  // ðŸ’° Revenue analytics
  .get("/revenue", zValidator("query", RevenueQuerySchema), async (context) => {
    const { period, serviceCategory, professionalId, startDate, endDate } = context.req.valid(
      "query",
    );

    try {
      // Build date range based on period
      let dateRange = { start: "", end: "" };
      const now = new Date();

      switch (period) {
        case "today":
          dateRange.start = now.toISOString().split("T")[0];
          dateRange.end = now.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          dateRange.start = weekStart.toISOString().split("T")[0];
          dateRange.end = new Date().toISOString().split("T")[0];
          break;
        case "month":
          dateRange.start =
            new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          dateRange.end = new Date().toISOString().split("T")[0];
          break;
        case "quarter":
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          dateRange.start = quarterStart.toISOString().split("T")[0];
          dateRange.end = new Date().toISOString().split("T")[0];
          break;
        case "year":
          dateRange.start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
          dateRange.end = new Date().toISOString().split("T")[0];
          break;
        case "custom":
          dateRange.start = startDate
            || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          dateRange.end = endDate || new Date().toISOString().split("T")[0];
          break;
      }

      // Build query filters
      let appointmentsQuery = supabase
        .from("appointments")
        .select(`
          id,
          appointment_time,
          total_amount,
          status,
          service_id,
          professional_id,
          services(name, category)
        `)
        .eq("status", "completed")
        .gte("appointment_time", `${dateRange.start}T00:00:00`)
        .lte("appointment_time", `${dateRange.end}T23:59:59`);

      if (serviceCategory) {
        appointmentsQuery = appointmentsQuery.eq("services.category", serviceCategory);
      }
      if (professionalId) {
        appointmentsQuery = appointmentsQuery.eq("professional_id", professionalId);
      }

      const { data: appointments, error: appointmentsError } = await appointmentsQuery;

      if (appointmentsError) {
        console.error("Error fetching revenue data:", appointmentsError);
        throw new Error("Failed to fetch revenue data");
      }

      // Calculate total revenue metrics
      const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)
        || 0;
      const totalAppointments = appointments?.length || 0;
      const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

      // Get previous period data for growth calculation
      const prevPeriodStart = new Date(dateRange.start);
      const prevPeriodEnd = new Date(dateRange.end);
      const periodDiff = prevPeriodEnd.getTime() - prevPeriodStart.getTime();
      prevPeriodStart.setTime(prevPeriodStart.getTime() - periodDiff);
      prevPeriodEnd.setTime(prevPeriodEnd.getTime() - periodDiff);

      let prevAppointmentsQuery = supabase
        .from("appointments")
        .select("id, total_amount, services(category)")
        .eq("status", "completed")
        .gte("appointment_time", prevPeriodStart.toISOString())
        .lte("appointment_time", prevPeriodEnd.toISOString());

      if (serviceCategory) {
        prevAppointmentsQuery = prevAppointmentsQuery.eq("services.category", serviceCategory);
      }
      if (professionalId) {
        prevAppointmentsQuery = prevAppointmentsQuery.eq("professional_id", professionalId);
      }

      const { data: prevAppointments } = await prevAppointmentsQuery;
      const prevTotalRevenue = prevAppointments?.reduce((sum, apt) =>
        sum + (apt.total_amount || 0), 0) || 0;
      const revenueGrowth = prevTotalRevenue > 0
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
        : 0;

      // Calculate daily revenue breakdown
      const dailyRevenueMap = appointments?.reduce((acc, apt) => {
        const date = apt.appointment_time.split("T")[0];
        if (!acc[date]) {
          acc[date] = { revenue: 0, appointments: 0 };
        }
        acc[date].revenue += apt.total_amount || 0;
        acc[date].appointments += 1;
        return acc;
      }, {} as Record<string, { revenue: number; appointments: number; }>);

      const dailyRevenue = Object.entries(dailyRevenueMap || {})
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate revenue by category
      const categoryRevenueMap = appointments?.reduce((acc, apt) => {
        const category = apt.services?.category || "other";
        if (!acc[category]) {
          acc[category] = { revenue: 0, appointments: 0 };
        }
        acc[category].revenue += apt.total_amount || 0;
        acc[category].appointments += 1;
        return acc;
      }, {} as Record<string, { revenue: number; appointments: number; }>);

      const byCategory = Object.entries(categoryRevenueMap || {})
        .map(([category, data]) => ({
          category,
          revenue: data.revenue,
          percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
          appointments: data.appointments,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      const mockRevenue = {
        total: totalRevenue,
        previousPeriod: prevTotalRevenue,
        growth: Number(revenueGrowth.toFixed(2)),
        dailyRevenue,
        byCategory: byCategory.slice(0, 6), // Top 6 categories

        // By professional
        byProfessional: [
          {
            professionalId: "prof_1",
            name: "Dra. Ana Silva",
            revenue: 18_900.5,
          },
          {
            professionalId: "prof_2",
            name: "Carla Santos",
            revenue: 15_200.25,
          },
          {
            professionalId: "prof_3",
            name: "Dr. JoÃ£o Costa",
            revenue: 11_679.75,
          },
        ],

        // Payment methods
        paymentMethods: [
          { method: "credit_card", revenue: 27_500.5, percentage: 60.1 },
          { method: "debit_card", revenue: 9200.25, percentage: 20.1 },
          { method: "pix", revenue: 6800, percentage: 14.9 },
          { method: "cash", revenue: 2279.75, percentage: 5 },
        ],
      };

      const response: ApiResponse<typeof mockRevenue> = {
        data: mockRevenue,
        message: "Análise de receita carregada",
        success: true,
      };

      return context.json(response, HTTP_STATUS.OK);
    } catch {
      return context.json(
        {
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar análise de receita",
          success: false,
        },
        500,
      );
    }
  })
  // ðŸ“… Appointments analytics
  .get(
    "/appointments",
    zValidator("query", AnalyticsQuerySchema),
    async (context) => {
      const { period, groupBy } = context.req.valid("query");

      try {
        // Calculate date range based on period
        const now = new Date();
        let dateRange = { start: "", end: "" };

        switch (period) {
          case "today":
            dateRange.start = now.toISOString().split("T")[0];
            dateRange.end = now.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            dateRange.start = weekStart.toISOString().split("T")[0];
            dateRange.end = new Date().toISOString().split("T")[0];
            break;
          case "month":
            dateRange.start =
              new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
            dateRange.end = new Date().toISOString().split("T")[0];
            break;
          case "quarter":
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            dateRange.start = quarterStart.toISOString().split("T")[0];
            dateRange.end = new Date().toISOString().split("T")[0];
            break;
          case "year":
            dateRange.start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
            dateRange.end = new Date().toISOString().split("T")[0];
            break;
          default:
            dateRange.start =
              new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
            dateRange.end = new Date().toISOString().split("T")[0];
        }

        // Fetch appointments data
        const { data: appointments, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_time,
            status,
            duration,
            service_id,
            services(name, category, duration)
          `)
          .gte("appointment_time", `${dateRange.start}T00:00:00`)
          .lte("appointment_time", `${dateRange.end}T23:59:59`);

        if (appointmentsError) {
          console.error("Error fetching appointments data:", appointmentsError);
          throw new Error("Failed to fetch appointments data");
        }

        // Calculate status metrics
        const total = appointments?.length || 0;
        const completed = appointments?.filter(apt => apt.status === "completed").length || 0;
        const cancelled = appointments?.filter(apt => apt.status === "cancelled").length || 0;
        const noShow = appointments?.filter(apt => apt.status === "no_show").length || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

        // Calculate daily trends
        const dailyTrends = appointments?.reduce((acc, apt) => {
          const date = apt.appointment_time.split("T")[0];
          if (!acc[date]) {
            acc[date] = { total: 0, completed: 0, cancelled: 0 };
          }
          acc[date].total += 1;
          if (apt.status === "completed") acc[date].completed += 1;
          if (apt.status === "cancelled") acc[date].cancelled += 1;
          return acc;
        }, {} as Record<string, { total: number; completed: number; cancelled: number; }>);

        const trends = {
          appointments: Object.entries(dailyTrends || {})
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };

        // Calculate hourly distribution
        const hourlyDistribution = appointments?.reduce((acc, apt) => {
          const hour = apt.appointment_time.split("T")[1].slice(0, 5);
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const byHour = Object.entries(hourlyDistribution || {})
          .map(([hour, appointments]) => ({ hour, appointments }))
          .sort((a, b) => a.hour.localeCompare(b.hour));

        // Calculate day of week distribution
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const weeklyDistribution = appointments?.reduce((acc, apt) => {
          const dayOfWeek = new Date(apt.appointment_time).getDay();
          const dayName = dayNames[dayOfWeek];
          acc[dayName] = (acc[dayName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const byDayOfWeek = dayNames.map(day => ({
          day,
          appointments: weeklyDistribution?.[day] || 0,
        }));

        // Calculate average duration
        const durations = appointments?.map(apt => apt.duration || apt.services?.duration || 60)
          || [];
        const overallDuration = durations.length > 0
          ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
          : 0;

        // Calculate duration by service
        const serviceDurations = appointments?.reduce((acc, apt) => {
          const serviceName = apt.services?.name || "Unknown";
          const duration = apt.duration || apt.services?.duration || 60;
          if (!acc[serviceName]) {
            acc[serviceName] = { total: 0, count: 0 };
          }
          acc[serviceName].total += duration;
          acc[serviceName].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number; }>);

        const byService = Object.entries(serviceDurations || {})
          .map(([service, data]) => ({
            service,
            duration: Math.round(data.total / data.count),
          }))
          .slice(0, 5); // Top 5 services

        const mockAppointments = {
          total,
          completed,
          cancelled,
          noShow,
          completionRate,
          cancellationRate,
          trends,
          byHour,
          byDayOfWeek,
          averageDuration: {
            overall: overallDuration,
            byService,
          },
        };

        const response: ApiResponse<typeof mockAppointments> = {
          data: mockAppointments,
          message: "Análise de agendamentos carregada",
          success: true,
        };

        return context.json(response, HTTP_STATUS.OK);
      } catch {
        return context.json(
          {
            error: "INTERNAL_ERROR",
            message: "Erro ao carregar análise de agendamentos",
            success: false,
          },
          500,
        );
      }
    },
  )
  // ðŸ‘¥ Patients analytics
  .get("/patients", async (context) => {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch all patients
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select(`
          id,
          created_at,
          birth_date,
          gender,
          acquisition_channel,
          appointments(
            id,
            appointment_time,
            status,
            total_amount,
            services(name, category)
          )
        `);

      if (patientsError) {
        console.error("Error fetching patients data:", patientsError);
        throw new Error("Failed to fetch patients data");
      }

      const total = patients?.length || 0;

      // Calculate new patients this month
      const newThisMonth = patients?.filter(patient => {
        const createdDate = new Date(patient.created_at);
        return createdDate >= currentMonth && createdDate <= currentMonthEnd;
      }).length || 0;

      // Calculate returning patients (patients with more than one appointment)
      const returning = patients?.filter(patient => {
        const completedAppointments = patient.appointments?.filter(apt =>
          apt.status === "completed"
        ).length || 0;
        return completedAppointments > 1;
      }).length || 0;

      const retentionRate = total > 0 ? Math.round((returning / total) * 100 * 10) / 10 : 0;

      // Calculate age demographics
      const ageGroups = patients?.reduce((acc, patient) => {
        if (!patient.birth_date) return acc;

        const age = Math.floor(
          (Date.now() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
        );
        let range = "55+";

        if (age >= 18 && age <= 25) range = "18-25";
        else if (age >= 26 && age <= 35) range = "26-35";
        else if (age >= 36 && age <= 45) range = "36-45";
        else if (age >= 46 && age <= 55) range = "46-55";

        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ageGroupsArray = Object.entries(ageGroups || {})
        .map(([range, count]) => ({
          range,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => {
          const order = ["18-25", "26-35", "36-45", "46-55", "55+"];
          return order.indexOf(a.range) - order.indexOf(b.range);
        });

      // Calculate gender demographics
      const genderDistribution = patients?.reduce((acc, patient) => {
        const gender = patient.gender || "unknown";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const genderArray = Object.entries(genderDistribution || {})
        .map(([type, count]) => ({
          type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
        }));

      // Calculate acquisition channels
      const channelDistribution = patients?.reduce((acc, patient) => {
        const channel = patient.acquisition_channel || "unknown";
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const acquisitionChannels = Object.entries(channelDistribution || {})
        .map(([channel, count]) => ({
          channel,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate popular services by unique patients
      const servicePatients = patients?.reduce((acc, patient) => {
        const uniqueServices = new Set();
        patient.appointments?.forEach(apt => {
          if (apt.status === "completed" && apt.services?.name) {
            uniqueServices.add(apt.services.name);
          }
        });

        uniqueServices.forEach(serviceName => {
          acc[serviceName as string] = (acc[serviceName as string] || 0) + 1;
        });

        return acc;
      }, {} as Record<string, number>);

      const popularServices = Object.entries(servicePatients || {})
        .map(([service, patients]) => ({ service, patients }))
        .sort((a, b) => b.patients - a.patients)
        .slice(0, 5);

      // Calculate customer lifetime value
      const lifetimeValues = patients?.map(patient => {
        const totalSpent = patient.appointments
          ?.filter(apt => apt.status === "completed")
          ?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0;
        return totalSpent;
      }) || [];

      const averageLTV = lifetimeValues.length > 0
        ? Math.round(
          lifetimeValues.reduce((sum, val) => sum + val, 0) / lifetimeValues.length * 100,
        ) / 100
        : 0;

      const highestLTV = lifetimeValues.length > 0 ? Math.max(...lifetimeValues) : 0;

      // Segment customers by LTV
      const premiumCustomers = lifetimeValues.filter(val => val >= 1500).length;
      const regularCustomers = lifetimeValues.filter(val => val >= 500 && val < 1500).length;
      const occasionalCustomers = lifetimeValues.filter(val => val < 500).length;

      const premiumAvg = lifetimeValues.filter(val => val >= 1500);
      const regularAvg = lifetimeValues.filter(val => val >= 500 && val < 1500);
      const occasionalAvg = lifetimeValues.filter(val => val < 500);

      const mockPatients = {
        total,
        newThisMonth,
        returning,
        retentionRate,
        demographics: {
          ageGroups: ageGroupsArray,
          gender: genderArray,
        },
        acquisitionChannels,
        popularServices,
        lifetimeValue: {
          average: averageLTV,
          highest: highestLTV,
          segments: [
            {
              segment: "premium",
              count: premiumCustomers,
              average: premiumAvg.length > 0
                ? Math.round(
                  premiumAvg.reduce((sum, val) => sum + val, 0) / premiumAvg.length * 100,
                ) / 100
                : 0,
            },
            {
              segment: "regular",
              count: regularCustomers,
              average: regularAvg.length > 0
                ? Math.round(
                  regularAvg.reduce((sum, val) => sum + val, 0) / regularAvg.length * 100,
                ) / 100
                : 0,
            },
            {
              segment: "occasional",
              count: occasionalCustomers,
              average: occasionalAvg.length > 0
                ? Math.round(
                  occasionalAvg.reduce((sum, val) => sum + val, 0) / occasionalAvg.length * 100,
                ) / 100
                : 0,
            },
          ],
        },
      };

      const response: ApiResponse<typeof mockPatients> = {
        data: mockPatients,
        message: "Análise de pacientes carregada",
        success: true,
      };

      return context.json(response, HTTP_STATUS.OK);
    } catch {
      return context.json(
        {
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar análise de pacientes",
          success: false,
        },
        500,
      );
    }
  })
  // ðŸ“ˆ Performance metrics
  .get("/performance", async (context) => {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch appointments data for performance calculations
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_time,
          status,
          total_amount,
          created_at,
          duration,
          actual_start_time,
          actual_end_time,
          rating,
          notes,
          patient_id,
          professional_id,
          services(name, category, base_price)
        `);

      if (appointmentsError) {
        console.error("Error fetching appointments for performance:", appointmentsError);
        throw new Error("Failed to fetch appointments data");
      }

      // Fetch patients data
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("id, created_at, acquisition_channel");

      if (patientsError) {
        console.error("Error fetching patients for performance:", patientsError);
        throw new Error("Failed to fetch patients data");
      }

      // Fetch professionals data
      const { data: professionals, error: professionalsError } = await supabase
        .from("professionals")
        .select("id, working_hours");

      if (professionalsError) {
        console.error("Error fetching professionals for performance:", professionalsError);
        throw new Error("Failed to fetch professionals data");
      }

      const currentMonthAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.appointment_time);
        return aptDate >= currentMonth && aptDate <= currentMonthEnd;
      }) || [];

      const previousMonthAppointments = appointments?.filter(apt => {
        const aptDate = new Date(apt.appointment_time);
        return aptDate >= previousMonth && aptDate < currentMonth;
      }) || [];

      const completedAppointments = currentMonthAppointments.filter(apt =>
        apt.status === "completed"
      );
      const consultationAppointments = currentMonthAppointments.filter(apt =>
        apt.services?.category === "consultations"
      );
      const treatmentAppointments = currentMonthAppointments.filter(apt =>
        apt.services?.category !== "consultations" && apt.status === "completed"
      );

      // Calculate KPIs
      const ratingsWithValues = completedAppointments.filter(apt => apt.rating && apt.rating > 0);
      const patientSatisfaction = ratingsWithValues.length > 0
        ? Math.round(
          ratingsWithValues.reduce((sum, apt) => sum + (apt.rating || 0), 0)
            / ratingsWithValues.length * 10,
        ) / 10
        : 4.5; // Default fallback

      const totalSlots = professionals?.reduce((total, prof) => {
        // Assume 8 working hours per day, 22 working days per month, 2 slots per hour
        return total + (8 * 22 * 2);
      }, 0) || 1;
      const appointmentUtilization =
        Math.round((currentMonthAppointments.length / totalSlots) * 100 * 10) / 10;

      const totalRevenue = completedAppointments.reduce(
        (sum, apt) => sum + (apt.total_amount || 0),
        0,
      );
      const revenuePerVisit = completedAppointments.length > 0
        ? Math.round((totalRevenue / completedAppointments.length) * 100) / 100
        : 0;

      const conversionRate = consultationAppointments.length > 0
        ? Math.round((treatmentAppointments.length / consultationAppointments.length) * 100 * 10)
          / 10
        : 0;

      // Calculate repeat customers
      const patientAppointmentCounts = currentMonthAppointments.reduce((acc, apt) => {
        acc[apt.patient_id] = (acc[apt.patient_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const repeatCustomers = Object.values(patientAppointmentCounts).filter(count =>
        count > 1
      ).length;
      const repeatCustomerRate = Object.keys(patientAppointmentCounts).length > 0
        ? Math.round((repeatCustomers / Object.keys(patientAppointmentCounts).length) * 100 * 10)
          / 10
        : 0;

      // Calculate average booking lead time
      const bookingLeadTimes = currentMonthAppointments
        .filter(apt => apt.created_at && apt.appointment_time)
        .map(apt => {
          const createdDate = new Date(apt.created_at);
          const appointmentDate = new Date(apt.appointment_time);
          return Math.abs(appointmentDate.getTime() - createdDate.getTime())
            / (1000 * 60 * 60 * 24);
        });
      const averageBookingLead = bookingLeadTimes.length > 0
        ? Math.round(
          bookingLeadTimes.reduce((sum, days) => sum + days, 0) / bookingLeadTimes.length * 10,
        ) / 10
        : 0;

      // Calculate efficiency metrics
      const appointmentsWithTimes = completedAppointments.filter(apt =>
        apt.actual_start_time && apt.actual_end_time
      );

      const waitTimes = appointmentsWithTimes.map(apt => {
        const scheduledTime = new Date(apt.appointment_time);
        const actualStartTime = new Date(apt.actual_start_time!);
        return Math.max(0, (actualStartTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
      });
      const averageWaitTime = waitTimes.length > 0
        ? Math.round(waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length * 10) / 10
        : 0;

      const adherenceTimes = appointmentsWithTimes.filter(apt => {
        const scheduledDuration = apt.duration || 60; // Default 60 minutes
        const actualDuration =
          (new Date(apt.actual_end_time!).getTime() - new Date(apt.actual_start_time!).getTime())
          / (1000 * 60);
        return Math.abs(actualDuration - scheduledDuration) <= 15; // Within 15 minutes
      });
      const treatmentTimeAdherence = appointmentsWithTimes.length > 0
        ? Math.round((adherenceTimes.length / appointmentsWithTimes.length) * 100 * 10) / 10
        : 0;

      const professionalUtilization =
        Math.round((completedAppointments.length / (professionals?.length || 1) / 22) * 100 * 10)
        / 10;

      const cancelledAppointments = currentMonthAppointments.filter(apt =>
        apt.status === "cancelled"
      );
      const cancellationLeadTimes = cancelledAppointments
        .filter(apt => apt.created_at && apt.appointment_time)
        .map(apt => {
          const createdDate = new Date(apt.created_at);
          const appointmentDate = new Date(apt.appointment_time);
          return Math.abs(appointmentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        });
      const cancellationLeadTime = cancellationLeadTimes.length > 0
        ? Math.round(
          cancellationLeadTimes.reduce((sum, hours) => sum + hours, 0)
            / cancellationLeadTimes.length * 10,
        ) / 10
        : 0;

      // Calculate quality metrics
      const complaintsCount = completedAppointments.filter(apt =>
        apt.notes && apt.notes.toLowerCase().includes("reclamação")
      ).length;
      const patientComplaintsRate = completedAppointments.length > 0
        ? Math.round((complaintsCount / completedAppointments.length) * 100 * 100) / 100
        : 0;

      // Calculate financial metrics
      const previousMonthRevenue = previousMonthAppointments
        .filter(apt => apt.status === "completed")
        .reduce((sum, apt) => sum + (apt.total_amount || 0), 0);

      const revenueGrowthRate = previousMonthRevenue > 0
        ? Math.round(((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 * 10) / 10
        : 0;

      // Calculate cost per acquisition (simplified)
      const newPatientsThisMonth = patients?.filter(patient => {
        const createdDate = new Date(patient.created_at);
        return createdDate >= currentMonth && createdDate <= currentMonthEnd;
      }).length || 0;

      const estimatedMarketingCost = totalRevenue * 0.15; // Assume 15% of revenue for marketing
      const costPerAcquisition = newPatientsThisMonth > 0
        ? Math.round((estimatedMarketingCost / newPatientsThisMonth) * 100) / 100
        : 0;

      const profitMargin = totalRevenue > 0
        ? Math.round(((totalRevenue - (totalRevenue * 0.65)) / totalRevenue) * 100 * 10) / 10 // Assume 65% operational costs
        : 0;

      const mockPerformance = {
        // Key Performance Indicators
        kpis: {
          patientSatisfaction,
          appointmentUtilization,
          revenuePerVisit,
          conversionRate,
          repeatCustomerRate,
          averageBookingLead,
        },

        // Operational efficiency
        efficiency: {
          averageWaitTime,
          treatmentTimeAdherence,
          professionalUtilization,
          equipmentDowntime: 2.1, // Static for now - would need equipment tracking
          cancellationLeadTime,
        },

        // Quality metrics
        quality: {
          patientComplaintsRate,
          treatmentComplicationsRate: 0.2, // Static for now - would need incident tracking
          followUpComplianceRate: 89.4, // Static for now - would need follow-up tracking
          aftercareSatisfaction: patientSatisfaction, // Use same as patient satisfaction
        },

        // Financial health
        financial: {
          profitMargin,
          costPerAcquisition,
          revenueGrowthRate,
          cashFlowPositivity: totalRevenue > (totalRevenue * 0.65),
          averageCollectionPeriod: 2.1, // Static for now - would need payment tracking
        },

        // Compliance scores (static for now - would need compliance tracking system)
        compliance: {
          lgpdCompliance: 98.5,
          anvisaCompliance: 96.8,
          dataSecurityScore: 94.2,
          auditTrailCompleteness: 100,
        },
      };

      const response: ApiResponse<typeof mockPerformance> = {
        data: mockPerformance,
        message: "Métricas de performance carregadas",
        success: true,
      };

      return context.json(response, HTTP_STATUS.OK);
    } catch {
      return context.json(
        {
          error: "INTERNAL_ERROR",
          message: "Erro ao carregar métricas de performance",
          success: false,
        },
        500,
      );
    }
  })
  // ðŸŽ¯ Custom reports
  .post(
    "/reports",
    zValidator(
      "json",
      z.object({
        reportType: z.enum([
          "revenue",
          "appointments",
          "patients",
          "services",
          "professionals",
        ]),
        filters: z
          .object({
            dateRange: DateRangeSchema.optional(),
            serviceIds: z.array(z.string()).optional(),
            professionalIds: z.array(z.string()).optional(),
            categories: z.array(z.string()).optional(),
          })
          .optional(),
        groupBy: z
          .enum(["day", "week", "month", "service", "professional"])
          .optional(),
        includeComparison: z.boolean().default(false),
      }),
    ),
    async (context) => {
      const {
        reportType,
        filters,
        groupBy,
        includeComparison,
      } = context.req.valid("json");

      try {
        // Set up date range
        const now = new Date();
        let startDate: Date, endDate: Date;

        if (filters?.dateRange) {
          startDate = new Date(filters.dateRange.startDate);
          endDate = new Date(filters.dateRange.endDate);
        } else {
          // Default to current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        let reportData: any = {};
        let totalRecords = 0;

        switch (reportType) {
          case "revenue": {
            // Build revenue query
            let query = supabase
              .from("appointments")
              .select(`
                id,
                appointment_time,
                total_amount,
                status,
                services(name, category, base_price),
                professionals(name, specialization)
              `)
              .eq("status", "completed")
              .gte("appointment_time", startDate.toISOString())
              .lte("appointment_time", endDate.toISOString());

            // Apply filters
            if (filters?.professionalIds?.length) {
              query = query.in("professional_id", filters.professionalIds);
            }
            if (filters?.serviceIds?.length) {
              query = query.in("service_id", filters.serviceIds);
            }
            if (filters?.categories?.length) {
              query = query.in("services.category", filters.categories);
            }

            const { data: revenueData, error } = await query;
            if (error) throw error;

            totalRecords = revenueData?.length || 0;
            const totalRevenue = revenueData?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)
              || 0;

            // Group data based on groupBy parameter
            const groupedData = revenueData?.reduce((acc, apt) => {
              const date = new Date(apt.appointment_time);
              let key: string;

              switch (groupBy) {
                case "day":
                  key = date.toISOString().split("T")[0];
                  break;
                case "week":
                  const weekStart = new Date(date);
                  weekStart.setDate(date.getDate() - date.getDay());
                  key = weekStart.toISOString().split("T")[0];
                  break;
                case "month":
                  key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                  break;
                case "service":
                  key = apt.services?.name || "Unknown";
                  break;
                case "professional":
                  key = apt.professionals?.name || "Unknown";
                  break;
                default:
                  key = date.toISOString().split("T")[0];
              }

              if (!acc[key]) {
                acc[key] = { value: 0, count: 0, date: key };
              }
              acc[key].value += apt.total_amount || 0;
              acc[key].count += 1;
              return acc;
            }, {} as Record<string, any>) || {};

            reportData = {
              totalRevenue,
              averageTicket: totalRecords > 0
                ? Math.round((totalRevenue / totalRecords) * 100) / 100
                : 0,
              results: Object.values(groupedData),
            };
            break;
          }

          case "appointments": {
            let query = supabase
              .from("appointments")
              .select(`
                id,
                appointment_time,
                status,
                duration,
                services(name, category),
                professionals(name, specialization),
                patients(name, email)
              `)
              .gte("appointment_time", startDate.toISOString())
              .lte("appointment_time", endDate.toISOString());

            // Apply filters
            if (filters?.professionalIds?.length) {
              query = query.in("professional_id", filters.professionalIds);
            }
            if (filters?.serviceIds?.length) {
              query = query.in("service_id", filters.serviceIds);
            }

            const { data: appointmentsData, error } = await query;
            if (error) throw error;

            totalRecords = appointmentsData?.length || 0;
            const statusCounts = appointmentsData?.reduce((acc, apt) => {
              acc[apt.status] = (acc[apt.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {};

            reportData = {
              statusBreakdown: statusCounts,
              results: appointmentsData?.map(apt => ({
                id: apt.id,
                date: apt.appointment_time,
                status: apt.status,
                service: apt.services?.name,
                professional: apt.professionals?.name,
                patient: apt.patients?.name,
                duration: apt.duration,
              })) || [],
            };
            break;
          }

          case "patients": {
            let query = supabase
              .from("patients")
              .select(`
                id,
                name,
                email,
                phone,
                created_at,
                birth_date,
                gender,
                acquisition_channel,
                appointments(id, status, total_amount, appointment_time)
              `)
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());

            const { data: patientsData, error } = await query;
            if (error) throw error;

            totalRecords = patientsData?.length || 0;

            reportData = {
              newPatients: totalRecords,
              results: patientsData?.map(patient => {
                const totalSpent = patient.appointments?.reduce((sum, apt) =>
                  sum + (apt.status === "completed" ? (apt.total_amount || 0) : 0), 0) || 0;
                const appointmentCount = patient.appointments?.length || 0;

                return {
                  id: patient.id,
                  name: patient.name,
                  email: patient.email,
                  registrationDate: patient.created_at,
                  totalSpent,
                  appointmentCount,
                  acquisitionChannel: patient.acquisition_channel,
                };
              }) || [],
            };
            break;
          }

          case "services": {
            const { data: servicesData, error } = await supabase
              .from("services")
              .select(`
                id,
                name,
                category,
                base_price,
                duration,
                appointments!inner(
                  id,
                  status,
                  total_amount,
                  appointment_time
                )
              `)
              .gte("appointments.appointment_time", startDate.toISOString())
              .lte("appointments.appointment_time", endDate.toISOString());

            if (error) throw error;

            const serviceStats = servicesData?.map(service => {
              const completedAppointments = service.appointments?.filter(apt =>
                apt.status === "completed"
              ) || [];
              const totalRevenue = completedAppointments.reduce(
                (sum, apt) => sum + (apt.total_amount || 0),
                0,
              );

              return {
                id: service.id,
                name: service.name,
                category: service.category,
                basePrice: service.base_price,
                appointmentCount: service.appointments?.length || 0,
                completedCount: completedAppointments.length,
                totalRevenue,
                averageRevenue: completedAppointments.length > 0
                  ? Math.round((totalRevenue / completedAppointments.length) * 100) / 100
                  : 0,
              };
            }) || [];

            totalRecords = serviceStats.length;
            reportData = {
              results: serviceStats.sort((a, b) => b.totalRevenue - a.totalRevenue),
            };
            break;
          }

          case "professionals": {
            const { data: professionalsData, error } = await supabase
              .from("professionals")
              .select(`
                id,
                name,
                specialization,
                appointments!inner(
                  id,
                  status,
                  total_amount,
                  appointment_time,
                  rating
                )
              `)
              .gte("appointments.appointment_time", startDate.toISOString())
              .lte("appointments.appointment_time", endDate.toISOString());

            if (error) throw error;

            const professionalStats = professionalsData?.map(professional => {
              const completedAppointments = professional.appointments?.filter(apt =>
                apt.status === "completed"
              ) || [];
              const totalRevenue = completedAppointments.reduce(
                (sum, apt) => sum + (apt.total_amount || 0),
                0,
              );
              const ratingsWithValues = completedAppointments.filter(apt =>
                apt.rating && apt.rating > 0
              );
              const averageRating = ratingsWithValues.length > 0
                ? Math.round(
                  ratingsWithValues.reduce((sum, apt) => sum + (apt.rating || 0), 0)
                    / ratingsWithValues.length * 10,
                ) / 10
                : 0;

              return {
                id: professional.id,
                name: professional.name,
                specialization: professional.specialization,
                appointmentCount: professional.appointments?.length || 0,
                completedCount: completedAppointments.length,
                totalRevenue,
                averageRating,
                averageRevenue: completedAppointments.length > 0
                  ? Math.round((totalRevenue / completedAppointments.length) * 100) / 100
                  : 0,
              };
            }) || [];

            totalRecords = professionalStats.length;
            reportData = {
              results: professionalStats.sort((a, b) => b.totalRevenue - a.totalRevenue),
            };
            break;
          }

          default:
            throw new Error(`Unsupported report type: ${reportType}`);
        }

        const reportId = `rpt_${Date.now()}`;
        const mockReport = {
          reportId,
          type: reportType,
          generated: new Date().toISOString(),
          filters: filters || {},
          data: {
            summary: {
              totalRecords,
              dateRange: {
                start: startDate.toISOString().split("T")[0],
                end: endDate.toISOString().split("T")[0],
              },
            },
            ...reportData,
          },
          downloadUrl: `/api/v1/analytics/reports/${reportId}/download`,
        };

        const response: ApiResponse<typeof mockReport> = {
          data: mockReport,
          message: "Relatório customizado gerado com sucesso",
          success: true,
        };

        return context.json(response, HTTP_STATUS.CREATED);
      } catch {
        return context.json(
          {
            error: "INTERNAL_ERROR",
            message: "Erro ao gerar relatório customizado",
            success: false,
          },
          500,
        );
      }
    },
  );
