/**
 * Automated Reminder Engine for NeonPro
 * 
 * Sistema automatizado de lembretes baseado em consultas e procedimentos
 * com suporte a múltiplos momentos, timezones e personalização por paciente
 */

import { z } from 'zod'
import { NotificationEngine } from './notification-engine'

export interface ReminderRule {
  id: string
  name: string
  enabled: boolean
  procedureTypes: string[]
  reminderTiming: ReminderTiming[]
  channels: string[]
  template: ReminderTemplate
  conditions: ReminderCondition[]
  clinicId: string
  createdAt: Date
  updatedAt: Date
}

export interface ReminderTiming {
  id: string
  timeBeforeAppointment: number // in minutes
  label: string // e.g., "7 dias antes", "1 dia antes", "2 horas antes"
  enabled: boolean
  priority: 'low' | 'medium' | 'high'
  channels: string[] // preferred channels for this timing
}

export interface ReminderTemplate {
  id: string
  name: string
  channels: {
    sms?: string
    email?: {
      subject: string
      html: string
      text: string
    }
    whatsapp?: string
    push?: {
      title: string
      body: string
    }
  }
  variables: string[] // available template variables
  personalizationRules: PersonalizationRule[]
}

export interface PersonalizationRule {
  id: string
  condition: string // e.g., "patient.age > 65"
  template: Partial<ReminderTemplate['channels']>
  priority: number
}

export interface ReminderCondition {
  field: string // e.g., "appointment.status", "patient.preferences.notifications"
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface ScheduledReminder {
  id: string
  appointmentId: string
  patientId: string
  clinicId: string
  ruleId: string
  timingId: string
  scheduledAt: Date
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  channels: string[]
  template: ReminderTemplate
  personalizedContent?: Record<string, any>
  attempts: ReminderAttempt[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ReminderAttempt {
  id: string
  channel: string
  attemptedAt: Date
  status: 'success' | 'failed' | 'retry'
  notificationId?: string
  error?: string
  deliveryStatus?: string
  cost?: number
}

export interface AppointmentData {
  id: string
  patientId: string
  clinicId: string
  professionalId: string
  procedureType: string
  scheduledAt: Date
  duration: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  timezone: string
  metadata: Record<string, any>
}

export interface PatientPreferences {
  patientId: string
  preferredChannels: string[]
  preferredTimes: string[] // e.g., ["morning", "afternoon"]
  timezone: string
  quietHours: {
    start: string // HH:mm format
    end: string
  }
  optOut: boolean
  language: string
  customization: Record<string, any>
}

const ReminderRuleSchema = z.object({
  name: z.string().min(1).max(100),
  enabled: z.boolean(),
  procedureTypes: z.array(z.string()),
  reminderTiming: z.array(z.object({
    timeBeforeAppointment: z.number().min(0),
    label: z.string(),
    enabled: z.boolean(),
    priority: z.enum(['low', 'medium', 'high']),
    channels: z.array(z.string())
  })),
  channels: z.array(z.string()),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than']),
    value: z.any()
  })),
  clinicId: z.string()
})

export class AutomatedReminderEngine {
  private notificationEngine: NotificationEngine
  private reminderRules: Map<string, ReminderRule> = new Map()
  private scheduledReminders: Map<string, ScheduledReminder> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()

  constructor(notificationEngine: NotificationEngine) {
    this.notificationEngine = notificationEngine
    this.initializeEngine()
  }

  private async initializeEngine(): Promise<void> {
    console.log('🔔 Initializing Automated Reminder Engine...')
    
    // Load reminder rules from database
    await this.loadReminderRules()
    
    // Load scheduled reminders
    await this.loadScheduledReminders()
    
    // Start reminder scheduler
    this.startReminderScheduler()
    
    console.log('✅ Automated Reminder Engine initialized successfully')
  }

  // Reminder Rule Management
  public async createReminderRule(ruleData: Partial<ReminderRule>): Promise<ReminderRule> {
    // Validate rule data
    const validatedData = ReminderRuleSchema.parse(ruleData)
    
    const rule: ReminderRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save to database
    await this.saveReminderRule(rule)
    
    // Add to memory cache
    this.reminderRules.set(rule.id, rule)
    
    console.log(`📋 Reminder rule created: ${rule.name}`)
    return rule
  }

