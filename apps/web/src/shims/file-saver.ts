// Minimal shim for 'file-saver' to avoid build-time resolution issues on Vercel
// Exports a no-op saveAs function compatible with typical usage
export function saveAs(
  _data: Blob | File | string,
  _filename?: string,
  _options?: any,
) {
  // no-op in build environment
}
export default { saveAs };
