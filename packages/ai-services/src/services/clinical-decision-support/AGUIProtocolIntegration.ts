/**
 * AG-UI Protocol Integration for Clinical Decision Support
 * 
 * Real-time clinical event integration that bridges the AG-UI protocol
 * with the clinical decision support engine for live patient monitoring,
 * emergency alerts, and collaborative clinical workflows.
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { logger } from '@neonpro/shared';

import { 
  ClinicalDecisionSupportEngine,
  ClinicalDecisionSupportRequest,
  ClinicalDecisionSupportResponse 
} from './ClinicalDecisionSupportEngine';
import { AestheticTreatmentAdvisor } from './AestheticTreatmentAdvisor';
import { PredictiveHealthAnalytics } from './PredictiveHealthAnalytics';

import {
  ClinicalContext,
  PatientContext,
  AGUIMessage,
  AGUIEventType,
  AGUIClientStatus,
  AestheticConsultationResult,
  PredictiveInsight
} from '../../types/clinical-decision-support';

/**
 * AG-UI Protocol Integration Service
 * 
 * Manages real-time clinical communication, emergency alerts,
 * and collaborative decision support through the AG-UI protocol
 */
export class AGUIProtocolIntegration extends EventEmitter {
  private clinicalEngine: ClinicalDecisionSupportEngine;
  private aestheticAdvisor: AestheticTreatmentAdvisor;
  private predictiveAnalytics: PredictiveHealthAnalytics;
  
  private activeConnections: Map<string, AGUIClientConnection> = new Map();
  private eventHandlers: Map<AGUIEventType, Function[]> = new Map();
  private emergencyProtocols: Map<string, EmergencyProtocol> = new Map();
  private initialized = false;

