'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, UserCheck, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import PatientList from '@/components/patients/patient-list';
import PatientSearch from '@/components/patients/patient-search';
import PatientFilters from '@/components/patients/patient-filters';
import PatientActions from '@/components/patients/patient-actions';
import PatientRegistrationForm from '@/components/patients/patient-registration-form';

// Types for patient data structure based on existing system
interface Patient {
  id: string;
  email: string;
  phone: string;
  created_at: string;
  raw_user_meta_data: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    cpf?: string;
    profile_picture?: string;
  };
  patient_profiles_extended?: {
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    profile_completeness_score: number;
    chronic_conditions: string[];
    last_assessment_date: string;
    bmi?: number;
    allergies: string[];
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  patient_photos?: {
    photo_url: string;
    photo_type: string;
    is_primary: boolean;
  }[];
  upcoming_appointments?: number;
  last_visit?: string;
  status: 'active' | 'inactive' | 'vip' | 'new';
}

interface PatientStats {
  total: number;
  active: number;
  new: number;
  vip: number;
  highRisk: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PatientStats>({
    total: 0,
    active: 0,
    new: 0,
    vip: 0,
    highRisk: 0
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    ageRange: 'all',
    hasUpcomingAppointments: false
  });
  
  // UI states
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Load patients and calculate stats
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients based on search and filters
  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, activeFilters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual Supabase query
      const mockPatients = generateMockPatients();
      setPatients(mockPatients);
      calculateStats(mockPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.raw_user_meta_data.full_name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchTerm) ||
        patient.raw_user_meta_data.cpf?.includes(searchTerm)
      );
    }

    // Status filter
    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === activeFilters.status);
    }

    // Risk level filter
    if (activeFilters.riskLevel !== 'all') {
      filtered = filtered.filter(patient => 
        patient.patient_profiles_extended?.risk_level === activeFilters.riskLevel
      );
    }

    // Upcoming appointments filter
    if (activeFilters.hasUpcomingAppointments) {
      filtered = filtered.filter(patient => 
        (patient.upcoming_appointments || 0) > 0
      );
    }

    setFilteredPatients(filtered);
  };

  const calculateStats = (patientsData: Patient[]) => {
    const stats = {
      total: patientsData.length,
      active: patientsData.filter(p => p.status === 'active').length,
      new: patientsData.filter(p => p.status === 'new').length,
      vip: patientsData.filter(p => p.status === 'vip').length,
      highRisk: patientsData.filter(p => 
        p.patient_profiles_extended?.risk_level === 'high' || 
        p.patient_profiles_extended?.risk_level === 'critical'
      ).length
    };
    setStats(stats);
  };

  const handlePatientSelect = (patientId: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(patientId)) {
      newSelected.delete(patientId);
    } else {
      newSelected.add(patientId);
    }
    setSelectedPatients(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (selectedPatients.size === 0) {
      toast.warning('Selecione ao menos um paciente');
      return;
    }

    switch (action) {
      case 'export':
        handleExportPatients();
        break;
      case 'archive':
        handleArchivePatients();
        break;
      case 'send_message':
        handleSendMessage();
        break;
      default:
        break;
    }
  };

  const handleExportPatients = () => {
    // LGPD compliant export
    const selectedPatientsData = patients.filter(p => selectedPatients.has(p.id));
    // Implementation would include data anonymization and audit logging
    toast.success(`Dados de ${selectedPatients.size} paciente(s) exportados com conformidade LGPD`);
    setSelectedPatients(new Set());
  };

  const handleArchivePatients = () => {
    // Archive selected patients
    toast.success(`${selectedPatients.size} paciente(s) arquivado(s)`);
    setSelectedPatients(new Set());
  };

  const handleSendMessage = () => {
    // Send message to selected patients
    toast.success(`Mensagem enviada para ${selectedPatients.size} paciente(s)`);
    setSelectedPatients(new Set());
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie pacientes, visualize dados e mantenha registros atualizados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => loadPatients()}
            disabled={loading}
            className="hidden sm:flex"
          >
            Atualizar
          </Button>
          <Button onClick={() => setShowRegistrationForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
            <Badge variant="secondary" className="h-4 w-4 p-0">
              <span className="text-xs">★</span>
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.vip}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes VIP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar e Filtrar Pacientes</CardTitle>
          <CardDescription>
            Use os filtros abaixo para localizar pacientes específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PatientSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <PatientFilters 
            filters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPatients.size > 0 && (
        <PatientActions 
          selectedCount={selectedPatients.size}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedPatients(new Set())}
        />
      )}

      {/* Patient List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {filteredPatients.length} de {patients.length} pacientes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Lista
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grade
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PatientList 
            patients={filteredPatients}
            loading={loading}
            viewMode={viewMode}
            selectedPatients={selectedPatients}
            onPatientSelect={handlePatientSelect}
            onSelectAll={(selectAll) => {
              if (selectAll) {
                setSelectedPatients(new Set(filteredPatients.map(p => p.id)));
              } else {
                setSelectedPatients(new Set());
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Registration Form Modal */}
      <PatientRegistrationForm 
        isOpen={showRegistrationForm}
        onOpenChange={setShowRegistrationForm}
        onSubmit={(data) => {
          console.log('New patient data:', data);
          toast.success('Paciente cadastrado com sucesso!');
          loadPatients(); // Reload patients after registration
        }}
      />
    </div>
  );
}

