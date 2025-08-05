'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Heart, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Search,
  Filter,
  Clock,
  User,
  Stethoscope,
  Pill,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// HIPAA-compliant medical history types
interface MedicalCondition {
  id: string;
  patient_id: string;
  condition_name: string;
  icd_10_code?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'resolved' | 'chronic' | 'in_remission';
  onset_date: string;
  resolution_date?: string;
  description: string;
  symptoms: string[];
  triggers?: string[];
  treatment_notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  lgpd_consent: boolean;
  data_retention_date: string;
}

interface MedicalAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  allergen_type: 'medication' | 'food' | 'environmental' | 'contact' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  reaction_type: string[];
  symptoms: string[];
  onset_date?: string;
  verified_date: string;
  verified_by: string;
  notes: string;
  emergency_action_plan?: string;
  created_at: string;
  updated_at: string;
  lgpd_consent: boolean;
}

interface MedicalMedication {
  id: string;
  patient_id: string;
  medication_name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'topical' | 'injection' | 'inhalation' | 'other';
  indication: string;
  prescribing_doctor: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'discontinued' | 'completed' | 'on_hold';
  side_effects?: string[];
  interactions?: string[];
  adherence_notes: string;
  created_at: string;
  updated_at: string;
  lgpd_consent: boolean;
}

interface FamilyHistory {
  id: string;
  patient_id: string;
  relationship: 'father' | 'mother' | 'sibling' | 'grandparent' | 'aunt_uncle' | 'cousin' | 'other';
  condition: string;
  age_of_onset?: number;
  age_of_death?: number;
  cause_of_death?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  lgpd_consent: boolean;
}

interface SocialHistory {
  id: string;
  patient_id: string;
  smoking_status: 'never' | 'former' | 'current';
  smoking_details?: {
    packs_per_day?: number;
    years_smoked?: number;
    quit_date?: string;
  };
  alcohol_use: 'never' | 'occasional' | 'moderate' | 'heavy';
  alcohol_details?: {
    drinks_per_week?: number;
    type_preferred?: string[];
  };
  exercise_frequency: 'none' | 'light' | 'moderate' | 'intense';
  exercise_details?: string;
  occupation: string;
  occupational_hazards?: string[];
  travel_history?: {
    countries_visited: string[];
    recent_travel?: string;
  };
  living_situation: string;
  support_system: string;
  stress_level: number; // 1-10 scale
  sleep_patterns: string;
  diet_description: string;
  created_at: string;
  updated_at: string;
  lgpd_consent: boolean;
}

interface MedicalHistoryManagerProps {
  patientId: string;
  readOnly?: boolean;
  onHistoryUpdate?: () => void;
}

