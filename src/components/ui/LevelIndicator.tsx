import React from 'react';
import { useUserProgress } from '../../context/UserProgressContext';

export const LevelIndicator: React.FC = () => {
  const { progress } = useUserProgress();
  const { level, currentXP, xpToNextLevel } = progress.profile;
  const pct = Math.min(100, Math.round((currentXP / xpToNextLevel) * 100));

  return (
    <div className="flex flex-col gap-2 p-4 bg-surface-container rounded-2xl border-2 border-outline-variant select-none">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg text-primary">Nivel {level}</span>
        <span className="text-xs text-outline font-semibold font-mono">
          {currentXP} / {xpToNextLevel} XP
        </span>
      </div>
      <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant p-[1px]">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default LevelIndicator;
