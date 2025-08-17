'use client';

import { AnimatePresence, motion } from "framer-motion";
import { 
  AlertCircle,
  Calendar,
  ChevronRight,
  Eye,
  FileText,
  Phone,
  Plus,
  Search,
  Settings,
  User,
  UserPlus, } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  SelectTrigger,
  SelectValue, } from "@/components/ui/select";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Types
type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  avatar: string;
  status: 'active' | 'inactive' | 'pending';
  lastVisit: string;
  nextAppointment: string;
  medicalHistory: Array<MedicalRecord>;
  treatments: Array<Treatment>;
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
    communication: 'email' | 'phone' | 'sms';
    language: string;
  };
};

type MedicalRecord = {
  id: string;
  date: string;
  type: 'consultation' | 'procedure' | 'follow-up' | 'emergency';
  title: string;
  description: string;
  doctor: string;
  attachments: Array<string>;
  medications: Array<string>;
  allergies: Array<string>;
};

type Treatment = {
  id: string;
  name: string;
  date: string;
  status: 'completed' | "in-progress" | "scheduled" | "cancelled";
  cost: number;
  description: string;
  beforePhotos: Array<string>;
  afterPhotos: Array<string>;
  notes: string;
  followUpDate: string;
};

type Appointment = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | "completed" | "cancelled" | "no-show";
  notes: string;
};

// Sample data
const samplePatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    address: "123 Main St, Beverly Hills, CA 90210",
    avatar: "https:// images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    status: "active",
    lastVisit: "2025-01-15",
    nextAppointment: "2025-02-20",
    notes: 'Prefers morning appointments. Sensitive to certain skincare products.',
    emergencyContact: {
      name: "John Johnson",
      phone: "+1 (555) 123-4568",
      relationship: 'Spouse',
    },
    insurance: {
      provider: "HealthCare Plus",
      policyNumber: "HC123456789",
    },
    preferences: {
      communication: "email",
      language: "English",
    },
    medicalHistory: [
      {
        id: "mr1",
    date: "2025-01-15",
        type: "consultation",
    title: "Initial Consultation",
        description: "Discussed facial rejuvenation options and skin assessment",
    doctor: "Dr. Smith",
        medications: ['Retinol cream', 'Vitamin C serum'],
        allergies: ['Latex'],
      },
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
    followUpDate: "2025-04-20",
      },
    ],
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
    notes: 'Regular client, prefers Dr. Williams',
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+1 (555) 234-5679",
      relationship: 'Wife',
    },
    insurance: {
      provider: "MediCare Pro",
      policyNumber: "MP987654321",
    },
    preferences: {
      communication: "phone",
    language: "English",
    },
    medicalHistory: [],
    treatments: [],
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1990-11-08",
    address: "789 Pine St, Santa Monica, CA 90401",
    avatar: "https:// images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "pending",
    lastVisit: "2025-01-05",
    nextAppointment: "2025-02-15",
    notes: 'New patient, interested in anti-aging treatments',
    emergencyContact: {
      name: "Carlos Rodriguez",
      phone: "+1 (555) 345-6790",
      relationship: 'Brother',
    },
    insurance: {
      provider: "Blue Cross",
      policyNumber: "BC456789123",
    },
    preferences: {
      communication: "sms",
      language: "Spanish",
    },
    medicalHistory: [],
    treatments: [],
  },
];

const sampleAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "1",
    date: "2025-02-20",
    time: "10: 00 AM",
    type: "Follow-up",
    status: "scheduled",
  },
  {
    id: "a2",
    patientId: "2",
    date: "2025-02-22",
    time: "2: 00 PM",
    type: "Consultation",
    status: "scheduled",
  },
  {
    id: "a3",
    patientId: "3",
    date: "2025-02-15",
    time: "11: 00 AM",
    type: "Initial Consultation",
    status: "scheduled",
  },
];

