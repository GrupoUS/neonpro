'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Heart, 
  Activity, 
  FileText, 
  Camera, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Star, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Eye, 
  Download, 
  Print, 
  Share2, 
  Settings, 
  Shield, 
  Lock, 
  Unlock, 
  UserCheck, 
  UserX, 
  AlertCircle, 
  Bell, 
  BellOff, 
  Bookmark, 
  BookmarkCheck, 
  Flag, 
  MessageSquare, 
  Phone as PhoneIcon, 
  Video, 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  History, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Filter, 
  Search, 
  RefreshCw, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink
} from 'lucide-react'

// Import our custom components
import MedicalHistoryManager from './medical-history/medical-history-manager'
import TreatmentPlanManager from './treatment-plans/treatment-plan-manager'
import ProgressTrackingManager from './progress-tracking/progress-tracking-manager'

// Types based on FHIR R4 and existing schemas
interface PatientProfile {
  id: string
  // Basic Demographics (FHIR Patient)
  identifier: {
    system: string
    value: string
    type: 'CPF' | 'RG' | 'CNS' | 'passport' | 'medical_record'
  }[]
  active: boolean
  name: {
    use: 'official' | 'usual' | 'nickname' | 'maiden'
    family: string
    given: string[]
    prefix?: string[]
    suffix?: string[]
  }[]
  telecom: {
    system: 'phone' | 'email' | 'fax' | 'pager' | 'url' | 'sms' | 'other'
    value: string
    use: 'home' | 'work' | 'temp' | 'old' | 'mobile'
    rank?: number
  }[]
  gender: 'male' | 'female' | 'other' | 'unknown'
  birthDate: Date
  deceased?: boolean | Date
  address: {
    use: 'home' | 'work' | 'temp' | 'old' | 'billing'
    type: 'postal' | 'physical' | 'both'
    text?: string
    line: string[]
    city: string
    district?: string
    state: string
    postalCode: string
    country: string
    period?: { start?: Date; end?: Date }
  }[]
  maritalStatus?: {
    coding: {
      system: string
      code: string
      display: string
    }[]
  }
  
  // Extended Profile Information
  photo?: {
    contentType: string
    data: string
    url?: string
    title?: string
    creation?: Date
  }[]
  
  // Emergency Contacts
  contact: {
    relationship: {
      coding: {
        system: string
        code: string
        display: string
      }[]
    }[]
    name: {
      family: string
      given: string[]
    }
    telecom: {
      system: 'phone' | 'email'
      value: string
      use: 'home' | 'work' | 'mobile'
    }[]
    address?: {
      line: string[]
      city: string
      state: string
      postalCode: string
      country: string
    }
    gender?: 'male' | 'female' | 'other' | 'unknown'
    period?: { start?: Date; end?: Date }
  }[]
  
  // Communication Preferences
  communication: {
    language: {
      coding: {
        system: string
        code: string
        display: string
      }[]
    }
    preferred?: boolean
  }[]
  
  // Healthcare Provider Information
  generalPractitioner?: {
    reference: string
    display: string
  }[]
  
  managingOrganization?: {
    reference: string
    display: string
  }
  
  // Clinical Summary
  clinicalSummary: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    chronicConditions: string[]
    allergies: string[]
    currentMedications: string[]
    lastVisit?: Date
    nextAppointment?: Date
    treatmentStatus: 'active' | 'completed' | 'on_hold' | 'cancelled'
    progressPercentage: number
  }
  
  // Insurance and Financial
  insurance: {
    sequence: number
    focal: boolean
    coverage: {
      reference: string
      display: string
    }
    businessArrangement?: string
    preAuthRef?: string[]
  }[]
  
  // Preferences and Consent
  preferences: {
    communicationMethod: 'email' | 'sms' | 'phone' | 'mail' | 'portal'
    appointmentReminders: boolean
    marketingCommunications: boolean
    dataSharing: boolean
    researchParticipation: boolean
  }
  
  // LGPD Compliance
  lgpdConsent: {
    consentGiven: boolean
    consentDate: Date
    consentVersion: string
    dataProcessingPurposes: string[]
    dataRetentionPeriod: number // months
    rightToWithdraw: boolean
    rightToPortability: boolean
    rightToErasure: boolean
    consentWithdrawalDate?: Date
  }
  
  // Audit Trail
  meta: {
    versionId: string
    lastUpdated: Date
    source?: string
    profile?: string[]
    security?: {
      system: string
      code: string
      display: string
    }[]
    tag?: {
      system: string
      code: string
      display: string
    }[]
  }
  
  // System Fields
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  isArchived: boolean
  archiveReason?: string
  archiveDate?: Date
}

