/**
 * WebRTC Signaling Server
 * Implements Socket.IO-based signaling for CFM-compliant telemedicine sessions
 * with comprehensive compliance monitoring and audit trails
 */

import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import type { Socket } from 'socket.io'

// Import services
import { logHealthcareError, winstonLogger } from '../utils/logging'
import { CFMComplianceService } from './cfm-compliance.service'
import { WebRTCSessionService } from './webrtc-session.service'

interface SignalingParticipant {
  socketId: string
  _userId: string
  sessionId: string
  participantType: 'physician' | 'patient' | 'observer'
  deviceInfo: {
    browser: string
    os: string
    device: string
    connection: string
  }
  joinedAt: Date
  isActive: boolean
}

interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'connection-state'
  data: any
  from: string
  to: string
  sessionId: string
  timestamp: Date
}

interface SessionRoom {
  sessionId: string
  participants: Map<string, SignalingParticipant>
  signals: WebRTCSignal[]
  isActive: boolean
  createdAt: Date
}

export class WebRTCSignalingServer {
  private io: SocketIOServer
  private server: http.Server
  private sessionRooms: Map<string, SessionRoom> = new Map()
  private webrtcService: WebRTCSessionService
  private cfmService: CFMComplianceService

  constructor(port: number = 3001) {
    // Initialize services
    this.webrtcService = new WebRTCSessionService()
    this.cfmService = new CFMComplianceService()

    // Create HTTP server
    this.server = http.createServer()

    // Initialize Socket.IO with comprehensive configuration
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6, // 1MB for WebRTC signals
      allowEIO3: true, // Allow Engine.IO v3 for compatibility
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
    })

    this.setupSocketHandlers()
    this.setupCleanupInterval()

    // Start server
    this.server.listen(port, () => {
      winstonLogger.info(
        `WebRTC Signaling Server listening on port ${port}`,
        undefined,
        {
          healthcare: {
            workflowType: 'system_maintenance',
            clinicalContext: {
              facilityId: 'signaling-server',
              requiresAudit: true,
            },
          },
        },
      )
    })
  }

  /**
   * Sets up Socket.IO event handlers for WebRTC signaling
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      winstonLogger.debug(`Socket connected: ${socket.id}`)

      // Handle session join
      socket.on(
        'join-session',
        async (data: {
          sessionId: string
          _userId: string
          participantType: 'physician' | 'patient' | 'observer'
          deviceInfo: any
          authToken?: string
        }) => {
          try {
            await this.handleJoinSession(socket, data)
          } catch (error) {
            winstonLogger.error(
              'Error joining session',
              error instanceof Error ? error : undefined,
            )
            socket.emit('error', {
              type: 'join-session-failed',
              message: 'Failed to join session',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        },
      )

      // Handle WebRTC signaling
      socket.on(
        'webrtc-signal',
        async (signal: {
          type: 'offer' | 'answer' | 'ice-candidate'
          data: any
          to: string
          sessionId: string
        }) => {
          try {
            await this.handleWebRTCSignal(socket, signal)
          } catch (error) {
            winstonLogger.error(
              'Error handling WebRTC signal',
              error instanceof Error ? error : undefined,
            )
            socket.emit('error', {
              type: 'signal-failed',
              message: 'Failed to relay signal',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        },
      )

      // Handle connection state updates
      socket.on(
        'connection-state',
        async (state: {
          sessionId: string
          connectionState: RTCPeerConnectionState
          iceConnectionState: RTCIceConnectionState
          quality?: {
            packetsLost: number
            jitter: number
            rtt: number
            bandwidth: number
          }
        }) => {
          try {
            await this.handleConnectionState(socket, state)
          } catch (error) {
            logHealthcareError('database', error, {
              method: 'handleConnectionState',
              sessionId: state.sessionId,
              socketId: socket.id,
            })
          }
        },
      )

      // Handle session leave
      socket.on('leave-session', async (data: { sessionId: string }) => {
        try {
          await this.handleLeaveSession(socket, data.sessionId)
        } catch (error) {
          logHealthcareError('database', error, {
            method: 'handleLeaveSession',
            sessionId: data.sessionId,
            socketId: socket.id,
          })
        }
      })

      // Handle heartbeat for connection monitoring
      socket.on(
        'heartbeat',
        (data: { sessionId: string; timestamp: number }) => {
          socket.emit('heartbeat-ack', { timestamp: Date.now() })
          this.updateParticipantActivity(socket.id, data.sessionId)
        },
      )

      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        winstonLogger.debug(
          `Socket disconnected: ${socket.id}, reason: ${reason}`,
        )
        this.handleDisconnect(socket)
      })

      // Handle compliance events
      socket.on(
        'compliance-event',
        async (event: {
          sessionId: string
          eventType: string
          metadata?: any
        }) => {
          try {
            await this.handleComplianceEvent(socket, event)
          } catch (error) {
            logHealthcareError('database', error, {
              method: 'handleComplianceEvent',
              sessionId: event.sessionId,
              eventType: event.eventType,
            })
          }
        },
      )

      // Send initial connection acknowledgment
      socket.emit('connected', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        serverInfo: {
          version: '1.0.0',
          capabilities: ['webrtc', 'recording', 'compliance'],
        },
      })
    })
  }

  /**
   * Handles session join requests with authentication and compliance checks
   */
  private async handleJoinSession(
    socket: Socket,
    data: {
      sessionId: string
      _userId: string
      participantType: 'physician' | 'patient' | 'observer'
      deviceInfo: any
      authToken?: string
    },
  ): Promise<void> {
    const { sessionId, _userId: userId, participantType, deviceInfo } = data

    // Validate session exists and user is authorized
    const sessionStatus = await this.webrtcService.getSessionStatus(sessionId)
    if (
      sessionStatus.connectionState !== 'active' &&
      sessionStatus.connectionState !== 'waiting'
    ) {
      throw new Error('Session is not available for joining')
    }

    // Validate user authorization for this session
    const isAuthorized = await this.validateUserAuthorization(
      sessionId,
      userId,
      participantType,
    )
    if (!isAuthorized) {
      throw new Error('User not authorized for this session')
    }

    // Create or get session room
    let room = this.sessionRooms.get(sessionId)
    if (!room) {
      room = {
        sessionId,
        participants: new Map(),
        signals: [],
        isActive: true,
        createdAt: new Date(),
      }
      this.sessionRooms.set(sessionId, room)
    }

    // Create participant record
    const participant: SignalingParticipant = {
      socketId: socket.id,
      _userId: userId,
      sessionId,
      participantType,
      deviceInfo,
      joinedAt: new Date(),
      isActive: true,
    }

    // Add participant to room
    room.participants.set(socket.id, participant) // Join Socket.IO room
    ;(socket as any).join(sessionId)

    // Log compliance event
    await this.cfmService.logComplianceEvent({
      sessionId,
      eventType: 'participant_joined',
      description: 'Participant joined session',
      metadata: {
        socketId: socket.id,
        deviceInfo,
        signaling: true,
      },
    }) // Notify other participants
    ;(socket as any).to(sessionId).emit('participant-joined', {
      userId,
      participantType,
      socketId: socket.id,
      deviceInfo,
      timestamp: new Date().toISOString(),
    })

    // Send join confirmation with existing participants list
    const existingParticipants = Array.from(room.participants.values())
      .filter(p => p.socketId !== socket.id)
      .map(p => ({
        _userId: p._userId,
        participantType: p.participantType,
        socketId: p.socketId,
        deviceInfo: p.deviceInfo,
        joinedAt: p.joinedAt.toISOString(),
      }))

    socket.emit('session-joined', {
      sessionId,
      participants: existingParticipants,
      timestamp: new Date().toISOString(),
    })

    winstonLogger.info(
      `User ${userId} joined session ${sessionId} as ${participantType}`,
      undefined,
      {
        healthcare: {
          workflowType: 'session_management',
          clinicalContext: {
            sessionId,
            userId,
            participantType,
            facilityId: 'signaling-server',
            requiresAudit: true,
          },
        },
      },
    )
  }

  /**
   * Handles WebRTC signaling between participants
   */
  private async handleWebRTCSignal(
    socket: Socket,
    signal: {
      type: 'offer' | 'answer' | 'ice-candidate'
      data: any
      to: string
      sessionId: string
    },
  ): Promise<void> {
    const { type, data, to, sessionId } = signal

    // Get session room
    const room = this.sessionRooms.get(sessionId)
    if (!room) {
      throw new Error('Session room not found')
    }

    // Get sender participant
    const sender = room.participants.get(socket.id)
    if (!sender) {
      throw new Error('Sender not found in session')
    }

    // Create signal record
    const signalRecord: WebRTCSignal = {
      type,
      data,
      from: sender._userId,
      to,
      sessionId,
      timestamp: new Date(),
    }

    // Store signal in room history
    room.signals.push(signalRecord)

    // Keep only last 100 signals per room for memory management
    if (room.signals.length > 100) {
      room.signals = room.signals.slice(-100)
    }

    // Find target participant's socket
    const targetParticipant = Array.from(room.participants.values()).find(
      p => p._userId === to,
    )

    if (!targetParticipant) {
      throw new Error('Target participant not found')
    } // Send signal to target participant

    ;(socket as any).to(targetParticipant.socketId).emit('webrtc-signal', {
      type,
      data,
      from: sender._userId,
      sessionId,
      timestamp: signalRecord.timestamp.toISOString(),
    })

    // Log compliance event for sensitive signals
    if (type === 'offer' || type === 'answer') {
      await this.cfmService.logComplianceEvent({
        sessionId,
        eventType: `webrtc_${type}` as import('../types/events').ComplianceEventType,
        description: `WebRTC ${type} sent`,
        // _userId: sender.userId, // not part of type, move to metadata
        metadata: {
          targetUser: to,
          signalType: type,
          signaling: true,
        },
      })
    }

    winstonLogger.info(
      `Relayed ${type} signal from ${sender._userId} to ${to} in session ${sessionId}`,
      undefined,
      {
        healthcare: {
          workflowType: 'webrtc_signaling',
          clinicalContext: {
            sessionId,
            signalType: type,
            fromUser: sender._userId,
            toUser: to,
            facilityId: 'signaling-server',
            requiresAudit: true,
          },
        },
      },
    )
  }

  /**
   * Handles connection state updates for quality monitoring
   */
  private async handleConnectionState(
    socket: Socket,
    state: {
      sessionId: string
      connectionState: RTCPeerConnectionState
      iceConnectionState: RTCIceConnectionState
      quality?: {
        packetsLost: number
        jitter: number
        rtt: number
        bandwidth: number
      }
    },
  ): Promise<void> {
    const { sessionId, connectionState, iceConnectionState, quality } = state

    // Get session room and participant
    const room = this.sessionRooms.get(sessionId)
    if (!room) return

    const participant = room.participants.get(socket.id)
    if (!participant) return

    // Update quality metrics in database
    await this.webrtcService.updateQualityMetrics(sessionId, {
      bandwidth: quality?.bandwidth || 0,
      latency: quality?.rtt || 0,
      jitter: quality?.jitter || 0,
      packetLoss: quality?.packetsLost || 0,
      videoQuality: 5, // Default good quality
      audioQuality: 5, // Default good quality
      connectionStability: connectionState === 'connected' ? 5 : 2,
    }) // Broadcast connection state to other participants (for UI updates)
    ;(socket as any).to(sessionId).emit('participant-connection-state', {
      _userId: participant._userId,
      connectionState,
      iceConnectionState,
      quality,
      timestamp: new Date().toISOString(),
    })

    // Log compliance event for connection issues
    if (connectionState === 'failed' || connectionState === 'disconnected') {
      await this.cfmService.logComplianceEvent({
        sessionId,
        eventType: 'connection_issue',
        description: 'Connection issue detected',
        metadata: {
          connectionState,
          iceConnectionState,
          quality,
          signaling: true,
        },
      })
    }
  }

  /**
   * Handles session leave requests
   */
  private async handleLeaveSession(
    socket: Socket,
    sessionId: string,
  ): Promise<void> {
    const room = this.sessionRooms.get(sessionId)
    if (!room) return

    const participant = room.participants.get(socket.id)
    if (!participant) return

    // Remove participant from room
    room.participants.delete(socket.id) // Leave Socket.IO room
    ;(socket as any).leave(sessionId)

    // Log compliance event
    await this.cfmService.logComplianceEvent({
      sessionId,
      eventType: 'participant_left',
      description: `Participant ${participant._userId} left session`,
      metadata: {
        _userId: participant._userId,
        participantType: participant.participantType,
        socketId: socket.id,
        duration: Date.now() - participant.joinedAt.getTime(),
        signaling: true,
      },
    }) // Notify other participants
    ;(this.io as any).to(sessionId).emit('participant-left', {
      _userId: participant._userId,
      participantType: participant.participantType,
      timestamp: new Date().toISOString(),
    })

    // Clean up room if empty
    if (room.participants.size === 0) {
      room.isActive = false
      // Keep room for a short time for audit purposes, then remove
      setTimeout(() => {
        this.sessionRooms.delete(sessionId)
      }, 300000) // 5 minutes
    }

    winstonLogger.info(
      `User ${participant._userId} left session ${sessionId}`,
      undefined,
      {
        healthcare: {
          workflowType: 'session_management',
          clinicalContext: {
            sessionId,
            userId: participant._userId,
            participantType: participant.participantType,
            facilityId: 'signaling-server',
            requiresAudit: true,
          },
        },
      },
    )
  }

  /**
   * Handles socket disconnection
   */
  private handleDisconnect(socket: Socket): void {
    // Find all sessions this socket was part of
    for (const [sessionId, room] of this.sessionRooms.entries()) {
      const participant = room.participants.get(socket.id)
      if (participant) {
        // Handle graceful leave
        ;(async () => {
          try {
            await this.handleLeaveSession(socket, sessionId)
          } catch (error) {
            await logHealthcareError('database', error, {
              method: 'handleDisconnect',
              sessionId,
              socketId: socket.id,
            })
          }
        })()
      }
    }
  }

  /**
   * Handles compliance events from clients
   */
  private async handleComplianceEvent(
    socket: Socket,
    event: {
      sessionId: string
      eventType: string
      metadata?: any
    },
  ): Promise<void> {
    // Get participant info
    const room = this.sessionRooms.get(event.sessionId)
    if (!room) return

    const participant = room.participants.get(socket.id)
    if (!participant) return

    // Log compliance event
    await this.cfmService.logComplianceEvent({
      sessionId: event.sessionId,
      eventType: event.eventType as any,
      description: `Client compliance event: ${event.eventType}`,
      metadata: {
        _userId: participant._userId,
        participantType: participant.participantType,
        ...event.metadata,
        source: 'client',
        signaling: true,
      },
    })
  }

  /**
   * Validates user authorization for session participation
   */
  private async validateUserAuthorization(
    sessionId: string,
    _userId: string,
    participantType: 'physician' | 'patient' | 'observer',
  ): Promise<boolean> {
    try {
      // This would integrate with your authentication system
      // For now, we'll use a basic check via the WebRTC service
      const sessionDetails = await this.webrtcService.getSessionDetails(sessionId)

      if (!sessionDetails) return false

      // Check if user is authorized for this session
      if (
        participantType === 'patient' &&
        sessionDetails.session.patient_id === _userId
      ) {
        return true
      }

      if (
        participantType === 'physician' &&
        sessionDetails.session.physician_id === _userId
      ) {
        return true
      }

      // For observers, check if they have appropriate permissions
      if (participantType === 'observer') {
        // This would check observer permissions in your system
        return true // Simplified for demo
      }

      return false
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'validateUserAuthorization',
        sessionId,
        _userId,
        participantType,
      })
      return false
    }
  }

  /**
   * Updates participant activity timestamp
   */
  private updateParticipantActivity(socketId: string, sessionId: string): void {
    const room = this.sessionRooms.get(sessionId)
    if (!room) return

    const participant = room.participants.get(socketId)
    if (participant) {
      participant.isActive = true
    }
  }

  /**
   * Sets up cleanup interval for inactive sessions and participants
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupInactiveSessions()
    }, 60000) // Run every minute
  }

  /**
   * Cleans up inactive sessions and participants
   */
  private cleanupInactiveSessions(): void {
    const now = new Date()
    const inactivityTimeout = 5 * 60 * 1000 // 5 minutes

    for (const [sessionId, room] of this.sessionRooms.entries()) {
      // Remove inactive participants
      for (const [socketId, participant] of room.participants.entries()) {
        const inactiveTime = now.getTime() - participant.joinedAt.getTime()
        if (inactiveTime > inactivityTimeout && !participant.isActive) {
          winstonLogger.info(
            `Removing inactive participant ${participant._userId} from session ${sessionId}`,
            undefined,
            {
              healthcare: {
                workflowType: 'session_cleanup',
                clinicalContext: {
                  sessionId,
                  userId: participant._userId,
                  participantType: participant.participantType,
                  inactiveTime,
                  facilityId: 'signaling-server',
                  requiresAudit: true,
                },
              },
            },
          )
          room.participants.delete(socketId)

          // Log compliance event
          ;(async () => {
            try {
              await this.cfmService.logComplianceEvent({
                sessionId,
                eventType: 'participant_timeout',
                description: `Participant ${participant._userId} timed out due to inactivity`,
                metadata: {
                  inactiveTime,
                  signaling: true,
                },
              })
            } catch (error) {
              await logHealthcareError('database', error, {
                method: 'cleanupInactiveSessions',
                sessionId,
                userId: participant._userId,
              })
            }
          })()
        } else {
          // Reset activity flag for next check
          participant.isActive = false
        }
      }

      // Clean up empty or very old rooms
      const roomAge = now.getTime() - room.createdAt.getTime()
      const maxRoomAge = 24 * 60 * 60 * 1000 // 24 hours

      if (room.participants.size === 0 && roomAge > 300000) {
        // 5 minutes empty
        winstonLogger.info(
          `Cleaning up empty session room ${sessionId}`,
          undefined,
          {
            healthcare: {
              workflowType: 'session_cleanup',
              clinicalContext: {
                sessionId,
                reason: 'empty_room',
                facilityId: 'signaling-server',
                requiresAudit: true,
              },
            },
          },
        )
        this.sessionRooms.delete(sessionId)
      } else if (roomAge > maxRoomAge) {
        winstonLogger.info(
          `Cleaning up old session room ${sessionId}`,
          undefined,
          {
            healthcare: {
              workflowType: 'session_cleanup',
              clinicalContext: {
                sessionId,
                reason: 'old_room',
                roomAge,
                facilityId: 'signaling-server',
                requiresAudit: true,
              },
            },
          },
        )
        this.sessionRooms.delete(sessionId)
      }
    }
  }

  /**
   * Gets active sessions count for monitoring
   */
  public getActiveSessionsCount(): number {
    return Array.from(this.sessionRooms.values()).filter(
      room => room.isActive && room.participants.size > 0,
    ).length
  }

  /**
   * Gets total participants count for monitoring
   */
  public getTotalParticipantsCount(): number {
    return Array.from(this.sessionRooms.values()).reduce(
      (total, room) => total + room.participants.size,
      0,
    )
  }

  /**
   * Shuts down the signaling server gracefully
   */
  public async shutdown(): Promise<void> {
    winstonLogger.info(
      'Shutting down WebRTC Signaling Server...',
      undefined,
      {
        healthcare: {
          workflowType: 'system_maintenance',
          clinicalContext: {
            facilityId: 'signaling-server',
            requiresAudit: true,
          },
        },
      },
    )

    // Notify all connected clients
    this.io.emit('server-shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString(),
    })

    // Wait a moment for clients to receive the message
    await new Promise(resolve => setTimeout(resolve, 1000)) // Close all socket connections
    ;(this.io as any).close()

    // Close HTTP server
    await new Promise<void>(resolve => {
      this.server.close(() => {
        resolve()
      })
    })

    winstonLogger.info(
      'WebRTC Signaling Server shut down complete',
      undefined,
      {
        healthcare: {
          workflowType: 'system_maintenance',
          clinicalContext: {
            facilityId: 'signaling-server',
            requiresAudit: true,
          },
        },
      },
    )
  }
}

// Export singleton instance
export default WebRTCSignalingServer
