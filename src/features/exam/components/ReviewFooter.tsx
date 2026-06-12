import React from 'react';
import type { Question } from '../../../models/question-types';
import type { AnswerRecord } from '../../../models/scoring';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import ClayCard from '../../../components/ui/ClayCard';

interface ReviewFooterProps {
  currentAnswer?: AnswerRecord;
  question: Question;
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onBackToResults: () => void;
}

export const ReviewFooter: React.FC<ReviewFooterProps> = ({
  currentAnswer,
  question,
  currentIndex,
  total,
  onPrevious,
  onNext,
  onBackToResults,
}) => {
  const isCorrect = currentAnswer?.isCorrect ?? false;
  const isPartial = currentAnswer?.isPartial ?? false;
  const isSkipped = currentAnswer?.skipped ?? true;
  const points = currentAnswer?.pointsEarned ?? 0;
  const timeSpent = currentAnswer?.timeSpent ?? 0;
  const attempts = currentAnswer?.attempts ?? 0;

  let bannerBg = 'bg-slate-50 border-slate-300 text-slate-800';
  let iconName = 'forward_to_inbox';
  let statusText = 'Pregunta saltada (0 pts)';
  let feedbackText = question.feedback.incorrect; // Fallback

  if (isSkipped) {
    bannerBg = 'bg-slate-50 border-slate-300 text-slate-800';
    iconName = 'forward_to_inbox';
    statusText = 'Pregunta saltada (0 pts)';
    feedbackText = 'Esta pregunta se saltó y no se le asignaron puntos.';
  } else if (isCorrect) {
    bannerBg = 'bg-emerald-50 border-emerald-300 text-emerald-800';
    iconName = 'done';
    statusText = `¡Respuesta correcta! (+${points} pts)`;
    feedbackText = question.feedback.correct;
  } else if (isPartial) {
    bannerBg = 'bg-amber-50 border-amber-300 text-amber-800';
    iconName = 'remove';
    statusText = `Parcialmente correcta (+${points} pts)`;
    feedbackText = question.feedback.partial || 'Casi lo lograste.';
  } else {
    bannerBg = 'bg-red-50 border-red-300 text-red-800';
    iconName = 'close';
    statusText = 'Respuesta incorrecta (0 pts)';
    feedbackText = question.feedback.incorrect;
  }

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Question Statistics & Explanation Card */}
      <ClayCard className={`p-5 border-2 ${bannerBg} flex flex-col gap-4 text-left`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white shrink-0 shadow-sm`}>
            <MaterialIcon name={iconName} className="text-xl font-bold" />
          </div>
          <div className="flex-1 font-bold">
            <div className="font-extrabold text-base mb-0.5">
              {statusText}
            </div>
            <p className="text-sm font-semibold opacity-90 leading-tight">
              {feedbackText}
            </p>
          </div>
        </div>

        {/* Explanation section if available */}
        {question.explanation && (
          <div className="mt-2 pt-3 border-t border-current/10">
            <h4 className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1 opacity-80">
              <MaterialIcon name="info" className="!text-sm" />
              <span>Explicación didáctica</span>
            </h4>
            <p className="text-sm font-semibold leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Technical stats metadata block */}
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-extrabold opacity-75">
          <span className="flex items-center gap-0.5">
            <MaterialIcon name="schedule" className="!text-sm" />
            {timeSpent} seg.
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <MaterialIcon name="refresh" className="!text-sm" />
            {attempts} {attempts === 1 ? 'intento' : 'intentos'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-0.5">
            <MaterialIcon name="grade" className="!text-sm" />
            Máx. {question.points} pts
          </span>
        </div>
      </ClayCard>

      {/* Button controls bar */}
      <div className="flex items-center justify-between gap-4 select-none">
        {/* Previous Button */}
        <ChunkyButton
          color="white"
          disabled={currentIndex === 0}
          onClick={onPrevious}
          className="px-6"
        >
          <MaterialIcon name="arrow_back" />
          <span>Anterior</span>
        </ChunkyButton>

        {/* Current position counter bubble */}
        <span className="text-sm font-black text-outline bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-full shadow-sm shrink-0">
          Pregunta {currentIndex + 1} de {total}
        </span>

        {/* Next Button */}
        <ChunkyButton
          color="white"
          disabled={currentIndex === total - 1}
          onClick={onNext}
          className="px-6"
        >
          <span>Siguiente</span>
          <MaterialIcon name="arrow_forward" />
        </ChunkyButton>
      </div>

      {/* Back to results button centered */}
      <div className="flex justify-center mt-2">
        <ChunkyButton
          color="primary"
          onClick={onBackToResults}
          className="w-full sm:w-auto min-w-[200px]"
        >
          <MaterialIcon name="done_all" />
          <span>Volver a Resultados</span>
        </ChunkyButton>
      </div>
    </div>
  );
};

export default ReviewFooter;
