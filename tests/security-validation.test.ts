/**
 * Essential Security Validation Tests
 * Tests that @.claude/agents/code-review/ can use for security validation
 * Following KISS and YAGNI principles - only essential security checks
 */

import { describe, it, expect } from 'vitest'

describe('Essential Security Validation', () => {
  describe('Input Validation Patterns', () => {
    it('should detect missing input sanitization', () => {
      const vulnerableCode = `
        function setUserContent(element: HTMLElement, content: string) {
          element.innerHTML = content // XSS vulnerability
        }
      `
      
      const hasInnerHTML = /innerHTML\s*=/.test(vulnerableCode)
      expect(hasInnerHTML).toBe(true)
    })

    it('should detect proper input sanitization', () => {
      const secureCode = `
        function setUserContent(element: HTMLElement, content: string) {
          element.textContent = content // Safe alternative
        }
      `
      
      const hasTextContent = /textContent\s*=/.test(secureCode)
      expect(hasTextContent).toBe(true)
    })

    it('should detect SQL injection patterns', () => {
      const vulnerableCode = `
        function getUserById(id: string) {
          const query = "SELECT * FROM users WHERE id = '" + id + "'"
          return executeQuery(query)
        }
      `
      
      const hasStringConcatenation = /\+\s*id/.test(vulnerableCode)
      const hasSqlInQuery = /SELECT.*FROM.*WHERE/.test(vulnerableCode)
      expect(hasStringConcatenation).toBe(true)
      expect(hasSqlInQuery).toBe(true)
    })
  })

  describe('Authentication and Authorization', () => {
    it('should detect password handling patterns', () => {
      const authCode = `
        function verifyPassword(password: string, hash: string) {
          return bcrypt.compare(password, hash)
        }
      `
      
      const hasPasswordParam = /password/.test(authCode)
      const hasHashing = /bcrypt|hash|compare/.test(authCode)
      expect(hasPasswordParam).toBe(true)
      expect(hasHashing).toBe(true)
    })

    it('should detect session management', () => {
      const sessionCode = `
        function createUserSession(user: User) {
          const token = jwt.sign({ userId: user.id }, SECRET_KEY)
          return { token, user: user }
        }
      `
      
      const hasJwtUsage = /jwt\.(sign|verify)/.test(sessionCode)
      const hasTokenGeneration = /token/.test(sessionCode)
      expect(hasJwtUsage).toBe(true)
      expect(hasTokenGeneration).toBe(true)
    })
  })

  describe('Data Protection', () => {
    it('should detect sensitive data exposure', () => {
      const exposedDataCode = `
        function logUser(user: User) {
          console.log('User:', user.password, user.creditCard) // Exposing sensitive data
          console.log('User data:', user)
        }
      `
      
      const hasSensitiveLogging = /(password|creditCard|ssn).*(console\.log|console\.error)/.test(exposedDataCode)
      const hasFullUserLogging = /console\.log.*user/i.test(exposedDataCode)
      expect(hasSensitiveLogging).toBe(true)
      expect(hasFullUserLogging).toBe(true)
    })

    it('should detect data encryption patterns', () => {
      const encryptionCode = `
        function encryptData(data: string): string {
          const algorithm = 'aes-256-cbc'
          const key = crypto.createHash('sha256').update(SECRET_KEY).digest()
          const iv = crypto.randomBytes(16)
          const cipher = crypto.createCipheriv(algorithm, key, iv)
          let encrypted = cipher.update(data, 'utf8', 'hex')
          encrypted += cipher.final('hex')
          return encrypted
        }
      `
      
      const hasEncryption = /(encrypt|cipher|crypto)/.test(encryptionCode)
      const hasKeyGeneration = /key.*=/.test(encryptionCode)
      expect(hasEncryption).toBe(true)
      expect(hasKeyGeneration).toBe(true)
    })
  })

  describe('API Security', () => {
    it('should detect CORS configuration', () => {
      const corsCode = `
        app.use(cors({
          origin: 'https://trusted-domain.com',
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }))
      `
      
      const hasCorsOrigin = /origin:\s*['"]/.test(corsCode)
      const hasCorsConfig = /cors\(/.test(corsCode)
      expect(hasCorsOrigin).toBe(true)
      expect(hasCorsConfig).toBe(true)
    })

    it('should detect rate limiting', () => {
      const rateLimitCode = `
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100 // limit each IP to 100 requests per windowMs
        })
        
        app.use('/api/', limiter)
      `
      
      const hasRateLimit = /rateLimit/.test(rateLimitCode)
      const hasWindowMs = /windowMs/.test(rateLimitCode)
      expect(hasRateLimit).toBe(true)
      expect(hasWindowMs).toBe(true)
    })
  })

  describe('File System Security', () => {
    it('should detect path traversal patterns', () => {
      const vulnerableCode = `
        function readFile(filename: string) {
          const filePath = '/app/data/' + filename
          return fs.readFileSync(filePath, 'utf8')
        }
      `
      
      const hasPathConcatenation = /\+\s*filename/.test(vulnerableCode)
      const hasFileAccess = /fs\.(readFile|readFileSync)/.test(vulnerableCode)
      expect(hasPathConcatenation).toBe(true)
      expect(hasFileAccess).toBe(true)
    })

    it('should detect safe file access patterns', () => {
      const safeCode = `
        function readFile(filename: string) {
          const safeFilename = path.basename(filename)
          const filePath = path.join('/app/data', safeFilename)
          if (!filePath.startsWith('/app/data/')) {
            throw new Error('Invalid path')
          }
          return fs.readFileSync(filePath, 'utf8')
        }
      `
      
      const hasPathSanitization = /path\.basename/.test(safeCode)
      const hasPathValidation = /startsWith/.test(safeCode)
      expect(hasPathSanitization).toBe(true)
      expect(hasPathValidation).toBe(true)
    })
  })

  describe('Environment and Configuration', () => {
    it('should detect environment variable usage', () => {
      const envCode = `
        const dbUrl = process.env.DATABASE_URL
        const apiKey = process.env.API_KEY
        const secret = process.env.SECRET_KEY
        
        if (!dbUrl || !apiKey) {
          throw new Error('Missing required environment variables')
        }
      `
      
      const hasEnvUsage = /process\.env\./.test(envCode)
      const hasEnvValidation = /process\.env.*=.*\?/.test(envCode)
      expect(hasEnvUsage).toBe(true)
      expect(hasEnvValidation).toBe(true)
    })

    it('should detect configuration validation', () => {
      const configCode = `
        interface Config {
          database: {
            url: string
            maxConnections: number
          }
          security: {
            sessionTimeout: number
            bcryptRounds: number
          }
        }
        
        function validateConfig(config: Config): boolean {
          return !!(config.database.url && config.security.bcryptRounds >= 10)
        }
      `
      
      const hasConfigInterface = /interface\s+Config/.test(configCode)
      const hasConfigValidation = /validateConfig/.test(configCode)
      expect(hasConfigInterface).toBe(true)
      expect(hasConfigValidation).toBe(true)
    })
  })

  describe('Error Handling Security', () => {
    it('should detect secure error handling', () => {
      const secureErrorHandling = `
        function handleApiError(error: Error) {
          // Log error for debugging
          logger.error('API Error:', { error: error.message, stack: error.stack })
          
          // Return generic error to client
          return {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
          }
        }
      `
      
      const hasErrorLogging = /logger\.(error|warn)/.test(secureErrorHandling)
      const hasGenericErrorResponse = /Internal server error/.test(secureErrorHandling)
      expect(hasErrorLogging).toBe(true)
      expect(hasGenericErrorResponse).toBe(true)
    })

    it('should detect error information disclosure', () => {
      const vulnerableErrorHandling = `
        function handleError(error: Error) {
          return res.status(500).json({
            error: error.message,
            stack: error.stack, // Exposing stack trace
            details: error // Full error object
          })
        }
      `
      
      const hasStackExposure = /stack.*error\.stack/.test(vulnerableErrorHandling)
      const hasFullErrorExposure = /details.*error/.test(vulnerableErrorHandling)
      expect(hasStackExposure).toBe(true)
      expect(hasFullErrorExposure).toBe(true)
    })
  })

  describe('HTTP Security Headers', () => {
    it('should detect security headers configuration', () => {
      const headersCode = `
        app.use(helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"]
            }
          },
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true
          }
        }))
      `
      
      const hasHelmetUsage = /helmet/.test(headersCode)
      const hasCspConfig = /contentSecurityPolicy/.test(headersCode)
      const hasHstsConfig = /hsts/.test(headersCode)
      expect(hasHelmetUsage).toBe(true)
      expect(hasCspConfig).toBe(true)
      expect(hasHstsConfig).toBe(true)
    })
  })

  describe('Cryptographic Practices', () => {
    it('should detect secure random generation', () => {
      const secureRandomCode = `
        function generateSecureToken(length: number): string {
          const buffer = crypto.randomBytes(length)
          return buffer.toString('hex')
        }
        
        function generateSessionId(): string {
          return crypto.randomBytes(32).toString('base64')
        }
      `
      
      const hasSecureRandom = /crypto\.randomBytes/.test(secureRandomCode)
      const hasTokenGeneration = /generate.*Token/.test(secureRandomCode)
      expect(hasSecureRandom).toBe(true)
      expect(hasTokenGeneration).toBe(true)
    })

    it('should detect weak random patterns', () => {
      const weakRandomCode = `
        function generateId() {
          return Math.random().toString(36).substr(2, 9) // Weak random
        }
        
        function generateToken() {
          return Date.now().toString(36) + Math.random().toString(36)
        }
      `
      
      const hasMathRandom = /Math\.random/.test(weakRandomCode)
      const hasDateBasedToken = /Date\.now/.test(weakRandomCode)
      expect(hasMathRandom).toBe(true)
      expect(hasDateBasedToken).toBe(true)
    })
  })
})