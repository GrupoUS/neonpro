import { MultiProfessionalCoordinationService } from '@neonpro/business-services'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

// Input schemas with validation
const ProfessionalTeamInputSchema = z.object({
  clinicId: z.string().uuid('ID da clínica inválido'),
  name: z.string().min(1, 'Nome da equipe é obrigatório').max(
    100,
    'Nome não pode exceder 100 caracteres',
  ),
  description: z.string().optional(),
  teamType: z.enum(['multidisciplinary', 'specialized', 'consultation', 'emergency'], {
    errorMap: () => ({ message: 'Tipo de equipe inválido' }),
  }),
})

const TeamMemberInputSchema = z.object({
  teamId: z.string().uuid('ID da equipe inválido'),
  professionalId: z.string().uuid('ID do profissional inválido'),
  role: z.enum(['leader', 'coordinator', 'member', 'consultant', 'supervisor'], {
    errorMap: () => ({ message: 'Função inválida' }),
  }),
  permissions: z.record(z.any()).optional(),
  scopeLimitations: z.array(z.string()).optional(),
})

const ProfessionalReferralInputSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  referringProfessionalId: z.string().uuid('ID do profissional referenciador inválido'),
  referredProfessionalId: z.string().uuid('ID do profissional referenciado inválido'),
  referralType: z.enum(
    ['consultation', 'treatment', 'assessment', 'supervision', 'second_opinion'],
    {
      errorMap: () => ({ message: 'Tipo de encaminhamento inválido' }),
    },
  ),
  reason: z.string().min(1, 'Motivo do encaminhamento é obrigatório'),
  clinicalNotes: z.string().optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'emergency'], {
    errorMap: () => ({ message: 'Nível de urgência inválido' }),
  }),
  responseDeadline: z.date().optional(),
})

const CollaborativeSessionInputSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  teamId: z.string().uuid('ID da equipe inválido'),
  sessionType: z.enum(['planning', 'treatment', 'assessment', 'follow_up', 'emergency'], {
    errorMap: () => ({ message: 'Tipo de sessão inválido' }),
  }),
  title: z.string().min(1, 'Título da sessão é obrigatório').max(
    200,
    'Título não pode exceder 200 caracteres',
  ),
  description: z.string().optional(),
  scheduledStart: z.date('Data de início inválida'),
  scheduledEnd: z.date('Data de término inválida'),
  location: z.string().optional(),
  virtualMeetingUrl: z.string().url('URL da reunião virtual inválida').optional(),
  facilitatorId: z.string().uuid('ID do facilitador inválido'),
})

const SessionParticipantInputSchema = z.object({
  sessionId: z.string().uuid('ID da sessão inválido'),
  professionalId: z.string().uuid('ID do profissional inválido'),
  role: z.enum(['primary', 'secondary', 'observer', 'consultant', 'supervisor'], {
    errorMap: () => ({ message: 'Função do participante inválida' }),
  }),
  responsibilities: z.array(z.string()).optional(),
})

const CoordinationThreadInputSchema = z.object({
  patientId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  referralId: z.string().uuid().optional(),
  subject: z.string().min(1, 'Assunto é obrigatório').max(
    200,
    'Assunto não pode exceder 200 caracteres',
  ),
  contextType: z.enum([
    'patient_care',
    'treatment_planning',
    'consultation',
    'urgent',
    'administrative',
  ], {
    errorMap: () => ({ message: 'Tipo de contexto inválido' }),
  }),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
})

const CoordinationMessageInputSchema = z.object({
  threadId: z.string().uuid('ID do tópico inválido'),
  messageType: z.enum([
    'text',
    'clinical_note',
    'image',
    'document',
    'referral_request',
    'treatment_update',
  ], {
    errorMap: () => ({ message: 'Tipo de mensagem inválido' }),
  }),
  content: z.string().optional(),
  attachmentUrl: z.string().url('URL do anexo inválida').optional(),
  isSensitive: z.boolean().default(false),
  requiresAcknowledgment: z.boolean().default(false),
})

const ProfessionalSupervisionInputSchema = z.object({
  supervisorId: z.string().uuid('ID do supervisor inválido'),
  superviseeId: z.string().uuid('ID do supervisionado inválido'),
  supervisionType: z.enum(['clinical', 'administrative', 'mentorship', 'training'], {
    errorMap: () => ({ message: 'Tipo de supervisão inválido' }),
  }),
  scope: z.string().min(1, 'Escopo da supervisão é obrigatório'),
  requirements: z.array(z.string()).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'as_needed'], {
    errorMap: () => ({ message: 'Frequência inválida' }),
  }),
  maxAutonomyLevel: z.number().int().min(1).max(5).optional(),
  startDate: z.date('Data de início inválida'),
  endDate: z.date().optional(),
})

const ScopeValidationInputSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  procedureId: z.string().uuid().optional(),
  medicationId: z.string().uuid().optional(),
  isAuthorized: z.boolean(),
  authorizationLevel: z.enum(['independent', 'supervised', 'prohibited']).optional(),
  conditions: z.array(z.string()).optional(),
  supervisionRequirements: z.string().optional(),
  validFrom: z.date('Data de validade inicial inválida'),
  validUntil: z.date().optional(),
  authorizedBy: z.string().uuid().optional(),
})

const CoordinationProtocolInputSchema = z.object({
  clinicId: z.string().uuid('ID da clínica inválido'),
  name: z.string().min(1, 'Nome do protocolo é obrigatório').max(
    100,
    'Nome não pode exceder 100 caracteres',
  ),
  description: z.string().optional(),
  protocolType: z.enum([
    'emergency',
    'consultation',
    'referral',
    'treatment_coordination',
    'supervision',
  ], {
    errorMap: () => ({ message: 'Tipo de protocolo inválido' }),
  }),
  triggerConditions: z.array(z.string()).optional(),
  requiredProfessions: z.array(z.string()).optional(),
  workflowSteps: z.record(z.any()).optional(),
  timelineRequirements: z.record(z.any()).optional(),
  documentationRequirements: z.array(z.string()).optional(),
})

const ReferralResponseSchema = z.object({
  referralId: z.string().uuid(),
  response: z.enum(['accept', 'decline']),
  responseNotes: z.string().optional(),
})

