/**
 * NeonPro UI Package
 * Shared UI components for healthcare platform
 */

// Button component
export const Button = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

// Healthcare specific styling
export const HealthcareTheme = {
  colors: {
    primary: '#0070f3',
    secondary: '#7c3aed', 
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

// Export placeholder for now
export default { Button, HealthcareTheme };