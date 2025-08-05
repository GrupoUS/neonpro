/**
 * Automated Communication Workflow for Scheduling
 * Story 5.3: Automated Communication for Scheduling
 */

import { createClient } from '@/lib/supabase/server'
import { CommunicationService } from './communication-service'
import { NoShowPredictor } from './no-show-predictor'
import { schedulingTemplateEngine, SchedulingTemplate } from './scheduling-templates'
import { z } from 'zod'

export interface WorkflowConfig {
  clinicId: string
  enabled: boolean
  reminderSettings: {
    enabled24h: boolean
    enabled2h: boolean
    enabled30m: boolean
    channels: Array<'sms' | 'email' | 'whatsapp'>
    preferredChannel: 'sms' | 'email' | 'whatsapp'
  }
  confirmationSettings: {
    enableConfirmationRequests: boolean
    sendTime: string // e.g., '09:00' for 9 AM
    timeoutHours: number // hours to wait for response before escalation
    escalationChannels: Array<'sms' | 'email' | 'whatsapp'>
  }
  noShowPrevention: {
    enabled: boolean
    probabilityThreshold: number
    interventionTiming: string // e.g., '4h', '6h'
    specialHandling: boolean
  }
  analytics: {
    enabled: boolean
    reportingInterval: 'daily' | 'weekly' | 'monthly'
    kpiTargets: {
      confirmationRate: number
      noShowReduction: number
      responseRate: number
    }
  }
}

export interface WorkflowExecution {
  id: string
  appointmentId: string
  patientId: string
  clinicId: string
  workflowType: 'reminder' | 'confirmation' | 'no_show_prevention' | 'waitlist'
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled'
  steps: WorkflowStep[]
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  results: WorkflowResults
  metadata: Record<string, any>
}

export interface WorkflowStep {
  id: string
  type: 'send_message' | 'wait_response' | 'predict_no_show' | 'escalate' | 'complete'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  scheduledAt: Date
  executedAt?: Date
  input: any
  output: any
  error?: string
}

export interface WorkflowResults {
  messagesSent: number
  messagesDelivered: number
  responseReceived: boolean
  responseType?: 'confirmed' | 'cancelled' | 'reschedule' | 'no_response'
  noShowPrevented: boolean
  waitlistFilled: boolean
  cost: number
  effectiveness: number
}

export class SchedulingCommunicationWorkflow {
  private supabase = createClient()
  public communicationService = new CommunicationService()
  public noShowPredictor = new NoShowPredictor()

  /**
   * Initialize automated workflows for an appointment
   */
  async initializeWorkflows(appointmentId: string, config?: Partial<WorkflowConfig>): Promise<WorkflowExecution[]> {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await this.supabase
        .from('appointments')
        .select(`
          *,
          patients(*),
          professionals(*),
          services(*),
          clinics(*)
        `)
        .eq('id', appointmentId)
        .single()

      if (appointmentError || !appointment) {
        throw new Error('Appointment not found')
      }

      // Get clinic workflow configuration
      const workflowConfig = await this.getWorkflowConfig(appointment.clinic_id, config)
      
      if (!workflowConfig.enabled) {
        return []
      }

      const workflows: WorkflowExecution[] = []
      const appointmentDate = new Date(appointment.date)
      const now = new Date()

      // 1. Schedule reminder workflows
      if (workflowConfig.reminderSettings.enabled24h) {
        const reminderTime24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000)
        if (reminderTime24h > now) {
          workflows.push(await this.createReminderWorkflow(
            appointment, 
            '24h', 
            reminderTime24h, 
            workflowConfig
          ))
        }
      }

