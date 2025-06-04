
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Helmet>
        <title>Página Não Encontrada | NEON PRO</title>
      </Helmet>
      
      <div className="text-center p-6 max-w-md fade-in-up">
        <div className="w-20 h-20 rounded-full bg-light-gray/50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-gold" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold mb-2 text-dark-blue">404</h1>
        <h2 className="text-xl mb-4 text-medium-blue">Página não encontrada</h2>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Button asChild className="bg-gold hover:bg-gold/80 text-white">
          <a href="/">Voltar ao Dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
