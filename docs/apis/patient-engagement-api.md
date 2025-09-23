# Patient Engagement and Communication API Documentation

## Overview

The Patient Engagement and Communication API provides comprehensive endpoints for managing patient relationships, communication preferences, loyalty programs, and engagement analytics. This API enables aesthetic clinics to maintain strong patient relationships through personalized, multi-channel communication while respecting patient preferences and privacy.

## Base URL

```
https://api.neonpro.com/v1/patient-engagement
```

## Authentication

All API requests require authentication using Bearer tokens:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API uses standard HTTP status codes and returns error information in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting

- **Default**: 100 requests per minute
- **Burst**: 200 requests per minute
- **Webhook Endpoints**: 1000 requests per minute

## Endpoints

### Communication Preferences

#### Get Communication Preferences

Retrieve a patient's communication preferences.

**Endpoint:** `GET /communication-preferences`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Preferências de comunicação obtidas com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "preferred_language": "pt-BR",
    "communication_channels": {
      "email": true,
      "sms": true,
      "whatsapp": true,
      "push_notification": true,
      "phone_call": false
    },
    "communication_frequency": {
      "appointment_reminders": true,
      "follow_up_care": true,
      "promotional": false,
      "educational": true,
      "surveys": true
    },
    "notification_timing": {
      "appointment_reminder_hours": [48, 24, 2],
      "follow_up_days": [1, 7, 30],
      "marketing_preference": "minimal"
    },
    "do_not_contact": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Communication Preferences

Update a patient's communication preferences.

**Endpoint:** `PUT /communication-preferences`

