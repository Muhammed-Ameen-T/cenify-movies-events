import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  name, 
  size = 'md' 
}) => {
  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  return (
    <div className={`relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-white font-medium ${sizeClasses[size]}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling!.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`absolute inset-0 flex items-center justify-center ${src ? 'hidden' : 'flex'}`}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default Avatar;