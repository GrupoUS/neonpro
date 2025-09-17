import { Hono } from 'hono';
import bulkActions from './bulk';
import createPatient from './create';
import deletePatient from './delete';
import { patientsExportRouter } from './export';
import getPatient from './get';
import getPatientHistory from './history';
import listPatients from './list';
import searchPatients from './search';
import updatePatient from './update';

const patientsRouter = new Hono();
// Documents upload endpoint placeholder added via documents-upload route above
import documentsUpload from './documents-upload'; // POST /patients/:id/documents
patientsRouter.route('/patients', documentsUpload);

// Mount patient endpoints
patientsRouter.route('/patients', listPatients); // GET /patients
patientsRouter.route('/patients', createPatient); // POST /patients
patientsRouter.route('/patients', getPatient); // GET /patients/:id
patientsRouter.route('/patients', updatePatient); // PUT /patients/:id
patientsRouter.route('/patients', deletePatient); // DELETE /patients/:id
patientsRouter.route('/patients/search', searchPatients); // GET /patients/search
patientsRouter.route('/patients', getPatientHistory); // GET /patients/:id/history
patientsRouter.route('/patients/bulk-actions', bulkActions); // POST /patients/bulk-actions
patientsRouter.route('/patients', patientsExportRouter); // Export endpoints

export default patientsRouter;
