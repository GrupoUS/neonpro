import { randomBytes } from 'crypto'
import { authenticator } from 'otpauth'
import QRCode from 'qrcode'

// Generate a new TOTP secret for a user
export function generateTOTPSecret(email: string, issuer = 'NeonPro') {
  const secret = authenticator.generateSecret()

  const totp = new authenticator.TOTP({
    issuer,
    label: email,
    secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  })

  return {
    secret,
    uri: totp.toString(),
  }
}

// Generate QR code for TOTP setup
export async function generateQRCode(uri: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(uri, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('QR code generation failed:', error)
    throw new Error('Failed to generate QR code')
  }
}

// Verify a TOTP code
export function verifyTOTP(secret: string, token: string, window = 1): boolean {
  try {
    const totp = new authenticator.TOTP({
      secret,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    })

    // Verify with time window to account for clock drift
    const delta = totp.validate({ token, window })
    return delta !== null
  } catch (error) {
    console.error('TOTP verification failed:', error)
    return false
  }
}

// Generate recovery codes
export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = randomBytes(6)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 8)
      .toUpperCase()

    codes.push(code)
  }

  return codes
}

// Hash recovery codes for storage
export async function hashRecoveryCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Verify a recovery code
export async function verifyRecoveryCode(
  code: string,
  hashedCodes: string[]
): Promise<boolean> {
  const hashedInput = await hashRecoveryCode(code.toUpperCase())
  return hashedCodes.includes(hashedInput)
}

// Format recovery codes for display
export function formatRecoveryCodes(codes: string[]): string {
  return codes
    .map((code, index) => `${(index + 1).toString().padStart(2, '0')}. ${code}`)
    .join('\n')
}

// Encrypt TOTP secret for storage
export async function encryptTOTPSecret(secret: string, key: string): Promise<{
  encrypted: string
  iv: string
}> {
  const encoder = new TextEncoder()
  const keyData = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').substring(0, 32)),
    'AES-GCM',
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyData,
    encoder.encode(secret)
  )

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

// Decrypt TOTP secret
export async function decryptTOTPSecret(
  encrypted: string,
  iv: string,
  key: string
): Promise<string> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const keyData = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key.padEnd(32, '0').substring(0, 32)),
    'AES-GCM',
    false,
    ['decrypt']
  )

  const encryptedData = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0))

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    keyData,
    encryptedData
  )

  return decoder.decode(decryptedData)
}
