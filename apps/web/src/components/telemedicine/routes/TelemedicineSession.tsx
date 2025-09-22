/**
 * Telemedicine Session Component
 * Manages individual video consultation sessions with real-time WebRTC communication
 */

import { useNavigate } from '@tanstack/react-router';
import { Activity } from 'lucide-react';
import React from 'react';

import { VideoConsultation } from '@/components/telemedicine/VideoConsultation';

export function TelemedicineSession() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  // Loading state
  if (!sessionId) {
    return (
      <div className='h-screen flex items-center justify-center bg-gray-900 text-white'>
        <div className='text-center'>
          <Activity className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Show enhanced VideoConsultation component with WebRTC integration
  return (
    <VideoConsultation
      sessionId={sessionId}
      onSessionEnd={() => navigate({ to: '/telemedicine' })}
      className='h-screen'
    />
  );
}
