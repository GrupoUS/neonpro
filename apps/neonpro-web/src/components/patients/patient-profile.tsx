'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Heart,
  Brain,
  Activity,
  AlertTriangle,
  Star,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';

interface PatientProfileProps {
  selectedPatient?: any;
}

interface PatientProfileData {
  patient_id: string;
  demographics: {
    name: string;
    date_of_birth: string;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  medical_history?: {
    conditions?: string[];
    allergies?: string[];
    current_medications?: string[];
  };
  profile_completeness_score: number;
  last_accessed?: string;
  is_active: boolean;
  insights?: {
    risk_factors?: string[];
    recommendations?: string[];
  };
}

export default function PatientProfile({ selectedPatient }: PatientProfileProps) {
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const patient: PatientProfileData | null = selectedPatient;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessStatus = (score: number) => {
    if (score >= 80) return 'Completo';
    if (score >= 60) return 'Parcial';
    return 'Incompleto';
  };

  const loadPatientInsights = async () => {
    if (!patient) return;

    setLoadingInsights(true);
    try {
      const response = await fetch(`/api/patients/profile/${patient.patient_id}/insights`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  React.useEffect(() => {
    if (patient) {
      loadPatientInsights();
    }
  }, [patient]);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum paciente selecionado</h3>
        <p className="text-sm text-muted-foreground">
          Selecione um paciente na busca para visualizar o perfil completo
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold">{patient.demographics.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{calculateAge(patient.demographics.date_of_birth)} anos</span>
              <span>{patient.demographics.gender}</span>
              <span>Nascimento: {formatDate(patient.demographics.date_of_birth)}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={patient.is_active ? "default" : "secondary"}>
                {patient.is_active ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline" className={getCompletenessColor(patient.profile_completeness_score)}>
                {getCompletenessStatus(patient.profile_completeness_score)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Completude do Perfil:</span>
            <span className={`font-bold ${getCompletenessColor(patient.profile_completeness_score)}`}>
              {Math.round(patient.profile_completeness_score)}%
            </span>
          </div>
          <Progress value={patient.profile_completeness_score} className="w-32" />
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.demographics.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.phone}</span>
                </div>
              )}
              
              {patient.demographics.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.email}</span>
                </div>
              )}
              
              {patient.demographics.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.demographics.address}</span>
                </div>
              )}

              {patient.last_accessed && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Último acesso: {formatDate(patient.last_accessed)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {patient.medical_history?.conditions?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Condições</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {patient.medical_history?.allergies?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Alergias</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {patient.medical_history?.current_medications?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Medicações</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          {/* Medical Conditions */}
          {patient.medical_history?.conditions && patient.medical_history.conditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Condições Médicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_history.conditions.map((condition, index) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Allergies */}
          {patient.medical_history?.allergies && patient.medical_history.allergies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alergias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_history.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Medications */}
          {patient.medical_history?.current_medications && patient.medical_history.current_medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Medicações Atuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_history.current_medications.map((medication, index) => (
                    <Badge key={index} variant="secondary">
                      {medication}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Insights de IA</h3>
            <Button variant="outline" onClick={loadPatientInsights} disabled={loadingInsights}>
              {loadingInsights ? (
                <Brain className="h-4 w-4 animate-pulse mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {loadingInsights ? 'Analisando...' : 'Atualizar Insights'}
            </Button>
          </div>

          {insights ? (
            <div className="space-y-4">
              {/* Risk Factors */}
              {insights.risk_factors && insights.risk_factors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Fatores de Risco
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.risk_factors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-blue-500" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Clique em "Atualizar Insights" para gerar análises de IA
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Linha do Tempo
              </CardTitle>
              <CardDescription>
                Histórico de atividades e interações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">
                  Em breve você poderá visualizar todo o histórico de atividades do paciente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
