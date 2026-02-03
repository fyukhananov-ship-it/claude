import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  const paddingSizes = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-card-hover active:scale-[0.99] tap-highlight-none' : ''}
        ${paddingSizes[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
