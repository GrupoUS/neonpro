import { validateCPF } from './src/schemas/healthcare-validation-schemas'

const testInputs = [undefined, null, '', '123', '1234567890', '12345678901', '11111111111']

testInputs.forEach((input) => {
  try {
    console.log(`\nInput: ${input} (${typeof input})`)
    const result = validateCPF(input as string)
    console.log(`Result: ${result}`)
  } catch (e) {
    console.log(`Error for input "${input}": ${e.message}`)
    console.log(`Stack: ${e.stack}`)
  }
})
