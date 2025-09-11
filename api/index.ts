// Vercel API Entry Point
// This file exports the Hono app for Vercel's automatic function conversion
// Following the official Hono + Vercel deployment pattern

import app from '../apps/api/src/app';

// Per Vercel’s Hono guide, export the Hono app as the default export.
// Vercel will treat routes defined on this app as Functions automatically.
export default app;