  constructor(
    clinicalEngine: ClinicalDecisionSupportEngine,
    aestheticAdvisor: AestheticTreatmentAdvisor,
    predictiveAnalytics: PredictiveHealthAnalytics
  ) {
    super();
    this.clinicalEngine = clinicalEngine;
    this.aestheticAdvisor = aestheticAdvisor;
    this.predictiveAnalytics = predictiveAnalytics;
    
    this.initializeEventHandlers();
    this.initializeEmergencyProtocols();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all services
      await this.clinicalEngine.initialize();
      await this.aestheticAdvisor.initialize();
      await this.predictiveAnalytics.initialize();

      this.setupRealtimeEventHandlers();
      this.startHealthMonitoring();
      
      this.initialized = true;
      logger.info('AG-UI Protocol Integration initialized successfully');
      
      this.emit('initialized', {
        timestamp: new Date(),
        services: ['clinical-engine', 'aesthetic-advisor', 'predictive-analytics']
      });
    } catch (error) {
      logger.error('Failed to initialize AG-UI Protocol Integration', { error });
      throw error;
    }
  }

  /**
   * Register a new AG-UI client connection
   */
  async registerClient(
    clientId: string,
    clientInfo: {
      type: 'provider' | 'specialist' | 'ai_assistant' | 'monitoring_system';
      role: string;
      capabilities: string[];
      department: string;
      version: string;
    }
  ): Promise<{
    success: boolean;
    connectionId: string;
    assignedEvents: AGUIEventType[];
    heartbeatInterval: number;
  }> {
    try {
      const connectionId = uuidv4();
      const connection: AGUIClientConnection = {
        id: connectionId,
        clientId,
        ...clientInfo,
        status: 'connected',
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
        subscriptions: this.determineEventSubscriptions(clientInfo.type, clientInfo.role)
      };

      this.activeConnections.set(connectionId, connection);

      // Send welcome message with configuration
      await this.sendToClient(connectionId, {
        id: uuidv4(),
        type: 'connection_established',
        timestamp: new Date(),
        source: 'clinical_decision_support',
        target: clientId,
        payload: {
          connectionId,
          assignedEvents: connection.subscriptions,
          heartbeatInterval: 30000, // 30 seconds
          protocolVersion: '1.0.0',
          capabilities: {
            emergencyAlerts: true,
            realTimeConsultation: true,
            predictiveAnalytics: true,
            clinicalDecisionSupport: true
          }
        }
      });

      logger.info('AG-UI client registered', { 
        connectionId, 
        clientId, 
        type: clientInfo.type,
        role: clientInfo.role 
      });

      return {
        success: true,
        connectionId,
        assignedEvents: connection.subscriptions,
        heartbeatInterval: 30000
      };

    } catch (error) {
      logger.error('Client registration failed', { clientId, error });
      throw new Error(`Client registration failed: ${error.message}`);
    }
  }

  /**
   * Handle incoming AG-UI messages
   */
  async handleMessage(
    connectionId: string,
    message: AGUIMessage
  ): Promise<AGUIMessage | null> {
    try {
      const connection = this.activeConnections.get(connectionId);
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Update connection heartbeat
      connection.lastHeartbeat = new Date();

      // Route message based on type and payload
      switch (message.type) {
        case 'clinical_consultation_request':
          return this.handleClinicalConsultation(connection, message);
        
        case 'aesthetic_consultation_request':
          return this.handleAestheticConsultation(connection, message);
        
        case 'predictive_analytics_request':
          return this.handlePredictiveAnalytics(connection, message);
        
        case 'emergency_alert':
          return this.handleEmergencyAlert(connection, message);
        
        case 'patient_status_update':
          return this.handlePatientStatusUpdate(connection, message);
        
        case 'collaboration_request':
          return this.handleCollaborationRequest(connection, message);
        
        case 'heartbeat':
          return this.handleHeartbeat(connection, message);
        
        default:
          logger.warn('Unknown message type', { type: message.type, connectionId });
          return null;
      }

    } catch (error) {
      logger.error('Message handling failed', { 
        connectionId, 
        messageType: message.type, 
        error 
      });
      
      // Send error response
      return {
        id: uuidv4(),
        type: 'error_response',
        timestamp: new Date(),
        source: 'clinical_decision_support',
        target: message.source,
        payload: {
          originalMessageId: message.id,
          error: error.message,
          severity: 'error'
        }
      };
    }
  }

  /**
   * Send real-time emergency alert to relevant clients
   */
  async sendEmergencyAlert(
    alert: {
      type: 'patient_emergency' | 'system_failure' | 'security_breach' | 'compliance_violation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      patientId?: string;
      description: string;
      requiredActions: string[];
      timestamp: Date;
    }
  ): Promise<void> {
    try {
      const emergencyMessage: AGUIMessage = {
        id: uuidv4(),
        type: 'emergency_alert',
        timestamp: new Date(),
        source: 'clinical_decision_support',
        target: 'broadcast',
        payload: {
          alertId: uuidv4(),
          ...alert,
          protocol: this.emergencyProtocols.get(alert.type)
        }
      };

      // Send to all connected providers and specialists
      const targetConnections = Array.from(this.activeConnections.values())
        .filter(conn => 
          conn.type === 'provider' || 
          conn.type === 'specialist' || 
          conn.capabilities.includes('emergency_response')
        );

      await Promise.all(
        targetConnections.map(conn => 
          this.sendToClient(conn.id, emergencyMessage)
        )
      );

      // Log emergency event
      logger.warn('Emergency alert sent', {
        alertType: alert.type,
        severity: alert.severity,
        patientId: alert.patientId,
        targetsNotified: targetConnections.length
      });

      // Trigger automated emergency response
      await this.executeEmergencyProtocol(alert);

    } catch (error) {
      logger.error('Emergency alert sending failed', { alert, error });
      throw new Error(`Emergency alert failed: ${error.message}`);
    }
  }

  /**
   * Broadcast real-time clinical events to subscribed clients
   */
  async broadcastClinicalEvent(
    event: {
      type: AGUIEventType;
      patientId: string;
      eventType: string;
      data: any;
      priority: 'low' | 'medium' | 'high';
      requiresResponse: boolean;
    }
  ): Promise<void> {
    try {
      const eventMessage: AGUIMessage = {
        id: uuidv4(),
        type: event.type,
        timestamp: new Date(),
        source: 'clinical_decision_support',
        target: 'broadcast',
        payload: {
          eventId: uuidv4(),
          ...event
        }
      };

      // Send to subscribed clients
      const subscribedConnections = Array.from(this.activeConnections.values())
        .filter(conn => conn.subscriptions.includes(event.type));

      await Promise.all(
        subscribedConnections.map(conn => 
          this.sendToClient(conn.id, eventMessage)
        )
      );

      logger.info('Clinical event broadcasted', {
        eventType: event.type,
        patientId: event.patientId,
        recipients: subscribedConnections.length
      });

    } catch (error) {
      logger.error('Clinical event broadcast failed', { event, error });
    }
  }

  /**
   * Handle clinical consultation requests
   */
  private async handleClinicalConsultation(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const request: ClinicalDecisionSupportRequest = message.payload;

    // Process through clinical decision support engine
    const response = await this.clinicalEngine.processRequest(request);

    return {
      id: uuidv4(),
      type: 'clinical_consultation_response',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        response,
        processingTime: Date.now() - message.timestamp.getTime(),
        provider: connection.role
      }
    };
  }

  /**
   * Handle aesthetic consultation requests
   */
  private async handleAestheticConsultation(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const consultationRequest = message.payload;

    // Process through aesthetic treatment advisor
    const result = await this.aestheticAdvisor.generateAestheticConsultation(consultationRequest);

    return {
      id: uuidv4(),
      type: 'aesthetic_consultation_response',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        result,
        processingTime: Date.now() - message.timestamp.getTime(),
        specialist: connection.role
      }
    };
  }

  /**
   * Handle predictive analytics requests
   */
  private async handlePredictiveAnalytics(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const request = message.payload;

    let response: any;

    switch (request.analysisType) {
      case 'no_show_prediction':
        response = await this.predictiveAnalytics.predictPatientNoShow(request);
        break;
      case 'revenue_forecast':
        response = await this.predictiveAnalytics.predictRevenueWithClinicalFactors(request);
        break;
      case 'patient_outcome':
        response = await this.predictiveAnalytics.predictPersonalizedPatientOutcomes(request);
        break;
      default:
        throw new Error(`Unknown analysis type: ${request.analysisType}`);
    }

    return {
      id: uuidv4(),
      type: 'predictive_analytics_response',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        analysisType: request.analysisType,
        response,
        processingTime: Date.now() - message.timestamp.getTime()
      }
    };
  }

  /**
   * Handle emergency alerts
   */
  private async handleEmergencyAlert(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const alert = message.payload;

    // Log and forward emergency alert
    logger.error('Emergency alert received', {
      source: connection.clientId,
      alertType: alert.type,
      severity: alert.severity,
      patientId: alert.patientId
    });

    // Broadcast to other relevant clients
    await this.sendEmergencyAlert(alert);

    return {
      id: uuidv4(),
      type: 'emergency_alert_acknowledgment',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        acknowledged: true,
        acknowledgedBy: connection.role,
        timestamp: new Date()
      }
    };
  }

  /**
   * Handle patient status updates
   */
  private async handlePatientStatusUpdate(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const update = message.payload;

    // Broadcast patient status change to subscribed clients
    await this.broadcastClinicalEvent({
      type: 'patient_status_update',
      patientId: update.patientId,
      eventType: 'status_change',
      data: update,
      priority: update.urgency || 'medium',
      requiresResponse: update.requiresAction || false
    });

    return {
      id: uuidv4(),
      type: 'status_update_acknowledgment',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        processed: true,
        broadcasted: true
      }
    };
  }

  /**
   * Handle collaboration requests
   */
  private async handleCollaborationRequest(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    const request = message.payload;

    // Find available specialists for collaboration
    const availableSpecialists = Array.from(this.activeConnections.values())
      .filter(conn => 
        conn.type === 'specialist' && 
        conn.status === 'connected' &&
        conn.department === request.specialty
      );

    // Send collaboration request to available specialists
    const collaborationMessage: AGUIMessage = {
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: new Date(),
      source: connection.clientId,
      target: 'specialists',
      payload: {
        ...request,
        requestingProvider: connection.role,
        urgency: request.urgency || 'medium'
      }
    };

    await Promise.all(
      availableSpecialists.map(specialist => 
        this.sendToClient(specialist.id, collaborationMessage)
      )
    );

    return {
      id: uuidv4(),
      type: 'collaboration_initiated',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        specialistsNotified: availableSpecialists.length,
        estimatedResponseTime: '2-5 minutes'
      }
    };
  }

  /**
   * Handle heartbeat messages
   */
  private async handleHeartbeat(
    connection: AGUIClientConnection,
    message: AGUIMessage
  ): Promise<AGUIMessage> {
    connection.lastHeartbeat = new Date();

    return {
      id: uuidv4(),
      type: 'heartbeat_response',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: message.source,
      payload: {
        originalMessageId: message.id,
        timestamp: new Date(),
        systemStatus: 'operational'
      }
    };
  }

  /**
   * Execute emergency protocol
   */
  private async executeEmergencyProtocol(alert: any): Promise<void> {
    const protocol = this.emergencyProtocols.get(alert.type);
    if (!protocol) {
      logger.warn('No emergency protocol found', { alertType: alert.type });
      return;
    }

    try {
      logger.info('Executing emergency protocol', { 
        protocolType: alert.type, 
        severity: alert.severity 
      });

      // Execute protocol steps
      for (const step of protocol.steps) {
        await this.executeEmergencyStep(step, alert);
      }

      // Log protocol execution
      logger.info('Emergency protocol executed successfully', {
        protocolType: alert.type,
        stepsExecuted: protocol.steps.length
      });

    } catch (error) {
      logger.error('Emergency protocol execution failed', { 
        protocolType: alert.type, 
        error 
      });
    }
  }

  /**
   * Execute individual emergency step
   */
  private async executeEmergencyStep(step: EmergencyStep, alert: any): Promise<void> {
    switch (step.action) {
      case 'notify_team':
        await this.broadcastClinicalEvent({
          type: 'emergency_notification',
          patientId: alert.patientId || 'unknown',
          eventType: 'team_alert',
          data: { message: step.message, severity: alert.severity },
          priority: 'high',
          requiresResponse: true
        });
        break;

      case 'activate_resources':
        logger.info('Emergency resources activated', { 
          resources: step.resources,
          alertType: alert.type 
        });
        break;

      case 'initiate_protocol':
        logger.info('Emergency protocol initiated', {
          protocol: step.protocol,
          alertType: alert.type
        });
        break;

      default:
        logger.warn('Unknown emergency step action', { action: step.action });
    }
  }

  /**
   * Send message to specific client
   */
  private async sendToClient(connectionId: string, message: AGUIMessage): Promise<void> {
    // In production, this would use WebSocket or other real-time transport
    // For now, emit as event to be handled by transport layer
    this.emit('send_to_client', { connectionId, message });
  }

  /**
   * Determine event subscriptions based on client type and role
   */
  private determineEventSubscriptions(
    clientType: string,
    role: string
  ): AGUIEventType[] {
    const baseSubscriptions: AGUIEventType[] = [
      'emergency_alert',
      'system_status'
    ];

    switch (clientType) {
      case 'provider':
        return [
          ...baseSubscriptions,
          'patient_status_update',
          'clinical_consultation_response',
          'collaboration_request'
        ];

      case 'specialist':
        return [
          ...baseSubscriptions,
          'aesthetic_consultation_request',
          'collaboration_request',
          'emergency_consultation'
        ];

      case 'ai_assistant':
        return [
          ...baseSubscriptions,
          'predictive_analytics_response',
          'clinical_insights'
        ];

      case 'monitoring_system':
        return [
          'system_status',
          'emergency_alert',
          'performance_metrics'
        ];

      default:
        return baseSubscriptions;
    }
  }

  /**
   * Initialize event handlers
   */
  private initializeEventHandlers(): void {
    // Set up event handlers for different message types
    const eventTypes: AGUIEventType[] = [
      'emergency_alert',
      'patient_status_update',
      'clinical_consultation_request',
      'aesthetic_consultation_request',
      'predictive_analytics_request',
      'collaboration_request',
      'system_status'
    ];

    eventTypes.forEach(type => {
      this.eventHandlers.set(type, []);
    });
  }

  /**
   * Initialize emergency protocols
   */
  private initializeEmergencyProtocols(): void {
    this.emergencyProtocols.set('patient_emergency', {
      type: 'patient_emergency',
      priority: 'critical',
      activationCriteria: ['vital_signs_critical', 'severe_distress', 'loss_of_consciousness'],
      steps: [
        {
          action: 'notify_team',
          message: 'Immediate medical assistance required',
          timeout: 30000
        },
        {
          action: 'activate_resources',
          resources: ['emergency_response_team', 'crash_cart', 'defibrillator'],
          timeout: 60000
        },
        {
          action: 'initiate_protocol',
          protocol: 'advanced_cardiac_life_support',
          timeout: 120000
        }
      ],
      escalationPath: ['attending_physician', 'department_head', 'chief_medical_officer']
    });

    this.emergencyProtocols.set('system_failure', {
      type: 'system_failure',
      priority: 'high',
      activationCriteria: ['system_outage', 'data_corruption', 'security_breach'],
      steps: [
        {
          action: 'notify_team',
          message: 'System failure detected - IT support required',
          timeout: 30000
        },
        {
          action: 'activate_resources',
          resources: ['it_support_team', 'backup_systems'],
          timeout: 60000
        }
      ],
      escalationPath: ['it_support', 'system_administrator', 'chief_technology_officer']
    });
  }

  /**
   * Setup real-time event handlers
   */
  private setupRealtimeEventHandlers(): void {
    // Handle connection health monitoring
    setInterval(() => {
      this.monitorConnectionHealth();
    }, 30000); // Every 30 seconds

    // Handle system status broadcasting
    setInterval(() => {
      this.broadcastSystemStatus();
    }, 300000); // Every 5 minutes
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    logger.info('Health monitoring started for AG-UI Protocol Integration');
  }

  /**
   * Monitor connection health
   */
  private monitorConnectionHealth(): void {
    const now = new Date();
    const staleThreshold = 60000; // 1 minute

    for (const [connectionId, connection] of this.activeConnections) {
      const timeSinceHeartbeat = now.getTime() - connection.lastHeartbeat.getTime();
      
      if (timeSinceHeartbeat > staleThreshold) {
        logger.warn('Stale connection detected', { connectionId, timeSinceHeartbeat });
        
        // Mark as disconnected
        connection.status = 'disconnected';
        
        // Emit disconnection event
        this.emit('client_disconnected', { connectionId, reason: 'heartbeat_timeout' });
      }
    }
  }

  /**
   * Broadcast system status
   */
  private async broadcastSystemStatus(): Promise<void> {
    const statusMessage: AGUIMessage = {
      id: uuidv4(),
      type: 'system_status',
      timestamp: new Date(),
      source: 'clinical_decision_support',
      target: 'broadcast',
      payload: {
        status: 'operational',
        activeConnections: this.activeConnections.size,
        services: {
          clinicalEngine: 'operational',
          aestheticAdvisor: 'operational',
          predictiveAnalytics: 'operational'
        },
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    await this.broadcastClinicalEvent({
      type: 'system_status',
      patientId: 'system',
      eventType: 'status_update',
      data: statusMessage.payload,
      priority: 'low',
      requiresResponse: false
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    totalConnections: number;
    activeConnections: number;
    connectionsByType: Record<string, number>;
    uptime: number;
  } {
    const connections = Array.from(this.activeConnections.values());
    const activeConnections = connections.filter(conn => conn.status === 'connected');

    const connectionsByType = connections.reduce((acc, conn) => {
      acc[conn.type] = (acc[conn.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConnections: connections.length,
      activeConnections: activeConnections.length,
      connectionsByType,
      uptime: process.uptime()
    };
  }
}

// Type definitions for AG-UI integration
interface AGUIClientConnection {
  id: string;
  clientId: string;
  type: 'provider' | 'specialist' | 'ai_assistant' | 'monitoring_system';
  role: string;
  capabilities: string[];
  department: string;
  version: string;
  status: AGUIClientStatus;
  connectedAt: Date;
  lastHeartbeat: Date;
  subscriptions: AGUIEventType[];
}

interface EmergencyProtocol {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  activationCriteria: string[];
  steps: EmergencyStep[];
  escalationPath: string[];
}

interface EmergencyStep {
  action: 'notify_team' | 'activate_resources' | 'initiate_protocol';
  message?: string;
  resources?: string[];
  protocol?: string;
  timeout: number;
}