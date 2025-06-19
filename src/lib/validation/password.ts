import { z } from 'zod'

// Password validation schema with enterprise-grade requirements
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for common patterns
    const commonPatterns = [
      /^(.)\1+$/, // All same character
      /^(01234|12345|23456|34567|45678|56789|67890|09876|98765|87654|76543|65432|54321|43210)/, // Sequential numbers
      /^(abcde|bcdef|cdefg|defgh|efghi|fghij|ghijk|hijkl|ijklm|jklmn|klmno|lmnop|mnopq|nopqr|opqrs|pqrst|qrstu|rstuv|stuvw|tuvwx|uvwxy|vwxyz)/i, // Sequential letters
    ]
    return !commonPatterns.some(pattern => pattern.test(password))
  }, 'Password contains common patterns')

// Calculate password strength (0-6 scale)
export function calculatePasswordStrength(password: string): number {
  let strength = 0

  // Length-based points
  if (password.length >= 12) strength++
  if (password.length >= 16) strength++
  if (password.length >= 20) strength++

  // Character variety points
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  // Deduct points for common patterns
  if (/(.)\1{2,}/.test(password)) strength-- // Repeated characters
  if (/^[0-9]+$/.test(password)) strength-- // Only numbers

  return Math.max(0, Math.min(6, strength))
}

// Check if password has been breached using HaveIBeenPwned API
export async function checkPasswordBreach(password: string): Promise<{
  breached: boolean
  occurrences?: number
}> {
  try {
    // Create SHA-1 hash of the password using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    // Query HaveIBeenPwned API with k-anonymity
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'NeonPro-PasswordChecker/1.0',
      },
    })

    if (!response.ok) {
      console.error('HaveIBeenPwned API error:', response.status)
      return { breached: false } // Fail open
    }

    const text = await response.text()
    const hashes = text.split('\n')

    // Check if our hash suffix appears in the response
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':')
      if (hashSuffix === suffix) {
        return {
          breached: true,
          occurrences: parseInt(count.trim(), 10),
        }
      }
    }

    return { breached: false }
  } catch (error) {
    console.error('Password breach check error:', error)
    return { breached: false } // Fail open
  }
}

// Get password strength label
export function getPasswordStrengthLabel(strength: number): string {
  const labels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong',
    'Excellent',
  ]
  return labels[strength] || 'Unknown'
}

// Get password strength color (Tailwind classes)
export function getPasswordStrengthColor(strength: number): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-emerald-600',
  ]
  return colors[strength] || 'bg-gray-500'
}
