// Generate valid CNS starting with 1
function generateValidCNSStartingWith1() {
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  // Start with first digit as 1
  const digits = [1]

  // Generate random digits for positions 1-13
  for (let i = 1; i < 14; i++) {
    digits.push(Math.floor(Math.random() * 10))
  }

  // Calculate what the 15th digit should be
  let sum = 0
  for (let i = 0; i < 14; i++) {
    if (digits[i] !== undefined && weights[i] !== undefined) {
      sum += digits[i]! * weights[i]!
    }
  }

  const remainder = sum % 11
  const lastDigit = remainder === 0 ? 0 : 11 - remainder

  digits.push(lastDigit)

  const cns = digits.join('')
  console.log(`Generated CNS: ${cns}`)

  // Verify it
  let verifySum = 0
  for (let i = 0; i < 15; i++) {
    if (digits[i] !== undefined && weights[i] !== undefined) {
      verifySum += digits[i]! * weights[i]!
    }
  }
  console.log(`Verification sum: ${verifySum}, Remainder: ${verifySum % 11}`)

  return cns
}

generateValidCNSStartingWith1()
