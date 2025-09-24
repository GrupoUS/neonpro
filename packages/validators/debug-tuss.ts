// Debug script for TUSS validation
import { validateTUSS } from './src/index';

const testTUSS = [
  "101010", // 6 digits - should be valid
  "2010101", // 7 digits - should be valid  
  "20101010", // 8 digits - should be valid
  "3010101010", // 10 digits - should be valid
  "010101", // starts with 0 - should be invalid
  "null", // string "null" - should be invalid
  "undefined", // string "undefined" - should be invalid
];

console.log("=== TUSS Validation Debug ===");
testTUSS.forEach((tuss, index) => {
  const isValid = validateTUSS(tuss);
  console.log(`${index + 1}. TUSS: "${tuss}" -> Valid: ${isValid}`);
  
  const cleanTUSS = tuss.replace(/[^\d]/g, "");
  const validLengths = [5, 6, 8, 10];
  const hasValidLength = validLengths.includes(cleanTUSS.length);
  const isNumeric = /^\d+$/.test(cleanTUSS);
  
  console.log(`   Clean: "${cleanTUSS}", Length: ${cleanTUSS.length}, Valid length: ${hasValidLength}, Numeric: ${isNumeric}`);
  console.log("");
});