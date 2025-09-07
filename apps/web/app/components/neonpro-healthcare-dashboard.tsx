"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  Textarea,
} from "@neonpro/ui";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";

import {
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  DollarSign,
  Download,
  Edit,
  FileText,
  Home,
  Key,
  LineChart,
  Mail,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Plus,
  Search,
  Settings,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

// Constants for time calculations
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const DEFAULT_TIMEOUT_MS = 1000;

interface NeonProDashboardProps {
  userId: string;
  tenantId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Activity {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean>;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  trend: "up" | "down" | "stable";
  format: "number" | "percentage" | "currency";
  icon: React.ComponentType<{ className?: string; }>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: User;
  dueDate: Date;
  tags: string[];
  progress: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed";
  progress: number;
  startDate: Date;
  endDate: Date;
  team: User[];
  budget: number;
  spent: number;
  tasks: Task[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

// AI Enhancement Types
interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "alert" | "trend";
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: "low" | "medium" | "high" | "critical";
  category: "patient-flow" | "resource" | "efficiency" | "compliance";
  data: unknown;
  timestamp: Date;
  actionable: boolean;
}

type SmartMetric = Metric & {
  prediction?: {
    value: number;
    confidence: number;
    timeframe: string;
  };
  aiInsight?: string;
  recommendation?: string;
};

interface FeatureFlags {
  aiInsights: boolean;
  predictiveAnalytics: boolean;
  realTimeAlerts: boolean;
  aiRecommendations: boolean;
  smartMetrics: boolean;
}

interface AIState {
  insights: AIInsight[];
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  featureFlags: FeatureFlags;
}

type AIAction =
  | { type: "SET_INSIGHTS"; payload: AIInsight[]; }
  | { type: "ADD_INSIGHT"; payload: AIInsight; }
  | { type: "SET_LOADING"; payload: boolean; }
  | { type: "SET_ERROR"; payload: string | null; }
  | { type: "UPDATE_FEATURE_FLAGS"; payload: Partial<FeatureFlags>; }
  | { type: "SET_LAST_UPDATE"; payload: Date; };

// AI Context - Removed unused AIContext

// AI Reducer
const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case "SET_INSIGHTS": {
      return { ...state, insights: action.payload, lastUpdate: new Date() };
    }
    case "ADD_INSIGHT": {
      return {
        ...state,
        insights: [...state.insights, action.payload],
        lastUpdate: new Date(),
      };
    }
    case "SET_LOADING": {
      return { ...state, isLoading: action.payload };
    }
    case "SET_ERROR": {
      return { ...state, error: action.payload };
    }
    case "UPDATE_FEATURE_FLAGS": {
      return {
        ...state,
        featureFlags: { ...state.featureFlags, ...action.payload },
      };
    }
    case "SET_LAST_UPDATE": {
      return { ...state, lastUpdate: action.payload };
    }
    default: {
      return state;
    }
  }
};

// Initial AI State
const initialAIState: AIState = {
  insights: [],
  isLoading: false,
  lastUpdate: null,
  error: null,
  featureFlags: {
    aiInsights: true,
    predictiveAnalytics: true,
    realTimeAlerts: true,
    aiRecommendations: true,
    smartMetrics: true,
  },
};

// AI Hook - Removed unused useAIState function

// Mock AI Data
const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: "insight-1",
    type: "prediction",
    title: "Pico de Demanda Previsto",
    description: "Aumento de 15% na demanda de consultas para próxima semana",
    confidence: 85,
    impact: "medium",
    category: "patient-flow",
    data: { increase: 15, timeframe: "next_week" },
    timestamp: new Date(),
    actionable: true,
  },
  {
    id: "insight-2",
    type: "alert",
    title: "Recurso Sub-utilizado",
    description: "Sala 3 teve apenas 60% de ocupação nos últimos 7 dias",
    confidence: 92,
    impact: "low",
    category: "resource",
    data: { room: "Sala 3", utilization: 60 },
    timestamp: new Date(),
    actionable: true,
  },
  {
    id: "insight-3",
    type: "recommendation",
    title: "Otimização de Agendamento",
    description: "Redistribuir horários pode reduzir tempo de espera em 22%",
    confidence: 78,
    impact: "high",
    category: "efficiency",
    data: { reduction: 22, action: "reschedule" },
    timestamp: new Date(),
    actionable: true,
  },
];

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    avatar: "/avatars/joao.jpg",
    role: "Desenvolvedor",
    department: "Tecnologia",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@empresa.com",
    avatar: "/avatars/maria.jpg",
    role: "Designer",
    department: "Design",
    status: "away",
    lastSeen: new Date(
      Date.now() - MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * 30,
    ),
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    role: "Gerente",
    department: "Gestão",
    status: "offline",
    lastSeen: new Date(
      Date.now()
        - MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * 2,
    ),
  },
];

