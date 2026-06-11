import React, { useState, useEffect } from 'react';
import { repositories } from '../../../data';
import { useUserProgress } from '../../../context/UserProgressContext';
import { ALL_ACHIEVEMENTS } from '../../../data/repositories/AchievementRepository';
import type { ExamResult } from '../../../models/scoring';
import type { ExamCatalogItem } from '../../../models/catalog';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import StarRating from '../../../components/ui/StarRating';
import Avatar, { AVATAR_MAP } from '../../../components/ui/Avatar';
import LevelIndicator from '../../../components/ui/LevelIndicator';

const AVATAR_OPTIONS = Object.keys(AVATAR_MAP);

const ProfilePage: React.FC = () => {
  const { progress, updateProfile, resetProgress } = useUserProgress();
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Profile Edit modal/inline state
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(progress.profile.nickname || '');
  const [editAvatar, setEditAvatar] = useState(progress.profile.avatar || '🤖');

  // Load history and exam catalog for mapping names
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingHistory(true);
        const results = await repositories.result.getAllResults();
        // Sort newest first
        const sortedResults = results.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        setHistory(sortedResults);

        const examCatalog = await repositories.exam.getCatalog();
        setCatalog(examCatalog);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) return;
    await updateProfile(editNickname.trim(), editAvatar);
    setIsEditing(false);
  };

  const handleReset = async () => {
    const confirm = window.confirm(
      '¿Estás seguro de que quieres reiniciar todo tu progreso? Esto borrará tu XP, nivel y todos tus logros guardados.'
    );
    if (confirm) {
      await resetProgress();
      setHistory([]);
      setEditNickname('Explorador');
      setEditAvatar('🤖');
      window.location.reload(); // Quick refresh to clear states
    }
  };

  // Helper to get exam title from id
  const getExamTitle = (examId: string) => {
    const exam = catalog.find(e => e.id === examId);
    return exam ? exam.metadata.title : 'Aventura desconocida';
  };

  // Format date strings
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format total seconds into hours and minutes
  const formatTimeSpent = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.round((secs % 3600) / 60);
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours}h ${mins}m`;
  };

  const { nickname, avatar, level, totalXP } = progress.profile;
  const stats = progress.stats;

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      
      {/* 1. Header Profile summary Card */}
      <ClayCard className="p-6 bg-gradient-to-r from-surface-container-low to-surface-container-high border-outline-variant/60 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <Avatar id={avatar} size="lg" className="border-4 border-primary/20 shadow" />
        
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editNickname}
                  maxLength={15}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="px-4 py-2 border-2 border-outline-variant rounded-2xl font-black text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary flex-1"
                  placeholder="Tu apodo..."
                />
                <ChunkyButton onClick={handleSaveProfile} color="success" className="px-4 py-2 text-sm">
                  Guardar
                </ChunkyButton>
                <ChunkyButton onClick={() => setIsEditing(false)} color="white" className="px-4 py-2 text-sm border-outline-variant">
                  X
                </ChunkyButton>
              </div>
              
              {/* Avatar options grid */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setEditAvatar(opt)}
                    className={`
                      w-10 h-10 rounded-xl border border-solid text-xl flex items-center justify-center cursor-pointer transition-all
                      ${editAvatar === opt ? 'bg-primary-fixed border-primary scale-110 shadow-sm' : 'bg-surface-container hover:bg-surface-container-high'}
                    `}
                  >
                    {AVATAR_MAP[opt]?.emoji || '🦊'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
              <h1 className="text-2xl font-black text-on-surface truncate">{nickname || 'Explorador'}</h1>
              <button
                onClick={() => {
                  setEditNickname(nickname);
                  setEditAvatar(avatar);
                  setIsEditing(true);
                }}
                className="w-8 h-8 rounded-full hover:bg-surface-container-highest text-outline hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
                title="Editar Perfil"
              >
                <MaterialIcon name="edit" className="text-lg" />
              </button>
            </div>
          )}

          <div className="font-extrabold text-sm text-outline flex items-center justify-center sm:justify-start gap-1">
            <span className="bg-primary/10 text-primary font-black px-2 py-0.5 rounded-md text-xs">Nivel {level}</span>
            <span>• {totalXP} XP totales ganadas</span>
          </div>

          <div className="w-full max-w-md mt-2">
            <LevelIndicator />
          </div>
        </div>
      </ClayCard>

      {/* 2. Global statistics Grid (Bento Style) */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 text-left">Tus Estadísticas</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <MaterialIcon name="emoji_events" className="text-secondary text-2xl" />
            <div className="text-xs text-outline font-bold">Completados</div>
            <div className="font-black text-base text-on-surface">{stats.totalExamsCompleted}</div>
          </ClayCard>

          <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <MaterialIcon name="grade" className="text-amber-500 text-2xl" filled />
            <div className="text-xs text-outline font-bold">Aventuras Perfectas</div>
            <div className="font-black text-base text-on-surface">{stats.perfectExams}</div>
          </ClayCard>

          <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <MaterialIcon name="schedule" className="text-tertiary text-2xl" />
            <div className="text-xs text-outline font-bold">Tiempo de Estudio</div>
            <div className="font-black text-base text-on-surface">{formatTimeSpent(stats.totalTimeSpent)}</div>
          </ClayCard>

          <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <MaterialIcon name="local_fire_department" className="text-red-500 text-2xl" />
            <div className="text-xs text-outline font-bold">Mejor Racha</div>
            <div className="font-black text-base text-on-surface">{stats.bestStreak} días</div>
          </ClayCard>
        </div>
      </div>

      {/* 3. Achievements list Grid */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 text-left">Logros de Exploración</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_ACHIEVEMENTS.map(ach => {
            const unlocked = progress.achievements.find(a => a.achievementId === ach.id);
            
            return (
              <ClayCard
                key={ach.id}
                className={`
                  p-4 flex items-center gap-4 transition-all duration-150 relative overflow-hidden
                  ${unlocked
                    ? 'border-secondary-container bg-surface-container-low'
                    : 'opacity-60 bg-surface-dim border-outline/20'
                  }
                `}
              >
                {/* Rarity Tag */}
                {unlocked && (
                  <span className={`absolute top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-inner ${
                    ach.rarity === 'legendary' ? 'bg-yellow-400 text-yellow-950' :
                    ach.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    ach.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : 'bg-surface-container text-outline'
                  }`}>
                    {ach.rarity}
                  </span>
                )}

                {/* Trophy/Achievement icon */}
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                  ${unlocked 
                    ? 'bg-secondary-container text-on-secondary-container border border-secondary-container' 
                    : 'bg-outline-variant/30 text-outline border border-outline-variant/20'
                  }
                `}>
                  <MaterialIcon name={unlocked ? ach.icon : 'lock'} className="text-2xl" />
                </div>

                {/* Title & Description */}
                <div className="text-left flex-1 min-w-0 pr-12">
                  <h4 className="font-black text-sm text-on-surface truncate">{ach.name}</h4>
                  <p className="text-xs text-outline font-medium line-clamp-2 mt-0.5 leading-snug">{ach.description}</p>
                  {unlocked && (
                    <div className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-1 select-none">
                      <MaterialIcon name="check_circle" className="text-[10px] shrink-0" />
                      Desbloqueado el {new Date(unlocked.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Award badge */}
                <span className={`
                  font-black text-xs px-2.5 py-0.5 rounded-full shrink-0 border border-solid shadow-sm
                  ${unlocked 
                    ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim' 
                    : 'bg-surface-container text-outline border-outline-variant/30'
                  }
                `}>
                  +{ach.xpReward} XP
                </span>
              </ClayCard>
            );
          })}
        </div>
      </div>

      {/* 4. History List attempts */}
      <div className="flex flex-col gap-3">
        <div className="text-sm font-black text-outline uppercase tracking-wider pl-1 text-left">Historial de Intentos</div>
        
        {loadingHistory ? (
          <div className="text-center py-6 text-outline font-bold text-sm">Cargando tu historial...</div>
        ) : history.length === 0 ? (
          <ClayCard className="p-8 text-center text-outline">
            <MaterialIcon name="history_toggle_off" className="text-4xl mb-2 text-outline/40" />
            <p className="font-bold text-sm">Todavía no has realizado ningún examen. ¡Empieza tu primera aventura!</p>
          </ClayCard>
        ) : (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {history.map(attempt => {
              return (
                <div
                  key={attempt.id}
                  className="p-4 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-2xl shadow-sm hover:border-outline-variant/80 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-black text-base text-on-surface truncate">
                      {getExamTitle(attempt.examId)}
                    </h4>
                    <div className="text-xs font-bold text-outline mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span>{formatDate(attempt.startedAt)}</span>
                      <span>•</span>
                      <span>Tiempo: {formatTimeSpent(attempt.totalTime)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <StarRating stars={attempt.score.stars} className="text-sm" />
                      <span className={`font-mono font-black text-sm ml-1 ${attempt.score.passed ? 'text-emerald-600' : 'text-error'}`}>
                        {attempt.score.percentage}%
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      attempt.score.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {attempt.score.passed ? 'Aprobado' : 'Reprobado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Reset progress button section */}
      <div className="flex justify-center border-t border-outline-variant/30 pt-6 mt-4">
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-50 hover:bg-red-100/50 text-error hover:text-red-700 font-black rounded-2xl border-2 border-dashed border-red-300 text-sm cursor-pointer select-none transition-all"
        >
          Reiniciar Todo el Progreso
        </button>
      </div>

    </div>
  );
};

export default ProfilePage;
