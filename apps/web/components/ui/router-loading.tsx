/**
 * ⏳ Router Loading Component - NeonPro Healthcare
 * ==============================================
 * 
 * Global loading component for route transitions
 * with healthcare-specific branding.
 */

'use client';

import React from 'react';
import { Heart } from 'lucide-react';

export function RouterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-pulse">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    </div>
  );
}