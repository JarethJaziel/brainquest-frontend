import React from 'react';
import MaterialIcon from './MaterialIcon';

interface StarRatingProps {
  stars: number; // 0 to 3
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  size = 'md',
  className = '',
}) => {
  const starsArray = [1, 2, 3];

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex items-center justify-center gap-1 select-none ${className}`}>
      {starsArray.map(starVal => {
        const isFilled = starVal <= stars;
        return (
          <MaterialIcon
            key={starVal}
            name="star"
            filled={isFilled}
            className={`
              transition-all duration-300
              ${sizeClasses[size]}
              ${isFilled ? 'text-secondary-fixed-dim scale-110 drop-shadow-sm' : 'text-outline-variant'}
            `}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
