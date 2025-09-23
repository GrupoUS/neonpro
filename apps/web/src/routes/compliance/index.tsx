/**
 * Compliance Dashboard for Brazilian Aesthetic Clinics
 * Provides comprehensive compliance management for LGPD, ANVISA, and Professional Councils
 */

import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Package,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

export const Route = createFileRoute("/compliance/")({
  component: ComplianceDashboard,
});

interface ComplianceDashboardData {
  complianceScore: number;
  totalAlerts: number;
  totalAssessments: number;
  alertBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceStatus: {
    anvisaActive: number;
    anvisaExpired: number;
    anvisaExpiringSoon: number;
    licensesActive: number;
    licensesExpired: number;
    licensesExpiringSoon: number;
  };
  recentAlerts: any[];
  recentAssessments: any[];
}

function ComplianceDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { icon: TrendingUp, label: "Dashboard", href: "/compliance" },
    { icon: Shield, label: "Avaliações", href: "/compliance/assessments" },
    { icon: FileText, label: "Consentimentos", href: "/compliance/consents" },
    { icon: Users, label: "Solicitações LGPD", href: "/compliance/subject-requests" },
    { icon: AlertTriangle, label: "Incidentes", href: "/compliance/breaches" },
    { icon: Package, label: "ANVISA", href: "/compliance/anvisa" },
    { icon: Bell, label: "Alertas", href: "/compliance/alerts" },
    { icon: FileText, label: "Relatórios", href: "/compliance/reports" },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.complianceManagement.getComplianceDashboard.useQuery({
        clinicId: "current-clinic-id" // This should come from auth context
      });

      if (response.data?.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data?.message || "Erro ao carregar dados do dashboard");
      }
    } catch (err) {
      setError("Erro ao carregar dados do dashboard");
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-100";
    if (score >= 70) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-green-600 bg-green-100";
      case "failed": return "text-red-600 bg-red-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "in_progress": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "passed": return "Aprovado";
      case "failed": return "Reprovado";
      case "pending": return "Pendente";
      case "in_progress": return "Em Andamento";
      case "requires_action": return "Requer Ação";
      default: return status;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical": return "Crítico";
      case "high": return "Alto";
      case "medium": return "Médio";
      case "low": return "Baixo";
      default: return severity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard de compliance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto" />
          <p className="mt-4 text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Compliance</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-8 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-gray-400" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                Dashboard de Compliance
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <Search className="h-6 w-6" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          {/* Compliance Score Overview */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Score de Compliance
                  </h2>
                  <p className="text-gray-600">Visão geral do status de compliance da clínica</p>
                </div>
                <div className="text-right">
                  <div className={`text-4xl font-bold ${getScoreColor(dashboardData.complianceScore)}`}>
                    {dashboardData.complianceScore}%
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(dashboardData.complianceScore)} ${getScoreColor(dashboardData.complianceScore)}`}>
                    {dashboardData.complianceScore >= 90 ? "Excelente" : 
                     dashboardData.complianceScore >= 70 ? "Bom" : "Requer Melhoria"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className={`h-8 w-8 ${getScoreColor(dashboardData.complianceScore)}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Avaliações
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData.totalAssessments}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Alertas Ativos
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData.totalAlerts}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Produtos ANVISA Ativos
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData.complianceStatus.anvisaActive}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Licenças Ativas
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardData.complianceStatus.licensesActive}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Alertas por Severidade
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(dashboardData.alertBreakdown).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          severity === "critical" ? "bg-red-600" :
                          severity === "high" ? "bg-orange-600" :
                          severity === "medium" ? "bg-yellow-600" : "bg-blue-600"
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {getSeverityText(severity)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Status de Compliance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Produtos ANVISA Ativos
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {dashboardData.complianceStatus.anvisaActive}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Produtos Vencendo
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {dashboardData.complianceStatus.anvisaExpiringSoon}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Licenças Profissionais Ativas
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {dashboardData.complianceStatus.licensesActive}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Licenças Vencendo
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {dashboardData.complianceStatus.licensesExpiringSoon}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Alertas Recentes
                </h3>
                <Link
                  to="/compliance/alerts"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver Todos
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData.recentAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity_level)}`}>
                          {getSeverityText(alert.severity_level)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.recentAlerts.length === 0 && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Nenhum alerta recente
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Avaliações Recentes
                </h3>
                <Link
                  to="/compliance/assessments"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver Todas
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData.recentAssessments.slice(0, 5).map((assessment, index) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {assessment.requirement?.name || "Avaliação"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                          {getStatusText(assessment.status)}
                        </span>
                        {assessment.score && (
                          <div className="text-xs text-gray-500 mt-1">
                            Score: {assessment.score}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.recentAssessments.length === 0 && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    Nenhuma avaliação recente
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/compliance/assessments"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Link>
              <Link
                to="/compliance/consents"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Consentimento
              </Link>
              <Link
                to="/compliance/reports"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Link>
              <button
                onClick={() => api.complianceManagement.runAutomatedComplianceChecks.mutate({
                  clinicId: "current-clinic-id"
                })}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Verificar Automaticamente
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}