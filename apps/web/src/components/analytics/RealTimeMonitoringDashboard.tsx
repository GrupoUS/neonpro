'use client'

/**
 * RealTimeMonitoringDashboard - Live Healthcare Monitoring System
 *
 * Advanced real-time monitoring dashboard with anomaly detection, critical alerts,
 * and automated emergency response system for Brazilian healthcare facilities.
 *
 * @version 1.0.0
 * @author NeonPro Healthcare AI Team
 */

// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
// import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, } from '@/lib/utils'
import type {
  // AlertSeverity,
  // AutomatedAction,
  // CriticalAlert,
  // EmergencyTrigger,
  HealthcareMonitoring,
  // VitalSignsMonitoring,
  // WarningAlert,
} from '@/types/analytics'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  // Calendar, // Unused import
  CheckCircle,
  // Clock, // Unused import
  // Droplet, // Unused import
  // Eye, // Unused import
  // Filter, // Unused import
  // Heart, // Unused import
  Info,
  // MapPin, // Unused import
  // MessageSquare, // Unused import
  Monitor,
  Pause,
  Phone,
  Play,
  // Radio, // Unused import
  // RefreshCw, // Unused import
  // Search, // Unused import
  // Settings, // Unused import
  // Shield, // Unused import
  Stethoscope,
  // Thermometer, // Unused import
  TrendingDown,
  TrendingUp,
  // UserCheck, // Unused import
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  XCircle,
  // Zap, // Unused import
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState, } from 'react'

