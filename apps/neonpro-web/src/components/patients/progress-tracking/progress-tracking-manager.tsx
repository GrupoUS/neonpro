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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  Camera, 
  Upload, 
  Download, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Target,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  RefreshCw,
  Share2,
  Print,
  Save,
  Settings
} from 'lucide-react'

// Types based on FHIR R4 and existing schemas
interface ProgressEntry {
  id: string
  patientId: string
  treatmentPlanId: string
  entryDate: Date
  entryType: 'photo' | 'measurement' | 'note' | 'video' | 'audio' | 'document'
  title: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'clinical' | 'aesthetic' | 'functional' | 'patient_reported' | 'objective'
  
  // Media and attachments
  attachments: ProgressAttachment[]
  
  // Measurements and metrics
  measurements: ProgressMeasurement[]
  
  // Clinical assessment
  clinicalNotes: string
  painLevel?: number // 0-10 scale
  satisfactionLevel?: number // 0-10 scale
  functionalScore?: number // 0-100 scale
  
  // Progress indicators
  progressPercentage: number
  milestoneAchieved?: boolean
  nextSteps: string[]
  
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  isPrivate: boolean
  
  // LGPD compliance
  consentGiven: boolean
  dataRetentionDate?: Date
  anonymizationLevel: 'none' | 'partial' | 'full'
}

interface ProgressAttachment {
  id: string
  type: 'photo' | 'video' | 'audio' | 'document'
  filename: string
  url: string
  thumbnailUrl?: string
  size: number
  mimeType: string
  metadata: {
    width?: number
    height?: number
    duration?: number // for video/audio
    captureDevice?: string
    gpsLocation?: { lat: number; lng: number }
    timestamp: Date
  }
  annotations: ProgressAnnotation[]
  isBeforeAfter: boolean
  comparisonGroup?: string
}

interface ProgressAnnotation {
  id: string
  type: 'point' | 'area' | 'line' | 'text'
  coordinates: { x: number; y: number; width?: number; height?: number }
  content: string
  color: string
  createdBy: string
  createdAt: Date
}

interface ProgressMeasurement {
  id: string
  type: 'linear' | 'angular' | 'area' | 'volume' | 'weight' | 'temperature' | 'pressure'
  name: string
  value: number
  unit: string
  referenceRange?: { min: number; max: number }
  method: string
  accuracy: number
  notes?: string
}

interface ProgressComparison {
  id: string
  name: string
  baselineEntry: ProgressEntry
  currentEntry: ProgressEntry
  comparisonType: 'before_after' | 'timeline' | 'milestone'
  metrics: {
    improvementPercentage: number
    significantChanges: string[]
    concerns: string[]
    recommendations: string[]
  }
  generatedAt: Date
}

interface ProgressReport {
  id: string
  patientId: string
  treatmentPlanId: string
  reportType: 'weekly' | 'monthly' | 'milestone' | 'final' | 'custom'
  title: string
  period: { start: Date; end: Date }
  
  summary: {
    totalEntries: number
    progressPercentage: number
    milestonesAchieved: number
    totalMilestones: number
    averagePainLevel: number
    averageSatisfaction: number
    keyAchievements: string[]
    concerns: string[]
  }
  
  sections: {
    clinicalProgress: string
    patientFeedback: string
    objectiveMeasurements: string
    visualDocumentation: string
    recommendations: string
    nextSteps: string[]
  }
  
  attachments: string[] // URLs to generated charts, comparisons
  generatedAt: Date
  generatedBy: string
}

