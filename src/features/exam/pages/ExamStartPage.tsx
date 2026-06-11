import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repositories } from '../../../data';
import type { Exam } from '../../../models/exam';
import { useUserProgress } from '../../../context/UserProgressContext';
import { useAudio } from '../../../context/AudioContext';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import StarRating from '../../../components/ui/StarRating';

const ExamStartPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const audio = useAudio();
  const { progress } = useUserProgress();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExam() {
      if (!examId) return;
      try {
        setLoading(true);
        const data = await repositories.exam.getExam(examId);
        setExam(data);
      } catch (err) {
        console.error('Error loading exam:', err);
        setError('No se pudo cargar la información de la aventura.');
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-outline font-bold text-lg">Preparando la aventura...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <ClayCard className="p-8 text-center max-w-md mx-auto my-12 flex flex-col gap-6 select-none">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
          <MaterialIcon name="warning" className="text-3xl" />
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface mb-2">¡Oops!</h2>
          <p className="text-outline font-bold text-sm">{error || 'Aventura no encontrada'}</p>
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

  const { title, description, subject, difficulty, estimatedTime, ageRange } = exam.metadata;
  const examProgress = progress.examProgress[exam.id];
  const bestScore = examProgress?.bestScore || 0;
  const bestStars = examProgress?.bestStars || 0;
  const attemptsCount = examProgress?.attempts || 0;

  const handleStart = () => {
    audio.playClick();
    navigate(`/exam/${exam.id}/play`);
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy': return { text: 'Fácil', color: 'bg-emerald-100 text-emerald-800' };
      case 'medium': return { text: 'Intermedio', color: 'bg-amber-100 text-amber-800' };
      case 'hard': return { text: 'Difícil', color: 'bg-orange-100 text-orange-800' };
      case 'expert': return { text: 'Experto', color: 'bg-red-100 text-red-800' };
      default: return { text: difficulty, color: 'bg-surface-container text-outline' };
    }
  };

  const diff = getDifficultyLabel();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto select-none">
      {/* Cover card / Header */}
      <ClayCard className="p-6 relative overflow-hidden bg-gradient-to-r from-surface-container-lowest to-surface-container-low border border-outline-variant/50">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary-fixed/30 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <MaterialIcon name={exam.metadata.icon} className="text-4xl" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 items-center mb-1">
              <span className="bg-primary-fixed text-primary font-black px-2.5 py-0.5 rounded-full text-xs">
                {subject}
              </span>
              <span className={`font-black px-2.5 py-0.5 rounded-full text-xs ${diff.color}`}>
                {diff.text}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface truncate">{title}</h1>
            <p className="text-outline text-sm font-bold mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </ClayCard>

      {/* Record Bento section if completed previously */}
      {attemptsCount > 0 && (
        <ClayCard className="p-5 bg-secondary-fixed/10 border-2 border-secondary-fixed/30 flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs font-black text-on-secondary-fixed/60 uppercase">Tu Mejor Record</div>
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating stars={bestStars} className="text-xl" />
              <span className="font-mono font-black text-lg text-on-secondary-fixed-variant ml-1">
                {bestScore}%
              </span>
            </div>
          </div>
          <div className="text-right text-xs font-bold text-outline">
            Intentos realizados: <span className="font-mono font-black text-on-surface">{attemptsCount}</span>
          </div>
        </ClayCard>
      )}

      {/* Grid details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
          <MaterialIcon name="quiz" className="text-primary text-2xl" />
          <div className="text-xs text-outline font-bold">Preguntas</div>
          <div className="font-black text-base text-on-surface">{exam.questions.length}</div>
        </ClayCard>

        <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
          <MaterialIcon name="schedule" className="text-secondary text-2xl animate-pulse" />
          <div className="text-xs text-outline font-bold">Tiempo Estimado</div>
          <div className="font-black text-base text-on-surface">{estimatedTime} min</div>
        </ClayCard>

        <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
          <MaterialIcon name="task_alt" className="text-emerald-500 text-2xl" />
          <div className="text-xs text-outline font-bold">Aprobación</div>
          <div className="font-black text-base text-on-surface">{exam.settings.passingScore}%</div>
        </ClayCard>

        <ClayCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5">
          <MaterialIcon name="child_care" className="text-tertiary text-2xl" />
          <div className="text-xs text-outline font-bold">Edad Recomendada</div>
          <div className="font-black text-base text-on-surface">{ageRange[0]} a {ageRange[1]} años</div>
        </ClayCard>
      </div>

      {/* Rules / Rewards */}
      <ClayCard className="p-5 text-left flex flex-col gap-4">
        <div>
          <h3 className="font-black text-base text-on-surface flex items-center gap-2 mb-2">
            <MaterialIcon name="military_tech" className="text-secondary text-xl" />
            <span>Recompensas en juego</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-outline font-bold pl-2">
            <li className="flex items-center gap-2">
              <MaterialIcon name="add" className="text-emerald-500 text-base shrink-0" />
              <span>+{exam.rewards.xpReward} XP base por completarlo.</span>
            </li>
            {exam.rewards.bonusXP?.perfectScore && (
              <li className="flex items-center gap-2">
                <MaterialIcon name="add" className="text-emerald-500 text-base shrink-0" />
                <span>+{exam.rewards.bonusXP.perfectScore} XP bonus por puntaje perfecto.</span>
              </li>
            )}
            {exam.rewards.bonusXP?.noSkips && (
              <li className="flex items-center gap-2">
                <MaterialIcon name="add" className="text-emerald-500 text-base shrink-0" />
                <span>+{exam.rewards.bonusXP.noSkips} XP bonus por no saltar preguntas.</span>
              </li>
            )}
            {exam.rewards.bonusXP?.speedBonus && (
              <li className="flex items-center gap-2">
                <MaterialIcon name="add" className="text-emerald-500 text-base shrink-0" />
                <span>+{exam.rewards.bonusXP.speedBonus} XP bonus por velocidad.</span>
              </li>
            )}
          </ul>
        </div>

        <div className="border-t border-outline-variant/30 pt-4">
          <h3 className="font-black text-base text-on-surface flex items-center gap-2 mb-2">
            <MaterialIcon name="rule" className="text-primary text-xl" />
            <span>Reglas de esta aventura</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-outline font-bold pl-2">
            <li className="flex items-center gap-2">
              <MaterialIcon name="radio_button_checked" className="text-primary text-xs shrink-0" />
              <span>Respuestas mezcladas: {exam.settings.shuffleOptions ? 'Sí' : 'No'}</span>
            </li>
            <li className="flex items-center gap-2">
              <MaterialIcon name="radio_button_checked" className="text-primary text-xs shrink-0" />
              <span>Permite saltar preguntas: {exam.settings.allowSkip ? 'Sí' : 'No'}</span>
            </li>
            <li className="flex items-center gap-2">
              <MaterialIcon name="radio_button_checked" className="text-primary text-xs shrink-0" />
              <span>Retroalimentación: {exam.settings.showFeedback === 'immediate' ? 'Inmediata' : 'Al finalizar'}</span>
            </li>
            <li className="flex items-center gap-2">
              <MaterialIcon name="radio_button_checked" className="text-primary text-xs shrink-0" />
              <span>Límite de tiempo: {exam.settings.timeLimit ? `${exam.settings.timeLimit} segundos` : 'Sin límite'}</span>
            </li>
          </ul>
        </div>
      </ClayCard>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
        <ChunkyButton
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-8 py-3 bg-surface-container text-on-surface font-black border-2 border-solid shadow-[0_4px_0_0_#dde9f9] order-2 sm:order-1"
        >
          Volver al Catálogo
        </ChunkyButton>
        <ChunkyButton
          onClick={handleStart}
          className="w-full sm:w-auto px-10 py-3 bg-secondary text-on-secondary font-black border-2 border-solid shadow-[0_4px_0_0_#725800] order-1 sm:order-2"
        >
          Comenzar Aventura
        </ChunkyButton>
      </div>
    </div>
  );
};

export default ExamStartPage;