  public async updateReminderRule(ruleId: string, updates: Partial<ReminderRule>): Promise<ReminderRule> {
    const existingRule = this.reminderRules.get(ruleId)
    if (!existingRule) {
      throw new Error(`Reminder rule not found: ${ruleId}`)
    }

    const updatedRule: ReminderRule = {
      ...existingRule,
      ...updates,
      updatedAt: new Date()
    }

    // Validate updated rule
    ReminderRuleSchema.parse(updatedRule)

    // Save to database
    await this.saveReminderRule(updatedRule)
    
    // Update memory cache
    this.reminderRules.set(ruleId, updatedRule)
    
    console.log(`📋 Reminder rule updated: ${updatedRule.name}`)
    return updatedRule
  }

  public async deleteReminderRule(ruleId: string): Promise<void> {
    const rule = this.reminderRules.get(ruleId)
    if (!rule) {
      throw new Error(`Reminder rule not found: ${ruleId}`)
    }

    // Cancel all scheduled reminders for this rule
    await this.cancelRemindersByRule(ruleId)
    
    // Delete from database
    await this.deleteReminderRuleFromDB(ruleId)
    
    // Remove from memory
    this.reminderRules.delete(ruleId)
    
    console.log(`📋 Reminder rule deleted: ${rule.name}`)
  }

  // Appointment Processing
  public async processAppointment(appointment: AppointmentData): Promise<void> {
    console.log(`📅 Processing appointment: ${appointment.id}`)
    
    // Find applicable reminder rules
    const applicableRules = this.findApplicableRules(appointment)
    
    for (const rule of applicableRules) {
      await this.scheduleRemindersForAppointment(appointment, rule)
    }
  }

  private findApplicableRules(appointment: AppointmentData): ReminderRule[] {
    const applicableRules: ReminderRule[] = []
    
    for (const rule of this.reminderRules.values()) {
      if (!rule.enabled) continue
      
      // Check procedure type
      if (rule.procedureTypes.length > 0 && !rule.procedureTypes.includes(appointment.procedureType)) {
        continue
      }
      
      // Check conditions
      if (!this.evaluateConditions(rule.conditions, appointment)) {
        continue
      }
      
      // Check clinic
      if (rule.clinicId !== appointment.clinicId) {
        continue
      }
      
      applicableRules.push(rule)
    }
    
    return applicableRules
  }

