// Debug CNS validation
const { calculateCNSChecksum } = require('./dist/index.js')

console.log('Testing CNS checksum calculation:')
const testCNS = ['170185783640008', '248596394670018', '712345678901234', '898765432109876']

testCNS.forEach((cns) => {
  const result = calculateCNSChecksum(cns)
  console.log(`${cns}: ${result}`)

  // Let's also manually calculate
  const digits = cns.split('').map(Number)
  const firstDigit = digits[0]
  console.log(`  First digit: ${firstDigit}`)

  if (firstDigit === 1 || firstDigit === 2) {
    const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    let sum = 0
    for (let i = 0; i < 15; i++) {
      sum += digits[i] * weights[i]
    }
    const remainder = sum % 11
    console.log(`  Definitive CNS: sum=${sum}, remainder=${remainder}`)
  } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
    let sum = 0
    for (let i = 0; i < 15; i++) {
      sum += digits[i]
    }
    const remainder = sum % 11
    console.log(`  Provisional CNS: sum=${sum}, remainder=${remainder}`)
  }
})