// Output schemas
const ProfessionalTeamSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  teamType: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  professionalId: z.string().uuid(),
  role: z.string(),
  permissions: z.record(z.any()),
  scopeLimitations: z.array(z.string()),
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const ProfessionalReferralSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  referringProfessionalId: z.string().uuid(),
  referredProfessionalId: z.string().uuid(),
  referralType: z.string(),
  reason: z.string(),
  clinicalNotes: z.string().nullable(),
  urgencyLevel: z.string(),
  status: z.string(),
  responseNotes: z.string().nullable(),
  responseDeadline: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const CollaborativeSessionSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  teamId: z.string().uuid(),
  sessionType: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  actualStart: z.string().datetime().nullable(),
  actualEnd: z.string().datetime().nullable(),
  status: z.string(),
  location: z.string().nullable(),
  virtualMeetingUrl: z.string().nullable(),
  facilitatorId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const CoordinationThreadSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid().nullable(),
  teamId: z.string().uuid().nullable(),
  sessionId: z.string().uuid().nullable(),
  referralId: z.string().uuid().nullable(),
  subject: z.string(),
  contextType: z.string(),
  priority: z.string(),
  status: z.string(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const CoordinationMessageSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  professionalId: z.string().uuid(),
  messageType: z.string(),
  content: z.string().nullable(),
  attachmentUrl: z.string().nullable(),
  isSensitive: z.boolean(),
  requiresAcknowledgment: z.boolean(),
  acknowledgedBy: z.array(z.string().uuid()),
  acknowledgedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const ProfessionalSupervisionSchema = z.object({
  id: z.string().uuid(),
  supervisorId: z.string().uuid(),
  superviseeId: z.string().uuid(),
  supervisionType: z.string(),
  scope: z.string(),
  requirements: z.array(z.string()),
  frequency: z.string(),
  maxAutonomyLevel: z.number().int().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const ScopeValidationSchema = z.object({
  id: z.string().uuid(),
  professionalId: z.string().uuid(),
  procedureId: z.string().uuid().nullable(),
  medicationId: z.string().uuid().nullable(),
  isAuthorized: z.boolean(),
  authorizationLevel: z.string().nullable(),
  conditions: z.array(z.string()),
  supervisionRequirements: z.string().nullable(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().nullable(),
  authorizedBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const CoordinationProtocolSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  protocolType: z.string(),
  triggerConditions: z.array(z.string()),
  requiredProfessions: z.array(z.string()),
  workflowSteps: z.record(z.any()),
  timelineRequirements: z.record(z.any()),
  documentationRequirements: z.array(z.string()),
  isActive: z.boolean(),
  version: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Type exports
export type ProfessionalTeamInput = z.infer<typeof ProfessionalTeamInputSchema>
export type TeamMemberInput = z.infer<typeof TeamMemberInputSchema>
export type ProfessionalReferralInput = z.infer<typeof ProfessionalReferralInputSchema>
export type CollaborativeSessionInput = z.infer<typeof CollaborativeSessionInputSchema>
export type SessionParticipantInput = z.infer<typeof SessionParticipantInputSchema>
export type CoordinationThreadInput = z.infer<typeof CoordinationThreadInputSchema>
export type CoordinationMessageInput = z.infer<typeof CoordinationMessageInputSchema>
export type ProfessionalSupervisionInput = z.infer<typeof ProfessionalSupervisionInputSchema>
export type ScopeValidationInput = z.infer<typeof ScopeValidationInputSchema>
export type CoordinationProtocolInput = z.infer<typeof CoordinationProtocolInputSchema>
export type ReferralResponse = z.infer<typeof ReferralResponseSchema>

// Router definition with proper procedure builders
export const multiProfessionalCoordinationRouter = router({
  // Professional Teams Management
  createProfessionalTeam: protectedProcedure
    .input(ProfessionalTeamInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const team = await coordinationService.createProfessionalTeam(input)

        return {
          success: true,
          message: 'Equipe profissional criada com sucesso',
          data: team,
        }
      } catch (error) {
        console.error('Error creating professional team:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar equipe profissional',
          data: null,
        }
      }
    }),

  getProfessionalTeams: protectedProcedure
    .input(z.object({
      clinicId: z.string().uuid('ID da clínica inválido'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const teams = await coordinationService.getProfessionalTeams(input.clinicId)

        return {
          success: true,
          message: 'Equipes profissionais obtidas com sucesso',
          data: teams,
        }
      } catch (error) {
        console.error('Error getting professional teams:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter equipes profissionais',
          data: [],
        }
      }
    }),

  addTeamMember: protectedProcedure
    .input(TeamMemberInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const member = await coordinationService.addTeamMember(input)

        return {
          success: true,
          message: 'Membro adicionado à equipe com sucesso',
          data: member,
        }
      } catch (error) {
        console.error('Error adding team member:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao adicionar membro à equipe',
          data: null,
        }
      }
    }),

  removeTeamMember: protectedProcedure
    .input(z.object({
      teamMemberId: z.string().uuid('ID do membro inválido'),
    }))
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        await coordinationService.removeTeamMember(input.teamMemberId)

        return {
          success: true,
          message: 'Membro removido da equipe com sucesso',
          data: true,
        }
      } catch (error) {
        console.error('Error removing team member:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao remover membro da equipe',
          data: false,
        }
      }
    }),

  // Professional Referrals
  createReferral: protectedProcedure
    .input(ProfessionalReferralInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const referral = await coordinationService.createReferral(input)

        return {
          success: true,
          message: 'Encaminhamento profissional criado com sucesso',
          data: referral,
        }
      } catch (error) {
        console.error('Error creating referral:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao criar encaminhamento profissional',
          data: null,
        }
      }
    }),

  getReferrals: protectedProcedure
    .input(z.object({
      professionalId: z.string().uuid('ID do profissional inválido'),
      type: z.enum(['sent', 'received', 'all']).default('all'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const referrals = await coordinationService.getReferrals(input.professionalId, input.type)

        return {
          success: true,
          message: 'Encaminhamentos obtidos com sucesso',
          data: referrals,
        }
      } catch (error) {
        console.error('Error getting referrals:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter encaminhamentos',
          data: [],
        }
      }
    }),

  respondToReferral: protectedProcedure
    .input(ReferralResponseSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const referral = await coordinationService.respondToReferral(
          input.referralId,
          input.response,
          input.responseNotes,
        )

        return {
          success: true,
          message: `Encaminhamento ${
            input.response === 'accept' ? 'aceito' : 'recusado'
          } com sucesso`,
          data: referral,
        }
      } catch (error) {
        console.error('Error responding to referral:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao responder ao encaminhamento',
          data: null,
        }
      }
    }),

  // Collaborative Sessions
  createCollaborativeSession: protectedProcedure
    .input(CollaborativeSessionInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const session = await coordinationService.createCollaborativeSession(input)

        return {
          success: true,
          message: 'Sessão colaborativa criada com sucesso',
          data: session,
        }
      } catch (error) {
        console.error('Error creating collaborative session:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar sessão colaborativa',
          data: null,
        }
      }
    }),

  getCollaborativeSessions: protectedProcedure
    .input(z.object({
      clinicId: z.string().uuid('ID da clínica inválido'),
      professionalId: z.string().uuid().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const sessions = await coordinationService.getCollaborativeSessions(
          input.clinicId,
          input.professionalId,
        )

        return {
          success: true,
          message: 'Sessões colaborativas obtidas com sucesso',
          data: sessions,
        }
      } catch (error) {
        console.error('Error getting collaborative sessions:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter sessões colaborativas',
          data: [],
        }
      }
    }),

  addSessionParticipant: protectedProcedure
    .input(SessionParticipantInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const participant = await coordinationService.addSessionParticipant(input)

        return {
          success: true,
          message: 'Participante adicionado à sessão com sucesso',
          data: participant,
        }
      } catch (error) {
        console.error('Error adding session participant:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao adicionar participante à sessão',
          data: null,
        }
      }
    }),

  // Coordination Threads and Messages
  createCoordinationThread: protectedProcedure
    .input(CoordinationThreadInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const thread = await coordinationService.createCoordinationThread(input)

        return {
          success: true,
          message: 'Tópico de coordenação criado com sucesso',
          data: thread,
        }
      } catch (error) {
        console.error('Error creating coordination thread:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar tópico de coordenação',
          data: null,
        }
      }
    }),

  getCoordinationThreads: protectedProcedure
    .input(z.object({
      clinicId: z.string().uuid('ID da clínica inválido'),
      patientId: z.string().uuid().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const threads = await coordinationService.getCoordinationThreads(
          input.clinicId,
          input.patientId,
        )

        return {
          success: true,
          message: 'Tópicos de coordenação obtidos com sucesso',
          data: threads,
        }
      } catch (error) {
        console.error('Error getting coordination threads:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter tópicos de coordenação',
          data: [],
        }
      }
    }),

  addCoordinationMessage: protectedProcedure
    .input(CoordinationMessageInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const message = await coordinationService.addCoordinationMessage(input)

        return {
          success: true,
          message: 'Mensagem de coordenação adicionada com sucesso',
          data: message,
        }
      } catch (error) {
        console.error('Error adding coordination message:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao adicionar mensagem de coordenação',
          data: null,
        }
      }
    }),

  // Professional Supervision
  createProfessionalSupervision: protectedProcedure
    .input(ProfessionalSupervisionInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const supervision = await coordinationService.createProfessionalSupervision(input)

        return {
          success: true,
          message: 'Supervisão profissional criada com sucesso',
          data: supervision,
        }
      } catch (error) {
        console.error('Error creating professional supervision:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar supervisão profissional',
          data: null,
        }
      }
    }),

  getSupervisionRelationships: protectedProcedure
    .input(z.object({
      professionalId: z.string().uuid('ID do profissional inválido'),
      type: z.enum(['supervisor', 'supervisee', 'all']).default('all'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const relationships = await coordinationService.getSupervisionRelationships(
          input.professionalId,
          input.type,
        )

        return {
          success: true,
          message: 'Relacionamentos de supervisão obtidos com sucesso',
          data: relationships,
        }
      } catch (error) {
        console.error('Error getting supervision relationships:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter relacionamentos de supervisão',
          data: [],
        }
      }
    }),

  // Professional Scope Validation
  validateProfessionalScope: protectedProcedure
    .input(z.object({
      professionalId: z.string().uuid('ID do profissional inválido'),
      procedureId: z.string().uuid().optional(),
      medicationId: z.string().uuid().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const validation = await coordinationService.validateProfessionalScope(
          input.professionalId,
          input.procedureId,
          input.medicationId,
        )

        return {
          success: true,
          message: 'Validação de escopo profissional concluída',
          data: validation,
        }
      } catch (error) {
        console.error('Error validating professional scope:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao validar escopo profissional',
          data: { isAuthorized: false, authorizationLevel: 'prohibited', conditions: [] },
        }
      }
    }),

  createScopeValidation: protectedProcedure
    .input(ScopeValidationInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const validation = await coordinationService.createScopeValidation(input)

        return {
          success: true,
          message: 'Validação de escopo criada com sucesso',
          data: validation,
        }
      } catch (error) {
        console.error('Error creating scope validation:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar validação de escopo',
          data: null,
        }
      }
    }),

  // Coordination Protocols
  createCoordinationProtocol: protectedProcedure
    .input(CoordinationProtocolInputSchema)
    .mutation(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const protocol = await coordinationService.createCoordinationProtocol(input)

        return {
          success: true,
          message: 'Protocolo de coordenação criado com sucesso',
          data: protocol,
        }
      } catch (error) {
        console.error('Error creating coordination protocol:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao criar protocolo de coordenação',
          data: null,
        }
      }
    }),

  getCoordinationProtocols: protectedProcedure
    .input(z.object({
      clinicId: z.string().uuid('ID da clínica inválido'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const protocols = await coordinationService.getCoordinationProtocols(input.clinicId)

        return {
          success: true,
          message: 'Protocolos de coordenação obtidos com sucesso',
          data: protocols,
        }
      } catch (error) {
        console.error('Error getting coordination protocols:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter protocolos de coordenação',
          data: [],
        }
      }
    }),

  executeProtocol: protectedProcedure
    .input(z.object({
      protocolId: z.string().uuid('ID do protocolo inválido'),
      patientId: z.string().uuid('ID do paciente inválido'),
      triggerEvent: z.string().min(1, 'Evento de gatilho é obrigatório'),
      triggeredBy: z.string().uuid('ID do profissional que acionou inválido'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const execution = await coordinationService.executeProtocol(
          input.protocolId,
          input.patientId,
          input.triggerEvent,
          input.triggeredBy,
        )

        return {
          success: true,
          message: 'Protocolo executado com sucesso',
          data: execution,
        }
      } catch (error) {
        console.error('Error executing protocol:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao executar protocolo',
          data: null,
        }
      }
    }),

  // Automated Workflows
  checkOverdueReferrals: protectedProcedure
    .input(z.object({}))
    .query(async () => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const overdueReferrals = await coordinationService.checkOverdueReferrals()

        return {
          success: true,
          message: 'Verificação de encaminhamentos pendentes concluída',
          data: overdueReferrals,
        }
      } catch (error) {
        console.error('Error checking overdue referrals:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao verificar encaminhamentos pendentes',
          data: [],
        }
      }
    }),

  createCollaborativeSessionForTreatment: protectedProcedure
    .input(z.object({
      patientId: z.string().uuid('ID do paciente inválido'),
      treatmentPlanId: z.string().uuid('ID do plano de tratamento inválido'),
      sessionType: z.enum(['planning', 'treatment', 'assessment', 'follow_up', 'emergency'])
        .default('planning'),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const session = await coordinationService.createCollaborativeSessionForTreatment(
          input.patientId,
          input.treatmentPlanId,
          input.sessionType,
        )

        return {
          success: true,
          message: 'Sessão colaborativa criada para tratamento com sucesso',
          data: session,
        }
      } catch (error) {
        console.error('Error creating collaborative session for treatment:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao criar sessão colaborativa para tratamento',
          data: null,
        }
      }
    }),

  // Analytics and Reporting
  getCoordinationAnalytics: protectedProcedure
    .input(z.object({
      clinicId: z.string().uuid('ID da clínica inválido'),
      dateRange: z.object({
        start: z.date('Data de início inválida'),
        end: z.date('Data de término inválida'),
      }),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const analytics = await coordinationService.getCoordinationAnalytics(
          input.clinicId,
          input.dateRange,
        )

        return {
          success: true,
          message: 'Análises de coordenação obtidas com sucesso',
          data: analytics,
        }
      } catch (error) {
        console.error('Error getting coordination analytics:', error)
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter análises de coordenação',
          data: [],
        }
      }
    }),

  getProfessionalCollaborationMetrics: protectedProcedure
    .input(z.object({
      professionalId: z.string().uuid('ID do profissional inválido'),
      dateRange: z.object({
        start: z.date('Data de início inválida'),
        end: z.date('Data de término inválida'),
      }),
    }))
    .query(async ({ input }) => {
      try {
        const coordinationService = new MultiProfessionalCoordinationService({
          supabaseUrl: process.env.SUPABASE_URL!,
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        })

        const metrics = await coordinationService.getProfessionalCollaborationMetrics(
          input.professionalId,
          input.dateRange,
        )

        return {
          success: true,
          message: 'Métricas de colaboração profissional obtidas com sucesso',
          data: metrics,
        }
      } catch (error) {
        console.error('Error getting professional collaboration metrics:', error)
        return {
          success: false,
          message: error instanceof Error
            ? error.message
            : 'Erro ao obter métricas de colaboração profissional',
          data: [],
        }
      }
    }),
})
