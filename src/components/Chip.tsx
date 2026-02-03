import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  onClick?: () => void;
  active?: boolean;
}

export function Chip({
  children,
  variant = 'default',
  icon,
  size = 'md',
  onClick,
  active = false,
}: ChipProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5 font-medium
    rounded-full whitespace-nowrap transition-all duration-200
  `;

  const variants = {
    default: active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-600',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${onClick ? 'cursor-pointer tap-highlight-none' : ''}`}
      onClick={onClick}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </Component>
  );
}