// ====== MOCK MONITORING DATA ======
const mockMonitoringData: HealthcareMonitoring = {
  patientId: 'patient-monitoring-123',
  monitoringStart: new Date(Date.now() - 2 * 60 * 60 * 1000,), // 2 hours ago
  isActive: true,
  monitoringData: {
    vitalSigns: {
      bloodPressure: {
        timestamps: [
          new Date(Date.now() - 120 * 60 * 1000,),
          new Date(Date.now() - 90 * 60 * 1000,),
          new Date(Date.now() - 60 * 60 * 1000,),
          new Date(Date.now() - 30 * 60 * 1000,),
          new Date(),
        ],
        values: [
          { systolic: 128, diastolic: 82, },
          { systolic: 132, diastolic: 85, },
          { systolic: 145, diastolic: 92, }, // Elevated
          { systolic: 138, diastolic: 88, },
          { systolic: 135, diastolic: 86, },
        ],
        interpolated: false,
        confidence: [0.95, 0.96, 0.94, 0.97, 0.98,],
      },
      heartRate: {
        timestamps: [
          new Date(Date.now() - 120 * 60 * 1000,),
          new Date(Date.now() - 90 * 60 * 1000,),
          new Date(Date.now() - 60 * 60 * 1000,),
          new Date(Date.now() - 30 * 60 * 1000,),
          new Date(),
        ],
        values: [72, 78, 94, 86, 81,], // Spike detected
        confidence: [0.98, 0.97, 0.95, 0.96, 0.97,],
      },
      temperature: {
        timestamps: [new Date(Date.now() - 30 * 60 * 1000,), new Date(),],
        values: [36.8, 37.2,], // Slight elevation
        confidence: [0.96, 0.94,],
      },
      weight: {
        timestamps: [new Date(Date.now() - 24 * 60 * 60 * 1000,),],
        values: [68.5,],
        confidence: [0.99,],
      },
      oxygenSaturation: {
        timestamps: [new Date(Date.now() - 30 * 60 * 1000,), new Date(),],
        values: [98, 97,],
        confidence: [0.99, 0.98,],
      },
      abnormalReadings: [
        {
          type: 'blood_pressure',
          value: '145/92',
          timestamp: new Date(Date.now() - 60 * 60 * 1000,),
          severity: 'warning',
          threshold: '140/90',
          description: 'Pressão arterial elevada detectada',
        },
        {
          type: 'heart_rate',
          value: '94 bpm',
          timestamp: new Date(Date.now() - 60 * 60 * 1000,),
          severity: 'info',
          threshold: '90 bpm',
          description: 'Frequência cardíaca ligeiramente elevada',
        },
      ],
      trendAnalysis: {
        bloodPressuretrend: 'increasing',
        heartRateVariability: 'moderate',
        overallStatus: 'attention_required',
        riskScore: 0.35,
      },
    },
    medicationCompliance: {
      currentMedications: [
        {
          name: 'Losartana 50mg',
          dosage: '1x ao dia',
          lastTaken: new Date(Date.now() - 8 * 60 * 60 * 1000,),
          nextDue: new Date(Date.now() + 16 * 60 * 60 * 1000,),
        },
        {
          name: 'Sinvastatina 20mg',
          dosage: '1x à noite',
          lastTaken: new Date(Date.now() - 14 * 60 * 60 * 1000,),
          nextDue: new Date(Date.now() + 10 * 60 * 60 * 1000,),
        },
      ],
      adherenceRate: 0.92,
      missedDoses: [
        {
          medication: 'Sinvastatina 20mg',
          scheduledTime: new Date(Date.now() - 38 * 60 * 60 * 1000,),
          actualTime: null,
          reason: 'Esqueceu',
        },
      ],
      sideEffects: [],
      drugInteractions: [],
      effectivenessScore: 87,
    },
    appointmentAttendance: {
      appointmentHistory: [],
      noShowRate: 0.08,
      cancellationRate: 0.12,
      rescheduleFrequency: 1.2,
      punctualityScore: 88,
      seasonalPatterns: [],
    },
    healthIndicators: {
      overallHealth: 82,
      riskFactors: ['Hypertension', 'Family history of cardiovascular disease',],
      improvements: ['Regular exercise routine', 'Improved diet compliance',],
      concerns: [
        'Blood pressure trending upward',
        'Medication adherence needs improvement',
      ],
    },
    riskFactors: {
      cardiovascular: 0.35,
      diabetes: 0.12,
      complications: 0.18,
      emergencyRisk: 0.08,
    },
    behavioralPatterns: {
      sleepQuality: 0.75,
      exerciseFrequency: 0.68,
      stressLevels: 0.42,
      dietCompliance: 0.83,
    },
  },
  alerts: {
    criticalAlerts: [],
    warningAlerts: [
      {
        id: 'warning-bp-001',
        type: 'medical',
        severity: 'warning',
        title: 'Pressão Arterial Elevada',
        message: 'Pressão arterial de 145/92 mmHg detectada, acima do limite recomendado de 140/90',
        patientId: 'patient-monitoring-123',
        clinicId: 'clinic-001',
        triggeredAt: new Date(Date.now() - 60 * 60 * 1000,),
        escalationLevel: 1,
        autoActions: [],
        requiredActions: [
          'Verificar medicação',
          'Agendar consulta de seguimento',
        ],
        dismissible: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000,),
      },
    ],
    complianceAlerts: [],
    emergencyTriggers: [],
  },
  automatedActions: [
    {
      id: 'auto-001',
      type: 'notification',
      triggeredBy: 'blood_pressure_alert',
      executedAt: new Date(Date.now() - 58 * 60 * 1000,),
      status: 'completed',
      parameters: { recipient: 'primary_physician', alertType: 'bp_elevation', },
      result: { success: true, notificationSent: true, },
      retryCount: 0,
      maxRetries: 3,
    },
  ],
  escalationPaths: [],
  lastUpdate: new Date(),
}

