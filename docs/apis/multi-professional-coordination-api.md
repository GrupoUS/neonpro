# Multi-Professional Coordination API Documentation

## Overview

The Multi-Professional Coordination API enables seamless collaboration between different aesthetic healthcare professionals (CFM, COREN, CFF, CNEP) while maintaining proper compliance, professional boundaries, and scope validation.

**Base URL**: `/api/trpc/multiProfessionalCoordinationRouter`

## Features

- **Professional Teams Management**: Create and manage cross-disciplinary teams
- **Professional Referrals**: Cross-professional referrals and consultations
- **Collaborative Sessions**: Joint treatment and planning sessions
- **Coordination Messaging**: Secure inter-professional communication
- **Professional Supervision**: Supervision and mentorship relationships
- **Scope Validation**: Professional scope authorization and validation
- **Coordination Protocols**: Standardized workflows and automation
- **Analytics & Reporting**: Collaboration metrics and insights

## Authentication

All endpoints require authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Professional Teams Management

### Create Professional Team

**Endpoint**: `createProfessionalTeam`

Creates a new professional team for cross-disciplinary collaboration.

**Request Body**:
```json
{
  "clinicId": "uuid",
  "name": "string (1-100 chars)",
  "description": "string (optional)",
  "teamType": "multidisciplinary | specialized | consultation | emergency"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Equipe profissional criada com sucesso",
  "data": {
    "id": "uuid",
    "clinicId": "uuid",
    "name": "string",
    "description": "string | null",
    "teamType": "string",
    "isActive": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Professional Teams

**Endpoint**: `getProfessionalTeams`

Retrieves all professional teams for a clinic.

**Query Parameters**:
- `clinicId` (string, required): Clinic ID

**Response**:
```json
{
  "success": true,
  "message": "Equipes profissionais obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "clinicId": "uuid",
      "name": "string",
      "description": "string | null",
      "teamType": "string",
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "team_members": [...]
    }
  ]
}
```

### Add Team Member

**Endpoint**: `addTeamMember`

Adds a professional to a team with specific role and permissions.

**Request Body**:
```json
{
  "teamId": "uuid",
  "professionalId": "uuid",
  "role": "leader | coordinator | member | consultant | supervisor",
  "permissions": "object (optional)",
  "scopeLimitations": "string[] (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Membro adicionado à equipe com sucesso",
  "data": {
    "id": "uuid",
    "teamId": "uuid",
    "professionalId": "uuid",
    "role": "string",
    "permissions": {},
    "scopeLimitations": [],
    "joinedAt": "timestamp",
    "leftAt": "timestamp | null",
    "isActive": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Remove Team Member

**Endpoint**: `removeTeamMember`

Removes a member from a team (soft delete).

**Query Parameters**:
- `teamMemberId` (string, required): Team member ID

**Response**:
```json
{
  "success": true,
  "message": "Membro removido da equipe com sucesso",
  "data": true
}
```

## Professional Referrals

### Create Referral

**Endpoint**: `createReferral`

Creates a professional referral with automatic scope validation.

**Request Body**:
```json
{
  "patientId": "uuid",
  "referringProfessionalId": "uuid",
  "referredProfessionalId": "uuid",
  "referralType": "consultation | treatment | assessment | supervision | second_opinion",
  "reason": "string",
  "clinicalNotes": "string (optional)",
  "urgencyLevel": "low | medium | high | emergency",
  "responseDeadline": "date (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Encaminhamento profissional criado com sucesso",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "referringProfessionalId": "uuid",
    "referredProfessionalId": "uuid",
    "referralType": "string",
    "reason": "string",
    "clinicalNotes": "string | null",
    "urgencyLevel": "string",
    "status": "pending | accepted | declined | completed | cancelled",
    "responseNotes": "string | null",
    "responseDeadline": "timestamp | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Referrals

**Endpoint**: `getReferrals`

Retrieves referrals for a professional.

**Query Parameters**:
- `professionalId` (string, required): Professional ID
- `type` (string, optional): "sent" | "received" | "all" (default: "all")

**Response**:
```json
{
  "success": true,
  "message": "Encaminhamentos obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "referringProfessionalId": "uuid",
      "referredProfessionalId": "uuid",
      "referralType": "string",
      "reason": "string",
      "clinicalNotes": "string | null",
      "urgencyLevel": "string",
      "status": "string",
      "responseNotes": "string | null",
      "responseDeadline": "timestamp | null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "patients": {...},
      "referring_professional": {...},
      "referred_professional": {...}
    }
  ]
}
```

### Respond to Referral

**Endpoint**: `respondToReferral`

Responds to a referral (accept/decline).

**Request Body**:
```json
{
  "referralId": "uuid",
  "response": "accept | decline",
  "responseNotes": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Encaminhamento aceito com sucesso",
  "data": {
    "id": "uuid",
    "status": "accepted",
    "responseNotes": "string | null",
    "updatedAt": "timestamp"
  }
}
```

## Collaborative Sessions

### Create Collaborative Session

**Endpoint**: `createCollaborativeSession`

Creates a collaborative session for multi-professional work.

**Request Body**:
```json
{
  "patientId": "uuid",
  "teamId": "uuid",
  "sessionType": "planning | treatment | assessment | follow_up | emergency",
  "title": "string (1-200 chars)",
  "description": "string (optional)",
  "scheduledStart": "date",
  "scheduledEnd": "date",
  "location": "string (optional)",
  "virtualMeetingUrl": "string (optional)",
  "facilitatorId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sessão colaborativa criada com sucesso",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "teamId": "uuid",
    "sessionType": "string",
    "title": "string",
    "description": "string | null",
    "scheduledStart": "timestamp",
    "scheduledEnd": "timestamp",
    "actualStart": "timestamp | null",
    "actualEnd": "timestamp | null",
    "status": "scheduled | in_progress | completed | cancelled | no_show",
    "location": "string | null",
    "virtualMeetingUrl": "string | null",
    "facilitatorId": "uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Collaborative Sessions

**Endpoint**: `getCollaborativeSessions`

Retrieves collaborative sessions for a clinic.

**Query Parameters**:
- `clinicId` (string, required): Clinic ID
- `professionalId` (string, optional): Filter by professional ID

**Response**:
```json
{
  "success": true,
  "message": "Sessões colaborativas obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "teamId": "uuid",
      "sessionType": "string",
      "title": "string",
      "description": "string | null",
      "scheduledStart": "timestamp",
      "scheduledEnd": "timestamp",
      "actualStart": "timestamp | null",
      "actualEnd": "timestamp | null",
      "status": "string",
      "location": "string | null",
      "virtualMeetingUrl": "string | null",
      "facilitatorId": "uuid",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "patients": {...},
      "professional_teams": {...},
      "session_participants": [...]
    }
  ]
}
```

### Add Session Participant

**Endpoint**: `addSessionParticipant`

Adds a participant to a collaborative session.

**Request Body**:
```json
{
  "sessionId": "uuid",
  "professionalId": "uuid",
  "role": "primary | secondary | observer | consultant | supervisor",
  "responsibilities": "string[] (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Participante adicionado à sessão com sucesso",
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "professionalId": "uuid",
    "role": "string",
    "responsibilities": [],
    "attendanceStatus": "invited | confirmed | attended | late | no_show | excused",
    "joinedAt": "timestamp | null",
    "leftAt": "timestamp | null",
    "notes": "string | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## Coordination Threads and Messages

### Create Coordination Thread

**Endpoint**: `createCoordinationThread`

Creates a discussion thread for professional coordination.

**Request Body**:
```json
{
  "patientId": "uuid (optional)",
  "teamId": "uuid (optional)",
  "sessionId": "uuid (optional)",
  "referralId": "uuid (optional)",
  "subject": "string (1-200 chars)",
  "contextType": "patient_care | treatment_planning | consultation | urgent | administrative",
  "priority": "low | normal | high | urgent (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tópico de coordenação criado com sucesso",
  "data": {
    "id": "uuid",
    "patientId": "uuid | null",
    "teamId": "uuid | null",
    "sessionId": "uuid | null",
    "referralId": "uuid | null",
    "subject": "string",
    "contextType": "string",
    "priority": "string",
    "status": "active | resolved | archived",
    "createdBy": "uuid",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Coordination Threads

**Endpoint**: `getCoordinationThreads`

Retrieves coordination threads for a clinic.

**Query Parameters**:
- `clinicId` (string, required): Clinic ID
- `patientId` (string, optional): Filter by patient ID

**Response**:
```json
{
  "success": true,
  "message": "Tópicos de coordenação obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid | null",
      "teamId": "uuid | null",
      "sessionId": "uuid | null",
      "referralId": "uuid | null",
      "subject": "string",
      "contextType": "string",
      "priority": "string",
      "status": "string",
      "createdBy": "uuid",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "patients": {...},
      "professional_teams": {...},
      "coordination_messages": [...]
    }
  ]
}
```

### Add Coordination Message

**Endpoint**: `addCoordinationMessage`

Adds a message to a coordination thread.

**Request Body**:
```json
{
  "threadId": "uuid",
  "messageType": "text | clinical_note | image | document | referral_request | treatment_update",
  "content": "string (optional)",
  "attachmentUrl": "string (optional)",
  "isSensitive": "boolean (default: false)",
  "requiresAcknowledgment": "boolean (default: false)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Mensagem de coordenação adicionada com sucesso",
  "data": {
    "id": "uuid",
    "threadId": "uuid",
    "professionalId": "uuid",
    "messageType": "string",
    "content": "string | null",
    "attachmentUrl": "string | null",
    "isSensitive": true,
    "requiresAcknowledgment": true,
    "acknowledgedBy": "uuid[]",
    "acknowledgedAt": "timestamp | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## Professional Supervision

### Create Professional Supervision

**Endpoint**: `createProfessionalSupervision`

Creates a supervision relationship between professionals.

**Request Body**:
```json
{
  "supervisorId": "uuid",
  "superviseeId": "uuid",
  "supervisionType": "clinical | administrative | mentorship | training",
  "scope": "string",
  "requirements": "string[] (optional)",
  "frequency": "daily | weekly | monthly | quarterly | as_needed",
  "maxAutonomyLevel": "number (1-5, optional)",
  "startDate": "date",
  "endDate": "date (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Supervisão profissional criada com sucesso",
  "data": {
    "id": "uuid",
    "supervisorId": "uuid",
    "superviseeId": "uuid",
    "supervisionType": "string",
    "scope": "string",
    "requirements": [],
    "frequency": "string",
    "maxAutonomyLevel": "number | null",
    "startDate": "timestamp",
    "endDate": "timestamp | null",
    "isActive": true,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Supervision Relationships

**Endpoint**: `getSupervisionRelationships`

Retrieves supervision relationships for a professional.

**Query Parameters**:
- `professionalId` (string, required): Professional ID
- `type` (string, optional): "supervisor" | "supervisee" | "all" (default: "all")

**Response**:
```json
{
  "success": true,
  "message": "Relacionamentos de supervisão obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "supervisorId": "uuid",
      "superviseeId": "uuid",
      "supervisionType": "string",
      "scope": "string",
      "requirements": [],
      "frequency": "string",
      "maxAutonomyLevel": "number | null",
      "startDate": "timestamp",
      "endDate": "timestamp | null",
      "isActive": true,
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "supervisor": {...},
      "supervisee": {...},
      "supervision_sessions": [...]
    }
  ]
}
```

## Professional Scope Validation

### Validate Professional Scope

**Endpoint**: `validateProfessionalScope`

Validates if a professional is authorized for specific procedures or medications.

**Query Parameters**:
- `professionalId` (string, required): Professional ID
- `procedureId` (string, optional): Procedure ID to validate
- `medicationId` (string, optional): Medication ID to validate

**Response**:
```json
{
  "success": true,
  "message": "Validação de escopo profissional concluída",
  "data": {
    "isAuthorized": true,
    "authorizationLevel": "independent | supervised | prohibited",
    "conditions": []
  }
}
```

### Create Scope Validation

**Endpoint**: `createScopeValidation`

Creates a scope validation record for a professional.

**Request Body**:
```json
{
  "professionalId": "uuid",
  "procedureId": "uuid (optional)",
  "medicationId": "uuid (optional)",
  "isAuthorized": "boolean",
  "authorizationLevel": "independent | supervised | prohibited (optional)",
  "conditions": "string[] (optional)",
  "supervisionRequirements": "string (optional)",
  "validFrom": "date",
  "validUntil": "date (optional)",
  "authorizedBy": "uuid (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Validação de escopo criada com sucesso",
  "data": {
    "id": "uuid",
    "professionalId": "uuid",
    "procedureId": "uuid | null",
    "medicationId": "uuid | null",
    "isAuthorized": true,
    "authorizationLevel": "string | null",
    "conditions": [],
    "supervisionRequirements": "string | null",
    "validFrom": "timestamp",
    "validUntil": "timestamp | null",
    "authorizedBy": "uuid | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## Coordination Protocols

### Create Coordination Protocol

**Endpoint**: `createCoordinationProtocol`

Creates a standardized coordination protocol.

**Request Body**:
```json
{
  "clinicId": "uuid",
  "name": "string (1-100 chars)",
  "description": "string (optional)",
  "protocolType": "emergency | consultation | referral | treatment_coordination | supervision",
  "triggerConditions": "string[] (optional)",
  "requiredProfessions": "string[] (optional)",
  "workflowSteps": "object (optional)",
  "timelineRequirements": "object (optional)",
  "documentationRequirements": "string[] (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Protocolo de coordenação criado com sucesso",
  "data": {
    "id": "uuid",
    "clinicId": "uuid",
    "name": "string",
    "description": "string | null",
    "protocolType": "string",
    "triggerConditions": [],
    "requiredProfessions": [],
    "workflowSteps": {},
    "timelineRequirements": {},
    "documentationRequirements": [],
    "isActive": true,
    "version": 1,
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Get Coordination Protocols

**Endpoint**: `getCoordinationProtocols`

Retrieves coordination protocols for a clinic.

**Query Parameters**:
- `clinicId` (string, required): Clinic ID

**Response**:
```json
{
  "success": true,
  "message": "Protocolos de coordenação obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "clinicId": "uuid",
      "name": "string",
      "description": "string | null",
      "protocolType": "string",
      "triggerConditions": [],
      "requiredProfessions": [],
      "workflowSteps": {},
      "timelineRequirements": {},
      "documentationRequirements": [],
      "isActive": true,
      "version": 1,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

### Execute Protocol

**Endpoint**: `executeProtocol`

Executes a coordination protocol automatically.

**Request Body**:
```json
{
  "protocolId": "uuid",
  "patientId": "uuid",
  "triggerEvent": "string",
  "triggeredBy": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Protocolo executado com sucesso",
  "data": {
    "id": "uuid",
    "protocolId": "uuid",
    "patientId": "uuid",
    "triggeredBy": "uuid",
    "triggerEvent": "string",
    "status": "initiated | in_progress | completed | failed | cancelled",
    "currentStep": 1,
    "completedSteps": [],
    "notes": "string | null",
    "startedAt": "timestamp",
    "completedAt": "timestamp | null",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

## Automated Workflows

### Check Overdue Referrals

**Endpoint**: `checkOverdueReferrals`

Identifies referrals that have passed their response deadline.

**Response**:
```json
{
  "success": true,
  "message": "Verificação de encaminhamentos pendentes concluída",
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "referringProfessionalId": "uuid",
      "referredProfessionalId": "uuid",
      "referralType": "string",
      "reason": "string",
      "urgencyLevel": "string",
      "status": "pending",
      "responseDeadline": "timestamp",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

### Create Collaborative Session for Treatment

**Endpoint**: `createCollaborativeSessionForTreatment`

Automatically creates a collaborative session for complex treatments.

**Request Body**:
```json
{
  "patientId": "uuid",
  "treatmentPlanId": "uuid",
  "sessionType": "planning | treatment | assessment | follow_up | emergency (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sessão colaborativa criada para tratamento com sucesso",
  "data": "uuid"
}
```

## Analytics and Reporting

### Get Coordination Analytics

**Endpoint**: `getCoordinationAnalytics`

Retrieves coordination analytics for a clinic.

**Query Parameters**:
- `clinicId` (string, required): Clinic ID
- `dateRange.start` (date, required): Start date
- `dateRange.end` (date, required): End date

**Response**:
```json
{
  "success": true,
  "message": "Análises de coordenação obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "team_members": {"count": "number"},
      "collaborative_sessions": {"count": "number"},
      "professional_referrals": {"count": "number"}
    }
  ]
}
```

### Get Professional Collaboration Metrics

**Endpoint**: `getProfessionalCollaborationMetrics`

Retrieves collaboration metrics for a professional.

**Query Parameters**:
- `professionalId` (string, required): Professional ID
- `dateRange.start` (date, required): Start date
- `dateRange.end` (date, required): End date

**Response**:
```json
{
  "success": true,
  "message": "Métricas de colaboração profissional obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "team_members": {"count": "number"},
      "session_participants": {"count": "number"},
      "professional_referrals_as_referring": {"count": "number"},
      "professional_referrals_as_referred": {"count": "number"},
      "coordination_messages": {"count": "number"}
    }
  ]
}
```

## Error Handling

All endpoints follow a standardized error response format:

```json
{
  "success": false,
  "message": "Error description in Portuguese",
  "data": null
}
```

### Common Error Codes

- `400`: Invalid input parameters
- `401`: Authentication required
- `403`: Permission denied
- `404`: Resource not found
- `500`: Internal server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute
- **Analytics endpoints**: 30 requests per minute
- **Bulk operations**: 10 requests per minute

## Webhooks

The system supports webhooks for real-time notifications:

### Supported Events

- `referral.created`: New referral created
- `referral.responded`: Referral response received
- `session.scheduled`: Collaborative session scheduled
- `session.started`: Collaborative session started
- `message.created`: New coordination message
- `protocol.executed`: Protocol execution triggered

### Webhook Configuration

Webhooks can be configured through the clinic settings interface.

## Best Practices

### Professional Teams

1. **Team Composition**: Ensure teams have complementary skills
2. **Role Definition**: Clearly define roles and responsibilities
3. **Scope Limitations**: Set appropriate scope limitations for each member
4. **Regular Updates**: Keep team membership and permissions current

### Professional Referrals

1. **Clear Communication**: Provide detailed clinical information
2. **Appropriate Urgency**: Set correct urgency levels
3. **Response Deadlines**: Set reasonable response deadlines
4. **Follow-up**: Monitor referral status and follow up as needed

### Collaborative Sessions

1. **Clear Objectives**: Define session goals and expected outcomes
2. **Proper Planning**: Schedule adequate time for complex cases
3. **Documentation**: Maintain thorough session records
4. **Follow-up Actions**: Document action items and responsibilities

### Coordination Communication

1. **Professional Conduct**: Maintain professional communication standards
2. **Patient Privacy**: Protect sensitive patient information
3. **Timely Responses**: Respond to urgent messages promptly
4. **Thread Organization**: Keep discussions organized and on-topic

### Professional Supervision

1. **Structured Approach**: Follow established supervision frameworks
2. **Regular Meetings**: Maintain consistent supervision schedules
3. **Documentation**: Keep detailed supervision records
4. **Progress Tracking**: Monitor supervisee development

### Scope Validation

1. **Regular Reviews**: Periodically review and update scope validations
2. **Clear Criteria**: Establish clear authorization criteria
3. **Compliance Monitoring**: Ensure ongoing compliance with scope limitations
4. **Training**: Provide additional training for scope expansions

## Support

For technical support or questions about the Multi-Professional Coordination API:

- **Documentation**: See `/docs/architecture/` for system architecture
- **API Support**: Contact technical support for integration issues
- **Compliance Questions**: Consult compliance team for regulatory questions
- **Feature Requests**: Submit feature requests through the development team

## Version History

- **v1.0.0**: Initial release with basic coordination features
- **v1.1.0**: Added supervision and scope validation
- **v1.2.0**: Enhanced analytics and reporting
- **v1.3.0**: Added protocol automation and workflows

## Future Enhancements

Planned features for future releases:

- **AI-powered team recommendations**: Intelligent team composition suggestions
- **Advanced workflow automation**: More sophisticated protocol execution
- **Real-time collaboration tools**: Live collaboration features
- **Mobile optimization**: Enhanced mobile interface
- **Integration expansion**: Additional third-party system integrations