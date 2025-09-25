// Debug remaining issues
import { validateCNS, validateCPF, validateProfessionalLicense } from './src/index'

console.error('=== CNS Debug ===')
const testCNS = '170185783640008'
console.error(`CNS: ${testCNS} -> Valid: ${validateCNS(testCNS)}`)

// Manual calculation
const digits = testCNS.split('').map(Number)
const firstDigit = digits[0]
console.error(`First digit: ${firstDigit}`)

if (firstDigit === 1 || firstDigit === 2) {
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  let sum = 0
  for (let i = 0; i < 15; i++) {
    if (digits[i] !== undefined && weights[i] !== undefined) {
      sum += digits[i]! * weights[i]!
    }
  }
  const remainder = sum % 11
  console.error(`Definitive CNS - Sum: ${sum}, Remainder: ${remainder}, Valid: ${remainder === 0}`)
}

console.error('\n=== Professional License Debug ===')
console.error(`null -> Valid: ${validateProfessionalLicense(null)}`)
console.error(`undefined -> Valid: ${validateProfessionalLicense(undefined)}`)
console.error(`"null" -> Valid: ${validateProfessionalLicense('null')}`)
console.error(`"undefined" -> Valid: ${validateProfessionalLicense('undefined')}`)

console.error('\n=== CPF Debug ===')
const testCPF = '123.456.789-01'
console.error(`CPF: ${testCPF} -> Valid: ${validateCPF(testCPF)}`)

const cleanCPF = testCPF.replace(/[^\d]/g, '')
console.error(`Clean CPF: ${cleanCPF}`)

// Check first digit validation
let sum = 0
for (let i = 0; i < 9; i++) {
  const digit = cleanCPF.charAt(i)
  if (digit) {
    sum += parseInt(digit) * (10 - i)
  }
}
let remainder = (sum * 10) % 11
if (remainder === 10 || remainder === 11) remainder = 0
const ninthDigit = cleanCPF.charAt(9)
console.error(
  `First check - Sum: ${sum}, Remainder: ${remainder}, Expected: ${ninthDigit}, Match: ${
    remainder.toString() === ninthDigit
  }`,
)
