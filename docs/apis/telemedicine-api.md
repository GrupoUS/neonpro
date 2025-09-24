---
title: "Telemedicine API"
last_updated: 2025-09-24
form: reference
tags: [telemedicine, webrtc, video-consultation, cfm]
priority: HIGH
related:
  - ./AGENTS.md
  - ./healthcare-compliance-api.md
---

# Telemedicine API — Video Consultation Endpoints

## Session Management

### Core Endpoints

```bash
POST /api/telemedicine/session/create    # Create session
POST /api/telemedicine/session/start     # Start session
POST /api/telemedicine/session/end       # End session
GET  /api/telemedicine/session/:id       # Get session details
```

### Real-time Communication

```bash
WebSocket: wss://api.neonpro.com/telemedicine/ws
POST /api/telemedicine/webrtc/offer      # WebRTC offer
POST /api/telemedicine/webrtc/answer     # WebRTC answer
POST /api/telemedicine/webrtc/candidate  # ICE candidate
```

## Implementation Examples

### Create Telemedicine Session

```typescript
interface TelemedicineSessionInput {
  patientId: string
  physicianId: string
  sessionType: 'consultation' | 'follow_up' | 'emergency'
  specialty: string
  scheduledFor: Date
  estimatedDuration: number // minutes
  clinicId: string
  notes?: string
}

const session = await fetch('/api/telemedicine/session/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    patientId: 'patient_123',
    physicianId: 'physician_456',
    sessionType: 'consultation',
    specialty: 'dermatology',
    scheduledFor: new Date('2025-09-25T10:00:00Z'),
    estimatedDuration: 30,
    clinicId: 'clinic_789',
  }),
})

// Response
interface TelemedicineSession {
  sessionId: string
  roomId: string
  status: 'scheduled' | 'active' | 'ended' | 'cancelled'
  compliance: {
    licenseVerified: boolean
    telemedicineCompliant: boolean
    consentObtained: boolean
  }
  recordingEnabled: boolean
}
```

### Start Video Session

```typescript
// Start session
await fetch('/api/telemedicine/session/start', {
  method: 'POST',
  body: JSON.stringify({ sessionId: 'session_123' }),
})

// WebSocket connection for real-time communication
const ws = new WebSocket('wss://api.neonpro.com/telemedicine/ws')

ws.send(JSON.stringify({
  type: 'join_room',
  sessionId: 'session_123',
  roomId: 'room_456',
  role: 'physician', // or 'patient'
}))
```

### WebRTC Integration

```typescript
// WebRTC offer/answer exchange
const offer = await peerConnection.createOffer()
await peerConnection.setLocalDescription(offer)

await fetch('/api/telemedicine/webrtc/offer', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: 'session_123',
    offer: offer,
  }),
})

// Handle ICE candidates
peerConnection.onicecandidate = async (event) => {
  if (event.candidate) {
    await fetch('/api/telemedicine/webrtc/candidate', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        candidate: event.candidate,
      }),
    })
  }
}
```

## CFM Compliance Features

### License Verification

- Automatic CRM validation
- Telemedicine authorization check
- Specialty verification
- Geographic restrictions compliance

### Session Requirements

- Physician license verified before session creation
- Patient consent obtained and recorded
- Session recording (when authorized)
- Medical records integration
- Prescription validation

## Recording & Documentation

### Session Recording

```bash
POST /api/telemedicine/recording/start   # Start recording
POST /api/telemedicine/recording/stop    # Stop recording
GET  /api/telemedicine/recording/:id     # Get recording
DELETE /api/telemedicine/recording/:id   # Delete recording (LGPD)
```

### Medical Documentation

```bash
POST /api/telemedicine/notes            # Add session notes
POST /api/telemedicine/prescription     # Create prescription
POST /api/telemedicine/followup         # Schedule follow-up
```

## Security & Privacy

### LGPD Compliance

- End-to-end encryption for video/audio
- Automatic data retention policies
- Patient consent for recording
- Right to erasure compliance
- Audit logging for all sessions

### Access Controls

- Multi-factor authentication required
- Role-based access (physician/patient/coordinator)
- Session access tokens with expiration
- Geographic restrictions
- Device authentication

## Technical Specifications

### WebRTC Configuration

```typescript
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.neonpro.com:3478' },
    {
      urls: 'turn:turn.neonpro.com:3478',
      username: 'user',
      credential: 'password',
    },
  ],
  iceCandidatePoolSize: 10,
}
```

### Media Constraints

```typescript
const mediaConstraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 15, ideal: 30, max: 60 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
}
```

## Quality Monitoring

### Session Metrics

```bash
GET /api/telemedicine/metrics/quality    # Video/audio quality
GET /api/telemedicine/metrics/network    # Network statistics
GET /api/telemedicine/metrics/duration   # Session duration stats
```

### Health Checks

```bash
GET /api/telemedicine/health/webrtc      # WebRTC service health
GET /api/telemedicine/health/servers     # Media server health
GET /api/telemedicine/health/compliance  # Compliance status
```

## Error Handling

### Common Errors

- `PHYSICIAN_NOT_AUTHORIZED`: CRM validation failed
- `SESSION_EXPIRED`: Session timeout
- `WEBRTC_CONNECTION_FAILED`: Network issues
- `RECORDING_PERMISSION_DENIED`: Patient consent missing
- `COMPLIANCE_VIOLATION`: CFM requirements not met

## See Also

- [API Control Hub](./AGENTS.md)
- [Healthcare Compliance API](./healthcare-compliance-api.md)
- [WebSocket Configuration](./websocket-configuration.md)