// Mock data generator
const generateMockProgressEntries = (): ProgressEntry[] => {
  const entries: ProgressEntry[] = []
  const entryTypes: ProgressEntry['entryType'][] = ['photo', 'measurement', 'note', 'video']
  const categories: ProgressEntry['category'][] = ['clinical', 'aesthetic', 'functional', 'patient_reported']
  const statuses: ProgressEntry['status'][] = ['active', 'completed']
  
  for (let i = 0; i < 15; i++) {
    const entryDate = new Date()
    entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 30))
    
    entries.push({
      id: `progress_${i + 1}`,
      patientId: 'patient_001',
      treatmentPlanId: 'treatment_001',
      entryDate,
      entryType: entryTypes[Math.floor(Math.random() * entryTypes.length)],
      title: `Progress Entry ${i + 1}`,
      description: `Detailed description of progress entry ${i + 1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: 'medium',
      category: categories[Math.floor(Math.random() * categories.length)],
      attachments: [],
      measurements: [],
      clinicalNotes: `Clinical notes for entry ${i + 1}`,
      painLevel: Math.floor(Math.random() * 11),
      satisfactionLevel: Math.floor(Math.random() * 11),
      functionalScore: Math.floor(Math.random() * 101),
      progressPercentage: Math.floor(Math.random() * 101),
      milestoneAchieved: Math.random() > 0.7,
      nextSteps: [`Next step ${i + 1}A`, `Next step ${i + 1}B`],
      createdBy: 'Dr. Silva',
      createdAt: entryDate,
      updatedAt: entryDate,
      tags: [`tag${i % 3 + 1}`, `category${i % 2 + 1}`],
      isPrivate: false,
      consentGiven: true,
      anonymizationLevel: 'none'
    })
  }
  
  return entries
}

const generateMockComparisons = (): ProgressComparison[] => {
  return [
    {
      id: 'comp_1',
      name: 'Before vs After Treatment',
      baselineEntry: generateMockProgressEntries()[0],
      currentEntry: generateMockProgressEntries()[1],
      comparisonType: 'before_after',
      metrics: {
        improvementPercentage: 75,
        significantChanges: ['Reduced swelling', 'Improved alignment'],
        concerns: ['Minor discomfort'],
        recommendations: ['Continue current protocol', 'Monitor progress weekly']
      },
      generatedAt: new Date()
    }
  ]
}

export default function ProgressTrackingManager() {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [comparisons, setComparisons] = useState<ProgressComparison[]>([])
  const [selectedEntry, setSelectedEntry] = useState<ProgressEntry | null>(null)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [activeTab, setActiveTab] = useState('timeline')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // Form state for new entry
  const [newEntry, setNewEntry] = useState<Partial<ProgressEntry>>({
    entryType: 'photo',
    title: '',
    description: '',
    category: 'clinical',
    priority: 'medium',
    status: 'active',
    painLevel: 0,
    satisfactionLevel: 0,
    functionalScore: 0,
    progressPercentage: 0,
    clinicalNotes: '',
    nextSteps: [],
    tags: [],
    isPrivate: false,
    consentGiven: true,
    anonymizationLevel: 'none'
  })

  useEffect(() => {
    // Load mock data
    setProgressEntries(generateMockProgressEntries())
    setComparisons(generateMockComparisons())
  }, [])

  const filteredEntries = progressEntries.filter(entry => {
    const matchesCategory = filterCategory === 'all' || entry.category === filterCategory
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesStatus && matchesSearch
  })

  const handleAddEntry = () => {
    if (!newEntry.title) return
    
    const entry: ProgressEntry = {
      id: `progress_${Date.now()}`,
      patientId: 'patient_001',
      treatmentPlanId: 'treatment_001',
      entryDate: selectedDate || new Date(),
      entryType: newEntry.entryType || 'photo',
      title: newEntry.title,
      description: newEntry.description,
      status: newEntry.status || 'active',
      priority: newEntry.priority || 'medium',
      category: newEntry.category || 'clinical',
      attachments: [],
      measurements: [],
      clinicalNotes: newEntry.clinicalNotes || '',
      painLevel: newEntry.painLevel,
      satisfactionLevel: newEntry.satisfactionLevel,
      functionalScore: newEntry.functionalScore,
      progressPercentage: newEntry.progressPercentage || 0,
      milestoneAchieved: false,
      nextSteps: newEntry.nextSteps || [],
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newEntry.tags || [],
      isPrivate: newEntry.isPrivate || false,
      consentGiven: newEntry.consentGiven || true,
      anonymizationLevel: newEntry.anonymizationLevel || 'none'
    }
    
    setProgressEntries([entry, ...progressEntries])
    setIsAddingEntry(false)
    setNewEntry({
      entryType: 'photo',
      title: '',
      description: '',
      category: 'clinical',
      priority: 'medium',
      status: 'active',
      painLevel: 0,
      satisfactionLevel: 0,
      functionalScore: 0,
      progressPercentage: 0,
      clinicalNotes: '',
      nextSteps: [],
      tags: [],
      isPrivate: false,
      consentGiven: true,
      anonymizationLevel: 'none'
    })
  }

  const getEntryIcon = (type: ProgressEntry['entryType']) => {
    switch (type) {
      case 'photo': return <Camera className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Mic className="h-4 w-4" />
      case 'measurement': return <BarChart3 className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: ProgressEntry['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'active': return <Activity className="h-4 w-4 text-blue-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: ProgressEntry['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">
            Monitor treatment progress with photos, measurements, and clinical notes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Print className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Progress Entry</DialogTitle>
                <DialogDescription>
                  Document treatment progress with photos, measurements, or clinical notes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry-type">Entry Type</Label>
                    <Select 
                      value={newEntry.entryType} 
                      onValueChange={(value: ProgressEntry['entryType']) => 
                        setNewEntry({ ...newEntry, entryType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="measurement">Measurement</SelectItem>
                        <SelectItem value="note">Clinical Note</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newEntry.category} 
                      onValueChange={(value: ProgressEntry['category']) => 
                        setNewEntry({ ...newEntry, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinical">Clinical</SelectItem>
                        <SelectItem value="aesthetic">Aesthetic</SelectItem>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="patient_reported">Patient Reported</SelectItem>
                        <SelectItem value="objective">Objective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Enter entry title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Enter detailed description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pain-level">Pain Level (0-10)</Label>
                    <Input
                      id="pain-level"
                      type="number"
                      min="0"
                      max="10"
                      value={newEntry.painLevel}
                      onChange={(e) => setNewEntry({ ...newEntry, painLevel: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satisfaction">Satisfaction (0-10)</Label>
                    <Input
                      id="satisfaction"
                      type="number"
                      min="0"
                      max="10"
                      value={newEntry.satisfactionLevel}
                      onChange={(e) => setNewEntry({ ...newEntry, satisfactionLevel: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress %</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={newEntry.progressPercentage}
                      onChange={(e) => setNewEntry({ ...newEntry, progressPercentage: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinical-notes">Clinical Notes</Label>
                  <Textarea
                    id="clinical-notes"
                    value={newEntry.clinicalNotes}
                    onChange={(e) => setNewEntry({ ...newEntry, clinicalNotes: e.target.value })}
                    placeholder="Enter clinical observations and notes"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="aesthetic">Aesthetic</SelectItem>
                <SelectItem value="functional">Functional</SelectItem>
                <SelectItem value="patient_reported">Patient Reported</SelectItem>
                <SelectItem value="objective">Objective</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEntry(entry)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {getEntryIcon(entry.entryType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{entry.title}</h3>
                          {getStatusIcon(entry.status)}
                          <Badge className={getPriorityColor(entry.priority)}>
                            {entry.priority}
                          </Badge>
                          <Badge variant="outline">
                            {entry.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {entry.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {format(entry.entryDate, 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(entry.entryDate, 'HH:mm')}
                          </span>
                          <span className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {entry.progressPercentage}% Progress
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {entry.progressPercentage > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Treatment Progress</span>
                        <span>{entry.progressPercentage}%</span>
                      </div>
                      <Progress value={entry.progressPercentage} className="h-2" />
                    </div>
                  )}
                  
                  {entry.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEntries
              .filter(entry => entry.entryType === 'photo' || entry.entryType === 'video')
              .map((entry) => (
                <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {entry.entryType === 'photo' ? (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Video className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(entry.entryDate, 'MMM dd, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Tracking</CardTitle>
              <CardDescription>
                Track quantitative progress metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avg Pain Level</p>
                          <p className="text-2xl font-bold">3.2/10</p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                          <p className="text-2xl font-bold">8.5/10</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Functional Score</p>
                          <p className="text-2xl font-bold">85/100</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Measurement charts will be displayed here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <div className="grid gap-4">
            {comparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardHeader>
                  <CardTitle>{comparison.name}</CardTitle>
                  <CardDescription>
                    {comparison.comparisonType.replace('_', ' ')} comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Baseline</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {format(comparison.baselineEntry.entryDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Current</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {format(comparison.currentEntry.entryDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Improvement</h4>
                      <div className="flex items-center space-x-2">
                        <Progress value={comparison.metrics.improvementPercentage} className="flex-1" />
                        <span className="text-sm font-medium">
                          {comparison.metrics.improvementPercentage}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Significant Changes</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {comparison.metrics.significantChanges.map((change, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {comparison.metrics.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center">
                              <Star className="h-3 w-3 text-blue-500 mr-2" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Reports</CardTitle>
              <CardDescription>
                Generate comprehensive progress reports for patients and providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="h-8 w-8 mb-2" />
                    <span>Weekly Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <span>Monthly Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <PieChart className="h-8 w-8 mb-2" />
                    <span>Final Report</span>
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Reports</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">Monthly Progress Report - January 2024</p>
                        <p className="text-xs text-muted-foreground">Generated on Jan 31, 2024</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getEntryIcon(selectedEntry.entryType)}
                <span>{selectedEntry.title}</span>
              </DialogTitle>
              <DialogDescription>
                {selectedEntry.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Entry Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedEntry.entryDate, 'MMMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEntry.category}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEntry.status)}
                    <span className="text-sm text-muted-foreground">
                      {selectedEntry.status}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedEntry.priority)}>
                    {selectedEntry.priority}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Pain Level</Label>
                  <p className="text-2xl font-bold">{selectedEntry.painLevel}/10</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Satisfaction</Label>
                  <p className="text-2xl font-bold">{selectedEntry.satisfactionLevel}/10</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <p className="text-2xl font-bold">{selectedEntry.progressPercentage}%</p>
                </div>
              </div>
              
              {selectedEntry.clinicalNotes && (
                <div>
                  <Label className="text-sm font-medium">Clinical Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEntry.clinicalNotes}
                  </p>
                </div>
              )}
              
              {selectedEntry.nextSteps.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Next Steps</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {selectedEntry.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-center">
                        <Target className="h-3 w-3 mr-2" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}