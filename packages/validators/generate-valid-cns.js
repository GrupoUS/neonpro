// Generate valid CNS test cases
function generateValidCNS() {
  // Generate definitive CNS (starts with 1 or 2)
  const definitiveCNS = []

  // CNS starting with 1
  const cns1 = [1]
  for (let i = 1; i < 14; i++) {
    cns1.push(Math.floor(Math.random() * 10))
  }

  // Calculate check digit for definitive CNS
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  let sum = 0
  for (let i = 0; i < 14; i++) {
    sum += cns1[i] * weights[i]
  }
  const remainder = sum % 11
  cns1.push(remainder === 0 ? 0 : 11 - remainder)

  definitiveCNS.push(cns1.join(''))

  // Generate provisional CNS (starts with 7, 8, or 9) - sum divisible by 11
  const provisionalCNS = []
  const firstDigits = [7, 8, 9]

  firstDigits.forEach((first) => {
    const cns = [first]
    let sum = first

    for (let i = 1; i < 14; i++) {
      const digit = Math.floor(Math.random() * 10)
      cns.push(digit)
      sum += digit
    }

    // Calculate last digit to make sum divisible by 11
    const remainder = sum % 11
    const lastDigit = remainder === 0 ? 0 : 11 - remainder
    cns.push(lastDigit)

    provisionalCNS.push(cns.join(''))
  })

  console.log('Valid definitive CNS:', definitiveCNS[0])
  console.log('Valid provisional CNS:', provisionalCNS)

  // Test the validation
  const validateCNS = (cns) => {
    const digits = cns.split('').map(Number)
    const firstDigit = digits[0]

    if (firstDigit === 1 || firstDigit === 2) {
      const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
      let sum = 0
      for (let i = 0; i < 15; i++) {
        sum += digits[i] * weights[i]
      }
      return sum % 11 === 0
    } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
      let sum = 0
      for (let i = 0; i < 15; i++) {
        sum += digits[i]
      }
      return sum % 11 === 0
    }
    return false
  }

  console.log('Validation results:')
  console.log(definitiveCNS[0], ':', validateCNS(definitiveCNS[0]))
  provisionalCNS.forEach((cns) => {
    console.log(cns, ':', validateCNS(cns))
  })
}

generateValidCNS()
