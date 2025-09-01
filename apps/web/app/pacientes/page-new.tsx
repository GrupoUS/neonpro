"use client";

import { EmptyState, ErrorBoundary, StateManager } from "@/components/forms/loading-error-states";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context-new";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
interface Patient {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  given_names: string[];
  family_name: string;
  full_name: string;
  preferred_name?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  cpf?: string;
  rg?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: string[];
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  lgpd_consent_given: boolean;
  lgpd_consent_version?: string;
  marketing_consent: boolean;
  research_consent: boolean;
  patient_status: string;
  is_active: boolean;
  no_show_risk_score: number;
  total_appointments: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

interface PatientsResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PatientFormData {
  given_names: string;
  family_name: string;
  preferred_name?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  cpf?: string;
  rg?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  lgpd_consent_given: boolean;
  marketing_consent: boolean;
  research_consent: boolean;
  patient_notes?: string;
}

// Custom hooks
function usePatientsAPI() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const fetchPatients = useCallback(async (
    page = 1,
    limit = 20,
    search = "",
    status = "active",
  ) => {
    if (!user) {return;}

    try {
      setLoading(true);
      setError(null);

      const clinicId = "mock-clinic-id"; // In real app, get from user context
      const params = new URLSearchParams({
        clinic_id: clinicId,
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(
        `${API_BASE_URL}/patients?${params.toString()}`,
        { headers: getHeaders() },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PatientsResponse = await response.json();
      setPatients(data.patients);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Fetch patients error:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar pacientes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPatient = async (patientData: PatientFormData) => {
    try {
      const clinicId = "mock-clinic-id";

      const formattedData = {
        clinic_id: clinicId,
        given_names: patientData.given_names.split(" ").filter(Boolean),
        family_name: patientData.family_name,
        preferred_name: patientData.preferred_name || null,
        phone_primary: patientData.phone_primary || null,
        phone_secondary: patientData.phone_secondary || null,
        email: patientData.email || null,
        address_line1: patientData.address_line1 || null,
        address_line2: patientData.address_line2 || null,
        city: patientData.city || null,
        state: patientData.state || null,
        postal_code: patientData.postal_code || null,
        birth_date: patientData.birth_date || null,
        gender: patientData.gender || null,
        marital_status: patientData.marital_status || null,
        cpf: patientData.cpf || null,
        rg: patientData.rg || null,
        blood_type: patientData.blood_type || null,
        allergies: patientData.allergies
          ? patientData.allergies.split(",").map(a => a.trim())
          : null,
        chronic_conditions: patientData.chronic_conditions
          ? patientData.chronic_conditions.split(",").map(c => c.trim())
          : null,
        current_medications: patientData.current_medications
          ? patientData.current_medications.split(",").map(m => m.trim())
          : null,
        insurance_provider: patientData.insurance_provider || null,
        insurance_number: patientData.insurance_number || null,
        emergency_contact_name: patientData.emergency_contact_name || null,
        emergency_contact_phone: patientData.emergency_contact_phone || null,
        emergency_contact_relationship: patientData.emergency_contact_relationship || null,
        lgpd_consent_given: patientData.lgpd_consent_given,
        marketing_consent: patientData.marketing_consent,
        research_consent: patientData.research_consent,
        patient_notes: patientData.patient_notes || null,
        created_by: user?.id || null,
      };

      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar paciente");
      }

      return await response.json();
    } catch (err) {
      console.error("Create patient error:", err);
      throw err;
    }
  };

  const updatePatient = async (patientId: string, patientData: Partial<PatientFormData>) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          clinic_id: clinicId,
          ...patientData,
          updated_by: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar paciente");
      }

      return await response.json();
    } catch (err) {
      console.error("Update patient error:", err);
      throw err;
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(`${API_BASE_URL}/patients/${patientId}?clinic_id=${clinicId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao desativar paciente");
      }

      return await response.json();
    } catch (err) {
      console.error("Delete patient error:", err);
      throw err;
    }
  };

  return {
    patients,
    pagination,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
}

// Components
function PatientCard({ patient, onEdit, onView, onDelete }: {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAgeFromBirthDate = (birthDate?: string) => {
    if (!birthDate) {return null;}
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(patient.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{patient.full_name}</CardTitle>
              <CardDescription className="text-sm">
                {patient.medical_record_number}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {patient.lgpd_consent_given
              ? (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  LGPD
                </Badge>
              )
              : (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Pendente
                </Badge>
              )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          {patient.phone_primary && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {patient.phone_primary}
            </div>
          )}

          {patient.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              {patient.email}
            </div>
          )}

          {patient.birth_date && (
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {getAgeFromBirthDate(patient.birth_date)} anos
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{patient.total_appointments} consultas</span>
              {patient.no_show_risk_score > 0 && (
                <span
                  className={patient.no_show_risk_score > 50 ? "text-red-600" : "text-yellow-600"}
                >
                  Risco: {patient.no_show_risk_score}%
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(patient)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Ver detalhes</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(patient)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(patient)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Desativar</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientForm({
  patient,
  onSubmit,
  onCancel,
  loading,
}: {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<PatientFormData>({
    given_names: patient?.given_names?.join(" ") || "",
    family_name: patient?.family_name || "",
    preferred_name: patient?.preferred_name || "",
    phone_primary: patient?.phone_primary || "",
    phone_secondary: patient?.phone_secondary || "",
    email: patient?.email || "",
    address_line1: patient?.address_line1 || "",
    address_line2: patient?.address_line2 || "",
    city: patient?.city || "",
    state: patient?.state || "",
    postal_code: patient?.postal_code || "",
    birth_date: patient?.birth_date || "",
    gender: patient?.gender || "",
    marital_status: patient?.marital_status || "",
    cpf: patient?.cpf || "",
    rg: patient?.rg || "",
    blood_type: patient?.blood_type || "",
    allergies: patient?.allergies?.join(", ") || "",
    chronic_conditions: patient?.chronic_conditions?.join(", ") || "",
    current_medications: patient?.current_medications?.join(", ") || "",
    insurance_provider: patient?.insurance_provider || "",
    insurance_number: patient?.insurance_number || "",
    emergency_contact_name: patient?.emergency_contact_name || "",
    emergency_contact_phone: patient?.emergency_contact_phone || "",
    emergency_contact_relationship: patient?.emergency_contact_relationship || "",
    lgpd_consent_given: patient?.lgpd_consent_given ?? false,
    marketing_consent: patient?.marketing_consent ?? false,
    research_consent: patient?.research_consent ?? false,
    patient_notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.given_names.trim()) {
      newErrors.given_names = "Nome é obrigatório";
    }

    if (!formData.family_name.trim()) {
      newErrors.family_name = "Sobrenome é obrigatório";
    }

    if (!formData.lgpd_consent_given) {
      newErrors.lgpd_consent_given = "Consentimento LGPD é obrigatório";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = "CPF deve estar no formato: 000.000.000-00";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof PatientFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="medical">Médico</TabsTrigger>
          <TabsTrigger value="consent">Consentimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="given_names">Nome(s) *</Label>
              <Input
                id="given_names"
                value={formData.given_names}
                onChange={(e) => handleInputChange("given_names", e.target.value)}
                placeholder="João Carlos"
                className={errors.given_names ? "border-red-500" : ""}
              />
              {errors.given_names && <p className="text-sm text-red-600">{errors.given_names}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_name">Sobrenome *</Label>
              <Input
                id="family_name"
                value={formData.family_name}
                onChange={(e) => handleInputChange("family_name", e.target.value)}
                placeholder="Silva"
                className={errors.family_name ? "border-red-500" : ""}
              />
              {errors.family_name && <p className="text-sm text-red-600">{errors.family_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferred_name">Nome Preferido</Label>
              <Input
                id="preferred_name"
                value={formData.preferred_name}
                onChange={(e) => handleInputChange("preferred_name", e.target.value)}
                placeholder="João"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange("birth_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marital_status">Estado Civil</Label>
              <Select
                value={formData.marital_status}
                onValueChange={(value) => handleInputChange("marital_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União Estável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_type">Tipo Sanguíneo</Label>
              <Select
                value={formData.blood_type}
                onValueChange={(value) => handleInputChange("blood_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className={errors.cpf ? "border-red-500" : ""}
              />
              {errors.cpf && <p className="text-sm text-red-600">{errors.cpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => handleInputChange("rg", e.target.value)}
                placeholder="12.345.678-9"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_primary">Telefone Principal</Label>
              <Input
                id="phone_primary"
                value={formData.phone_primary}
                onChange={(e) => handleInputChange("phone_primary", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_secondary">Telefone Secundário</Label>
              <Input
                id="phone_secondary"
                value={formData.phone_secondary}
                onChange={(e) => handleInputChange("phone_secondary", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="paciente@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line1">Endereço</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => handleInputChange("address_line1", e.target.value)}
              placeholder="Rua das Flores, 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line2">Complemento</Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => handleInputChange("address_line2", e.target.value)}
              placeholder="Apt 45, Bloco B"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="São Paulo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="SP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">CEP</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange("postal_code", e.target.value)}
                placeholder="01234-567"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Contato de Emergência</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nome</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                  placeholder="Maria Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relationship">Parentesco</Label>
              <Input
                id="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={(e) =>
                  handleInputChange("emergency_contact_relationship", e.target.value)}
                placeholder="Mãe, Cônjuge, etc."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                placeholder="Separar por vírgula: penicilina, frutos do mar, etc."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplas alergias por vírgula
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chronic_conditions">Condições Crônicas</Label>
              <Textarea
                id="chronic_conditions"
                value={formData.chronic_conditions}
                onChange={(e) => handleInputChange("chronic_conditions", e.target.value)}
                placeholder="Separar por vírgula: diabetes, hipertensão, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Medicações Atuais</Label>
              <Textarea
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => handleInputChange("current_medications", e.target.value)}
                placeholder="Separar por vírgula: losartana 50mg, metformina 850mg, etc."
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Informações do Plano de Saúde</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">Operadora</Label>
                  <Input
                    id="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={(e) => handleInputChange("insurance_provider", e.target.value)}
                    placeholder="Unimed, SulAmérica, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_number">Número da Carteirinha</Label>
                  <Input
                    id="insurance_number"
                    value={formData.insurance_number}
                    onChange={(e) => handleInputChange("insurance_number", e.target.value)}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Os consentimentos abaixo são essenciais para o tratamento e gestão dos dados do
              paciente em conformidade com a LGPD.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="lgpd_consent"
                checked={formData.lgpd_consent_given}
                onCheckedChange={(checked) => handleInputChange("lgpd_consent_given", checked)}
                className={errors.lgpd_consent_given ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor="lgpd_consent" className="font-medium cursor-pointer">
                  Consentimento LGPD (Obrigatório) *
                </Label>
                <p className="text-sm text-muted-foreground">
                  Autorizo o tratamento dos meus dados pessoais para fins de prestação de serviços
                  médicos, conforme descrito na Política de Privacidade.
                </p>
                {errors.lgpd_consent_given && (
                  <p className="text-sm text-red-600">{errors.lgpd_consent_given}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing_consent"
                checked={formData.marketing_consent}
                onCheckedChange={(checked) => handleInputChange("marketing_consent", checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="marketing_consent" className="font-medium cursor-pointer">
                  Comunicações de Marketing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Autorizo o recebimento de comunicações promocionais, campanhas de saúde e
                  informações sobre novos serviços.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="research_consent"
                checked={formData.research_consent}
                onCheckedChange={(checked) => handleInputChange("research_consent", checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="research_consent" className="font-medium cursor-pointer">
                  Pesquisas Científicas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Autorizo o uso dos meus dados anonimizados para pesquisas científicas e estudos
                  epidemiológicos.
                </p>
              </div>
            </div>
          </div>

          {!patient && (
            <div className="space-y-2">
              <Label htmlFor="patient_notes">Observações Iniciais</Label>
              <Textarea
                id="patient_notes"
                value={formData.patient_notes}
                onChange={(e) => handleInputChange("patient_notes", e.target.value)}
                placeholder="Observações sobre o primeiro contato, encaminhamento, etc."
                rows={3}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            )
            : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {patient ? "Atualizar" : "Cadastrar"} Paciente
              </>
            )}
        </Button>
      </div>
    </form>
  );
}

function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!patient) {return null;}

  const getAgeFromBirthDate = (birthDate?: string) => {
    if (!birthDate) {return "Não informado";}
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} anos`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Detalhes do Paciente
          </DialogTitle>
          <DialogDescription>
            Informações completas de {patient.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {patient.full_name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                <p className="text-muted-foreground">
                  Prontuário: {patient.medical_record_number}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {patient.lgpd_consent_given
                ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    LGPD Conforme
                  </Badge>
                )
                : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    LGPD Pendente
                  </Badge>
                )}

              <Badge variant="outline">
                Status: {patient.patient_status}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Pessoais</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="medical">Médico</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nome Completo
                  </Label>
                  <p className="font-medium">{patient.full_name}</p>
                </div>

                {patient.preferred_name && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Nome Preferido
                    </Label>
                    <p className="font-medium">{patient.preferred_name}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Data de Nascimento
                  </Label>
                  <p className="font-medium">
                    {patient.birth_date
                      ? new Date(patient.birth_date).toLocaleDateString("pt-BR")
                        + ` (${getAgeFromBirthDate(patient.birth_date)})`
                      : "Não informado"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Gênero
                  </Label>
                  <p className="font-medium capitalize">
                    {patient.gender || "Não informado"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Estado Civil
                  </Label>
                  <p className="font-medium capitalize">
                    {patient.marital_status || "Não informado"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tipo Sanguíneo
                  </Label>
                  <p className="font-medium">
                    {patient.blood_type || "Não informado"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    CPF
                  </Label>
                  <p className="font-medium">{patient.cpf || "Não informado"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    RG
                  </Label>
                  <p className="font-medium">{patient.rg || "Não informado"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Telefones
                  </Label>
                  <div className="space-y-1">
                    {patient.phone_primary && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {patient.phone_primary} (Principal)
                      </p>
                    )}
                    {patient.phone_secondary && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {patient.phone_secondary} (Secundário)
                      </p>
                    )}
                    {!patient.phone_primary && !patient.phone_secondary && (
                      <p className="text-muted-foreground">Nenhum telefone cadastrado</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {patient.email || "Não informado"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Endereço
                  </Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      {patient.address_line1 && <p>{patient.address_line1}</p>}
                      {patient.address_line2 && <p>{patient.address_line2}</p>}
                      {(patient.city || patient.state || patient.postal_code) && (
                        <p>
                          {[patient.city, patient.state, patient.postal_code]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {!patient.address_line1 && (
                        <p className="text-muted-foreground">Endereço não informado</p>
                      )}
                    </div>
                  </div>
                </div>

                {(patient.emergency_contact_name
                  || patient.emergency_contact_phone
                  || patient.emergency_contact_relationship) && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Contato de Emergência
                    </Label>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {patient.emergency_contact_name || "Nome não informado"}
                      </p>
                      {patient.emergency_contact_phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {patient.emergency_contact_phone}
                        </p>
                      )}
                      {patient.emergency_contact_relationship && (
                        <p className="text-muted-foreground">
                          {patient.emergency_contact_relationship}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="space-y-4">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Alergias
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-red-600 border-red-200"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Condições Crônicas
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.chronic_conditions.map((condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-orange-600 border-orange-200"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {patient.current_medications && patient.current_medications.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Medicações Atuais
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {patient.current_medications.map((medication, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(patient.insurance_provider || patient.insurance_number) && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Plano de Saúde
                    </Label>
                    <div className="space-y-1">
                      {patient.insurance_provider && (
                        <p className="font-medium">{patient.insurance_provider}</p>
                      )}
                      {patient.insurance_number && (
                        <p className="text-muted-foreground">
                          Carteirinha: {patient.insurance_number}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total de Consultas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{patient.total_appointments}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Risco de No-Show</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        patient.no_show_risk_score > 50
                          ? "text-red-600"
                          : patient.no_show_risk_score > 25
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {patient.no_show_risk_score}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Última Visita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {patient.last_visit_date
                        ? new Date(patient.last_visit_date).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cadastrado em</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {new Date(patient.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Consentimentos
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>LGPD</span>
                    {patient.lgpd_consent_given
                      ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Autorizado
                        </Badge>
                      )
                      : (
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Marketing</span>
                    {patient.marketing_consent
                      ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Autorizado
                        </Badge>
                      )
                      : (
                        <Badge variant="outline">
                          <X className="h-3 w-3 mr-1" />
                          Não autorizado
                        </Badge>
                      )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span>Pesquisa</span>
                    {patient.research_consent
                      ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Autorizado
                        </Badge>
                      )
                      : (
                        <Badge variant="outline">
                          <X className="h-3 w-3 mr-1" />
                          Não autorizado
                        </Badge>
                      )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main component
export default function PatientsPage() {
  const { user } = useAuth();
  const {
    patients,
    pagination,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  } = usePatientsAPI();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Load patients on mount and when filters change
  useEffect(() => {
    if (user) {
      fetchPatients(1, 20, searchTerm, statusFilter);
    }
  }, [user, searchTerm, statusFilter, fetchPatients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(1, pagination.limit, searchTerm, statusFilter);
  };

  const handleCreatePatient = async (data: PatientFormData) => {
    try {
      setSubmitting(true);
      await createPatient(data);
      setShowCreateDialog(false);
      await fetchPatients(pagination.page, pagination.limit, searchTerm, statusFilter);
    } catch (err) {
      console.error("Create patient error:", err);
      // Handle error (could show toast notification)
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePatient = async (data: PatientFormData) => {
    if (!selectedPatient) {return;}

    try {
      setSubmitting(true);
      await updatePatient(selectedPatient.id, data);
      setShowEditDialog(false);
      setSelectedPatient(null);
      await fetchPatients(pagination.page, pagination.limit, searchTerm, statusFilter);
    } catch (err) {
      console.error("Update patient error:", err);
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) {return;}

    try {
      setSubmitting(true);
      await deletePatient(patientToDelete.id);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      await fetchPatients(pagination.page, pagination.limit, searchTerm, statusFilter);
    } catch (err) {
      console.error("Delete patient error:", err);
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchPatients(newPage, pagination.limit, searchTerm, statusFilter);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditDialog(true);
  };

  const handleView = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  if (!user) {
    return (
      <StateManager
        isEmpty
        emptyComponent={
          <EmptyState
            title="Acesso Negado"
            description="Você precisa estar logado para acessar a página de pacientes."
            action={{
              label: "Fazer Login",
              onClick: () => window.location.href = "/login",
            }}
          />
        }
      >
        <div />
      </StateManager>
    );
  }

  return (
    <StateManager
      loading={loading && patients.length === 0}
      error={error}
      isEmpty={!loading && patients.length === 0}
      onRetry={() => fetchPatients(1, 20, searchTerm, statusFilter)}
      emptyProps={{
        title: "Nenhum paciente cadastrado",
        description: "Comece cadastrando o primeiro paciente da clínica.",
        action: {
          label: "Cadastrar Primeiro Paciente",
          onClick: () => setShowCreateDialog(true),
        },
      }}
      className="space-y-6 p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro e informações dos pacientes da clínica
            </p>
          </div>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Buscar Pacientes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  fetchPatients(pagination.page, pagination.limit, searchTerm, statusFilter)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <div className="space-y-4">
          {loading
            ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
            : patients.length > 0
            ? (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {patients.length} de {pagination.total} pacientes
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <span className="text-sm">
                      Página {pagination.page} de {pagination.pages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Patient Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {patients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onEdit={handleEdit}
                      onView={handleView}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Pagination Footer */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page <= 1}
                      >
                        Primeira
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="px-4 py-2 text-sm">
                        {pagination.page} de {pagination.pages}
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.pages)}
                        disabled={pagination.page >= pagination.pages}
                      >
                        Última
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )
            : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || statusFilter !== "active"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece adicionando o primeiro paciente da clínica"}
                  </p>
                  {!searchTerm && statusFilter === "active" && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Paciente
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Dialogs */}
        {/* Create Patient Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo paciente. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>

            <PatientForm
              onSubmit={handleCreatePatient}
              onCancel={() => setShowCreateDialog(false)}
              loading={submitting}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
              <DialogDescription>
                Atualize as informações do paciente.
              </DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <PatientForm
                patient={selectedPatient}
                onSubmit={handleUpdatePatient}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedPatient(null);
                }}
                loading={submitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Patient Details Dialog */}
        <PatientDetailsDialog
          patient={selectedPatient}
          open={showDetailsDialog}
          onOpenChange={(open) => {
            setShowDetailsDialog(open);
            if (!open) {setSelectedPatient(null);}
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desativar Paciente</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja desativar o paciente{" "}
                <strong>{patientToDelete?.full_name}</strong>?
              </DialogDescription>
            </DialogHeader>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação irá desativar o paciente, mas manterá todos os dados históricos por
                questões de conformidade LGPD e auditoria médica.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setPatientToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePatient}
                disabled={submitting}
              >
                {submitting
                  ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Desativando...
                    </>
                  )
                  : (
                    "Desativar Paciente"
                  )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StateManager>
  );
}