const activePatientsMonitoring = [
  {
    id: 'patient-001',
    name: 'Maria Silva Santos',
    age: 45,
    condition: 'Pós-operatório Blefaroplastia',
    riskLevel: 'low' as const,
    lastReading: new Date(Date.now() - 5 * 60 * 1000,),
    status: 'stable' as const,
    alerts: 0,
    vitals: { hr: 72, bp: '120/80', temp: 36.5, spo2: 98, },
  },
  {
    id: 'patient-002',
    name: 'João Costa Lima',
    age: 52,
    condition: 'Lipoaspiração pós-cirúrgico',
    riskLevel: 'medium' as const,
    lastReading: new Date(Date.now() - 2 * 60 * 1000,),
    status: 'attention' as const,
    alerts: 1,
    vitals: { hr: 88, bp: '145/92', temp: 36.8, spo2: 97, },
  },
  {
    id: 'patient-003',
    name: 'Ana Paula Ferreira',
    age: 38,
    condition: 'Preenchimento facial - acompanhamento',
    riskLevel: 'low' as const,
    lastReading: new Date(Date.now() - 1 * 60 * 1000,),
    status: 'stable' as const,
    alerts: 0,
    vitals: { hr: 68, bp: '118/75', temp: 36.4, spo2: 99, },
  },
  {
    id: 'patient-004',
    name: 'Carlos Roberto Silva',
    age: 41,
    condition: 'Rinoplastia - 2º dia pós-cirúrgico',
    riskLevel: 'high' as const,
    lastReading: new Date(Date.now() - 10 * 60 * 1000,),
    status: 'critical' as const,
    alerts: 3,
    vitals: { hr: 102, bp: '160/95', temp: 37.8, spo2: 94, },
  },
]

interface MonitoringDashboardProps {
  clinicId: string
  refreshInterval?: number
  soundAlertsEnabled?: boolean
  autoRefresh?: boolean
}

