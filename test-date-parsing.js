// Test Date parsing outside of Jest
console.log('=== Date Parsing Test ===');

const dateStr1 = "2025-01-01";
const dateStr2 = "2025-01-02";

console.log('Input strings:');
console.log('- dateStr1:', dateStr1);
console.log('- dateStr2:', dateStr2);

console.log('\nDate parsing results:');
const date1 = new Date(dateStr1);
const date2 = new Date(dateStr2);

console.log('- new Date(dateStr1):', date1);
console.log('- new Date(dateStr2):', date2);

console.log('\nDate comparison:');
console.log('- date1 < date2:', date1 < date2);
console.log('- date1.getTime():', date1.getTime());
console.log('- date2.getTime():', date2.getTime());

console.log('\nCurrent date for reference:');
console.log('- new Date():', new Date());