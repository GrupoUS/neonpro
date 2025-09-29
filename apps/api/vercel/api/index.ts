/**
 * Main Vercel API Entry Point
 * Uses the hybrid router to route between Edge and Node runtimes
 */

import { hybridHandler } from '../../src/hybrid-router'

export default hybridHandler