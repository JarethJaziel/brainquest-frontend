import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { repositories } from '../../../data';
import type { Exam } from '../../../models/exam';
import type { ExamResult } from '../../../models/scoring';
import { ALL_ACHIEVEMENTS } from '../../../data/repositories/AchievementRepository';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import StarRating from '../../../components/ui/StarRating';
import LevelIndicator from '../../../components/ui/LevelIndicator';

const ExamResultPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exam and result
  useEffect(() => {
    async function loadData() {
      if (!examId) return;
      try {
        setLoading(true);
        
        // 1. Get exam metadata
        const examData = await repositories.exam.getExam(examId);
        setExam(examData);

        // 2. Get result from location state or fallback to last saved result in repository
        const stateResult = location.state?.result as ExamResult | undefined;
        if (stateResult) {
          setResult(stateResult);
        } else {
          const results = await repositories.result.getResultsByExam(examId);
          if (results.length > 0) {
            // Sort by completedAt descending
            const sorted = [...results].sort(
              (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            );
            setResult(sorted[0]);
          } else {
            setError('No se encontró ningún resultado de examen.');
          }
        }
      } catch (err) {
        console.error('Error loading result data:', err);
        setError('Ocurrió un error al cargar tus resultados.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [examId, location.state]);

  // Trigger Confetti on successful completion
  useEffect(() => {
    if (result && result.score.passed) {
      // Fire confetti immediately
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Fire another burst 1.5 seconds later
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [result]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-outline font-bold text-lg">Cargando tus resultados...</p>
      </div>
    );
  }

  if (error || !exam || !result) {
    return (
      <ClayCard className="p-8 text-center max-w-md mx-auto my-12 flex flex-col gap-6 select-none">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
          <MaterialIcon name="warning" className="text-3xl" />
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface mb-2">¡Oops!</h2>
          <p className="text-outline font-bold text-sm">{error || 'Resultados no disponibles'}</p>
        </div>
        <ChunkyButton
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-primary text-white font-black border-2 border-solid shadow-[0_4px_0_0_#222fc2]"
        >
          Volver al Inicio
        </ChunkyButton>
      </ClayCard>
    );
  }

  const { title } = exam.metadata;
  const { score, rewards, totalTime } = result;
  const passed = score.passed;

  // Format seconds into minutes and seconds
  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) {
      return `${remainingSecs} segundos`;
    }
    return `${mins} min ${remainingSecs} seg`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto select-none pb-12">
      {/* Title Header Card */}
      <ClayCard className={`p-6 text-center border-none text-white relative overflow-hidden ${passed ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-400 to-red-500'}`}>
        <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-inner mb-2 animate-bounce">
            <MaterialIcon name={passed ? 'emoji_events' : 'sentiment_dissatisfied'} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {passed ? '¡Aventura Completada!' : '¡Sigue intentando!'}
          </h1>
          <p className="text-white/80 text-sm sm:text-base font-bold">
            {passed
              ? `¡Felicidades! Aprobaste la aventura "${title}"`
              : `Aventura "${title}" completada, ¡pero necesitas un 60% para aprobar!`}
          </p>
          <div className="mt-2 scale-125">
            <StarRating stars={score.stars} className="text-yellow-300" />
          </div>
        </div>
      </ClayCard>

      {/* Level / XP Progress indicators */}
      <ClayCard className="p-5 text-left flex flex-col gap-3">
        <div className="text-xs font-black text-outline uppercase tracking-wider">Tu Nivel de Explorador</div>
        <LevelIndicator />
      </ClayCard>

      {/* Bento Grid Results Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Score Percentage card */}
        <ClayCard className="p-4 flex flex-col items-center justify-center gap-1.5 text-center bg-surface-container-low border-outline-variant/50">
          <MaterialIcon name="grade" className="text-amber-500 text-3xl" filled />
          <div className="text-xs text-outline font-bold">Calificación</div>
          <div className="font-mono font-black text-2xl text-on-surface">
            {score.percentage}%
          </div>
          <div className="text-[10px] text-outline font-bold">
            ({score.totalPoints} / {score.maxPoints} pts)
          </div>
        </ClayCard>

        {/* XP Earned Card */}
        <ClayCard className="p-4 flex flex-col items-center justify-center gap-1.5 text-center bg-surface-container-low border-outline-variant/50">
          <MaterialIcon name="insights" className="text-secondary text-3xl animate-pulse" />
          <div className="text-xs text-outline font-bold">XP Obtenida</div>
          <div className="font-mono font-black text-2xl text-secondary">
            +{rewards.totalXP} XP
          </div>
          <div className="text-[10px] text-outline font-bold flex flex-wrap justify-center gap-1">
            <span>(Base: {rewards.xpEarned} XP</span>
            {rewards.bonusXP > 0 && <span>+ Bono: {rewards.bonusXP} XP)</span>}
          </div>
        </ClayCard>

        {/* Stats details correct/incorrect/skipped card */}
        <ClayCard className="p-4 flex flex-col items-center justify-center gap-1.5 text-center bg-surface-container-low border-outline-variant/50 col-span-2 sm:col-span-1">
          <MaterialIcon name="rule" className="text-primary text-3xl" />
          <div className="text-xs text-outline font-bold">Respuestas</div>
          <div className="flex items-center gap-3 font-mono font-black text-sm text-on-surface">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <MaterialIcon name="check_circle" className="text-xs shrink-0" />
              {score.correctCount}
            </span>
            <span className="text-red-500 flex items-center gap-0.5">
              <MaterialIcon name="cancel" className="text-xs shrink-0" />
              {score.incorrectCount}
            </span>
            {score.skippedCount > 0 && (
              <span className="text-outline flex items-center gap-0.5">
                <MaterialIcon name="skip_next" className="text-xs shrink-0" />
                {score.skippedCount}
              </span>
            )}
          </div>
        </ClayCard>

        {/* Time spent card */}
        <ClayCard className="p-4 flex flex-col items-center justify-center gap-1.5 text-center bg-surface-container-low border-outline-variant/50 col-span-2 sm:col-span-1">
          <MaterialIcon name="schedule" className="text-tertiary text-3xl" />
          <div className="text-xs text-outline font-bold">Tiempo Empleado</div>
          <div className="font-mono font-black text-base text-on-surface">
            {formatTimeSpent(totalTime)}
          </div>
        </ClayCard>
      </div>

      {/* Unlocked Achievements list */}
      {rewards.newAchievements && rewards.newAchievements.length > 0 && (
        <ClayCard className="p-5 text-left border-2 border-dashed border-secondary-container bg-secondary-fixed/5">
          <h3 className="font-black text-base text-secondary flex items-center gap-2 mb-3">
            <MaterialIcon name="military_tech" className="text-xl" />
            <span>¡Nuevos Logros Desbloqueados!</span>
          </h3>
          <div className="flex flex-col gap-3">
            {rewards.newAchievements.map(achId => {
              const ach = ALL_ACHIEVEMENTS.find(a => a.id === achId);
              if (!ach) return null;
              return (
                <div key={achId} className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/40 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                    <MaterialIcon name={ach.icon} className="text-lg" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-black text-sm text-on-surface truncate">{ach.name}</div>
                    <div className="text-xs text-outline font-medium line-clamp-1">{ach.description}</div>
                  </div>
                  <span className="bg-secondary-fixed text-on-secondary-fixed font-black text-xs px-2.5 py-0.5 rounded-full shrink-0 shadow-sm">
                    +{ach.xpReward} XP
                  </span>
                </div>
              );
            })}
          </div>
        </ClayCard>
      )}

      {/* Bottom actions Buttons panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
        <ChunkyButton
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-black border-2 border-solid shadow-[0_4px_0_0_#222fc2] order-2 sm:order-1"
        >
          Volver al Inicio
        </ChunkyButton>
        <ChunkyButton
          onClick={() => navigate(`/exam/${examId}`)}
          className="w-full sm:w-auto px-10 py-3 bg-secondary text-on-secondary font-black border-2 border-solid shadow-[0_4px_0_0_#725800] order-1 sm:order-2"
        >
          {passed ? 'Jugar de Nuevo' : 'Reintentar'}
        </ChunkyButton>
      </div>
    </div>
  );
};

export default ExamResultPage;
