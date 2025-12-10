/**
 * Analytics Service
 * Provides comprehensive analytics and reporting for clinic management
 */

import { supabase } from '@/integrations/supabase/client';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Type definitions
export interface AppointmentMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  bookingRate: number; // percentage
  completionRate: number; // percentage
  cancellationRate: number; // percentage
  noShowRate: number; // percentage
}

export interface RevenueMetrics {
  totalRevenue: number;
  averageTicket: number;
  revenueByService: ServiceRevenueBreakdown[];
  revenueByProfessional: ProfessionalRevenueBreakdown[];
  monthlyRevenue: MonthlyRevenueData[];
}

export interface ServiceRevenueBreakdown {
  serviceId: string;
  serviceName: string;
  totalRevenue: number;
  appointmentCount: number;
  averagePrice: number;
  percentage: number;
}

export interface ProfessionalRevenueBreakdown {
  professionalId: string;
  professionalName: string;
  totalRevenue: number;
  appointmentCount: number;
  averageTicket: number;
  utilizationRate: number; // percentage of available time slots used
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  appointmentCount: number;
  averageTicket: number;
}

export interface PatientAnalytics {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  patientRetentionRate: number; // percentage
  averageVisitsPerPatient: number;
  topPatientsByFrequency: PatientFrequencyData[];
  patientAcquisitionTrend: PatientAcquisitionData[];
}

export interface PatientFrequencyData {
  patientId: string;
  patientName: string;
  appointmentCount: number;
  totalSpent: number;
  lastVisit: Date;
}

export interface PatientAcquisitionData {
  month: string;
  newPatients: number;
  returningPatients: number;
}

export interface ProfessionalPerformance {
  professionalId: string;
  professionalName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancellationRate: number;
  averageRating: number;
  totalRevenue: number;
  utilizationRate: number;
  popularServices: string[];
}

export interface PopularServicesData {
  serviceId: string;
  serviceName: string;
  appointmentCount: number;
  revenue: number;
  growthRate: number; // month-over-month growth
}

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
}

class AnalyticsService {
  /**
   * Get comprehensive appointment metrics
   */
  async getAppointmentMetrics(
    clinicId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<AppointmentMetrics> {
    try {
      const { data: appointments, error } = await (supabase as any)
        .from('appointments')
        .select('id, status, start_time')
        .eq('clinic_id' as any, clinicId as any)
        .gte('start_time', dateRange.startDate.toISOString())
        .lte('start_time', dateRange.endDate.toISOString());

      if (error) throw error;

      const totalAppointments = appointments?.length || 0;
      const completedAppointments = (appointments as any[])?.filter((a: any) =>
        a.status === 'completed'
      ).length || 0;
      const cancelledAppointments = (appointments as any[])?.filter((a: any) =>
        a.status === 'cancelled'
      ).length || 0;
      const noShowAppointments =
        (appointments as any[])?.filter((a: any) => a.status === 'no_show').length || 0;

      return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        bookingRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
        completionRate: totalAppointments > 0
          ? (completedAppointments / totalAppointments) * 100
          : 0,
        cancellationRate: totalAppointments > 0
          ? (cancelledAppointments / totalAppointments) * 100
          : 0,
        noShowRate: totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting appointment metrics:', error);
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        bookingRate: 0,
        completionRate: 0,
        cancellationRate: 0,
        noShowRate: 0,
      };
    }
  }

