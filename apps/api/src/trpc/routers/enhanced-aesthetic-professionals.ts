/**
 * Enhanced Aesthetic Professionals Router
 *
 * Provides comprehensive professional management with multi-council validation
 * for Brazilian aesthetic clinics (CFM, COREN, CFF, CNEP)
 */

import { z } from 'zod'
import { EnhancedAestheticProfessionalsService } from '../../services/enhanced-aesthetic-professionals-service'
import { protectedProcedure, publicProcedure, router } from '../trpc'

// Input schemas
const CreateProfessionalInput = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{2}\)\s*\d{4,5}-\d{4}$/),
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']),
  councilNumber: z.string().min(4),
  councilState: z.string().length(2),
  specialties: z.array(z.string()),
  anvisaCertifications: z.array(z.string()).optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
})

const UpdateProfessionalInput = CreateProfessionalInput.partial().extend({
  id: z.string().uuid(),
})

const CouncilValidationInput = z.object({
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']),
  councilNumber: z.string(),
  councilState: z.string().length(2),
  professionalName: z.string(),
})

const AnvisaCertificationInput = z.object({
  certificationNumber: z.string(),
  procedureType: z.string(),
  expirationDate: z.date(),
  verificationCode: z.string().optional(),
})

const ProfessionalQueryInput = z.object({
  search: z.string().optional(),
  councilType: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']).optional(),
  specialty: z.string().optional(),
  active: z.boolean().default(true),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Initialize service
const professionalsService = new EnhancedAestheticProfessionalsService()

export const enhancedAestheticProfessionalsRouter = router({
  // Create new professional
  create: protectedProcedure
    .input(CreateProfessionalInput)
    .mutation(async ({ input }) => {
      return await professionalsService.createProfessional(input)
    }),

  // Get professional by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return await professionalsService.getProfessionalById(input.id)
    }),

  // Update professional
  update: protectedProcedure
    .input(UpdateProfessionalInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await professionalsService.updateProfessional(id, data)
    }),

  // List professionals with filtering
  list: publicProcedure
    .input(ProfessionalQueryInput)
    .query(async ({ input }) => {
      return await professionalsService.listProfessionals(input)
    }),

  // Validate council registration
  validateCouncil: publicProcedure
    .input(CouncilValidationInput)
    .mutation(async ({ input }) => {
      return await professionalsService.validateCouncilRegistration(input)
    }),

  // Verify ANVISA certification
  verifyAnvisaCertification: publicProcedure
    .input(AnvisaCertificationInput)
    .mutation(async ({ input }) => {
      return await professionalsService.verifyAnvisaCertification(input)
    }),

  // Get professional by council number
  getByCouncilNumber: publicProcedure
    .input(z.object({
      councilType: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']),
      councilNumber: z.string(),
      councilState: z.string().length(2),
    }))
    .query(async ({ input }) => {
      return await professionalsService.getProfessionalByCouncilNumber(
        input.councilType,
        input.councilNumber,
        input.councilState,
      )
    }),

  // Get professional statistics
  getStats: protectedProcedure
    .query(async () => {
      return await professionalsService.getProfessionalStatistics()
    }),

  // Deactivate professional (soft delete)
  deactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await professionalsService.deactivateProfessional(input.id)
    }),

  // Reactivate professional
  reactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await professionalsService.reactivateProfessional(input.id)
    }),
})
