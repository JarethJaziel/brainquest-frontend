import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        clay-card p-6 select-none
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverable ? 'hover:scale-[1.01] hover:-translate-y-1 active:scale-[0.99] transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ClayCard;
