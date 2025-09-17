// Debug script to check service methods
const { PatientDocumentService } = require('./dist/services/patient-document-service.js');

console.log('Creating service instance...');
const service = new PatientDocumentService();

console.log('Service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
console.log('Has getDocument?', typeof service.getDocument === 'function');
console.log('Has getFileContent?', typeof service.getFileContent === 'function');
console.log('Has uploadPatientDocument?', typeof service.uploadPatientDocument === 'function');