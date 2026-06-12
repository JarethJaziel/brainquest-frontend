import React from 'react';
import type { Exam } from '../../../models/exam';
import type { ExamResult } from '../../../models/scoring';
import ClayCard from '../../../components/ui/ClayCard';
import ChunkyButton from '../../../components/ui/ChunkyButton';
import MaterialIcon from '../../../components/ui/MaterialIcon';
import StarRating from '../../../components/ui/StarRating';

interface ReviewHeaderProps {
  exam: Exam;
  result: ExamResult;
  onBackToResults: () => void;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({
  exam,
  result,
  onBackToResults,
}) => {
  const { score } = result;

  return (
    <ClayCard
      className={`
        p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none border-2
        ${score.passed
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-red-50/50 border-red-200'}
      `}
    >
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-2">
          <ChunkyButton
            color="white"
            onClick={onBackToResults}
            className="!px-3 !py-1 !text-xs"
          >
            <MaterialIcon name="arrow_back" className="!text-sm" />
            <span>Volver</span>
          </ChunkyButton>
          <span
            className={`
              text-xs font-black px-2.5 py-0.5 rounded-full border
              ${score.passed
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-red-100 border-red-300 text-red-800'}
            `}
          >
            {score.passed ? '¡Aprobado! 🎉' : 'No aprobado 😢'}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-on-surface mt-1">
          Revisión: {exam.metadata.title}
        </h1>
        <p className="text-xs font-bold text-outline">
          {exam.questions.length} preguntas • {Math.round(result.totalTime / 60)} min en total
        </p>
      </div>

      <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0 bg-surface-container-lowest/80 p-3 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <StarRating stars={score.stars} size="sm" />
          <span className="text-lg font-black text-on-surface">
            {score.percentage}%
          </span>
        </div>
        <div className="text-xs font-extrabold text-outline flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-emerald-600">
            <MaterialIcon name="done" className="!text-sm" /> {score.correctCount}
          </span>
          <span className="text-outline-variant">•</span>
          <span className="flex items-center gap-0.5 text-red-600">
            <MaterialIcon name="close" className="!text-sm" /> {score.incorrectCount}
          </span>
          {score.partialCount > 0 && (
            <>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-0.5 text-amber-600">
                <MaterialIcon name="remove" className="!text-sm" /> {score.partialCount}
              </span>
            </>
          )}
          {score.skippedCount > 0 && (
            <>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-0.5 text-outline">
                <MaterialIcon name="forward_to_inbox" className="!text-sm" /> {score.skippedCount}
              </span>
            </>
          )}
        </div>
      </div>
    </ClayCard>
  );
};

export default ReviewHeader;
