/**
 * JWT Implementation Fallback
 * 
 * Temporary implementation while jsonwebtoken dependency issues are resolved
 * This provides basic JWT functionality for testing and development
 */

// Simple JWT implementation for testing
export class SimpleJWT {
  private static readonly ALGORITHM = 'HS256'
  private static readonly SECRET = process.env.JWT_SECRET || 'fallback-secret-for-testing'

  static async sign(payload: any, secret: string, options: any = {}): Promise<string> {
    // Simple base64 encoding for testing (NOT PRODUCTION READY)
    const header = { alg: this.ALGORITHM, typ: 'JWT' }
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    
    // Simple signature (not cryptographically secure - for testing only)
    const signatureInput = `${encodedHeader}.${encodedPayload}`
    const signature = Buffer.from(this.simpleHMAC(signatureInput, secret)).toString('base64url')
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  static async verify(token: string, secret: string, options: any = {}): Promise<any> {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.')
      
      // Verify signature
      const signatureInput = `${encodedHeader}.${encodedPayload}`
      const expectedSignature = Buffer.from(this.simpleHMAC(signatureInput, secret)).toString('base64url')
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature')
      }
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }
      
      return payload
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private static simpleHMAC(data: string, secret: string): string {
    // Simple HMAC-like function for testing (NOT PRODUCTION READY)
    const crypto = require('crypto')
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
  }
}

// Mock jsonwebtoken exports
export const sign = async (payload: any, secret: string, options?: any): Promise<string> => {
  return SimpleJWT.sign(payload, secret, options)
}

export const verify = async (token: string, secret: string, options?: any): Promise<any> => {
  return SimpleJWT.verify(token, secret, options)
}

export const decode = (token: string): any => {
  try {
    const [encodedHeader, encodedPayload] = token.split('.')
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
  } catch {
    return null
  }
}

export default {
  sign,
  verify,
  decode
}