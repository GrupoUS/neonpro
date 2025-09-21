import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '../lib/logger';

/**
 * LGPD (Lei Geral de Proteção de Dados) compliance middleware
 * Ensures Brazilian data protection law compliance
 */

/**
 * LGPD consent status
 */
type ConsentStatus = 'pending' | 'granted' | 'denied' | 'withdrawn' | 'expired';

/**
 * Data processing purpose
 */
type ProcessingPurpose = 
  | 'medical_care'
  | 'appointment_scheduling'
  | 'billing'
  | 'legal_obligation'
  | 'legitimate_interest'
  | 'vital_interest'
  | 'consent';

/**
 * LGPD consent record
 */
interface LGPDConsent {
  userId: string;
  purpose: ProcessingPurpose;
  status: ConsentStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

/**
 * LGPD middleware configuration
 */
interface LGPDConfig {
  requiredPurposes?: ProcessingPurpose[];
  strictMode?: boolean;
  logAccess?: boolean;
  checkExpiration?: boolean;
}

/**
 * Mock consent store - replace with actual database implementation
 */
class ConsentStore {
  private consents = new Map<string, LGPDConsent[]>();
  
  async getConsents(userId: string, purpose: ProcessingPurpose): Promise<LGPDConsent[]> {
    const userConsents = this.consents.get(userId) || [];
    return userConsents.filter(consent => consent.purpose === purpose);
  }
  
  async hasValidConsent(userId: string, purpose: ProcessingPurpose): Promise<boolean> {
    const consents = await this.getConsents(userId, purpose);
    const now = new Date();
    
    return consents.some(consent => 
      consent.status === 'granted' && 
      (!consent.expiresAt || consent.expiresAt > now)
    );
  }
  
  async recordConsent(consent: LGPDConsent): Promise<void> {
    const userConsents = this.consents.get(consent.userId) || [];
    userConsents.push(consent);
    this.consents.set(consent.userId, userConsents);
  }
  
  async withdrawConsent(userId: string, purpose: ProcessingPurpose): Promise<void> {
    const userConsents = this.consents.get(userId) || [];
    userConsents.forEach(consent => {
      if (consent.purpose === purpose && consent.status === 'granted') {
        consent.status = 'withdrawn';
        consent.withdrawnAt = new Date();
      }
    });
  }
}

const consentStore = new ConsentStore();

/**
 * Determines the required processing purpose based on the request
 */
function getProcessingPurpose(c: Context): ProcessingPurpose {
  const path = c.req.path.toLowerCase();
  const method = c.req.method.toUpperCase();
  
  // Medical care purposes
  if (path.includes('/patients') || path.includes('/medical-records')) {
    return 'medical_care';
  }
  
  // Appointment purposes
  if (path.includes('/appointments')) {
    return 'appointment_scheduling';
  }
  
  // Billing purposes
  if (path.includes('/billing') || path.includes('/payments')) {
    return 'billing';
  }
  
  // Default to consent for other operations
  return 'consent';
}

/**
 * Checks if the operation requires explicit consent
 */
function requiresExplicitConsent(purpose: ProcessingPurpose): boolean {
  // Some purposes don't require explicit consent under LGPD
  const exemptPurposes: ProcessingPurpose[] = [
    'legal_obligation',
    'vital_interest',
  ];
  
  return !exemptPurposes.includes(purpose);
}

/**
 * LGPD compliance middleware
 */
export function lgpdMiddleware(config: LGPDConfig = {}) {
  const {
    requiredPurposes = [],
    strictMode = true,
    logAccess = true,
    checkExpiration = true,
  } = config;

  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user');
      const userId = user?.id || c.get('userId');
      
      // Skip LGPD checks for unauthenticated requests
      if (!userId) {
        await next();
        return;
      }
      
      const purpose = getProcessingPurpose(c);
      const ip = c.req.header('x-forwarded-for') || 
                 c.req.header('x-real-ip') || 
                 'unknown';
      const userAgent = c.req.header('user-agent') || 'unknown';
      
      // Check if explicit consent is required
      if (requiresExplicitConsent(purpose)) {
        const hasConsent = await consentStore.hasValidConsent(userId, purpose);
        
        if (!hasConsent && strictMode) {
          logger.warn('LGPD: Access denied - missing consent', {
            userId,
            purpose,
            path: c.req.path,
            method: c.req.method,
            ip,
          });
          
          throw new HTTPException(403, {
            message: 'Data processing consent required',
            cause: {
              code: 'LGPD_CONSENT_REQUIRED',
              purpose,
              consentUrl: `/api/v1/consent?purpose=${purpose}`,
            },
          });
        }
      }
      
      // Log data access for audit purposes
      if (logAccess) {
        logger.info('LGPD: Data access logged', {
          userId,
          purpose,
          path: c.req.path,
          method: c.req.method,
          ip,
          userAgent,
          hasConsent: await consentStore.hasValidConsent(userId, purpose),
          timestamp: new Date().toISOString(),
        });
      }
      
      // Set LGPD context for downstream handlers
      c.set('lgpdPurpose', purpose);
      c.set('lgpdCompliant', true);
      
      await next();
      
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      
      logger.error('LGPD middleware error', {
        error: error instanceof Error ? error.message : String(error),
        path: c.req.path,
        method: c.req.method,
      });
      
      throw new HTTPException(500, {
        message: 'LGPD compliance check failed',
      });
    }
  };
}

