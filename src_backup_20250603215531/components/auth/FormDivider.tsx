
import React from 'react';

interface FormDividerProps {
  text: string;
}

export const FormDivider: React.FC<FormDividerProps> = ({ text }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span 
          className="bg-background px-4 text-muted-foreground"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