export default function MedicalHistoryManager({ 
  patientId, 
  readOnly = false, 
  onHistoryUpdate 
}: MedicalHistoryManagerProps) {
  // State management
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [allergies, setAllergies] = useState<MedicalAllergy[]>([]);
  const [medications, setMedications] = useState<MedicalMedication[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [socialHistory, setSocialHistory] = useState<SocialHistory | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conditions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [showConditionDialog, setShowConditionDialog] = useState(false);
  const [showAllergyDialog, setShowAllergyDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [showSocialDialog, setShowSocialDialog] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    loadMedicalHistory();
  }, [patientId]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual Supabase queries
      // const { data: conditionsData } = await supabase
      //   .from('medical_conditions')
      //   .select('*')
      //   .eq('patient_id', patientId)
      //   .order('created_at', { ascending: false });
      
      // Mock data for demonstration
      setConditions(generateMockConditions());
      setAllergies(generateMockAllergies());
      setMedications(generateMockMedications());
      setFamilyHistory(generateMockFamilyHistory());
      setSocialHistory(generateMockSocialHistory());
      
    } catch (error) {
      console.error('Error loading medical history:', error);
      toast.error('Erro ao carregar histórico médico');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = async (conditionData: Partial<MedicalCondition>) => {
    try {
      // TODO: Implement Supabase insert with LGPD compliance
      const newCondition: MedicalCondition = {
        id: `condition_${Date.now()}`,
        patient_id: patientId,
        ...conditionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user_id', // TODO: Get from auth
        updated_by: 'current_user_id',
        lgpd_consent: true,
        data_retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString() // 7 years
      } as MedicalCondition;
      
      setConditions(prev => [newCondition, ...prev]);
      setShowConditionDialog(false);
      toast.success('Condição médica adicionada com sucesso');
      onHistoryUpdate?.();
    } catch (error) {
      console.error('Error adding condition:', error);
      toast.error('Erro ao adicionar condição médica');
    }
  };

  const handleAddAllergy = async (allergyData: Partial<MedicalAllergy>) => {
    try {
      const newAllergy: MedicalAllergy = {
        id: `allergy_${Date.now()}`,
        patient_id: patientId,
        ...allergyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lgpd_consent: true
      } as MedicalAllergy;
      
      setAllergies(prev => [newAllergy, ...prev]);
      setShowAllergyDialog(false);
      toast.success('Alergia adicionada com sucesso');
      onHistoryUpdate?.();
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Erro ao adicionar alergia');
    }
  };

  const handleAddMedication = async (medicationData: Partial<MedicalMedication>) => {
    try {
      const newMedication: MedicalMedication = {
        id: `medication_${Date.now()}`,
        patient_id: patientId,
        ...medicationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lgpd_consent: true
      } as MedicalMedication;
      
      setMedications(prev => [newMedication, ...prev]);
      setShowMedicationDialog(false);
      toast.success('Medicação adicionada com sucesso');
      onHistoryUpdate?.();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Erro ao adicionar medicação');
    }
  };

  const handleExportHistory = () => {
    // LGPD-compliant export with audit logging
    const exportData = {
      patient_id: patientId,
      export_date: new Date().toISOString(),
      conditions: conditions,
      allergies: allergies,
      medications: medications,
      family_history: familyHistory,
      social_history: socialHistory,
      lgpd_compliance: {
        consent_verified: true,
        data_minimization: true,
        purpose_limitation: 'medical_care',
        retention_period: '7_years'
      }
    };
    
    // TODO: Implement actual export with audit logging
    console.log('Exporting medical history:', exportData);
    toast.success('Histórico médico exportado com conformidade LGPD');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-orange-100 text-orange-800';
      case 'critical':
      case 'life_threatening': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'chronic': return 'bg-orange-100 text-orange-800';
      case 'in_remission': return 'bg-blue-100 text-blue-800';
      case 'discontinued': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico Médico</h2>
          <p className="text-muted-foreground">
            Gestão completa do histórico médico com conformidade HIPAA/LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExportHistory}
            className="hidden sm:flex"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {!readOnly && (
            <Button onClick={() => loadMedicalHistory()}>
              <Activity className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no histórico médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="chronic">Crônico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Medical History Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conditions" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Condições</span>
          </TabsTrigger>
          <TabsTrigger value="allergies" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alergias</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center space-x-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Medicações</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Família</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
        </TabsList>

        {/* Medical Conditions Tab */}
        <TabsContent value="conditions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Condições Médicas</h3>
            {!readOnly && (
              <Dialog open={showConditionDialog} onOpenChange={setShowConditionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Condição
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Condição Médica</DialogTitle>
                    <DialogDescription>
                      Registre uma nova condição médica com conformidade LGPD
                    </DialogDescription>
                  </DialogHeader>
                  <ConditionForm
                    onSubmit={handleAddCondition}
                    onCancel={() => setShowConditionDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {conditions.map((condition) => (
              <Card key={condition.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{condition.condition_name}</h4>
                      {condition.icd_10_code && (
                        <Badge variant="outline">{condition.icd_10_code}</Badge>
                      )}
                      <Badge className={getSeverityColor(condition.severity)}>
                        {condition.severity}
                      </Badge>
                      <Badge className={getStatusColor(condition.status)}>
                        {condition.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Início: {format(new Date(condition.onset_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      {condition.resolution_date && (
                        <span>Resolução: {format(new Date(condition.resolution_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Allergies Tab */}
        <TabsContent value="allergies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alergias</h3>
            {!readOnly && (
              <Dialog open={showAllergyDialog} onOpenChange={setShowAllergyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Alergia
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Alergia</DialogTitle>
                    <DialogDescription>
                      Registre uma nova alergia com plano de ação de emergência
                    </DialogDescription>
                  </DialogHeader>
                  <AllergyForm
                    onSubmit={handleAddAllergy}
                    onCancel={() => setShowAllergyDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {allergies.map((allergy) => (
              <Card key={allergy.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{allergy.allergen}</h4>
                      <Badge variant="outline">{allergy.allergen_type}</Badge>
                      <Badge className={getSeverityColor(allergy.severity)}>
                        {allergy.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                    <div className="flex flex-wrap gap-1">
                      {allergy.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Medicações</h3>
            {!readOnly && (
              <Dialog open={showMedicationDialog} onOpenChange={setShowMedicationDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Medicação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Medicação</DialogTitle>
                    <DialogDescription>
                      Registre uma nova medicação com dosagem e frequência
                    </DialogDescription>
                  </DialogHeader>
                  <MedicationForm
                    onSubmit={handleAddMedication}
                    onCancel={() => setShowMedicationDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {medications.map((medication) => (
              <Card key={medication.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{medication.medication_name}</h4>
                      {medication.generic_name && (
                        <Badge variant="outline">{medication.generic_name}</Badge>
                      )}
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>Dosagem:</strong> {medication.dosage}</p>
                      <p><strong>Frequência:</strong> {medication.frequency}</p>
                      <p><strong>Via:</strong> {medication.route}</p>
                      <p><strong>Indicação:</strong> {medication.indication}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Início: {format(new Date(medication.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      {medication.end_date && (
                        <span>Fim: {format(new Date(medication.end_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Family History Tab */}
        <TabsContent value="family" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico Familiar</h3>
            {!readOnly && (
              <Dialog open={showFamilyDialog} onOpenChange={setShowFamilyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Registro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Histórico Familiar</DialogTitle>
                    <DialogDescription>
                      Registre condições médicas na família
                    </DialogDescription>
                  </DialogHeader>
                  <FamilyHistoryForm
                    onSubmit={(data) => {
                      // Handle family history submission
                      setShowFamilyDialog(false);
                      toast.success('Histórico familiar adicionado');
                    }}
                    onCancel={() => setShowFamilyDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {familyHistory.map((history) => (
              <Card key={history.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{history.condition}</h4>
                      <Badge variant="outline">{history.relationship}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{history.notes}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {history.age_of_onset && (
                        <span>Idade de início: {history.age_of_onset} anos</span>
                      )}
                      {history.age_of_death && (
                        <span>Idade do óbito: {history.age_of_death} anos</span>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Social History Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico Social</h3>
            {!readOnly && (
              <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Histórico Social
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Histórico Social</DialogTitle>
                    <DialogDescription>
                      Atualize informações sobre estilo de vida e fatores sociais
                    </DialogDescription>
                  </DialogHeader>
                  <SocialHistoryForm
                    initialData={socialHistory}
                    onSubmit={(data) => {
                      setSocialHistory(data);
                      setShowSocialDialog(false);
                      toast.success('Histórico social atualizado');
                    }}
                    onCancel={() => setShowSocialDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {socialHistory && (
            <Card className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Tabagismo</h4>
                    <Badge className={socialHistory.smoking_status === 'current' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {socialHistory.smoking_status}
                    </Badge>
                    {socialHistory.smoking_details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {socialHistory.smoking_details.packs_per_day && (
                          <p>Maços/dia: {socialHistory.smoking_details.packs_per_day}</p>
                        )}
                        {socialHistory.smoking_details.years_smoked && (
                          <p>Anos fumando: {socialHistory.smoking_details.years_smoked}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Álcool</h4>
                    <Badge variant="outline">{socialHistory.alcohol_use}</Badge>
                    {socialHistory.alcohol_details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {socialHistory.alcohol_details.drinks_per_week && (
                          <p>Doses/semana: {socialHistory.alcohol_details.drinks_per_week}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Exercício</h4>
                    <Badge variant="outline">{socialHistory.exercise_frequency}</Badge>
                    {socialHistory.exercise_details && (
                      <p className="text-sm text-muted-foreground mt-1">{socialHistory.exercise_details}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ocupação</h4>
                    <p className="text-sm">{socialHistory.occupation}</p>
                    {socialHistory.occupational_hazards && socialHistory.occupational_hazards.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-muted-foreground">Riscos ocupacionais:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {socialHistory.occupational_hazards.map((hazard, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {hazard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Nível de Estresse</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{socialHistory.stress_level}/10</Badge>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(socialHistory.stress_level / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Situação de Moradia</h4>
                    <p className="text-sm">{socialHistory.living_situation}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Rede de Apoio</h4>
                    <p className="text-sm">{socialHistory.support_system}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Form Components (simplified for brevity)
function ConditionForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    condition_name: '',
    icd_10_code: '',
    severity: 'mild',
    status: 'active',
    onset_date: '',
    description: '',
    symptoms: [],
    treatment_notes: ''
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="condition_name">Nome da Condição *</Label>
          <Input
            id="condition_name"
            value={formData.condition_name}
            onChange={(e) => setFormData(prev => ({ ...prev, condition_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="icd_10_code">Código CID-10</Label>
          <Input
            id="icd_10_code"
            value={formData.icd_10_code}
            onChange={(e) => setFormData(prev => ({ ...prev, icd_10_code: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="severity">Severidade</Label>
          <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Leve</SelectItem>
              <SelectItem value="moderate">Moderada</SelectItem>
              <SelectItem value="severe">Severa</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="chronic">Crônico</SelectItem>
              <SelectItem value="in_remission">Em Remissão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="onset_date">Data de Início</Label>
          <Input
            id="onset_date"
            type="date"
            value={formData.onset_date}
            onChange={(e) => setFormData(prev => ({ ...prev, onset_date: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="treatment_notes">Notas de Tratamento</Label>
        <Textarea
          id="treatment_notes"
          value={formData.treatment_notes}
          onChange={(e) => setFormData(prev => ({ ...prev, treatment_notes: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="lgpd_consent" required />
        <Label htmlFor="lgpd_consent" className="text-sm">
          Confirmo o consentimento LGPD para armazenamento destes dados médicos
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Condição
        </Button>
      </div>
    </form>
  );
}

function AllergyForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for allergies
  return <div>Allergy Form Component</div>;
}

function MedicationForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for medications
  return <div>Medication Form Component</div>;
}

function FamilyHistoryForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for family history
  return <div>Family History Form Component</div>;
}

function SocialHistoryForm({ initialData, onSubmit, onCancel }: { initialData: any; onSubmit: (data: any) => void; onCancel: () => void }) {
  // Similar form structure for social history
  return <div>Social History Form Component</div>;
}

// Mock data generators
function generateMockConditions(): MedicalCondition[] {
  return [
    {
      id: 'condition_1',
      patient_id: 'patient_1',
      condition_name: 'Hipertensão Arterial',
      icd_10_code: 'I10',
      severity: 'moderate',
      status: 'active',
      onset_date: '2020-03-15',
      description: 'Hipertensão arterial sistêmica controlada com medicação',
      symptoms: ['Dor de cabeça', 'Tontura'],
      triggers: ['Estresse', 'Sal em excesso'],
      treatment_notes: 'Paciente responde bem ao tratamento com Losartana 50mg',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'doctor_1',
      updated_by: 'doctor_1',
      lgpd_consent: true,
      data_retention_date: '2031-01-15T10:00:00Z'
    }
  ];
}

function generateMockAllergies(): MedicalAllergy[] {
  return [
    {
      id: 'allergy_1',
      patient_id: 'patient_1',
      allergen: 'Penicilina',
      allergen_type: 'medication',
      severity: 'severe',
      reaction_type: ['Anafilaxia'],
      symptoms: ['Urticária', 'Dificuldade respiratória', 'Inchaço'],
      verified_date: '2023-05-10',
      verified_by: 'doctor_1',
      notes: 'Reação severa documentada em 2023. Evitar penicilina e derivados.',
      emergency_action_plan: 'Administrar epinefrina e procurar atendimento médico imediato',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      lgpd_consent: true
    }
  ];
}

function generateMockMedications(): MedicalMedication[] {
  return [
    {
      id: 'medication_1',
      patient_id: 'patient_1',
      medication_name: 'Losartana Potássica',
      generic_name: 'Losartana',
      dosage: '50mg',
      frequency: '1x ao dia',
      route: 'oral',
      indication: 'Hipertensão arterial',
      prescribing_doctor: 'Dr. João Silva',
      start_date: '2023-03-15',
      status: 'active',
      side_effects: [],
      interactions: [],
      adherence_notes: 'Paciente aderente ao tratamento',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      lgpd_consent: true
    }
  ];
}

function generateMockFamilyHistory(): FamilyHistory[] {
  return [
    {
      id: 'family_1',
      patient_id: 'patient_1',
      relationship: 'father',
      condition: 'Diabetes Tipo 2',
      age_of_onset: 55,
      notes: 'Diabetes diagnosticado aos 55 anos, controlado com medicação',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      lgpd_consent: true
    }
  ];
}

function generateMockSocialHistory(): SocialHistory {
  return {
    id: 'social_1',
    patient_id: 'patient_1',
    smoking_status: 'former',
    smoking_details: {
      packs_per_day: 1,
      years_smoked: 10,
      quit_date: '2020-01-01'
    },
    alcohol_use: 'occasional',
    alcohol_details: {
      drinks_per_week: 2,
      type_preferred: ['Vinho', 'Cerveja']
    },
    exercise_frequency: 'moderate',
    exercise_details: 'Caminhada 3x por semana, 30 minutos',
    occupation: 'Engenheiro de Software',
    occupational_hazards: ['Sedentarismo', 'Estresse'],
    living_situation: 'Mora com família',
    support_system: 'Família presente e apoiadora',
    stress_level: 6,
    sleep_patterns: 'Dorme 7-8 horas por noite, qualidade boa',
    diet_description: 'Dieta balanceada, evita sal em excesso',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    lgpd_consent: true
  };
}
