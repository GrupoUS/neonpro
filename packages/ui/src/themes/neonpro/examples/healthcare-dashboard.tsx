/**
 * NEONPRO Healthcare Dashboard Example
 * Complete implementation showing all theme components working together
 * Based on TweakCN NEONPRO design patterns
 */

import React, { useState } from "react";
import {
  HealthcareMetricCard,
  AppointmentCalendar,
  PaymentStatusTable,
  TeamMembersList,
} from "../components";
import type {
  HealthcareMetricCardProps,
  Appointment,
  PaymentRecord,
  TeamMember,
} from "../components";

// Mock data for demonstration
const mockMetrics = [
  {
    title: "Receita Mensal",
    value: 15_231.89,
    type: "revenue" as const,
    format: "currency" as const,
    currency: "BRL" as const,
    growth: {
      value: 20.1,
      period: "vs. mês anterior",
      isPositive: true,
    },
    complianceIndicator: {
      type: "LGPD" as const,
      status: "compliant" as const,
    },
  },
  {
    title: "Pacientes Atendidos",
    value: 2350,
    type: "patients" as const,
    format: "number" as const,
    growth: {
      value: 180.1,
      period: "vs. mês anterior",
      isPositive: true,
    },
  },
  {
    title: "Consultas Agendadas",
    value: 127,
    type: "appointments" as const,
    format: "number" as const,
    growth: {
      value: 15.2,
      period: "vs. semana anterior",
      isPositive: true,
    },
  },
  {
    title: "Taxa de Conversão",
    value: 94.5,
    type: "conversion" as const,
    format: "percentage" as const,
    growth: {
      value: -2.1,
      period: "vs. mês anterior",
      isPositive: false,
    },
    complianceIndicator: {
      type: "CFM" as const,
      status: "compliant" as const,
    },
  },
];

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "Maria Silva",
    patientId: "patient-1",
    type: "consulta",
    startTime: new Date("2025-08-28T09:00:00"),
    endTime: new Date("2025-08-28T10:00:00"),
    status: "confirmed",
    professional: "Dr. João Santos",
    room: "Sala 101",
  },
  {
    id: "2",
    patientName: "Carlos Oliveira",
    patientId: "patient-2",
    type: "retorno",
    startTime: new Date("2025-08-28T10:30:00"),
    endTime: new Date("2025-08-28T11:00:00"),
    status: "scheduled",
    professional: "Dr. Ana Costa",
    room: "Sala 102",
  },
  {
    id: "3",
    patientName: "Patricia Fernandes",
    patientId: "patient-3",
    type: "emergencia",
    startTime: new Date("2025-08-28T14:00:00"),
    endTime: new Date("2025-08-28T15:30:00"),
    status: "confirmed",
    professional: "Dr. Roberto Lima",
    room: "Sala Emergency",
  },
  {
    id: "4",
    patientName: "José Martinez",
    patientId: "patient-4",
    type: "cirurgia",
    startTime: new Date("2025-08-29T08:00:00"),
    endTime: new Date("2025-08-29T12:00:00"),
    status: "scheduled",
    professional: "Dr. Marina Rodrigues",
    room: "Centro Cirúrgico",
  },
];

const mockPayments: PaymentRecord[] = [
  {
    id: "pay-1",
    patientName: "Sofia Davis",
    patientEmail: "sofia.davis@example.com",
    amount: 1250,
    currency: "BRL",
    method: "pix",
    status: "success",
    createdAt: new Date("2025-08-27T10:30:00"),
    treatmentType: "Consulta + Botox",
    professionalName: "Dr. João Santos",
    invoiceNumber: "INV-2025-001",
  },
  {
    id: "pay-2",
    patientName: "Jackson Lee",
    patientEmail: "jackson.lee@example.com",
    amount: 850,
    currency: "BRL",
    method: "cartao-credito",
    status: "processing",
    createdAt: new Date("2025-08-27T14:15:00"),
    treatmentType: "Limpeza de Pele",
    professionalName: "Dra. Ana Costa",
    installmentInfo: {
      current: 1,
      total: 3,
    },
  },
  {
    id: "pay-3",
    patientName: "Isabella Nguyen",
    patientEmail: "isabella.nguyen@example.com",
    amount: 2100,
    currency: "BRL",
    method: "boleto",
    status: "pending",
    createdAt: new Date("2025-08-26T16:45:00"),
    treatmentType: "Preenchimento Facial",
    professionalName: "Dr. Roberto Lima",
  },
  {
    id: "pay-4",
    patientName: "Carlos Silva",
    patientEmail: "carlos.silva@example.com",
    amount: 480,
    currency: "BRL",
    method: "convenio",
    status: "failed",
    createdAt: new Date("2025-08-25T09:20:00"),
    treatmentType: "Consulta Dermatológica",
    professionalName: "Dra. Patricia Santos",
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Sofia Davis",
    email: "sofia.davis@neonpro.com",
    role: "owner",
    phone: "+55 11 99999-1234",
    status: "active",
    permissions: ["all"],
    joinedAt: new Date("2024-01-15"),
    lastActive: new Date("2025-08-28T08:30:00"),
  },
  {
    id: "team-2",
    name: "Dr. Jackson Lee",
    email: "jackson.lee@neonpro.com",
    role: "doctor",
    phone: "+55 11 99999-5678",
    crmNumber: "CRM-SP 123456",
    specialties: ["Dermatologia", "Cirurgia Plástica"],
    status: "active",
    permissions: ["patients", "appointments", "treatments"],
    joinedAt: new Date("2024-03-10"),
    lastActive: new Date("2025-08-28T07:45:00"),
  },
  {
    id: "team-3",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@neonpro.com",
    role: "billing",
    phone: "+55 11 99999-9012",
    status: "active",
    permissions: ["billing", "payments", "reports"],
    joinedAt: new Date("2024-02-20"),
    lastActive: new Date("2025-08-27T18:15:00"),
  },
  {
    id: "team-4",
    name: "Ana Costa",
    email: "ana.costa@neonpro.com",
    role: "nurse",
    phone: "+55 11 99999-3456",
    corenNumber: "COREN-SP 654321",
    status: "active",
    permissions: ["patients", "appointments"],
    joinedAt: new Date("2024-05-08"),
    lastActive: new Date("2025-08-28T06:30:00"),
  },
  {
    id: "team-5",
    name: "Roberto Lima",
    email: "roberto.lima@neonpro.com",
    role: "receptionist",
    phone: "+55 11 99999-7890",
    status: "inactive",
    permissions: ["appointments", "patients"],
    joinedAt: new Date("2024-07-12"),
    lastActive: new Date("2025-08-25T17:00:00"),
  },
];

