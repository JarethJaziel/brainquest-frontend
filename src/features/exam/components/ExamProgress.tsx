import React from 'react';
import ProgressBar from '../../../components/ui/ProgressBar';
import MaterialIcon from '../../../components/ui/MaterialIcon';

interface ExamProgressProps {
  current: number; // Answered questions count
  total: number;   // Total questions count
  currentIndex: number; // Current active question index (0-based)
  timeLeft?: number; // in seconds
}

export const ExamProgress: React.FC<ExamProgressProps> = ({
  current,
  total,
  currentIndex,
  timeLeft,
}) => {
  // Format seconds as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLowTime = timeLeft !== undefined && timeLeft <= 15;

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-2xl border-2 border-outline-variant shadow-sm select-none">
      {/* ProgressBar and Position Text */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <ProgressBar value={current} max={total} mascotIcon="child_care" />
        </div>
        <span className="text-sm font-black text-outline whitespace-nowrap shrink-0 bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant">
          Pregunta {currentIndex + 1} de {total}
        </span>
      </div>

      {/* Timer Display */}
      {timeLeft !== undefined && (
        <div
          className={`
            flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 font-black text-sm shrink-0 transition-all justify-center
            ${isLowTime
              ? 'bg-red-50 border-red-300 text-red-600 animate-pulse scale-105'
              : 'bg-surface-container-lowest border-outline-variant text-outline'}
          `}
        >
          <MaterialIcon name="schedule" className={isLowTime ? 'text-red-500' : ''} />
          <span className="font-mono text-base">{formatTime(timeLeft)}</span>
        </div>
      )}
    </div>
  );
};

export default ExamProgress;