  /**
   * Get revenue metrics and breakdown
   */
  async getRevenueMetrics(
    clinicId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<RevenueMetrics> {
    try {
      const { data: appointments, error } = await (supabase as any)
        .from('appointments')
        .select(`
          id,
          total_amount,
          status,
          start_time,
          service_types!inner(id, name, price),
          professionals!inner(id, full_name)
        `)
        .eq('clinic_id' as any, clinicId as any)
        .eq('status', 'completed')
        .gte('start_time', dateRange.startDate.toISOString())
        .lte('start_time', dateRange.endDate.toISOString());

      if (error) throw error;

      const totalRevenue =
        (appointments as Array<{ total_amount: number | null }> | undefined)?.reduce(
          (sum: number, apt) => sum + (apt.total_amount || 0),
          0,
        ) || 0;
      const averageTicket = appointments?.length ? totalRevenue / appointments.length : 0;

      // Revenue by service
      const serviceRevenue = new Map<string, ServiceRevenueBreakdown>();
      (appointments as any[])?.forEach((apt: any) => {
        const service = apt.service_types;
        if (service) {
          const existing = serviceRevenue.get(service.id) || {
            serviceId: service.id,
            serviceName: service.name,
            totalRevenue: 0,
            appointmentCount: 0,
            averagePrice: 0,
            percentage: 0,
          };

          existing.totalRevenue += apt.total_amount || 0;
          existing.appointmentCount += 1;
          existing.averagePrice = existing.totalRevenue / existing.appointmentCount;

          serviceRevenue.set(service.id, existing);
        }
      });

      const revenueByService = Array.from(serviceRevenue.values()).map(service => ({
        ...service,
        percentage: totalRevenue > 0 ? (service.totalRevenue / totalRevenue) * 100 : 0,
      }));

      // Revenue by professional
      const professionalRevenue = new Map<string, ProfessionalRevenueBreakdown>();
      (appointments as any[])?.forEach((apt: any) => {
        const professional = apt.professionals;
        if (professional) {
          const existing = professionalRevenue.get(professional.id) || {
            professionalId: professional.id,
            professionalName: professional.full_name,
            totalRevenue: 0,
            appointmentCount: 0,
            averageTicket: 0,
            utilizationRate: 0, // This would need additional calculation
          };

          existing.totalRevenue += apt.total_amount || 0;
          existing.appointmentCount += 1;
          existing.averageTicket = existing.totalRevenue / existing.appointmentCount;

          professionalRevenue.set(professional.id, existing);
        }
      });

      const revenueByProfessional = Array.from(professionalRevenue.values());

      // Monthly revenue trend (last 6 months)
      const monthlyRevenue: MonthlyRevenueData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(monthStart);

        const monthAppointments = (appointments as any[])?.filter((apt: any) => {
          const aptDate = new Date(apt.start_time);
          return aptDate >= monthStart && aptDate <= monthEnd;
        }) || [];

        const monthRevenue = (monthAppointments as any[]).reduce(
          (sum: number, apt: any) => sum + (apt.total_amount || 0),
          0,
        );

        monthlyRevenue.push({
          month: format(monthStart, 'MMM yyyy', { locale: ptBR }),
          revenue: monthRevenue,
          appointmentCount: monthAppointments.length,
          averageTicket: monthAppointments.length > 0 ? monthRevenue / monthAppointments.length : 0,
        });
      }

      return {
        totalRevenue,
        averageTicket,
        revenueByService,
        revenueByProfessional,
        monthlyRevenue,
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      return {
        totalRevenue: 0,
        averageTicket: 0,
        revenueByService: [],
        revenueByProfessional: [],
        monthlyRevenue: [],
      };
    }
  }

  /**
   * Get patient analytics and retention metrics
   */
  async getPatientAnalytics(
    clinicId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<PatientAnalytics> {
    try {
      // Get all patients for the clinic
      const { data: allPatients, error: patientsError } = await (supabase as any)
        .from('patients')
        .select('id, full_name, created_at')
        .eq('clinic_id' as any, clinicId as any);

      if (patientsError) throw patientsError;

      // Get appointments in date range
      const { data: appointments, error: appointmentsError } = await (supabase as any)
        .from('appointments')
        .select(`
          id,
          patient_id,
          start_time,
          total_amount,
          status,
          patients!inner(full_name)
        `)
        .eq('clinic_id' as any, clinicId as any)
        .gte('start_time', dateRange.startDate.toISOString())
        .lte('start_time', dateRange.endDate.toISOString());

      if (appointmentsError) throw appointmentsError;

      const totalPatients = allPatients?.length || 0;
      const newPatients = (allPatients as any[])?.filter((p: any) => {
        const createdDate = new Date((p as any).created_at || 0);
        return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
      }).length || 0;

      // Calculate patient frequency
      const patientFrequency = new Map<string, PatientFrequencyData>();
      (appointments as any[])?.forEach((apt: any) => {
        if (apt.patient_id && apt.patients) {
          const existing = patientFrequency.get(apt.patient_id) || {
            patientId: apt.patient_id,
            patientName: apt.patients.full_name,
            appointmentCount: 0,
            totalSpent: 0,
            lastVisit: new Date(apt.start_time),
          };

          existing.appointmentCount += 1;
          existing.totalSpent += apt.total_amount || 0;

          const aptDate = new Date(apt.start_time);
          if (aptDate > existing.lastVisit) {
            existing.lastVisit = aptDate;
          }

          patientFrequency.set(apt.patient_id, existing);
        }
      });

      const topPatientsByFrequency = Array.from(patientFrequency.values())
        .sort((a, b) => b.appointmentCount - a.appointmentCount)
        .slice(0, 10);

      const returningPatients = Array.from(patientFrequency.values())
        .filter((p: PatientFrequencyData) => p.appointmentCount > 1).length;

      const patientRetentionRate = totalPatients > 0
        ? (returningPatients / totalPatients) * 100
        : 0;
      const averageVisitsPerPatient = totalPatients > 0
        ? (appointments?.length || 0) / totalPatients
        : 0;

      // Patient acquisition trend (last 6 months)
      const patientAcquisitionTrend: PatientAcquisitionData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(monthStart);

        const monthNewPatients = (allPatients as any[])?.filter((p: any) => {
          const createdDate = new Date((p as any).created_at || 0);
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length || 0;

        const monthReturningPatients = Array.from(patientFrequency.values())
          .filter((p: PatientFrequencyData) => {
            return p.lastVisit >= monthStart && p.lastVisit <= monthEnd && p.appointmentCount > 1;
          }).length;

        patientAcquisitionTrend.push({
          month: format(monthStart, 'MMM yyyy', { locale: ptBR }),
          newPatients: monthNewPatients,
          returningPatients: monthReturningPatients,
        });
      }

      return {
        totalPatients,
        newPatients,
        returningPatients,
        patientRetentionRate,
        averageVisitsPerPatient,
        topPatientsByFrequency,
        patientAcquisitionTrend,
      };
    } catch (error) {
      console.error('Error getting patient analytics:', error);
      return {
        totalPatients: 0,
        newPatients: 0,
        returningPatients: 0,
        patientRetentionRate: 0,
        averageVisitsPerPatient: 0,
        topPatientsByFrequency: [],
        patientAcquisitionTrend: [],
      };
    }
  }

  /**
   * Get professional performance metrics
   */
  async getProfessionalPerformance(
    clinicId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<ProfessionalPerformance[]> {
    try {
      const { data: appointments, error } = await (supabase as any)
        .from('appointments')
        .select(`
          id,
          professional_id,
          status,
          total_amount,
          service_types!inner(name),
          professionals!inner(full_name)
        `)
        .eq('clinic_id' as any, clinicId as any)
        .gte('start_time', dateRange.startDate.toISOString())
        .lte('start_time', dateRange.endDate.toISOString());

      if (error) throw error;

      const professionalStats = new Map<string, ProfessionalPerformance>();

      (appointments as any[])?.forEach((apt: any) => {
        if (apt.professional_id && apt.professionals) {
          const existing = professionalStats.get(apt.professional_id) || {
            professionalId: apt.professional_id,
            professionalName: apt.professionals.full_name,
            totalAppointments: 0,
            completedAppointments: 0,
            cancellationRate: 0,
            averageRating: 0, // Would need ratings table
            totalRevenue: 0,
            utilizationRate: 0, // Would need working hours calculation
            popularServices: [],
          };

          existing.totalAppointments += 1;
          if (apt.status === 'completed') {
            existing.completedAppointments += 1;
            existing.totalRevenue += apt.total_amount || 0;
          }

          professionalStats.set(apt.professional_id, existing);
        }
      });

      return Array.from(professionalStats.values()).map(prof => ({
        ...prof,
        cancellationRate: prof.totalAppointments > 0
          ? ((prof.totalAppointments - prof.completedAppointments) / prof.totalAppointments) * 100
          : 0,
      }));
    } catch (error) {
      console.error('Error getting professional performance:', error);
      return [];
    }
  }

  /**
   * Get popular services data
   */
  async getPopularServices(
    clinicId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<PopularServicesData[]> {
    try {
      const { data: appointments, error } = await (supabase as any)
        .from('appointments')
        .select(`
          id,
          service_type_id,
          total_amount,
          start_time,
          service_types!inner(name)
        `)
        .eq('clinic_id' as any, clinicId as any)
        .eq('status', 'completed')
        .gte('start_time', dateRange.startDate.toISOString())
        .lte('start_time', dateRange.endDate.toISOString());

      if (error) throw error;

      const serviceStats = new Map<string, PopularServicesData>();

      (appointments as any[])?.forEach((apt: any) => {
        if (apt.service_type_id && apt.service_types) {
          const existing = serviceStats.get(apt.service_type_id) || {
            serviceId: apt.service_type_id,
            serviceName: apt.service_types.name,
            appointmentCount: 0,
            revenue: 0,
            growthRate: 0, // Would need previous period comparison
          };

          existing.appointmentCount += 1;
          existing.revenue += apt.total_amount || 0;

          serviceStats.set(apt.service_type_id, existing);
        }
      });

      return Array.from(serviceStats.values())
        .sort((a, b) => b.appointmentCount - a.appointmentCount);
    } catch (error) {
      console.error('Error getting popular services:', error);
      return [];
    }
  }

  /**
   * Export analytics data to CSV format
   */
  async exportAnalyticsToCSV(
    clinicId: string,
    dateRange: AnalyticsDateRange,
    reportType: 'appointments' | 'revenue' | 'patients' | 'professionals',
  ): Promise<string> {
    try {
      let csvContent = '';

      switch (reportType) {
        case 'appointments':
          const appointmentMetrics = await this.getAppointmentMetrics(clinicId, dateRange);
          csvContent = this.convertAppointmentMetricsToCSV(appointmentMetrics);
          break;
        case 'revenue':
          const revenueMetrics = await this.getRevenueMetrics(clinicId, dateRange);
          csvContent = this.convertRevenueMetricsToCSV(revenueMetrics);
          break;
        case 'patients':
          const patientAnalytics = await this.getPatientAnalytics(clinicId, dateRange);
          csvContent = this.convertPatientAnalyticsToCSV(patientAnalytics);
          break;
        case 'professionals':
          const professionalPerformance = await this.getProfessionalPerformance(
            clinicId,
            dateRange,
          );
          csvContent = this.convertProfessionalPerformanceToCSV(professionalPerformance);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return csvContent;
    } catch (error) {
      console.error('Error exporting analytics to CSV:', error);
      throw error;
    }
  }

  private convertAppointmentMetricsToCSV(metrics: AppointmentMetrics): string {
    const headers = ['Métrica', 'Valor'];
    const rows = [
      ['Total de Agendamentos', metrics.totalAppointments.toString()],
      ['Agendamentos Concluídos', metrics.completedAppointments.toString()],
      ['Agendamentos Cancelados', metrics.cancelledAppointments.toString()],
      ['Faltas', metrics.noShowAppointments.toString()],
      ['Taxa de Conclusão (%)', metrics.completionRate.toFixed(2)],
      ['Taxa de Cancelamento (%)', metrics.cancellationRate.toFixed(2)],
      ['Taxa de Faltas (%)', metrics.noShowRate.toFixed(2)],
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertRevenueMetricsToCSV(metrics: RevenueMetrics): string {
    const headers = ['Serviço', 'Receita Total', 'Quantidade', 'Ticket Médio', 'Percentual'];
    const rows = metrics.revenueByService.map(service => [
      service.serviceName,
      service.totalRevenue.toFixed(2),
      service.appointmentCount.toString(),
      service.averagePrice.toFixed(2),
      service.percentage.toFixed(2) + '%',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertPatientAnalyticsToCSV(analytics: PatientAnalytics): string {
    const headers = ['Paciente', 'Frequência', 'Total Gasto', 'Última Visita'];
    const rows = analytics.topPatientsByFrequency.map(patient => [
      patient.patientName,
      patient.appointmentCount.toString(),
      patient.totalSpent.toFixed(2),
      format(patient.lastVisit, 'dd/MM/yyyy'),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertProfessionalPerformanceToCSV(performance: ProfessionalPerformance[]): string {
    const headers = [
      'Profissional',
      'Total Agendamentos',
      'Concluídos',
      'Taxa Cancelamento (%)',
      'Receita Total',
    ];
    const rows = performance.map(prof => [
      prof.professionalName,
      prof.totalAppointments.toString(),
      prof.completedAppointments.toString(),
      prof.cancellationRate.toFixed(2),
      prof.totalRevenue.toFixed(2),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const analyticsService = new AnalyticsService();
