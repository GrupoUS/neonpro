# Types Folder — Barrel Exports

This folder centralizes TypeScript types for the web app. Some files are placeholders during MVP and intentionally export nothing (e.g., `export {}`) to keep barrel exports stable without duplicate symbol errors.

Guidelines:

- If you add real types to a placeholder file, keep names unique across modules.
- Avoid re-exporting the same symbol name from multiple sibling modules.
- Update `types/index.ts` when new type modules are added.
