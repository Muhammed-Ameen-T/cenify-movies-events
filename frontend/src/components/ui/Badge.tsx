import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default', 
  size = 'md' 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    default: 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
  };

  return (
    <span className={`
      inline-flex items-center justify-center rounded-full font-medium
      ${sizeClasses[size]} 
      ${variantClasses[variant]}
    `}>
      {label}
    </span>
  );
};

export default Badge;