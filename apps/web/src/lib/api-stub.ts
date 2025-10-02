// Stub API implementation for build purposes
export const api = {
  appointment: {
    getAll: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
    getMedicalHistory: () => Promise.resolve([]),
    addMedicalRecord: () => Promise.resolve({}),
    updateMedicalRecord: () => Promise.resolve({}),
    deleteMedicalRecord: () => Promise.resolve({}),
  },
  patient: {
    getAll: () => Promise.resolve([]),
    getMedicalHistory: () => Promise.resolve([]),
    addMedicalRecord: () => Promise.resolve({}),
    updateMedicalRecord: () => Promise.resolve({}),
    deleteMedicalRecord: () => Promise.resolve({}),
  },
  professional: {
    getAll: () => Promise.resolve([]),
  },
  clinic: {
    getAll: () => Promise.resolve([]),
  },
  schedule: {
    getAll: () => Promise.resolve([]),
  },
  treatment: {
    getAll: () => Promise.resolve([]),
  },
  auth: {
    login: () => Promise.resolve({}),
    logout: () => Promise.resolve({}),
    register: () => Promise.resolve({}),
  },
  payment: {
    getAll: () => Promise.resolve([]),
  },
  notification: {
    getAll: () => Promise.resolve([]),
  },
  reporting: {
    getAll: () => Promise.resolve([]),
  },
}