/**
 * Healthcare-specific LGPD middleware
 */
export function healthcareLGPDMiddleware() {
  return lgpdMiddleware({
    requiredPurposes: ['medical_care', 'appointment_scheduling'],
    strictMode: true,
    logAccess: true,
    checkExpiration: true,
  });
}

/**
 * Middleware to handle consent requests
 */
export function consentMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'POST' && c.req.path.includes('/consent')) {
      try {
        const user = c.get('user');
        const userId = user?.id || c.get('userId');
        
        if (!userId) {
          throw new HTTPException(401, { message: 'Authentication required' });
        }
        
        const body = await c.req.json();
        const { purpose, action } = body;
        
        if (!purpose || !action) {
          throw new HTTPException(400, { 
            message: 'Purpose and action are required' 
          });
        }
        
        const ip = c.req.header('x-forwarded-for') || 
                   c.req.header('x-real-ip') || 
                   'unknown';
        const userAgent = c.req.header('user-agent') || 'unknown';
        
        if (action === 'grant') {
          const consent: LGPDConsent = {
            userId,
            purpose,
            status: 'granted',
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            ipAddress: ip,
            userAgent,
            version: '1.0',
          };
          
          await consentStore.recordConsent(consent);
          
          logger.info('LGPD: Consent granted', {
            userId,
            purpose,
            ip,
            userAgent,
          });
          
          return c.json({
            message: 'Consent granted successfully',
            purpose,
            status: 'granted',
            expiresAt: consent.expiresAt,
          });
          
        } else if (action === 'withdraw') {
          await consentStore.withdrawConsent(userId, purpose);
          
          logger.info('LGPD: Consent withdrawn', {
            userId,
            purpose,
            ip,
            userAgent,
          });
          
          return c.json({
            message: 'Consent withdrawn successfully',
            purpose,
            status: 'withdrawn',
          });
        }
        
        throw new HTTPException(400, { 
          message: 'Invalid action. Use "grant" or "withdraw"' 
        });
        
      } catch (error) {
        if (error instanceof HTTPException) {
          throw error;
        }
        
        logger.error('Consent handling error', {
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw new HTTPException(500, {
          message: 'Failed to process consent request',
        });
      }
    }
    
    await next();
  };
}

/**
 * Middleware to handle data portability requests (LGPD Article 18)
 */
export function dataPortabilityMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'GET' && c.req.path.includes('/data-export')) {
      try {
        const user = c.get('user');
        const userId = user?.id || c.get('userId');
        
        if (!userId) {
          throw new HTTPException(401, { message: 'Authentication required' });
        }
        
        // TODO: Implement actual data export
        // This should collect all user data from all systems
        const userData = {
          userId,
          exportedAt: new Date().toISOString(),
          data: {
            profile: user,
            // Add other user data here
          },
          format: 'json',
          version: '1.0',
        };
        
        logger.info('LGPD: Data export requested', {
          userId,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        });
        
        return c.json(userData);
        
      } catch (error) {
        logger.error('Data portability error', {
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw new HTTPException(500, {
          message: 'Failed to export user data',
        });
      }
    }
    
    await next();
  };
}

/**
 * Data deletion middleware (LGPD Article 18)
 */
export function dataErasureMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.method === 'DELETE' && c.req.path.includes('/data-erasure')) {
      try {
        const user = c.get('user');
        const userId = user?.id || c.get('userId');
        
        if (!userId) {
          throw new HTTPException(401, { message: 'Authentication required' });
        }
        
        // TODO: Implement actual data deletion
        // This should remove or anonymize all user data
        
        logger.info('LGPD: Data erasure requested', {
          userId,
          ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        });
        
        return c.json({
          message: 'Data erasure request processed',
          userId,
          processedAt: new Date().toISOString(),
        });
        
      } catch (error) {
        logger.error('Data erasure error', {
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw new HTTPException(500, {
          message: 'Failed to process data erasure request',
        });
      }
    }
    
    await next();
  };
}

/**
 * Data protection middleware (alias for healthcare LGPD middleware)
 * @deprecated Use healthcareLGPDMiddleware instead
 */
export const dataProtection = healthcareLGPDMiddleware;