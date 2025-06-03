import React from 'react';
import { Link } from 'react-router-dom';

export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p 
          className="text-sm text-sacha-blue dark:text-sacha-gray-medium mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span 
            className="font-semibold text-sacha-dark-blue dark:text-sacha-gray-light"
            style={{ fontFamily: 'Optima, Arial, sans-serif' }}
          >
            NEON PRO
          </span>{' '}
          © {currentYear} - Universo da Sacha - Sistema Premium para Gestão de Clínicas de Estética
        </p>
        <div className="flex justify-center space-x-4 text-xs text-sacha-gray-medium dark:text-sacha-gray-medium/80 mt-2">
          <Link 
            to="/termos" 
            className="hover:text-sacha-gold transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Termos de Uso
          </Link>
          <Link 
            to="/privacidade" 
            className="hover:text-sacha-gold transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Política de Privacidade
          </Link>
          <a 
            href="mailto:contato@universosacha.com.br" 
            className="hover:text-sacha-gold transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Suporte
          </a>
        </div>
      </div>
    </footer>
  );
};
