// Debug script for CNS validation
import { validateCNS } from './src/index';

const testCNS = [
  '184959687370903', // Should be valid CNS starting with 1 (definitive)
  '248596394670018', // Should be valid CNS starting with 2 (definitive)
  '767402594810076', // Should be valid CNS starting with 7 (provisional)
  '850319575733759', // Should be valid CNS starting with 8 (provisional)
];

console.log('=== CNS Validation Debug ===');
testCNS.forEach((cns, index) => {
  const isValid = validateCNS(cns);
  console.log(`${index + 1}. CNS: ${cns} -> Valid: ${isValid}`);

  // Let's manually check the checksum calculation
  const digits = cns.split('').map(Number);
  const firstDigit = digits[0];
  console.log(`   First digit: ${firstDigit}`);

  if (firstDigit === 1 || firstDigit === 2) {
    const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      if (digits[i] !== undefined && weights[i] !== undefined) {
        sum += digits[i]! * weights[i]!;
      }
    }
    const remainder = sum % 11;
    console.log(
      `   Definitive CNS - Sum: ${sum}, Remainder: ${remainder}, Valid: ${remainder === 0}`,
    );
  } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      if (digits[i] !== undefined) {
        sum += digits[i]!;
      }
    }
    const remainder = sum % 11;
    console.log(
      `   Provisional CNS - Sum: ${sum}, Remainder: ${remainder}, Valid: ${remainder === 0}`,
    );
  }
  console.log('');
});
