/**
 * Enhanced database exports for monorepo sharing
 * Includes comprehensive services and utilities for healthcare applications
 */

// Core database clients - factory functions
export { createClient, createServiceClient } from './client-full.js'

// Prisma client instance
export { prisma } from './client-full.js'

// Health check utilities
export { checkDatabaseHealth, closeDatabaseConnections } from './client-full.js'

// Database types
export type { Database } from './types/supabase'

// Minimal BaseService implementation for API routes
export class BaseService {
  protected logger: any

  constructor() {
    this.logger = console
  }

  async connect() {
    return true
  }

  async disconnect() {
    return true
  }

  async healthCheck() {
    return { status: 'healthy' }
  }
}

// Direct supabase client export for chat route compatibility
import { createClient as createSupabaseClient } from './client-full.js'
export const supabase = createSupabaseClient()

// Placeholder WebRTC session service for telemedicine
export class WebRTCSessionService {
  constructor() {
    console.log('Placeholder WebRTC service - will be replaced with actual implementation');
  }

  async createSession(sessionData: any) {
    return { 
      sessionId: 'placeholder-session-id', 
      status: 'created', 
      createdAt: new Date().toISOString() 
    };
  }

  async getSession(sessionId: string) {
    return { 
      sessionId, 
      status: 'mock', 
      participants: [], 
      createdAt: new Date().toISOString() 
    };
  }

  async endSession(sessionId: string) {
    return { success: true, sessionId };
  }
}

// AI data sanitization utilities
// Simple implementation to bypass complex logger dependencies
export function sanitizeForAI<T extends Record<string, any>>(data: T): T {
  const sensitiveFields = [
    'cpf',
    'rg',
    'email',
    'phone',
    'address',
    'medicalRecordNumber',
    'insuranceNumber',
    'creditCard',
    'password',
    'secret',
  ]

  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field]
    }
  }

  return sanitized
}
