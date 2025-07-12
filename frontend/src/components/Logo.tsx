import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-8 w-auto',
    medium: 'h-12 w-auto',
    large: 'h-16 w-auto'
  };

  return (
    <img
      src="/lakra.svg"
      alt="Lakra Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo; 