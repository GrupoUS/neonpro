// Minimal shim for file-saver to satisfy CI builds on Vercel.
// Provides a no-op implementation of saveAs that logs a warning.

export function saveAs(
  _data: Blob | File | string,
  _filename?: string,
  _options?: any,
) {
  if (typeof window !== 'undefined') {
    console.warn(
      '[shim:file-saver] saveAs called in browser environment. Implement real saver if needed.',
    );
  } else {
    console.warn(
      '[shim:file-saver] saveAs called in non-browser environment; ignoring.',
    );
  }
}

export default { saveAs };
