// Polyfill for iceberg-js (Node.js only analytics library)
// This module is not needed in browser environments
// Provide mock implementations for browser compatibility

export class IcebergRestCatalog {
  constructor() {}
  async createTable() { return null }
  async loadTable() { return null }
  async dropTable() { return null }
  async listTables() { return [] }
}

export default {
  IcebergRestCatalog
}
