import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProgress } from '../context/UserProgressContext';
import { useAudio } from '../context/AudioContext';
import Avatar from '../components/ui/Avatar';
import MaterialIcon from '../components/ui/MaterialIcon';

export const Header: React.FC = () => {
  const { progress } = useUserProgress();
  const { soundEnabled, toggleSound } = useAudio();

  const { nickname, avatar, level, currentXP, xpToNextLevel } = progress.profile;
  const streak = progress.streaks?.currentStreak || 0;
  
  const xpPercentage = Math.min(100, Math.round((currentXP / xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b-2 border-outline-variant px-4 py-3 shadow-sm">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
        {/* User Profile Summary */}
        <Link to="/profile" className="flex items-center gap-3 group">
          <Avatar id={avatar} size="sm" interactive className="group-hover:scale-105" />
          <div className="hidden sm:block text-left">
            <div className="font-bold text-on-surface text-base group-hover:text-primary transition-colors leading-tight">
              {nickname}
            </div>
            <div className="text-xs text-outline leading-tight">Ver Perfil</div>
          </div>
        </Link>

        {/* Global XP Level Progress Bar */}
        <div className="flex-1 max-w-md flex items-center gap-3">
          <div className="flex flex-col items-end shrink-0">
            <span className="font-bold text-sm text-primary">Nivel {level}</span>
            <span className="text-[10px] text-outline font-semibold">
              {currentXP}/{xpToNextLevel} XP
            </span>
          </div>
          <div className="flex-1 h-5 bg-surface-container-high rounded-full overflow-hidden border-2 border-outline-variant p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500 ease-out"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Controls & Streaks */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Streak Indicator */}
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 font-bold text-sm transition-colors ${
              streak > 0
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-surface-container-lowest border-outline-variant text-outline/50'
            }`}
            title={`${streak} días en racha`}
          >
            <MaterialIcon name="local_fire_department" filled={streak > 0} className={streak > 0 ? 'text-amber-500' : ''} />
            <span>{streak}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-xl cursor-pointer hover:bg-surface-container-low transition-all active:scale-95 ${
              soundEnabled
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-surface-container-lowest border-outline-variant text-outline'
            }`}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            <MaterialIcon name={soundEnabled ? 'volume_up' : 'volume_off'} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
