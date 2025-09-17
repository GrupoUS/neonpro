import { describe, test } from 'vitest';
import { TempPatientDocumentService } from '../services/temp-patient-document-service';

describe('Temp Service Test', () => {
  test('should have getDocument method', () => {
    const service = new TempPatientDocumentService();
    console.log('Temp service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
    console.log('Has getDocument?', typeof service.getDocument === 'function');
    console.log('Has getFileContent?', typeof service.getFileContent === 'function');
  });
});