  private evaluateConditions(conditions: ReminderCondition[], appointment: AppointmentData): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, appointment)) {
        return false
      }
    }
    return true
  }

  private evaluateCondition(condition: ReminderCondition, appointment: AppointmentData): boolean {
    const value = this.getValueFromPath(condition.field, appointment)
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'not_equals':
        return value !== condition.value
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value)
      case 'greater_than':
        return Number(value) > Number(condition.value)
      case 'less_than':
        return Number(value) < Number(condition.value)
      default:
        return false
    }
  }

  private getValueFromPath(path: string, obj: any): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private async scheduleRemindersForAppointment(appointment: AppointmentData, rule: ReminderRule): Promise<void> {
    // Get patient preferences
    const patientPreferences = await this.getPatientPreferences(appointment.patientId)
    
    // Check if patient has opted out
    if (patientPreferences?.optOut) {
      console.log(`⏭️ Patient ${appointment.patientId} has opted out of reminders`)
      return
    }
    
    // Get timezone for scheduling
    const timezone = patientPreferences?.timezone || appointment.timezone || 'America/Sao_Paulo'
    
    for (const timing of rule.reminderTiming) {
      if (!timing.enabled) continue
      
      const scheduledAt = this.calculateReminderTime(appointment.scheduledAt, timing.timeBeforeAppointment, timezone)
      
      // Don't schedule reminders in the past
      if (scheduledAt <= new Date()) {
        console.log(`⏰ Skipping past reminder time for appointment ${appointment.id}`)
        continue
      }
      
      // Check quiet hours
      if (this.isInQuietHours(scheduledAt, patientPreferences, timezone)) {
        // Adjust to next available time
        const adjustedTime = this.adjustForQuietHours(scheduledAt, patientPreferences, timezone)
        if (adjustedTime) {
          scheduledAt.setTime(adjustedTime.getTime())
        } else {
          console.log(`⏰ Unable to schedule reminder outside quiet hours for appointment ${appointment.id}`)
          continue
        }
      }
      
      // Create scheduled reminder
      const scheduledReminder: ScheduledReminder = {
        id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        clinicId: appointment.clinicId,
        ruleId: rule.id,
        timingId: timing.id,
        scheduledAt,
        status: 'pending',
        channels: this.selectChannels(timing.channels, rule.channels, patientPreferences),
        template: rule.template,
        personalizedContent: await this.personalizeContent(rule.template, appointment, patientPreferences),
        attempts: [],
        metadata: {
          originalScheduledAt: scheduledAt.toISOString(),
          timezone,
          priority: timing.priority
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Save scheduled reminder
      await this.saveScheduledReminder(scheduledReminder)
      this.scheduledReminders.set(scheduledReminder.id, scheduledReminder)
      
      // Schedule timer
      this.scheduleReminderTimer(scheduledReminder)
      
      console.log(`⏰ Reminder scheduled for ${scheduledAt.toISOString()} - Appointment: ${appointment.id}`)
    }
  }

  private calculateReminderTime(appointmentTime: Date, minutesBefore: number, timezone: string): Date {
    // Convert appointment time to target timezone and subtract minutes
    const reminderTime = new Date(appointmentTime.getTime() - (minutesBefore * 60 * 1000))
    
    // For production, you would use a proper timezone library like date-fns-tz
    // For this implementation, we'll use the basic Date object
    return reminderTime
  }

  private isInQuietHours(time: Date, preferences?: PatientPreferences, timezone?: string): boolean {
    if (!preferences?.quietHours) return false
    
    const timeStr = time.toTimeString().substr(0, 5) // HH:mm format
    const { start, end } = preferences.quietHours
    
    // Simple time comparison (would need proper timezone handling in production)
    return timeStr >= start && timeStr <= end
  }

  private adjustForQuietHours(time: Date, preferences?: PatientPreferences, timezone?: string): Date | null {
    if (!preferences?.quietHours) return time
    
    const { end } = preferences.quietHours
    const [endHour, endMinute] = end.split(':').map(Number)
    
    // Set time to end of quiet hours
    const adjustedTime = new Date(time)
    adjustedTime.setHours(endHour, endMinute, 0, 0)
    
    // If this pushes the reminder past the appointment, return null
    if (adjustedTime >= new Date(time.getTime() + (24 * 60 * 60 * 1000))) {
      return null
    }
    
    return adjustedTime
  }

  private selectChannels(timingChannels: string[], ruleChannels: string[], preferences?: PatientPreferences): string[] {
    let selectedChannels = timingChannels.length > 0 ? timingChannels : ruleChannels
    
    // Filter by patient preferences
    if (preferences?.preferredChannels && preferences.preferredChannels.length > 0) {
      selectedChannels = selectedChannels.filter(channel => 
        preferences.preferredChannels.includes(channel)
      )
    }
    
    // Ensure at least one channel is selected
    if (selectedChannels.length === 0) {
      selectedChannels = ['sms'] // fallback channel
    }
    
    return selectedChannels
  }

  private async personalizeContent(template: ReminderTemplate, appointment: AppointmentData, preferences?: PatientPreferences): Promise<Record<string, any>> {
    const personalization: Record<string, any> = {}
    
    // Apply personalization rules
    for (const rule of template.personalizationRules) {
      if (this.evaluatePersonalizationCondition(rule.condition, appointment, preferences)) {
        Object.assign(personalization, rule.template)
      }
    }
    
    // Build template variables
    const variables = {
      patient: await this.getPatientData(appointment.patientId),
      appointment: {
        date: appointment.scheduledAt.toLocaleDateString('pt-BR'),
        time: appointment.scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        procedure: appointment.procedureType,
        duration: appointment.duration
      },
      clinic: await this.getClinicData(appointment.clinicId),
      professional: await this.getProfessionalData(appointment.professionalId)
    }
    
    // Replace variables in templates
    for (const [channel, channelTemplate] of Object.entries(template.channels)) {
      if (typeof channelTemplate === 'string') {
        personalization[channel] = this.replaceVariables(channelTemplate, variables)
      } else if (typeof channelTemplate === 'object') {
        personalization[channel] = {}
        for (const [key, value] of Object.entries(channelTemplate)) {
          if (typeof value === 'string') {
            personalization[channel][key] = this.replaceVariables(value, variables)
          }
        }
      }
    }
    
    return personalization
  }

  private evaluatePersonalizationCondition(condition: string, appointment: AppointmentData, preferences?: PatientPreferences): boolean {
    // Simple condition evaluation (would use a proper expression parser in production)
    try {
      // Create evaluation context
      const context = {
        appointment,
        patient: preferences,
        // Add more context as needed
      }
      
      // For this implementation, we'll use a simple string replacement
      // In production, you'd use a proper expression evaluator
      return condition === 'true' // placeholder
    } catch (error) {
      console.error('Error evaluating personalization condition:', error)
      return false
    }
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template
    
    // Replace variables in format {{variable.path}}
    const variableRegex = /\{\{([^}]+)\}\}/g
    result = result.replace(variableRegex, (match, path) => {
      const value = this.getValueFromPath(path.trim(), variables)
      return value !== undefined ? String(value) : match
    })
    
    return result
  }

  // Timer Management
  private scheduleReminderTimer(reminder: ScheduledReminder): void {
    const now = new Date()
    const timeUntilReminder = reminder.scheduledAt.getTime() - now.getTime()
    
    if (timeUntilReminder <= 0) {
      // Send immediately
      this.executeReminder(reminder.id)
      return
    }
    
    // Schedule timer
    const timer = setTimeout(() => {
      this.executeReminder(reminder.id)
    }, timeUntilReminder)
    
    this.timers.set(reminder.id, timer)
  }

  private async executeReminder(reminderId: string): Promise<void> {
    const reminder = this.scheduledReminders.get(reminderId)
    if (!reminder || reminder.status !== 'pending') {
      return
    }
    
    console.log(`📨 Executing reminder: ${reminderId}`)
    
    try {
      // Update status
      reminder.status = 'sent'
      reminder.updatedAt = new Date()
      
      // Send notifications through each channel
      for (const channel of reminder.channels) {
        await this.sendReminderNotification(reminder, channel)
      }
      
      // Save updated reminder
      await this.saveScheduledReminder(reminder)
      
      console.log(`✅ Reminder executed successfully: ${reminderId}`)
    } catch (error) {
      console.error(`❌ Failed to execute reminder ${reminderId}:`, error)
      
      // Update status to failed
      reminder.status = 'failed'
      reminder.updatedAt = new Date()
      await this.saveScheduledReminder(reminder)
    } finally {
      // Clean up timer
      this.timers.delete(reminderId)
    }
  }

  private async sendReminderNotification(reminder: ScheduledReminder, channel: string): Promise<void> {
    const attempt: ReminderAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channel,
      attemptedAt: new Date(),
      status: 'retry'
    }
    
    try {
      // Get personalized content for channel
      const content = reminder.personalizedContent?.[channel] || reminder.template.channels[channel as keyof ReminderTemplate['channels']]
      
      if (!content) {
        throw new Error(`No content available for channel: ${channel}`)
      }
      
      // Prepare notification data
      const notificationData = this.prepareNotificationData(reminder, channel, content)
      
      // Send through notification engine
      const result = await this.notificationEngine.send(notificationData)
      
      if (result.success) {
        attempt.status = 'success'
        attempt.notificationId = result.notificationId
        attempt.cost = result.cost
      } else {
        attempt.status = 'failed'
        attempt.error = result.error
      }
      
    } catch (error) {
      attempt.status = 'failed'
      attempt.error = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to send reminder via ${channel}:`, error)
    }
    
    reminder.attempts.push(attempt)
  }

  private prepareNotificationData(reminder: ScheduledReminder, channel: string, content: any): any {
    // Get patient contact info
    const patientData = this.getPatientData(reminder.patientId) // This would be async in real implementation
    
    const baseData = {
      recipientId: reminder.patientId,
      channel,
      priority: reminder.metadata.priority || 'medium',
      metadata: {
        type: 'reminder',
        appointmentId: reminder.appointmentId,
        reminderId: reminder.id,
        clinicId: reminder.clinicId
      }
    }
    
    switch (channel) {
      case 'sms':
        return {
          ...baseData,
          to: patientData.phone,
          message: content
        }
      
      case 'email':
        return {
          ...baseData,
          to: patientData.email,
          subject: content.subject,
          html: content.html,
          text: content.text
        }
      
      case 'whatsapp':
        return {
          ...baseData,
          to: patientData.whatsapp || patientData.phone,
          message: content,
          type: 'text'
        }
      
      case 'push':
        return {
          ...baseData,
          to: patientData.pushTokens || [],
          title: content.title,
          body: content.body
        }
      
      default:
        throw new Error(`Unsupported channel: ${channel}`)
    }
  }

  // Reminder Scheduler
  private startReminderScheduler(): void {
    // Schedule check every minute for pending reminders
    setInterval(() => {
      this.checkPendingReminders()
    }, 60000) // 1 minute
    
    console.log('⏰ Reminder scheduler started')
  }

  private async checkPendingReminders(): Promise<void> {
    const now = new Date()
    
    for (const reminder of this.scheduledReminders.values()) {
      if (reminder.status === 'pending' && reminder.scheduledAt <= now) {
        if (!this.timers.has(reminder.id)) {
          // Execute reminder that wasn't scheduled (e.g., from restart)
          this.executeReminder(reminder.id)
        }
      }
    }
  }

  // Cancellation Methods
  public async cancelReminder(reminderId: string): Promise<void> {
    const reminder = this.scheduledReminders.get(reminderId)
    if (!reminder) {
      throw new Error(`Reminder not found: ${reminderId}`)
    }
    
    // Cancel timer
    const timer = this.timers.get(reminderId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(reminderId)
    }
    
    // Update status
    reminder.status = 'cancelled'
    reminder.updatedAt = new Date()
    
    // Save to database
    await this.saveScheduledReminder(reminder)
    
    console.log(`❌ Reminder cancelled: ${reminderId}`)
  }

  public async cancelRemindersByAppointment(appointmentId: string): Promise<void> {
    const remindersToCancel = Array.from(this.scheduledReminders.values())
      .filter(reminder => reminder.appointmentId === appointmentId && reminder.status === 'pending')
    
    for (const reminder of remindersToCancel) {
      await this.cancelReminder(reminder.id)
    }
    
    console.log(`❌ Cancelled ${remindersToCancel.length} reminders for appointment: ${appointmentId}`)
  }

  private async cancelRemindersByRule(ruleId: string): Promise<void> {
    const remindersToCancel = Array.from(this.scheduledReminders.values())
      .filter(reminder => reminder.ruleId === ruleId && reminder.status === 'pending')
    
    for (const reminder of remindersToCancel) {
      await this.cancelReminder(reminder.id)
    }
    
    console.log(`❌ Cancelled ${remindersToCancel.length} reminders for rule: ${ruleId}`)
  }

  // Database Operations (Mock implementations)
  private async loadReminderRules(): Promise<void> {
    // Mock: Load reminder rules from database
    console.log('📋 Loading reminder rules from database...')
    
    // Create default reminder rules
    const defaultRules: Partial<ReminderRule>[] = [
      {
        name: 'Lembrete Padrão de Consulta',
        enabled: true,
        procedureTypes: [], // applies to all procedures
        reminderTiming: [
          {
            id: 'timing_7d',
            timeBeforeAppointment: 7 * 24 * 60, // 7 days
            label: '7 dias antes',
            enabled: true,
            priority: 'low',
            channels: ['email']
          },
          {
            id: 'timing_1d',
            timeBeforeAppointment: 24 * 60, // 1 day
            label: '1 dia antes',
            enabled: true,
            priority: 'medium',
            channels: ['sms', 'whatsapp']
          },
          {
            id: 'timing_2h',
            timeBeforeAppointment: 2 * 60, // 2 hours
            label: '2 horas antes',
            enabled: true,
            priority: 'high',
            channels: ['sms', 'push']
          }
        ],
        channels: ['sms', 'email', 'whatsapp', 'push'],
        template: {
          id: 'template_default',
          name: 'Template Padrão',
          channels: {
            sms: 'Olá {{patient.name}}, você tem consulta marcada para {{appointment.date}} às {{appointment.time}}. Clínica {{clinic.name}}.',
            email: {
              subject: 'Lembrete de Consulta - {{clinic.name}}',
              html: '<p>Olá {{patient.name}},</p><p>Você tem consulta marcada para <strong>{{appointment.date}}</strong> às <strong>{{appointment.time}}</strong>.</p><p>Procedimento: {{appointment.procedure}}</p><p>{{clinic.name}}</p>',
              text: 'Olá {{patient.name}}, você tem consulta marcada para {{appointment.date}} às {{appointment.time}}. Procedimento: {{appointment.procedure}}. {{clinic.name}}.'
            },
            whatsapp: 'Olá {{patient.name}}! 👋\n\nLembrando que você tem consulta marcada:\n📅 {{appointment.date}}\n🕐 {{appointment.time}}\n💉 {{appointment.procedure}}\n\n{{clinic.name}}',
            push: {
              title: 'Lembrete de Consulta',
              body: 'Você tem consulta marcada para {{appointment.date}} às {{appointment.time}}'
            }
          },
          variables: ['patient.name', 'appointment.date', 'appointment.time', 'appointment.procedure', 'clinic.name'],
          personalizationRules: []
        },
        conditions: [],
        clinicId: 'default'
      }
    ]
    
    for (const ruleData of defaultRules) {
      const rule = await this.createReminderRule(ruleData)
      console.log(`📋 Created default reminder rule: ${rule.name}`)
    }
  }

  private async loadScheduledReminders(): Promise<void> {
    // Mock: Load scheduled reminders from database
    console.log('⏰ Loading scheduled reminders from database...')
    // In production, this would load pending reminders and reschedule them
  }

  private async saveReminderRule(rule: ReminderRule): Promise<void> {
    // Mock: Save reminder rule to database
    console.log(`💾 Saving reminder rule: ${rule.name}`)
  }

  private async deleteReminderRuleFromDB(ruleId: string): Promise<void> {
    // Mock: Delete reminder rule from database
    console.log(`🗑️ Deleting reminder rule from database: ${ruleId}`)
  }

  private async saveScheduledReminder(reminder: ScheduledReminder): Promise<void> {
    // Mock: Save scheduled reminder to database
    console.log(`💾 Saving scheduled reminder: ${reminder.id}`)
  }

  private async getPatientPreferences(patientId: string): Promise<PatientPreferences | undefined> {
    // Mock: Get patient preferences from database
    return {
      patientId,
      preferredChannels: ['sms', 'whatsapp'],
      preferredTimes: ['morning'],
      timezone: 'America/Sao_Paulo',
      quietHours: {
        start: '22:00',
        end: '08:00'
      },
      optOut: false,
      language: 'pt-BR',
      customization: {}
    }
  }

  private async getPatientData(patientId: string): Promise<any> {
    // Mock: Get patient data from database
    return {
      id: patientId,
      name: 'Paciente Exemplo',
      email: 'paciente@example.com',
      phone: '+5511999999999',
      whatsapp: '+5511999999999',
      pushTokens: ['token123']
    }
  }

  private async getClinicData(clinicId: string): Promise<any> {
    // Mock: Get clinic data from database
    return {
      id: clinicId,
      name: 'Clínica NeonPro',
      address: 'Endereço da Clínica',
      phone: '+5511888888888'
    }
  }

  private async getProfessionalData(professionalId: string): Promise<any> {
    // Mock: Get professional data from database
    return {
      id: professionalId,
      name: 'Dr. Exemplo',
      specialty: 'Estética'
    }
  }

  // Public Query Methods
  public getReminderRules(clinicId?: string): ReminderRule[] {
    const rules = Array.from(this.reminderRules.values())
    return clinicId ? rules.filter(rule => rule.clinicId === clinicId) : rules
  }

  public getScheduledReminders(filters?: {
    appointmentId?: string
    patientId?: string
    clinicId?: string
    status?: string
  }): ScheduledReminder[] {
    let reminders = Array.from(this.scheduledReminders.values())
    
    if (filters) {
      if (filters.appointmentId) {
        reminders = reminders.filter(r => r.appointmentId === filters.appointmentId)
      }
      if (filters.patientId) {
        reminders = reminders.filter(r => r.patientId === filters.patientId)
      }
      if (filters.clinicId) {
        reminders = reminders.filter(r => r.clinicId === filters.clinicId)
      }
      if (filters.status) {
        reminders = reminders.filter(r => r.status === filters.status)
      }
    }
    
    return reminders
  }

  public getReminderStats(clinicId?: string): {
    totalRules: number
    activeRules: number
    pendingReminders: number
    sentReminders: number
    failedReminders: number
  } {
    const rules = this.getReminderRules(clinicId)
    const reminders = this.getScheduledReminders(clinicId ? { clinicId } : undefined)
    
    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.enabled).length,
      pendingReminders: reminders.filter(r => r.status === 'pending').length,
      sentReminders: reminders.filter(r => r.status === 'sent').length,
      failedReminders: reminders.filter(r => r.status === 'failed').length
    }
  }
}

// Singleton instance
let automatedReminderEngineInstance: AutomatedReminderEngine | null = null

export const getAutomatedReminderEngine = (notificationEngine: NotificationEngine): AutomatedReminderEngine => {
  if (!automatedReminderEngineInstance) {
    automatedReminderEngineInstance = new AutomatedReminderEngine(notificationEngine)
  }
  return automatedReminderEngineInstance
}

export default AutomatedReminderEngine