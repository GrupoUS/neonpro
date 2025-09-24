/**
 * WebRTC Peer Connection Manager
 * Manages peer connections for CFM-compliant telemedicine sessions
 * with quality monitoring, recording capabilities, and compliance features
 */

import { databaseLogger, logHealthcareError } from '../../../shared/src/logging/healthcare-logger';

// Using native WebRTC types from DOM lib

interface PeerConnectionConfig {
  sessionId: string;
  localUserId: string;
  remoteUserId: string;
  isOfferer: boolean;
  mediaConstraints: MediaStreamConstraints;
  recordingEnabled: boolean;
  qualityMonitoring: boolean;
}

declare type MediaStreamConstraints = {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
};

declare type RTCConfiguration = {
  iceServers?: RTCIceServer[];
  iceCandidatePoolSize?: number;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
};

interface ConnectionQuality {
  packetsLost: number;
  jitter: number;
  rtt: number;
  bandwidth: number;
  timestamp: Date;
}

interface RecordingChunk {
  data: Blob;
  timestamp: number;
  type: 'video' | 'audio' | 'data';
}

export class WebRTCPeerManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: RecordingChunk[] = [];
  private qualityMonitorInterval: NodeJS.Timeout | null = null;

  private config: PeerConnectionConfig;
  private eventCallbacks: Map<string, Function[]> = new Map();
  private isConnected: boolean = false;
  private connectionStartTime: Date | null = null;

  // ICE configuration for Brazilian servers and TURN fallbacks
  private static readonly ICE_CONFIG: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun.cloudflare.com:3478',
        ],
      },
      // TURN servers would be configured here for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'credential',
      // },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };

  constructor(config: PeerConnectionConfig) {
    this.config = config;
    this.initializePeerConnection();
  }

  /**
   * Initializes RTCPeerConnection with comprehensive event handlers
   */
  private initializePeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(WebRTCPeerManager.ICE_CONFIG);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.emit('ice-candidate', {
          candidate: event.candidate,
          sessionId: this.config.sessionId,
          from: this.config.localUserId,
          to: this.config.remoteUserId,
        });
      } else {
        databaseLogger.info('ICE gathering complete', { sessionId: this.config.sessionId });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      databaseLogger.info('Connection state changed', {
        state,
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });

      this.emit('connection-state-change', {
        state,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });

      if (state === 'connected') {
        this.isConnected = true;
        this.connectionStartTime = new Date();
        this.startQualityMonitoring();

        // Start recording if enabled
        if (this.config.recordingEnabled) {
          this.startRecording();
        }
      } else if (state === 'failed' || state === 'disconnected') {
        this.isConnected = false;
        this.stopQualityMonitoring();
        this.stopRecording();
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      databaseLogger.info('ICE connection state changed', {
        state,
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });

      this.emit('ice-connection-state-change', {
        state,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      databaseLogger.info('Remote track received', {
        trackKind: event.track.kind,
        sessionId: this.config.sessionId,
        fromUserId: this.config.remoteUserId,
      });

      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.emit('remote-stream', {
          stream: this.remoteStream,
          track: event.track,
          sessionId: this.config.sessionId,
          from: this.config.remoteUserId,
        });
      }
    };

    // Create data channel for compliance and metadata
    if (this.config.isOfferer) {
      this.createDataChannel();
    } else {
      this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
        this.dataChannel = event.channel;
        this.setupDataChannelHandlers();
      };
    }

    // Handle negotiation needed
    this.peerConnection.onnegotiationneeded = () => {
      databaseLogger.info('Negotiation needed', {
        sessionId: this.config.sessionId,
        isOfferer: this.config.isOfferer,
      });
      if (this.config.isOfferer) {
        this.createOffer();
      }
    };
  }

  /**
   * Creates data channel for non-media communication
   */
  private createDataChannel(): void {
    if (!this.peerConnection) return;

    this.dataChannel = this.peerConnection.createDataChannel('compliance', {
      ordered: true,
      maxRetransmits: 3,
    });

    this.setupDataChannelHandlers();
  }

  /**
   * Sets up data channel event handlers
   */
  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      databaseLogger.info('Data channel opened', {
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });
      this.emit('data-channel-open', {
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });

      // Send initial compliance metadata
      this.sendComplianceMetadata({
        type: 'session-start',
        _userId: this.config.localUserId,
        timestamp: new Date().toISOString(),
        deviceInfo: this.getDeviceInfo(),
      });
    };

    this.dataChannel.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        databaseLogger.info('Data channel message received', {
          messageType: data.type,
          sessionId: this.config.sessionId,
          fromUserId: this.config.remoteUserId,
        });

        this.emit('data-channel-message', {
          data,
          sessionId: this.config.sessionId,
          from: this.config.remoteUserId,
        });

        // Handle compliance messages
        if (data.type === 'compliance') {
          this.handleComplianceMessage(data);
        }
      } catch (error) {
        logHealthcareError('database', error, {
          method: 'parseDataChannelMessage',
          sessionId: this.config.sessionId,
          messageType: event.data,
        });
      }
    };

    this.dataChannel.onerror = (error: RTCErrorEvent) => {
      logHealthcareError('database', error, {
        method: 'dataChannelError',
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });
      this.emit('data-channel-error', {
        error,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });
    };

    this.dataChannel.onclose = () => {
      databaseLogger.info('Data channel closed', {
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });
      this.emit('data-channel-close', {
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });
    };
  }

  /**
   * Starts media capture with specified constraints
   */
  public async startMedia(): Promise<MediaStream> {
    try {
      databaseLogger.info('Media capture starting', {
        mediaConstraints: this.config.mediaConstraints,
        sessionId: this.config.sessionId,
      });

      this.localStream = await navigator.mediaDevices.getUserMedia(
        this.config.mediaConstraints,
      );

      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      this.emit('local-stream', {
        stream: this.localStream,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });

      return this.localStream;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'startMedia',
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });
      this.emit('media-error', {
        error,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });
      throw error;
    }
  }

  /**
   * Creates WebRTC offer
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      databaseLogger.info('Creating offer', {
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await this.peerConnection.setLocalDescription(offer);

      databaseLogger.info('Offer created and set', {
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });

      this.emit('offer-created', {
        offer,
        sessionId: this.config.sessionId,
        from: this.config.localUserId,
        to: this.config.remoteUserId,
      });

      return offer;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'createOffer',
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });
      throw error;
    }
  }

  /**
   * Creates WebRTC answer
   */
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      databaseLogger.info('Creating answer', {
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      databaseLogger.info('Answer created and set', {
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });

      this.emit('answer-created', {
        answer,
        sessionId: this.config.sessionId,
        from: this.config.localUserId,
        to: this.config.remoteUserId,
      });

      return answer;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'createAnswer',
        sessionId: this.config.sessionId,
        toUserId: this.config.remoteUserId,
      });
      throw error;
    }
  }

  /**
   * Sets remote description
   */
  public async setRemoteDescription(
    description: RTCSessionDescriptionInit,
  ): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      databaseLogger.info('Setting remote description', {
        descriptionType: description.type,
        sessionId: this.config.sessionId,
      });
      await this.peerConnection.setRemoteDescription(description);

      // If we received an offer and we're not the offerer, create answer
      if (description.type === 'offer' && !this.config.isOfferer) {
        await this.createAnswer();
      }
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'setRemoteDescription',
        sessionId: this.config.sessionId,
        descriptionType: description.type,
      });
      throw error;
    }
  }

  /**
   * Adds ICE candidate
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      databaseLogger.info('ICE candidate added', { sessionId: this.config.sessionId });
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'addIceCandidate',
        sessionId: this.config.sessionId,
      });
      throw error;
    }
  }

  /**
   * Starts quality monitoring
   */
  private startQualityMonitoring(): void {
    if (!this.config.qualityMonitoring || this.qualityMonitorInterval) {
      return;
    }

    this.qualityMonitorInterval = setInterval(async () => {
      const quality = await this.getConnectionQuality();
      if (quality) {
        this.emit('quality-update', {
          quality,
          sessionId: this.config.sessionId,
          _userId: this.config.localUserId,
        });
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stops quality monitoring
   */
  private stopQualityMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
  }

  /**
   * Gets connection quality metrics
   */
  public async getConnectionQuality(): Promise<ConnectionQuality | null> {
    if (!this.peerConnection) return null;

    try {
      const stats = await this.peerConnection.getStats();
      let packetsLost = 0;
      let jitter = 0;
      let rtt = 0;
      let bandwidth = 0;

      stats.forEach(report => {
        if (report.type === 'inbound-rtp') {
          packetsLost += report.packetsLost || 0;
          jitter += report.jitter || 0;
        } else if (
          report.type === 'candidate-pair'
          && report.state === 'succeeded'
        ) {
          rtt = report.currentRoundTripTime || 0;
        } else if (report.type === 'outbound-rtp') {
          // Calculate bandwidth from bytes sent
          const bytesSent = report.bytesSent || 0;
          const duration = (Date.now() - (this.connectionStartTime?.getTime() || Date.now()))
            / 1000;
          bandwidth = duration > 0 ? (bytesSent * 8) / duration : 0; // bits per second
        }
      });

      return {
        packetsLost,
        jitter,
        rtt,
        bandwidth,
        timestamp: new Date(),
      };
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getConnectionQuality',
        sessionId: this.config.sessionId,
      });
      return null;
    }
  }

  /**
   * Starts recording if supported
   */
  private startRecording(): void {
    if (
      !this.localStream
      || !MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ) {
      databaseLogger.warn('Recording not supported', {
        sessionId: this.config.sessionId,
        hasLocalStream: !!this.localStream,
      });
      return;
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1000000, // 1 Mbps
      });

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.recordingChunks.push({
            data: event.data,
            timestamp: Date.now(),
            type: 'video',
          });
        }
      };

      this.mediaRecorder.onstop = () => {
        databaseLogger.info('Recording stopped', {
          sessionId: this.config.sessionId,
          userId: this.config.localUserId,
          chunksCount: this.recordingChunks.length,
        });
        this.emit('recording-stopped', {
          chunks: this.recordingChunks,
          sessionId: this.config.sessionId,
          _userId: this.config.localUserId,
        });
      };

      this.mediaRecorder.start(10000); // Record in 10-second chunks
      databaseLogger.info('Recording started', {
        sessionId: this.config.sessionId,
        userId: this.config.localUserId,
      });

      this.emit('recording-started', {
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'startRecording',
        sessionId: this.config.sessionId,
      });
    }
  }

  /**
   * Stops recording
   */
  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Sends compliance metadata through data channel
   */
  public sendComplianceMetadata(metadata: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(
        JSON.stringify({
          type: 'compliance',
          ...metadata,
        }),
      );
    }
  }

  /**
   * Handles compliance messages from remote peer
   */
  private handleComplianceMessage(data: any): void {
    databaseLogger.info('Handling compliance message', {
      messageType: data.type,
      sessionId: this.config.sessionId,
      fromUserId: this.config.remoteUserId,
    });

    this.emit('compliance-message', {
      data,
      sessionId: this.config.sessionId,
      from: this.config.remoteUserId,
    });
  }

  /**
   * Gets device information for compliance logging
   */
  private getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
    };
  }

  /**
   * Mutes/unmutes audio
   */
  public setAudioMuted(muted: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });

      this.emit('audio-mute-changed', {
        muted,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });

      // Send compliance metadata
      this.sendComplianceMetadata({
        type: 'audio-mute-changed',
        muted,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Enables/disables video
   */
  public setVideoEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });

      this.emit('video-enabled-changed', {
        enabled,
        sessionId: this.config.sessionId,
        _userId: this.config.localUserId,
      });

      // Send compliance metadata
      this.sendComplianceMetadata({
        type: 'video-enabled-changed',
        enabled,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Event subscription
   */
  public on(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  /**
   * Event unsubscription
   */
  public off(event: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Event emission
   */
  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logHealthcareError('database', error, {
            method: 'eventCallback',
            eventName: event,
            sessionId: this.config.sessionId,
          });
        }
      });
    }
  }

  /**
   * Gets current connection statistics
   */
  public async getConnectionStats(): Promise<any> {
    if (!this.peerConnection) return null;

    try {
      const stats = await this.peerConnection.getStats();
      const statsObj: any = {};

      stats.forEach((report, _id) => {
        statsObj[id] = report;
      });

      return statsObj;
    } catch (error) {
      logHealthcareError('database', error, {
        method: 'getConnectionStats',
        sessionId: this.config.sessionId,
      });
      return null;
    }
  }

  /**
   * Closes peer connection and cleans up resources
   */
  public close(): void {
    databaseLogger.info('Peer connection closing', {
      sessionId: this.config.sessionId,
      userId: this.config.localUserId,
    });

    // Stop recording
    this.stopRecording();

    // Stop quality monitoring
    this.stopQualityMonitoring();

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    // Clear event callbacks
    this.eventCallbacks.clear();

    this.emit('connection-closed', {
      sessionId: this.config.sessionId,
      _userId: this.config.localUserId,
    });

    databaseLogger.info('Peer connection closed', {
      sessionId: this.config.sessionId,
      userId: this.config.localUserId,
    });
  }

  /**
   * Gets current connection state
   */
  public getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }

  /**
   * Gets local stream
   */
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Gets remote stream
   */
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Checks if connected
   */
  public isConnectionEstablished(): boolean {
    return (
      this.isConnected && this.peerConnection?.connectionState === 'connected'
    );
  }
}

export default WebRTCPeerManager;
