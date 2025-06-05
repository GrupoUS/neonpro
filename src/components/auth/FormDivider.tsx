
import React from 'react';

interface FormDividerProps {
  text: string;
}

export const FormDivider: React.FC<FormDividerProps> = ({ text }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span 
          className="bg-card px-4 text-muted-foreground font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
