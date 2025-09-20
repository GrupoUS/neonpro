/**
 * Telemedicine Routes - Root Layout
 * CFM-compliant telemedicine platform with WebRTC integration
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Activity, Shield, Stethoscope, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/telemedicine')({
  component: TelemedicineLayout,
});

function TelemedicineLayout() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='container mx-auto px-4 py-6'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-600 rounded-lg'>
                <Stethoscope className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                  Telemedicina NeonPro
                </h1>
                <p className='text-gray-600 dark:text-gray-300'>
                  Plataforma CFM-compliant para consultas remotas
                </p>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className='flex items-center space-x-2'>
              <Badge
                variant='outline'
                className='bg-green-50 text-green-700 border-green-200'
              >
                <Shield className='h-3 w-3 mr-1' />
                CFM 2.314/2022
              </Badge>
              <Badge
                variant='outline'
                className='bg-blue-50 text-blue-700 border-blue-200'
              >
                <Users className='h-3 w-3 mr-1' />
                LGPD Compliant
              </Badge>
              <Badge
                variant='outline'
                className='bg-purple-50 text-purple-700 border-purple-200'
              >
                <Activity className='h-3 w-3 mr-1' />
                WebRTC HD
              </Badge>
            </div>
          </div>

          <Separator className='mt-4' />
        </div>

        {/* Main Content */}
        <div className='space-y-6'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
