import fs from 'fs'
import path from 'path'

const servicesPath = path.join(__dirname, '../../../../src')
const filePath = path.join(servicesPath, 'ai-provider-router-new.ts')

console.warn('Checking file:', filePath)
console.warn('File exists:', fs.existsSync(filePath))

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lineCount = content.split('\n').length
  console.warn('Line count:', lineCount)
  console.warn('Should be <= 1000:', lineCount <= 1000)

  // This should fail
  if (lineCount > 1000) {
    console.warn('❌ Test should fail - file is too large')
    process.exit(1)
  } else {
    console.warn('✅ Test would pass')
  }
} else {
  console.warn('❌ File does not exist')
  process.exit(1)
}
