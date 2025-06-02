
import React from 'react';
import { Link } from 'react-router-dom';

export const AuthFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-500 mb-2">
          NEON PRO © {currentYear} - Sistema Premium para Gestão de Clínicas de Estética
        </p>
        <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-2">
          <Link to="/termos" className="hover:text-gold transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-gold transition-colors">Política de Privacidade</Link>
          <a href="mailto:contato@neonpro.com.br" className="hover:text-gold transition-colors">Suporte</a>
        </div>
      </div>
    </footer>
  );
};
