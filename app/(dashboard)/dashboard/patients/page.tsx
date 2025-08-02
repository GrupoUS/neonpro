"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Heart,
  Stethoscope,
  Syringe,
  Camera,
  Download,
  Upload,
  Star,
  MessageSquare,
  Bell,
  Settings,
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  FileImage,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Types
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  lastVisit: string;
  nextAppointment?: string;
  medicalHistory: MedicalRecord[];
  treatments: Treatment[];
  notes: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
  preferences: {
    communication: "email" | "phone" | "sms";
    language: string;
  };
}

interface MedicalRecord {
  id: string;
  date: string;
  type: "consultation" | "procedure" | "follow-up" | "emergency";
  title: string;
  description: string;
  doctor: string;
  attachments?: string[];
  medications?: string[];
  allergies?: string[];
}

interface Treatment {
  id: string;
  name: string;
  date: string;
  status: "completed" | "in-progress" | "scheduled" | "cancelled";
  cost: number;
  description: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  notes: string;
  followUpDate?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

// Sample data
const samplePatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    address: "123 Main St, Beverly Hills, CA 90210",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    status: "active",
    lastVisit: "2025-01-15",
    nextAppointment: "2025-02-20",
    notes: "Prefers morning appointments. Sensitive to certain skincare products.",
    emergencyContact: {
      name: "John Johnson",
      phone: "+1 (555) 123-4568",
      relationship: "Spouse"
    },
    insurance: {
      provider: "HealthCare Plus",
      policyNumber: "HC123456789"
    },
    preferences: {
      communication: "email",
      language: "English"
    },
    medicalHistory: [
      {
        id: "mr1",
        date: "2025-01-15",
        type: "consultation",
        title: "Initial Consultation",
        description: "Discussed facial rejuvenation options and skin assessment",
        doctor: "Dr. Smith",
        medications: ["Retinol cream", "Vitamin C serum"],
        allergies: ["Latex"]
      }
    ],
    treatments: [
      {
        id: "t1",
        name: "Botox Treatment",
        date: "2025-01-20",
        status: "completed",
        cost: 450,
        description: "Forehead and crow's feet treatment",
        notes: "Patient responded well to treatment",
        followUpDate: "2025-04-20"
      }
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1978-07-22",
    address: "456 Oak Ave, Los Angeles, CA 90028",
    status: "active",
    lastVisit: "2025-01-10",
    notes: "Regular client, prefers Dr. Williams",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+1 (555) 234-5679",
      relationship: "Wife"
    },
    insurance: {
      provider: "MediCare Pro",
      policyNumber: "MP987654321"
    },
    preferences: {
      communication: "phone",
      language: "English"
    },
    medicalHistory: [],
    treatments: []
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@email.com", 
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1990-11-08",
    address: "789 Pine St, Santa Monica, CA 90401",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "pending",
    lastVisit: "2025-01-05",
    nextAppointment: "2025-02-15",
    notes: "New patient, interested in anti-aging treatments",
    emergencyContact: {
      name: "Carlos Rodriguez",
      phone: "+1 (555) 345-6790",
      relationship: "Brother"
    },
    insurance: {
      provider: "Blue Cross",
      policyNumber: "BC456789123"
    },
    preferences: {
      communication: "sms",
      language: "Spanish"
    },
    medicalHistory: [],
    treatments: []
  }
];

const sampleAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "1",
    date: "2025-02-20",
    time: "10:00 AM",
    type: "Follow-up",
    status: "scheduled"
  },
  {
    id: "a2", 
    patientId: "2",
    date: "2025-02-22",
    time: "2:00 PM",
    type: "Consultation",
    status: "scheduled"
  },
  {
    id: "a3",
    patientId: "3", 
    date: "2025-02-15",
    time: "11:00 AM",
    type: "Initial Consultation",
    status: "scheduled"
  }
];