export default function RealTimeMonitoringDashboard({
  clinicId: _clinicId,
  refreshInterval = 30,
  soundAlertsEnabled = true,
  autoRefresh = true,
}: MonitoringDashboardProps,) {
  // ====== STATE MANAGEMENT ======
  const [isMonitoring, setIsMonitoring,] = useState(true,)
  const [selectedPatient, setSelectedPatient,] = useState<string>('patient-002',)
  const [monitoringData, setMonitoringData,] = useState<HealthcareMonitoring>(mockMonitoringData,)
  const [soundEnabled, setSoundEnabled,] = useState(soundAlertsEnabled,)
  const [alertFilter, setAlertFilter,] = useState<
    'all' | 'critical' | 'warning' | 'info'
  >('all',)
  const [connectionStatus, setConnectionStatus,] = useState<
    'connected' | 'disconnected' | 'reconnecting'
  >('connected',)
  const [lastRefresh, setLastRefresh,] = useState(new Date(),)

  // ====== REAL-TIME DATA SIMULATION ======
  useEffect(() => {
    if (!isMonitoring || !autoRefresh) {
      return
    }

    const interval = setInterval(() => {
      // Simulate real-time data updates
      setLastRefresh(new Date(),)

      // Simulate occasional connection issues
      if (Math.random() < 0.02) {
        // 2% chance of connection issue
        setConnectionStatus('reconnecting',)
        setTimeout(() => setConnectionStatus('connected',), 3000,)
      }

      // Update monitoring data with new simulated readings
      setMonitoringData((prev,) => ({
        ...prev,
        lastUpdate: new Date(),
        monitoringData: {
          ...prev.monitoringData,
          vitalSigns: {
            ...prev.monitoringData.vitalSigns,
            heartRate: {
              ...prev.monitoringData.vitalSigns.heartRate,
              timestamps: [
                ...prev.monitoringData.vitalSigns.heartRate.timestamps.slice(
                  -4,
                ),
                new Date(),
              ],
              values: [
                ...prev.monitoringData.vitalSigns.heartRate.values.slice(-4,),
                75 + Math.random() * 20,
              ],
            },
          },
        },
      }))
    }, refreshInterval * 1000,)

    return () => clearInterval(interval,)
  }, [isMonitoring, autoRefresh, refreshInterval,],)

  // ====== EVENT HANDLERS ======
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring((prev,) => !prev)
  }, [],)

  const handlePatientSelect = useCallback((patientId: string,) => {
    setSelectedPatient(patientId,)
    // In real implementation, fetch patient-specific monitoring data
  }, [],)

  const handleAlertAction = useCallback(
    (alertId: string, action: 'acknowledge' | 'dismiss' | 'escalate',) => {
      console.log(`Alert ${alertId} ${action}ed`,)
      // In real implementation, update alert status
    },
    [],
  )

  // const _playAlertSound = useCallback(() => {
  //   if (soundEnabled && typeof window !== "undefined") {
  //     // In real implementation, play alert sound
  //     console.log("Alert sound triggered");
  //   }
  // }, [soundEnabled]);

  // ====== COMPUTED VALUES ======
  const currentPatient = useMemo(
    () => activePatientsMonitoring.find((p,) => p.id === selectedPatient),
    [selectedPatient,],
  )

  const totalAlerts = useMemo(
    () =>
      monitoringData.alerts.criticalAlerts.length
      + monitoringData.alerts.warningAlerts.length
      + monitoringData.alerts.complianceAlerts.length,
    [monitoringData.alerts,],
  )

  const filteredAlerts = useMemo(() => {
    const allAlerts = [
      ...monitoringData.alerts.criticalAlerts.map((a,) => ({
        ...a,
        category: 'critical' as const,
      })),
      ...monitoringData.alerts.warningAlerts.map((a,) => ({
        ...a,
        category: 'warning' as const,
      })),
      ...monitoringData.alerts.complianceAlerts.map((a,) => ({
        ...a,
        category: 'compliance' as const,
      })),
    ]

    if (alertFilter === 'all') {
      return allAlerts
    }
    return allAlerts.filter((alert,) => alert.severity === alertFilter)
  }, [monitoringData.alerts, alertFilter,],)

  const systemHealth = useMemo(() => {
    const connectedDevices = activePatientsMonitoring.length
    const alertsCount = totalAlerts
    const uptime = connectionStatus === 'connected' ? 99.8 : 95.2

    return {
      connectedDevices,
      alertsCount,
      uptime,
      status: connectionStatus,
      dataQuality: 98.5,
    }
  }, [totalAlerts, connectionStatus,],)

  // ====== RENDER COMPONENTS ======
  const renderPatientCard = (patient: (typeof activePatientsMonitoring)[0],) => (
    <Card
      key={patient.id}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        selectedPatient === patient.id ? 'ring-2 ring-blue-500 bg-blue-50' : '',
        patient.status === 'critical'
          ? 'border-l-4 border-l-red-500'
          : patient.status === 'attention'
          ? 'border-l-4 border-l-yellow-500'
          : 'border-l-4 border-l-green-500',
      )}
      onClick={() => handlePatientSelect(patient.id,)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/avatars/${patient.id}.jpg`} />
              <AvatarFallback>
                {patient.name
                  .split(' ',)
                  .map((n,) => n[0])
                  .join('',)
                  .slice(0, 2,)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{patient.name}</div>
              <div className="text-xs text-muted-foreground">
                {patient.age} anos
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={patient.riskLevel === 'critical'
                ? 'destructive'
                : patient.riskLevel === 'high'
                ? 'destructive'
                : patient.riskLevel === 'medium'
                ? 'secondary'
                : 'outline'}
            >
              {patient.riskLevel === 'critical'
                ? 'Crítico'
                : patient.riskLevel === 'high'
                ? 'Alto'
                : patient.riskLevel === 'medium'
                ? 'Médio'
                : 'Baixo'}
            </Badge>
            {patient.alerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {patient.alerts} alerta{patient.alerts > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {patient.condition}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">FC:</span>
            <span
              className={cn(
                'font-medium',
                patient.vitals.hr > 100
                  ? 'text-red-600'
                  : patient.vitals.hr > 90
                  ? 'text-yellow-600'
                  : 'text-green-600',
              )}
            >
              {patient.vitals.hr} bpm
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">PA:</span>
            <span className="font-medium">{patient.vitals.bp}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Temp:</span>
            <span
              className={cn(
                'font-medium',
                patient.vitals.temp > 37.5
                  ? 'text-red-600'
                  : patient.vitals.temp > 37
                  ? 'text-yellow-600'
                  : 'text-green-600',
              )}
            >
              {patient.vitals.temp}°C
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">SpO₂:</span>
            <span
              className={cn(
                'font-medium',
                patient.vitals.spo2 < 95
                  ? 'text-red-600'
                  : patient.vitals.spo2 < 97
                  ? 'text-yellow-600'
                  : 'text-green-600',
              )}
            >
              {patient.vitals.spo2}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div
            className={cn(
              'flex items-center space-x-1 text-xs',
              patient.status === 'critical'
                ? 'text-red-600'
                : patient.status === 'attention'
                ? 'text-yellow-600'
                : 'text-green-600',
            )}
          >
            <Activity className="h-3 w-3" />
            <span>
              {patient.status === 'critical'
                ? 'Crítico'
                : patient.status === 'attention'
                ? 'Atenção'
                : 'Estável'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round((Date.now() - patient.lastReading.getTime()) / 60_000,)}
            min atrás
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderVitalSignCard = (
    title: string,
    current: string | number,
    previous: string | number,
    unit: string,
    trend: 'up' | 'down' | 'stable',
    status: 'normal' | 'warning' | 'critical',
  ) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          <div
            className={cn(
              'flex items-center space-x-1',
              trend === 'up'
                ? 'text-red-500'
                : trend === 'down'
                ? 'text-green-500'
                : 'text-gray-500',
            )}
          >
            {trend === 'up'
              ? <TrendingUp className="h-3 w-3" />
              : trend === 'down'
              ? <TrendingDown className="h-3 w-3" />
              : <Activity className="h-3 w-3" />}
          </div>
        </div>
        <div className="space-y-2">
          <div
            className={cn(
              'text-2xl font-bold',
              status === 'critical'
                ? 'text-red-600'
                : status === 'warning'
                ? 'text-yellow-600'
                : 'text-green-600',
            )}
          >
            {current}
            {unit}
          </div>
          <div className="text-xs text-muted-foreground">
            Anterior: {previous}
            {unit}
          </div>
          <Badge
            variant={status === 'critical'
              ? 'destructive'
              : status === 'warning'
              ? 'secondary'
              : 'outline'}
            className="text-xs"
          >
            {status === 'critical'
              ? 'Crítico'
              : status === 'warning'
              ? 'Atenção'
              : 'Normal'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const renderAlertCard = (alert: unknown, index: number,) => (
    <Card
      key={alert.id || index}
      className={cn(
        'border-l-4',
        alert.severity === 'critical'
          ? 'border-l-red-500 bg-red-50'
          : alert.severity === 'error'
          ? 'border-l-red-500 bg-red-50'
          : alert.severity === 'warning'
          ? 'border-l-yellow-500 bg-yellow-50'
          : 'border-l-blue-500 bg-blue-50',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {alert.severity === 'critical' || alert.severity === 'error'
              ? <AlertTriangle className="h-4 w-4 text-red-600" />
              : alert.severity === 'warning'
              ? <AlertCircle className="h-4 w-4 text-yellow-600" />
              : <Info className="h-4 w-4 text-blue-600" />}
            <CardTitle className="text-base">{alert.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={alert.severity === 'critical' || alert.severity === 'error'
                ? 'destructive'
                : alert.severity === 'warning'
                ? 'secondary'
                : 'outline'}
            >
              {alert.severity === 'critical'
                ? 'Crítico'
                : alert.severity === 'error'
                ? 'Erro'
                : alert.severity === 'warning'
                ? 'Aviso'
                : 'Info'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {alert.triggeredAt
                ? new Date(alert.triggeredAt,).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                },)
                : 'Agora'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAlertAction(alert.id, 'acknowledge',)}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmar
            </Button>
            {alert.dismissible && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAlertAction(alert.id, 'dismiss',)}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Dispensar
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAlertAction(alert.id, 'escalate',)}
            >
              <Phone className="h-3 w-3 mr-1" />
              Escalar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ====== MAIN RENDER ======
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Monitor className="h-8 w-8 text-blue-600" />
            <span>Monitoramento em Tempo Real</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema avançado de monitoramento com detecção de anomalias e alertas automáticos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                connectionStatus === 'connected'
                  ? 'bg-green-500 animate-pulse'
                  : connectionStatus === 'reconnecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500',
              )}
            />
            <span className="text-sm font-medium">
              {connectionStatus === 'connected'
                ? 'Conectado'
                : connectionStatus === 'reconnecting'
                ? 'Reconectando...'
                : 'Desconectado'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled,)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleMonitoring}
          >
            {isMonitoring
              ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              )
              : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </>
              )}
          </Button>
        </div>
      </div>

      {/* System Status Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-l-blue-500">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {systemHealth.connectedDevices} Pacientes Monitorados
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">
                {systemHealth.alertsCount} Alertas Ativos
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected'
                ? <Wifi className="h-5 w-5 text-green-600" />
                : <WifiOff className="h-5 w-5 text-red-600" />}
              <span className="font-medium">
                Uptime: {systemHealth.uptime}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Última atualização: {lastRefresh.toLocaleTimeString('pt-BR',)}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Qualidade dos Dados:{' '}
              <span className="font-bold text-green-600">
                {systemHealth.dataQuality}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pacientes Monitorados</span>
                <Badge variant="outline">
                  {activePatientsMonitoring.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {activePatientsMonitoring.map(renderPatientCard,)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Monitoring Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Patient Details */}
          {currentPatient && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${currentPatient.id}.jpg`} />
                      <AvatarFallback className="text-lg">
                        {currentPatient.name
                          .split(' ',)
                          .map((n,) => n[0])
                          .join('',)
                          .slice(0, 2,)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {currentPatient.name}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {currentPatient.age} anos • {currentPatient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={currentPatient.status === 'critical'
                        ? 'destructive'
                        : currentPatient.status === 'attention'
                        ? 'secondary'
                        : 'outline'}
                      className="text-base px-3 py-1"
                    >
                      {currentPatient.status === 'critical'
                        ? 'Estado Crítico'
                        : currentPatient.status === 'attention'
                        ? 'Requer Atenção'
                        : 'Estável'}
                    </Badge>
                    <Button size="sm">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Ver Prontuário
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {renderVitalSignCard(
              'Frequência Cardíaca',
              currentPatient?.vitals.hr || 0,
              75,
              ' bpm',
              'up',
              (currentPatient?.vitals.hr || 0) > 100
                ? 'critical'
                : (currentPatient?.vitals.hr || 0) > 90
                ? 'warning'
                : 'normal',
            )}
            {renderVitalSignCard(
              'Pressão Arterial',
              currentPatient?.vitals.bp || '120/80',
              '115/75',
              '',
              'up',
              currentPatient?.vitals.bp.includes('160',)
                ? 'critical'
                : currentPatient?.vitals.bp.includes('145',)
                ? 'warning'
                : 'normal',
            )}
            {renderVitalSignCard(
              'Temperatura',
              currentPatient?.vitals.temp || 36.5,
              36.2,
              '°C',
              'up',
              (currentPatient?.vitals.temp || 0) > 37.5
                ? 'critical'
                : (currentPatient?.vitals.temp || 0) > 37
                ? 'warning'
                : 'normal',
            )}
            {renderVitalSignCard(
              'Saturação O₂',
              currentPatient?.vitals.spo2 || 98,
              99,
              '%',
              'down',
              (currentPatient?.vitals.spo2 || 0) < 95
                ? 'critical'
                : (currentPatient?.vitals.spo2 || 0) < 97
                ? 'warning'
                : 'normal',
            )}
          </div>

          {/* Vital Signs Trends Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências dos Sinais Vitais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitoramento contínuo das últimas 2 horas
              </p>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>
                  Gráfico de tendências em tempo real será implementado aqui
                </p>
                <p className="text-sm">Incluindo FC, PA, Temp e SpO₂</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BellRing className="h-5 w-5 text-yellow-600" />
                  <span>Alertas Ativos</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={alertFilter}
                    onValueChange={(value: unknown,) => setAlertFilter(value,)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="critical">Críticos</SelectItem>
                      <SelectItem value="warning">Avisos</SelectItem>
                      <SelectItem value="info">Informativos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">
                    {filteredAlerts.length} alerta
                    {filteredAlerts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0
                ? (
                  <div className="space-y-4">
                    {filteredAlerts.map(renderAlertCard,)}
                  </div>
                )
                : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Nenhum alerta ativo no momento</p>
                    <p className="text-sm">
                      Todos os pacientes estão dentro dos parâmetros normais
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
