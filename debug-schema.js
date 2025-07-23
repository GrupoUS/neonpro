// Debug file to check schema
const { stockAlertConfigSchema } = require('./app/lib/types/stock-alerts.ts');

console.log('Type of stockAlertConfigSchema:', typeof stockAlertConfigSchema);
console.log('stockAlertConfigSchema:', stockAlertConfigSchema);
console.log('Has omit method:', typeof stockAlertConfigSchema?.omit);