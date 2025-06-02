
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthHeader: React.FC = () => {
  return (
    <div className="flex justify-center my-6">
      <Link to="/" className="group flex items-center space-x-3 transition-transform hover:scale-105" aria-label="NEON PRO - Voltar para a página inicial">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-dark-blue group-hover:text-gold transition-colors">NEON PRO</h1>
      </Link>
    </div>
  );
};