// Animated height component
const AnimateChangeInHeight: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <motion.div
      className={cn(className, "overflow-hidden")}
      style={{ height }}
      animate={{ height }}
      transition={{ duration: 0.1, damping: 0.2, ease: "easeIn" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
};// Main component
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(samplePatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("overview");

  // Search and filter functionality
  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, patients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "inactive":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-primary/10">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {patient.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Age {calculateAge(patient.dateOfBirth)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Patient
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="w-4 h-4 mr-2 text-primary" />
              {patient.email}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-2 text-primary" />
              {patient.phone}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              Last visit: {formatDate(patient.lastVisit)}
            </div>
            {patient.nextAppointment && (
              <div className="flex items-center text-sm text-emerald-600">
                <Calendar className="w-4 h-4 mr-2" />
                Next: {formatDate(patient.nextAppointment)}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={() => setSelectedPatient(patient)}
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const PatientListItem = ({ patient }: { patient: Patient }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10 border-2 border-primary/10">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                  {patient.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">Age {calculateAge(patient.dateOfBirth)}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-sm">
                <p className="text-muted-foreground">{patient.email}</p>
                <p className="text-muted-foreground">{patient.phone}</p>
              </div>
              <div className="text-sm text-center">
                <p className="text-muted-foreground">Last visit</p>
                <p className="font-medium">{formatDate(patient.lastVisit)}</p>
              </div>
              {patient.nextAppointment && (
                <div className="text-sm text-center">
                  <p className="text-muted-foreground">Next appointment</p>
                  <p className="font-medium text-emerald-600">{formatDate(patient.nextAppointment)}</p>
                </div>
              )}
              <Badge variant="outline" className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPatient(patient)}
              >
                View
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Patient
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );  const PatientDetailsDialog = () => {
    if (!selectedPatient) return null;

    const patientAppointments = sampleAppointments.filter(
      (apt) => apt.patientId === selectedPatient.id
    );

    return (
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={selectedPatient.avatar} alt={selectedPatient.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {selectedPatient.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{selectedPatient.name}</DialogTitle>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge variant="outline" className={getStatusColor(selectedPatient.status)}>
                    {selectedPatient.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    Age {calculateAge(selectedPatient.dateOfBirth)}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">
                        Born {formatDate(selectedPatient.dateOfBirth)}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.address}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedPatient.emergencyContact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.emergencyContact.relationship}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="text-sm">{selectedPatient.emergencyContact.phone}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-primary" />
                      Insurance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedPatient.insurance.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        Policy: {selectedPatient.insurance.policyNumber}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-primary" />
                      Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Communication</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedPatient.preferences.communication}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.preferences.language}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.notes || "No notes available."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <div className="space-y-4">
                {selectedPatient.medicalHistory.length > 0 ? (
                  selectedPatient.medicalHistory.map((record) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{record.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(record.date)} • Dr. {record.doctor}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {record.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{record.description}</p>
                        
                        {record.medications && record.medications.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Syringe className="w-4 h-4 mr-2 text-primary" />
                              Medications
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {record.medications.map((med, index) => (
                                <Badge key={index} variant="secondary">
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.allergies && record.allergies.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
                              Allergies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {record.allergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Stethoscope className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No medical history recorded yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="treatments" className="mt-6">
              <div className="space-y-4">
                {selectedPatient.treatments.length > 0 ? (
                  selectedPatient.treatments.map((treatment) => (
                    <Card key={treatment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{treatment.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(treatment.date)} • ${treatment.cost}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getTreatmentStatusColor(treatment.status)}
                          >
                            {treatment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{treatment.description}</p>
                        {treatment.notes && (
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{treatment.notes}</p>
                          </div>
                        )}
                        {treatment.followUpDate && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-primary" />
                              Follow-up Date
                            </h4>
                            <p className="text-sm">{formatDate(treatment.followUpDate)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No treatments recorded yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="mt-6">
              <div className="space-y-4">
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.type}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(appointment.date)} at {appointment.time}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              appointment.status === "scheduled" && "bg-blue-100 text-blue-800",
                              appointment.status === "completed" && "bg-emerald-100 text-emerald-800",
                              appointment.status === "cancelled" && "bg-red-100 text-red-800",
                              appointment.status === "no-show" && "bg-orange-100 text-orange-800"
                            )}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No appointments scheduled.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };  const NewPatientDialog = () => (
    <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-primary" />
            Add New Patient
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Enter first name" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Enter last name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email address" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="Enter phone number" />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input id="dateOfBirth" type="date" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Enter full address" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setIsNewPatientDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button>
            Add Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient database and medical records
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </Button>
          <Button onClick={() => setIsNewPatientDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground">{patients.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {patients.filter(p => p.status === "active").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-100">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-amber-600">
                  {patients.filter(p => p.status === "pending").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold text-blue-600">
                  {patients.filter(p => {
                    const lastVisit = new Date(p.lastVisit);
                    const thisMonth = new Date();
                    return lastVisit.getMonth() === thisMonth.getMonth() && 
                           lastVisit.getFullYear() === thisMonth.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredPatients.map((patient) => (
                  <PatientListItem key={patient.id} patient={patient} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first patient."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button onClick={() => setIsNewPatientDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Patient
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <PatientDetailsDialog />
      <NewPatientDialog />
    </div>
  );
}