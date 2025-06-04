
import React from 'react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <h2 
        className="text-2xl font-bold text-foreground mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {title}
      </h2>
      <p 
        className="text-muted-foreground text-sm"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {subtitle}
      </p>
    </div>
  );
};
