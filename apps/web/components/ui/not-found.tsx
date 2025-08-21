/**
 * 🔍 Not Found Component - NeonPro Healthcare
 * ==========================================
 * 
 * 404 page for routes that don't exist
 * with helpful navigation options.
 */

'use client';

import React from 'react';
import { Link } from '@tanstack/react-router';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi removida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
          </Button>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Se você acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}