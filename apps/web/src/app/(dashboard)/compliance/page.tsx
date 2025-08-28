"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Lock,
  Shield,
  Users,
} from "lucide-react";

const complianceItems = [
  {
    id: "lgpd",
    title: "LGPD - Lei Geral de Proteção de Dados",
    description: "Conformidade com a Lei Geral de Proteção de Dados Pessoais",
    status: "compliant",
    progress: 95,
    lastCheck: "2024-01-15",
    issues: 1,
    category: "privacy",
  },
  {
    id: "anvisa",
    title: "ANVISA - Regulamentação Sanitária",
    description:
      "Conformidade com normas da Agência Nacional de Vigilância Sanitária",
    status: "warning",
    progress: 78,
    lastCheck: "2024-01-10",
    issues: 3,
    category: "health",
  },
  {
    id: "cfm",
    title: "CFM - Conselho Federal de Medicina",
    description: "Conformidade com normas do Conselho Federal de Medicina",
    status: "compliant",
    progress: 88,
    lastCheck: "2024-01-12",
    issues: 0,
    category: "medical",
  },
  {
    id: "security",
    title: "Segurança de Dados",
    description: "Políticas de segurança e proteção de informações",
    status: "critical",
    progress: 65,
    lastCheck: "2024-01-08",
    issues: 5,
    category: "security",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "compliant":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "compliant":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "privacy":
      return <Lock className="h-5 w-5" />;
    case "health":
      return <Shield className="h-5 w-5" />;
    case "medical":
      return <Users className="h-5 w-5" />;
    case "security":
      return <Database className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export default function CompliancePage() {
  const overallScore = Math.round(
    complianceItems.reduce((acc, item) => acc + item.progress, 0) /
      complianceItems.length,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitore a conformidade regulatória da sua clínica
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Score Geral de Compliance
          </CardTitle>
          <CardDescription>
            Pontuação baseada em todas as verificações de conformidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Score Atual</span>
                <span>{overallScore}%</span>
              </div>
              <Progress value={overallScore} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {overallScore}%
              </p>
              <p className="text-sm text-gray-500">de 100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Conforme</p>
                <p className="text-lg font-medium text-gray-900">
                  {
                    complianceItems.filter(
                      (item) => item.status === "compliant",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Atenção</p>
                <p className="text-lg font-medium text-gray-900">
                  {
                    complianceItems.filter((item) => item.status === "warning")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Crítico</p>
                <p className="text-lg font-medium text-gray-900">
                  {
                    complianceItems.filter((item) => item.status === "critical")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">
                  Total Issues
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {complianceItems.reduce((acc, item) => acc + item.issues, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Compliance</CardTitle>
          <CardDescription>
            Status detalhado de cada área de conformidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-6 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-md p-3">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {item.title}
                        </h3>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Conformidade</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Última verificação: {item.lastCheck}
                        </div>
                        <div className="flex items-center space-x-4">
                          {item.issues > 0 && (
                            <span className="text-sm text-red-600">
                              {item.issues} issue(s) encontrado(s)
                            </span>
                          )}
                          <Badge className={getStatusColor(item.status)}>
                            {item.status === "compliant" && "Conforme"}
                            {item.status === "warning" && "Atenção"}
                            {item.status === "critical" && "Crítico"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