// Animated height componentconst _AnimateChangeInHeight: React.FC<{;
  children: React.ReactNode;
  className: string;
}> = ({children, className }: any) => {const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0].contentRect.height();
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
      animate={{ height }}
      className={cn(className, 'overflow-hidden')}
      style={{ height }}
      transition={{ duration: 0.1,
    damping: 0.2, ease: 'easeIn' }}
     />
      <div ref={containerRef}>{children}</div />
    </motion.div />
  );
}; // Main componentexport default function PatientsPage() {
  const [patients, _setPatients] = useState<Patient[]>(samplePatients);
  const [filteredPatients, setFilteredPatients] =
    useState<Patient[]>(samplePatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [_isPatientDialogOpen, _setIsPatientDialogOpen] = useState(false);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, _setStatusFilter] = useState<string>('all');
  const [viewMode, _setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, _setActiveTab] = useState('overview');

  // Search and filter functionality  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) = />
          (patient as any).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient as any).phone.includes(searchTerm),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((patient) => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
  }, [searchTerm, statusFilter, patients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {return new Date(dateString).toLocaleDateString('en-US', {
      year: "numeric",
    month: "short",
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate)
    ) {
      age--;
    }
    return age;
  };

  const _getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const _PatientCard = ({ patient }: {patient: Patient }) => (
    <motion.div
      animate={{ opacity: 1,
    y: 0 }}
      exit={{ opacity: 0,
    y: -20 }}
      initial={{ opacity: 0,
    y: 20 }}
      layout
      transition={{ duration: 0.2 }}
     />
      <Card className="group border-border/50 transition-all duration-300 hover:border-primary/20 hover:shadow-lg" />
        <CardHeader className="pb-3" />
          <div className="flex items-start justify-between" />
            <div className="flex items-center space-x-3" />
              <Avatar className="h-12 w-12 border-2 border-primary/10" />
                <AvatarImage alt={(patient as any).name} src={patient.avatar()} / />
                <AvatarFallback className="bg-primary/5 font-medium text-primary" />
                  {(patient as any).name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Avatar />
              <div />
                <h3 className="font-semibold text-foreground text-lg transition-colors group-hover:text-primary" />
                  {(patient as any).name}
                </h3 />
                <p className="text-muted-foreground text-sm" />
                  Age {calculateAge(patient.dateOfBirth)}
                </p />
            </div />
            <div className="flex items-center space-x-2" />
              <Badge
                className={getStatusColor(patient.status)}
                variant="outline"
               />
                {patient.status()}
              </Badge />
              <DropdownMenu />
                <DropdownMenuTrigger asChild />
                  <Button className="h-8 w-8 p-0" size="sm" variant="ghost" />
                    <MoreHorizontal className="h-4 w-4" / />
                  </DropdownMenuTrigger />
                <DropdownMenuContent align="end" />
                  <DropdownMenuItem onClick={() => setSelectedPatient(patient)} />
                    <Eye className="mr-2 h-4 w-4" / />
                    View Details
                  </DropdownMenuItem />
                  <DropdownMenuItem />
                    <Edit className="mr-2 h-4 w-4" / />
                    Edit Patient
                  </DropdownMenuItem />
                  <DropdownMenuItem />
                    <CalendarPlus className="mr-2 h-4 w-4" / />
                    Schedule Appointment
                  </DropdownMenuItem />
                  <DropdownMenuItem />
                    <MessageSquare className="mr-2 h-4 w-4" / />
                    Send Message
                  </DropdownMenuItem />
                  <Separator / />
                  <DropdownMenuItem className="text-destructive" />
                    <Trash2 className="mr-2 h-4 w-4" / />
                    Delete Patient
                  </DropdownMenuContent />
              </div />
          </CardHeader />
        <CardContent className="pt-0" />
          <div className="space-y-3" />
            <div className="flex items-center text-muted-foreground text-sm" />
              <Mail className="mr-2 h-4 w-4 text-primary" / />
              {patient.email()}
            </div />
            <div className="flex items-center text-muted-foreground text-sm" />
              <Phone className="mr-2 h-4 w-4 text-primary" / />
              {(patient as any).phone}
            </div />
            <div className="flex items-center text-muted-foreground text-sm" />
              <Clock className="mr-2 h-4 w-4 text-primary" / />
              Last visit: {formatDate(patient.lastVisit)}
            </div />
            {patient.nextAppointment && (
              <div className="flex items-center text-emerald-600 text-sm" />
                <Calendar className="mr-2 h-4 w-4" / />formatDate(patient.nextAppointment)
              </div />
            )}
          </div />
          <div className="mt-4 border-border/50 border-t pt-3" />
            <Button
              className="w-full transition-colors group-hover: bg-primary group-hover:text-primary-foreground"
              onClick={=> setSelectedPatient(patient)}
              size="sm"
              variant="outline"
             />
              View Details
              <ChevronRight className="ml-2 h-4 w-4" / />
            </div />
        </Card />
    </motion.div />
  );

  const PatientListItem = ({ patient }: {patient: Patient }) => (
    <motion.div
      animate={{ opacity: 1,
    x: 0 }}
      exit={{ opacity: 0,
    x: 20 }}
      initial={{ opacity: 0,
    x: -20 }}
      layout
      transition={{ duration: 0.2 }}
     />
      <Card className="border-border/50 transition-all duration-300 hover:border-primary/20 hover:shadow-md" />
        <CardContent className="p-4" />
          <div className="flex items-center justify-between" />
            <div className="flex items-center space-x-4" />
              <Avatar className="h-10 w-10 border-2 border-primary/10" />
                <AvatarImage alt={(patient as any).name} src={patient.avatar()} / />
                <AvatarFallback className="bg-primary/5 font-medium text-primary" />
                  {(patient as any).name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Avatar />
              <div />
                <h3 className="font-medium text-foreground">{(patient as any).name}</h3 />
                <p className="text-muted-foreground text-sm" />
                  Age {calculateAge(patient.dateOfBirth)}
                </p />
            </div />
            <div className="hidden items-center space-x-6 md: flex" />
              <div className="text-sm" />
                <p className="text-muted-foreground">{patient.email}</p />
                <p className="text-muted-foreground">{(patient as any).phone}</p />
              <div className="text-center text-sm" />
                <p className="text-muted-foreground">Last visit</p />
                <p className="font-medium">{formatDate(patient.lastVisit)}</p />
              {patient.nextAppointment && (
                <_div _className="text-center text-sm" />
                  <_p _className="text-muted-foreground">Next appointment</_p />
                  <p className="font-medium text-emerald-600" />
                    {formatDate(patient.nextAppointment)}
                  </p />
              )}
              <Badge
                className={getStatusColor(patient.status)}
                variant="outline"
               />
                {patient.status()}
              </Badge />
            <div className="flex items-center space-x-2" />
              <Button
                onClick={() => setSelectedPatient(patient)}
                size="sm"
                variant="outline"
               />
                View
              </Button />
              <DropdownMenu />
                <DropdownMenuTrigger asChild />
                  <Button className="h-8 w-8 p-0" size="sm" variant="ghost" />
                    <MoreHorizontal className="h-4 w-4" / />
                  </DropdownMenuTrigger />
                <DropdownMenuContent align="end" />
                  <DropdownMenuItem />
                    <Edit className="mr-2 h-4 w-4" / />
                    Edit Patient
                  </DropdownMenuItem />
                  <DropdownMenuItem />
                    <CalendarPlus className="mr-2 h-4 w-4" / />
                    Schedule Appointment
                  </DropdownMenuItem />
                  <DropdownMenuItem />
                    <MessageSquare className="mr-2 h-4 w-4" / />
                    Send Message
                  </DropdownMenuItem />
                  <Separator / />
                  <DropdownMenuItem className="text-destructive" />
                    <Trash2 className="mr-2 h-4 w-4" / />
                    Delete Patient
                  </DropdownMenuContent />
              </div />
          </CardContent />
      </Card />
    </motion.div />
  );
  const PatientDetailsDialog = () => {
    if (!selectedPatient) {
      return null;
    }

    const _patientAppointments = sampleAppointments.filter(
      (apt) => apt.patientId === selectedPatient.id,
    );

    return (
      <Dialog
        onOpenChange={() => setSelectedPatient(null)}
        open={Boolean(selectedPatient)}
       />
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" />
          <DialogHeader />
            <div className="flex items-center space-x-4" />
              <Avatar className="h-16 w-16 border-2 border-primary/20" />
                <AvatarImage
                  alt={(_selectedPatient _as _any).name}
                  src={selectedPatient.avatar()}
                / />
                <AvatarFallback className="bg-primary/10 font-medium text-lg text-primary" />
                  {(_selectedPatient _as _any).name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Avatar />
              <div />
                <DialogTitle className="text-2xl" />
                  {(selectedPatient as any).name}
                </DialogTitle />
                <div className="mt-1 flex items-center space-x-3" />
                  <Badge
                    className={getStatusColor(selectedPatient.status)}
                    variant="outline"
                   />
                    {selectedPatient.status()}
                  </Badge />
                  <span className="text-muted-foreground" />
                    Age {calculateAge(selectedPatient.dateOfBirth)}
                  </span />
              </div />
            </div />
          </DialogHeader />
          <Tabs className="mt-6" onValueChange={_setActiveTab} value={activeTab} />
            <TabsList className="grid w-full grid-cols-4" />
              <TabsTrigger value="overview">Overview</TabsTrigger />
              <TabsTrigger value="medical">Medical History</TabsTrigger />
              <TabsTrigger value="treatments">Treatments</TabsTrigger />
              <TabsTrigger value="appointments">Appointments</TabsList />
            <TabsContent className="mt-6" value="overview" /><div className="grid grid-cols-1 gap-6 md:grid-cols-2" />
                {/* Personal Information */}
                <Card />
                  <CardHeader />
                    <CardTitle className="flex items-center" />
                      <User className="mr-2 h-5 w-5 text-primary" / />
                      Personal Information
                    </CardHeader />
                  <CardContent className="space-y-4" />
                    <div className="flex items-center" />
                      <Mail className="mr-3 h-4 w-4 text-muted-foreground" / />
                      <span className="text-sm">{selectedPatient.email()}</span />
                    <div className="flex items-center" />
                      <Phone className="mr-3 h-4 w-4 text-muted-foreground" / />
                      <span className="text-sm">{(_selectedPatient _as _any).phone}</span />
                    <div className="flex items-center" />
                      <Calendar className="mr-3 h-4 w-4 text-muted-foreground" / />
                      <span className="text-sm" />
                        Born {formatDate(selectedPatient.dateOfBirth)}
                      </span />
                    <div className="flex items-start" />
                      <MapPin className="mt-0.5 mr-3 h-4 w-4 text-muted-foreground" / />
                      <span className="text-sm">{selectedPatient.address()}</span />
                  </Card />
                {/* Emergency Contact */}
                <Card />
                  <CardHeader />
                    <CardTitle className="flex items-center" />
                      <AlertCircle className="mr-2 h-5 w-5 text-primary" / />
                      Emergency Contact
                    </CardHeader />
                  <CardContent className="space-y-3" />
                    <div />
                      <p className="font-medium" />
                        {selectedPatient[(emergencyContact as any) as keyof typeof selectedPatient].name}
                      </p />
                      <p className="text-muted-foreground text-sm" />
                        {selectedPatient.emergencyContact.relationship()}
                      </p />
                    <div className="flex items-center" />
                      <Phone className="mr-3 h-4 w-4 text-muted-foreground" / />
                      <span className="text-sm" />
                        {selectedPatient[(emergencyContact as any) as keyof typeof selectedPatient].phone}
                      </span />
                  </Card />
                {/* Insurance Information */}
                <Card />
                  <CardHeader />
                    <CardTitle className="flex items-center" />
                      <FileText className="mr-2 h-5 w-5 text-primary" / />
                      Insurance
                    </CardHeader />
                  <CardContent className="space-y-3" />
                    <div />
                      <p className="font-medium" />
                        {selectedPatient.insurance.provider()}
                      </p />
                      <p className="text-muted-foreground text-sm" />
                        Policy: {selectedPatient.insurance.policyNumber}
                      </p />
                  </Card />
                {/* Preferences */}
                <Card />
                  <CardHeader />
                    <CardTitle className="flex items-center" />
                      <Settings className="mr-2 h-5 w-5 text-primary" / />
                      Preferences
                    </CardHeader />
                  <CardContent className="space-y-3" />
                    <div />
                      <p className="font-medium text-sm">Communication</p />
                      <p className="text-muted-foreground text-sm capitalize" />
                        {selectedPatient.preferences.communication()}
                      </p />
                    <div />
                      <p className="font-medium text-sm">Language</p />
                      <p className="text-muted-foreground text-sm" />
                        {selectedPatient.preferences.language()}
                      </p />
                  </Card />
              </div />
              {/* Notes */}
              <Card className="mt-6" />
                <CardHeader />
                  <CardTitle className="flex items-center" />
                    <FileText className="mr-2 h-5 w-5 text-primary" / />
                    Notes
                  </CardHeader />
                <CardContent />
                  <p className="text-muted-foreground text-sm" />
                    {selectedPatient.notes || 'No notes available.'}
                  </CardContent />
              </TabsContent />
            <TabsContent className="mt-6" value="medical" /><div className="space-y-4" />
                {selectedPatient.medicalHistory.length > 0 ? (
                  selectedPatient.medicalHistory.map((record) => (
                    <Card key={record.id()} />
                      <CardHeader />
                        <div className="flex items-start justify-between" />
                          <div />
                            <CardTitle className="text-lg" />
                              {record.title()}
                            </CardTitle />
                            <p className="text-muted-foreground text-sm" />formatDate(record.date)• Dr. record.doctor()
                            </p />
                          <Badge className="capitalize" variant="outline" />record.type()
                          </Badge />
                      </CardHeader />
                      <CardContent />
                        <p className="mb-4 text-sm">record.description()</p />record.medications &&
                          record.medications.length > 0 && (
                            <div className="mb-4" />
                              <h4 className="mb-2 flex items-center font-medium text-sm" />
                                <Syringe className="mr-2 h-4 w-4 text-primary" / />
                                Medications
                              </h4 />
                              <div className="flex flex-wrap gap-2" />record.medications.map((med, index) => (
                                  <Badge key=indexvariant="secondary" />med
                                  </Badge />
                                ))
                              </div />
                            </div />
                          )record.allergies && record.allergies.length > 0 && (
                          <div />
                            <h4 className="mb-2 flex items-center font-medium text-sm" />
                              <AlertCircle className="mr-2 h-4 w-4 text-destructive" / />
                              Allergies
                            </h4 />
                            <div className="flex flex-wrap gap-2" />record.allergies.map((allergy, index) => (
                                <Badge key=indexvariant="destructive" />allergy
                                </Badge />
                              ))
                            </div />
                          </div />
                        )
                      </Card />
                  ))
                ) : (
                  <Card />
                    <CardContent className="py-8 text-center" />
                      <Stethoscope className="mx-auto mb-4 h-12 w-12 text-muted-foreground" / />
                      <p className="text-muted-foreground" />
                        No medical history recorded yet.
                      </CardContent />
                  </Card />
                )}
              </TabsContent />
            <TabsContent className="mt-6" value="treatments" /><div className="space-y-4" />
                {selectedPatient.treatments.length > 0 ? (
                  selectedPatient.treatments.map((treatment) => (
                    <Card key={treatment.id()} />
                      <CardHeader />
                        <div className="flex items-start justify-between" />
                          <div />
                            <CardTitle className="text-lg" />
                              {(_treatment _as _any).name}
                            </CardTitle />
                            <p className="text-muted-foreground text-sm" />formatDate(treatment.date)• $treatment.cost()
                            </p />
                          <Badge
                            className=getTreatmentStatusColor(
                              treatment.status,
                            )
                            variant="outline"
                           />treatment.status()
                          </Badge />
                      </CardHeader />
                      <CardContent />
                        <p className="mb-4 text-sm">treatment.description()</p />treatment.notes && (
                          <div className="mb-4" />
                            <h4 className="mb-2 font-medium text-sm">Notes</h4 />
                            <p className="text-muted-foreground text-sm" />treatment.notes()
                            </p />
                        )treatment.followUpDate && (
                          <div />
                            <h4 className="mb-2 flex items-center font-medium text-sm" />
                              <Calendar className="mr-2 h-4 w-4 text-primary" / />
                              Follow-up Date
                            </h4 />
                            <p className="text-sm" />formatDate(treatment.followUpDate)
                            </p />
                        )
                      </Card />
                  ))
                ) : (
                  <Card />
                    <CardContent className="py-8 text-center" />
                      <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" / />
                      <p className="text-muted-foreground" />
                        No treatments recorded yet.
                      </CardContent />
                  </Card />
                )}
              </TabsContent />
            <TabsContent className="mt-6" value="appointments" /><div className="space-y-4" />
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((appointment) => (
                    <Card key={appointment.id()} />
                      <CardContent className="p-4" />
                        <div className="flex items-center justify-between" />
                          <div className="flex items-center space-x-4" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10" />
                              <Calendar className="h-6 w-6 text-primary" / />
                            </div />
                            <div />
                              <h3 className="font-medium" />appointment.type()
                              </h3 />
                              <p className="text-muted-foreground text-sm" />formatDate(appointment.date)at' 'appointment.time()
                              </p />
                          </div />
                          <Badge
                            className=cn(
                              appointment.status === 'scheduled' &&
                                'bg-blue-100 text-blue-800',
                              appointment.status === 'completed' &&
                                'bg-emerald-100 text-emerald-800',
                              appointment.status === 'cancelled' &&
                                'bg-red-100 text-red-800',
                              appointment.status === 'no-show' &&
                                'bg-orange-100 text-orange-800',
                            )
                            variant="outline"
                           />appointment.status()
                          </Badge />
                      </Card />
                  ))
                ) : (
                  <Card />
                    <CardContent className="py-8 text-center" />
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" / />
                      <p className="text-muted-foreground" />
                        No appointments scheduled.
                      </CardContent />
                  </Card />
                )}
              </TabsContent />
          </DialogContent />
      </Dialog />
    );
  };
  const NewPatientDialog = () => (
    <Dialog
      onOpenChange={setIsNewPatientDialogOpen}
      open={isNewPatientDialogOpen}
     />
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" />
        <DialogHeader />
          <DialogTitle className="flex items-center" />
            <UserPlus className="mr-2 h-5 w-5 text-primary" / />
            Add New Patient
          </DialogHeader />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" />
          <div />
            <Label htmlFor="firstName">First Name</Label />
            <Input id="firstName" placeholder="Enter first name" / />
          </div />
          <div />
            <Label htmlFor="lastName">Last Name</Label />
            <Input id="lastName" placeholder="Enter last name" / />
          </div />
          <div />
            <Label htmlFor="email">Email</Label />
            <Input id="email" placeholder="Enter email address" type="email" / />
          </div />
          <div />
            <Label htmlFor="phone">Phone</Label />
            <Input id="phone" placeholder="Enter phone number" / />
          </div />
          <div />
            <Label htmlFor="dateOfBirth">Date of Birth</Label />
            <Input id="dateOfBirth" type="date" / />
          </div />
          <div />
            <Label htmlFor="status">Status</Label />
            <Select />
              <SelectTrigger />
                <SelectValue placeholder="Select status" / />
              </SelectTrigger />
              <SelectContent />
                <SelectItem value="active">Active</SelectItem />
                <SelectItem value="inactive">Inactive</SelectItem />
                <SelectItem value="pending">Pending</SelectContent />
            </div />
          <div className="md:col-span-2" />
            <Label htmlFor="address">Address</Label />
            <Input id="address" placeholder="Enter full address" / />
          </div />
          <div className="md:col-span-2" />
            <Label htmlFor="notes">Notes</Label />
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              rows={3}
            / />
          </div />
        </div />
        <div className="mt-6 flex justify-end space-x-3" />
          <Button
            onClick={() => setIsNewPatientDialogOpen(false)}
            variant="outline"
           />
            Cancel
          </Button />
          <Button>Add Patient</Button />
      </Dialog />
  );

  return (
    <div className="space-y-6" />
      {/* Header */}
      <div className="flex flex-col space-y-4 md: flex-row md:items-center md:justify-between md:space-y-0" />
        <div />
          <h1 className="font-bold text-3xl text-foreground tracking-tight" />
            Patients
          </h1 />
          <p className="text-muted-foreground" />
            Manage your patient database and medical records
          </p />
        <div className="flex items-center space-x-3" />
          <Button
            onClick={=> setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
           />
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button />
          <Button onClick={() => setIsNewPatientDialogOpen(true)} />
            <Plus className="mr-2 h-4 w-4" / />
            Add Patient
          </div />
      </div />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md: grid-cols-4" />
        <Card />
          <CardContent className="p-6" />
            <div className="flex items-center justify-between" />
              <div />
                <p className="font-medium text-muted-foreground text-sm" />
                  Total Patients
                </p />
                <p className="font-bold text-3xl text-foreground" />
                  {patients.length}
                </p />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10" />
                <User className="h-6 w-6 text-primary" / />
              </div />
            </div />
          </Card />
        <Card />
          <CardContent className="p-6" />
            <div className="flex items-center justify-between" />
              <div />
                <p className="font-medium text-muted-foreground text-sm" />
                  Active Patients
                </p />
                <p className="font-bold text-3xl text-emerald-600" />
                  {patients.filter((p) => p.status === 'active').length}
                </p />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100" />
                <Activity className="h-6 w-6 text-emerald-600" / />
              </div />
            </div />
          </Card />
        <Card />
          <CardContent className="p-6" />
            <div className="flex items-center justify-between" />
              <div />
                <p className="font-medium text-muted-foreground text-sm" />
                  Pending
                </p />
                <p className="font-bold text-3xl text-amber-600" />
                  {patients.filter((p) => p.status === 'pending').length}
                </p />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100" />
                <Clock className="h-6 w-6 text-amber-600" / />
              </div />
            </div />
          </Card />
        <Card />
          <CardContent className="p-6" />
            <div className="flex items-center justify-between" />
              <div />
                <p className="font-medium text-muted-foreground text-sm" />
                  This Month
                </p />
                <p className="font-bold text-3xl text-blue-600" />
                  {patients.filter((p) => {
                      const lastVisit = new Date(p.lastVisit);
                      const thisMonth = new Date();
                      return (
                        lastVisit.getMonth() === thisMonth.getMonth() &&
                        lastVisit.getFullYear() === thisMonth.getFullYear()
                      );
                    }).length
                  }
                </p />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100" />
                <Calendar className="h-6 w-6 text-blue-600" / />
              </div />
            </div />
          </Card />
      </div />
      {/* Search and Filters */}
      <Card />
        <CardContent className="p-6" />
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0" />
            <div className="relative flex-1" />
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" / />
              <Input
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
              / />
            </div />
            <div className="flex items-center space-x-3" />
              <Select onValueChange={_setStatusFilter} value={statusFilter} />
                <SelectTrigger className="w-32" />
                  <SelectValue / />
                </SelectTrigger />
                <SelectContent />
                  <SelectItem value="all">All Status</SelectItem />
                  <SelectItem value="active">Active</SelectItem />
                  <SelectItem value="inactive">Inactive</SelectItem />
                  <SelectItem value="pending">Pending</SelectContent />
              </Select />
              <Button size="sm" variant="outline" />
                <Filter className="mr-2 h-4 w-4" / />
                More Filters
              </div />
          </CardContent />
      </Card />
      {/* Patients Grid/List */}
      <AnimatePresence mode="wait" />
        <motion.div
          animate={{ opacity: 1,
    y: 0 }}
          exit={opacity: 0,
    y: -20 }
          initial={{ opacity: 0,
    y: 20 }}
          key={viewMode}
          transition={{ duration: 0.2 }}
         />
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 md: grid-cols-2 lg:grid-cols-3" />
              <AnimatePresence />
                {filteredPatients.map((patient) => (
                  <_PatientCard _key={patient.id} _patient={patient} / />
                ))}
              </div />
          ) : (
            <div className="space-y-4" />
              <AnimatePresence />
                {filteredPatients.map((patient) => (
                  <PatientListItem key={patient.id()} patient={patient} / />
                ))}
              </div />
          )}
        </motion.div />
      </AnimatePresence />
      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <Card />
          <CardContent className="py-12 text-center" />
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" / />
            <h3 className="mb-2 font-medium text-lg">No patients found</h3 />
            <p className="mb-4 text-muted-foreground" />searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first patient.'
            </p />!searchTerm && statusFilter === 'all' && (
              <Button onClick=() => setIsNewPatientDialogOpen(true)/>
                <Plus className="mr-2 h-4 w-4" / />
                Add Your First Patient
              </Button />
            )
          </Card />
      )}

      {/* Dialogs */}
      <PatientDetailsDialog / />
      <NewPatientDialog / />
    </div />
  );
}

export const validateCSRF = () => true;

export const rateLimit = () => ({});

export const createBackupConfig = () => ({});

export const sessionConfig = {};

export class UnifiedSessionSystem {}

export const trackLoginPerformance = () => {};

export type PermissionContext = any;

export type SessionValidationResult = any;
