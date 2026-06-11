import React from 'react';
import { useUserProgress } from '../../../context/UserProgressContext';
import ClayCard from '../../../components/ui/ClayCard';
import MaterialIcon from '../../../components/ui/MaterialIcon';

interface QuestItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  currentProgress: number;
  targetProgress: number;
}

const QuestsPage: React.FC = () => {
  const { progress } = useUserProgress();
  const currentStreak = progress.streaks?.currentStreak || 0;
  const bestStreak = progress.streaks?.bestStreak || 0;
  
  // Calculate dynamic quest states based on user progress metrics
  const totalExams = progress.stats.totalExamsCompleted;
  const perfectExams = progress.stats.perfectExams;
  const totalXP = progress.profile.totalXP;

  const quests: QuestItem[] = [
    {
      id: 'quest-1',
      title: 'Primeros Pasos',
      description: 'Completa al menos 1 aventura de aprendizaje.',
      icon: 'explore',
      xpReward: 50,
      currentProgress: totalExams >= 1 ? 1 : 0,
      targetProgress: 1,
    },
    {
      id: 'quest-2',
      title: 'Mente Brillante',
      description: 'Logra al menos 1 examen con puntuación perfecta (100%).',
      icon: 'star',
      xpReward: 100,
      currentProgress: perfectExams >= 1 ? 1 : 0,
      targetProgress: 1,
    },
    {
      id: 'quest-3',
      title: 'Acumulador de XP',
      description: 'Alcanza un total de 500 XP en tu perfil.',
      icon: 'insights',
      xpReward: 150,
      currentProgress: Math.min(totalXP, 500),
      targetProgress: 500,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12 select-none">
      
      {/* 1. Study Streak Hero Panel */}
      <ClayCard className="p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        
        {/* Flame element */}
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-5xl shadow-lg shrink-0 animate-pulse">
          🔥
        </div>

        <div className="flex-1 text-left">
          <h1 className="text-xl sm:text-2xl font-black mb-1">Racha de Estudio</h1>
          <p className="text-white/90 text-sm font-bold leading-normal">
            {currentStreak === 0 
              ? '¡Comienza una aventura hoy para empezar tu racha! Estudia todos los días para mantenerla encendida.' 
              : `¡Llevas una racha de ${currentStreak} ${currentStreak === 1 ? 'día' : 'días'}! ¡Sigue así, campeón!`}
          </p>
          <div className="flex gap-4 mt-3 text-xs font-black text-white/80">
            <span>Racha actual: {currentStreak} 🔥</span>
            <span>•</span>
            <span>Mejor racha: {bestStreak} ⭐</span>
          </div>
        </div>
      </ClayCard>

      {/* 2. Quests List */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 text-left">Misiones de la Jornada</div>
        
        <div className="flex flex-col gap-4">
          {quests.map(quest => {
            const isCompleted = quest.currentProgress >= quest.targetProgress;
            const progressPercent = Math.round((quest.currentProgress / quest.targetProgress) * 100);

            return (
              <ClayCard
                key={quest.id}
                className={`
                  p-5 flex flex-col gap-3 transition-all duration-150 relative overflow-hidden
                  ${isCompleted 
                    ? 'border-emerald-500/50 bg-emerald-50/10' 
                    : 'border-outline-variant/60 bg-surface-container-lowest'
                  }
                `}
              >
                {/* Completion tag overlay */}
                {isCompleted && (
                  <span className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full select-none flex items-center gap-0.5 shadow-sm border border-emerald-300/30">
                    <MaterialIcon name="check_circle" className="text-xs text-emerald-600" />
                    Listo
                  </span>
                )}

                <div className="flex gap-4 items-start pr-16 text-left">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border
                    ${isCompleted 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300/40' 
                      : 'bg-primary-fixed/40 text-primary border-primary-fixed-dim/20'
                    }
                  `}>
                    <MaterialIcon name={quest.icon} className="text-2xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base text-on-surface truncate">{quest.title}</h3>
                    <p className="text-outline text-xs font-semibold leading-relaxed mt-0.5">{quest.description}</p>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between items-center text-xs font-black text-outline">
                    <span>Progreso</span>
                    <span className="font-mono">
                      {quest.currentProgress} / {quest.targetProgress} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden border border-outline-variant/30 relative">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`
                        h-full rounded-full transition-all duration-300
                        ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}
                      `}
                    />
                  </div>
                </div>

                {/* Rewards footer info */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 mt-1">
                  <span className="text-xs text-outline font-bold">Recompensa</span>
                  <span className={`
                    font-black text-xs px-2.5 py-0.5 rounded-full border border-solid shadow-sm
                    ${isCompleted 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim'
                    }
                  `}>
                    +{quest.xpReward} XP
                  </span>
                </div>
              </ClayCard>
            );
          })}
        </div>
      </div>

      {/* Motivational Bottom Quote */}
      <ClayCard className="p-4 bg-surface-container/30 border border-outline-variant/30 text-center text-xs text-outline font-bold italic">
        "El aprendizaje es como un viaje espacial: ¡cada paso te acerca a las estrellas! 🚀🌌"
      </ClayCard>

    </div>
  );
};

export default QuestsPage;