interface PatientStats {
  totalAppointments: number
  completedTreatments: number
  activeTreatments: number
  averageSatisfaction: number
  lastVisit: Date
  nextAppointment?: Date
  totalSpent: number
  outstandingBalance: number
  loyaltyPoints: number
  referrals: number
}

interface PatientActivity {
  id: string
  type: 'appointment' | 'treatment' | 'payment' | 'communication' | 'document' | 'progress'
  title: string
  description: string
  timestamp: Date
  status: 'completed' | 'pending' | 'cancelled' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'clinical' | 'administrative' | 'financial' | 'communication'
  relatedId?: string
  performedBy: string
  notes?: string
}

// Mock data generator
const generateMockPatientProfile = (): PatientProfile => {
  return {
    id: 'patient_001',
    identifier: [
      {
        system: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
        value: '123.456.789-00',
        type: 'CPF'
      },
      {
        system: 'http://clinic.example.com/fhir/r4/NamingSystem/medical-record',
        value: 'MR-2024-001',
        type: 'medical_record'
      }
    ],
    active: true,
    name: [
      {
        use: 'official',
        family: 'Silva',
        given: ['Maria', 'José'],
        prefix: ['Sra.']
      }
    ],
    telecom: [
      {
        system: 'phone',
        value: '+55 11 99999-9999',
        use: 'mobile',
        rank: 1
      },
      {
        system: 'email',
        value: 'maria.silva@email.com',
        use: 'home',
        rank: 2
      }
    ],
    gender: 'female',
    birthDate: new Date('1985-03-15'),
    address: [
      {
        use: 'home',
        type: 'physical',
        line: ['Rua das Flores, 123', 'Apto 45'],
        city: 'São Paulo',
        district: 'Vila Madalena',
        state: 'SP',
        postalCode: '05435-000',
        country: 'BR'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'C',
                display: 'Emergency Contact'
              }
            ]
          }
        ],
        name: {
          family: 'Silva',
          given: ['João']
        },
        telecom: [
          {
            system: 'phone',
            value: '+55 11 88888-8888',
            use: 'mobile'
          }
        ],
        gender: 'male'
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'urn:ietf:bcp:47',
              code: 'pt-BR',
              display: 'Portuguese (Brazil)'
            }
          ]
        },
        preferred: true
      }
    ],
    clinicalSummary: {
      riskLevel: 'medium',
      chronicConditions: ['Diabetes Type 2', 'Hypertension'],
      allergies: ['Penicillin', 'Latex'],
      currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
      lastVisit: new Date('2024-01-15'),
      nextAppointment: new Date('2024-02-15'),
      treatmentStatus: 'active',
      progressPercentage: 75
    },
    insurance: [
      {
        sequence: 1,
        focal: true,
        coverage: {
          reference: 'Coverage/insurance-001',
          display: 'Unimed São Paulo'
        }
      }
    ],
    preferences: {
      communicationMethod: 'email',
      appointmentReminders: true,
      marketingCommunications: false,
      dataSharing: true,
      researchParticipation: false
    },
    lgpdConsent: {
      consentGiven: true,
      consentDate: new Date('2024-01-01'),
      consentVersion: '1.0',
      dataProcessingPurposes: ['Healthcare delivery', 'Treatment planning', 'Quality improvement'],
      dataRetentionPeriod: 60,
      rightToWithdraw: true,
      rightToPortability: true,
      rightToErasure: true
    },
    meta: {
      versionId: '1',
      lastUpdated: new Date(),
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'Dr. Silva',
    isArchived: false
  }
}