const MOCK_METRICS: Metric[] = [
  {
    id: "revenue",
    label: "Receita Mensal",
    value: 125_000,
    previousValue: 115_000,
    change: 8.7,
    trend: "up",
    format: "currency",
    icon: DollarSign,
  },
  {
    id: "users",
    label: "Usuários Ativos",
    value: 2840,
    previousValue: 2650,
    change: 7.2,
    trend: "up",
    format: "number",
    icon: Users,
  },
  {
    id: "conversion",
    label: "Taxa de Conversão",
    value: 3.2,
    previousValue: 2.8,
    change: 14.3,
    trend: "up",
    format: "percentage",
    icon: Target,
  },
  {
    id: "satisfaction",
    label: "Satisfação do Cliente",
    value: 4.8,
    previousValue: 4.6,
    change: 4.3,
    trend: "up",
    format: "number",
    icon: Star,
  },
];

export default function NeonProHealthcareDashboard({
  userId: _userId,
  tenantId: _tenantId,
}: NeonProDashboardProps) {
  // Removed unused state - selectedDate functionality not implemented yet
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // AI State Management
  const [aiState, aiDispatch] = useReducer(aiReducer, initialAIState);

  // AI Hook for accessing context  };

  useEffect(() => {
    // Simular carregamento de dados e AI insights
    const loadData = async () => {
      setLoading(true);
      aiDispatch({ type: "SET_LOADING", payload: true });

      try {
        // Simular carregamento de dados principais
        await new Promise((resolve) => setTimeout(resolve, DEFAULT_TIMEOUT_MS));

        // Simular carregamento de insights AI
        await new Promise((resolve) => setTimeout(resolve, 500));
        aiDispatch({ type: "SET_INSIGHTS", payload: MOCK_AI_INSIGHTS });

        setLoading(false);
        aiDispatch({ type: "SET_LOADING", payload: false });
      } catch {
        aiDispatch({
          type: "SET_ERROR",
          payload: "Erro ao carregar insights AI",
        });
        setLoading(false);
        aiDispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  // Real-time AI updates simulation
  useEffect(() => {
    if (!aiState.featureFlags.realTimeAlerts) {
      return;
    }

    const interval = setInterval(() => {
      // Simular atualizações em tempo real
      const randomInsight = MOCK_AI_INSIGHTS[Math.floor(Math.random() * MOCK_AI_INSIGHTS.length)];
      const updatedInsight = {
        ...randomInsight,
        id: `${randomInsight.id}-${Date.now()}`,
        timestamp: new Date(),
      };

      if (Math.random() > 0.7) {
        // 30% chance de nova insight
        aiDispatch({ type: "ADD_INSIGHT", payload: updatedInsight });
      }
    }, 30_000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [aiState.featureFlags.realTimeAlerts]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  const getMetricIcon = useCallback((metric: Metric) => {
    const { icon: Icon } = metric;
    return <Icon className="h-4 w-4" />;
  }, []);

  const getChangeColor = useCallback((change: number) => {
    if (change > 0) {
      return "text-green-600";
    }
    if (change < 0) {
      return "text-red-600";
    }
    return "text-gray-600";
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "bg-green-100 text-green-800",
      offline: "bg-gray-100 text-gray-800",
      away: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      "in-progress": "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={variants[status as keyof typeof variants]
          || "bg-gray-100 text-gray-800"}
      >
        {status}
      </Badge>
    );
  };

  // AI Component Functions
  const SmartMetricCard = useMemo(
    () => ({ metric }: { metric: Metric; }) => {
      const smartMetric = metric as SmartMetric;
      const { prediction } = smartMetric;

      return (
        <Card className="relative">
          {aiState.featureFlags.smartMetrics && prediction && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs" variant="outline">
                <Brain className="mr-1 h-3 w-3" />
                AI
              </Badge>
            </div>
          )}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {metric.label}
            </CardTitle>
            {getMetricIcon(metric)}
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {metric.format === "currency" && formatCurrency(metric.value)}
              {metric.format === "percentage"
                && formatPercentage(metric.value)}
              {metric.format === "number" && metric.value.toLocaleString()}
            </div>
            <p className={`text-xs ${getChangeColor(metric.change)}`}>
              {metric.change > 0 ? "+" : ""}
              {metric.change.toFixed(1)}% desde o período anterior
            </p>
            {aiState.featureFlags.predictiveAnalytics && prediction && (
              <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-2">
                <p className="text-blue-700 text-xs">
                  <TrendingUp className="mr-1 inline h-3 w-3" />
                  Previsão: {formatPercentage(prediction.confidence)} de confiança
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    },
    [
      aiState.featureFlags,
      formatCurrency,
      formatPercentage,
      getChangeColor,
      getMetricIcon,
    ],
  );

  const AIInsightWidget = useCallback(({ insight }: { insight: AIInsight; }) => {
    const getInsightIcon = () => {
      switch (insight.type) {
        case "prediction": {
          return <TrendingUp className="h-4 w-4" />;
        }
        case "recommendation": {
          return <Zap className="h-4 w-4" />;
        }
        case "alert": {
          return <Bell className="h-4 w-4" />;
        }
        case "trend": {
          return <BarChart3 className="h-4 w-4" />;
        }
        default: {
          return <Brain className="h-4 w-4" />;
        }
      }
    };

    const getImpactColor = () => {
      switch (insight.impact) {
        case "critical": {
          return "border-red-500 bg-red-50";
        }
        case "high": {
          return "border-orange-500 bg-orange-50";
        }
        case "medium": {
          return "border-yellow-500 bg-yellow-50";
        }
        case "low": {
          return "border-blue-500 bg-blue-50";
        }
        default: {
          return "border-gray-500 bg-gray-50";
        }
      }
    };

    return (
      <Card className={`${getImpactColor()} border-l-4`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-sm">
              {getInsightIcon()}
              <span className="ml-2">{insight.title}</span>
            </CardTitle>
            <Badge className="text-xs" variant="outline">
              {insight.confidence}% confiança
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-gray-700 text-sm">{insight.description}</p>
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>{insight.category}</span>
            <span>{format(insight.timestamp, "HH:mm", { locale: ptBR })}</span>
          </div>
          {insight.actionable && (
            <Button className="mt-2 w-full" size="sm" variant="outline">
              Agir sobre esta recomendação
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2" />
          <p className="text-gray-600 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size="sm"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-2xl text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="w-64 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                value={searchQuery}
              />
            </div>

            <Button size="sm" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>

            <Avatar>
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              animate={{ x: 0, opacity: 1 }}
              className="min-h-screen w-64 bg-white shadow-lg"
              exit={{ x: -300, opacity: 0 }}
              initial={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="p-6">
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                    variant={activeTab === "overview" ? "default" : "ghost"}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Visão Geral
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("analytics")}
                    variant={activeTab === "analytics" ? "default" : "ghost"}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  {aiState.featureFlags.aiInsights && (
                    <Button
                      className="w-full justify-start"
                      onClick={() => setActiveTab("ai-insights")}
                      variant={activeTab === "ai-insights" ? "default" : "ghost"}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      IA Insights
                      {aiState.insights.filter((i) => i.impact === "critical")
                            .length > 0 && (
                        <Badge className="ml-auto" variant="destructive">
                          {aiState.insights.filter(
                            (i) => i.impact === "critical",
                          ).length}
                        </Badge>
                      )}
                    </Button>
                  )}
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("projects")}
                    variant={activeTab === "projects" ? "default" : "ghost"}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Projetos
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("tasks")}
                    variant={activeTab === "tasks" ? "default" : "ghost"}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Tarefas
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("team")}
                    variant={activeTab === "team" ? "default" : "ghost"}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Equipe
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                    variant={activeTab === "settings" ? "default" : "ghost"}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs onValueChange={setActiveTab} value={activeTab}>
            {/* Overview Tab */}
            <TabsContent className="space-y-6" value="overview">
              {/* Enhanced Metrics Cards with AI */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_METRICS.map((metric) => <SmartMetricCard key={metric.id} metric={metric} />)}
              </div>

              {/* AI Insights Section */}
              {aiState.featureFlags.aiInsights
                && aiState.insights.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      Insights Inteligentes
                    </h3>
                    <Badge variant="outline">
                      <Brain className="mr-1 h-3 w-3" />
                      AI Ativo
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {aiState.insights.slice(0, 3).map((insight) => (
                      <AIInsightWidget insight={insight} key={insight.id} />
                    ))}
                  </div>
                </div>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita por Período</CardTitle>
                    <CardDescription>
                      Comparação dos últimos 6 meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-80 items-center justify-center text-gray-400">
                      <BarChart3 className="h-12 w-12" />
                      <span className="ml-2">Gráfico de receita</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Usuários</CardTitle>
                    <CardDescription>Por categoria de uso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-80 items-center justify-center text-gray-400">
                      <PieChart className="h-12 w-12" />
                      <span className="ml-2">Gráfico de pizza</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>Últimas ações dos usuários</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div className="flex items-center space-x-4" key={i}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            Usuário {i} executou uma ação importante
                          </p>
                          <p className="text-gray-500 text-xs">
                            há {i} minuto{i > 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="outline">Nova</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent className="space-y-6" value="analytics">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Analytics</h2>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={setFilterStatus} value={filterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tendências de Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-96 items-center justify-center text-gray-400">
                      <LineChart className="h-16 w-16" />
                      <span className="ml-2">Gráfico de linha</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Metas do Mês</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Receita", current: 85, target: 100 },
                      { label: "Usuários", current: 92, target: 100 },
                      { label: "Satisfação", current: 78, target: 100 },
                    ].map((goal, i) => (
                      <div className="space-y-2" key={i}>
                        <div className="flex justify-between text-sm">
                          <span>{goal.label}</span>
                          <span>{goal.current}%</span>
                        </div>
                        <Progress className="h-2" value={goal.current} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            {aiState.featureFlags.aiInsights && (
              <TabsContent className="space-y-6" value="ai-insights">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center font-bold text-3xl">
                    <Brain className="mr-3 h-8 w-8 text-blue-600" />
                    Insights Inteligentes
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={aiState.isLoading ? "secondary" : "default"}
                    >
                      {aiState.isLoading ? "Atualizando..." : "Ativo"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar IA
                    </Button>
                  </div>
                </div>

                {/* AI Insights Dashboard */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Critical Alerts */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bell className="mr-2 h-5 w-5 text-red-500" />
                        Alertas Críticos
                      </CardTitle>
                      <CardDescription>
                        Situações que requerem atenção imediata
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiState.insights
                          .filter((insight) =>
                            insight.impact === "critical"
                          )
                          .slice(0, 3)
                          .map((insight) => (
                            <AIInsightWidget
                              insight={insight}
                              key={insight.id}
                            />
                          ))}
                        {aiState.insights.filter(
                              (insight) => insight.impact === "critical",
                            ).length === 0 && (
                          <div className="flex h-32 items-center justify-center text-gray-500">
                            <div className="text-center">
                              <Brain className="mx-auto mb-2 h-8 w-8" />
                              <p>Nenhum alerta crítico no momento</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumo de Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Eficiência Operacional</span>
                          <span className="font-semibold text-green-600">
                            92%
                          </span>
                        </div>
                        <Progress className="h-2" value={92} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Precisão de Previsões</span>
                          <span className="font-semibold text-blue-600">
                            87%
                          </span>
                        </div>
                        <Progress className="h-2" value={87} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Satisfação com IA</span>
                          <span className="font-semibold text-purple-600">
                            94%
                          </span>
                        </div>
                        <Progress className="h-2" value={94} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* All AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Todas as Recomendações</CardTitle>
                    <CardDescription>
                      Insights e recomendações organizados por categoria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {aiState.insights.map((insight) => (
                        <AIInsightWidget insight={insight} key={insight.id} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Projects Tab */}
            <TabsContent className="space-y-6" value="projects">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Projetos</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do projeto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Nome do Projeto</Label>
                        <Input id="project-name" placeholder="Digite o nome" />
                      </div>
                      <div>
                        <Label htmlFor="project-desc">Descrição</Label>
                        <Textarea
                          id="project-desc"
                          placeholder="Descreva o projeto"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="start-date">Data de Início</Label>
                          <Input id="start-date" type="date" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="end-date">Data de Término</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancelar</Button>
                        <Button>Criar Projeto</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Projeto {i}</CardTitle>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Descrição do projeto {i}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.floor(Math.random() * 100)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 100)} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="-space-x-2 flex">
                            {[1, 2, 3].map((j) => (
                              <Avatar
                                className="h-6 w-6 border-2 border-white"
                                key={j}
                              >
                                <AvatarFallback className="text-xs">
                                  U{j}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {getStatusBadge(
                            ["planning", "active", "on-hold", "completed"][
                              Math.floor(Math.random() * 4)
                            ],
                          )}
                        </div>

                        <div className="text-gray-500 text-sm">
                          Entrega: {format(
                            new Date(
                              Date.now()
                                + Math.random() * 30 * 24 * 60 * 60 * 1000,
                            ),
                            "dd/MM/yyyy",
                            {
                              locale: ptBR,
                            },
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent className="space-y-6" value="tasks">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Tarefas</h2>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={setFilterStatus} value={filterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="in-progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Tarefa
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarefa</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="font-medium">Tarefa {i}</p>
                              <p className="text-gray-500 text-sm">
                                Descrição da tarefa {i}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  U{i}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">Usuário {i}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              ["pending", "in-progress", "completed"][
                                Math.floor(Math.random() * 3)
                              ],
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              ["low", "medium", "high", "urgent"][
                                Math.floor(Math.random() * 4)
                              ],
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(
                              new Date(
                                Date.now()
                                  + Math.random() * 14 * 24 * 60 * 60 * 1000,
                              ),
                              "dd/MM",
                              {
                                locale: ptBR,
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent className="space-y-6" value="team">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Equipe</h2>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar Membro
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_USERS.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <CardDescription>{user.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">Status</span>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">
                            Departamento
                          </span>
                          <span className="text-sm">{user.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">
                            Último acesso
                          </span>
                          <span className="text-sm">
                            {format(user.lastSeen, "dd/MM HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            <Mail className="mr-1 h-4 w-4" />
                            Email
                          </Button>
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent className="space-y-6" value="ai-insights">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center font-bold text-3xl">
                  <Brain className="mr-3 h-8 w-8 text-blue-600" />
                  IA Insights
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-50 text-blue-700" variant="outline">
                    {aiState.insights.length} insights ativos
                  </Badge>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Relatório
                  </Button>
                </div>
              </div>

              {/* Feature Flags Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Controles de IA</CardTitle>
                  <CardDescription>
                    Configure as funcionalidades de inteligência artificial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="ai-insights-switch"
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <Switch
                          id="ai-insights-switch"
                          checked={aiState.featureFlags.aiInsights}
                          onCheckedChange={(checked) =>
                            aiDispatch({
                              type: "UPDATE_FEATURE_FLAGS",
                              payload: { aiInsights: checked },
                            })}
                        />
                        AI Insights
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="predictive-analytics-switch"
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <Switch
                          id="predictive-analytics-switch"
                          checked={aiState.featureFlags.predictiveAnalytics}
                          onCheckedChange={(checked) =>
                            aiDispatch({
                              type: "UPDATE_FEATURE_FLAGS",
                              payload: { predictiveAnalytics: checked },
                            })}
                        />
                        Análise Preditiva
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="realtime-alerts-switch"
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <Switch
                          id="realtime-alerts-switch"
                          checked={aiState.featureFlags.realTimeAlerts}
                          onCheckedChange={(checked) =>
                            aiDispatch({
                              type: "UPDATE_FEATURE_FLAGS",
                              payload: { realTimeAlerts: checked },
                            })}
                        />
                        Alertas em Tempo Real
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="smart-metrics-switch"
                        className="flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <Switch
                          id="smart-metrics-switch"
                          checked={aiState.featureFlags.smartMetrics}
                          onCheckedChange={(checked) =>
                            aiDispatch({
                              type: "UPDATE_FEATURE_FLAGS",
                              payload: { smartMetrics: checked },
                            })}
                        />
                        Métricas Inteligentes
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All AI Insights */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Todos os Insights</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {aiState.insights.map((insight) => (
                    <AIInsightWidget insight={insight} key={insight.id} />
                  ))}
                </div>
              </div>

              {/* Performance Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle>Monitoramento de Performance</CardTitle>
                  <CardDescription>Status dos algoritmos de IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Modelo de Predição de Demanda
                      </span>
                      <Badge
                        className="bg-green-100 text-green-800"
                        variant="default"
                      >
                        Ativo • 97% precisão
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Otimizador de Recursos</span>
                      <Badge
                        className="bg-green-100 text-green-800"
                        variant="default"
                      >
                        Ativo • 92% eficiência
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Detector de Anomalias</span>
                      <Badge variant="secondary">
                        Standby • Aguardando dados
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent className="space-y-6" value="settings">
              <h2 className="font-bold text-3xl">Configurações</h2>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências Gerais</CardTitle>
                    <CardDescription>
                      Configure suas preferências do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">Notificações</Label>
                        <p className="text-gray-500 text-sm">
                          Receber notificações em tempo real
                        </p>
                      </div>
                      <Switch id="notifications" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode">Modo Escuro</Label>
                        <p className="text-gray-500 text-sm">
                          Usar tema escuro
                        </p>
                      </div>
                      <Switch id="dark-mode" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save">Salvamento Automático</Label>
                        <p className="text-gray-500 text-sm">
                          Salvar alterações automaticamente
                        </p>
                      </div>
                      <Switch defaultChecked id="auto-save" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>
                      Gerencie suas configurações de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa">Autenticação em Duas Etapas</Label>
                        <p className="text-gray-500 text-sm">
                          Adicionar camada extra de segurança
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="session-timeout">
                          Timeout de Sessão
                        </Label>
                        <p className="text-gray-500 text-sm">
                          Deslogar automaticamente após inatividade
                        </p>
                      </div>
                      <Switch defaultChecked id="session-timeout" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-change">Alterar Senha</Label>
                      <Button size="sm" variant="outline">
                        <Key className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
