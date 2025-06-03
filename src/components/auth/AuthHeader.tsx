
import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

export const AuthHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center my-6 px-6">
      <Link 
        to="/" 
        className="group flex items-center space-x-3 transition-transform hover:scale-105" 
        aria-label="NEON PRO - Voltar para a página inicial"
      >
        {/* Ícone hexagonal NEON PRO */}
        <div className="relative">
          <svg 
            viewBox="0 0 32 32" 
            className="w-12 h-12 group-hover:glow-neon-intense transition-all duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="neon-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F5FF"/>
                <stop offset="100%" stopColor="#00FA9A"/>
              </linearGradient>
            </defs>
            <polygon 
              points="16,4 28,12 28,20 16,28 4,20 4,12" 
              fill="none" 
              stroke="url(#neon-gradient-header)" 
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            <circle 
              cx="16" 
              cy="16" 
              r="6" 
              fill="url(#neon-gradient-header)"
              className="group-hover:animate-pulse-neon"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neon-brand group-hover:animate-gradient-shift transition-all duration-300">
            NEON PRO
          </h1>
          <span className="text-xs text-neon-subtitle">
            Gestão Premium
          </span>
        </div>
      </Link>
      
      {/* Toggle de Tema */}
      <ThemeToggle />
    </div>
  );
};