**Request Body:**
```json
{
  "patientId": "uuid",
  "clinicId": "uuid",
  "preferredLanguage": "pt-BR",
  "communicationChannels": {
    "email": true,
    "sms": true,
    "whatsapp": true,
    "push_notification": true,
    "phone_call": false
  },
  "communicationFrequency": {
    "appointment_reminders": true,
    "follow_up_care": true,
    "promotional": false,
    "educational": true,
    "surveys": true
  },
  "notificationTiming": {
    "appointment_reminder_hours": [48, 24, 2],
    "follow_up_days": [1, 7, 30],
    "marketing_preference": "minimal"
  },
  "doNotContact": false,
  "doNotContactReason": "Patient request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferências de comunicação atualizadas com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "preferred_language": "pt-BR",
    "communication_channels": {
      "email": true,
      "sms": true,
      "whatsapp": true,
      "push_notification": true,
      "phone_call": false
    },
    "do_not_contact": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Communication History

#### Send Communication

Send a communication to a patient.

**Endpoint:** `POST /communications/send`

**Request Body:**
```json
{
  "patientId": "uuid",
  "clinicId": "uuid",
  "professionalId": "uuid",
  "communicationType": "appointment_reminder",
  "channel": "whatsapp",
  "messageContent": "Olá {{patient_name}}, este é um lembrete para seu agendamento amanhã às {{appointment_time}}.",
  "messageTemplateId": "uuid",
  "status": "pending",
  "metadata": {
    "appointmentId": "uuid",
    "procedureName": "Botox"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comunicação enviada com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "professional_id": "uuid",
    "communication_type": "appointment_reminder",
    "channel": "whatsapp",
    "message_content": "Olá João Silva, este é um lembrete para seu agendamento amanhã às 14:00.",
    "status": "sent",
    "sent_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Communication History

Retrieve communication history for a patient.

**Endpoint:** `GET /communications/history`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID
- `limit` (number, optional): Number of records to return (default: 50, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Histórico de comunicação obtido com sucesso",
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "clinic_id": "uuid",
      "communication_type": "appointment_reminder",
      "channel": "whatsapp",
      "message_content": "Lembrete de agendamento",
      "status": "delivered",
      "sent_at": "2024-01-01T00:00:00Z",
      "delivered_at": "2024-01-01T00:01:00Z"
    }
  ]
}
```

### Template Management

#### Create Template

Create a new communication template.

**Endpoint:** `POST /templates/create`

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Lembrete de Agendamento",
  "category": "appointment_reminder",
  "channel": "whatsapp",
  "subject": "Lembrete de Agendamento",
  "content": "Olá {{patient_name}}, este é um lembrete para seu agendamento amanhã às {{appointment_time}} para {{procedure_name}}.",
  "variables": ["patient_name", "appointment_time", "procedure_name"],
  "isActive": true,
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template criado com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Lembrete de Agendamento",
    "category": "appointment_reminder",
    "channel": "whatsapp",
    "subject": "Lembrete de Agendamento",
    "content": "Olá {{patient_name}}, este é um lembrete para seu agendamento...",
    "variables": ["patient_name", "appointment_time", "procedure_name"],
    "is_active": true,
    "is_default": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Templates by Category

Retrieve templates by category.

**Endpoint:** `GET /templates/category`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID
- `category` (string, required): Template category

**Available Categories:**
- `appointment_reminder`
- `follow_up_care`
- `educational`
- `promotional`
- `survey`
- `birthday`
- `reengagement`
- `treatment_reminder`

**Response:**
```json
{
  "success": true,
  "message": "Templates obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "Lembrete de Agendamento",
      "category": "appointment_reminder",
      "channel": "whatsapp",
      "content": "Olá {{patient_name}}, este é um lembrete...",
      "variables": ["patient_name", "appointment_time", "procedure_name"],
      "is_active": true,
      "is_default": true
    }
  ]
}
```

### Patient Journey

#### Update Patient Journey Stage

Update a patient's journey stage and engagement metrics.

**Endpoint:** `PUT /journey/update-stage`

**Request Body:**
```json
{
  "patientId": "uuid",
  "clinicId": "uuid",
  "currentStage": "active_patient",
  "engagementScore": 75,
  "satisfactionScore": 4.5,
  "loyaltyTier": "gold",
  "lastTreatmentDate": "2024-01-01T00:00:00Z",
  "nextRecommendedTreatmentDate": "2024-02-01T00:00:00Z",
  "riskFactors": ["declining_engagement", "missed_appointments"]
}
```

**Available Stages:**
- `new_lead`
- `consultation_scheduled`
- `first_visit`
- `active_patient`
- `treatment_in_progress`
- `post_treatment_care`
- `maintenance`
- `loyal_patient`
- `at_risk`
- `inactive`
- `reactivated`

**Response:**
```json
{
  "success": true,
  "message": "Estágio da jornada do paciente atualizado com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "current_stage": "active_patient",
    "engagement_score": 75,
    "satisfaction_score": 4.5,
    "loyalty_tier": "gold",
    "last_treatment_date": "2024-01-01T00:00:00Z",
    "next_recommended_treatment_date": "2024-02-01T00:00:00Z",
    "risk_factors": ["declining_engagement", "missed_appointments"],
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Patient Journey

Retrieve a patient's journey information.

**Endpoint:** `GET /journey/get`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Jornada do paciente obtida com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "current_stage": "active_patient",
    "engagement_score": 75,
    "satisfaction_score": 4.5,
    "loyalty_tier": "gold",
    "stage_start_date": "2024-01-01T00:00:00Z",
    "last_activity_date": "2024-01-01T00:00:00Z",
    "last_treatment_date": "2024-01-01T00:00:00Z",
    "next_recommended_treatment_date": "2024-02-01T00:00:00Z",
    "risk_factors": ["declining_engagement"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Engagement Actions

#### Record Engagement Action

Record a patient engagement action.

**Endpoint:** `POST /engagement/actions/record`

**Request Body:**
```json
{
  "patientId": "uuid",
  "clinicId": "uuid",
  "actionType": "treatment_completed",
  "actionValue": "Botox Treatment",
  "pointsEarned": 25,
  "metadata": {
    "treatmentId": "uuid",
    "procedureName": "Botox",
    "professionalId": "uuid"
  }
}
```

**Available Action Types:**
- `appointment_booked`
- `appointment_completed`
- `treatment_started`
- `treatment_completed`
- `review_left`
- `referral_made`
- `survey_completed`
- `educational_content_viewed`
- `promotion_redeemed`
- `reengagement_response`

**Response:**
```json
{
  "success": true,
  "message": "Ação de engajamento registrada com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "action_type": "treatment_completed",
    "action_value": "Botox Treatment",
    "points_earned": 25,
    "metadata": {
      "treatmentId": "uuid",
      "procedureName": "Botox",
      "professionalId": "uuid"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Loyalty Programs

#### Create Loyalty Program

Create a new loyalty program.

**Endpoint:** `POST /loyalty/programs/create`

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Programa Beleza Eterna",
  "description": "Acumule pontos com cada tratamento e ganhe benefícios exclusivos",
  "pointEarningRules": {
    "appointment_completed": 10,
    "treatment_completed": 25,
    "review_left": 15,
    "referral_made": 50,
    "survey_completed": 5
  },
  "tierRequirements": {
    "silver": {"minPoints": 100, "minTreatments": 2},
    "gold": {"minPoints": 300, "minTreatments": 5},
    "platinum": {"minPoints": 600, "minTreatments": 10}
  },
  "benefits": {
    "silver": ["5% desconto", "agendamento prioritário"],
    "gold": ["10% desconto", "agendamento prioritário", "consulta gratuita"],
    "platinum": ["15% desconto", "agendamento prioritário", "consulta gratuita", "eventos exclusivos"]
  },
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Programa de fidelidade criado com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Programa Beleza Eterna",
    "description": "Acumule pontos com cada tratamento e ganhe benefícios exclusivos",
    "point_earning_rules": {
      "appointment_completed": 10,
      "treatment_completed": 25,
      "review_left": 15,
      "referral_made": 50,
      "survey_completed": 5
    },
    "tier_requirements": {
      "silver": {"minPoints": 100, "minTreatments": 2},
      "gold": {"minPoints": 300, "minTreatments": 5},
      "platinum": {"minPoints": 600, "minTreatments": 10}
    },
    "benefits": {
      "silver": ["5% desconto", "agendamento prioritário"],
      "gold": ["10% desconto", "agendamento prioritário", "consulta gratuita"],
      "platinum": ["15% desconto", "agendamento prioritário", "consulta gratuita", "eventos exclusivos"]
    },
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Loyalty Programs

Retrieve all active loyalty programs for a clinic.

**Endpoint:** `GET /loyalty/programs`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Programas de fidelidade obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "Programa Beleza Eterna",
      "description": "Acumule pontos com cada tratamento e ganhe benefícios exclusivos",
      "point_earning_rules": {
        "appointment_completed": 10,
        "treatment_completed": 25
      },
      "tier_requirements": {
        "silver": {"minPoints": 100, "minTreatments": 2}
      },
      "is_active": true
    }
  ]
}
```

#### Get Patient Points Balance

Retrieve a patient's points balance.

**Endpoint:** `GET /loyalty/points/balance`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Saldo de pontos obtido com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "total_points_earned": 450,
    "points_available": 320,
    "points_redeemed": 130,
    "last_updated": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Patient Points

Add points to a patient's balance.

**Endpoint:** `PUT /loyalty/points/update`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID
- `pointsToAdd` (number, required): Points to add (can be negative)

**Response:**
```json
{
  "success": true,
  "message": "Pontos do paciente atualizados com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "total_points_earned": 475,
    "points_available": 345,
    "points_redeemed": 130,
    "last_updated": "2024-01-01T00:00:00Z"
  }
}
```

### Surveys

#### Create Survey

Create a new patient survey.

**Endpoint:** `POST /surveys/create`

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Pesquisa de Satisfação Pós-Tratamento",
  "type": "satisfaction",
  "questions": [
    {
      "id": "q1",
      "type": "rating",
      "question": "Como você avaliaria seu tratamento?",
      "required": true,
      "scale": 5
    },
    {
      "id": "q2",
      "type": "text",
      "question": "Compartilhe sua experiência:",
      "required": false
    }
  ],
  "triggerConditions": [
    {
      "event": "treatment_completed",
      "delay": "24h"
    }
  ],
  "isActive": true
}
```

**Available Survey Types:**
- `satisfaction`
- `treatment_feedback`
- `clinic_experience`
- `service_quality`

**Response:**
```json
{
  "success": true,
  "message": "Pesquisa criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Pesquisa de Satisfação Pós-Tratamento",
    "type": "satisfaction",
    "questions": [
      {
        "id": "q1",
        "type": "rating",
        "question": "Como você avaliaria seu tratamento?",
        "required": true,
        "scale": 5
      }
    ],
    "trigger_conditions": [
      {
        "event": "treatment_completed",
        "delay": "24h"
      }
    ],
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Surveys

Retrieve all active surveys for a clinic.

**Endpoint:** `GET /surveys`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Pesquisas obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "Pesquisa de Satisfação Pós-Tratamento",
      "type": "satisfaction",
      "questions": [
        {
          "id": "q1",
          "type": "rating",
          "question": "Como você avaliaria seu tratamento?",
          "required": true,
          "scale": 5
        }
      ],
      "is_active": true
    }
  ]
}
```

#### Submit Survey Response

Submit a patient's survey response.

**Endpoint:** `POST /surveys/responses/submit`

**Request Body:**
```json
{
  "surveyId": "uuid",
  "patientId": "uuid",
  "professionalId": "uuid",
  "responses": {
    "q1": 5,
    "q2": "Excelente experiência, muito satisfeito!"
  },
  "satisfactionScore": 5,
  "netPromoterScore": 9,
  "feedbackText": "Excelente atendimento e resultados.",
  "followUpRequired": false,
  "followUpNotes": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resposta da pesquisa enviada com sucesso",
  "data": {
    "id": "uuid",
    "survey_id": "uuid",
    "patient_id": "uuid",
    "professional_id": "uuid",
    "responses": {
      "q1": 5,
      "q2": "Excelente experiência, muito satisfeito!"
    },
    "satisfaction_score": 5,
    "net_promoter_score": 9,
    "feedback_text": "Excelente atendimento e resultados.",
    "follow_up_required": false,
    "response_date": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Campaigns

#### Create Campaign

Create a new engagement campaign.

**Endpoint:** `POST /campaigns/create`

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Campanha de Reengajamento de Inverno",
  "campaignType": "reengagement",
  "targetAudience": {
    "inactivityDays": 90,
    "loyaltyTier": ["silver", "gold"]
  },
  "triggerConditions": {
    "patientStatus": "inactive",
    "lastVisit": "90+ days"
  },
  "messageSequence": [
    {
      "day": 1,
      "channel": "email",
      "templateId": "uuid"
    },
    {
      "day": 7,
      "channel": "sms",
      "templateId": "uuid"
    }
  ],
  "status": "draft",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

**Available Campaign Types:**
- `reengagement`
- `birthday_campaign`
- `seasonal_promotion`
- `treatment_reminder`
- `educational_series`
- `loyalty_program`

**Response:**
```json
{
  "success": true,
  "message": "Campanha criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Campanha de Reengajamento de Inverno",
    "campaign_type": "reengagement",
    "target_audience": {
      "inactivityDays": 90,
      "loyaltyTier": ["silver", "gold"]
    },
    "trigger_conditions": {
      "patientStatus": "inactive",
      "lastVisit": "90+ days"
    },
    "message_sequence": [
      {
        "day": 1,
        "channel": "email",
        "template_id": "uuid"
      }
    ],
    "status": "draft",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Campaigns

Retrieve all campaigns for a clinic.

**Endpoint:** `GET /campaigns`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Campanhas obtidas com sucesso",
  "data": [
    {
      "id": "uuid",
      "name": "Campanha de Reengajamento de Inverno",
      "campaign_type": "reengagement",
      "status": "active",
      "metrics": {
        "sent": 150,
        "delivered": 142,
        "opened": 89,
        "clicked": 34,
        "converted": 12
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Reengagement Triggers

#### Create Reengagement Trigger

Create a reengagement trigger for a patient.

**Endpoint:** `POST /reengagement/triggers/create`

**Request Body:**
```json
{
  "patientId": "uuid",
  "clinicId": "uuid",
  "triggerType": "no_recent_appointment",
  "actionTaken": "Email de reengajamento enviado",
  "outcome": {
    "emailSent": true,
    "templateUsed": "reengagement_template_1"
  }
}
```

**Available Trigger Types:**
- `no_recent_appointment`
- `missed_follow_up`
- `declining_engagement`
- `treatment_due`
- `birthday_approaching`
- `loyalty_status_change`

**Response:**
```json
{
  "success": true,
  "message": "Gatilho de reengajamento criado com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "trigger_type": "no_recent_appointment",
    "trigger_date": "2024-01-01T00:00:00Z",
    "status": "pending",
    "action_taken": "Email de reengajamento enviado",
    "outcome": {
      "emailSent": true,
      "templateUsed": "reengagement_template_1"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Reengagement Triggers

Retrieve reengagement triggers for a clinic.

**Endpoint:** `GET /reengagement/triggers`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID
- `status` (string, optional): Filter by status (default: `pending`)

**Available Statuses:**
- `pending`
- `in_progress`
- `completed`
- `skipped`

**Response:**
```json
{
  "success": true,
  "message": "Gatilhos de reengajamento obtidos com sucesso",
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "trigger_type": "no_recent_appointment",
      "trigger_date": "2024-01-01T00:00:00Z",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Update Reengagement Trigger

Update a reengagement trigger status.

**Endpoint:** `PUT /reengagement/triggers/update`

**Request Body:**
```json
{
  "triggerId": "uuid",
  "status": "completed",
  "actionTaken": "Paciente reagendou consulta",
  "outcome": {
    "appointmentScheduled": true,
    "newAppointmentDate": "2024-01-15T14:00:00Z",
    "patientResponse": "positive"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gatilho de reengajamento atualizado com sucesso",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "trigger_type": "no_recent_appointment",
    "status": "completed",
    "action_taken": "Paciente reagendou consulta",
    "outcome": {
      "appointmentScheduled": true,
      "newAppointmentDate": "2024-01-15T14:00:00Z",
      "patientResponse": "positive"
    },
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Analytics

#### Get Engagement Analytics

Retrieve engagement analytics for a clinic.

**Endpoint:** `GET /analytics/engagement`

**Query Parameters:**
- `clinicId` (string, required): Clinic UUID
- `dateRange.start` (string, required): Start date (ISO 8601)
- `dateRange.end` (string, required): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "message": "Análise de engajamento obtida com sucesso",
  "data": {
    "total_patients": 1247,
    "active_patients": 892,
    "engagement_rate": 78.5,
    "satisfaction_score": 4.6,
    "communications_sent": 3426,
    "communications_delivered": 3156,
    "communications_opened": 2103,
    "communications_clicked": 892,
    "points_issued": 12450,
    "points_redeemed": 3420,
    "surveys_completed": 567,
    "campaign_conversions": 89,
    "reengagement_success_rate": 23.5
  }
}
```

#### Get Patient Engagement Report

Retrieve a detailed engagement report for a specific patient.

**Endpoint:** `GET /analytics/patient-report`

**Query Parameters:**
- `patientId` (string, required): Patient UUID
- `clinicId` (string, required): Clinic UUID

**Response:**
```json
{
  "success": true,
  "message": "Relatório de engajamento do paciente obtido com sucesso",
  "data": {
    "patient_id": "uuid",
    "engagement_score": 85,
    "satisfaction_score": 4.7,
    "loyalty_tier": "platinum",
    "total_communications": 45,
    "opened_communications": 38,
    "click_rate": 0.84,
    "points_balance": 580,
    "surveys_completed": 12,
    "average_satisfaction": 4.6,
    "last_activity_date": "2024-01-01T00:00:00Z",
    "risk_factors": [],
    "engagement_trend": "increasing",
    "next_best_action": "Schedule follow-up appointment"
  }
}
```

### Automated Workflows

#### Process Appointment Reminders

Process automated appointment reminders.

**Endpoint:** `POST /workflows/appointment-reminders`

**Request Body:**
```json
{
  "clinicId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lembretes de agendamento processados com sucesso",
  "data": {
    "processed_count": 45,
    "sent_count": 42,
    "failed_count": 3,
    "processing_time_ms": 1234
  }
}
```

#### Process Follow Up Communications

Process automated follow-up communications.

**Endpoint:** `POST /workflows/follow-up-communications`

**Request Body:**
```json
{
  "clinicId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comunicações de follow-up processadas com sucesso",
  "data": {
    "processed_count": 23,
    "sent_count": 21,
    "failed_count": 2,
    "processing_time_ms": 856
  }
}
```

#### Process Birthday Greetings

Process automated birthday greetings.

**Endpoint:** `POST /workflows/birthday-greetings`

**Request Body:**
```json
{
  "clinicId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Saudações de aniversário processadas com sucesso",
  "data": {
    "processed_count": 12,
    "sent_count": 12,
    "failed_count": 0,
    "processing_time_ms": 543
  }
}
```

### Template Processing

#### Process Template

Process a template with variable substitution.

**Endpoint:** `POST /templates/process`

**Request Body:**
```json
{
  "templateId": "uuid",
  "variables": {
    "patient_name": "João Silva",
    "appointment_time": "14:00",
    "procedure_name": "Botox",
    "clinic_name": "Clínica Beleza Eterna"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template processado com sucesso",
  "data": {
    "content": "Olá João Silva, este é um lembrete para seu agendamento amanhã às 14:00 para Botox. Por favor, chegue com 15 minutos de antecedência.",
    "subject": "Lembrete de Agendamento - Clínica Beleza Eterna"
  }
}
```

## Webhooks

### Communication Events

**Endpoint:** `POST /webhooks/communication-events`

The system sends webhook notifications for communication events:

```json
{
  "event": "communication.delivered",
  "data": {
    "communicationId": "uuid",
    "patientId": "uuid",
    "clinicId": "uuid",
    "channel": "whatsapp",
    "deliveredAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Available Events:**
- `communication.sent`
- `communication.delivered`
- `communication.opened`
- `communication.clicked`
- `communication.failed`
- `communication.bounced`

### Patient Journey Events

**Endpoint:** `POST /webhooks/patient-journey-events`

Webhook notifications for patient journey changes:

```json
{
  "event": "patient_journey.stage_changed",
  "data": {
    "patientId": "uuid",
    "clinicId": "uuid",
    "previousStage": "active_patient",
    "newStage": "at_risk",
    "changedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Available Events:**
- `patient_journey.stage_changed`
- `patient_journey.risk_detected`
- `patient_journey.loyalty_tier_changed`

## Data Models

### CommunicationPreferences

```typescript
interface CommunicationPreferences {
  id: string;
  patient_id: string;
  clinic_id: string;
  preferred_language: 'pt-BR' | 'en-US' | 'es-ES';
  communication_channels: Record<string, boolean>;
  communication_frequency: Record<string, boolean>;
  notification_timing: {
    appointment_reminder_hours: number[];
    follow_up_days: number[];
    marketing_preference: 'minimal' | 'moderate' | 'frequent';
  };
  do_not_contact: boolean;
  do_not_contact_reason?: string;
  created_at: string;
  updated_at: string;
}
```

### PatientJourneyStage

```typescript
interface PatientJourneyStage {
  id: string;
  patient_id: string;
  clinic_id: string;
  current_stage: 'new_lead' | 'consultation_scheduled' | 'first_visit' | 'active_patient' | 'treatment_in_progress' | 'post_treatment_care' | 'maintenance' | 'loyal_patient' | 'at_risk' | 'inactive' | 'reactivated';
  engagement_score: number;
  satisfaction_score?: number;
  loyalty_tier: 'standard' | 'silver' | 'gold' | 'platinum';
  last_treatment_date?: string;
  next_recommended_treatment_date?: string;
  risk_factors: string[];
  created_at: string;
  updated_at: string;
}
```

### LoyaltyProgram

```typescript
interface LoyaltyProgram {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  point_earning_rules: Record<string, number>;
  tier_requirements: Record<string, { minPoints: number; minTreatments: number }>;
  benefits: Record<string, string[]>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### EngagementCampaign

```typescript
interface EngagementCampaign {
  id: string;
  clinic_id: string;
  name: string;
  campaign_type: 'reengagement' | 'birthday_campaign' | 'seasonal_promotion' | 'treatment_reminder' | 'educational_series' | 'loyalty_program';
  target_audience: Record<string, any>;
  trigger_conditions: Record<string, any>;
  message_sequence: Array<{
    day: number;
    channel: string;
    template_id: string;
  }>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  created_at: string;
  updated_at: string;
}
```

## Best Practices

### 1. Communication Preferences
- Always respect patient communication preferences
- Provide easy opt-out/opt-in mechanisms
- Use preferred language and timing
- Honor do-not-contact requests

### 2. Message Content
- Keep messages concise and relevant
- Personalize content using template variables
- Include clear call-to-actions
- Ensure compliance with healthcare regulations

### 3. Timing and Frequency
- Avoid sending messages outside business hours
- Respect frequency preferences
- Space out communications appropriately
- Consider patient timezone

### 4. Data Privacy
- Never share patient data with third parties
- Use secure communication channels
- Comply with LGPD/GDPR requirements
- Implement proper data retention policies

### 5. Performance Optimization
- Use batch processing for bulk communications
- Implement proper caching strategies
- Monitor delivery rates and engagement
- Optimize based on performance metrics

## Rate Limits and Quotas

### API Rate Limits
- **Standard Requests**: 100 requests/minute
- **Webhook Processing**: 1000 requests/minute
- **Batch Operations**: 10 concurrent batch operations

### Communication Limits
- **Email**: 10,000 messages/day per clinic
- **SMS**: 5,000 messages/day per clinic
- **WhatsApp**: 1,000 messages/day per clinic
- **Push Notifications**: 50,000 notifications/day per clinic

## Support

For API support and questions:
- **Documentation**: [API Documentation](https://docs.neonpro.com)
- **Support**: [Support Portal](https://support.neonpro.com)
- **Status**: [System Status](https://status.neonpro.com)
- **Community**: [Developer Community](https://community.neonpro.com)

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial release of Patient Engagement API
- Support for multi-channel communication management
- Patient journey tracking and engagement scoring
- Loyalty programs and rewards system
- Survey and feedback management
- Campaign management and automation
- Template management and processing
- Real-time analytics and reporting
- Webhook support for event notifications