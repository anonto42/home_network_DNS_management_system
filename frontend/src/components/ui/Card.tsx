import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm ${className}`}>
    {children}
  </div>
);
