
import React from 'react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center space-y-3">
      <h1 
        className="text-3xl font-bold text-gradient-neon text-foreground"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {title}
      </h1>
      <p 
        className="text-muted-foreground text-base leading-relaxed"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {subtitle}
      </p>
    </div>
  );
};