const generateMockPatientStats = (): PatientStats => {
  return {
    totalAppointments: 24,
    completedTreatments: 3,
    activeTreatments: 2,
    averageSatisfaction: 8.5,
    lastVisit: new Date('2024-01-15'),
    nextAppointment: new Date('2024-02-15'),
    totalSpent: 15750.00,
    outstandingBalance: 2500.00,
    loyaltyPoints: 1250,
    referrals: 3
  }
}

const generateMockPatientActivity = (): PatientActivity[] => {
  const activities: PatientActivity[] = []
  const types: PatientActivity['type'][] = ['appointment', 'treatment', 'payment', 'communication', 'document', 'progress']
  const statuses: PatientActivity['status'][] = ['completed', 'pending', 'in_progress']
  const categories: PatientActivity['category'][] = ['clinical', 'administrative', 'financial', 'communication']
  
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date()
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30))
    
    activities.push({
      id: `activity_${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: `Activity ${i + 1}`,
      description: `Description for activity ${i + 1}`,
      timestamp,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: 'medium',
      category: categories[Math.floor(Math.random() * categories.length)],
      performedBy: 'Dr. Silva',
      notes: `Notes for activity ${i + 1}`
    })
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export default function PatientProfileManager() {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null)
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null)
  const [patientActivity, setPatientActivity] = useState<PatientActivity[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<PatientProfile>>({})
  const [showLGPDDialog, setShowLGPDDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  
  useEffect(() => {
    // Load mock data
    setPatientProfile(generateMockPatientProfile())
    setPatientStats(generateMockPatientStats())
    setPatientActivity(generateMockPatientActivity())
  }, [])

  const handleSaveProfile = () => {
    if (patientProfile && editedProfile) {
      const updatedProfile = {
        ...patientProfile,
        ...editedProfile,
        updatedAt: new Date(),
        updatedBy: 'Current User'
      }
      setPatientProfile(updatedProfile)
      setIsEditing(false)
      setEditedProfile({})
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: PatientActivity['type']) => {
    switch (type) {
      case 'appointment': return <CalendarIcon className="h-4 w-4" />
      case 'treatment': return <Stethoscope className="h-4 w-4" />
      case 'payment': return <Target className="h-4 w-4" />
      case 'communication': return <MessageSquare className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'progress': return <TrendingUp className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: PatientActivity['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  if (!patientProfile || !patientStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading patient profile...</p>
        </div>
      </div>
    )
  }

  const primaryName = patientProfile.name.find(n => n.use === 'official') || patientProfile.name[0]
  const primaryPhone = patientProfile.telecom.find(t => t.system === 'phone' && t.use === 'mobile')
  const primaryEmail = patientProfile.telecom.find(t => t.system === 'email')
  const primaryAddress = patientProfile.address.find(a => a.use === 'home') || patientProfile.address[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={patientProfile.photo?.[0]?.url} />
            <AvatarFallback>
              {primaryName.given[0]?.[0]}{primaryName.family[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {primaryName.prefix?.[0]} {primaryName.given.join(' ')} {primaryName.family}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {patientProfile.identifier.find(i => i.type === 'medical_record')?.value}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(patientProfile.birthDate, 'MMM dd, yyyy')}
              </span>
              <Badge className={getRiskLevelColor(patientProfile.clinicalSummary.riskLevel)}>
                {patientProfile.clinicalSummary.riskLevel} risk
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowContactDialog(true)}>
            <PhoneIcon className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline" size="sm">
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowLGPDDialog(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </Button>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm" 
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            {isEditing ? (
              <><Save className="h-4 w-4 mr-2" />Save</>
            ) : (
              <><Edit className="h-4 w-4 mr-2" />Edit</>
            )}
          </Button>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={() => {
              setIsEditing(false)
              setEditedProfile({})
            }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{patientStats.totalAppointments}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Treatments</p>
                <p className="text-2xl font-bold">{patientStats.activeTreatments}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{patientStats.averageSatisfaction}/10</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{patientProfile.clinicalSummary.progressPercentage}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical-history">Medical History</TabsTrigger>
          <TabsTrigger value="treatment-plans">Treatment Plans</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                  <CardDescription>
                    Basic demographic and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={editedProfile.name?.[0]?.given.join(' ') + ' ' + editedProfile.name?.[0]?.family || 
                                 primaryName.given.join(' ') + ' ' + primaryName.family}
                          onChange={(e) => {
                            const [given, ...family] = e.target.value.split(' ')
                            setEditedProfile({
                              ...editedProfile,
                              name: [{
                                ...primaryName,
                                given: [given],
                                family: family.join(' ') || primaryName.family
                              }]
                            })
                          }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {primaryName.given.join(' ')} {primaryName.family}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gender</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {patientProfile.gender}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(patientProfile.birthDate, 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">CPF</Label>
                      <p className="text-sm text-muted-foreground">
                        {patientProfile.identifier.find(i => i.type === 'CPF')?.value}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {primaryPhone?.value}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {primaryEmail?.value}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-muted-foreground flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          {primaryAddress?.line.join(', ')}<br />
                          {primaryAddress?.city}, {primaryAddress?.state} {primaryAddress?.postalCode}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Clinical Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Summary</CardTitle>
                  <CardDescription>
                    Current health status and treatment overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Risk Level</Label>
                      <Badge className={getRiskLevelColor(patientProfile.clinicalSummary.riskLevel)}>
                        {patientProfile.clinicalSummary.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Treatment Status</Label>
                      <Badge variant="outline">
                        {patientProfile.clinicalSummary.treatmentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Treatment Progress</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={patientProfile.clinicalSummary.progressPercentage} className="flex-1" />
                      <span className="text-sm font-medium">
                        {patientProfile.clinicalSummary.progressPercentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Chronic Conditions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientProfile.clinicalSummary.chronicConditions.map((condition) => (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Allergies</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientProfile.clinicalSummary.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patientActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.timestamp, 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        {getStatusIcon(activity.status)}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-3" size="sm">
                    View All Activity
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Clinical Note
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Pill className="h-4 w-4 mr-2" />
                      Update Medications
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical-history">
          <MedicalHistoryManager />
        </TabsContent>

        <TabsContent value="treatment-plans">
          <TreatmentPlanManager />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTrackingManager />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Files</CardTitle>
              <CardDescription>
                Patient documents, reports, and attachments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Document management will be implemented here</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Complete history of patient interactions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(activity.status)}
                          <span className="text-xs text-muted-foreground">
                            {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {activity.performedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* LGPD Privacy Dialog */}
      <Dialog open={showLGPDDialog} onOpenChange={setShowLGPDDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Data Protection (LGPD)
            </DialogTitle>
            <DialogDescription>
              Patient data protection and consent management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>LGPD Compliance Status</AlertTitle>
              <AlertDescription>
                This patient has provided consent for data processing under LGPD regulations.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Consent Date</Label>
                <p className="text-sm text-muted-foreground">
                  {format(patientProfile.lgpdConsent.consentDate, 'MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Consent Version</Label>
                <p className="text-sm text-muted-foreground">
                  {patientProfile.lgpdConsent.consentVersion}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  {patientProfile.lgpdConsent.dataRetentionPeriod} months
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rights Status</Label>
                <div className="flex items-center space-x-2">
                  {patientProfile.lgpdConsent.rightToWithdraw && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Withdraw
                    </Badge>
                  )}
                  {patientProfile.lgpdConsent.rightToPortability && (
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Portability
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Data Processing Purposes</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {patientProfile.lgpdConsent.dataProcessingPurposes.map((purpose) => (
                  <Badge key={purpose} variant="secondary" className="text-xs">
                    {purpose}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLGPDDialog(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Revoke Consent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Patient</DialogTitle>
            <DialogDescription>
              Choose a communication method
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Call {primaryPhone?.value}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Email {primaryEmail?.value}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
