import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repositories } from '../../../data';
import type { ExamCatalogItem } from '../../../models/catalog';
import { useUserProgress } from '../../../context/UserProgressContext';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import StarRating from '../../../components/ui/StarRating';
import Avatar from '../../../components/ui/Avatar';
import LevelIndicator from '../../../components/ui/LevelIndicator';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useUserProgress();
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const items = await repositories.exam.getCatalog();
        setCatalog(items);
      } catch (err) {
        console.error('Error al cargar el catálogo de exámenes:', err);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  const subjects = [
    { id: 'all', name: 'Todos', icon: 'apps', color: 'text-primary' },
    { id: 'Matemáticas', name: 'Matemáticas', icon: 'calculate', color: 'text-primary-container' },
    { id: 'Ciencias', name: 'Ciencias', icon: 'pets', color: 'text-tertiary' },
    { id: 'Lectura', name: 'Lectura', icon: 'auto_stories', color: 'text-secondary' },
  ];

  const filteredCatalog = selectedSubject === 'all'
    ? catalog
    : catalog.filter(item => item.metadata.subject.toLowerCase() === selectedSubject.toLowerCase());

  if (progressLoading || loadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-outline font-bold text-lg select-none">Cargando tus aventuras...</p>
      </div>
    );
  }

  const { nickname, avatar, level, totalXP } = progress.profile;
  const currentStreak = progress.streaks?.currentStreak || 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Hero Panel */}
      <ClayCard className="bg-gradient-to-br from-primary-container to-primary text-white p-6 sm:p-8 relative overflow-hidden select-none border-none">
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-1/4 -top-12 w-28 h-28 bg-secondary-container/20 rounded-full blur-xl"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <Avatar id={avatar} size="lg" className="border-4 border-white/30 shadow-lg" />
            <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container font-black px-2.5 py-0.5 rounded-full text-xs shadow border border-white">
              Nivel {level}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black mb-1">¡Hola, {nickname || 'Explorador'}!</h1>
            <p className="text-white/80 font-bold text-sm sm:text-base mb-4">
              ¿Qué aprenderemos hoy? ¡Elige una aventura y gana XP!
            </p>
            <div className="max-w-md">
              <LevelIndicator />
            </div>
          </div>

          {/* Mini Stats Bento section */}
          <div className="flex gap-4 sm:flex-col shrink-0 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 sm:flex-initial flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <MaterialIcon name="local_fire_department" className="text-xl" />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/60 font-black uppercase">Racha</div>
                <div className="text-lg font-black">{currentStreak} {currentStreak === 1 ? 'Día' : 'Días'}</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 sm:flex-initial flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container shrink-0">
                <MaterialIcon name="emoji_events" className="text-xl" />
              </div>
              <div className="text-left">
                <div className="text-xs text-white/60 font-black uppercase">Total XP</div>
                <div className="text-lg font-black">{totalXP} XP</div>
              </div>
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Categories Filter Tabs */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 select-none">Categorías</div>
        <div className="flex flex-wrap gap-3">
          {subjects.map(sub => {
            const isActive = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`
                  px-4 py-2.5 rounded-2xl font-bold text-sm sm:text-base border-2 border-solid select-none transition-all duration-150 cursor-pointer
                  flex items-center gap-2 active:translate-y-[2px]
                  ${isActive
                    ? 'border-primary bg-primary text-white shadow-[0_4px_0_0_#222fc2]'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-outline text-on-surface shadow-[0_4px_0_0_#c6c5d7]'
                  }
                `}
              >
                <MaterialIcon name={sub.icon} className={isActive ? 'text-white' : sub.color} />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exams Grid */}
      <div className="flex flex-col gap-4">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 select-none">Aventuras Disponibles</div>
        
        {filteredCatalog.length === 0 ? (
          <ClayCard className="p-8 text-center text-outline select-none">
            <MaterialIcon name="search_off" className="text-4xl mb-2 text-outline/40" />
            <p className="font-bold text-lg">No encontramos exámenes en esta categoría por ahora.</p>
          </ClayCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCatalog.map(exam => {
              const examProgress = progress.examProgress[exam.id];
              const stars = examProgress?.bestStars || 0;
              const completed = (examProgress?.attempts || 0) > 0;
              
              // Level requirement check
              const isLocked = exam.unlockCondition?.type === 'level' && level < Number(exam.unlockCondition.value);
              const requiredLevel = exam.unlockCondition?.type === 'level' ? Number(exam.unlockCondition.value) : 0;

              const handleStart = () => {
                if (isLocked) return;
                navigate(`/exam/${exam.id}`);
              };

              return (
                <ClayCard 
                  key={exam.id} 
                  className={`
                    relative p-5 flex flex-col gap-4 transition-all duration-200 select-none
                    ${isLocked ? 'opacity-70 bg-surface-dim border-outline/30' : 'hover:scale-[1.01]'}
                  `}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-surface-dim/40 backdrop-blur-[2px] rounded-3xl z-10 flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-inverse-surface flex items-center justify-center text-inverse-on-surface shadow">
                        <MaterialIcon name="lock" className="text-2xl" />
                      </div>
                      <div className="font-black text-lg text-on-surface">Misión Bloqueada</div>
                      <div className="text-xs font-bold text-outline">
                        Alcanza el <span className="text-primary font-black">Nivel {requiredLevel}</span> para desbloquear esta aventura.
                      </div>
                    </div>
                  )}

                  {/* Top row: Subject Badge + XP badge */}
                  <div className="flex items-center justify-between">
                    <span className="bg-surface-container text-primary font-black px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <MaterialIcon name={exam.metadata.icon} className="text-sm" />
                      {exam.metadata.subject}
                    </span>
                    <span className="bg-secondary-container text-on-secondary-container font-black px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm">
                      <MaterialIcon name="insights" className="text-sm text-secondary animate-pulse" />
                      +{exam.rewards.xpReward} XP
                    </span>
                  </div>

                  {/* Middle row: Icon & Title & Description */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed/50 flex items-center justify-center text-primary shrink-0 shadow-inner">
                      <MaterialIcon name={exam.metadata.icon} className="text-3xl" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="font-black text-lg text-on-surface truncate">{exam.metadata.title}</h3>
                      <p className="text-outline text-sm font-medium line-clamp-2 mt-0.5">{exam.metadata.description}</p>
                    </div>
                  </div>

                  {/* Bottom details: Stars, difficulty, question count & Button */}
                  <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1">
                        <StarRating stars={stars} className="text-xl" />
                        {completed && stars === 0 && (
                          <span className="text-xs font-bold text-outline">(Completado)</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-outline flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <MaterialIcon name="quiz" className="text-xs text-outline/60" />
                          {exam.metadata.questionCount} pregs
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MaterialIcon name="schedule" className="text-xs text-outline/60" />
                          {exam.metadata.estimatedTime} min
                        </span>
                      </div>
                    </div>

                    <ChunkyButton
                      disabled={isLocked}
                      onClick={handleStart}
                      className="px-6 py-2 bg-secondary text-on-secondary font-black border-2 border-solid shadow-[0_4px_0_0_#725800]"
                    >
                      {completed ? 'Reintentar' : 'Empezar'}
                    </ChunkyButton>
                  </div>
                </ClayCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
