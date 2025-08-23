// Debug import - check what's actually being imported
try {
  const { ApiHelpers } = require('./packages/shared/src/api-client.ts');
  
  console.log("Successfully imported ApiHelpers");
  console.log("Type:", typeof ApiHelpers);
  console.log("Keys:", Object.keys(ApiHelpers));
  console.log("formatError test:", ApiHelpers.formatError({ message: "test" }));
  console.log("createQueryKey exists:", typeof ApiHelpers.createQueryKey);
  
} catch (error) {
  console.error("Import failed:", error.message);
  
  // Try direct dynamic import
  import('./packages/shared/src/api-client.ts').then(module => {
    console.log("Dynamic import successful");
    console.log("Module keys:", Object.keys(module));
    if (module.ApiHelpers) {
      console.log("ApiHelpers keys:", Object.keys(module.ApiHelpers));
    }
  }).catch(err => {
    console.error("Dynamic import failed:", err.message);
  });
}