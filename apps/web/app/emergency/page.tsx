'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Scan, 
  Phone, 
  AlertTriangle, 
  Pill, 
  Heart,
  Clock,
  User,
  Wifi,
  WifiOff,
  Shield,
  Calendar,
  Activity,
  MicIcon,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Emergency patient interface for critical medical information
interface EmergencyPatient {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  allergies: Array<{
    type: string;
    severity: 'critical' | 'high' | 'moderate';
    description: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    lastTaken?: string;
  }>;
  contraindications: Array<{
    type: string;
    description: string;
    severity: 'high' | 'moderate' | 'low';
  }>;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }>;
  medicalConditions: Array<{
    condition: string;
    status: 'active' | 'controlled' | 'resolved';
    lastUpdate: string;
  }>;
  lastAccessed: string;
}

// Emergency interface state
interface EmergencyState {
  isOnline: boolean;
  cacheStatus: 'fresh' | 'stale' | 'offline';
  lastSync: string;
  searchQuery: string;
  selectedPatient: EmergencyPatient | null;
  recentPatients: EmergencyPatient[];
  isSearching: boolean;
  voiceActive: boolean;
  scannerActive: boolean;
}

// Emergency search bar component
const EmergencySearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onVoiceToggle: () => void;
  onScannerToggle: () => void;
  isVoiceActive: boolean;
  isScannerActive: boolean;
  isSearching: boolean;
}> = ({ 
  value, 
  onChange, 
  onVoiceToggle, 
  onScannerToggle, 
  isVoiceActive, 
  isScannerActive,
  isSearching 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Card className="border-2 border-red-200 bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          Busca de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar paciente por nome, CPF ou RG..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-10 h-14 text-lg border-2 focus:border-red-500"
              aria-label="Campo de busca de emergência para pacientes"
              aria-describedby="search-help"
              disabled={isSearching}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
              </div>
            )}
          </div>
          
          {/* Voice Command Button */}
          <Button
            size="lg"
            variant={isVoiceActive ? "destructive" : "outline"}
            onClick={onVoiceToggle}
            className="h-14 px-6 border-2"
            aria-label={isVoiceActive ? "Desativar comando de voz" : "Ativar comando de voz"}
            aria-pressed={isVoiceActive}
          >
            <MicIcon className="h-5 w-5 mr-2" />
            {isVoiceActive ? 'Ouvindo...' : 'Voz'}
          </Button>

          {/* Barcode Scanner Button */}
          <Button
            size="lg"
            variant={isScannerActive ? "destructive" : "outline"}
            onClick={onScannerToggle}
            className="h-14 px-6 border-2"
            aria-label={isScannerActive ? "Fechar scanner" : "Abrir scanner de código"}
            aria-pressed={isScannerActive}
          >
            <QrCode className="h-5 w-5 mr-2" />
            Scanner
          </Button>
        </div>
        
        <div id="search-help" className="text-sm text-muted-foreground">
          Digite o nome, CPF ou RG do paciente. Use voz ou scanner para entrada alternativa.
        </div>
      </CardContent>
    </Card>
  );
};

