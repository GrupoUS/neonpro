/**
 * Root Page Component for NeonPro Healthcare API
 *
 * This is the main landing page for the API documentation and health checks.
 * Optimized for Brazilian healthcare compliance and edge runtime performance.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeonPro Healthcare API',
  description: 'Brazilian healthcare platform API - LGPD compliant and CFM certified',
  robots: 'noindex, nofollow', // API should not be indexed
};

export default function RootPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            NeonPro Healthcare API
          </h1>
          <p className='text-lg text-gray-600 mb-6'>
            Brazilian Healthcare Platform - LGPD Compliant & CFM Certified
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            <div className='p-4 bg-green-50 rounded-lg'>
              <h3 className='font-semibold text-green-800 mb-2'>
                Health Check
              </h3>
              <a
                href='/api/health/check'
                className='text-green-600 hover:text-green-800 underline'
              >
                /api/health/check
              </a>
            </div>

            <div className='p-4 bg-blue-50 rounded-lg'>
              <h3 className='font-semibold text-blue-800 mb-2'>
                API Documentation
              </h3>
              <a
                href='/api/docs'
                className='text-blue-600 hover:text-blue-800 underline'
              >
                /api/docs
              </a>
            </div>
          </div>

          <div className='text-sm text-gray-500'>
            <p>🏥 Healthcare Compliance: LGPD, CFM, ANVISA</p>
            <p>⚡ Edge Runtime Optimized</p>
            <p>🇧🇷 Brazilian Healthcare Standards</p>
          </div>
        </div>
      </div>
    </div>
  );
}
