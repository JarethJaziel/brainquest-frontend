import React from 'react';
import MaterialIcon from './MaterialIcon';

interface ProgressBarProps {
  value: number;
  max: number;
  showMascot?: boolean;
  mascotIcon?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showMascot = true,
  mascotIcon = 'smart_toy',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full flex items-center gap-3 relative select-none ${className}`}>
      {/* Track */}
      <div className="flex-1 h-6 bg-surface-container-high rounded-full overflow-visible border-2 border-outline-variant p-[2px] relative">
        {/* Fill */}
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Moving Mascot overlay */}
        {showMascot && max > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 ease-out"
            style={{ left: `${percentage}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-secondary text-secondary flex items-center justify-center shadow-md animate-pulse">
              <MaterialIcon name={mascotIcon} className="text-lg" />
            </div>
          </div>
        )}
      </div>

      {/* Progress text */}
      <span className="font-extrabold text-sm text-outline shrink-0 font-mono">
        {value}/{max}
      </span>
    </div>
  );
};

export default ProgressBar;
