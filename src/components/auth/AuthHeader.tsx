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
        {/* Símbolo US - Universo da Sacha */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sacha-gold to-sacha-gold/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
          <span 
            className="text-xl font-bold text-sacha-dark-blue tracking-wider" 
            style={{ fontFamily: 'Optima, Arial, sans-serif' }}
          >
            US
          </span>
        </div>
        <div className="flex flex-col">
          <h1 
            className="text-2xl font-bold text-sacha-dark-blue dark:text-sacha-gray-light group-hover:text-sacha-gold transition-colors duration-300" 
            style={{ fontFamily: 'Optima, Arial, sans-serif' }}
          >
            NEON PRO
          </h1>
          <span 
            className="text-xs text-sacha-blue dark:text-sacha-gray-medium opacity-80" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Universo da Sacha
          </span>
        </div>
      </Link>
      
      {/* Toggle de Tema */}
      <ThemeToggle />
    </div>
  );
};