// Critical patient information display
const PatientCriticalInfo: React.FC<{
  patient: EmergencyPatient;
}> = ({ patient }) => {
  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              {patient.name}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              ID: {patient.id}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-x-4">
            <span>CPF: {patient.cpf}</span>
            <span>•</span>
            <span>RG: {patient.rg}</span>
            <span>•</span>
            <span>Nascimento: {patient.birthDate}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Critical Allergies - RED ALERT */}
      <Card className="border-2 border-red-500 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            🔴 ALERGIAS CRÍTICAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.allergies.length > 0 ? (
            <div className="space-y-2">
              {patient.allergies.map((allergy, index) => (
                <Alert key={index} className="border-red-400 bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    <span className="font-bold">{allergy.type}</span>
                    {allergy.severity === 'critical' && (
                      <Badge variant="destructive" className="ml-2">CRÍTICA</Badge>
                    )}
                    <br />
                    {allergy.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-red-600">Nenhuma alergia registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Current Medications - ORANGE */}
      <Card className="border-2 border-orange-500 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-orange-700 flex items-center gap-2">
            <Pill className="h-5 w-5" />
            🟠 MEDICAÇÕES ATUAIS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.medications.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {patient.medications.map((medication, index) => (
                <div key={index} className="p-3 bg-orange-100 rounded-lg border border-orange-300">
                  <div className="font-bold text-orange-800">{medication.name}</div>
                  <div className="text-sm text-orange-700">
                    Dosagem: {medication.dosage}
                  </div>
                  <div className="text-sm text-orange-700">
                    Frequência: {medication.frequency}
                  </div>
                  {medication.lastTaken && (
                    <div className="text-xs text-orange-600 mt-1">
                      Última dose: {medication.lastTaken}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-orange-600">Nenhuma medicação registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Cautions - YELLOW */}
      <Card className="border-2 border-yellow-500 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-yellow-700 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            🟡 CONTRAINDICAÇÕES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.contraindications.length > 0 ? (
            <div className="space-y-2">
              {patient.contraindications.map((contraindication, index) => (
                <div key={index} className="p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="font-bold text-yellow-800">{contraindication.type}</div>
                  <div className="text-sm text-yellow-700">{contraindication.description}</div>
                  <Badge 
                    variant={contraindication.severity === 'high' ? 'destructive' : 'secondary'}
                    className="mt-1"
                  >
                    {contraindication.severity === 'high' ? 'Alta' : 
                     contraindication.severity === 'moderate' ? 'Moderada' : 'Baixa'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600">Nenhuma contraindicação registrada</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-green-700 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            🩺 CONDIÇÕES MÉDICAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.medicalConditions.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {patient.medicalConditions.map((condition, index) => (
                <div key={index} className="p-3 bg-green-100 rounded-lg border border-green-300">
                  <div className="font-bold text-green-800">{condition.condition}</div>
                  <Badge 
                    variant={condition.status === 'active' ? 'destructive' : 
                            condition.status === 'controlled' ? 'secondary' : 'outline'}
                    className="mt-1"
                  >
                    {condition.status === 'active' ? 'Ativa' : 
                     condition.status === 'controlled' ? 'Controlada' : 'Resolvida'}
                  </Badge>
                  <div className="text-xs text-green-600 mt-1">
                    Atualização: {condition.lastUpdate}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600">Nenhuma condição médica registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Emergency contacts component
const EmergencyContacts: React.FC<{
  contacts: EmergencyPatient['emergencyContacts'];
}> = ({ contacts }) => {
  const handleCall = useCallback((phoneNumber: string, contactName: string) => {
    // In a real implementation, this would trigger the phone call
    if (confirm(`Ligar para ${contactName} (${phoneNumber})?`)) {
      // Emergency audit log
      console.log(`Emergency call initiated to ${contactName} at ${phoneNumber} at ${new Date().toISOString()}`);
      
      // Attempt to use tel: protocol
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }, []);

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <Phone className="h-5 w-5" />
          📞 CONTATOS DE EMERGÊNCIA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex-1">
                  <div className="font-bold text-blue-800 flex items-center gap-2">
                    {contact.name}
                    {contact.isPrimary && (
                      <Badge variant="default" className="bg-blue-600">
                        PRINCIPAL
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-blue-700">{contact.relationship}</div>
                  <div className="text-sm font-mono text-blue-600">{contact.phone}</div>
                </div>
                <Button
                  size="lg"
                  onClick={() => handleCall(contact.phone, contact.name)}
                  className="bg-green-600 hover:bg-green-700 text-white h-12 px-6"
                  aria-label={`Ligar para ${contact.name}`}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Ligar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-600">Nenhum contato de emergência registrado</p>
        )}
      </CardContent>
    </Card>
  );
};

// Crisis scheduler component
const CrisisScheduler: React.FC = () => {
  const [availableDoctors] = useState([
    { id: '1', name: 'Dr. Ana Silva', specialty: 'Emergência', available: true, nextSlot: '10:30' },
    { id: '2', name: 'Dr. Carlos Santos', specialty: 'Cardiologia', available: true, nextSlot: '11:00' },
    { id: '3', name: 'Dra. Maria Costa', specialty: 'Neurologia', available: false, nextSlot: '14:30' },
  ]);

  const handleEmergencyBooking = useCallback((doctorId: string, doctorName: string) => {
    if (confirm(`Confirmar agendamento de emergência com ${doctorName}?`)) {
      console.log(`Emergency appointment booked with ${doctorName} at ${new Date().toISOString()}`);
      alert(`Agendamento de emergência confirmado com ${doctorName}`);
    }
  }, []);

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-purple-700 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Agendamento de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableDoctors.map((doctor) => (
            <div 
              key={doctor.id}
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
            >
              <div className="flex-1">
                <div className="font-bold text-purple-800">{doctor.name}</div>
                <div className="text-sm text-purple-700">{doctor.specialty}</div>
                <div className="text-sm text-purple-600">
                  Próximo horário: {doctor.nextSlot}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={doctor.available ? 'default' : 'secondary'}
                  className={doctor.available ? 'bg-green-600' : 'bg-gray-500'}
                >
                  {doctor.available ? 'Disponível' : 'Ocupado'}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleEmergencyBooking(doctor.id, doctor.name)}
                  disabled={!doctor.available}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  aria-label={`Agendar emergência com ${doctor.name}`}
                >
                  Agendar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Offline indicator component
const OfflineIndicator: React.FC<{
  isOnline: boolean;
  cacheStatus: 'fresh' | 'stale' | 'offline';
  lastSync: string;
}> = ({ isOnline, cacheStatus, lastSync }) => {
  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600 bg-red-50 border-red-200';
    if (cacheStatus === 'stale') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Modo Offline - Dados em Cache';
    if (cacheStatus === 'stale') return 'Dados Podem Estar Desatualizados';
    return 'Sistema Online - Dados Atualizados';
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <div className="text-sm">
            Última sincronização: {lastSync}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Emergency Access Page Component
export default function EmergencyAccessPage() {
  const [state, setState] = useState<EmergencyState>({
    isOnline: navigator.onLine,
    cacheStatus: 'fresh',
    lastSync: new Date().toLocaleString('pt-BR'),
    searchQuery: '',
    selectedPatient: null,
    recentPatients: [],
    isSearching: false,
    voiceActive: false,
    scannerActive: false,
  });

  // Mock patient data for demonstration
  const mockPatient: EmergencyPatient = {
    id: 'PAT-2024-001',
    name: 'João Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '15/03/1980',
    phone: '(11) 99999-9999',
    allergies: [
      {
        type: 'Penicilina',
        severity: 'critical',
        description: 'Reação anafilática grave - usar epinefrina imediatamente'
      },
      {
        type: 'Látex',
        severity: 'high',
        description: 'Dermatite de contato severa'
      }
    ],
    medications: [
      {
        name: 'Losartana',
        dosage: '50mg',
        frequency: '1x ao dia',
        lastTaken: 'Hoje 08:00'
      },
      {
        name: 'Sinvastatina',
        dosage: '20mg',
        frequency: '1x ao dia (noite)',
        lastTaken: 'Ontem 22:00'
      }
    ],
    contraindications: [
      {
        type: 'Aspirina',
        description: 'Histórico de sangramento gastrointestinal',
        severity: 'high'
      }
    ],
    emergencyContacts: [
      {
        name: 'Maria Silva Santos',
        relationship: 'Esposa',
        phone: '(11) 88888-8888',
        isPrimary: true
      },
      {
        name: 'Pedro Silva Santos',
        relationship: 'Filho',
        phone: '(11) 77777-7777',
        isPrimary: false
      }
    ],
    medicalConditions: [
      {
        condition: 'Hipertensão Arterial',
        status: 'controlled',
        lastUpdate: '10/01/2024'
      },
      {
        condition: 'Dislipidemia',
        status: 'controlled',
        lastUpdate: '10/01/2024'
      }
    ],
    lastAccessed: new Date().toISOString()
  };

  // Handle online status changes
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        cacheStatus: navigator.onLine ? 'fresh' : 'offline',
        lastSync: navigator.onLine ? new Date().toLocaleString('pt-BR') : prev.lastSync
      }));
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, isSearching: true }));

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock search - in real implementation, this would search the database
    if (query.toLowerCase().includes('joão') || query.includes('123.456.789-00')) {
      setState(prev => ({ 
        ...prev, 
        selectedPatient: mockPatient,
        isSearching: false 
      }));
    } else if (query.length > 0) {
      setState(prev => ({ 
        ...prev, 
        selectedPatient: null,
        isSearching: false 
      }));
      alert('Paciente não encontrado. Verifique o nome, CPF ou RG informado.');
    } else {
      setState(prev => ({ 
        ...prev, 
        selectedPatient: null,
        isSearching: false 
      }));
    }
  }, []);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      voiceActive: !prev.voiceActive,
      scannerActive: false // Close scanner when opening voice
    }));

    // In real implementation, this would start/stop voice recognition
    if (!state.voiceActive) {
      console.log('Voice recognition started');
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        handleSearch('João Silva');
        setState(prev => ({ ...prev, voiceActive: false }));
      }, 3000);
    }
  }, [state.voiceActive, handleSearch]);

  // Handle scanner toggle
  const handleScannerToggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      scannerActive: !prev.scannerActive,
      voiceActive: false // Close voice when opening scanner
    }));

    // In real implementation, this would start/stop barcode scanner
    if (!state.scannerActive) {
      console.log('Barcode scanner started');
      // Simulate barcode scan after 2 seconds
      setTimeout(() => {
        handleSearch('123.456.789-00');
        setState(prev => ({ ...prev, scannerActive: false }));
      }, 2000);
    }
  }, [state.scannerActive, handleSearch]);

  // Keyboard shortcuts for emergency actions
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl+S for search focus
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Ctrl+V for voice
      if (event.ctrlKey && event.key === 'v') {
        event.preventDefault();
        handleVoiceToggle();
      }
      
      // Ctrl+B for barcode
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        handleScannerToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleVoiceToggle, handleScannerToggle]);

  return (
    <div className="min-h-screen bg-bg-secondary/30 p-4" lang="pt-BR">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Emergency Header */}
        <div className="text-center py-6 bg-red-600 text-white rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold font-serif flex items-center justify-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            Acesso de Emergência
          </h1>
          <p className="text-xl mt-2 opacity-90">
            Sistema de Acesso Rápido a Informações Críticas de Pacientes
          </p>
        </div>

        {/* System Status */}
        <OfflineIndicator 
          isOnline={state.isOnline}
          cacheStatus={state.cacheStatus}
          lastSync={state.lastSync}
        />

        {/* Emergency Search */}
        <EmergencySearchBar
          value={state.searchQuery}
          onChange={(value) => setState(prev => ({ ...prev, searchQuery: value }))}
          onVoiceToggle={handleVoiceToggle}
          onScannerToggle={handleScannerToggle}
          isVoiceActive={state.voiceActive}
          isScannerActive={state.scannerActive}
          isSearching={state.isSearching}
        />

        {/* Voice/Scanner Active Indicators */}
        {state.voiceActive && (
          <Alert className="border-blue-400 bg-blue-50">
            <Mic className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Comando de voz ativo.</strong> Diga o nome do paciente, CPF ou RG.
            </AlertDescription>
          </Alert>
        )}

        {state.scannerActive && (
          <Alert className="border-purple-400 bg-purple-50">
            <Scan className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Scanner ativo.</strong> Posicione o código de barras ou QR code do paciente.
            </AlertDescription>
          </Alert>
        )}

        {/* Search Button */}
        {state.searchQuery && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => handleSearch(state.searchQuery)}
              disabled={state.isSearching}
              className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-lg"
            >
              {state.isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Buscar Paciente
                </>
              )}
            </Button>
          </div>
        )}

        {/* Patient Information */}
        {state.selectedPatient && (
          <>
            <Separator />
            
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Critical Patient Info - 2 columns */}
              <div className="lg:col-span-2">
                <PatientCriticalInfo patient={state.selectedPatient} />
              </div>

              {/* Emergency Actions - 1 column */}
              <div className="space-y-4">
                <EmergencyContacts contacts={state.selectedPatient.emergencyContacts} />
                <CrisisScheduler />
              </div>
            </div>
          </>
        )}

        {/* Emergency Instructions */}
        {!state.selectedPatient && !state.searchQuery && (
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Instruções de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-2">Busca Rápida</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Digite nome, CPF ou RG</li>
                    <li>• Use comando de voz (Ctrl+V)</li>
                    <li>• Scanner de código (Ctrl+B)</li>
                    <li>• Foco na busca (Ctrl+S)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-800 mb-2">Informações Críticas</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 🔴 Alergias life-threatening</li>
                    <li>• 🟠 Medicações atuais</li>
                    <li>• 🟡 Contraindicações</li>
                    <li>• 📞 Contatos de emergência</li>
                  </ul>
                </div>
              </div>

              <Alert className="border-orange-400 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Protocolo de Emergência:</strong> Todos os acessos são registrados para auditoria. 
                  Em caso de falha do sistema, consulte os protocolos em papel disponíveis na recepção.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Emergency Footer */}
        <div className="text-center py-4 text-sm text-muted-foreground border-t">
          <p>
            NeonPro Healthcare Emergency Access • Versão 1.0 • 
            <span className="font-mono"> {new Date().toLocaleString('pt-BR')}</span>
          </p>
          <p className="mt-1">
            🔒 Acesso monitorado e auditado conforme LGPD • ☎️ Suporte 24h: 0800-NEONPRO
          </p>
        </div>
      </div>
    </div>
  );
}