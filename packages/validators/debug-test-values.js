// Debug test values for validation functions
const { validateTUSS, validateProfessionalLicense } = require('./dist/index.js')

console.log('Testing problematic values:')

// Test TUSS with null and undefined
console.log('TUSS validation:')
console.log('null:', validateTUSS(null))
console.log('undefined:', validateTUSS(undefined))
console.log('"null":', validateTUSS('null'))
console.log('"undefined":', validateTUSS('undefined'))

// Test Professional License with null and undefined
console.log('\nProfessional License validation:')
console.log('null:', validateProfessionalLicense(null))
console.log('undefined:', validateProfessionalLicense(undefined))
console.log('"null":', validateProfessionalLicense('null'))
console.log('"undefined":', validateProfessionalLicense('undefined'))
