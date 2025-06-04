
import React from 'react';
import { Button } from '@/components/ui/button';

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onClick, 
  isLoading 
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className="w-full h-12 bg-card hover:bg-accent/10 border-border text-foreground hover:text-accent transition-all duration-300"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        alt="Google" 
        className="w-5 h-5 mr-3" 
      />
      Continuar com Google
    </Button>
  );
};
