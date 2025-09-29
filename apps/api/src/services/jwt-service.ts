import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  sessionId: string
  role: string
  emergencyAccess?: boolean
  reason?: string
}

export interface JWTValidationResult {
  isValid: boolean
  payload?: JWTPayload
  error?: string
}

export class JWTService {
  private secret: string
  private algorithm: jwt.Algorithm = 'HS256'

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-key-change-in-production'
  }

  async validateToken(token: string): Promise<JWTValidationResult> {
    try {
      if (!token) {
        return {
          isValid: false,
          error: 'No token provided'
        }
      }

      const decoded = jwt.verify(token, this.secret, {
        algorithms: [this.algorithm],
        complete: false
      })

      if (typeof decoded !== 'object' || decoded === null) {
        return {
          isValid: false,
          error: 'Invalid token format'
        }
      }

      const payload = decoded as JWTPayload

      // Validate required fields
      if (!payload.userId || !payload.sessionId || !payload.role) {
        return {
          isValid: false,
          error: 'Missing required fields in token payload'
        }
      }

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return {
          isValid: false,
          error: 'Token has expired'
        }
      }

      return {
        isValid: true,
        payload: {
          userId: payload.userId,
          sessionId: payload.sessionId,
          role: payload.role,
          emergencyAccess: payload.emergencyAccess,
          reason: payload.reason
        }
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          error: `Invalid token: ${error.message}`
        }
      }

      return {
        isValid: false,
        error: 'Token validation failed'
      }
    }
  }

  generateToken(payload: JWTPayload, expiresIn: string = '1h'): string {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiration(expiresIn)
    }

    return jwt.sign(tokenPayload, this.secret, { algorithm: this.algorithm })
  }

  private parseExpiration(expiresIn: string): number {
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1))
    
    switch (unit) {
      case 's':
        return value
      case 'm':
        return value * 60
      case 'h':
        return value * 60 * 60
      case 'd':
        return value * 24 * 60 * 60
      default:
        return 3600 // Default to 1 hour
    }
  }
}