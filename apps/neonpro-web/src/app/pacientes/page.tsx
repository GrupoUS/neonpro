"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  FileText,
  Activity,
  AlertCircle,
  Heart,
  Eye,
  Filter
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "masculino" | "feminino" | "outro";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    planNumber: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    lastVisit?: string;
    nextAppointment?: string;
  };
  status: "ativo" | "inativo" | "bloqueado";
  registrationDate: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: "consulta" | "exame" | "procedimento";
  doctor: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export default function PatientsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setPatients([
        {
          id: "1",
          name: "Ana Silva Santos",
          email: "ana.silva@email.com",
          phone: "(11) 99999-9999",
          dateOfBirth: "1985-03-15",
          gender: "feminino",
          address: {
            street: "Rua das Flores, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567"
          },
          emergencyContact: {
            name: "João Silva",
            phone: "(11) 88888-8888",
            relationship: "Esposo"
          },
          insurance: {
            provider: "Unimed",
            planNumber: "123456789"
          },
          medicalInfo: {
            bloodType: "O+",
            allergies: ["Penicilina", "Pólen"],
            medications: ["Losartana 50mg"],
            conditions: ["Hipertensão", "Diabetes Tipo 2"],
            lastVisit: "2024-07-20",
            nextAppointment: "2024-08-15"
          },
          status: "ativo",
          registrationDate: "2023-01-15"
        },
        {
          id: "2",
          name: "Carlos Rodrigues",
          email: "carlos.rodrigues@email.com",
          phone: "(11) 88888-8888",
          dateOfBirth: "1978-11-22",
          gender: "masculino",
          address: {
            street: "Av. Paulista, 456",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100"
          },
          emergencyContact: {
            name: "Maria Rodrigues",
            phone: "(11) 77777-7777",
            relationship: "Esposa"
          },
          medicalInfo: {
            bloodType: "A-",
            allergies: [],
            medications: ["Sinvastatina 20mg"],
            conditions: ["Colesterol Alto"],
            lastVisit: "2024-07-18",
            nextAppointment: "2024-08-10"
          },
          status: "ativo",
          registrationDate: "2023-03-10"
        },
        {
          id: "3",
          name: "Maria Oliveira",
          email: "maria.oliveira@email.com",
          phone: "(11) 77777-7777",
          dateOfBirth: "1992-06-08",
          gender: "feminino",
          address: {
            street: "Rua Augusta, 789",
            city: "São Paulo",
            state: "SP",
            zipCode: "01305-000"
          },
          emergencyContact: {
            name: "Pedro Oliveira",
            phone: "(11) 66666-6666",
            relationship: "Pai"
          },
          medicalInfo: {
            bloodType: "B+",
            allergies: ["Lactose"],
            medications: [],
            conditions: ["Intolerância à Lactose"],
            lastVisit: "2024-07-25"
          },
          status: "ativo",
          registrationDate: "2023-05-20"
        }
      ]);
      
      setIsLoading(false);
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-100 text-green-800 border-green-200";
      case "inativo": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "bloqueado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }