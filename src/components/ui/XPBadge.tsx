import React from 'react';
import MaterialIcon from './MaterialIcon';

interface XPBadgeProps {
  amount: number;
  showPlus?: boolean;
  className?: string;
}

export const XPBadge: React.FC<XPBadgeProps> = ({
  amount,
  showPlus = true,
  className = '',
}) => {
  return (
    <div
      className={`
        inline-flex items-center gap-1 bg-gradient-to-r from-primary-container to-primary
        text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full border border-solid border-primary-fixed-dim shadow-sm
        select-none ${className}
      `}
    >
      <MaterialIcon name="bolt" className="text-sm text-yellow-300" filled />
      <span>
        {showPlus ? '+' : ''}
        {amount} XP
      </span>
    </div>
  );
};

export default XPBadge;
