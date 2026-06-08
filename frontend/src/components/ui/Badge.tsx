import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'tertiary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    error: 'bg-error-container text-on-error-container',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  };

  return (
    <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm uppercase ${variants[variant]}`}>
      {children}
    </span>
  );
};
