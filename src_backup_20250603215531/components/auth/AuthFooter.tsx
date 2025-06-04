
import React from 'react';
import { Link } from 'react-router-dom';

export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p 
          className="text-sm text-muted-foreground mb-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span 
            className="font-semibold text-neon-brand"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            NEON PRO
          </span>{' '}
          © {currentYear} - Sistema Premium para Gestão de Clínicas de Estética
        </p>
        <div className="flex justify-center space-x-4 text-xs text-muted-foreground mt-2">
          <Link 
            to="/termos" 
            className="hover:text-accent transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Termos de Uso
          </Link>
          <Link 
            to="/privacidade" 
            className="hover:text-accent transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Política de Privacidade
          </Link>
          <a 
            href="mailto:suporte@neonpro.com.br" 
            className="hover:text-accent transition-colors duration-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Suporte
          </a>
        </div>
      </div>
    </footer>
  );
};
