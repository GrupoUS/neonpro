import { describe, test } from 'vitest';
import { PatientDocumentService } from '../services/patient-document-service';

describe('Debug Service Import',() => {
  test('should import service correctly',() => {
<<<<<<< HEAD
    console.log('PatientDocumentService:', PatientDocumentService
=======
    console.log('PatientDocumentService:', PatientDocumentService);
>>>>>>> origin/main
    console.log(
      'typeof PatientDocumentService:',
      typeof PatientDocumentService,
    

<<<<<<< HEAD
    const service = new PatientDocumentService(
    console.log('_service:', _service
    console.log('service.constructor.name:', service.constructor.name
=======
    const service = new PatientDocumentService();
    console.log('_service:', _service);
    console.log('service.constructor.name:', service.constructor.name);
>>>>>>> origin/main
    console.log(
      'Object.getOwnPropertyNames(service):',
      Object.getOwnPropertyNames(service),
    
    console.log(
      'Object.getOwnPropertyNames(Object.getPrototypeOf(service)):',
      Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
    

    // Check what methods exist
    console.log(
      'service.uploadPatientDocument:',
      service.uploadPatientDocument,
    
    console.log('service.getDocument:', service.getDocument
    console.log('service.getFileContent:', service.getFileContent