      if (workflowConfig.reminderSettings.enabled2h) {
        const reminderTime2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000)
        if (reminderTime2h > now) {
          workflows.push(await this.createReminderWorkflow(
            appointment, 
            '2h', 
            reminderTime2h, 
            workflowConfig
          ))
        }
      }

      if (workflowConfig.reminderSettings.enabled30m) {
        const reminderTime30m = new Date(appointmentDate.getTime() - 30 * 60 * 1000)
        if (reminderTime30m > now) {
          workflows.push(await this.createReminderWorkflow(
            appointment, 
            '30m', 
            reminderTime30m, 
            workflowConfig
          ))
        }
      }

      // 2. Schedule confirmation workflow
      if (workflowConfig.confirmationSettings.enableConfirmationRequests) {
        const confirmationTime = this.calculateConfirmationTime(appointmentDate, workflowConfig.confirmationSettings.sendTime)
        if (confirmationTime > now) {
          workflows.push(await this.createConfirmationWorkflow(
            appointment, 
            confirmationTime, 
            workflowConfig
          ))
        }
      }

      // 3. Schedule no-show prevention workflow if needed
      if (workflowConfig.noShowPrevention.enabled) {
        const prediction = await this.noShowPredictor.predict(appointmentId)
        if (prediction.probability >= workflowConfig.noShowPrevention.probabilityThreshold) {
          const interventionTime = this.calculateInterventionTime(
            appointmentDate, 
            workflowConfig.noShowPrevention.interventionTiming
          )
          if (interventionTime > now) {
            workflows.push(await this.createNoShowPreventionWorkflow(
              appointment, 
              prediction, 
              interventionTime, 
              workflowConfig
            ))
          }
        }
      }

      // Save workflows to database
      for (const workflow of workflows) {
        await this.saveWorkflow(workflow)
      }

      return workflows

    } catch (error) {
      console.error('Error initializing workflows:', error)
      throw error
    }
  }

  /**
   * Create reminder workflows based on configuration
   * This method is used for testing and direct workflow creation
   */
  createReminderWorkflows(appointmentId: string, config: any, appointment: any): WorkflowExecution[] {
    const workflows: WorkflowExecution[] = []
    
    if (config.reminderSettings?.enabled24h) {
      workflows.push({
        id: `reminder-24h-${appointmentId}`,
        appointmentId,
        type: '24h_reminder',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        steps: []
      })
    }
    
    if (config.reminderSettings?.enabled2h) {
      workflows.push({
        id: `reminder-2h-${appointmentId}`,
        appointmentId,
        type: '2h_reminder',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'scheduled',
        steps: []
      })
    }
    
    return workflows
  }

  /**
   * Execute a scheduled workflow
   */
  async executeWorkflow(workflowId: string): Promise<WorkflowResults> {
    try {
      const workflow = await this.getWorkflow(workflowId)
      if (!workflow || workflow.status !== 'scheduled') {
        throw new Error('Workflow not found or not schedulable')
      }

      // Update workflow status
      workflow.status = 'running'
      workflow.startedAt = new Date()
      await this.updateWorkflow(workflow)

      // Execute workflow steps
      for (const step of workflow.steps) {
        try {
          await this.executeWorkflowStep(workflow, step)
        } catch (stepError) {
          console.error(`Error executing step ${step.id}:`, stepError)
          step.status = 'failed'
          step.error = stepError.message
        }
      }

      // Complete workflow
      workflow.status = 'completed'
      workflow.completedAt = new Date()
      await this.updateWorkflow(workflow)

      return workflow.results

    } catch (error) {
      console.error('Error executing workflow:', error)
      throw error
    }
  }

  /**
   * Execute individual workflow step
   */
  private async executeWorkflowStep(workflow: WorkflowExecution, step: WorkflowStep): Promise<void> {
    step.status = 'running'
    step.executedAt = new Date()

    switch (step.type) {
      case 'send_message':
        await this.executeSendMessageStep(workflow, step)
        break
      case 'predict_no_show':
        await this.executePredictNoShowStep(workflow, step)
        break
      case 'wait_response':
        await this.executeWaitResponseStep(workflow, step)
        break
      case 'escalate':
        await this.executeEscalationStep(workflow, step)
        break
      case 'complete':
        step.status = 'completed'
        break
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  /**
   * Execute send message step
   */
  private async executeSendMessageStep(workflow: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const { templateType, channel, timing } = step.input

    // Get appointment and patient data
    const { data: appointment } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patients(*),
        professionals(*),
        services(*),
        clinics(*)
      `)
      .eq('id', workflow.appointmentId)
      .single()

    // Select best template - flatten data for template conditions
    const templateConditionData = {
      ...appointment,
      service_category: appointment.services?.category || 'general',
      service_name: appointment.services?.name || 'Consulta',
      professional_name: appointment.professionals?.name || 'Profissional',
      patient_name: appointment.patients?.name || 'Paciente',
      patient_age: appointment.patients?.age || 0,
      clinic_name: appointment.clinics?.name || 'Clínica'
    }
    
    const template = schedulingTemplateEngine.selectBestTemplate(
      templateType,
      templateConditionData,
      appointment.patients || {},
      workflow.metadata.noShowPrediction || {}
    )

    if (!template) {
      throw new Error('No suitable template found')
    }

    // Prepare variables
    const variables = {
      patientName: appointment.patients.name,
      serviceName: appointment.services.name,
      professionalName: appointment.professionals.name,
      appointmentDate: new Date(appointment.date).toLocaleDateString('pt-BR'),
      appointmentTime: new Date(appointment.date).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      clinicName: appointment.clinics.name,
      clinicPhone: appointment.clinics.phone,
      confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/patient/confirm/${workflow.metadata.confirmationToken}`,
      rescheduleUrl: `${process.env.NEXT_PUBLIC_APP_URL}/patient/reschedule/${workflow.metadata.confirmationToken}`,
      no_show_probability: workflow.metadata.noShowPrediction?.probability,
      service_category: appointment.services.category
    }

    // Render template
    const renderedContent = await schedulingTemplateEngine.renderTemplate(template, channel, variables)

    // Send message
    const result = await this.communicationService.sendMessage({
      patientId: workflow.patientId,
      clinicId: workflow.clinicId,
      appointmentId: workflow.appointmentId,
      messageType: templateType,
      templateId: template.id,
      channel,
      variables,
      customContent: renderedContent
    })

    // Update step output
    step.output = {
      messageId: result.messageId,
      templateUsed: template.id,
      channel,
      cost: result.cost,
      delivered: result.success
    }

    // Update workflow results
    workflow.results.messagesSent++
    if (result.success) {
      workflow.results.messagesDelivered++
    }
    workflow.results.cost += result.cost || 0

    step.status = 'completed'
  }

  /**
   * Execute no-show prediction step
   */
  private async executePredictNoShowStep(workflow: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const prediction = await this.noShowPredictor.predict(workflow.appointmentId)
    
    step.output = prediction
    workflow.metadata.noShowPrediction = prediction
    
    step.status = 'completed'
  }

  /**
   * Execute wait response step
   */
  private async executeWaitResponseStep(workflow: WorkflowExecution, step: WorkflowStep): Promise<void> {
    // Check if response has been received
    const { data: response } = await this.supabase
      .from('appointment_confirmations')
      .select('*')
      .eq('appointment_id', workflow.appointmentId)
      .neq('status', 'pending')
      .order('response_date', { ascending: false })
      .limit(1)
      .single()

    if (response) {
      workflow.results.responseReceived = true
      workflow.results.responseType = response.status as any
      
      if (response.status === 'confirmed') {
        workflow.results.noShowPrevented = true
      }
    }

    step.output = { responseReceived: !!response, response }
    step.status = 'completed'
  }

  /**
   * Execute escalation step
   */
  private async executeEscalationStep(workflow: WorkflowExecution, step: WorkflowStep): Promise<void> {
    // Send escalation message with different template/channel
    const escalationChannel = step.input.escalationChannel || 'whatsapp'
    
    // Use no-show prevention template for escalation
    await this.executeSendMessageStep(workflow, {
      ...step,
      input: {
        templateType: 'no_show_prevention',
        channel: escalationChannel,
        timing: 'immediate'
      }
    })
  }

  /**
   * Get workflow configuration for clinic
   */
  private async getWorkflowConfig(clinicId: string, override?: Partial<WorkflowConfig>): Promise<WorkflowConfig> {
    // Get saved configuration from database
    const { data: savedConfig } = await this.supabase
      .from('clinic_workflow_configs')
      .select('*')
      .eq('clinic_id', clinicId)
      .single()

    // Default configuration
    const defaultConfig: WorkflowConfig = {
      clinicId,
      enabled: true,
      reminderSettings: {
        enabled24h: true,
        enabled2h: true,
        enabled30m: false,
        channels: ['whatsapp', 'sms'],
        preferredChannel: 'whatsapp'
      },
      confirmationSettings: {
        enableConfirmationRequests: true,
        sendTime: '09:00',
        timeoutHours: 24,
        escalationChannels: ['whatsapp', 'sms']
      },
      noShowPrevention: {
        enabled: true,
        probabilityThreshold: 0.7,
        interventionTiming: '4h',
        specialHandling: true
      },
      analytics: {
        enabled: true,
        reportingInterval: 'weekly',
        kpiTargets: {
          confirmationRate: 0.85,
          noShowReduction: 0.3,
          responseRate: 0.7
        }
      }
    }

    return {
      ...defaultConfig,
      ...savedConfig?.config,
      ...override
    }
  }

  /**
   * Create reminder workflow
   */
  private async createReminderWorkflow(
    appointment: any, 
    timing: string, 
    scheduledTime: Date, 
    config: WorkflowConfig
  ): Promise<WorkflowExecution> {
    const workflowId = `reminder_${timing}_${appointment.id}_${Date.now()}`
    
    return {
      id: workflowId,
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      clinicId: appointment.clinic_id,
      workflowType: 'reminder',
      status: 'scheduled',
      scheduledAt: scheduledTime,
      steps: [
        {
          id: `${workflowId}_send`,
          type: 'send_message',
          status: 'pending',
          scheduledAt: scheduledTime,
          input: {
            templateType: 'reminder',
            channel: config.reminderSettings.preferredChannel,
            timing
          },
          output: null
        },
        {
          id: `${workflowId}_wait`,
          type: 'wait_response',
          status: 'pending',
          scheduledAt: new Date(scheduledTime.getTime() + 2 * 60 * 60 * 1000), // 2h later
          input: { timeoutHours: 2 },
          output: null
        }
      ],
      results: {
        messagesSent: 0,
        messagesDelivered: 0,
        responseReceived: false,
        noShowPrevented: false,
        waitlistFilled: false,
        cost: 0,
        effectiveness: 0
      },
      metadata: {
        timing,
        templateType: 'reminder'
      }
    }
  }

  /**
   * Create confirmation workflow
   */
  private async createConfirmationWorkflow(
    appointment: any, 
    scheduledTime: Date, 
    config: WorkflowConfig
  ): Promise<WorkflowExecution> {
    const workflowId = `confirmation_${appointment.id}_${Date.now()}`
    const confirmationToken = this.generateConfirmationToken()
    
    return {
      id: workflowId,
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      clinicId: appointment.clinic_id,
      workflowType: 'confirmation',
      status: 'scheduled',
      scheduledAt: scheduledTime,
      steps: [
        {
          id: `${workflowId}_predict`,
          type: 'predict_no_show',
          status: 'pending',
          scheduledAt: scheduledTime,
          input: {},
          output: null
        },
        {
          id: `${workflowId}_send`,
          type: 'send_message',
          status: 'pending',
          scheduledAt: scheduledTime,
          input: {
            templateType: 'confirmation',
            channel: config.reminderSettings.preferredChannel,
            timing: 'immediate'
          },
          output: null
        },
        {
          id: `${workflowId}_wait`,
          type: 'wait_response',
          status: 'pending',
          scheduledAt: new Date(scheduledTime.getTime() + config.confirmationSettings.timeoutHours * 60 * 60 * 1000),
          input: { timeoutHours: config.confirmationSettings.timeoutHours },
          output: null
        }
      ],
      results: {
        messagesSent: 0,
        messagesDelivered: 0,
        responseReceived: false,
        noShowPrevented: false,
        waitlistFilled: false,
        cost: 0,
        effectiveness: 0
      },
      metadata: {
        confirmationToken,
        templateType: 'confirmation'
      }
    }
  }

  /**
   * Create no-show prevention workflow
   */
  private async createNoShowPreventionWorkflow(
    appointment: any, 
    prediction: any, 
    scheduledTime: Date, 
    config: WorkflowConfig
  ): Promise<WorkflowExecution> {
    const workflowId = `no_show_prevention_${appointment.id}_${Date.now()}`
    
    return {
      id: workflowId,
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      clinicId: appointment.clinic_id,
      workflowType: 'no_show_prevention',
      status: 'scheduled',
      scheduledAt: scheduledTime,
      steps: [
        {
          id: `${workflowId}_send`,
          type: 'send_message',
          status: 'pending',
          scheduledAt: scheduledTime,
          input: {
            templateType: 'no_show_prevention',
            channel: 'whatsapp',
            timing: 'immediate'
          },
          output: null
        },
        {
          id: `${workflowId}_wait`,
          type: 'wait_response',
          status: 'pending',
          scheduledAt: new Date(scheduledTime.getTime() + 30 * 60 * 1000), // 30 minutes
          input: { timeoutMinutes: 30 },
          output: null
        },
        {
          id: `${workflowId}_escalate`,
          type: 'escalate',
          status: 'pending',
          scheduledAt: new Date(scheduledTime.getTime() + 60 * 60 * 1000), // 1 hour
          input: { escalationChannel: 'email' },
          output: null
        }
      ],
      results: {
        messagesSent: 0,
        messagesDelivered: 0,
        responseReceived: false,
        noShowPrevented: false,
        waitlistFilled: false,
        cost: 0,
        effectiveness: 0
      },
      metadata: {
        noShowPrediction: prediction,
        templateType: 'no_show_prevention'
      }
    }
  }

  /**
   * Helper methods
   */
  private calculateConfirmationTime(appointmentDate: Date, sendTime: string): Date {
    const [hours, minutes] = sendTime.split(':').map(Number)
    const confirmationDate = new Date(appointmentDate)
    confirmationDate.setDate(confirmationDate.getDate() - 1) // Day before
    confirmationDate.setHours(hours, minutes, 0, 0)
    return confirmationDate
  }

  private calculateInterventionTime(appointmentDate: Date, timing: string): Date {
    const hours = parseInt(timing.replace('h', ''))
    return new Date(appointmentDate.getTime() - hours * 60 * 60 * 1000)
  }

  private generateConfirmationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private async saveWorkflow(workflow: WorkflowExecution): Promise<void> {
    await this.supabase
      .from('communication_workflows')
      .insert([{
        id: workflow.id,
        appointment_id: workflow.appointmentId,
        patient_id: workflow.patientId,
        clinic_id: workflow.clinicId,
        workflow_type: workflow.workflowType,
        status: workflow.status,
        scheduled_at: workflow.scheduledAt.toISOString(),
        steps: workflow.steps,
        results: workflow.results,
        metadata: workflow.metadata,
        created_at: new Date().toISOString()
      }])
  }

  private async getWorkflow(workflowId: string): Promise<WorkflowExecution | null> {
    const { data } = await this.supabase
      .from('communication_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    return data ? this.mapToWorkflowExecution(data) : null
  }

  private async updateWorkflow(workflow: WorkflowExecution): Promise<void> {
    await this.supabase
      .from('communication_workflows')
      .update({
        status: workflow.status,
        started_at: workflow.startedAt?.toISOString(),
        completed_at: workflow.completedAt?.toISOString(),
        steps: workflow.steps,
        results: workflow.results,
        metadata: workflow.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflow.id)
  }

  private mapToWorkflowExecution(data: any): WorkflowExecution {
    return {
      id: data.id,
      appointmentId: data.appointment_id,
      patientId: data.patient_id,
      clinicId: data.clinic_id,
      workflowType: data.workflow_type,
      status: data.status,
      steps: data.steps || [],
      scheduledAt: new Date(data.scheduled_at),
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      results: data.results || {
        messagesSent: 0,
        messagesDelivered: 0,
        responseReceived: false,
        noShowPrevented: false,
        waitlistFilled: false,
        cost: 0,
        effectiveness: 0
      },
      metadata: data.metadata || {}
    }
  }
}

export const schedulingCommunicationWorkflow = new SchedulingCommunicationWorkflow()

