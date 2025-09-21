import { PatientDocumentService } from './src/services/patient-document-service.js';

console.log('Testing service methods directly...');

const service = new PatientDocumentService();

// Test if we can add the methods directly for debugging
(service as any).testMethod = function() {
  return 'test method works';
};

console.log('testMethod:', typeof (service as any).testMethod);
console.log('getDocument before adding:', typeof service.getDocument);

// Try to add the method manually
(service as any).getDocument = async function(
  documentId: string,
  _userId: string,
) {
  console.log('Manual getDocument called');
  return null;
};

console.log('getDocument after adding:', typeof (service as any).getDocument);
console.log(
  'All methods:',
  Object.getOwnPropertyNames(Object.getPrototypeOf(_service)),
);