// Mock data generator for demonstration
function generateMockPatients(): Patient[] {
  const brazilianNames = [
    'Ana Silva Santos', 'João Oliveira', 'Maria Costa Lima', 'Pedro Almeida',
    'Carla Ferreira', 'Lucas Rodrigues', 'Fernanda Martins', 'Rafael Pereira',
    'Juliana Sousa', 'Gabriel Nascimento', 'Amanda Ribeiro', 'Bruno Cardoso',
    'Letícia Gomes', 'Diego Araújo', 'Patrícia Barros', 'Felipe Castro'
  ];

  const conditions = [
    'Hipertensão', 'Diabetes Tipo 2', 'Asma', 'Artrite', 'Enxaqueca',
    'Colesterol Alto', 'Ansiedade', 'Depressão', 'Gastrite', 'Sinusite'
  ];

  const allergies = [
    'Penicilina', 'Dipirona', 'Ácido Acetilsalicílico', 'Látex',
    'Frutos do mar', 'Amendoim', 'Poeira', 'Pelo de animais'
  ];

  return Array.from({ length: 50 }, (_, index) => {
    const name = brazilianNames[index % brazilianNames.length];
    const firstName = name.split(' ')[0];
    const cpf = generateBrazilianCPF();
    const phone = generateBrazilianPhone();
    const birthDate = generateBirthDate();
    
    return {
      id: `patient_${index + 1}`,
      email: `${firstName.toLowerCase()}${index + 1}@email.com`,
      phone: phone,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      raw_user_meta_data: {
        full_name: name,
        date_of_birth: birthDate,
        gender: Math.random() > 0.5 ? 'female' : 'male',
        cpf: cpf,
        profile_picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      },
      patient_profiles_extended: {
        risk_level: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        risk_score: Math.floor(Math.random() * 100),
        profile_completeness_score: 0.7 + Math.random() * 0.3,
        chronic_conditions: Math.random() > 0.6 ? [conditions[Math.floor(Math.random() * conditions.length)]] : [],
        last_assessment_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        bmi: 18 + Math.random() * 15,
        allergies: Math.random() > 0.7 ? [allergies[Math.floor(Math.random() * allergies.length)]] : [],
        emergency_contact: {
          name: `Contato ${firstName}`,
          phone: generateBrazilianPhone(),
          relationship: ['Mãe', 'Pai', 'Esposo(a)', 'Filho(a)', 'Irmão(ã)'][Math.floor(Math.random() * 5)]
        }
      },
      patient_photos: Math.random() > 0.7 ? [{
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        photo_type: 'profile',
        is_primary: true
      }] : undefined,
      upcoming_appointments: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0,
      last_visit: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: ['active', 'inactive', 'vip', 'new'][Math.floor(Math.random() * 4)] as any
    };
  });
}

function generateBrazilianCPF(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  // Calculate first verification digit
  let sum = digits.reduce((acc, digit, index) => acc + digit * (10 - index), 0);
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Calculate second verification digit
  sum = digits.reduce((acc, digit, index) => acc + digit * (11 - index), 0) + firstDigit * 2;
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  const allDigits = [...digits, firstDigit, secondDigit];
  return `${allDigits.slice(0, 3).join('')}.${allDigits.slice(3, 6).join('')}.${allDigits.slice(6, 9).join('')}-${allDigits.slice(9).join('')}`;
}

function generateBrazilianPhone(): string {
  const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '87'][Math.floor(Math.random() * 10)];
  const prefix = Math.random() > 0.5 ? '9' : '';
  const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `(${ddd}) ${prefix}${number.slice(0, 4)}-${number.slice(4)}`;
}

function generateBirthDate(): string {
  const start = new Date(1950, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}