import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err);
  
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message || 'Something went wrong',
      timestamp: new Date().toISOString(),
    },
    500
  );
};