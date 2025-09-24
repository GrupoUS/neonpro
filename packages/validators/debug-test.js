// Debug script to test validation functions
const { validateCNS, validateTUSS } = require('./dist/index.js')

console.log('Testing CNS validation:')
const testCNS = ['170185783640008', '248596394670018', '712345678901234', '898765432109876']
testCNS.forEach((cns) => {
  const result = validateCNS(cns)
  console.log(`${cns}: ${result}`)
})

console.log('\nTesting TUSS validation:')
const testTUSS = ['101010', '2010101', '20101010', '3010101010', '501010']
testTUSS.forEach((tuss) => {
  const result = validateTUSS(tuss)
  console.log(`${tuss}: ${result}`)
})
