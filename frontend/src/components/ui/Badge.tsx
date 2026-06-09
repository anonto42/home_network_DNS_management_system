import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'tertiary';
  dot?: 'primary' | 'secondary' | 'error' | 'tertiary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', dot }) => {
  const variants: Record<string, string> = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    error: 'bg-error-container text-on-error-container',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  };

  const dots: Record<string, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    error: 'bg-error',
    tertiary: 'bg-tertiary',
  };

  return (
    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm uppercase ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[dot]} mr-2`} />}
      {children}
    </span>
  );
};
