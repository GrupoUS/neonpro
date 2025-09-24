import { validateCPF } from './src/schemas/healthcare-validation-schemas'

const testInputs = [undefined, null, '', '123', '1234567890', '12345678901', '11111111111']

testInputs.forEach((input) => {
  try {
    console.warn(`\nInput: ${input} (${typeof input})`)
    const result = validateCPF(input as string)
    console.warn(`Result: ${result}`)
  } catch (e) {
    console.warn(`Error for input "${input}": ${e.message}`)
    console.warn(`Stack: ${e.stack}`)
  }
})
