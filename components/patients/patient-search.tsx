'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  User, 
  Phone, 
  Mail,
  Activity,
  Eye,
  RefreshCw,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientSearchProps {
  onPatientSelect?: (patient: any) => void;
}

interface PatientSummary {
  patient_id: string;
  demographics: {
    name: string;
    date_of_birth: string;
    gender: string;
    phone?: string;
    email?: string;
  };
  medical_history?: {
    conditions?: string[];
  };
  profile_completeness_score: number;
  last_accessed?: string;
  is_active: boolean;
}

export default function PatientSearch({ onPatientSelect }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'name' | 'phone' | 'email'>('name');

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set(searchType, searchQuery.trim());

      const response = await fetch(`/api/patients/profile?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na busca de pacientes');
      }

      const data = await response.json();
      setPatients(data.patients || []);
      
      if (data.patients?.length === 0) {
        toast.info('Nenhum paciente encontrado');
      } else {
        toast.success(`${data.patients.length} paciente(s) encontrado(s)`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na busca';
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPatients();
    }
  };

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

  const getCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastAccessed = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="searchType">Buscar por:</Label>
          <Select value={searchType} onValueChange={(value: 'name' | 'phone' | 'email') => setSearchType(value)}>
            <SelectTrigger id="searchType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome
                </div>
              </SelectItem>
              <SelectItem value="phone">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={`Digite ${searchType === 'name' ? 'o nome' : searchType === 'phone' ? 'o telefone' : 'o email'} do paciente...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={searchPatients} disabled={loading || !searchQuery.trim()}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {patients.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {patients.length} paciente(s) encontrado(s)
          </div>
        )}

        {patients.map((patient) => (
          <div
            key={patient.patient_id}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onPatientSelect?.(patient)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{patient.demographics.name}</h4>
                  {!patient.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{calculateAge(patient.demographics.date_of_birth)} anos</span>
                    <span>{patient.demographics.gender}</span>
                    {patient.demographics.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.demographics.phone}
                      </span>
                    )}
                  </div>
                  
                  {patient.medical_history?.conditions && patient.medical_history.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {patient.medical_history.conditions.slice(0, 3).map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                      {patient.medical_history.conditions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{patient.medical_history.conditions.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getCompletenessColor(patient.profile_completeness_score)}`}>
                    {Math.round(patient.profile_completeness_score)}%
                  </span>
                  <Progress 
                    value={patient.profile_completeness_score} 
                    className="w-16"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Último acesso: {formatLastAccessed(patient.last_accessed)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {searchQuery && patients.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum paciente encontrado</p>
            <p className="text-sm">Tente usar critérios de busca diferentes</p>
          </div>
        )}

        {!searchQuery && patients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Digite algo para buscar pacientes</p>
            <p className="text-sm">Use nome, telefone ou email</p>
          </div>
        )}
      </div>
    </div>
  );
}