const brazilianHolidays = [
  {
    date: new Date("2025-12-25"),
    name: "Natal",
    type: "national" as const,
  },
  {
    date: new Date("2025-09-07"),
    name: "Independência",
    type: "national" as const,
  },
  {
    date: new Date("2025-10-12"),
    name: "Nossa Senhora Aparecida",
    type: "national" as const,
  },
];

export const HealthcareDashboardExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMetricClick = (metric: any) => {
    console.log("Metric clicked:", metric);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
  };

  const handlePaymentView = (payment: PaymentRecord) => {
    console.log("Payment view:", payment);
  };

  const handleTeamMemberClick = (member: TeamMember) => {
    console.log("Team member clicked:", member);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard NEONPRO Healthcare
        </h1>
        <p className="text-gray-600">
          Sistema completo de gestão para clínicas estéticas brasileiras
        </p>
      </div>

      {/* Metrics Grid - NEONPRO Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockMetrics.map((metric, index) => (
          <HealthcareMetricCard
            key={index}
            {...metric}
            onClick={() => handleMetricClick(metric)}
            className="hover:scale-105 transition-transform"
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointment Calendar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Agenda de Consultas
          </h2>
          <AppointmentCalendar
            appointments={mockAppointments}
            currentDate={new Date()}
            brazilianHolidays={brazilianHolidays}
            showDensityIndicators
            maxAppointmentsPerDay={12}
            firstDayOfWeek={1}
            onDateSelect={setSelectedDate}
            onAppointmentClick={handleAppointmentClick}
            variant="default"
          />

          {selectedDate && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                Data Selecionada: {selectedDate.toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Equipe Médica</h2>
          <TeamMembersList
            members={mockTeamMembers}
            variant="card"
            showActions
            showFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMemberClick={handleTeamMemberClick}
            onAddMember={() => console.log("Add new member")}
          />
        </div>
      </div>

      {/* Payment Status Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Controle de Pagamentos
        </h2>
        <PaymentStatusTable
          payments={mockPayments}
          variant="detailed"
          showFilters
          showExport
          onPaymentView={handlePaymentView}
          onPaymentRefund={(payment) => console.log("Refund:", payment)}
          onExportData={() => console.log("Export payments")}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            🎨 Powered by <strong>TweakCN NEONPRO Healthcare Theme</strong>
          </p>
          <p className="text-sm">
            Designed for Brazilian aesthetic clinics • LGPD Compliant • CFM
            Validated
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              LGPD Compliant
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              CFM Validated
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              ANVISA Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Alternative compact dashboard layout
export const CompactHealthcareDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            NEONPRO Healthcare - Visão Compacta
          </h1>

          {/* Compact Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockMetrics.map((metric, index) => (
              <HealthcareMetricCard
                key={index}
                {...metric}
                size="sm"
                className="min-h-[100px]"
              />
            ))}
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Compact */}
          <div className="lg:col-span-2">
            <AppointmentCalendar
              appointments={mockAppointments.slice(0, 2)}
              variant="compact"
              showDensityIndicators={false}
            />
          </div>

          {/* Team - Compact */}
          <div>
            <TeamMembersList
              members={mockTeamMembers.slice(0, 3)}
              variant="compact"
              showFilters={false}
            />
          </div>
        </div>

        {/* Payments - Compact */}
        <PaymentStatusTable
          payments={mockPayments.slice(0, 5)}
          variant="compact"
          showFilters={false}
        />
      </div>
    </div>
  );
};

export default HealthcareDashboardExample;
